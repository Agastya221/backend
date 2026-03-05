import { FilterQuery, Types } from "mongoose";
import { CarModel, ICar } from "./car.model";
import { LocationModel as _LocationModel } from "../locations/location.model"; // registers schema for populate
import { ApiError } from "../../utils/apiError";


interface CarFilters {
    page?: number;
    limit?: number;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
    locationId?: string;
    transmission?: string;
    fuelType?: string;
    search?: string;
}

export const CarService = {
    async createCar(data: Partial<ICar>) {
        const car = new CarModel(data);
        await car.save();
        return car;
    },

    async getCars(filters: CarFilters = {}) {
        const {
            page = 1,
            limit = 10,
            minPrice,
            maxPrice,
            status,
            locationId,
            transmission,
            fuelType,
            search,
        } = filters;

        const query: FilterQuery<ICar> = {};

        if (status) query.status = status;
        if (locationId) query.locationId = locationId;
        if (transmission) query.transmission = transmission;
        if (fuelType) query.fuelType = fuelType;
        if (minPrice !== undefined || maxPrice !== undefined) {
            query.pricePerDay = {};
            if (minPrice !== undefined) query.pricePerDay.$gte = minPrice;
            if (maxPrice !== undefined) query.pricePerDay.$lte = maxPrice;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { brand: { $regex: search, $options: "i" } },
            ];
        }

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            CarModel.find(query).skip(skip).limit(limit).populate("locationId", "name city").sort({ createdAt: -1 }),
            CarModel.countDocuments(query),
        ]);

        return {
            data,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / limit),
            },
        };
    },

    async getCarById(id: string) {
        let car;
        if (Types.ObjectId.isValid(id)) {
            car = await CarModel.findById(id).populate("locationId");
        }
        if (!car) {
            car = await CarModel.findOne({ slug: id }).populate("locationId");
        }
        if (!car) throw new ApiError(404, "Car not found");
        return car;
    },

    async updateCar(id: string, data: Partial<ICar>) {
        const car = await CarModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate("locationId");
        if (!car) throw new ApiError(404, "Car not found");
        return car;
    },

    async deleteCar(id: string) {
        const car = await CarModel.findByIdAndDelete(id);
        if (!car) throw new ApiError(404, "Car not found");
        return car;
    },

    async updateStatus(id: string, status: "available" | "maintenance" | "inactive") {
        const car = await CarModel.findByIdAndUpdate(id, { status }, { new: true }).populate("locationId");
        if (!car) throw new ApiError(404, "Car not found");
        return car;
    },
};
