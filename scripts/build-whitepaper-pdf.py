import os
import re
import subprocess
import weasyprint

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MD_FILE = "/Users/vedang/.gemini/antigravity/brain/d8e0523d-8c6b-4440-8112-6fd00000dadf/whitepaper-top100-web3-employers.md"
TEMP_HTML = os.path.join(ROOT, ".next/pandoc_raw.html")
STYLED_HTML = os.path.join(ROOT, ".next/pandoc_weasyprint.html")
PDF_TARGET = os.path.join(ROOT, "public/whitepaper-top100-web3-employers.pdf")

def generate_flowchart_svg():
    return '''<svg width="680" height="260" viewBox="0 0 680 260" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#71717a"/>
    </marker>
  </defs>
  <rect x="20" y="20" width="280" height="42" rx="6" fill="#f4f4f5" stroke="#d4d4d8" stroke-width="1.2"/>
  <text x="160" y="46" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#18181b" text-anchor="middle">Direct ATS Ingestion (Ashby, Greenhouse, Lever)</text>
  <line x1="300" y1="41" x2="350" y2="41" stroke="#71717a" stroke-width="1.5" marker-end="url(#arrow)"/>
  <rect x="356" y="20" width="260" height="42" rx="6" fill="#f4f4f5" stroke="#d4d4d8" stroke-width="1.2"/>
  <text x="486" y="46" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#18181b" text-anchor="middle">Data Validation and Deduplication</text>
  <line x1="486" y1="62" x2="486" y2="100" stroke="#71717a" stroke-width="1.5" marker-end="url(#arrow)"/>
  <polygon points="486,106 606,140 486,174 366,140" fill="#ffffff" stroke="#09090b" stroke-width="1.5"/>
  <text x="486" y="144" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#09090b" text-anchor="middle">Core Business Verification</text>
  <line x1="606" y1="140" x2="660" y2="140" stroke="#ef4444" stroke-width="1.5"/>
  <line x1="660" y1="140" x2="660" y2="200" stroke="#ef4444" stroke-width="1.5" marker-end="url(#arrow)"/>
  <rect x="580" y="206" width="160" height="38" rx="6" fill="#fef2f2" stroke="#fecaca" stroke-width="1.2"/>
  <text x="660" y="230" font-family="Inter, sans-serif" font-size="10.5" font-weight="500" fill="#991b1b" text-anchor="middle">Excluded from Index</text>
  <text x="625" y="132" font-family="Inter, sans-serif" font-size="9" font-weight="600" fill="#ef4444">Non-Web3</text>
  <line x1="366" y1="140" x2="220" y2="140" stroke="#16a34a" stroke-width="1.5" marker-end="url(#arrow)"/>
  <text x="290" y="132" font-family="Inter, sans-serif" font-size="9" font-weight="600" fill="#16a34a">Web3 Native</text>
  <rect x="40" y="119" width="174" height="42" rx="6" fill="#f4f4f5" stroke="#d4d4d8" stroke-width="1.2"/>
  <text x="127" y="145" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#18181b" text-anchor="middle">Compute 4 Component Scores</text>
  <line x1="127" y1="161" x2="127" y2="200" stroke="#71717a" stroke-width="1.5" marker-end="url(#arrow)"/>
  <rect x="20" y="206" width="214" height="38" rx="6" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1.2"/>
  <text x="127" y="230" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#166534" text-anchor="middle">Ranked in Top 100 Employers</text>
  <line x1="234" y1="225" x2="310" y2="225" stroke="#71717a" stroke-width="1.5" marker-end="url(#arrow)"/>
  <rect x="316" y="206" width="200" height="38" rx="6" fill="#f4f4f5" stroke="#d4d4d8" stroke-width="1.2"/>
  <text x="416" y="230" font-family="Inter, sans-serif" font-size="10" font-weight="500" fill="#52525b" text-anchor="middle">1 Job: Ranked Outside Top 100</text>
</svg>'''

