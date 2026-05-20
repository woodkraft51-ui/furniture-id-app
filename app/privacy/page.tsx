import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy — Proof Sleuth",
  description:
    "How Proof Sleuth handles your photos and scan data: analysis is performed by a third-party AI provider, and your scan history is stored locally in your own browser.",
};

const pageStyle: React.CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  padding: "40px 24px 64px",
  color: "#352719",
  fontFamily:
    "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
};

const h2Style: React.CSSProperties = {
  margin: "28px 0 8px",
  fontSize: 18,
  fontWeight: 700,
  color: "#1a2e4e",
};

const pStyle: React.CSSProperties = {
  fontSize: 15.5,
  lineHeight: 1.65,
  color: "#3d3023",
  marginBottom: 12,
};

/**
 * Privacy statement. Describes the actual data flow: photos are relayed
 * through the app's own /api/analyze route to a third-party AI provider
 * (Anthropic) for analysis, and scan history is persisted client-side in
 * the browser (IndexedDB) rather than in a server-side account. This is
 * boilerplate authored for transparency and should be reviewed before a
 * commercial launch.
 */
export default function PrivacyPage() {
  return (
    <main style={pageStyle}>
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
          margin: "0 0 6px",
          fontSize: 30,
          lineHeight: 1.15,
          fontWeight: 700,
          letterSpacing: "-0.01em",
        }}
      >
        Privacy
      </h1>
      <div style={{ fontSize: 13, color: "#8a7c6a", marginBottom: 18 }}>
        Last updated May 20, 2026
      </div>

      <p style={pStyle}>
        Proof Sleuth is designed to keep your data in your hands. This page
        explains what we process when you run a scan and where that data goes.
      </p>

      <h2 style={h2Style}>What you provide</h2>
      <p style={pStyle}>
        When you run a scan you supply photos of a furniture piece and,
        optionally, details such as a wood guess, an asking price, and free-text
        notes. We do not ask for your name, email, or account credentials — the
        app has no login.
      </p>

      <h2 style={h2Style}>How analysis works</h2>
      <p style={pStyle}>
        To generate a reading, your photos and details are sent from your
        browser to our server, which relays them to a third-party AI provider
        (Anthropic, the maker of Claude) for image analysis. We use that
        provider solely to produce your report. Your photos are transmitted for
        the purpose of analysis; handling on the provider&apos;s side is governed
        by Anthropic&apos;s own policies. We do not use your photos to train any
        model, and we do not sell your data or use it for advertising.
      </p>

      <h2 style={h2Style}>Where your scans are stored</h2>
      <p style={pStyle}>
        Your scan history — including the photos and the report — is saved{" "}
        <strong>locally in your own browser</strong> on your device, using
        browser storage (IndexedDB). It is not kept in an account on our
        servers. That means your history is visible only on the device and
        browser you used, and clearing your browser&apos;s site data (or using
        the Delete action on the My Scans page) removes it permanently. We
        cannot recover scans you delete.
      </p>

      <h2 style={h2Style}>Cookies and tracking</h2>
      <p style={pStyle}>
        Proof Sleuth does not use advertising or cross-site tracking cookies.
      </p>

      <h2 style={h2Style}>Contact</h2>
      <p style={pStyle}>
        Questions about privacy? Reach Michael at{" "}
        <a
          href="mailto:michael@newcreationswoodcraft.com"
          style={{ color: "#1a2e4e", borderBottom: "1px solid #b9956a" }}
        >
          michael@newcreationswoodcraft.com
        </a>
        .
      </p>

      <p style={{ ...pStyle, marginTop: 24, fontSize: 14, color: "#6a5845" }}>
        See also our{" "}
        <Link
          href="/terms"
          style={{ color: "#1a2e4e", borderBottom: "1px solid #b9956a" }}
        >
          Terms of Use
        </Link>
        .
      </p>
    </main>
  );
}
