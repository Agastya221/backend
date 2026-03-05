import mongoose, { FilterQuery } from "mongoose";
import { BookingModel, IBooking, BLOCKING_STATUSES, BOOKING_TRANSITIONS, BookingStatus } from "./booking.model";
import { CarModel } from "../cars/car.model";
import { ApiError } from "../../utils/apiError";
import { razorpay } from "../../config/razorpay";

// ──────────────────────────────────────────────
// Price Calculation Engine
// ──────────────────────────────────────────────

function normalizeToIST(date: Date): Date {
  // Normalize to start of day in IST (UTC+5:30)
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;
  const utc = date.getTime() + date.getTimezoneOffset() * 60 * 1000;
  const ist = new Date(utc + IST_OFFSET);
  ist.setHours(0, 0, 0, 0);
  return ist;
}

function calculatePrice(startDate: Date, endDate: Date, pricePerDay: number) {
  const start = normalizeToIST(new Date(startDate));
  const end = normalizeToIST(new Date(endDate));

  if (end < start) throw new ApiError(400, "End date must be after start date");

  const diffMs = end.getTime() - start.getTime();
  const totalDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const totalAmount = totalDays * pricePerDay;

  return { totalDays, totalAmount, pricePerDay };
}

// ──────────────────────────────────────────────
// Availability Check (Overlap Detection)
// ──────────────────────────────────────────────

/**
 * Two bookings overlap when: (startA <= endB) AND (endA >= startB)
 * Only considers bookings with blocking statuses (reserved/confirmed/active).
 * Cancelled/completed bookings are ignored.
 */
