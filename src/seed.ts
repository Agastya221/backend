/**
 * 🌱 Production-Realistic Database Seed — Odisha Edition
 *
 * Populates ALL collections with realistic Odisha-based rental car data.
 *   1. Locations   – 8 Odisha city hubs (real GPS + full addresses)
 *   2. Users       – admin, staff, customers (Odia names, hashed passwords)
 *   3. Cars        – 16 cars (8 original frontend-matching slugs + 8 extra)
 *   4. Vehicles    – Full fleet with features & categories
 *   5. Bookings    – Mixed statuses with realistic date ranges
 *   6. Payments    – Linked to bookings with Razorpay-style IDs
 *   7. Tracking    – GPS breadcrumbs for active trips
 *
 * Run:  npm run seed
 */

import mongoose, { Types } from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { LocationModel } from "./modules/locations/location.model";
import { CarModel } from "./modules/cars/car.model";
import { UserModel } from "./modules/users/user.model";
import { BookingModel } from "./modules/bookings/booking.model";
import { PaymentModel } from "./modules/payments/payment.model";
import { TrackingModel } from "./modules/tracking/tracking.model";
import { VehicleModel } from "./modules/vehicles/vehicle.model";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error("❌ MONGO_URI not set in .env");
    process.exit(1);
}

// ═══════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════
const oid = () => new Types.ObjectId();
const days = (n: number) => n * 24 * 60 * 60 * 1000;
const ago = (d: number) => new Date(Date.now() - days(d));
const future = (d: number) => new Date(Date.now() + days(d));
const rnd = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const randomStr = (len: number) =>
    Array.from({ length: len }, () => chars[rnd(0, chars.length - 1)]).join("");
const rzpOrder = () => `order_${randomStr(14)}`;
const rzpPay = () => `pay_${randomStr(14)}`;
const now = new Date();

// ═══════════════════════════════════════════════
//  1. LOCATIONS — Odisha cities with real coords
// ═══════════════════════════════════════════════
const LOCATION_IDS = Array.from({ length: 8 }, () => oid());

const LOCATIONS_DATA = [
    {
        _id: LOCATION_IDS[0],
        name: "Bhubaneswar Station Hub",
        city: "Bhubaneswar",
        address:
            "Near Master Canteen Square, Bhubaneswar Railway Station Road, Bhubaneswar 751009",
        lat: 20.2701,
        lng: 85.8245,
    },
    {
        _id: LOCATION_IDS[1],
        name: "Cuttack College Square",
        city: "Cuttack",
        address:
            "College Square, Buxi Bazar, Cuttack 753001",
        lat: 20.4625,
        lng: 85.8828,
    },
    {
        _id: LOCATION_IDS[2],
        name: "Puri Grand Road Hub",
        city: "Puri",
        address:
            "Grand Road, Near Jagannath Temple, Puri 752001",
        lat: 19.8135,
        lng: 85.8312,
    },
    {
        _id: LOCATION_IDS[3],
        name: "Rourkela Panposh Hub",
        city: "Rourkela",
        address:
            "Panposh Road, Near Bisra Chowk, Rourkela 769004",
        lat: 22.2604,
        lng: 84.8536,
    },
    {
        _id: LOCATION_IDS[4],
        name: "Sambalpur VSS Nagar Hub",
        city: "Sambalpur",
        address:
            "VSS Nagar, Ainthapali, Sambalpur 768004",
        lat: 21.4669,
        lng: 83.9812,
    },
    {
        _id: LOCATION_IDS[5],
        name: "Berhampur Ganjam Hub",
        city: "Berhampur",
        address:
            "Dharma Nagar, Old Bus Stand Road, Berhampur 760002",
        lat: 19.3149,
        lng: 84.7941,
    },
    {
        _id: LOCATION_IDS[6],
        name: "Bhubaneswar Patia Tech Hub",
        city: "Bhubaneswar",
        address:
            "Patia Square, Near KIIT University, Bhubaneswar 751024",
        lat: 20.3549,
        lng: 85.8186,
    },
    {
        _id: LOCATION_IDS[7],
        name: "Balasore Station Road Hub",
        city: "Balasore",
        address:
            "Station Road, Near FM Chhak, Balasore 756001",
        lat: 21.4934,
        lng: 86.9337,
    },
];

// ═══════════════════════════════════════════════
//  2. USERS — Odia names & details
// ═══════════════════════════════════════════════
const USER_IDS = Array.from({ length: 15 }, () => oid());

