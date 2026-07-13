# Sample Teaching Diagram: Period or Reproduction?

> A sample, to judge the kind of teaching diagram Claude can build directly. This one is a
> decision tree the reader can run on almost any piece. It is written in Mermaid, which
> **renders as an actual flowchart when you view this file on GitHub** (and exports to clean
> vector art for the printed book). It is fully editable, so you keep it, tweak it, or swap it.
>
> If you like this, it becomes a recurring feature: the same "stack the tells" logic, returning
> in different chapters as a tree, a table, and a callback. That is the rule-of-three at work.

```mermaid
flowchart TD
  A["Look the whole piece over"] --> B{"Phillips-head screws, or modern round<br/>wire nails, in structural joints?"}
  B -- "Yes" --> R["A modern part is present.<br/>Treat as a reproduction or a later<br/>repair until proven otherwise."]
  B -- "No" --> C{"Joinery: hand-fitted and wedged,<br/>or machine-perfect with dowels,<br/>staples, and glue alone?"}
  C -- "Machine-perfect" --> R
  C -- "Hand-fitted" --> D{"Tool marks: shallow drawknife and<br/>saw facets, or glassy machine-sanded<br/>and identical parts?"}
  D -- "Machine-sanded" --> R
  D -- "Hand facets" --> E{"Surface: an original layered finish<br/>with honest wear and fine crazing?"}
  E -- "No. Flat modern coat,<br/>printed decal, or stripped bare" --> F["Refinished or reproduction.<br/>Value is reduced, but the form<br/>can still be genuine. Look closer."]
  E -- "Yes" --> G["Stack the tells: three or more signs<br/>of hand work and honest age,<br/>and no clearly modern sign."]
  G --> H["Likely a period piece.<br/>Confirm with the underside,<br/>secondary woods, and any maker marks."]
```

## Notes on format
- **Mermaid** (above) is best for decision trees and flowcharts. Renders on GitHub now, exports to vector art for print.
- **Tables and matrices**: plain Markdown or HTML, clean and simple.
- **Construction line diagrams** (a hand-cut versus machine dovetail, the three nail types, a wedged socket joint): I hand-build these as **SVG** vector art. Schematic and clear, not fine shaded illustration. Editable, keep or swap.
- Photoreal art is the one thing I cannot make. That is where your own photos carry the load.
