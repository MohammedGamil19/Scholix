import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Scholix | سكوليكس - بوابتك للدراسة في الخارج",
  description:
    "مهمتنا هي مساعدتك وتقديم الدعم لتجهيز ملفاتك وفحصها وترتيبها بالشكل الصحيح لنرفع احتمالية قبولك بالمنحة.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="font-cairo bg-brand-cream text-gray-700 antialiased min-h-screen flex flex-col">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
