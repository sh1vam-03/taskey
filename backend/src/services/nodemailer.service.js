import nodemailer from 'nodemailer';
import ApiError from '../utils/ApiError.js';

let transporter = null;

const getTransporter = () => {
    if (transporter) return transporter;

    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailAppPassword) {
        console.error("❌ GMAIL_USER or GMAIL_APP_PASSWORD is not set in environment variables.");
        throw new ApiError(500, "Email configuration missing");
    }

    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: gmailUser,
            pass: gmailAppPassword,
        },
    });

    return transporter;
};

// ─────────────────────────────────────────────────────────
// Brand constants — matched from landing page + dashboard
// ─────────────────────────────────────────────────────────
const BRAND = {
    name: 'TASKTIME',
    url: 'https://tasktime-sh1vam-03.vercel.app/',
    tagline: 'Built for focus. Powered by AI.',
    description: 'AI-powered task and schedule management built to help you focus, prioritize, and get more done.',
    social: {
        instagram: 'https://instagram.com/sh1vam.03',
        github: 'https://github.com/sh1vam-03',
        linkedin: 'https://linkedin.com/in/sh1vam~03',
    },
    colors: {
        bg: '#000000',
        surface: '#0a0a0a',
        card: '#111111',
        border: 'rgba(255,255,255,0.07)',
        borderLight: 'rgba(255,255,255,0.12)',
        primary: '#06b6d4',
        primaryGlow: 'rgba(6,182,212,0.15)',
        text: '#ffffff',
        textMuted: 'rgba(255,255,255,0.45)',
        textDim: 'rgba(255,255,255,0.25)',
    },
};

/**
 * Professional HTML Email Wrapper
 * Matches Tasktime landing page: black bg, cyan accents, mono footer
 */
const getEmailTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${BRAND.name}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.colors.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">

    <!-- Outer wrapper -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.colors.bg};padding:40px 16px 60px;">
    <tr><td align="center">

        <!-- Email container -->
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:${BRAND.colors.surface};border:1px solid ${BRAND.colors.border};border-radius:12px;overflow:hidden;">

            <!-- ═══ HEADER ═══ -->
            <tr>
                <td style="padding:32px 40px;border-bottom:1px solid ${BRAND.colors.border};text-align:center;">
                    <!-- Logo: TASKTIME — bold, tight tracking, white -->
                    <a href="${BRAND.url}" style="text-decoration:none;color:${BRAND.colors.text};font-size:22px;font-weight:900;letter-spacing:-0.04em;">
                        ${BRAND.name}
                    </a>
                </td>
            </tr>

            <!-- ═══ BODY ═══ -->
            <tr>
                <td style="padding:40px;">
                    ${content}
                </td>
            </tr>

            <!-- ═══ DIVIDER ═══ -->
            <tr>
                <td style="padding:0 40px;">
                    <div style="height:1px;background:linear-gradient(to right,transparent,${BRAND.colors.primary},transparent);opacity:0.2;"></div>
                </td>
            </tr>

            <!-- ═══ SOCIAL ═══ -->
            <tr>
                <td style="padding:24px 40px;text-align:center;">
                    <table align="center" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                    <tr>
                        <td align="center" style="padding:0 10px;">
                            <a href="${BRAND.social.instagram}" target="_blank" style="text-decoration:none;">
                                <img src="https://cdn-icons-png.flaticon.com/512/15713/15713420.png" width="28" height="28" alt="Instagram" style="display:block;" />
                            </a>
                        </td>
                        <td align="center" style="padding:0 10px;">
                            <a href="${BRAND.social.github}" target="_blank" style="text-decoration:none;">
                                <img src="https://cdn-icons-png.flaticon.com/512/5968/5968866.png" width="28" height="28" alt="GitHub" style="display:block;" />
                            </a>
                        </td>
                        <td align="center" style="padding:0 10px;">
                            <a href="${BRAND.social.linkedin}" target="_blank" style="text-decoration:none;">
                                <img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" width="28" height="28" alt="LinkedIn" style="display:block;" />
                            </a>
                        </td>
                    </tr>
                    </table>
                </td>
            </tr>

            <!-- ═══ FOOTER ═══ -->
            <tr>
                <td style="padding:20px 40px 28px;border-top:1px solid ${BRAND.colors.border};text-align:center;">
                    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:${BRAND.colors.textDim};">
                        ${BRAND.tagline.replace('Powered by AI', `<span style="color:${BRAND.colors.primary};">Powered by AI</span>`)}
                    </p>
                    <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.colors.textDim};">
                        Made with ❤️ in <span style="color:${BRAND.colors.primary};">India</span>
                    </p>
                    <p style="margin:0;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.15);">
                        &copy; ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
                    </p>
                </td>
            </tr>

        </table>

        <!-- Help text below card -->
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;margin-top:20px;">
        <tr>
            <td style="text-align:center;padding:0 40px;">
                <p style="margin:0;font-size:11px;line-height:1.6;">
                    <span style="background-color:#ffffff;color:#6b7280;padding:2px 6px;border-radius:3px;">You're receiving this because you have a ${BRAND.name} account.</span>
                </p>
                <p style="margin:6px 0 0;font-size:11px;line-height:1.6;">
                    <span style="background-color:#ffffff;color:#6b7280;padding:2px 6px;border-radius:3px;">Need help? <a href="mailto:${process.env.GMAIL_USER || 'mail.tasktime@gmail.com'}" style="color:#06b6d4;text-decoration:none;">Contact support</a></span>
                </p>
            </td>
        </tr>
        </table>
    </td></tr>
    </table>

