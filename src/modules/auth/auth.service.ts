import bcrypt from "bcryptjs";
import { UserModel } from "../users/user.model";
import { signToken } from "../../utils/jwt";
import { ApiError } from "../../utils/apiError";

export const AuthService = {
  async register(name: string, email: string, password: string) {
    const existing = await UserModel.findOne({ email });
    if (existing) throw new ApiError(409, "Email already registered");

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await UserModel.create({ name, email, passwordHash });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token };
  },

  async login(email: string, password: string) {
    const user = await UserModel.findOne({ email }).select("+passwordHash");
    if (!user) throw new ApiError(401, "Invalid credentials");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new ApiError(401, "Invalid credentials");

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token };
  },
};