const USERS_RAW = [
    // Admin
    { _id: USER_IDS[0], name: "Bikash Sahoo", email: "admin@odicarrental.in", phone: "+919437100001", role: "admin" as const, isVerified: true },
    // Staff
    { _id: USER_IDS[1], name: "Smitarani Mohanty", email: "smita.staff@odicarrental.in", phone: "+919437100002", role: "staff" as const, isVerified: true },
    { _id: USER_IDS[2], name: "Chandan Pradhan", email: "chandan.staff@odicarrental.in", phone: "+919437100003", role: "staff" as const, isVerified: true },
    // Customers
    { _id: USER_IDS[3], name: "Subhashree Dash", email: "subhashree.dash@gmail.com", phone: "+919861234001", role: "customer" as const, isVerified: true },
    { _id: USER_IDS[4], name: "Amlan Panda", email: "amlan.panda@outlook.com", phone: "+919861234002", role: "customer" as const, isVerified: true },
    { _id: USER_IDS[5], name: "Lipika Nayak", email: "lipika.nayak@yahoo.com", phone: "+919861234003", role: "customer" as const, isVerified: true },
    { _id: USER_IDS[6], name: "Somanath Behera", email: "somanath.b@gmail.com", phone: "+919861234004", role: "customer" as const, isVerified: true },
    { _id: USER_IDS[7], name: "Jyotirmayee Mishra", email: "jyoti.mishra@gmail.com", phone: "+919861234005", role: "customer" as const, isVerified: true },
    { _id: USER_IDS[8], name: "Rakesh Jena", email: "rakesh.jena@hotmail.com", phone: "+919861234006", role: "customer" as const, isVerified: false },
    { _id: USER_IDS[9], name: "Barsha Sethi", email: "barsha.sethi@gmail.com", phone: "+919861234007", role: "customer" as const, isVerified: true },
    { _id: USER_IDS[10], name: "Prashant Swain", email: "prashant.swain@gmail.com", phone: "+919861234008", role: "customer" as const, isVerified: true },
    { _id: USER_IDS[11], name: "Anuradha Rout", email: "anuradha.rout@outlook.com", phone: "+919861234009", role: "customer" as const, isVerified: true },
    { _id: USER_IDS[12], name: "Tapan Mohapatra", email: "tapan.m@gmail.com", phone: "+919861234010", role: "customer" as const, isVerified: false },
    { _id: USER_IDS[13], name: "Nibedita Pattnaik", email: "nibedita.p@yahoo.com", phone: "+919861234011", role: "customer" as const, isVerified: true },
    { _id: USER_IDS[14], name: "Deepak Sahu", email: "deepak.sahu@gmail.com", phone: "+919861234012", role: "customer" as const, isVerified: true },
];

