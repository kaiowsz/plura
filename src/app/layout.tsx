import { DM_Sans } from "next/font/google";
import { DM_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "Plura",
  description: "All in one Agency Solution",
};

const fontSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const fontMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: "400",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={cn(
          "relative h-full font-sans antialiased min-h-screen",
          fontSans.variable,
          fontMono.variable
        )}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange> 
            {children}
            <Toaster richColors />
          </ThemeProvider>
      </body>
    </html>
  );
}