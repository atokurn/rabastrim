import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cari - Rabastrim",
    description: "Cari drama, film, dan anime favorit kamu",
};

/**
 * Search page has its own layout to hide the global navbar on mobile
 * because mobile search is fullscreen with its own back button/search input
 */
export default function SearchLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {/* 
        Hide navbar and mobile nav on this page for mobile
        They're controlled via CSS in globals.css
        On desktop, the navbar is still visible via the root layout
      */}
            {children}
        </>
    );
}