// ═══════════════════════════════════════════════
//  3. CARS — 16 cars (first 8 slugs match frontend)
// ═══════════════════════════════════════════════
function buildCars() {
    const [bbsr1, ctc, puri, rkl, sbl, bhm, bbsr2, bls] = LOCATION_IDS;
    return [
        // ── Original 8 (frontend slug match) ──
        {
            name: "Swift", brand: "Maruti Suzuki", slug: "maruti-swift",
            description: "Peppy hatchback perfect for Bhubaneswar city commutes and weekend Puri trips. 22 km/l mileage.",
            images: ["https://images.unsplash.com/photo-1549317661-bd32c0e5a809?auto=format&fit=crop&q=80"],
            pricePerDay: 1200, transmission: "manual" as const, fuelType: "petrol" as const, seats: 5,
            locationId: bbsr1, status: "available" as const,
        },
        {
            name: "Creta", brand: "Hyundai", slug: "hyundai-creta",
            description: "Feature-rich SUV with panoramic sunroof and ADAS Level 2. Great for NH-16 highway runs.",
            images: ["https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80"],
            pricePerDay: 2500, transmission: "automatic" as const, fuelType: "diesel" as const, seats: 5,
            locationId: bbsr1, status: "available" as const,
        },
        {
            name: "Nexon", brand: "Tata", slug: "tata-nexon",
            description: "India's first 5-star GNCAP rated SUV. Bold design, perfect for Odisha's varied terrain.",
            images: ["https://images.unsplash.com/photo-1550355191-863a354174d5?auto=format&fit=crop&q=80"],
            pricePerDay: 2000, transmission: "manual" as const, fuelType: "petrol" as const, seats: 5,
            locationId: ctc, status: "available" as const,
        },
        {
            name: "XUV700", brand: "Mahindra", slug: "mahindra-xuv700",
            description: "Powerful 7-seater with ADAS and panoramic skyroof. Ideal for Simlipal & Chilika family trips.",
            images: ["https://images.unsplash.com/photo-1688636952763-712dce42ee4c?auto=format&fit=crop&q=80"],
            pricePerDay: 4000, transmission: "automatic" as const, fuelType: "diesel" as const, seats: 7,
            locationId: bbsr1, status: "available" as const,
        },
        {
            name: "Innova Crysta", brand: "Toyota", slug: "toyota-innova-crysta",
            description: "Benchmark premium MPV — spacious, reliable, perfect for Bhitarkanika & temple circuit tours.",
            images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80"],
            pricePerDay: 3500, transmission: "manual" as const, fuelType: "diesel" as const, seats: 7,
            locationId: puri, status: "maintenance" as const,
        },
        {
            name: "Seltos", brand: "Kia", slug: "kia-seltos",
            description: "Segment-leading SUV with Bose audio, ventilated seats, and UVO connected car features.",
            images: ["https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80"],
            pricePerDay: 2400, transmission: "automatic" as const, fuelType: "petrol" as const, seats: 5,
            locationId: rkl, status: "available" as const,
        },
        {
            name: "Hector", brand: "MG", slug: "mg-hector",
            description: "Internet car with 14\" HD touchscreen, i-SMART connectivity, and panoramic sunroof.",
            images: ["https://images.unsplash.com/photo-1606145326589-9c5c16503c1b?auto=format&fit=crop&q=80"],
            pricePerDay: 2800, transmission: "automatic" as const, fuelType: "diesel" as const, seats: 5,
            locationId: sbl, status: "available" as const,
        },
        {
            name: "City", brand: "Honda", slug: "honda-city",
            description: "Iconic sedan with Honda SENSING suite and LaneWatch camera. Smooth Bhubaneswar city cruiser.",
            images: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80"],
            pricePerDay: 1800, transmission: "manual" as const, fuelType: "petrol" as const, seats: 5,
            locationId: bbsr2, status: "available" as const,
        },
        // ── 8 additional cars for realistic fleet ──
        {
            name: "Baleno", brand: "Maruti Suzuki", slug: "maruti-baleno",
            description: "Premium hatchback with heads-up display and 360° camera. Best for Cuttack-BBSR daily runs.",
            images: ["https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80"],
            pricePerDay: 1400, transmission: "automatic" as const, fuelType: "petrol" as const, seats: 5,
            locationId: ctc, status: "available" as const,
        },
        {
            name: "Fortuner", brand: "Toyota", slug: "toyota-fortuner",
            description: "Legendary full-size 4x4 SUV. Perfect for Daringbadi hill drives and Simlipal tiger trails.",
            images: ["https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80"],
            pricePerDay: 6500, transmission: "automatic" as const, fuelType: "diesel" as const, seats: 7,
            locationId: bbsr1, status: "available" as const,
        },
        {
            name: "Thar", brand: "Mahindra", slug: "mahindra-thar",
            description: "4x4 off-roader built for adventure. Take on Satkosia gorge and Daringbadi trails with ease.",
            images: ["https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80"],
            pricePerDay: 3500, transmission: "manual" as const, fuelType: "diesel" as const, seats: 4,
            locationId: rkl, status: "available" as const,
        },
        {
            name: "Nexon EV", brand: "Tata", slug: "tata-nexon-ev",
            description: "312 km range electric SUV. Zero emissions, ideal for smart city Bhubaneswar commutes.",
            images: ["https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80"],
            pricePerDay: 2800, transmission: "automatic" as const, fuelType: "electric" as const, seats: 5,
            locationId: bbsr2, status: "available" as const,
        },
        {
            name: "Verna", brand: "Hyundai", slug: "hyundai-verna",
            description: "Premium turbo sedan with ventilated seats, ADAS, and Bose audio. Smooth NH-16 cruiser.",
            images: ["https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80"],
            pricePerDay: 2200, transmission: "automatic" as const, fuelType: "petrol" as const, seats: 5,
            locationId: bhm, status: "available" as const,
        },
        {
            name: "Scorpio-N", brand: "Mahindra", slug: "mahindra-scorpio-n",
            description: "Rugged body-on-frame SUV with 4x4 and terrain modes. Built for Odisha's countryside roads.",
            images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80"],
            pricePerDay: 3200, transmission: "manual" as const, fuelType: "diesel" as const, seats: 7,
            locationId: bls, status: "available" as const,
        },
        {
            name: "Sonet", brand: "Kia", slug: "kia-sonet",
            description: "Feature-packed sub-compact SUV with iMT clutchless tech. Fun for Puri beach road drives.",
            images: ["https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80"],
            pricePerDay: 1600, transmission: "manual" as const, fuelType: "diesel" as const, seats: 5,
            locationId: puri, status: "available" as const,
        },
        {
            name: "Glanza", brand: "Toyota", slug: "toyota-glanza",
            description: "Value hatchback with strong hybrid tech — 27.97 km/l. Budget-friendly Sambalpur runabout.",
            images: ["https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80"],
            pricePerDay: 1100, transmission: "manual" as const, fuelType: "petrol" as const, seats: 5,
            locationId: sbl, status: "maintenance" as const,
        },
    ];
}

