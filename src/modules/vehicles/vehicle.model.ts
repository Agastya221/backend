import { Schema, model, Document } from "mongoose";

export interface IVehicleLocation {
  lat: number | null;
  lng: number | null;
  at: Date | null;
}

export interface IVehicle extends Document {
  name: string;
  brand: string;
  model: string;
  year: number;
  category: "hatchback" | "sedan" | "suv" | "luxury" | "van" | "truck";
  fuelType: "petrol" | "diesel" | "electric" | "cng" | "hybrid";
  transmission: "manual" | "automatic";
  seats: number;
  pricePerDay: number;
  isAvailable: boolean;
  images: string[];
  features: string[];
  deviceId: string | null;
  liveLocation: IVehicleLocation;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 2000 },
    category: {
      type: String,
      enum: ["hatchback", "sedan", "suv", "luxury", "van", "truck"],
      required: true,
    },
    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "electric", "cng", "hybrid"],
      required: true,
    },
    transmission: { type: String, enum: ["manual", "automatic"], required: true },
    seats: { type: Number, required: true, min: 2, max: 14 },
    pricePerDay: { type: Number, required: true, min: 0 },
    isAvailable: { type: Boolean, default: true },
    images: [{ type: String }],
    features: [{ type: String }],
    // GPS-ready: deviceId links to a physical GPS tracker
    deviceId: { type: String, default: null },
    liveLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      at: { type: Date, default: null },
    },
  },
  { timestamps: true },
);

VehicleSchema.index({ category: 1, isAvailable: 1 });
VehicleSchema.index({ pricePerDay: 1 });

export const VehicleModel = model<IVehicle>("Vehicle", VehicleSchema);
