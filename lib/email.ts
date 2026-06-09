import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "easy2apply <noreply@easy2apply.work>";

export async function sendVerificationEmail(to: string, code: string): Promise<boolean> {
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "Your verification code",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #0a2540;">Verify your email</h2>
          <p>Use the code below to complete your sign up. This code expires in 5 minutes.</p>
          <div style="
            background: #f4f6f8;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 24px 0;
          ">
            <span style="
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              color: #0a2540;
            ">${code}</span>
          </div>
          <p style="color: #666; font-size: 13px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return false;
  }
}

export interface Job {
  id: number;
  title: string;
  company: string;
  apply_email: string;
  location: string;
  job_type: string;
  salary_range: string;
  description: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function sendApplicationEmails(params: {
  name: string;
  email: string;
  position: string;
  type: string;
  salary: string;
  resumeUrl: string;
  jobs: Job[];
}) {
  const { name, email, position, type, salary, resumeUrl, jobs } = params;
  if (jobs.length === 0) return;

  const sent = new Set<string>();

  for (const job of jobs) {
    if (!job.apply_email || sent.has(job.apply_email)) continue;
    sent.add(job.apply_email);

    await resend.emails
      .send({
        from: FROM,
        to: job.apply_email,
        subject: `New Application: ${position} — ${name}`,
        html: employerTemplate({ name, email, position, type, salary, resumeUrl, job }),
      })
      .catch((err) => console.error(`Failed to send to ${job.apply_email}:`, err));

    await sleep(1000);
  }

  await resend.emails
    .send({
      from: FROM,
      to: email,
      subject: `Applications Sent — ${jobs.length} job${jobs.length !== 1 ? "s" : ""} for "${position}"`,
      html: applicantTemplate({ name, position, jobs }),
    })
    .catch((err) => console.error("Failed to send summary to applicant:", err));
}

export interface EmployerEmailParams {
  name: string;
  email: string;
  position: string;
  type: string;
  salary: string;
  resumeUrl: string;
  coverLetter?: string;
  sentAt?: string;
  job: {
    title: string;
    company: string;
    location?: string;
    apply_email?: string;
    job_type?: string;
    salary_range?: string;
  };
}

export function employerTemplate(p: EmployerEmailParams) {
  const { name, email, position, type, salary, resumeUrl, coverLetter, sentAt, job } = p;

  const mapIcon = (c: string) => `<svg style="width:13px;height:13px;vertical-align:middle;margin-right:4px" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>`;
  const briefcaseIcon = (c: string) => `<svg style="width:13px;height:13px;vertical-align:middle;margin-right:4px" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"/></svg>`;
  const coinIcon = (c: string) => `<svg style="width:13px;height:13px;vertical-align:middle;margin-right:4px" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
  const mailIcon = (c: string) => `<svg style="width:13px;height:13px;vertical-align:middle;margin-right:4px" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>`;
  const gray = "#9ca3af";

  const coverLetterHtml = coverLetter
    ? `<div class="section">
  <h2>Cover Letter</h2>
  <p style="font-size:14px;color:#374151;line-height:1.6;white-space:pre-wrap;margin:0">${coverLetter}</p>
</div>`
    : "";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f0f2f5;margin:0;padding:0}
.c{max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
.h{background:linear-gradient(135deg,#0ea5e9,#6366f1);padding:32px 36px;text-align:center}
.h .icon{margin-bottom:12px;display:inline-block;background:rgba(255,255,255,.2);border-radius:50%;width:48px;height:48px;line-height:48px}
.h h1{color:#fff;font-size:22px;margin:0;font-weight:700}
.h p{color:rgba(255,255,255,.85);font-size:14px;margin:6px 0 0}
.b{padding:32px 36px}
.greeting{font-size:15px;color:#374151;line-height:1.6;margin:0 0 12px}
.highlight{display:inline-block;background:#eef2ff;color:#4f46e5;padding:3px 10px;border-radius:8px;font-weight:600;font-size:14px}
.section{margin:20px 0;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px}
.section h2{font-size:13px;text-transform:uppercase;letter-spacing:.6px;color:#6b7280;margin:0 0 14px;font-weight:600}
.row{display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #f3f4f6}
.row:last-child{border-bottom:none}
.row .label{font-size:13px;color:#6b7280;display:flex;align-items:center}
.row .value{font-size:14px;color:#111827;font-weight:500;text-align:right;max-width:55%}
.badge{display:inline-flex;align-items:center;gap:4px;background:#dbeafe;color:#1d4ed8;padding:4px 10px;border-radius:8px;font-size:13px;font-weight:600;margin-top:4px}
.bt{display:inline-block;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;text-align:center;width:100%;box-sizing:border-box;margin-top:8px}
.ft{background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 36px;text-align:center;font-size:12px;color:#9ca3af}
.ft a{color:#6366f1;text-decoration:none}
</style></head><body>
<div class="c">
<div class="h">
  <div class="icon"><svg style="width:24px;height:24px;vertical-align:middle" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg></div>
  <h1>New Job Application</h1>
  <p>via easy2apply</p>
</div>
<div class="b">
<p class="greeting">Hello <strong>${job.company || "Hiring Team"}</strong>,</p>
<p style="font-size:15px;color:#374151;line-height:1.6;margin:0">
  A candidate has applied for <span class="highlight">${position}</span>.
</p>

<div class="section">
  <h2>Candidate Information</h2>
  <div class="row"><span class="label">${mailIcon(gray)} Name</span><span class="value">${name}</span></div>
  <div class="row"><span class="label">${mailIcon(gray)} Email</span><span class="value"><a style="color:#4f46e5;text-decoration:none" href="mailto:${email}">${email}</a></span></div>
  <div class="row"><span class="label">${briefcaseIcon(gray)} Position</span><span class="value">${position}</span></div>
  <div class="row"><span class="label">${briefcaseIcon(gray)} Work Type</span><span class="value">${type || "Not specified"}</span></div>
  <div class="row"><span class="label">${coinIcon(gray)} Expected Salary</span><span class="value">${salary || "Not specified"}</span></div>
  ${sentAt ? `<div class="row"><span class="label">${mailIcon(gray)} Applied</span><span class="value">${new Date(sentAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span></div>` : ""}
</div>

<div class="section">
  <h2>Job Details</h2>
  <div class="row"><span class="label">${briefcaseIcon(gray)} Title</span><span class="value">${job.title}</span></div>
  <div class="row"><span class="label">${mailIcon(gray)} Company</span><span class="value">${job.company}</span></div>
  ${job.location ? `<div class="row"><span class="label">${mapIcon(gray)} Location</span><span class="value">${job.location}</span></div>` : ""}
  ${job.job_type ? `<div class="row"><span class="label">${briefcaseIcon(gray)} Type</span><span class="value">${job.job_type}</span></div>` : ""}
  ${job.salary_range ? `<div class="row"><span class="label">${coinIcon(gray)} Salary Range</span><span class="value">${job.salary_range}</span></div>` : ""}
</div>

${coverLetterHtml}

<a class="bt" href="${resumeUrl}" target="_blank">
  <svg style="width:16px;height:16px;vertical-align:middle;margin-right:6px" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
  View Candidate's CV
</a>
</div>
<div class="ft">
  Sent via <a href="https://easy2apply.work">easy2apply</a>${sentAt ? ` &middot; ${new Date(sentAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}` : ""}
</div>
</div></body></html>`;
}

export function applicantTemplate(p: { name: string; position: string; jobs: Job[] }) {
  const { name, position, jobs } = p;

  const locationSvg = `<svg style="width:13px;height:13px;vertical-align:middle;margin-right:3px" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>`;
  const mailSvg = `<svg style="width:13px;height:13px;vertical-align:middle;margin-right:3px" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>`;
  const buildingSvg = `<svg style="width:13px;height:13px;vertical-align:middle;margin-right:3px" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11m16-11v11M8 14v.01M12 14v.01M16 14v.01M8 18v.01M12 18v.01M16 18v.01"/></svg>`;
  const cashSvg = `<svg style="width:13px;height:13px;vertical-align:middle;margin-right:3px" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;

  const cards = jobs
    .map(
      (j, i) =>
        `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:18px;margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div style="flex:1">
              <div style="font-size:15px;font-weight:600;color:#111827;margin:0 0 6px">${i + 1}. ${j.title}</div>
              <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px">
                <span style="display:inline-flex;align-items:center;font-size:12px;color:#6b7280">${buildingSvg}${j.company}</span>
                ${j.location ? `<span style="display:inline-flex;align-items:center;font-size:12px;color:#6b7280">${locationSvg}${j.location}</span>` : ""}
                ${j.job_type ? `<span style="display:inline-flex;align-items:center;font-size:12px;color:#6b7280">${cashSvg}${j.job_type}</span>` : ""}
              </div>
              ${j.salary_range ? `<div style="font-size:13px;color:#059669;font-weight:500">${j.salary_range}</div>` : ""}
            </div>
            ${j.apply_email ? `<span style="display:inline-flex;align-items:center;background:#ecfdf5;color:#059669;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:600;white-space:nowrap;flex-shrink:0">${mailSvg}Sent</span>` : ""}
          </div>
        </div>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f0f2f5;margin:0;padding:0}
.c{max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
.h{background:linear-gradient(135deg,#059669,#0ea5e9);padding:32px 36px;text-align:center}
.h .icon{margin-bottom:12px;display:inline-block;background:rgba(255,255,255,.2);border-radius:50%;width:48px;height:48px;line-height:48px}
.h h1{color:#fff;font-size:22px;margin:0;font-weight:700}
.h p{color:rgba(255,255,255,.85);font-size:14px;margin:6px 0 0}
.b{padding:32px 36px}
.greeting{font-size:15px;color:#374151;line-height:1.6;margin:0 0 8px}
.badge{display:inline-block;background:#d1fae5;color:#065f46;padding:4px 12px;border-radius:8px;font-weight:600;font-size:14px;margin-bottom:20px}
.job-count{font-size:13px;color:#6b7280;margin:0 0 20px}
.tip{background:#eff6ff;border-left:3px solid #3b82f6;border-radius:0 8px 8px 0;padding:14px 18px;margin-top:24px}
.tip p{font-size:13px;color:#1e40af;margin:0;line-height:1.5}
.tip strong{color:#1d4ed8}
.ft{background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 36px;text-align:center;font-size:12px;color:#9ca3af}
.ft a{color:#0ea5e9;text-decoration:none}
</style></head><body>
<div class="c">
<div class="h">
  <div class="icon"><svg style="width:24px;height:24px;vertical-align:middle" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
  <h1>Applications Sent!</h1>
  <p>via easy2apply</p>
</div>
<div class="b">
<p class="greeting">Hi <strong>${name}</strong>,</p>
<p style="font-size:15px;color:#374151;line-height:1.6;margin:0">
  Your application for <span class="badge">${position}</span> has been successfully sent.
</p>
<p class="job-count">
  <strong>${jobs.length}</strong> employer${jobs.length !== 1 ? "s" : ""} will receive your CV and application details.
</p>

<h2 style="font-size:15px;font-weight:600;color:#111827;margin:24px 0 12px">Applied Jobs</h2>
${cards}

<div class="tip">
  <p><strong>What's next?</strong> Employers will review your application and contact you directly via email if they're interested. Make sure to check your inbox regularly.</p>
</div>
</div>
<div class="ft">
  Sent via <a href="https://easy2apply.work">easy2apply</a> &middot; ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
</div>
</div></body></html>`;
}
