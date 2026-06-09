#!/usr/bin/env python3
"""Compile the Field Guide markdown into one styled, self-contained HTML file."""
import os, re, html, glob

ROOT = "/home/user/furniture-id-app/docs/manual"
OUT  = os.path.join(ROOT, "field-guide.html")

# ---- reading order ---------------------------------------------------------
SECTIONS = [
    ("PART I — THE METHOD", ["part1-method.md"]),
    ("PART II — THE FORMS · Seating", [
        "phase1b-sample-chapter-windsor.md","chapters/rocking-chair.md","chapters/morris-chair.md",
        "chapters/wing-chair.md","chapters/settee.md","chapters/victorian-sofa.md"]),
    ("Tables", [
        "chapters/parlor-table.md","chapters/drop-leaf-table.md","chapters/gateleg-table.md",
        "chapters/tilt-top-table.md","chapters/pembroke-table.md","chapters/candle-stand.md",
        "chapters/work-table.md"]),
    ("Case and Storage", [
        "chapters/chest-of-drawers.md","chapters/dresser.md","chapters/dressing-table-vanity.md",
        "chapters/washstand.md","chapters/sideboard.md","chapters/china-cabinet.md",
        "chapters/corner-cabinet.md","chapters/hoosier-cabinet.md","chapters/blanket-chest.md",
        "chapters/armoire-wardrobe.md"]),
    ("Desks", ["chapters/slant-front-desk.md","chapters/secretary-desk.md","chapters/roll-top-cylinder-desk.md"]),
    ("Beds", ["chapters/iron-bed.md","chapters/wooden-bedstead.md"]),
    ("Everyday Pieces", ["chapters/telephone-stand.md","chapters/nightstand.md"]),
    ("Clocks", ["chapters/clocks.md"]),
    ("PART III — REFERENCE ATLASES", [
        "atlases/fasteners.md","atlases/joinery.md","atlases/wood-species.md",
        "atlases/hardware-casters.md","atlases/finishes.md","atlases/glossary.md"]),
]

def read(p):
    fp = os.path.join(ROOT, p)
    return open(fp).read() if os.path.exists(fp) else ""

def inline_svg(relpath):
    fp = os.path.join(ROOT, relpath)
    if os.path.exists(fp):
        svg = open(fp).read()
        svg = re.sub(r'<\?xml.*?\?>', '', svg, flags=re.S)
        return f'<div class="plate">{svg}</div>'
    return f'<div class="ph">image: {html.escape(relpath)}</div>'

def mermaid_from_md(relpath):
    txt = read(relpath)
    m = re.search(r'```mermaid\n(.*?)```', txt, re.S)
    if m:
        return f'<pre class="mermaid">{html.escape(m.group(1))}</pre>'
    return f'<div class="ph">diagram: {html.escape(relpath)}</div>'

def strip_chapter(md):
    lines = md.split("\n")
    # drop leading "# Chapter Draft:" / "# Atlas:" / "# Part" / "# Glossary" title + blockquote preamble
    out, i = [], 0
    if lines and re.match(r'^#\s+(Chapter Draft:|Atlas:)', lines[0]):
        i = 1
    # skip leading blockquote block and blank lines
    while i < len(lines) and (lines[i].strip().startswith(">") or lines[i].strip()==""):
        i += 1
    body = "\n".join(lines[i:])
    # cut trailing production sections
    for marker in ["## Illustration list", "## NOTES FOR OWNER", "## Notes on format",
                   "## Illustration needs", "\n---\n---"]:
        idx = body.find(marker)
        if idx != -1:
            body = body[:idx]
    return body.strip()

def repl_placeholder(line):
    s = line.strip().strip("`").strip()
    m = re.match(r'^\[(CATEGORY|ERA BAND|HERO PLATE|VISUAL|LAYOUT)\s*:?\s*(.*)\]$', s, re.S)
    if not m: return None
    kind, val = m.group(1), m.group(2).strip()
    if kind == "CATEGORY":
        return f'<div class="cat">{html.escape(val)}</div>'
    if kind == "ERA BAND":
        return f'<div class="era">{html.escape(val)}</div>'
    if kind == "HERO PLATE":
        return f'<div class="hero">HERO PHOTO TO COME<br><span>{html.escape(val)}</span></div>'
    if kind == "LAYOUT":
        return f'<div class="ph">{html.escape(val)}</div>'
    if kind == "VISUAL":
        mref = re.search(r'([\w/\-.]+\.(?:svg|md))', val)
        if mref:
            ref = mref.group(1)
            if ref.endswith(".svg"): return inline_svg(ref)
            if ref.endswith(".md"):  return mermaid_from_md(ref)
        return f'<div class="ph">{html.escape(val)}</div>'
    return None

