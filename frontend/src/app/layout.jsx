import './global.css'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'

export const metadata = {
    title: 'TASKTIME | AI-Powered Task & Schedule Management',
    description: 'Plan smarter, schedule faster, and let AI organize your day automatically.'
}

export default function RootLayout({
    children,
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <AuthProvider>
                    <ToastProvider>
                        {children}
                    </ToastProvider>
                </AuthProvider>
            </body>
        </html>
    )
}
