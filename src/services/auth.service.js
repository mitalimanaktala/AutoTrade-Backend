import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.model.js";
import { sendOTPEmail } from "../utils/sendEmail.js";

export const registerUser = async (data) => {
  const { name, email, password, phone } = data;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedOtp = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
    otp: hashedOtp,
    otpExpires: Date.now() + 5 * 60 * 1000 
  });

  await sendOTPEmail(email, otp);

  return user;
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) throw new Error("Invalid credentials");

  if (!user.isVerified)
    throw new Error("Please verify OTP first");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES }
  );

  return { user, token };
};

export const verifyOTP = async (email, otp) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  if (user.isVerified)
    throw new Error("User already verified");

  if (!user.otp || !user.otpExpires)
    throw new Error("OTP not found");

  if (user.otpExpires < Date.now())
    throw new Error("OTP expired");

  const hashedOtp = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  if (hashedOtp !== user.otp)
    throw new Error("Invalid OTP");

  user.isVerified = true;
  user.otp = null;
  user.otpExpires = null;

  await user.save();

  return user;
};