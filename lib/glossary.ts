/**
 * Visual glossary — single source of truth for furniture domain terms.
 *
 * Consumed by the standalone /glossary page and by the GlossaryText
 * component, which wraps recognized terms in scan results so they become
 * tappable. Pure data module — no React.
 */

export type GlossaryCategory = "Joinery" | "Parts & Hardware" | "Forms" | "Finishes & Materials";

export type GlossaryEntry = {
  term: string;
  definition: string;
  category: GlossaryCategory;
  // Other surface forms / plurals that should also be tappable.
  aliases?: string[];
};

export const GLOSSARY: GlossaryEntry[] = [
  // ── Joinery ───────────────────────────────────────────────────────────
  {
    term: "dovetail",
    category: "Joinery",
    aliases: ["dovetails", "dovetailed", "dovetail joint"],
    definition:
      "An interlocking joint of fan-shaped 'tails' and 'pins', most often seen at drawer corners. Hand-cut dovetails (irregular, few in number) suggest pre-1860s work; uniform machine-cut dovetails point to later factory production.",
  },
  {
    term: "mortise and tenon",
    category: "Joinery",
    aliases: ["mortise-and-tenon", "mortise", "tenon", "mortise & tenon"],
    definition:
      "A strong frame joint where a projecting tongue (tenon) fits into a matching cavity (mortise). The backbone of chairs, tables, and case frames for centuries.",
  },
  {
    term: "dowel",
    category: "Joinery",
    aliases: ["dowels", "doweled", "dowel joint"],
    definition:
      "A round wooden peg used to align and reinforce a joint. Machine-set dowel joints became common in factory furniture after roughly 1900.",
  },
  {
    term: "tongue and groove",
    category: "Joinery",
    aliases: ["tongue-and-groove", "tongue & groove"],
    definition:
      "Boards joined by a protruding edge (tongue) fitting into a matching slot (groove), used for backboards, panels, and flooring.",
  },
  {
    term: "rabbet",
    category: "Joinery",
    aliases: ["rabbeted", "rebate"],
    definition:
      "A stepped recess cut along the edge of a board so another piece can seat into it — common where a back panel meets a case.",
  },

  // ── Parts & Hardware ─────────────────────────────────────────────────
  {
    term: "spindle",
    category: "Parts & Hardware",
    aliases: ["spindles", "spindle-back"],
    definition:
      "A slender turned rod, most familiar as the vertical rods in a chair back. Spindle construction spans many eras, so it helps define the form more than the date.",
  },
  {
    term: "escutcheon",
    category: "Parts & Hardware",
    aliases: ["escutcheons"],
    definition:
      "The decorative plate framing a keyhole or surrounding a drawer pull. Material and style can help date hardware.",
  },
  {
    term: "caster",
    category: "Parts & Hardware",
    aliases: ["casters", "castor", "castors"],
    definition:
      "A small wheel mounted under a leg or foot. Brass-cup, porcelain, and pressed-steel casters each point to different production periods.",
  },
  {
    term: "stretcher",
    category: "Parts & Hardware",
    aliases: ["stretchers"],
    definition:
      "A horizontal rail connecting and bracing the legs of a chair or table.",
  },
  {
    term: "apron",
    category: "Parts & Hardware",
    aliases: ["aprons", "skirt"],
    definition:
      "The structural panel running beneath a tabletop or seat between the legs.",
  },
  {
    term: "splat",
    category: "Parts & Hardware",
    aliases: ["splats", "back splat"],
    definition:
      "The central flat upright panel in a chair back, often shaped or pierced as a style indicator.",
  },

  // ── Forms ────────────────────────────────────────────────────────────
  {
    term: "gate-leg",
    category: "Forms",
    aliases: ["gate leg", "gateleg", "gate-leg table"],
    definition:
      "A drop-leaf table whose hinged leaves are supported by swing-out legs that pivot like a gate.",
  },
  {
    term: "drop-leaf",
    category: "Forms",
    aliases: ["drop leaf", "drop-leaf table"],
    definition:
      "A table with hinged leaves that fold down at the sides to save space.",
  },
  {
    term: "secretary",
    category: "Forms",
    aliases: ["secretary desk", "secretaire"],
    definition:
      "A tall case piece combining a fall-front or slant-front writing surface over drawers, often with a bookcase above.",
  },
  {
    term: "highboy",
    category: "Forms",
    aliases: ["high boy", "tallboy"],
    definition:
      "A tall chest of drawers mounted on a separate legged base — a distinctly 18th-century American form.",
  },
  {
    term: "blanket chest",
    category: "Forms",
    aliases: ["blanket box", "dower chest"],
    definition:
      "A lidded storage box for linens and blankets, often with a till (small interior compartment).",
  },

  // ── Finishes & Materials ─────────────────────────────────────────────
  {
    term: "veneer",
    category: "Finishes & Materials",
    aliases: ["veneers", "veneered"],
    definition:
      "A thin layer of decorative wood glued over a sturdier substrate. Thick hand-sawn veneer suggests earlier work; very thin, uniform veneer points to modern production.",
  },
  {
    term: "patina",
    category: "Finishes & Materials",
    aliases: [],
    definition:
      "The mellow surface character that age and use give to wood, finish, and metal — color, sheen, and wear that are hard to fake and support authenticity.",
  },
  {
    term: "shellac",
    category: "Finishes & Materials",
    aliases: [],
    definition:
      "A traditional finish made from a resin secreted by the lac insect, common before mid-20th-century lacquers and polyurethanes.",
  },
  {
    term: "turned",
    category: "Finishes & Materials",
    aliases: ["turning", "lathe-turned"],
    definition:
      "Shaped on a lathe — the symmetrical profiles seen in legs, spindles, and finials. Used continuously for centuries, so it rarely pins a date on its own.",
  },
  {
    term: "secondary wood",
    category: "Finishes & Materials",
    aliases: ["secondary woods"],
    definition:
      "The less expensive wood used for hidden parts (drawer sides, backboards, bottoms). Which species was used can point to a region and period.",
  },
];

