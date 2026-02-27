export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Agency Portal",
  description: "Client onboarding and training portal",
};

// Support both naming conventions
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 
                 process.env.CLERK_PUBLISHABLE_KEY ||
                 "pk_test_Y3VkZGx5LXRocnVzaC04NS5jbGVyay5hY2NvdW50cy5kZXYk"; // fallback

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={clerkKey}>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
