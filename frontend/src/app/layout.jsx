import './global.css'
import { AuthProvider } from '@/context/AuthContext'

export const metadata = {
    title: 'Taskey | Neural Task Orchestration',
    description: 'Automating human cognitive throughput via adaptive intelligence protocols.',
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
