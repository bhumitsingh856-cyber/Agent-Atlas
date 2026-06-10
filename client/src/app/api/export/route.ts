import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
export async function POST(req: Request) {
  const browser = await puppeteer.launch();
  try {
    const { html, filename } = await req.json();
    const page = await browser.newPage();
    await page.setContent(`
            <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #1a1a1a;
        background: white;
        max-width: 900px;
        margin: 0 auto;
        padding: 2rem;
      }
      h1 {
        font-size: 2.25rem;
        font-weight: 700;
        margin-top: 2rem;
        margin-bottom: 1rem;
        color: #111;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 0.5rem;
      }
      h2 {
        font-size: 1.875rem;
        font-weight: 700;
        margin-top: 1.75rem;
        margin-bottom: 0.75rem;
        color: #111;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 0.5rem;
      }
      h3 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
        color: #111;
      }
      h4 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-top: 1.25rem;
        margin-bottom: 0.5rem;
        color: #111;
      }
      p {
        font-size: 1rem;
        line-height: 1.625;
        margin-bottom: 1rem;
        color: rgba(17, 17, 17, 0.9);
      }
      code {
        background: #f3f4f6;
        padding: 0.125rem 0.375rem;
        border-radius: 0.25rem;
        font-family: 'Courier New', monospace;
        font-size: 0.875rem;
        color: #111;
      }
      pre {
        background: #1f2937;
        color: #10b981;
        padding: 1rem;
        border-radius: 0.5rem;
        overflow-x: auto;
        margin: 1.5rem 0;
        font-size: 0.875rem;
        line-height: 1.5;
      }
      pre code {
        background: transparent;
        padding: 0;
        color: inherit;
        font-size: inherit;
      }
      .code-block-wrapper {
        margin: 1.5rem 0;
        border-radius: 0.5rem;
        border: 1px solid #e5e7eb;
        overflow: hidden;
      }
      .code-block-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(243, 244, 246, 0.5);
        padding: 0.5rem 1rem;
        border-bottom: 1px solid #e5e7eb;
      }
      .code-lang {
        font-family: 'Courier New', monospace;
        font-size: 0.75rem;
        color: #6b7280;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 1.5rem 0;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        overflow: hidden;
        font-size: 0.875rem;
      }
      thead {
        background: rgba(243, 244, 246, 0.5);
        border-bottom: 1px solid #e5e7eb;
      }
      th {
        padding: 0.75rem 1rem;
        text-align: left;
        font-weight: 600;
        color: #111;
        border-bottom: 1px solid #e5e7eb;
      }
      td {
        padding: 0.75rem 1rem;
        color: rgba(17, 17, 17, 0.9);
        border-bottom: 1px solid #e5e7eb;
      }
      blockquote {
        border-left: 4px solid #3b82f6;
        background: rgba(59, 130, 246, 0.05);
        padding: 0.75rem 1rem;
        margin: 1rem 0;
        border-radius: 0 0.5rem 0.5rem 0;
        color: rgba(17, 17, 17, 0.8);
        font-style: italic;
      }
      .mermaid {
        background: white;
        border-radius: 0.5rem;
        border: 1px solid #e5e7eb;
        overflow: auto;
      }
      img {
        max-height: 24rem;
        height: auto;
        max-width: 100%;
        border-radius: 0.5rem;
        display: block;
      }
      .image-wrapper {
        margin: 1.5rem 0;
        border-radius: 0.5rem;
        border: 1px solid #e5e7eb;
        overflow: hidden;
        background: rgba(243, 244, 246, 0.3);
      }
      .image-caption {
        font-size: 0.875rem;
        color: #6b7280;
        text-align: center;
        font-style: italic;
        padding: 0.5rem;
      }
      ul, ol {
        margin-left: 1.5rem;
        margin-bottom: 1rem;
      }
      li {
        margin-bottom: 0.5rem;
        color: rgba(17, 17, 17, 0.9);
      }
      a {
      
        color: #2563eb;
        text-decoration: none;
        font-weight: 500;
      }
      a:hover {

        text-decoration: underline;
      }
      strong {
        font-weight: 700;
        color: #111;
      }
      em {
        font-style: italic;
        color: rgba(17, 17, 17, 0.9);
      }
      hr {
        margin: 1.5rem 0;
        border: none;
        border-top: 1px solid #e5e7eb;
      }
    </style>
  </head>
  <body>
    <svg height="60" viewBox="0 0 265 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="atlasGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06B6D4" />
      <stop offset="50%" stop-color="#3B82F6" />
      <stop offset="100%" stop-color="#8B5CF6" />
    </linearGradient>
  </defs>

  <g stroke="currentColor" stroke-width="2">
    <circle cx="20" cy="30" r="4" />
    <circle cx="40" cy="15" r="4" />
    <circle cx="40" cy="45" r="4" />
    <circle cx="60" cy="30" r="4" />
    <line x1="20" y1="30" x2="40" y2="15" />
    <line x1="20" y1="30" x2="40" y2="45" />
    <line x1="40" y1="15" x2="60" y2="30" />
    <line x1="40" y1="45" x2="60" y2="30" />
  </g>

  <text x="85" y="38" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" fill="currentColor">
    AGENT
  </text>

  <!-- Use gradient directly with fill attribute, not url reference -->
  <text x="160" y="38" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" fill="url(#atlasGradient)">
    ATLAS
  </text>
</svg>
    <h1>${filename}</h1>
        <p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 2rem;">
          Generated on ${new Date().toLocaleString()}
        </p>
    ${html}
    <script>
      mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
        securityLevel: 'strict'
      });
    </script>
  </body>
</html>
            `);

    await page.waitForSelector(".mermaid svg");
    const pdf = await page.pdf({
      format: "a4",
      margin: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
      printBackground: true,
      preferCSSPageSize: true,
    });
    await browser.close();
    if (!pdf) {
      return NextResponse.json({ success: false });
    }
    return new NextResponse(pdf as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
      },
    });
  } catch (e) {
    console.log(e);
    await browser.close();
    return NextResponse.json({ error: true });
  }
}
