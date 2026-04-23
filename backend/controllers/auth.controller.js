import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { isEmailVerified } from './otp.controller.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, companyName, phone, otpToken } = req.body;

        // Verify email OTP
        if (!otpToken || !isEmailVerified(email, otpToken)) {
            return res.status(400).json({ message: 'Please verify your email with OTP first' });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            companyName,
            phone
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                companyName: user.companyName,
                phone: user.phone,
                role: user.role,
                createdAt: user.createdAt,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.name = req.body.name || user.name;
        user.companyName = req.body.companyName || user.companyName;
        user.phone = req.body.phone || user.phone;

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            companyName: updatedUser.companyName,
            phone: updatedUser.phone,
            role: updatedUser.role,
            token: generateToken(updatedUser._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Change password (logged in)
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

        if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });

        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot password — send reset link via email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'No account found with this email' });

        // Generate reset token (valid 15 min)
        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

        // Build reset URL
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        // Send email
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });

        const html = `
        <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:32px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:24px;">GJ TEX</h1>
                <p style="color:rgba(255,255,255,0.6);margin:8px 0 0;font-size:13px;">Password Reset</p>
            </div>
            <div style="padding:32px;">
                <p style="color:#374151;font-size:16px;margin:0 0 8px;">Hi <strong>${user.name}</strong>,</p>
                <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px;">We received a request to reset your password. Click the button below to create a new password:</p>
                <div style="text-align:center;margin:24px 0;">
                    <a href="${resetUrl}" style="background:linear-gradient(135deg,#f97316,#ef4444);color:#fff;padding:14px 32px;border-radius:12px;font-weight:700;text-decoration:none;font-size:14px;display:inline-block;">Reset Password</a>
                </div>
                <p style="color:#9ca3af;font-size:12px;line-height:1.6;margin:0;">This link will expire in <strong>15 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
                <p style="color:#9ca3af;font-size:11px;text-align:center;margin:0;"><strong>GJ TEX Manufacturing</strong> — Tiruppur</p>
            </div>
        </div>`;

        await transporter.sendMail({
            from: `"GJ TEX" <${process.env.SMTP_EMAIL || process.env.SMTP_USER}>`,
            to: email,
            subject: '🔑 Password Reset — GJ TEX',
            html,
        });

        res.json({ message: 'Password reset link sent to your email' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) return res.status(400).json({ message: 'Token and new password are required' });
        if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password reset successfully. You can now login.' });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Reset link has expired. Please request a new one.' });
        }
        res.status(500).json({ message: error.message });
    }
};

