import ResetPasswordForm from "@/features/auth/components/ResetPasswordForm"

export const metadata = {
    title: 'Reset Password | TASKTIME',
    robots: {
        index: false,
        follow: false,
    },
}

export default function ResetPassword() {
    return <ResetPasswordForm />
}