// Longest terms/aliases first so multi-word terms win over their substrings
// when scanning text (e.g. "mortise and tenon" before "tenon").
const MATCHERS: Array<{ surface: string; entry: GlossaryEntry }> = GLOSSARY.flatMap(
  (entry) => [entry.term, ...(entry.aliases || [])].map((surface) => ({ surface, entry }))
).sort((a, b) => b.surface.length - a.surface.length);

export function lookupTerm(surface: string): GlossaryEntry | null {
  const s = surface.trim().toLowerCase();
  const m = MATCHERS.find((x) => x.surface.toLowerCase() === s);
  return m ? m.entry : null;
}

export type TextSegment =
  | { type: "text"; value: string }
  | { type: "term"; value: string; entry: GlossaryEntry };

/**
 * Split a string into plain-text and glossary-term segments. Each distinct
 * term is linked at most once (its first occurrence) to avoid turning a
 * paragraph into a sea of links. Matching is case-insensitive and
 * word-boundary aware.
 */
export function segmentText(text: string): TextSegment[] {
  const input = String(text || "");
  if (!input) return [{ type: "text", value: "" }];

  type Hit = { start: number; end: number; surface: string; entry: GlossaryEntry };
  const hits: Hit[] = [];
  const usedTerms = new Set<string>();
  const claimed: Array<[number, number]> = [];

  const overlaps = (s: number, e: number) =>
    claimed.some(([cs, ce]) => s < ce && e > cs);

  for (const { surface, entry } of MATCHERS) {
    if (usedTerms.has(entry.term)) continue;
    const re = new RegExp(`\\b${surface.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    const m = re.exec(input);
    if (!m) continue;
    const start = m.index;
    const end = start + m[0].length;
    if (overlaps(start, end)) continue;
    hits.push({ start, end, surface: m[0], entry });
    claimed.push([start, end]);
    usedTerms.add(entry.term);
  }

  if (hits.length === 0) return [{ type: "text", value: input }];

  hits.sort((a, b) => a.start - b.start);
  const segments: TextSegment[] = [];
  let cursor = 0;
  for (const h of hits) {
    if (h.start > cursor) segments.push({ type: "text", value: input.slice(cursor, h.start) });
    segments.push({ type: "term", value: input.slice(h.start, h.end), entry: h.entry });
    cursor = h.end;
  }
  if (cursor < input.length) segments.push({ type: "text", value: input.slice(cursor) });
  return segments;
}

export function glossaryByCategory(): Array<{ category: GlossaryCategory; entries: GlossaryEntry[] }> {
  const order: GlossaryCategory[] = ["Joinery", "Parts & Hardware", "Forms", "Finishes & Materials"];
  return order.map((category) => ({
    category,
    entries: GLOSSARY.filter((e) => e.category === category).sort((a, b) => a.term.localeCompare(b.term)),
  }));
}
