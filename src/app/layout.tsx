import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
    title: "Ovira AI - Women's Health & Period Tracking",
    description: "AI-powered preventive women's health platform. Track your cycle, log symptoms, and get personalized health insights.",
    keywords: ["women's health", "period tracker", "health AI", "cycle tracking", "symptom logging"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
