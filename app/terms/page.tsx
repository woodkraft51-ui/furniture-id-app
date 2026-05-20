import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use — Proof Sleuth",
  description:
    "Proof Sleuth provides evidence-based readings for informational purposes only — not a certified appraisal. Terms of use and limitation of liability.",
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
 * Terms of Use. The core purpose is the advisory / no-warranty framing:
 * Proof Sleuth produces an evidence-based reading, not a certified appraisal,
 * and the user assumes the risk of any buy/sell/insure decision. This is
 * boilerplate authored for liability protection and should be reviewed by
 * the owner (and ideally counsel) before a commercial launch.
 */
export default function TermsPage() {
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
        Terms of Use
      </h1>
      <div style={{ fontSize: 13, color: "#8a7c6a", marginBottom: 18 }}>
        Last updated May 20, 2026
      </div>

      <p style={pStyle}>
        By using Proof Sleuth you agree to these terms. Please read them — they
        explain what the app does and does not promise.
      </p>

      <h2 style={h2Style}>Advisory only — not a professional appraisal</h2>
      <p style={pStyle}>
        Proof Sleuth produces an <strong>evidence-based reading</strong>{" "}
        generated from the photos and details you provide. It is for
        informational purposes only and is{" "}
        <strong>
          not a certified appraisal, authentication, or guarantee of
          authenticity, age, or value
        </strong>
        . Identifications, dates, and valuations are estimates produced by
        automated analysis and may be incomplete or incorrect. Antique markets
        fluctuate, and condition details visible only in person can materially
        change a piece&apos;s value.
      </p>

      <h2 style={h2Style}>Your decisions are your own</h2>
      <p style={pStyle}>
        You are responsible for any decision you make to buy, sell, insure, or
        otherwise act on a piece. Verify independently before committing money.
        For a binding valuation or authentication, consult a qualified
        professional appraiser — including{" "}
        <a
          href="https://newcreationswoodcraft.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#1a2e4e", borderBottom: "1px solid #b9956a" }}
        >
          New Creations Woodcraft
        </a>
        .
      </p>

      <h2 style={h2Style}>No warranty</h2>
      <p style={pStyle}>
        The service is provided &quot;as is&quot; and &quot;as available,&quot;
        without warranties of any kind, express or implied, including
        merchantability, fitness for a particular purpose, and accuracy.
      </p>

      <h2 style={h2Style}>Limitation of liability</h2>
      <p style={pStyle}>
        To the fullest extent permitted by law, Proof Sleuth and New Creations
        Woodcraft are not liable for any loss or damage — including financial
        loss on a purchase or sale — arising from your use of, or reliance on,
        the app&apos;s output.
      </p>

      <h2 style={h2Style}>Acceptable use</h2>
      <p style={pStyle}>
        Use the app for lawful, personal evaluation of furniture. Do not upload
        content you have no right to share, and do not attempt to disrupt or
        misuse the service.
      </p>

      <h2 style={h2Style}>Changes</h2>
      <p style={pStyle}>
        We may update these terms as the app evolves. Continued use after an
        update means you accept the revised terms.
      </p>

      <h2 style={h2Style}>Contact</h2>
      <p style={pStyle}>
        Questions? Reach Michael at{" "}
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
          href="/privacy"
          style={{ color: "#1a2e4e", borderBottom: "1px solid #b9956a" }}
        >
          Privacy statement
        </Link>
        .
      </p>
    </main>
  );
}
