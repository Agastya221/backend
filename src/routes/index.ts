import { Router } from "express";
import authRoutes from "../modules/auth/auth.route";
import userRoutes from "../modules/users/user.route";
import vehicleRoutes from "../modules/vehicles/vehicle.route";
import bookingRoutes from "../modules/bookings/booking.route";
import paymentRoutes from "../modules/payments/payment.route";
import trackingRoutes from "../modules/tracking/tracking.route";
import carRoutes from "../modules/cars/car.route";
// Ensure Mongoose schemas are registered before any populate() call
import "../modules/locations/location.model";


const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/bookings", bookingRoutes);
router.use("/payments", paymentRoutes);
router.use("/tracking", trackingRoutes);
router.use("/cars", carRoutes);

export default router;
