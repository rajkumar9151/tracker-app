import './globals.css'

export const metadata = {
  title: 'World-Class Tracker',
  description: 'Premium task tracker with Copilot Excel backend',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
