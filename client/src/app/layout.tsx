import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "",
    description: "",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="h-full">
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@800&display=swap" rel="stylesheet" />
            </head>
            <body
                className="h-full overflow-x-hidden"
            >
                {children}
            </body>
        </html>
    );
}