# diagrams to drop into each chapter (they are listed only in the stripped illustration tables)
CHAPTER_PLATES = {
    "phase1b-sample-chapter-windsor.md":["diagrams/windsor-back-types.svg"],
    "chapters/rocking-chair.md":["diagrams/rocker-types.svg"],
    "chapters/wing-chair.md":["diagrams/legs-by-period.svg"],
    "chapters/victorian-sofa.md":["diagrams/victorian-sofa-silhouettes.svg"],
    "chapters/gateleg-table.md":["diagrams/turned-leg-types.svg"],
    "chapters/parlor-table.md":["diagrams/table-base-styles.svg"],
    "chapters/drop-leaf-table.md":["diagrams/drop-leaf-supports.svg"],
    "chapters/blanket-chest.md":["diagrams/blanket-chest-feet.svg"],
    "chapters/roll-top-cylinder-desk.md":["diagrams/roll-top-covers.svg"],
    "chapters/wooden-bedstead.md":["diagrams/bedstead-subtypes.svg"],
    "chapters/clocks.md":["diagrams/clock-silhouettes.svg"],
    "chapters/hoosier-cabinet.md":["diagrams/hoosier-anatomy.svg"],
    "atlases/joinery.md":["diagrams/mortise-and-tenon.svg"],
}

# ---- minimal markdown -> html ---------------------------------------------
def inline_md(t):
    t = html.escape(t)
    t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'(?<!\*)\*(?!\s)(.+?)(?<!\s)\*(?!\*)', r'<em>\1</em>', t)
    t = re.sub(r'`(.+?)`', r'<code>\1</code>', t)
    t = re.sub(r'\[(.+?)\]\((.+?)\)', r'<a href="\2">\1</a>', t)
    return t

def md_to_html(md):
    out, i = [], 0
    lines = md.split("\n")
    while i < len(lines):
        line = lines[i]
        s = line.strip()
        # placeholders (own line, possibly backticked)
        ph = repl_placeholder(line)
        if ph is not None:
            out.append(ph); i += 1; continue
        if s == "":
            i += 1; continue
        if s.startswith("```"):
            lang = s[3:].strip()
            block=[]; i+=1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                block.append(lines[i]); i+=1
            i+=1
            if lang=="mermaid":
                out.append(f'<pre class="mermaid">{html.escape(chr(10).join(block))}</pre>')
            else:
                out.append(f'<pre class="code">{html.escape(chr(10).join(block))}</pre>')
            continue
        if re.match(r'^#{1,6}\s', s):
            lvl = len(s) - len(s.lstrip("#"))
            out.append(f'<h{lvl}>{inline_md(s[lvl:].strip())}</h{lvl}>'); i+=1; continue
        if s in ("---","***","___"):
            out.append("<hr>"); i+=1; continue
        if s.startswith(">"):
            buf=[]
            while i<len(lines) and lines[i].strip().startswith(">"):
                buf.append(lines[i].strip()[1:].strip()); i+=1
            out.append(f'<blockquote>{inline_md(" ".join(buf))}</blockquote>'); continue
        # table
        if "|" in s and i+1<len(lines) and re.match(r'^\s*\|?[\s:|-]+\|?\s*$', lines[i+1]) and "-" in lines[i+1]:
            header = [c.strip() for c in s.strip().strip("|").split("|")]
            i+=2; rows=[]
            while i<len(lines) and "|" in lines[i] and lines[i].strip():
                rows.append([c.strip() for c in lines[i].strip().strip("|").split("|")]); i+=1
            th = "".join(f"<th>{inline_md(c)}</th>" for c in header)
            trs = "".join("<tr>"+"".join(f"<td>{inline_md(c)}</td>" for c in r)+"</tr>" for r in rows)
            out.append(f'<table><thead><tr>{th}</tr></thead><tbody>{trs}</tbody></table>'); continue
        # lists
        if re.match(r'^[-*]\s', s):
            items=[]
            while i<len(lines) and re.match(r'^[-*]\s', lines[i].strip()):
                items.append(f'<li>{inline_md(lines[i].strip()[2:])}</li>'); i+=1
            out.append(f'<ul>{"".join(items)}</ul>'); continue
        if re.match(r'^\d+\.\s', s):
            items=[]
            while i<len(lines) and re.match(r'^\d+\.\s', lines[i].strip()):
                itxt = re.sub(r'^\d+\.\s', '', lines[i].strip())
                items.append(f'<li>{inline_md(itxt)}</li>'); i+=1
            out.append(f'<ol>{"".join(items)}</ol>'); continue
        # paragraph
        buf=[line]
        i+=1
        while i<len(lines) and lines[i].strip() and not re.match(r'^(#{1,6}\s|>|[-*]\s|\d+\.\s|```|\|)', lines[i].strip()) and repl_placeholder(lines[i]) is None:
            buf.append(lines[i]); i+=1
        out.append(f'<p>{inline_md(" ".join(b.strip() for b in buf))}</p>')
    return "\n".join(out)

