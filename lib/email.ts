import { Resend } from "resend";

export interface Job {
  id: number;
  title: string;
  company: string;
  email: string;
  location: string;
  type: string;
  salary: string;
  description: string;
}

const FROM = "easy2apply@easy2apply.work";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function sendApplicationEmails(params: {
  name: string;
  email: string;
  position: string;
  resumeUrl: string;
  jobs: Job[];
}) {
  const { name, email, position, resumeUrl, jobs } = params;
  const key = process.env.RESEND_API_KEY;
  if (!key || jobs.length === 0) return;

  const resend = new Resend(key);
  const sent = new Set<string>();

  for (const job of jobs) {
    if (!job.email || sent.has(job.email)) continue;
    sent.add(job.email);

    await resend.emails
      .send({
        from: FROM,
        to: job.email,
        subject: `New Job Application: ${position}`,
        html: employerTemplate({ name, email, position, resumeUrl, job }),
      })
      .catch((err) => console.error(`Failed to send to ${job.email}:`, err));

    await sleep(1000);
  }

  await resend.emails
    .send({
      from: FROM,
      to: email,
      subject: `Your Applications for "${position}" Have Been Sent`,
      html: applicantTemplate({ name, position, jobs }),
    })
    .catch((err) => console.error("Failed to send summary to applicant:", err));
}

function employerTemplate(p: {
  name: string;
  email: string;
  position: string;
  resumeUrl: string;
  job: Job;
}) {
  const { name, email, position, resumeUrl, job } = p;
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5;margin:0;padding:0}
.c{max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06)}
.h{background:linear-gradient(135deg,#2563eb,#7c3aed);padding:28px 36px}
.h h1{color:#fff;font-size:20px;margin:0}
.b{padding:28px 36px}
.bd{display:inline-block;background:#e0e7ff;color:#3730a3;padding:4px 12px;border-radius:999px;font-size:13px;font-weight:600}
.dl{margin:24px 0}
.dl dt{font-size:12px;text-transform:uppercase;letter-spacing:.5px;color:#71717a;margin-bottom:2px}
.dl dd{font-size:15px;color:#18181b;margin:0 0 12px}
.bt{display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px}
.ft{background:#fafafa;padding:16px 36px;font-size:12px;color:#a1a1aa}
</style></head><body>
<div class="c">
<div class="h"><h1>New Job Application</h1></div>
<div class="b">
<p>Hello <strong>${job.company || "Employer"}</strong>,</p>
<p>You have received a new application for <span class="bd">${position}</span>.</p>
<dl class="dl">
<dt>Applicant</dt><dd>${name}</dd>
<dt>Email</dt><dd><a style="color:#2563eb" href="mailto:${email}">${email}</a></dd>
<dt>Target Position</dt><dd>${position}</dd>
<dt>Your Job Post</dt><dd>${job.title} &mdash; ${job.company}</dd>
<dt>Location</dt><dd>${job.location}</dd>
<dt>Salary</dt><dd>${job.salary}</dd>
</dl>
<a class="bt" href="${resumeUrl}" target="_blank">View Resume</a>
</div>
<div class="ft">Sent via AI-Job &middot; ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
</div></body></html>`;
}

function applicantTemplate(p: { name: string; position: string; jobs: Job[] }) {
  const { name, position, jobs } = p;
  const companyIcon = `<svg style="width:18px;height:18px;vertical-align:middle;margin-right:6px" viewBox="0 0 24 24" fill="none" stroke="#71717a" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11m16-11v11M8 14v.01M12 14v.01M16 14v.01M8 18v.01M12 18v.01M16 18v.01"/></svg>`;

  const mailIcon = `<svg style="width:14px;height:14px;vertical-align:middle;margin-right:4px" viewBox="0 0 24 24" fill="none" stroke="#71717a" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>`;

  const cards = jobs
    .map(
      (j) =>
        `<div style="border:1px solid #e4e4e7;border-radius:12px;padding:16px;margin-bottom:12px"><h3 style="margin:0 0 4px;font-size:16px;color:#18181b">${j.title}</h3><p style="margin:0 0 4px;font-size:14px;color:#3f3f46">${companyIcon}${j.company}</p><p style="margin:0 0 4px;font-size:13px;color:#71717a">${mailIcon}${j.email}</p><p style="margin:0;font-size:13px;color:#71717a">${j.location || ""}${j.location && j.salary ? " &middot; " : ""}${j.salary || ""}</p></div>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5;margin:0;padding:0}
.c{max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06)}
.h{background:linear-gradient(135deg,#2563eb,#7c3aed);padding:28px 36px}
.h h1{color:#fff;font-size:20px;margin:0}
.b{padding:28px 36px}
.bd{display:inline-block;background:#e0e7ff;color:#3730a3;padding:4px 12px;border-radius:999px;font-size:13px;font-weight:600}
.ft{background:#fafafa;padding:16px 36px;font-size:12px;color:#a1a1aa}
</style></head><body>
<div class="c">
<div class="h"><h1>Applications Sent!</h1></div>
<div class="b">
<p>Hi <strong>${name}</strong>,</p>
<p>Your application for <span class="bd">${position}</span> has been sent to <strong>${jobs.length}</strong> employer${jobs.length !== 1 ? "s" : ""}.</p>
<h2 style="font-size:17px;margin:24px 0 12px">Matching Job Positions</h2>
${cards}
<p style="margin-top:24px;font-size:14px;color:#52525b">Employers will contact you directly if they're interested. Good luck!</p>
</div>
<div class="ft">Sent via AI-Job &middot; ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
</div></body></html>`;
}
