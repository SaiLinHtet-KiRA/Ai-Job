import { NextRequest, NextResponse } from "next/server";

// GET /api/digest/preview?user_id=xxx — preview the email digest that would be sent
// Mock now, Resend later
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id");

  if (!userId) {
    return NextResponse.json({ error: "user_id is required." }, { status: 400 });
  }

  // Mock digest data
  const digest = {
    subject: "🎯 5 new jobs match your profile — review & apply",
    preview_text: "Frontend Developer at CloudBase (85% match), Full Stack Developer at StartupHub (72% match)...",
    html: generateDigestHTML(),
    send_to: "user@example.com",
    status: "preview",
  };

  return NextResponse.json(digest);
}

function generateDigestHTML(): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f5f7fa; margin: 0; padding: 40px 20px; }
    .container { max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #0a2540; padding: 32px; text-align: center; }
    .header h1 { color: white; font-size: 20px; margin: 0; }
    .header p { color: #8898aa; font-size: 13px; margin-top: 8px; }
    .content { padding: 32px; }
    .job { border: 1px solid #e6ebf1; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .job-title { font-size: 15px; font-weight: 600; color: #0a2540; }
    .job-meta { font-size: 12px; color: #8898aa; margin-top: 4px; }
    .match-badge { display: inline-block; background: #d1fae5; color: #059669; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 12px; margin-left: 8px; }
    .match-badge.medium { background: #fef3c7; color: #d97706; }
    .btn { display: inline-block; background: #635bff; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; margin-top: 4px; }
    .btn-skip { background: transparent; color: #8898aa; border: 1px solid #e6ebf1; margin-left: 8px; }
    .actions { margin-top: 12px; }
    .footer { padding: 24px 32px; text-align: center; border-top: 1px solid #e6ebf1; }
    .footer p { font-size: 11px; color: #8898aa; margin: 0; }
    .approve-all { display: block; background: #635bff; color: white; text-decoration: none; padding: 14px; border-radius: 8px; font-size: 14px; font-weight: 600; text-align: center; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your daily job matches</h1>
      <p>We found 5 jobs that fit your profile</p>
    </div>
    <div class="content">
      <div class="job">
        <span class="job-title">Frontend Developer</span>
        <span class="match-badge">85%</span>
        <div class="job-meta">CloudBase · Remote</div>
        <div class="actions">
          <a href="#" class="btn">Approve & Apply</a>
          <a href="#" class="btn btn-skip">Skip</a>
        </div>
      </div>
      <div class="job">
        <span class="job-title">Full Stack Developer</span>
        <span class="match-badge medium">72%</span>
        <div class="job-meta">StartupHub · Remote (APAC)</div>
        <div class="actions">
          <a href="#" class="btn">Approve & Apply</a>
          <a href="#" class="btn btn-skip">Skip</a>
        </div>
      </div>
      <div class="job">
        <span class="job-title">Frontend Engineer (Vue.js)</span>
        <span class="match-badge medium">68%</span>
        <div class="job-meta">ZenDev · Tokyo (Remote OK)</div>
        <div class="actions">
          <a href="#" class="btn">Approve & Apply</a>
          <a href="#" class="btn btn-skip">Skip</a>
        </div>
      </div>
      <a href="#" class="approve-all">Approve all 5 matches →</a>
    </div>
    <div class="footer">
      <p>You're receiving this because you signed up for easy2apply job alerts.</p>
      <p style="margin-top:8px;"><a href="#" style="color:#635bff; text-decoration:none; font-size:11px;">Manage preferences</a> · <a href="#" style="color:#8898aa; text-decoration:none; font-size:11px;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`.trim();
}
