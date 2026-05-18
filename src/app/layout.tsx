import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { auth } from "@/lib/auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SaaS Dashboard",
  description: "Modern SaaS Dashboard Starter",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers session={session}>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
