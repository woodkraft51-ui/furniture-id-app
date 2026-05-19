import type { Metadata } from "next";
import Link from "next/link";
import packageJson from "../package.json";

const APP_VERSION = packageJson.version;

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
        {/* Layout-scoped CSS for the brand header. Stacked vertically on
            mobile (< 720px); inline (logo + text side-by-side, text
            block left-aligned next to logo) on desktop. The redundancy
            with the logo's own baked-in tagline is intentional — the
            logo tagline is small and easily missed. */}
        <style>{`
          .ps-header {
            background: #f5f0e8;
            padding: 28px 24px 22px;
            border-bottom: 1px solid #e6dcc8;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }
          .ps-header-logo {
            height: 80px;
            width: auto;
            display: block;
          }
          .ps-header-text {
            text-align: center;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .ps-tagline {
            font-size: 16px;
            line-height: 1.35;
            color: #594734;
            font-style: italic;
          }
          .ps-studio {
            font-size: 13px;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            font-weight: 700;
            color: #5d4932;
          }
          @media (min-width: 720px) {
            .ps-header {
              flex-direction: row;
              justify-content: center;
              align-items: center;
              gap: 24px;
              padding: 24px 24px 20px;
            }
            .ps-header-text {
              text-align: left;
            }
          }
          .ps-footer {
            margin-top: 48px;
            padding: 20px 24px 28px;
            border-top: 1px solid #e6dcc8;
            text-align: center;
            color: #594734;
            font-size: 13px;
            font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
          }
          .ps-footer a {
            color: #594734;
            text-decoration: none;
            border-bottom: 1px solid #b9956a;
            padding-bottom: 1px;
          }
          .ps-footer a:hover {
            color: #1a2e4e;
          }
          .ps-footer-sep {
            display: inline-block;
            margin: 0 10px;
            color: #d9ccb5;
          }
        `}</style>
        <header className="ps-header">
          <img
            src="/proof-sleuth-logo.png"
            alt="Proof Sleuth"
            className="ps-header-logo"
          />
          <div className="ps-header-text">
            <div className="ps-tagline">Where Evidence Tells the Story</div>
            <div className="ps-studio">by New Creations Woodcraft</div>
          </div>
        </header>
        {children}
        <footer className="ps-footer">
          <Link href="/about">About this app</Link>
          <span className="ps-footer-sep">·</span>
          <a
            href="https://newcreationswoodcraft.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            New Creations Woodcraft
          </a>
          <span className="ps-footer-sep">·</span>
          {/* Engine version surfaced so power users (and stress-test
              evaluators) can correlate a given scan output to a specific
              app/engine state. Tied to package.json version so it
              auto-updates on version bumps. */}
          <span style={{ color: "#a08866", fontSize: 12 }}>v{APP_VERSION}</span>
        </footer>
      </body>
    </html>
  );
}
