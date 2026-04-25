import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proof Sleuth — Where Evidence Tells the Story",
description: "Evidence-based American furniture identification and evaluation with field scan and full analysis modes.",
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