// ═══════════════════════════════════════════════
//  4. VEHICLES — fleet with features & categories
// ═══════════════════════════════════════════════
const VEHICLES_DATA = [
    {
        name: "Swift ZXi", brand: "Maruti Suzuki", model: "Swift ZXi 2024", year: 2024,
        category: "hatchback" as const, fuelType: "petrol" as const, transmission: "manual" as const,
        seats: 5, pricePerDay: 1200, isAvailable: true,
        images: ["https://images.unsplash.com/photo-1549317661-bd32c0e5a809?auto=format&fit=crop&q=80"],
        features: ["ABS", "Dual Airbags", "Rear Parking Sensors", "Steering Controls", "Bluetooth", "Auto AC"],
        deviceId: null, liveLocation: { lat: null, lng: null, at: null },
    },
    {
        name: "Creta SX(O)", brand: "Hyundai", model: "Creta SX(O) Diesel AT", year: 2025,
        category: "suv" as const, fuelType: "diesel" as const, transmission: "automatic" as const,
        seats: 5, pricePerDay: 2500, isAvailable: true,
        images: ["https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80"],
        features: ["Panoramic Sunroof", "Ventilated Seats", "ADAS Level 2", "360° Camera", "Bose Audio", "Wireless Charging"],
        deviceId: null, liveLocation: { lat: null, lng: null, at: null },
    },
    {
        name: "Nexon XZ+", brand: "Tata", model: "Nexon XZ+ Petrol", year: 2024,
        category: "suv" as const, fuelType: "petrol" as const, transmission: "manual" as const,
        seats: 5, pricePerDay: 2000, isAvailable: true,
        images: ["https://images.unsplash.com/photo-1550355191-863a354174d5?auto=format&fit=crop&q=80"],
        features: ["5-Star Safety", "Harman Audio", "Connected Car Tech", "Rain Sensing Wipers", "Cruise Control"],
        deviceId: null, liveLocation: { lat: null, lng: null, at: null },
    },
    {
        name: "City ZX CVT", brand: "Honda", model: "City ZX CVT Petrol", year: 2024,
        category: "sedan" as const, fuelType: "petrol" as const, transmission: "automatic" as const,
        seats: 5, pricePerDay: 1800, isAvailable: true,
        images: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80"],
        features: ["LaneWatch Camera", "Honda SENSING", "LED Headlamps", "Sunroof", "8-inch Touchscreen"],
        deviceId: null, liveLocation: { lat: null, lng: null, at: null },
    },
    {
        name: "Fortuner 4x4 AT", brand: "Toyota", model: "Fortuner 4x4 AT Diesel", year: 2025,
        category: "suv" as const, fuelType: "diesel" as const, transmission: "automatic" as const,
        seats: 7, pricePerDay: 6500, isAvailable: true,
        images: ["https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80"],
        features: ["4x4", "Terrain Modes", "JBL Audio", "Cooled Seats", "Connected Tech", "360° Camera", "TPMS"],
        deviceId: null, liveLocation: { lat: null, lng: null, at: null },
    },
    {
        name: "Thar LX 4WD", brand: "Mahindra", model: "Thar LX 4WD Diesel", year: 2024,
        category: "suv" as const, fuelType: "diesel" as const, transmission: "manual" as const,
        seats: 4, pricePerDay: 3500, isAvailable: true,
        images: ["https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80"],
        features: ["4x4", "Removable Hardtop", "Crawl Control", "LED DRLs", "Touchscreen"],
        deviceId: null, liveLocation: { lat: null, lng: null, at: null },
    },
    {
        name: "Nexon EV Max LR", brand: "Tata", model: "Nexon EV Max LR", year: 2025,
        category: "suv" as const, fuelType: "electric" as const, transmission: "automatic" as const,
        seats: 5, pricePerDay: 2800, isAvailable: true,
        images: ["https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80"],
        features: ["312 km Range", "Fast Charging", "Ziptron EV", "Connected Car", "Ventilated Seats", "Air Purifier"],
        deviceId: null, liveLocation: { lat: null, lng: null, at: null },
    },
    {
        name: "Verna SX Turbo", brand: "Hyundai", model: "Verna SX Turbo DCT", year: 2025,
        category: "sedan" as const, fuelType: "petrol" as const, transmission: "automatic" as const,
        seats: 5, pricePerDay: 2200, isAvailable: false,
        images: ["https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80"],
        features: ["Turbo Engine", "ADAS", "Ventilated Seats", "Dual-Zone Climate", "Bose Audio", "Wireless Charging"],
        deviceId: null, liveLocation: { lat: null, lng: null, at: null },
    },
];

