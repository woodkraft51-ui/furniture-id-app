import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proof Sleuth — Antique Furniture ID & Dating",
description: "\"Should I buy it?\" Evidence-based identification, dating, and valuation for American antique furniture. Field Scan for buyers, Full Analysis for depth.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#f5f0e8" }}>
        {children}
      </body>
    </html>
  );
}
