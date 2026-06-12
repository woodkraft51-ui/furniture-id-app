#!/usr/bin/env python3
"""Render the compiled Field Guide HTML into a paginated 6x9 PDF for print review."""
import os, re
from weasyprint import HTML

ROOT = "/home/user/furniture-id-app/docs/manual"
SRC  = os.path.join(ROOT, "field-guide.html")
OUT  = os.path.join(ROOT, "field-guide.pdf")

html = open(SRC, encoding="utf-8").read()

# print-only overrides: drop the interactive toolbar, let @page own the margins,
# keep images/tables whole and within a single page, and lay out divider pages.
override = ("<style>"
            "#bar{display:none!important}"
            "body{padding-top:0!important;background:#fff!important}"
            ".book{padding:0!important;margin:0!important;max-width:none!important;width:auto!important;box-shadow:none!important}"
            # full-bleed cover on its own zero-margin page (art is already 2:3 = 6x9)
            "@page cover{margin:0;size:6in 9in}"
            ".cover-photo{page:cover;margin:0!important}"
            ".cover-photo img{width:6in!important;height:9in!important;display:block}"
            # no image or table may split across pages or exceed one page
            ".plate{break-inside:avoid;page-break-inside:avoid;text-align:center;margin:14px auto}"
            ".plate img,.plate svg{max-width:100%!important;max-height:7.4in!important;width:auto!important;height:auto!important}"
            "table{break-inside:avoid;page-break-inside:avoid}"
            "tr{break-inside:avoid}"
            "h1,h2,h3{break-after:avoid;page-break-after:avoid}"
            "li{break-inside:avoid}"
            # part-divider: its own page, title set into the upper third
            ".divider{page-break-before:always;page-break-after:always;"
            "min-height:7.4in;padding-top:2.8in;margin:0}"
            # contents: compact so the whole TOC fits one page
            ".contents{page-break-after:always;padding-top:.05in!important}"
            ".contents h1{font-size:19px!important;margin:0 0 .3em!important;padding-bottom:.12em!important}"
            "ul.toc{line-height:1.2!important}"
            "ul.toc li{margin:0!important}"
            "li.toc-part{margin-top:.28em!important;font-size:12px!important;break-after:avoid;page-break-after:avoid}"
            "li.toc-chap{font-size:10.5px!important;padding-left:16px!important}"
            "</style></head>")
html = html.replace("</head>", override, 1)

HTML(string=html, base_url=ROOT).write_pdf(OUT)
print("wrote", OUT)
