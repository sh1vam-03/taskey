import 'dotenv/config';
import { sendOtpEmail, sendPasswordResetEmail } from './services/nodemailer.service.js';

const testEmails = ['balaji030204@gmail.com', 'l1acker03@gmail.com'];

async function runTests() {
    for (const email of testEmails) {
        console.log(`\n🚀 Starting email tests for: ${email}`);

        try {
            console.log(`--- Testing OTP Email for ${email} ---`);
            const otpResult = await sendOtpEmail({
                to: email,
                otp: Math.floor(100000 + Math.random() * 900000).toString()
            });
            console.log('✅ OTP Email Sent:', otpResult);

            console.log(`--- Testing Password Reset Email for ${email} ---`);
            const resetResult = await sendPasswordResetEmail({
                to: email,
                resetLink: `https://tasktime.app/reset-password/test-token-${email.split('@')[0]}`
            });
            console.log('✅ Password Reset Email Sent:', resetResult);

        } catch (error) {
            console.error(`❌ Test Failed for ${email}:`, error.message);
        }
    }
}

runTests();
