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

          /* Print rules — invoked by the "Print / Save as PDF" button on
             any report screen via window.print(). The button calls the
             browser-native print dialog; on desktop the user picks
             "Save as PDF" as the destination, on iOS Safari it surfaces
             "Save to Files" with PDF as the format, on Android Chrome
             same flow via "Save as PDF". No external library needed. */
          @media print {
            /* Hide every interactive / non-report element. The form,
               upload buttons, run buttons, upsell cards, trace report,
               back-to-start link, and layout footer all carry .no-print
               so they vanish in print output. */
            .no-print { display: none !important; }

            /* Show elements that should ONLY appear in print (the
               scan-metadata header injected at the top of the report
               area to give the PDF context: scan ID, date, mode). */
            .print-only { display: block !important; }

            /* Default-hidden state for print-only elements (overridden
               above when in print media). */

            /* Preserve background colors and borders in print. Browsers
               default to stripping these for ink/toner economy; for an
               evidence-driven report the brand palette + colored borders
               carry meaning (gold-left = upsell, navy-left = appraiser CTA,
               cream = recommendation card). */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }

            /* Body cleanup — solid background, no extra padding */
            body { background: #fff !important; }

            /* Page setup: letter-size with sensible margins */
            @page {
              size: letter;
              margin: 0.55in 0.65in;
            }

            /* SectionCard page-break discipline: avoid splitting a single
               card across pages where possible. Long sections (e.g., the
               Analysis Summary narrative) may still split — that's fine. */
            .section-card { page-break-inside: avoid; }

            /* Keep brand header from being repeated unnecessarily;
               browser will print it once at the top of page 1. */
            .ps-header {
              padding: 12px 16px !important;
              border-bottom: 1px solid #1a2e4e !important;
            }
            .ps-header-logo { height: 50px !important; }
          }

          /* Print-only elements: hidden in screen view by default; the
             @media print rule above flips them to display:block. */
          .print-only { display: none; }
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
        <footer className="ps-footer no-print">
          <Link href="/about">About this app</Link>
          <span className="ps-footer-sep">·</span>
          <Link href="/scans">My Scans</Link>
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
