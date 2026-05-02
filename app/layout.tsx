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
        <header
          style={{
            background: "#f5f0e8",
            padding: "32px 24px 24px",
            textAlign: "center",
            borderBottom: "1px solid #e6dcc8",
          }}
        >
          <img
            src="/proof-sleuth-logo.png"
            alt="Proof Sleuth"
            style={{ height: 80, width: "auto", display: "inline-block" }}
          />
          <div
            style={{
              marginTop: 12,
              fontSize: 16,
              lineHeight: 1.4,
              color: "#594734",
              fontStyle: "italic",
            }}
          >
            Where Evidence Tells the Story
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "#5d4932",
            }}
          >
            by New Creations Woodcraft
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