def generate_bar_chart_svg(title, labels, values, max_val, unit=""):
    width = 680
    height = 200
    margin_left = 130
    margin_right = 40
    margin_top = 35
    margin_bottom = 20
    chart_width = width - margin_left - margin_right
    row_height = (height - margin_top - margin_bottom) / len(labels)
    svg = [f'<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg">']
    svg.append(f'<text x="{margin_left}" y="20" font-family="Inter, sans-serif" font-size="11.5" font-weight="700" fill="#09090b">{title}</text>')
    for i, (label, val) in enumerate(zip(labels, values)):
        y = margin_top + i * row_height
        bar_len = (val / max_val) * chart_width
        svg.append(f'<text x="{margin_left - 10}" y="{y + row_height * 0.65}" font-family="Inter, sans-serif" font-size="9.5" font-weight="500" fill="#52525b" text-anchor="end">{label}</text>')
        svg.append(f'<rect x="{margin_left}" y="{y + 3}" width="{chart_width}" height="{row_height - 6}" rx="3" fill="#f4f4f5"/>')
        svg.append(f'<rect x="{margin_left}" y="{y + 3}" width="{bar_len}" height="{row_height - 6}" rx="3" fill="#18181b"/>')
        val_str = f"{val}{unit}"
        svg.append(f'<text x="{margin_left + bar_len + 8}" y="{y + row_height * 0.65}" font-family="Inter, sans-serif" font-size="9" font-weight="600" fill="#18181b">{val_str}</text>')
    svg.append('</svg>')
    return '\n'.join(svg)