async function checkCarAvailability(
  carId: string,
  startDate: Date,
  endDate: Date,
  excludeBookingId?: string,
): Promise<boolean> {
  const query: FilterQuery<IBooking> = {
    carId,
    bookingStatus: { $in: BLOCKING_STATUSES },
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflicting = await BookingModel.countDocuments(query);
  return conflicting === 0;
}

// ──────────────────────────────────────────────
// Service
// ──────────────────────────────────────────────

interface BookingFilters {
  page?: number;
  limit?: number;
  bookingStatus?: string;
  carId?: string;
}

export const BookingService = {
  // ─── Check Availability ──────────────────────
  async checkAvailability(carId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) throw new ApiError(400, "End date must be after start date");
    if (start < new Date()) throw new ApiError(400, "Cannot book in the past");

    const car = await CarModel.findById(carId);
    if (!car) throw new ApiError(404, "Car not found");
    if (car.status === "maintenance") throw new ApiError(400, "Car is under maintenance");
    if (car.status === "inactive") throw new ApiError(400, "Car is currently inactive");

    const available = await checkCarAvailability(carId, start, end);
    const pricing = calculatePrice(start, end, car.pricePerDay);

    return {
      available,
      car: { _id: car._id, name: car.name, brand: car.brand, pricePerDay: car.pricePerDay },
      ...pricing,
    };
  },

  // ─── Create Booking (Transaction-Safe) ───────
  async createBooking(data: { carId: string; startDate: string; endDate: string; userId?: string; pickupLocation?: string; dropoffLocation?: string; notes?: string }) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (end <= start) throw new ApiError(400, "End date must be after start date");
    if (start < new Date()) throw new ApiError(400, "Cannot book in the past");

    // In development, MongoDB runs standalone (no replica set) so transactions
    // are not supported. We use sequential reads/writes instead.
    // In production, always use full ACID transactions to prevent double-booking.
    const isDev = process.env.NODE_ENV !== "production";

    if (isDev) {
      return this._createBookingWithoutTransaction(data, start, end);
    }

    /**
     * RACE CONDITION PROTECTION (Production):
     * MongoDB session + transaction atomically:
     *   1. Check availability (read)
     *   2. Create booking (write)
     */
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const car = await CarModel.findById(data.carId).session(session);
      if (!car) throw new ApiError(404, "Car not found");
      if (car.status !== "available") throw new ApiError(400, `Car is ${car.status} and cannot be booked`);

      const conflicting = await BookingModel.countDocuments({
        carId: data.carId,
        bookingStatus: { $in: BLOCKING_STATUSES },
        startDate: { $lte: end },
        endDate: { $gte: start },
      }).session(session);

      if (conflicting > 0) throw new ApiError(409, "Car is already booked for the selected dates");

      const pricing = calculatePrice(start, end, car.pricePerDay);

      const [booking] = await BookingModel.create(
        [
          {
            carId: data.carId,
            userId: data.userId || null,
            startDate: start,
            endDate: end,
            totalDays: pricing.totalDays,
            pricePerDay: pricing.pricePerDay,
            totalAmount: pricing.totalAmount,
            paymentStatus: "pending",
            bookingStatus: "reserved",
            reservationExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
            pickupLocation: data.pickupLocation,
            dropoffLocation: data.dropoffLocation,
            notes: data.notes,
          },
        ],
        { session },
      );

      await session.commitTransaction();
      return booking;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  // ─── Dev-mode booking (no transactions) ──────
  async _createBookingWithoutTransaction(
    data: { carId: string; startDate: string; endDate: string; userId?: string; pickupLocation?: string; dropoffLocation?: string; notes?: string },
    start: Date,
    end: Date,
  ) {
    const car = await CarModel.findById(data.carId);
    if (!car) throw new ApiError(404, "Car not found");
    if (car.status !== "available") throw new ApiError(400, `Car is ${car.status} and cannot be booked`);

    const conflicting = await BookingModel.countDocuments({
      carId: data.carId,
      bookingStatus: { $in: BLOCKING_STATUSES },
      startDate: { $lte: end },
      endDate: { $gte: start },
    });

    if (conflicting > 0) throw new ApiError(409, "Car is already booked for the selected dates");

    const pricing = calculatePrice(start, end, car.pricePerDay);

    const booking = await BookingModel.create({
      carId: data.carId,
      userId: data.userId || null,
      startDate: start,
      endDate: end,
      totalDays: pricing.totalDays,
      pricePerDay: pricing.pricePerDay,
      totalAmount: pricing.totalAmount,
      paymentStatus: "pending",
      bookingStatus: "reserved",
      reservationExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      pickupLocation: data.pickupLocation,
      dropoffLocation: data.dropoffLocation,
      notes: data.notes,
    });

    return booking;
  },



  // ─── Get Single Booking ──────────────────────
  async getBookingById(id: string) {
    const booking = await BookingModel.findById(id).populate("carId", "name brand images pricePerDay");
    if (!booking) throw new ApiError(404, "Booking not found");
    return booking;
  },

  // ─── List Bookings (Admin) ───────────────────
  async listBookings(filters: BookingFilters = {}) {
    const { page = 1, limit = 10, bookingStatus, carId } = filters;
    const query: FilterQuery<IBooking> = {};

    if (bookingStatus) query.bookingStatus = bookingStatus;
    if (carId) query.carId = carId;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      BookingModel.find(query)
        .skip(skip)
        .limit(limit)
        .populate("carId", "name brand images")
        .sort({ createdAt: -1 }),
      BookingModel.countDocuments(query),
    ]);

    return {
      data,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    };
  },

  // ─── Update Status (Transition Validation) ──
  async updateStatus(id: string, newStatus: BookingStatus) {
    const booking = await BookingModel.findById(id);
    if (!booking) throw new ApiError(404, "Booking not found");

    const currentStatus = booking.bookingStatus as BookingStatus;
    const allowed = BOOKING_TRANSITIONS[currentStatus];

    if (!allowed.includes(newStatus)) {
      throw new ApiError(400, `Cannot transition from "${currentStatus}" to "${newStatus}". Allowed: [${allowed.join(", ")}]`);
    }

    // If confirming, payment must be paid
    if (newStatus === "confirmed" && booking.paymentStatus !== "paid") {
      throw new ApiError(400, "Cannot confirm booking without successful payment");
    }

    booking.bookingStatus = newStatus;

    // If cancelling a reserved booking (before payment), mark payment as failed
    if (newStatus === "cancelled" && booking.paymentStatus === "pending") {
      booking.paymentStatus = "failed";
    }

    await booking.save();
    return booking;
  },

  // ─── Cancel Booking ──────────────────────────
  async cancelBooking(id: string) {
    return this.updateStatus(id, "cancelled");
  },

  // ─── Confirm After Payment (Webhook) ─────────
  async confirmPayment(bookingId: string, razorpayPaymentId: string) {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) throw new ApiError(404, "Booking not found");

    booking.paymentStatus = "paid";
    booking.bookingStatus = "confirmed";
    booking.razorpayPaymentId = razorpayPaymentId;
    await booking.save();

    return booking;
  },
};
