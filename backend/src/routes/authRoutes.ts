import bcrypt from "bcrypt";
import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import User from "../models/User.js";
import {
  authenticateToken,
  type AuthenticatedRequest,
} from "../middleware/authMiddleware.js";

const authRoutes = Router();
const saltRounds = 10;
const maxProfileImageBytes = 2 * 1024 * 1024;
const profileImagePattern = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/;
const userSortFields = ["name", "email", "createdAt"] as const;
type UserSortField = (typeof userSortFields)[number];

function queryString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isValidProfileImage(value: unknown): value is string {
  if (value === "") return true;
  if (typeof value !== "string") return false;
  const match = value.match(profileImagePattern);
  if (!match) return false;
  const base64Length = match[2].replace(/\s/g, "").length;
  const byteLength = Math.ceil((base64Length * 3) / 4);
  return byteLength <= maxProfileImageBytes;
}

function publicUser(user: { _id: unknown; name: string; email: string; profileImage?: string }) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    profileImage: user.profileImage ?? "",
  };
}

authRoutes.get(
  "/users",
  authenticateToken,
  async (request: AuthenticatedRequest, response: Response) => {
    try {
      const requestedSortField = queryString(request.query.sortBy) ?? "createdAt";
      const requestedOrder = queryString(request.query.order) ?? "asc";

      if (!userSortFields.includes(requestedSortField as UserSortField)) {
        return response.status(400).json({
          success: false,
          message: "sortBy must be one of: name, email, createdAt.",
        });
      }

      if (requestedOrder !== "asc" && requestedOrder !== "desc") {
        return response.status(400).json({
          success: false,
          message: "order must be asc or desc.",
        });
      }

      const sortDirection = requestedOrder === "asc" ? 1 : -1;
      const users = await User.find()
        .select("_id name email createdAt updatedAt")
        .sort({ [requestedSortField]: sortDirection })
        .lean();

      return response.status(200).json({
        success: true,
        users: users.map((user) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
      });
    } catch (error) {
      console.error("Fetching users failed:", error);
      return response.status(500).json({
        success: false,
        message: "Unable to fetch users.",
      });
    }
  },
);

authRoutes.delete(
  "/users/:id",
  authenticateToken,
  async (request: AuthenticatedRequest, response: Response) => {
    try {
      const id = request.params.id;

      if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
        return response.status(400).json({
          success: false,
          message: "A valid user id is required.",
        });
      }

      if (request.userId !== id) {
        return response.status(403).json({
          success: false,
          message: "You may only delete your own account.",
        });
      }

      const deletedUser = await User.findByIdAndDelete(id).select("_id name email");
      if (!deletedUser) {
        return response.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      return response.status(200).json({
        success: true,
        message: "Account deleted successfully.",
        user: {
          id: deletedUser._id,
          name: deletedUser.name,
          email: deletedUser.email,
        },
      });
    } catch (error) {
      console.error("Deleting user failed:", error);
      return response.status(500).json({
        success: false,
        message: "Unable to delete user.",
      });
    }
  },
);

authRoutes.put("/change-password", authenticateToken, async (request: AuthenticatedRequest, response: Response) => {
  try {
    const { currentPassword, newPassword } = request.body as {
      currentPassword?: unknown;
      newPassword?: unknown;
    };

    if (typeof currentPassword !== "string" || typeof newPassword !== "string" || !currentPassword || !newPassword) {
      return response.status(400).json({ success: false, message: "Current password and new password are required." });
    }
    if (newPassword.length < 8) {
      return response.status(400).json({ success: false, message: "New password must be at least 8 characters." });
    }

    const user = await User.findById(request.userId);
    if (!user) return response.status(404).json({ success: false, message: "User not found." });

    const currentPasswordMatches = await bcrypt.compare(currentPassword, user.password);
    if (!currentPasswordMatches) {
      return response.status(401).json({ success: false, message: "Current password is incorrect." });
    }

    user.password = await bcrypt.hash(newPassword, saltRounds);
    await user.save();
    return response.status(200).json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    console.error("Password change failed:", error);
    return response.status(500).json({ success: false, message: "Unable to change password." });
  }
});

authRoutes.put("/profile", authenticateToken, async (request: AuthenticatedRequest, response: Response) => {
  try {
    const { name, email, profileImage } = request.body as {
      name?: unknown;
      email?: unknown;
      profileImage?: unknown;
    };
    if (typeof name !== "string" || !name.trim()) {
      return response.status(400).json({ success: false, message: "Name is required." });
    }
    if (typeof email !== "string" || !email.trim()) {
      return response.status(400).json({ success: false, message: "Email is required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return response.status(400).json({ success: false, message: "Please provide a valid email address." });
    }
    if (!isValidProfileImage(profileImage ?? "")) {
      return response.status(400).json({
        success: false,
        message: "Profile image must be a JPEG, PNG, or WebP image no larger than 2 MB.",
      });
    }

    const duplicateUser = await User.findOne({ email: normalizedEmail, _id: { $ne: request.userId } });
    if (duplicateUser) {
      return response.status(409).json({ success: false, message: "That email address is already in use." });
    }

    const profileUpdate: { name: string; email: string; profileImage?: string } = {
      name: name.trim(),
      email: normalizedEmail,
    };
    if (profileImage !== undefined) profileUpdate.profileImage = profileImage as string;

    const user = await User.findByIdAndUpdate(
      request.userId,
      profileUpdate,
      { new: true, runValidators: true },
    ).select("-password");
    if (!user) return response.status(404).json({ success: false, message: "User not found." });

    return response.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: publicUser(user),
    });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return response.status(409).json({ success: false, message: "That email address is already in use." });
    }
    console.error("Profile update failed:", error);
    return response.status(500).json({ success: false, message: "Unable to update profile." });
  }
});

authRoutes.get(
  "/me",
  authenticateToken,
  async (request: AuthenticatedRequest, response: Response) => {
    try {
      const user = await User.findById(request.userId).select("-password");

      if (!user) {
        return response.status(401).json({
          success: false,
          message: "Authenticated user was not found.",
        });
      }

      return response.status(200).json({
        success: true,
        user: publicUser(user),
      });
    } catch (error) {
      console.error("Fetching authenticated user failed:", error);
      return response.status(500).json({
        success: false,
        message: "Unable to fetch authenticated user.",
      });
    }
  },
);

authRoutes.post("/signup", async (request: Request, response: Response) => {
  try {
    const { name, email, password } = request.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name?.trim() || !email?.trim() || !password) {
      return response.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return response.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    return response.status(201).json({
      success: true,
      message: "Signup successful.",
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Signup failed:", error);
    return response.status(500).json({
      success: false,
      message: "Unable to create account.",
    });
  }
});

authRoutes.post("/login", async (request: Request, response: Response) => {
  try {
    const { email, password } = request.body as {
      email?: string;
      password?: string;
    };

    if (!email?.trim() || !password) {
      return response.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return response.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET is not configured.");
      return response.status(500).json({
        success: false,
        message: "Authentication is not configured.",
      });
    }

    const token = jwt.sign({ userId: user._id.toString() }, jwtSecret, {
      expiresIn: "1d",
    });

    return response.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login failed:", error);
    return response.status(500).json({
      success: false,
      message: "Unable to log in.",
    });
  }
});

export default authRoutes;
