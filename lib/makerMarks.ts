// makerMarks.ts

export type MakerMarkEntry = {
  id: string;
  maker: string;
  mark_text_patterns: string[];
  mark_type: "paper_label" | "branded_mark" | "stamp" | "metal_tag" | "decal" | "signature" | "unknown";
  date_range: string;
  confidence_weight: number; // 0–1 scale
  dating_authority: "high" | "moderate" | "low";
  notes?: string;
};

export const MAKER_MARKS: MakerMarkEntry[] = [
  {
    id: "globe_wernicke_paper_label_early",
    maker: "Globe-Wernicke",
    mark_text_patterns: ["Globe Wernicke", "Globe-Wernicke Co"],
    mark_type: "paper_label",
    date_range: "1899–1915",
    confidence_weight: 0.95,
    dating_authority: "high",
    notes: "Early paper label used on sectional bookcases prior to corporate changes.",
  },
  {
    id: "globe_wernicke_stamped_mark_late",
    maker: "Globe-Wernicke",
    mark_text_patterns: ["Globe-Wernicke Co Cincinnati"],
    mark_type: "stamp",
    date_range: "1916–1930",
    confidence_weight: 0.92,
    dating_authority: "high",
    notes: "Later stamped mark following corporate restructuring.",
  },
];
