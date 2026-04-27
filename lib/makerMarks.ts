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
  {
  id: "john_henry_belter_label",
  maker: "John Henry Belter",
  mark_text_patterns: ["Belter", "J.H. Belter"],
  mark_type: "paper_label",
  date_range: "1845–1865",
  confidence_weight: 0.98,
  dating_authority: "high",
  notes: "Rococo Revival laminated rosewood furniture maker; labels are rare but definitive."
},
{
  id: "hitchcock_chair_company_label",
  maker: "Hitchcock Chair Company",
  mark_text_patterns: ["Hitchcock", "Hitchcocksville", "Hitchcock Chair Co"],
  mark_type: "stencil",
  date_range: "1820–1880; revival 1940–present",
  confidence_weight: 0.9,
  dating_authority: "moderate",
  notes: "Stencil marks require context to distinguish original vs revival."
},
{
  id: "berkey_and_gay_label",
  maker: "Berkey & Gay",
  mark_text_patterns: ["Berkey & Gay", "Berkey and Gay"],
  mark_type: "paper_label",
  date_range: "1890–1929",
  confidence_weight: 0.95,
  dating_authority: "high",
  notes: "Grand Rapids manufacturer; labels are strong indicators of production era."
},
{
  id: "l_jg_stickley_mark",
  maker: "L. & J.G. Stickley",
  mark_text_patterns: ["L & JG Stickley", "Stickley Fayetteville", "Handcraft"],
  mark_type: "brand",
  date_range: "1900–1916",
  confidence_weight: 0.98,
  dating_authority: "high",
  notes: "True Arts & Crafts Stickley production."
},
{
  id: "stickley_brothers_mark",
  maker: "Stickley Brothers Company",
  mark_text_patterns: ["Stickley Bros", "Stickley Brothers"],
  mark_type: "paper_label",
  date_range: "1891–1950",
  confidence_weight: 0.9,
  dating_authority: "moderate",
  notes: "Separate company from L&JG; often confused."
},
{
  id: "thonet_mark",
  maker: "Thonet",
  mark_text_patterns: ["Thonet", "Gebruder Thonet"],
  mark_type: "stamp",
  date_range: "1850–1930",
  confidence_weight: 0.95,
  dating_authority: "high",
  notes: "Bentwood furniture pioneer; marks vary by factory."
},
{
  id: "wallace_nutting_label",
  maker: "Wallace Nutting",
  mark_text_patterns: ["Wallace Nutting"],
  mark_type: "paper_label",
  date_range: "1900–1941",
  confidence_weight: 0.9,
  dating_authority: "moderate"
},
  {
  id: "herman_miller_label",
  maker: "Herman Miller",
  mark_text_patterns: ["Herman Miller"],
  mark_type: "label",
  date_range: "1923–present",
  confidence_weight: 0.95,
  dating_authority: "high"
},
{
  id: "knoll_label",
  maker: "Knoll",
  mark_text_patterns: ["Knoll", "Knoll Associates"],
  mark_type: "label",
  date_range: "1938–present",
  confidence_weight: 0.95,
  dating_authority: "high"
},
{
  id: "saarinen_label",
  maker: "Eero Saarinen / Knoll",
  mark_text_patterns: ["Saarinen", "Knoll Saarinen"],
  mark_type: "label",
  date_range: "1940–1960",
  confidence_weight: 0.97,
  dating_authority: "high",
  notes: "Designer-linked identification; extremely high value impact."
},
{
  id: "heywood_wakefield_mark",
  maker: "Heywood-Wakefield",
  mark_text_patterns: ["Heywood Wakefield"],
  mark_type: "stamp",
  date_range: "1897–1969",
  confidence_weight: 0.95,
  dating_authority: "high"
},
  {
  id: "kittinger_label",
  maker: "Kittinger Furniture",
  mark_text_patterns: ["Kittinger"],
  mark_type: "label",
  date_range: "1886–present",
  confidence_weight: 0.95,
  dating_authority: "high"
},
{
  id: "baker_furniture_label",
  maker: "Baker Furniture",
  mark_text_patterns: ["Baker Furniture"],
  mark_type: "label",
  date_range: "1890–present",
  confidence_weight: 0.95,
  dating_authority: "high"
},
{
  id: "kindel_furniture_label",
  maker: "Kindel Furniture",
  mark_text_patterns: ["Kindel"],
  mark_type: "label",
  date_range: "1901–present",
  confidence_weight: 0.95,
  dating_authority: "high"
},
{
  id: "karges_furniture_label",
  maker: "Karges Furniture",
  mark_text_patterns: ["Karges"],
  mark_type: "label",
  date_range: "1886–present",
  confidence_weight: 0.95,
  dating_authority: "high"
},
  {
  id: "drexel_heritage_label",
  maker: "Drexel Heritage",
  mark_text_patterns: ["Drexel", "Drexel Heritage"],
  mark_type: "label",
  date_range: "1903–present",
  confidence_weight: 0.9,
  dating_authority: "moderate"
},
{
  id: "broyhill_label",
  maker: "Broyhill Furniture",
  mark_text_patterns: ["Broyhill"],
  mark_type: "label",
  date_range: "1926–present",
  confidence_weight: 0.9,
  dating_authority: "moderate"
},
{
  id: "lane_furniture_label",
  maker: "Lane Furniture",
  mark_text_patterns: ["Lane"],
  mark_type: "stamp",
  date_range: "1912–present",
  confidence_weight: 0.9,
  dating_authority: "moderate"
},
{
  id: "ethan_allen_label",
  maker: "Ethan Allen",
  mark_text_patterns: ["Ethan Allen"],
  mark_type: "label",
  date_range: "1932–present",
  confidence_weight: 0.9,
  dating_authority: "moderate"
},
{
  id: "thomasville_label",
  maker: "Thomasville",
  mark_text_patterns: ["Thomasville"],
  mark_type: "label",
  date_range: "1904–present",
  confidence_weight: 0.9,
  dating_authority: "moderate"
},
  {
  id: "toledo_metal_furniture_label",
  maker: "Toledo Metal Furniture Co.",
  mark_text_patterns: ["Toledo Metal Furniture"],
  mark_type: "stamp",
  date_range: "1920–1960",
  confidence_weight: 0.95,
  dating_authority: "high"
},
];
