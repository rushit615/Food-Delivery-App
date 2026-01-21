import userModel from "../model/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/jwtToken.js";
import admin from "../config/firebaseAdmin.js";
import crypto from "crypto";

import { sendOtpMail } from "../utils/mail.js";

export const signUp = async (req, res) => {
  try {
    const {
      fullName: { firstName, lastName },
      email,
      password,
      mobile,
      role,
      verificationToken,
    } = req.body;
    // const decodedToken = await admin.auth().verifyIdToken(verificationToken);

    // if (!decodedToken.phone_number.includes(mobile)) {
    //   console.log(decodedToken.phone_number.includes(mobile))
    //   return res.status(400).json({ message: "Phone verification failed!" });
    // }
    let user = await userModel.findOne({
      email,
    });

    if (user) {
      return res.status(400).json({ message: "user already exists" });
    }

    let hashedPassword = await bcrypt.hash(password, 10);
    let result = await userModel.create({
      fullName: { firstName, lastName },
      email,
      password: hashedPassword,
      mobile,
      role,
    });

    const token = await genToken(result._id, result.role);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(201).json({
      message: "signedUp successfully",
      result,
      token,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({ message: "password doesnt match." });
    }

    const token = await genToken(user._id, user.role);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });
    req.user = user;

    return res.status(200).json(user, token);
  } catch (error) {
    console.error("Signup Error:", error);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
};

export const signOut = (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    };

    res.clearCookie("token", cookieOptions);

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Sign out error:", error);
    return res.status(500).json({ message: "Sign out failed" });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(200)
        .json({ message: "OTP sent if email is registered." });
    }
    const otp = crypto.randomInt(1000, 9999).toString();
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.isOtpVerified = false;
    await user.save();
    try {
      await sendOtpMail(email, otp);
    } catch (error) {
      user.resetOtp = undefined;
      user.otpExpires = undefined;
      await user.save();
      return res.status(500).json({ message: "Could not send email." });
    }
    return res.status(200).json({ message: "otp sent successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await userModel.findOne({ email });
    if (!user || user.resetOtp != otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "invalid or expired otp" });
    }
    const resetToken = crypto.randomBytes(36).toString("hex");
    user.isOtpVerified = true;
    user.resetOtp = resetToken;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();
    return res
      .status(200)
      .json({ message: "otp verify successfully", resetToken: resetToken });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, resetToken } = req.body;

    const user = await userModel.findOne({ email });
    if (
      !user ||
      !user.isOtpVerified ||
      user.resetOtp !== resetToken ||
      user.otpExpires < Date.now()
    ) {
      return res.status(400).json({
        message: "Reset session expired or invalid. Please start over.",
      });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = undefined;
    user.otpExpires = undefined;
    user.isOtpVerified = false;

    await user.save();
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("reset password Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { token, role, mobile } = req.body;

    const decodedToken = await admin.auth().verifyIdToken(token);

    const { email, name, picture, uid } = decodedToken;

    let user = await userModel.findOne({ email });

    if (user) {
      const token = await genToken(user._id, user.role);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      });
      req.user = user;

      return res.status(200).json(user, token);
    } else {
      if (!mobile) {
        return res
          .status(400)
          .json({ message: "Mobile number is required for registration." });
      }

      user = new userModel({
        username: name,
        email: email,
        googleId: uid,

        role: role || "user",
        mobile: mobile,
      });
      await user.save();
    }

    const sessionToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res
      .cookie("accessToken", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        user: {
          id: user._id,
          name: user.username,
          email: user.email,
          role: user.role,
        },
      });
  } catch (error) {
    console.error("Google Auth Verification Failed:", error);
    res.status(401).json({ message: "Authentication failed. Invalid token." });
  }
};