# ---- assemble --------------------------------------------------------------
parts = []
for title, files in SECTIONS:
    parts.append(f'<section class="divider"><h1 class="part">{html.escape(title)}</h1></section>')
    for f in files:
        md = read(f)
        if not md: continue
        body = md_to_html(strip_chapter(md))
        for plate in CHAPTER_PLATES.get(f, []):
            body += inline_svg(plate)
        parts.append(f'<article class="chapter">{body}</article>')

CSS = """
:root{--ink:#3A2E26;--paper:#F5EFE6;--tan:#C9A86A;--teal:#3E6B66;--ox:#9B4B3B}
*{box-sizing:border-box}
body{margin:0;background:#e7ded0;color:var(--ink);font-family:'Lora','Georgia',serif;line-height:1.5}
.book{max-width:6in;margin:0 auto;background:var(--paper);padding:0.7in 0.75in;
  box-shadow:0 0 18px rgba(0,0,0,.18)}
.cover{text-align:center;padding:1.6in 0;border-bottom:3px double var(--tan)}
.cover h1{font-family:'Playfair Display',Georgia,serif;font-size:30px;line-height:1.2;margin:0 0 14px}
.cover .sub{font-style:italic;color:var(--ink);font-size:15px;max-width:4in;margin:0 auto}
.cover .rule{width:60px;height:3px;background:var(--ox);margin:22px auto}
h1,h2,h3{font-family:'Playfair Display',Georgia,serif;line-height:1.2}
.part{text-align:center;font-size:24px;letter-spacing:.04em;color:var(--ink);
  border-top:2px solid var(--tan);border-bottom:2px solid var(--tan);padding:0.5in 0;margin:0}
.divider{page-break-before:always;margin:0.4in 0}
.chapter{page-break-before:always;padding-top:0.2in}
.chapter h1{font-size:25px;margin:.2em 0 .1em}
.chapter h2{font-size:18px;color:var(--ox);border-bottom:1px solid var(--tan);padding-bottom:3px;margin-top:1.4em}
.chapter h3{font-size:15px;margin-top:1.1em}
p{margin:.6em 0}
em{color:#5a4a3c}
code{font-family:'Barlow Semi Condensed',monospace;background:#efe6d6;padding:1px 4px;border-radius:3px;font-size:.92em}
a{color:var(--teal)}
.cat{display:inline-block;background:var(--tan);color:#fff;font-family:'Barlow Semi Condensed',sans-serif;
  letter-spacing:.08em;font-size:11px;padding:3px 10px;border-radius:3px;text-transform:uppercase}
.era{font-family:'Barlow Semi Condensed',monospace;background:#efe6d6;border-left:4px solid var(--teal);
  padding:7px 12px;margin:10px 0;font-size:13px;color:#4a3c30}
.hero{border:2px dashed var(--tan);background:#efe6d6;text-align:center;padding:34px 10px;margin:14px 0;
  color:#8a7a64;font-family:'Barlow Semi Condensed',sans-serif;letter-spacing:.05em;font-size:13px}
.hero span{display:block;font-size:11px;margin-top:6px;color:#a89a82}
.ph{border:1px dashed var(--tan);background:#f1e9da;padding:14px;margin:12px 0;color:#8a7a64;
  font-family:'Barlow Semi Condensed',sans-serif;font-size:12px}
.plate{text-align:center;margin:14px 0}
.plate svg{max-width:100%;height:auto;border:1px solid #e3d6bf}
table{border-collapse:collapse;width:100%;margin:12px 0;font-size:13px}
th{background:var(--ink);color:var(--paper);text-align:left;padding:6px 9px;font-family:'Barlow Semi Condensed',sans-serif}
td{border:1px solid #ddcdb0;padding:6px 9px;vertical-align:top}
tr:nth-child(even) td{background:#efe6d6}
blockquote{border-left:4px solid var(--ox);background:#efe6d6;margin:12px 0;padding:8px 14px;font-style:italic}
ul,ol{margin:.5em 0 .5em 1.2em}
li{margin:.25em 0}
hr{border:none;border-top:1px solid var(--tan);margin:1em 0}
pre.mermaid{background:#efe6d6;border:1px solid #e3d6bf;padding:10px;border-radius:4px;text-align:center}
pre.code{background:#efe6d6;padding:10px;overflow:auto;font-size:12px;border-radius:4px}
@media print{body{background:#fff}.book{box-shadow:none;max-width:none;width:6in}
  #bar{display:none}
  @page{size:6in 9in;margin:0.6in}}
#bar{position:fixed;top:0;left:0;right:0;background:var(--ink);color:var(--paper);
  padding:8px 14px;z-index:999;font-family:'Barlow Semi Condensed',sans-serif;font-size:13px;
  display:flex;gap:10px;align-items:center;box-shadow:0 2px 8px rgba(0,0,0,.25)}
#bar button{background:var(--tan);color:#fff;border:none;padding:6px 12px;border-radius:4px;
  font-size:13px;cursor:pointer;font-family:inherit}
#bar button:hover{background:#b8965a}
#bar .hint{opacity:.85}
.book[contenteditable=true]{outline:2px dashed var(--teal);outline-offset:6px}
body{padding-top:46px}
"""

