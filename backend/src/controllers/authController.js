import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { asyncHandler, createError } from '../middleware/error.js';
import { addMissingRecurring } from '../utils/recurring.js';
import { currentMonth, generateOtp } from '../utils/helpers.js';
import { sendOtpEmail } from '../utils/mailer.js';
import { seedDefaultCategories } from './categoryController.js';

const signToken = (id, email) =>
  jwt.sign({ id, email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const userPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  currency: user.currency || 'INR',
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw createError('Email already registered', 409);

  const user = await User.create({ name, email, password });

  // Generate and send OTP — user cannot log in until verified
  const otp = generateOtp();
  user.otp = await bcrypt.hash(otp, 10);
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save({ validateBeforeSave: false });

  try {
    await sendOtpEmail(email, otp);
  } catch (err) {
    // Don't block registration if email fails — dev can use console OTP
    console.error('Email send failed:', err.message);
    console.log(`🔑 Dev OTP for ${email}: ${otp}`);
  }

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please check your email for the verification code.',
    email: user.email,
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email }).select('+otp +otpExpires');
  if (!user) throw createError('Invalid email', 400);
  if (user.isVerified) throw createError('Email is already verified', 400);
  if (!user.otp || !user.otpExpires) throw createError('No OTP found. Please request a new one.', 400);
  if (Date.now() > user.otpExpires.getTime()) throw createError('OTP has expired. Please request a new one.', 400);

  const isValid = await bcrypt.compare(otp, user.otp);
  if (!isValid) throw createError('Invalid OTP. Please try again.', 400);

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // Seed default categories now that the user is confirmed
  await seedDefaultCategories(user._id);

  // Auto-login: issue JWT so the frontend can immediately redirect to currency selection
  const token = signToken(user._id, user.email);

  res.json({
    success: true,
    message: 'Email verified successfully!',
    token,
    user: userPayload(user),
  });
});

export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email }).select('+otp +otpExpires');
  if (!user) throw createError('User not found', 404);
  if (user.isVerified) throw createError('Email is already verified', 400);

  // Enforce a 60-second cooldown between resends
  if (user.otpExpires && Date.now() < user.otpExpires.getTime() - 9 * 60 * 1000) {
    throw createError('Please wait at least 60 seconds before requesting a new code.', 429);
  }

  const otp = generateOtp();
  user.otp = await bcrypt.hash(otp, 10);
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  try {
    await sendOtpEmail(email, otp);
  } catch {
    console.log(`🔑 Dev OTP for ${email}: ${otp}`);
  }

  res.json({ success: true, message: 'A new verification code has been sent to your email.' });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw createError('Invalid email or password', 401);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw createError('Invalid email or password', 401);

  if (!user.isVerified) {
    throw createError('Please verify your email before logging in.', 403);
  }

  const recurringAdded = await addMissingRecurring(user._id, currentMonth());
  const token = signToken(user._id, user.email);

  res.json({
    success: true,
    token,
    user: userPayload(user),
    recurringAdded,
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw createError('User not found', 404);
  res.json({ success: true, user: userPayload(user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name },
    { new: true, runValidators: true }
  );
  res.json({ success: true, user: userPayload(user) });
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');
  if (!user) throw createError('User not found', 404);

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw createError('Current password is incorrect', 401);

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const { currency } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { currency },
    { new: true, runValidators: true }
  );
  res.json({ success: true, user: userPayload(user) });
});
