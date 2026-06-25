/** Email-safe hex palette — maps to design tokens without CSS variables */
const C = {
  primary:  "#1e40af",  // oklch(0.38 0.117 255) ≈ blue-800
  gradEnd:  "#4f46e5",  // oklch(0.42 0.19  293) ≈ indigo-600
  text:     "#1e293b",  // oklch(0.21 0.039 266) ≈ slate-800
  body:     "#374151",
  muted:    "#64748b",
  subtle:   "#94a3b8",
  bg:       "#f0f4f8",
  card:     "#ffffff",
  border:   "#e2e8f0",
  codeBg:   "#f1f5f9",
} as const;

const FONT = "Consolas,'Courier New',monospace";

/**
 * Wraps `content` in the Treatcode branded email shell.
 * `content` must be table-compatible HTML — p, table, span; no outer divs.
 */
export function emailHtml(content: string, siteUrl = "https://treat-code.com"): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Treatcode</title>
</head>
<body style="margin:0;padding:0;background-color:${C.bg};">
<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:${C.bg};">
<tr><td align="center" style="padding:40px 16px;">
  <table width="600" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:600px;width:100%;">
    <tr>
      <td style="background-color:${C.primary};background-image:linear-gradient(135deg,${C.primary} 0%,${C.gradEnd} 100%);padding:24px 40px;border-radius:8px 8px 0 0;">
        <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;font-family:${FONT};">Treatcode</span>
      </td>
    </tr>
    <tr>
      <td style="background-color:${C.card};padding:36px 40px 12px;border-left:1px solid ${C.border};border-right:1px solid ${C.border};">
        ${content}
      </td>
    </tr>
    <tr>
      <td style="background-color:${C.card};padding:0 40px 28px;border:1px solid ${C.border};border-top:none;border-radius:0 0 8px 8px;">
        <hr style="border:none;border-top:1px solid ${C.border};margin:24px 0 20px;">
        <p style="margin:0;font-size:12px;line-height:1.6;color:${C.subtle};font-family:${FONT};">
          You received this because you have a Treatcode account. Questions? Reply to this email or visit
          <a href="${siteUrl}" style="color:${C.primary};text-decoration:none;">${siteUrl.replace(/^https?:\/\//, "")}</a>.
        </p>
      </td>
    </tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

/** Inline style constants for content HTML — keeps font-family consistent across functions */
export const s = {
  p:     `margin:0 0 16px;font-size:15px;line-height:1.7;color:#374151;font-family:Consolas,'Courier New',monospace;`,
  pLast: `margin:0;font-size:15px;line-height:1.7;color:#374151;font-family:Consolas,'Courier New',monospace;`,
  label: `padding:8px 20px 8px 0;color:#64748b;font-size:13px;white-space:nowrap;vertical-align:top;font-family:Consolas,'Courier New',monospace;`,
  value: `padding:8px 0;color:#1e293b;font-weight:700;font-size:14px;vertical-align:top;font-family:Consolas,'Courier New',monospace;`,
  code:  `display:inline-block;padding:6px 14px;background-color:#f1f5f9;border-radius:4px;font-family:Consolas,'Courier New',monospace;font-size:17px;font-weight:700;color:#1e293b;letter-spacing:2px;`,
} as const;

/** Table-based CTA button — renders correctly in Outlook as well as modern clients */
export function ctaButton(label: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:24px 0 8px;"><tr><td style="background-color:#1e40af;border-radius:6px;"><a href="${url}" style="display:inline-block;padding:12px 28px;background-color:#1e40af;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:700;font-size:14px;font-family:Consolas,'Courier New',monospace;">${label}</a></td></tr></table>`;
}