</body>
</html>
`;

/**
 * Send OTP Email
 */
export const sendOtpEmail = async ({ to, otp }) => {
    try {
        const gmailUser = process.env.GMAIL_USER;
        const emailFrom = process.env.EMAIL_FROM || `TASKTIME <${gmailUser}>`;

        const content = `
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${BRAND.colors.text};letter-spacing:-0.02em;">
                Verify your identity
            </h1>
            <p style="margin:0 0 28px;font-size:14px;color:${BRAND.colors.textMuted};line-height:1.6;">
                Enter this code on the verification page to confirm your email address. It expires in <strong style="color:${BRAND.colors.text};">10 minutes</strong>.
            </p>

            <!-- OTP Box -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
                <div style="background-color:${BRAND.colors.card};border:1px solid ${BRAND.colors.borderLight};border-radius:8px;padding:28px 20px;text-align:center;max-width:320px;margin:0 auto;">
                    <p style="margin:0 0 10px;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:${BRAND.colors.textDim};">
                        Verification Code
                    </p>
                    <p style="margin:0;font-size:36px;font-weight:900;letter-spacing:10px;color:${BRAND.colors.primary};padding-left:10px;">
                        ${otp}
                    </p>
                </div>
            </td></tr>
            </table>

            <p style="margin:28px 0 0;font-size:12px;color:${BRAND.colors.textDim};line-height:1.6;">
                If you didn't request this code, you can safely ignore this email. Someone may have entered your email address by mistake.
            </p>
        `;

        const html = getEmailTemplate(content);

        const mailOptions = {
            from: emailFrom,
            to,
            subject: `${otp} is your ${BRAND.name} verification code`,
            html,
        };

        const info = await getTransporter().sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Nodemailer Service Error (sendOtpEmail):", error);
        throw new ApiError(500, "Failed to send verification email");
    }
};

/**
 * Send Password Reset Email
 */
export const sendPasswordResetEmail = async ({ to, resetLink }) => {
    try {
        const gmailUser = process.env.GMAIL_USER;
        const emailFrom = process.env.EMAIL_FROM || `TASKTIME <${gmailUser}>`;

        const content = `
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${BRAND.colors.text};letter-spacing:-0.02em;">
                Reset your password
            </h1>
            <p style="margin:0 0 28px;font-size:14px;color:${BRAND.colors.textMuted};line-height:1.6;">
                We received a request to reset the password for your ${BRAND.name} account. Click the button below to create a new password. This link expires in <strong style="color:${BRAND.colors.text};">15 minutes</strong>.
            </p>

            <!-- CTA Button — matches landing page primary: solid cyan, uppercase, tracking -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:4px 0 28px;">
                <a href="${resetLink}" style="display:inline-block;background-color:${BRAND.colors.primary};color:#000000;padding:14px 32px;border-radius:4px;text-decoration:none;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">
                    Reset Password
                </a>
            </td></tr>
            </table>

            <!-- Security note -->
            <div style="background-color:${BRAND.colors.card};border:1px solid ${BRAND.colors.border};border-radius:8px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0;font-size:12px;color:${BRAND.colors.textDim};line-height:1.6;">
                    <strong style="color:${BRAND.colors.textMuted};">&#128274; Security tip</strong> &mdash; ${BRAND.name} will never ask for your password via email. If you didn't request this, ignore this email.
                </p>
            </div>

            <!-- Fallback link -->
            <p style="margin:0;font-size:11px;color:${BRAND.colors.textDim};line-height:1.6;">
                Button not working? Copy and paste this URL into your browser:<br>
                <a href="${resetLink}" style="color:${BRAND.colors.primary};text-decoration:none;word-break:break-all;font-size:11px;">${resetLink}</a>
            </p>
        `;

        const html = getEmailTemplate(content);

        const mailOptions = {
            from: emailFrom,
            to,
            subject: `${BRAND.name} password reset request`,
            html,
        };

        const info = await getTransporter().sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Nodemailer Service Error (sendPasswordResetEmail):", error);
        throw new ApiError(500, "Failed to send password reset email");
    }
};
