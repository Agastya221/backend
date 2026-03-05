import { Schema, model } from "mongoose";

const TrackingSchema = new Schema(
  {
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", default: null },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    speed: { type: Number, default: null },
    capturedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const TrackingModel = model("Tracking", TrackingSchema);
