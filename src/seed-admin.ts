import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/car-rental";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function seedAdmin() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        const adminEmail = "admin@pixelcypher.com";
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log(`Admin user already exists: ${adminEmail}`);
            console.log("Password is likely 'Admin@123'");
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("Admin@123", salt);

        await User.create({
            name: "Super Admin",
            email: adminEmail,
            password: hashedPassword,
            role: "admin",
        });

        console.log(`Successfully created Admin User!`);
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: Admin@123`);
        process.exit(0);
    } catch (error) {
        console.error("Failed to seed admin:", error);
        process.exit(1);
    }
}

seedAdmin();
