import crypto from "crypto";
import { env } from "../../config/env";
import { razorpay } from "../../config/razorpay";
import { BookingModel } from "../bookings/booking.model";
import { ApiError } from "../../utils/apiError";
import { BookingService } from "../bookings/booking.service";

export class PaymentService {
  static async createOrder(bookingId: string) {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) throw new ApiError(404, "Booking not found");

    // Idempotent order recreation logic
    if (booking.paymentStatus === "paid") {
      throw new ApiError(400, "Booking is already paid and confirmed.");
    }

    try {
      const order = await razorpay.orders.create({
        amount: Math.round(booking.totalAmount * 100), // Razorpay requires paise format natively
        currency: "INR",
        receipt: `booking_${booking._id}`,
        notes: { bookingId: String(booking._id), carId: String(booking.carId) },
      });

      // Tie order context back
      booking.razorpayOrderId = order.id;
      await booking.save();

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      };
    } catch (error) {
      console.error("Razorpay Sub-Network Creation Crash:", error);
      throw new ApiError(500, "Failed to connect to Razorpay Payment Gateways. Try again shortly.");
    }
  }

  static async verifySignature(orderId: string, paymentId: string, signature: string) {
    const booking = await BookingModel.findOne({ razorpayOrderId: orderId });
    if (!booking) throw new ApiError(404, "Booking not found for this native transaction payload");

    // Idempotency Verification Shield - Webhooks can rapidly duplicate /verify checks!
    if (booking.paymentStatus === "paid") {
      return true; // Already processed
    }

    const body = `${orderId}|${paymentId}`;
    const expected = crypto.createHmac("sha256", env.razorpayKeySecret).update(body).digest("hex");

    if (expected !== signature) {
      return false; // Manually fail verification
    }

    // Success State Matrix -> Dispatch out to cross-domain Booking Handler
    await BookingService.confirmPayment(String(booking._id), paymentId);
    return true;
  }
}