// ═══════════════════════════════════════════════
//  5. BOOKINGS — mixed statuses
// ═══════════════════════════════════════════════
function buildBookings(carIds: Types.ObjectId[]) {
    const locNames = LOCATIONS_DATA.map((l) => l.name);
    return [
        // ── Completed (past) ──
        {
            carId: carIds[0], userId: USER_IDS[3],
            startDate: ago(30), endDate: ago(27), totalDays: 3,
            pricePerDay: 1200, totalAmount: 3600,
            paymentStatus: "paid" as const, bookingStatus: "completed" as const,
            pickupLocation: locNames[0], dropoffLocation: locNames[0],
            notes: "Bhubaneswar to Puri Rath Yatra trip – smooth ride",
        },
        {
            carId: carIds[1], userId: USER_IDS[4],
            startDate: ago(25), endDate: ago(20), totalDays: 5,
            pricePerDay: 2500, totalAmount: 12500,
            paymentStatus: "paid" as const, bookingStatus: "completed" as const,
            pickupLocation: locNames[0], dropoffLocation: locNames[0],
            notes: "Corporate Infocity client visit",
        },
        {
            carId: carIds[2], userId: USER_IDS[5],
            startDate: ago(20), endDate: ago(18), totalDays: 2,
            pricePerDay: 2000, totalAmount: 4000,
            paymentStatus: "paid" as const, bookingStatus: "completed" as const,
            pickupLocation: locNames[1], dropoffLocation: locNames[1],
        },
        {
            carId: carIds[7], userId: USER_IDS[6],
            startDate: ago(15), endDate: ago(12), totalDays: 3,
            pricePerDay: 1800, totalAmount: 5400,
            paymentStatus: "paid" as const, bookingStatus: "completed" as const,
            pickupLocation: locNames[6], dropoffLocation: locNames[6],
            notes: "KIIT campus area pickup",
        },
        {
            carId: carIds[5], userId: USER_IDS[9],
            startDate: ago(18), endDate: ago(14), totalDays: 4,
            pricePerDay: 2400, totalAmount: 9600,
            paymentStatus: "paid" as const, bookingStatus: "completed" as const,
            pickupLocation: locNames[3], dropoffLocation: locNames[3],
            notes: "Rourkela steel city round tour",
        },
        // ── Active (currently running) ──
        {
            carId: carIds[3], userId: USER_IDS[7],
            startDate: ago(2), endDate: future(3), totalDays: 5,
            pricePerDay: 4000, totalAmount: 20000,
            paymentStatus: "paid" as const, bookingStatus: "active" as const,
            pickupLocation: locNames[0], dropoffLocation: locNames[0],
            notes: "Family vacation — Chilika Lake & Gopalpur-on-Sea",
        },
        {
            carId: carIds[6], userId: USER_IDS[10],
            startDate: ago(1), endDate: future(2), totalDays: 3,
            pricePerDay: 2800, totalAmount: 8400,
            paymentStatus: "paid" as const, bookingStatus: "active" as const,
            pickupLocation: locNames[4], dropoffLocation: locNames[4],
            notes: "Hirakud Dam sightseeing with friends",
        },
        // ── Confirmed (upcoming) ──
        {
            carId: carIds[0], userId: USER_IDS[11],
            startDate: future(3), endDate: future(6), totalDays: 3,
            pricePerDay: 1200, totalAmount: 3600,
            paymentStatus: "paid" as const, bookingStatus: "confirmed" as const,
            pickupLocation: locNames[0], dropoffLocation: locNames[0],
        },
        {
            carId: carIds[9], userId: USER_IDS[13],
            startDate: future(5), endDate: future(12), totalDays: 7,
            pricePerDay: 6500, totalAmount: 45500,
            paymentStatus: "paid" as const, bookingStatus: "confirmed" as const,
            pickupLocation: locNames[0], dropoffLocation: locNames[0],
            notes: "Bhubaneswar → Simlipal → Chandipur — Odisha road trip",
        },
        // ── Reserved (payment pending) ──
        {
            carId: carIds[1], userId: USER_IDS[8],
            startDate: future(7), endDate: future(10), totalDays: 3,
            pricePerDay: 2500, totalAmount: 7500,
            paymentStatus: "pending" as const, bookingStatus: "reserved" as const,
            reservationExpiresAt: future(1),
            pickupLocation: locNames[0], dropoffLocation: locNames[0],
        },
        // ── Cancelled ──
        {
            carId: carIds[2], userId: USER_IDS[12],
            startDate: ago(10), endDate: ago(7), totalDays: 3,
            pricePerDay: 2000, totalAmount: 6000,
            paymentStatus: "failed" as const, bookingStatus: "cancelled" as const,
            pickupLocation: locNames[1], dropoffLocation: locNames[1],
            notes: "Payment gateway timeout",
        },
        {
            carId: carIds[5], userId: USER_IDS[14],
            startDate: ago(5), endDate: ago(2), totalDays: 3,
            pricePerDay: 2400, totalAmount: 7200,
            paymentStatus: "pending" as const, bookingStatus: "cancelled" as const,
            pickupLocation: locNames[3], dropoffLocation: locNames[3],
            notes: "Customer cancelled — cyclone warning",
        },
    ];
}

