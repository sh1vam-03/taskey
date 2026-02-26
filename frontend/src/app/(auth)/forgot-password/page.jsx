import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm"

export const metadata = {
    title: 'Forgot Password | TASKTIME',
    robots: {
        index: false,
        follow: false,
    },
}

export default function ForgotPassword() {
    return <ForgotPasswordForm />
}
