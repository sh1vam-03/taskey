import 'dotenv/config';
import { sendOtpEmail, sendPasswordResetEmail } from './services/email.service.js';

const testEmails = ['balaji030204@gmail.com', 'l1acker03@gmail.com'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

            await sleep(700); // avoid Resend rate limit (2 req/sec)

            console.log(`--- Testing Password Reset Email for ${email} ---`);
            const resetResult = await sendPasswordResetEmail({
                to: email,
                resetLink: `https://tasktime.app/reset-password/test-token-${email.split('@')[0]}`
            });
            console.log('✅ Password Reset Email Sent:', resetResult);

            await sleep(700); // pause before next email address

        } catch (error) {
            console.error(`❌ Test Failed for ${email}:`, error.message);
        }
    }
}

runTests();
