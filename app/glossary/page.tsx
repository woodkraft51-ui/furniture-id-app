import type { Metadata } from "next";
import Link from "next/link";
import { glossaryByCategory } from "../../lib/glossary";

export const metadata: Metadata = {
  title: "Glossary — Proof Sleuth",
  description:
    "Plain-language definitions of the furniture terms that appear in Proof Sleuth scans — joinery, parts, forms, finishes.",
};

/**
 * Visual glossary — a scannable reference for the domain terms that surface
 * in scan results. Terms are also tappable in-line within results (see
 * app/GlossaryText.tsx); this page is the full, browsable list.
 */
export default function GlossaryPage() {
  const groups = glossaryByCategory();

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
          margin: "0 0 12px",
          fontSize: 30,
          lineHeight: 1.15,
          fontWeight: 700,
          letterSpacing: "-0.01em",
        }}
      >
        Furniture Glossary
      </h1>

      <p style={{ fontSize: 15, lineHeight: 1.6, color: "#3d3023", marginBottom: 28 }}>
        Plain-language definitions of the construction, hardware, form, and
        finish terms that appear in your scans. Wherever one of these words
        shows up in a result, you can tap it to see the same definition inline.
      </p>

      {groups.map(({ category, entries }) => (
        <section key={category} style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#1a2e4e",
              borderBottom: "2px solid #d9ccb5",
              paddingBottom: 6,
              marginBottom: 14,
            }}
          >
            {category}
          </h2>
          <dl style={{ margin: 0 }}>
            {entries.map((e) => (
              <div
                key={e.term}
                style={{
                  padding: "12px 16px",
                  background: "#fff",
                  border: "1px solid #d9ccb5",
                  borderLeft: "3px solid #b9956a",
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              >
                <dt
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#3d2d1f",
                    textTransform: "capitalize",
                    marginBottom: 4,
                  }}
                >
                  {e.term}
                </dt>
                <dd style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#3d3023" }}>
                  {e.definition}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </main>
  );
}
