#!/usr/bin/env python3
"""Render the compiled Field Guide HTML into a paginated 6x9 PDF for print review."""
import os, re
from weasyprint import HTML

ROOT = "/home/user/furniture-id-app/docs/manual"
SRC  = os.path.join(ROOT, "field-guide.html")
OUT  = os.path.join(ROOT, "field-guide.pdf")

html = open(SRC, encoding="utf-8").read()

# print-only overrides: drop the interactive toolbar, let @page own the margins,
# and don't let the cover's screen bleed push it off the page.
override = ("<style>"
            "#bar{display:none!important}"
            "body{padding-top:0!important;background:#fff!important}"
            ".book{padding:0!important;margin:0!important;max-width:none!important;width:auto!important;box-shadow:none!important}"
            ".cover-photo{margin:0!important}"
            "</style></head>")
html = html.replace("</head>", override, 1)

HTML(string=html, base_url=ROOT).write_pdf(OUT)
print("wrote", OUT)