def build():
    os.makedirs(os.path.dirname(TEMP_HTML), exist_ok=True)
    cmd = ["pandoc", MD_FILE, "-o", TEMP_HTML, "--standalone", "--mathml"]
    subprocess.run(cmd, check=True)
    with open(TEMP_HTML, "r", encoding="utf-8") as f:
        html = f.read()

    chart1_svg = generate_bar_chart_svg("Point Breakdown (100 Points Total)", 
                                        ["Hiring Volume", "Department Diversity", "Remote Friendly", "Salary Listed"], 
                                        [60, 20, 10, 10], 70, " pts")
    chart2_svg = generate_bar_chart_svg("Share of Total Open Jobs by Sector", 
                                        ["Exchanges", "Payments", "Trading", "Security", "AI & DePIN", "DeFi", "Venture", "Infra", "L1 / L2"], 
                                        [35.2, 20.6, 10.2, 8.7, 8.1, 5.2, 3.7, 3.5, 3.0], 40, "%")
    chart3_svg = generate_bar_chart_svg("Remote Job Availability Across Sectors", 
                                        ["Infra", "Security", "L1 / L2", "Web3 Infra", "DeFi", "Exchanges", "AI & DePIN", "Payments", "Trading", "Venture"], 
                                        [77, 76, 39, 50, 43, 42, 42, 33, 6, 5], 100, "%")
    flowchart_svg = generate_flowchart_svg()

    mermaid_blocks = re.findall(r'<pre class="mermaid"><code>[\s\S]*?</code></pre>', html)
    if len(mermaid_blocks) >= 4:
        html = html.replace(mermaid_blocks[0], f'<div class="figure-container">{flowchart_svg}</div>')
        html = html.replace(mermaid_blocks[1], f'<div class="figure-container">{chart1_svg}</div>')
        html = html.replace(mermaid_blocks[2], f'<div class="figure-container">{chart2_svg}</div>')
        html = html.replace(mermaid_blocks[3], f'<div class="figure-container">{chart3_svg}</div>')

    html = re.sub(r'<blockquote>\s*<p>\[!NOTE\]\s*([\s\S]*?)</p>\s*</blockquote>',
                  r'<div class="callout callout-note"><div class="callout-header">Note</div><p>\1</p></div>', html)
    html = re.sub(r'<blockquote>\s*<p>\[!IMPORTANT\]\s*([\s\S]*?)</p>\s*</blockquote>',
                  r'<div class="callout callout-important"><div class="callout-header">Important</div><p>\1</p></div>', html)
    html = re.sub(r'<blockquote>\s*<p>\[!TIP\]\s*([\s\S]*?)</p>\s*</blockquote>',
                  r'<div class="callout callout-tip"><div class="callout-header">Key Analysis</div><p>\1</p></div>', html)

    paged_css = '''
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      @page {
        size: A4 portrait;
        margin: 22mm 16mm 22mm 16mm;
        @top-left {
          content: "Hashtag Web3";
          font-family: 'Inter', sans-serif;
          font-size: 8pt;
          font-weight: 600;
          color: #71717a;
        }
        @top-right {
          content: "The Top 100 Web3 Employers Index";
          font-family: 'Inter', sans-serif;
          font-size: 8pt;
          color: #71717a;
        }
        @bottom-left {
          content: "Research and Methodology";
          font-family: 'Inter', sans-serif;
          font-size: 8pt;
          color: #a1a1aa;
        }
        @bottom-right {
          content: "Page " counter(page) " of " counter(pages);
          font-family: 'Inter', sans-serif;
          font-size: 8pt;
          color: #a1a1aa;
        }
      }
      @page :first {
        margin-top: 18mm;
        @top-left { content: none; }
        @top-right { content: none; }
        @bottom-left { content: none; }
        @bottom-right { content: none; }
      }
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 9.5pt;
        line-height: 1.55;
        color: #18181b;
        background: #ffffff;
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
      }
      h1 {
        font-size: 22pt;
        font-weight: 700;
        color: #09090b;
        margin: 0 0 4pt 0;
        letter-spacing: -0.03em;
        line-height: 1.2;
      }
      h3:first-of-type {
        font-size: 11pt;
        font-weight: 500;
        color: #71717a;
        margin: 0 0 14pt 0;
        line-height: 1.4;
      }
      h2 {
        font-size: 13pt;
        font-weight: 600;
        color: #09090b;
        margin: 20pt 0 8pt 0;
        padding-bottom: 4pt;
        border-bottom: 1px solid #e4e4e7;
        letter-spacing: -0.01em;
        page-break-after: avoid;
      }
      h3:not(:first-of-type) {
        font-size: 10pt;
        font-weight: 600;
        color: #18181b;
        margin: 12pt 0 4pt 0;
        page-break-after: avoid;
      }
      p { margin: 0 0 7pt 0; color: #27272a; }
      ul, ol { margin: 4pt 0 8pt 16pt; padding: 0; }
      li { margin-bottom: 2.5pt; color: #27272a; }
      hr { border: none; border-top: 1px solid #e4e4e7; margin: 14pt 0; }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 10pt 0 14pt 0;
        font-size: 8pt;
        line-height: 1.35;
        page-break-inside: auto;
      }
      thead { display: table-header-group; }
      tr { page-break-inside: avoid; page-break-after: auto; }
      th {
        background-color: #f4f4f5;
        color: #09090b;
        text-align: left;
        padding: 5pt 7pt;
        font-weight: 600;
        border-top: 1px solid #e4e4e7;
        border-bottom: 1.5px solid #d4d4d8;
      }
      td {
        padding: 4.5pt 7pt;
        border-bottom: 1px solid #f4f4f5;
        color: #27272a;
        vertical-align: middle;
      }
      tr:nth-child(even) td { background-color: #fafafa; }
      .callout {
        border-radius: 6pt;
        padding: 8pt 12pt;
        margin: 10pt 0;
        font-size: 9.5pt;
        page-break-inside: avoid;
      }
      .callout-header {
        font-weight: 600;
        font-size: 8pt;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 3pt;
      }
      .callout-note { background: #f4f4f5; border: 1px solid #e4e4e7; color: #27272a; }
      .callout-note .callout-header { color: #71717a; }
      .callout-important { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
      .callout-important .callout-header { color: #dc2626; }
      .callout-tip { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
      .callout-tip .callout-header { color: #15803d; }
      .figure-container {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 12pt 0;
        page-break-inside: avoid;
        background: #ffffff;
      }
      math { font-size: 10pt; }
    </style>
    '''
    html = html.replace('</head>', f'{paged_css}\n</head>')
    with open(STYLED_HTML, "w", encoding="utf-8") as f:
        f.write(html)
    doc = weasyprint.HTML(STYLED_HTML)
    doc.write_pdf(PDF_TARGET)
    print("SUCCESS: PDF compiled at", PDF_TARGET)

if __name__ == "__main__":
    build()
