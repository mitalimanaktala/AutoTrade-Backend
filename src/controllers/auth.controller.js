import {
  registerUser,
  loginUser,
  verifyOTP
} from "../services/auth.service.js";

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email.",
      user
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await loginUser(email, password);

    res.status(200).json({
      success: true,
      token: data.token,
      user: data.user
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyOtpController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    await verifyOTP(email, otp);

    res.status(200).json({
      success: true,
      message: "Email verified successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};