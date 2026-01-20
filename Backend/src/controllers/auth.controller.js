import userModel from "../model/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/jwtToken.js";
import admin from "../config/firebaseAdmin.js";

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
    const decodedToken = await admin.auth().verifyIdToken(verificationToken);

    console.log({ fullName: { firstName, lastName },
      email,
      password,
      mobile,
      role,}

    )
    if (!decodedToken.phone_number.includes(mobile)) {
      console.log(decodedToken.phone_number.includes(mobile))
      return res.status(400).json({ message: "Phone verification failed!" });
    }
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
