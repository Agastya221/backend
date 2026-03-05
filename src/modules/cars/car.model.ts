import { Schema, model, Document, Types } from "mongoose";

export interface ICarLocation {
    lat: number | null;
    lng: number | null;
    updatedAt: Date | null;
}

export type CarStatus = "available" | "maintenance" | "inactive";
export type Transmission = "manual" | "automatic";
export type FuelType = "petrol" | "diesel" | "electric" | "cng";

export interface ICar extends Document {
    name: string;
    brand: string;
    slug: string;
    description?: string;
    images: string[];
    pricePerDay: number;
    transmission: Transmission;
    fuelType: FuelType;
    seats: number;
    locationId: Types.ObjectId;
    status: CarStatus;
    liveLocation?: ICarLocation;
    createdAt: Date;
    updatedAt: Date;
}

const CarSchema = new Schema<ICar>(
    {
        name: { type: String, required: true, trim: true },
        brand: { type: String, required: true, trim: true },
        slug: { type: String, unique: true },
        description: { type: String, trim: true },
        images: [{ type: String }],
        pricePerDay: { type: Number, required: true, min: 0 },
        transmission: { type: String, enum: ["manual", "automatic"], default: "manual" },
        fuelType: { type: String, enum: ["petrol", "diesel", "electric", "cng"], default: "petrol" },
        seats: { type: Number, default: 4, min: 2, max: 14 },
        locationId: { type: Schema.Types.ObjectId, ref: "Location", required: true },
        status: { type: String, enum: ["available", "maintenance", "inactive"], default: "inactive" },

        // Future GPS live tracking
        liveLocation: {
            lat: { type: Number, default: null },
            lng: { type: Number, default: null },
            updatedAt: { type: Date, default: null },
        },
    },
    { timestamps: true },
);

// Pre-save hook: auto-generate slug
CarSchema.pre("save", function (next) {
    if (this.isModified("name") || this.isModified("brand")) {
        const baseSlug = `${this.brand}-${this.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        this.slug = `${baseSlug}-${randomSuffix}`;
    }
    next();
});

// Important indexes for filtering
CarSchema.index({ locationId: 1, status: 1 });
CarSchema.index({ pricePerDay: 1 });

export const CarModel = model<ICar>("Car", CarSchema);
