import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Proof Sleuth",
  description:
    "Proof Sleuth is built by Michael at New Creations Woodcraft, a restoration specialist with decades of hands-on antique furniture work.",
};

/**
 * About page — establishes the authority behind Proof Sleuth so the
 * conditional appraiser-review CTA on the report screen (which fires
 * on conflict notes, value threshold, or user-flagged complexity) feels
 * grounded as a natural extension of an already-credentialed app rather
 * than an opportunistic upsell.
 *
 * Always linkable from the layout footer. Never pushed in-flow.
 */
export default function AboutPage() {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "40px 24px 64px",
        color: "#352719",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <Link
        href="/"
        style={{
          fontSize: 13,
          color: "#594734",
          textDecoration: "none",
          display: "inline-block",
          marginBottom: 16,
        }}
      >
        ← Back to start
      </Link>

      <h1
        style={{
          margin: "0 0 18px",
          fontSize: 30,
          lineHeight: 1.15,
          fontWeight: 700,
          letterSpacing: "-0.01em",
        }}
      >
        About Proof Sleuth
      </h1>

      <div
        style={{
          fontSize: 16,
          lineHeight: 1.65,
          color: "#3d3023",
          marginBottom: 18,
        }}
      >
        Proof Sleuth is built by Michael at New Creations Woodcraft, a
        restoration specialist with decades of hands-on antique furniture
        work. Every dating rule, joinery pattern, finish identifier, and
        maker mark in this app was authored by someone who&apos;s stood at the
        bench. The engine reasons from the evidence; the expertise behind
        it is the appraiser&apos;s.
      </div>

      <div
        style={{
          fontSize: 16,
          lineHeight: 1.65,
          color: "#3d3023",
          marginBottom: 18,
        }}
      >
        Beyond the app, New Creations Woodcraft offers furniture
        restoration, professional valuation services, and a curated
        antiques inventory.
      </div>

      <div
        style={{
          fontSize: 15,
          lineHeight: 1.65,
          color: "#3d3023",
          marginBottom: 24,
        }}
      >
        When the engine isn&apos;t enough, contact Michael directly.
      </div>

      <div
        style={{
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
          alignItems: "center",
          padding: "16px 18px",
          background: "#fff",
          border: "1px solid #d9ccb5",
          borderLeft: "3px solid #1a2e4e",
          borderRadius: 8,
        }}
      >
        <a
          href="https://newcreationswoodcraft.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#1a2e4e",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 15,
            borderBottom: "1px solid #b9956a",
            paddingBottom: 1,
          }}
        >
          Visit New Creations Woodcraft →
        </a>
        <span style={{ color: "#d9ccb5", fontSize: 14 }}>·</span>
        <a
          href="mailto:michael@newcreationswoodcraft.com"
          style={{
            color: "#1a2e4e",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 15,
            borderBottom: "1px solid #b9956a",
            paddingBottom: 1,
          }}
        >
          michael@newcreationswoodcraft.com
        </a>
      </div>
    </main>
  );
}