// ═══════════════════════════════════════════════
//  MAIN SEED FUNCTION
// ═══════════════════════════════════════════════
async function seed() {
    console.log("🌱 Connecting to MongoDB…");
    await mongoose.connect(MONGO_URI!);
    console.log("✅ Connected\n");

    // ── Wipe all collections ──
    await Promise.all([
        LocationModel.deleteMany({}),
        CarModel.deleteMany({}),
        UserModel.deleteMany({}),
        BookingModel.deleteMany({}),
        PaymentModel.deleteMany({}),
        TrackingModel.deleteMany({}),
        VehicleModel.deleteMany({}),
    ]);
    console.log("🗑️  Cleared all collections");

    // ── Locations ──
    await LocationModel.insertMany(LOCATIONS_DATA);
    console.log(`📍 Created ${LOCATIONS_DATA.length} Odisha locations`);

    // ── Users (hash passwords) ──
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash("Admin@123", salt);
    const defaultHash = await bcrypt.hash("Demo@1234", salt);

    const userDocs = USERS_RAW.map((u, i) => ({
        ...u,
        passwordHash: i === 0 ? adminHash : defaultHash,
        createdAt: ago(rnd(30, 90)),
        updatedAt: now,
    }));
    await UserModel.collection.insertMany(userDocs);
    console.log(`👤 Created ${userDocs.length} users (1 admin, 2 staff, 12 customers)`);

    // ── Cars ──
    const CARS = buildCars();
    const carIds: Types.ObjectId[] = [];
    const carDocs = CARS.map((car) => {
        const id = oid();
        carIds.push(id);
        return { _id: id, ...car, createdAt: ago(rnd(15, 60)), updatedAt: now };
    });
    await CarModel.collection.insertMany(carDocs);
    console.log(`🚗 Created ${carDocs.length} cars`);

    // ── Vehicles ──
    const vehicleDocs = VEHICLES_DATA.map((v) => ({
        ...v,
        createdAt: ago(rnd(15, 60)),
        updatedAt: now,
    }));
    const insertedVehicles = await VehicleModel.collection.insertMany(vehicleDocs);
    console.log(`🚙 Created ${vehicleDocs.length} vehicles`);

    // ── Bookings ──
    const BOOKINGS = buildBookings(carIds);
    const bookingDocs = BOOKINGS.map((b) => {
        const id = oid();
        return {
            _id: id,
            ...b,
            razorpayOrderId: rzpOrder(),
            razorpayPaymentId: b.paymentStatus === "paid" ? rzpPay() : null,
            createdAt: new Date(b.startDate.getTime() - days(rnd(1, 5))),
            updatedAt: now,
        };
    });
    await BookingModel.collection.insertMany(bookingDocs);
    console.log(`📋 Created ${bookingDocs.length} bookings`);

    // ── Payments ──
    const paymentDocs = bookingDocs.map((b, i) => ({
        bookingId: b._id,
        razorpayOrderId: b.razorpayOrderId,
        razorpayPaymentId: b.razorpayPaymentId,
        razorpaySignature: b.razorpayPaymentId
            ? `sig_${b.razorpayPaymentId.slice(4)}`
            : null,
        amount: BOOKINGS[i].totalAmount * 100, // paise
        status: b.razorpayPaymentId ? ("paid" as const) : ("created" as const),
        createdAt: b.createdAt,
        updatedAt: now,
    }));
    await PaymentModel.collection.insertMany(paymentDocs);
    console.log(`💳 Created ${paymentDocs.length} payments`);

    // ── Tracking (GPS breadcrumbs for active bookings) ──
    const vehicleIds = Object.values(insertedVehicles.insertedIds);
    const trackingDocs: Record<string, unknown>[] = [];

    // Bhubaneswar → Chilika route breadcrumbs
    const routes = [
        { baseLat: 20.2701, baseLng: 85.8245, dLat: -0.008, dLng: -0.005 }, // BBSR south
        { baseLat: 21.4669, baseLng: 83.9812, dLat: 0.004, dLng: 0.003 },   // Sambalpur area
    ];

    bookingDocs.forEach((b, bIdx) => {
        if (BOOKINGS[bIdx].bookingStatus !== "active") return;
        const vId = pick(vehicleIds);
        const route = routes[bIdx % routes.length];
        for (let h = 0; h < 10; h++) {
            trackingDocs.push({
                vehicleId: vId,
                bookingId: b._id,
                lat: route.baseLat + h * route.dLat + Math.random() * 0.002,
                lng: route.baseLng + h * route.dLng + Math.random() * 0.002,
                speed: rnd(15, 85),
                capturedAt: new Date(Date.now() - (10 - h) * 3600000),
                createdAt: now,
                updatedAt: now,
            });
        }
    });

    if (trackingDocs.length > 0) {
        await TrackingModel.collection.insertMany(trackingDocs);
    }
    console.log(`📡 Created ${trackingDocs.length} GPS tracking points`);

    // ── Summary ──
    console.log("\n╔═══════════════════════════════════════════════════╗");
    console.log("║         ✅  SEED COMPLETE — Odisha Edition        ║");
    console.log("╠═══════════════════════════════════════════════════╣");
    console.log(`║  📍 Locations  : ${String(LOCATIONS_DATA.length).padStart(3)}  (Odisha cities)          ║`);
    console.log(`║  👤 Users      : ${String(userDocs.length).padStart(3)}  (Odia names)              ║`);
    console.log(`║  🚗 Cars       : ${String(carDocs.length).padStart(3)}                             ║`);
    console.log(`║  🚙 Vehicles   : ${String(vehicleDocs.length).padStart(3)}                             ║`);
    console.log(`║  📋 Bookings   : ${String(bookingDocs.length).padStart(3)}                             ║`);
    console.log(`║  💳 Payments   : ${String(paymentDocs.length).padStart(3)}                             ║`);
    console.log(`║  📡 GPS Points : ${String(trackingDocs.length).padStart(3)}                             ║`);
    console.log("╠═══════════════════════════════════════════════════╣");
    console.log("║  🔐 Admin Login:                                  ║");
    console.log("║     Email : admin@odicarrental.in                 ║");
    console.log("║     Pass  : Admin@123                             ║");
    console.log("║  All other users: Demo@1234                       ║");
    console.log("╚═══════════════════════════════════════════════════╝");

    console.log("\n🚗 Car slugs seeded:");
    CARS.forEach((c) =>
        console.log(`   ${c.brand} ${c.name} → "${c.slug}"`)
    );

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
