import './global.css'
import { AuthProvider } from '@/features/auth/context/AuthContext'

export const metadata = {
    title: 'Taskey',
    description: 'Organize Your Life',
}

export default function RootLayout({
    children,
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    )
}
