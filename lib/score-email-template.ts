function resultEmailTemplate(email: string, result: {
  score: number;
  strengths: string[];
  weaknesses: string[];
  summary: string;
}) {
  const { score, strengths, weaknesses, summary } = result;
  const scoreColor = score >= 80 ? "#16a34a" : score >= 60 ? "#ca8a04" : "#dc2626";

  const strengthsList = strengths
    .map((s) => `<li style="margin-bottom:6px;font-size:14px;color:#18181b">${s}</li>`)
    .join("");

  const weaknessesList = weaknesses
    .map((w) => `<li style="margin-bottom:6px;font-size:14px;color:#18181b">${w}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5;margin:0;padding:0}
.c{max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06)}
.h{background:linear-gradient(135deg,#0066FF,#7c3aed);padding:28px 36px;text-align:center}
.h h1{color:#fff;font-size:22px;margin:0 0 4px}
.h p{color:rgba(255,255,255,.8);font-size:14px;margin:0}
.b{padding:28px 36px}
.sc{margin:0 0 28px;text-align:center}
.sc .n{font-size:48px;font-weight:700;color:${scoreColor};line-height:1}
.sc .l{font-size:13px;color:#71717a;margin-top:4px}
.s{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin-bottom:16px}
.s h3{color:#166534;font-size:14px;margin:0 0 8px;text-transform:uppercase;letter-spacing:.5px}
.s ul{list-style:none;padding:0;margin:0}
.w{background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px 20px;margin-bottom:16px}
.w h3{color:#991b1b;font-size:14px;margin:0 0 8px;text-transform:uppercase;letter-spacing:.5px}
.w ul{list-style:none;padding:0;margin:0}
.su{background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px 20px}
.su h3{color:#1e40af;font-size:14px;margin:0 0 8px;text-transform:uppercase;letter-spacing:.5px}
.su p{font-size:14px;color:#1e3a5f;margin:0;line-height:1.6}
.ft{background:#fafafa;padding:16px 36px;text-align:center;font-size:12px;color:#a1a1aa}
</style></head><body>
<div class="c">
<div class="h"><h1>Your CV Score Report</h1><p>We analyzed your CV against industry standards</p></div>
<div class="b">
<div class="sc"><span class="n">${score}</span><div class="l">out of 100</div></div>
<div class="s"><h3>Strengths</h3><ul>${strengthsList}</ul></div>
<div class="w"><h3>Areas to Improve</h3><ul>${weaknessesList}</ul></div>
<div class="su"><h3>Summary</h3><p>${summary}</p></div>
</div>
<div class="ft">Sent to ${email} via easy2apply &middot; ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
</div></body></html>`;
}

export default resultEmailTemplate;
