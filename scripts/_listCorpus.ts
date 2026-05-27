import { SESSION_SCANS } from "../tests/fixtures/sessionScans";

let i = 1;
for (const s of SESSION_SCANS) {
  const a = (s.asSeen ?? {}) as Record<string, unknown>;
  const note = (s.note || "").replace(/\s+/g, " ").trim();
  const first = note.split(". ")[0].slice(0, 160);
  console.log(`${String(i).padStart(2)}. ${s.label}`);
  console.log(
    `     form=${a.formId ?? "?"} | date=${a.dateRange ?? "?"} (${a.dateFloor ?? "?"}/${a.dateCeiling ?? "?"}) | conf=${a.confidence ?? "?"} | styleKind=${a.finalStyleKind ?? "?"}`
  );
  console.log(`     ${first}`);
  i++;
}
console.log("TOTAL", SESSION_SCANS.length);
