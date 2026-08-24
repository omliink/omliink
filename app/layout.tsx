import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'

const geist = Geist({ subsets: ['latin'] })
const geist_mono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OMLIINK — La plateforme de confiance entre particuliers',
  description: '100% légal, 100% vérifié, 100% confiance. Connectez-vous avec des particuliers de confiance sur OMLIINK.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${geist.className} ${geist_mono.className}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}