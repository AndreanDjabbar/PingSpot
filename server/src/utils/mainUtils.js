export const GITHUB_REPO_URL = process.env.GITHUB_REPO_URL || "";
export const LOGGER_LEVEL = process.env.LOGGER_LEVEL || 'info';
export const PORT = Number(process.env.PORT) || 3000;
export const HOST = process.env.HOST || "0.0.0.0";
export const NODE_ENV = process.env.NODE_ENV || "development";
export const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";
export const REDIS_HOST = process.env.REDIS_HOST || "localhost";
export const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "";
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const EMAIL = process.env.EMAIL_EMAIL || "";
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || "";

import bcrypt from 'bcrypt';
import nodemailer from "nodemailer";

export const responseSuccess = (reply, status = 200, message = "Success", key = null, data = null) => {
    if (key === null || key === undefined) {
        key = "data";
    }
    return reply.code(status).send({
        success: true,
        message: message,
        [key]: data,
    });
};

export const responseError = (reply, status = 400, message, key = null, error = null) => {
    if (key === null || key === undefined) {
        key = "error";
    }
    return reply.code(status).send({
        success: false,
        message: message,
        [key]: error,
    });
};

export const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    } catch (error) {
        throw new Error("Error hashing password: " + error.message);
    }
}

export const comparePassword = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        throw new Error("Error comparing password: " + error.message);
    }
}

export const generateRandomCode = (length = 6) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}

const emailTemplates = {
    register_validation: (verificationLink, userName = 'there') => `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your PingSpot Account</title>
            <!--[if mso]>
            <noscript>
                <xml>
                    <o:OfficeDocumentSettings>
                        <o:PixelsPerInch>96</o:PixelsPerInch>
                    </o:OfficeDocumentSettings>
                </xml>
            </noscript>
            <![endif]-->
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f8fafc; line-height: 1.6;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
                <tr>
                    <td align="center" style="padding: 40px 20px;">
                        <!-- Main Container -->
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); overflow: hidden;">
                            
                            <!-- Header with Gradient -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 30px; text-align: center;">
                                    <!-- Logo Area -->
                                    <div style="margin-bottom: 20px;">
                                        <div style="display: inline-block; width: 60px; height: 60px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; line-height: 60px; text-align: center; backdrop-filter: blur(10px);">
                                            <span style="color: #ffffff; font-size: 24px; font-weight: bold;">P</span>
                                        </div>
                                    </div>
                                    
                                    <!-- Brand Name -->
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                        PingSpot
                                    </h1>
                                    
                                    <!-- Tagline -->
                                    <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 400;">
                                        Welcome to your connected world
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Main Content -->
                            <tr>
                                <td style="padding: 50px 40px;">
                                    <!-- Greeting -->
                                    <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 24px; font-weight: 600; text-align: center;">
                                        Hi ${userName}! 👋
                                    </h2>
                                    
                                    <!-- Welcome Message -->
                                    <p style="margin: 0 0 25px; color: #475569; font-size: 16px; text-align: center; line-height: 1.7;">
                                        Thanks for joining PingSpot! We're excited to have you on board. To get started and secure your account, please verify your email address.
                                    </p>
                                    
                                    <!-- Verification Button -->
                                    <div style="text-align: center; margin: 35px 0;">
                                        <a href="${verificationLink}" 
                                        style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: all 0.3s ease; text-align: center; min-width: 200px;">
                                            Verify My Account
                                        </a>
                                    </div>
                                    
                                    <!-- Alternative Link -->
                                    <div style="margin: 30px 0; padding: 20px; background-color: #f1f5f9; border-radius: 12px; border-left: 4px solid #667eea;">
                                        <p style="margin: 0 0 10px; color: #475569; font-size: 14px; font-weight: 600;">
                                            Button not working?
                                        </p>
                                        <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                                            Copy and paste this link into your browser:
                                        </p>
                                        <p style="margin: 8px 0 0; word-break: break-all;">
                                            <a href="${verificationLink}" style="color: #667eea; text-decoration: none; font-size: 14px;">
                                                ${verificationLink}
                                            </a>
                                        </p>
                                    </div>
                                    
                                    <!-- Security Note -->
                                    <div style="margin: 30px 0; text-align: center;">
                                        <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                                            🔒 This link will expire in 5 minutes for your security.<br>
                                            If you didn't create an account, you can safely ignore this email.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                                    <!-- Social Links -->
                                    <div style="margin-bottom: 20px;">
                                        <a href="#" style="display: inline-block; margin: 0 10px; width: 36px; height: 36px; background-color: #667eea; border-radius: 50%; line-height: 36px; text-decoration: none;">
                                            <span style="color: #ffffff; font-size: 16px;">f</span>
                                        </a>
                                        <a href="#" style="display: inline-block; margin: 0 10px; width: 36px; height: 36px; background-color: #667eea; border-radius: 50%; line-height: 36px; text-decoration: none;">
                                            <span style="color: #ffffff; font-size: 16px;">t</span>
                                        </a>
                                        <a href="#" style="display: inline-block; margin: 0 10px; width: 36px; height: 36px; background-color: #667eea; border-radius: 50%; line-height: 36px; text-decoration: none;">
                                            <span style="color: #ffffff; font-size: 16px;">in</span>
                                        </a>
                                    </div>
                                    
                                    <!-- Company Info -->
                                    <p style="margin: 0 0 10px; color: #64748b; font-size: 14px;">
                                        © 2025 PingSpot. All rights reserved.
                                    </p>
                                    
                                    <!-- Contact Info -->
                                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                        Questions? Contact us at 
                                        <a href="mailto:support@pingspot.com" style="color: #667eea; text-decoration: none;">
                                            support@pingspot.com
                                        </a>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `,
};

export const sendEmail = async (email, context="register_validation", verificationLink) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: EMAIL,
            pass: EMAIL_PASSWORD,
        },
    });
    const mailOptions = {
        from: EMAIL,
        to: email,
        subject: "Verify Your PingSpot Account",
        html: emailTemplates[context](verificationLink) || emailTemplates.register_validation(verificationLink),
    };
    try {
        await transporter.sendMail(mailOptions);
        return [true, null];
    }
    catch (error) {
        throw new AppError(`Failed to send email: ${error.message}` || "Failed to send email", 500);
    }
}

export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
