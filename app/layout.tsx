import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NCW Furniture Identification Engine",
  description: "American furniture identification and field scan tool — v0.4",
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
