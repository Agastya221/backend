import { Schema, model, Document, Types } from "mongoose";

// ──────────────────────────────────────────────
// Status Enums
// ──────────────────────────────────────────────

export type BookingStatus = "reserved" | "confirmed" | "active" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed";

// Valid transitions
export const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  reserved: ["confirmed", "cancelled"],
  confirmed: ["active", "cancelled"],
  active: ["completed"],
  completed: [],
  cancelled: [],
};

// Statuses that block availability (i.e., the car is occupied)
export const BLOCKING_STATUSES: BookingStatus[] = ["reserved", "confirmed", "active"];

// ──────────────────────────────────────────────
// Interface
// ──────────────────────────────────────────────

export interface IBooking extends Document {
  carId: Types.ObjectId;
  userId: Types.ObjectId | null;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  pricePerDay: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  notes?: string;
  reservationExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────
// Schema
// ──────────────────────────────────────────────

const BookingSchema = new Schema<IBooking>(
  {
    carId: { type: Schema.Types.ObjectId, ref: "Car", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalDays: { type: Number, required: true, min: 1 },
    pricePerDay: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    bookingStatus: {
      type: String,
      enum: ["reserved", "confirmed", "active", "completed", "cancelled"],
      default: "reserved",
    },
    reservationExpiresAt: { type: Date, default: null },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    pickupLocation: { type: String, default: null },
    dropoffLocation: { type: String, default: null },
    notes: { type: String, default: null },
  },
  { timestamps: true },
);

// ──────────────────────────────────────────────
// Indexes for fast overlap queries
// ──────────────────────────────────────────────

BookingSchema.index({ carId: 1, startDate: 1 });
BookingSchema.index({ carId: 1, endDate: 1 });
BookingSchema.index({ carId: 1, bookingStatus: 1 });
BookingSchema.index({ userId: 1, createdAt: -1 });

export const BookingModel = model<IBooking>("Booking", BookingSchema);
