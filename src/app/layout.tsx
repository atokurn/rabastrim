import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { ClerkProvider } from "@clerk/nextjs";
import { UserSyncProvider } from "@/components/auth/UserSync";

export const metadata: Metadata = {
  title: "Rabastrim - Stream Your Favorite Asian Dramas",
  description: "Watch the latest Asian dramas and movies in HD.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ cssLayerName: 'clerk' }}>
      <html lang="en">
        <body className="antialiased pb-16 md:pb-0 bg-[#111319] text-white">
          <UserSyncProvider>
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <MobileNav />
          </UserSyncProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
