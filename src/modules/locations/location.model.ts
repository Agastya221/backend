import { Schema, model, Document } from "mongoose";

export interface ILocation extends Document {
    name: string;
    city: string;
    address: string;
    lat: number;
    lng: number;
    createdAt: Date;
    updatedAt: Date;
}

const LocationSchema = new Schema<ILocation>(
    {
        name: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        address: { type: String, required: true, trim: true },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    { timestamps: true },
);

// Helpful index for geographical searches later based on city or coordinates
LocationSchema.index({ city: 1 });
LocationSchema.index({ lat: 1, lng: 1 });

export const LocationModel = model<ILocation>("Location", LocationSchema);
