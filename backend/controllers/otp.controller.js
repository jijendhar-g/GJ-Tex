import crypto from 'crypto';
import nodemailer from 'nodemailer';

// In-memory OTP store: { email: { otp, expiresAt, verified, token } }
const otpStore = new Map();

// Generate a 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate a verification token
const generateVerificationToken = (email) => {
    return crypto.createHash('sha256').update(email + Date.now().toString() + crypto.randomBytes(16).toString('hex')).digest('hex');
};

// Create email transporter (supports Gmail or Brevo SMTP)
const createTransporter = () => {
    const smtpHost = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
    const smtpPort = parseInt(process.env.SMTP_PORT) || 587;

    return nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: false,
        auth: {
            user: process.env.SMTP_USER || process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASS
        }
    });
};

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const otp = generateOTP();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

        // Store OTP
        otpStore.set(email.toLowerCase(), { otp, expiresAt, verified: false, token: null });

        // Always log to console
        console.log('');
        console.log('═══════════════════════════════════════');
        console.log(`  📧 OTP for ${email}: ${otp}`);
        console.log('  ⏰ Expires in 5 minutes');
        console.log('═══════════════════════════════════════');
        console.log('');

        // Try to send email
        if (process.env.SMTP_PASS && process.env.SMTP_PASS !== 'your_app_password_here') {
            try {
                const transporter = createTransporter();
                const senderEmail = process.env.SMTP_EMAIL || 'noreply@gjtex.com';

                const mailOptions = {
                    from: `"GJ TEX" <${senderEmail}>`,
                    to: email,
                    subject: '🔐 Your GJ TEX Verification Code',
                    html: `
                        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 30px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 20px;">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <h1 style="color: #f97316; font-size: 28px; margin: 0; letter-spacing: 2px;">GJ TEX</h1>
                                <p style="color: #94a3b8; font-size: 13px; margin-top: 5px;">Premium Garments • Tiruppur</p>
                            </div>
                            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 30px; text-align: center;">
                                <p style="color: #e2e8f0; font-size: 16px; margin: 0 0 20px;">Your verification code is:</p>
                                <div style="background: linear-gradient(135deg, #f97316, #ef4444); padding: 20px 40px; border-radius: 12px; display: inline-block; margin-bottom: 20px;">
                                    <span style="color: white; font-size: 36px; font-weight: bold; letter-spacing: 10px; font-family: monospace;">${otp}</span>
                                </div>
                                <p style="color: #94a3b8; font-size: 13px; margin: 0;">This code expires in <strong style="color: #f97316;">5 minutes</strong></p>
                            </div>
                            <p style="color: #64748b; font-size: 11px; text-align: center; margin-top: 25px;">
                                If you didn't request this code, please ignore this email.
                            </p>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                console.log('  ✅ Email sent successfully!');
            } catch (emailErr) {
                console.error('  ⚠️ Email send failed:', emailErr.message);
                console.log('  📋 OTP is still available in console above');
            }
        } else {
            console.log('  ℹ️  SMTP not configured - OTP shown in console only');
        }

        res.json({ message: 'OTP sent to your email', expiresIn: 300 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const stored = otpStore.get(email.toLowerCase());

        if (!stored) {
            return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
        }

        if (Date.now() > stored.expiresAt) {
            otpStore.delete(email.toLowerCase());
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        if (stored.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
        }

        // OTP verified - generate a token to prove verification
        const token = generateVerificationToken(email);
        otpStore.set(email.toLowerCase(), { ...stored, verified: true, token });

        // Auto-cleanup after 10 minutes
        setTimeout(() => otpStore.delete(email.toLowerCase()), 10 * 60 * 1000);

        res.json({ message: 'Email verified successfully', otpToken: token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper: Check if an email+token combination is verified
export const isEmailVerified = (email, token) => {
    const stored = otpStore.get(email.toLowerCase());
    return stored && stored.verified && stored.token === token;
};