HTML = f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Field Guide to American Furniture Identification, 1840-1940</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Lora&family=Barlow+Semi+Condensed:wght@400;600&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>
<div id="bar">
  <button onclick="toggleEdit()">&#9998; Edit: <span id="es">off</span></button>
  <button onclick="downloadCopy()">&#11015; Download my edited copy</button>
  <span class="hint">Turn Edit on, click into any text and change it, then Download and send it back.</span>
</div>
<div class="book">
<section class="cover">
  <h1>Field Guide to American Furniture Identification<br>1840&nbsp;&ndash;&nbsp;1940</h1>
  <div class="rule"></div>
  <div class="sub">Spotting, Dating &amp; Valuing the Antiques You&rsquo;ll Actually Find &mdash; Victorian to Art&nbsp;Deco</div>
  <div class="sub" style="margin-top:24px;font-size:12px">New Creations Woodcraft &middot; draft compile</div>
</section>
{''.join(parts)}
</div>
<script type="module">
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
mermaid.initialize({{startOnLoad:true, theme:'base',
  themeVariables:{{primaryColor:'#C9A86A',primaryTextColor:'#3A2E26',lineColor:'#3A2E26',
  primaryBorderColor:'#3A2E26',fontFamily:'Georgia,serif'}}}});
</script>
<script>
function toggleEdit(){{
  var b=document.querySelector('.book');
  var on=b.getAttribute('contenteditable')==='true';
  b.setAttribute('contenteditable', on?'false':'true');
  document.getElementById('es').textContent=on?'off':'ON';
  if(!on) b.focus();
}}
function downloadCopy(){{
  var clone=document.documentElement.cloneNode(true);
  var bk=clone.querySelector('.book'); if(bk) bk.setAttribute('contenteditable','false');
  var es=clone.querySelector('#es'); if(es) es.textContent='off';
  var out='<!doctype html>\\n'+clone.outerHTML;
  var blob=new Blob([out],{{type:'text/html'}});
  var a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='field-guide-edited.html';
  document.body.appendChild(a); a.click(); a.remove();
}}
</script>
</body></html>"""

open(OUT,"w").write(HTML)
print("wrote", OUT, "bytes:", len(HTML))
print("chapters compiled:", HTML.count('class="chapter"'))
