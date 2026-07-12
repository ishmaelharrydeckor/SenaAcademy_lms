import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { RootThemeProviders } from "@/components/RootThemeProviders";

export const metadata: Metadata = {
  title: "Sena Academy Learning Portal",
  description: "Premium LMS portal for trainees, facilitators, and administrators.",
  icons: {
    icon: "/logo_icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <RootThemeProviders>
        <AuthProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AuthProvider>
      </RootThemeProviders>
    </html>
  );
}
