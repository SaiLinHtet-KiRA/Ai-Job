"use client";

import { useState, useCallback } from "react";
import CVManager from "../../../components/CVManager";
import type {
  ProfileData,
  WorkExperience,
  Education,
  Certification,
  Language,
} from "./types";
import { PROFICIENCY_LABELS } from "./types";

function generateId() {
  return crypto.randomUUID();
}

function SectionHeader({
  title,
  editing,
  onAdd,
  onToggleEdit,
}: {
  title: string;
  editing: boolean;
  onAdd?: () => void;
  onToggleEdit?: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="flex items-center gap-2">
        {editing && onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1 rounded-lg border border-white/20 px-3 py-1 text-[12px] text-white/80 hover:border-white/40 hover:text-white transition-colors"
          >
            <PlusIcon />
            Add
          </button>
        )}
        {onToggleEdit && (
          <button
            type="button"
            onClick={onToggleEdit}
            className="rounded-lg p-1.5 text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors"
          >
            <PencilIcon />
          </button>
        )}
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <p className="text-[13px] text-[#8898aa] italic">No {label.toLowerCase()} added yet.</p>
  );
}

export default function ProfileEditor({ profile }: { profile: ProfileData }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: profile.full_name ?? "",
    headline: profile.headline ?? "",
    location: profile.location ?? "",
    about: profile.about ?? "",
    avatar_url: profile.avatar_url ?? "",
    website: profile.website ?? "",
    linkedin_url: profile.linkedin_url ?? "",
    phone: profile.phone ?? "",
    skills: profile.skills ?? [],
    languages: profile.languages ?? [],
    work_experience: profile.work_experience ?? [],
    education: profile.education ?? [],
    certifications: profile.certifications ?? [],
    experience_level: profile.experience_level ?? "mid",
    target_roles: profile.target_roles ?? [],
    preferred_locations: profile.preferred_locations ?? [],
    remote_ok: profile.remote_ok ?? true,
  });

  const [activeExpForm, setActiveExpForm] = useState<WorkExperience | null>(null);
  const [activeEduForm, setActiveEduForm] = useState<Education | null>(null);
  const [activeCertForm, setActiveCertForm] = useState<Certification | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [newTargetRole, setNewTargetRole] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newLang, setNewLang] = useState({ name: "", proficiency: "professional" as Language["proficiency"] });

  const updateField = useCallback(
    <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) return;
      const data: ProfileData = await res.json();
      setForm((prev) => ({
        full_name: prev.full_name || data.full_name || "",
        headline: prev.headline || data.headline || "",
        location: prev.location || data.location || "",
        about: prev.about || data.about || "",
        avatar_url: prev.avatar_url || data.avatar_url || "",
        website: prev.website || data.website || "",
        linkedin_url: prev.linkedin_url || data.linkedin_url || "",
        phone: prev.phone || data.phone || "",
        skills: prev.skills.length > 0 ? prev.skills : data.skills ?? [],
        languages: prev.languages.length > 0 ? prev.languages : data.languages ?? [],
        work_experience: prev.work_experience.length > 0 ? prev.work_experience : data.work_experience ?? [],
        education: prev.education.length > 0 ? prev.education : data.education ?? [],
        certifications: prev.certifications.length > 0 ? prev.certifications : data.certifications ?? [],
        experience_level: prev.experience_level !== "mid" ? prev.experience_level : data.experience_level ?? "mid",
        target_roles: prev.target_roles.length > 0 ? prev.target_roles : data.target_roles ?? [],
        preferred_locations: prev.preferred_locations.length > 0 ? prev.preferred_locations : data.preferred_locations ?? [],
        remote_ok: prev.remote_ok !== data.remote_ok ? prev.remote_ok : data.remote_ok ?? true,
      }));
    } catch {
      console.error("Failed to refetch profile after CV upload");
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name || null,
          headline: form.headline || null,
          location: form.location || null,
          about: form.about || null,
          avatar_url: form.avatar_url || null,
          website: form.website || null,
          linkedin_url: form.linkedin_url || null,
          phone: form.phone || null,
          skills: form.skills,
          languages: form.languages,
          work_experience: form.work_experience,
          education: form.education,
          certifications: form.certifications,
          experience_level: form.experience_level,
          target_roles: form.target_roles,
          preferred_locations: form.preferred_locations,
          remote_ok: form.remote_ok,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save");
      }

      setSuccess("Profile saved.");
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      full_name: profile.full_name ?? "",
      headline: profile.headline ?? "",
      location: profile.location ?? "",
      about: profile.about ?? "",
      avatar_url: profile.avatar_url ?? "",
      website: profile.website ?? "",
      linkedin_url: profile.linkedin_url ?? "",
      phone: profile.phone ?? "",
      skills: profile.skills ?? [],
      languages: profile.languages ?? [],
      work_experience: profile.work_experience ?? [],
      education: profile.education ?? [],
      certifications: profile.certifications ?? [],
      experience_level: profile.experience_level ?? "mid",
      target_roles: profile.target_roles ?? [],
      preferred_locations: profile.preferred_locations ?? [],
      remote_ok: profile.remote_ok ?? true,
    });
    setEditing(false);
    setError(null);
    setSuccess(null);
    setActiveExpForm(null);
    setActiveEduForm(null);
    setActiveCertForm(null);
    setNewSkill("");
    setNewTargetRole("");
    setNewLocation("");
  };

  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !form.skills.includes(s)) {
      updateField("skills", [...form.skills, s]);
    }
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    updateField("skills", form.skills.filter((s) => s !== skill));
  };

  const addTargetRole = () => {
    const r = newTargetRole.trim();
    if (r && !form.target_roles.includes(r)) {
      updateField("target_roles", [...form.target_roles, r]);
    }
    setNewTargetRole("");
  };

  const removeTargetRole = (role: string) => {
    updateField("target_roles", form.target_roles.filter((r) => r !== role));
  };

  const addLocation = () => {
    const l = newLocation.trim();
    if (l && !form.preferred_locations.includes(l)) {
      updateField("preferred_locations", [...form.preferred_locations, l]);
    }
    setNewLocation("");
  };

  const removeLocation = (loc: string) => {
    updateField("preferred_locations", form.preferred_locations.filter((l) => l !== loc));
  };

  const addLanguage = () => {
    const name = newLang.name.trim();
    if (name && !form.languages.some((l) => l.name === name)) {
      updateField("languages", [
        ...form.languages,
        { name, proficiency: newLang.proficiency },
      ]);
    }
    setNewLang({ name: "", proficiency: "professional" });
  };

  const removeLanguage = (name: string) => {
    updateField("languages", form.languages.filter((l) => l.name !== name));
  };

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[14px] text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30";
  const labelClass = "block text-[12px] font-medium text-white/60 mb-1";

  const profileName = form.full_name || "Your Name";
  const profileHeadline = form.headline || "Add a headline";
  const profileLocation = form.location || "";
  const initials = profileName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-400">
          {success}
        </div>
      )}

      {/* Profile Header */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-start gap-5">
          <div className="h-20 w-20 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
            {form.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.avatar_url}
                alt={profileName}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                className={`${inputClass} text-xl font-semibold`}
                value={form.full_name}
                onChange={(e) => updateField("full_name", e.target.value)}
                placeholder="Full Name"
              />
            ) : (
              <h1 className="text-2xl font-semibold text-white truncate">
                {profileName}
              </h1>
            )}

            {editing ? (
              <input
                className={`${inputClass} mt-1`}
                value={form.headline}
                onChange={(e) => updateField("headline", e.target.value)}
                placeholder="Headline (e.g. Senior Software Engineer at Google)"
              />
            ) : (
              <p className="mt-0.5 text-[14px] text-white/70">
                {profileHeadline}
              </p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#8898aa]">
              {editing ? (
                <input
                  className={`${inputClass} w-40`}
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="Location"
                />
              ) : (
                profileLocation && <span>{profileLocation}</span>
              )}
              {!editing && form.website && (
                <a
                  href={form.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {form.website.replace(/^https?:\/\//, "")}
                </a>
              )}
              {!editing && profile.email && (
                <span>{profile.email}</span>
              )}
            </div>

            {editing && (
              <div className="mt-2">
                <label className={labelClass}>Avatar URL</label>
                <input
                  className={inputClass}
                  value={form.avatar_url}
                  onChange={(e) => updateField("avatar_url", e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-white hover:brightness-110 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg border border-white/20 px-4 py-2 text-[13px] text-white/70 hover:border-white/40 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-lg border border-white/20 px-4 py-2 text-[13px] text-white/70 hover:border-white/40 hover:text-white transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* About */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-semibold text-white">About</h2>
        {editing ? (
          <textarea
            className={`${inputClass} mt-3 min-h-[120px] resize-y`}
            value={form.about}
            onChange={(e) => updateField("about", e.target.value)}
            placeholder="Write a short bio about yourself..."
          />
        ) : (
          <p className="mt-3 text-[14px] text-white/70 leading-relaxed whitespace-pre-wrap">
            {form.about || <span className="text-[#8898aa] italic">No about section yet.</span>}
          </p>
        )}
      </div>

      {/* Work Experience */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <SectionHeader
          title="Work Experience"
          editing={editing}
          onAdd={() =>
            setActiveExpForm({
              id: generateId(),
              title: "",
              company: "",
              location: "",
              start_date: "",
              end_date: "",
              current: false,
              description: "",
            })
          }
        />

        {form.work_experience.length === 0 && !activeExpForm && (
          <EmptyState label="Work Experience" />
        )}

        <div className="mt-4 space-y-4">
          {form.work_experience.map((exp) => (
            <div
              key={exp.id}
              className="rounded-lg border border-white/5 bg-white/[0.02] p-4"
            >
              {activeExpForm?.id === exp.id ? (
                <ExperienceEditForm
                  data={activeExpForm}
                  onChange={setActiveExpForm}
                  onSave={() => {
                    updateField(
                      "work_experience",
                      form.work_experience.map((e) =>
                        e.id === exp.id ? activeExpForm : e,
                      ),
                    );
                    setActiveExpForm(null);
                  }}
                  onCancel={() => setActiveExpForm(null)}
                />
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[14px] font-semibold text-white">
                      {exp.title}
                    </h3>
                    <p className="text-[13px] text-white/60">
                      {exp.company}
                      {exp.location ? ` · ${exp.location}` : ""}
                    </p>
                    <p className="text-[12px] text-[#8898aa]">
                      {exp.start_date}
                      {exp.current ? " – Present" : exp.end_date ? ` – ${exp.end_date}` : ""}
                    </p>
                    {exp.description && (
                      <p className="mt-2 text-[13px] text-white/60 whitespace-pre-wrap">
                        {exp.description}
                      </p>
                    )}
                  </div>
                  {editing && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveExpForm({ ...exp })}
                        className="rounded p-1 text-white/40 hover:text-white/80 hover:bg-white/10"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateField(
                            "work_experience",
                            form.work_experience.filter((e) => e.id !== exp.id),
                          )
                        }
                        className="rounded p-1 text-white/40 hover:text-rose-400 hover:bg-rose-500/10"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {activeExpForm &&
            !form.work_experience.find((e) => e.id === activeExpForm.id) && (
              <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.01] p-4">
                <ExperienceEditForm
                  data={activeExpForm}
                  onChange={setActiveExpForm}
                  onSave={() => {
                    updateField("work_experience", [
                      ...form.work_experience,
                      activeExpForm,
                    ]);
                    setActiveExpForm(null);
                  }}
                  onCancel={() => setActiveExpForm(null)}
                />
              </div>
            )}
        </div>
      </div>

      {/* Education */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <SectionHeader
          title="Education"
          editing={editing}
          onAdd={() =>
            setActiveEduForm({
              id: generateId(),
              school: "",
              degree: "",
              field: "",
              start_year: "",
              end_year: "",
            })
          }
        />

        {form.education.length === 0 && !activeEduForm && (
          <EmptyState label="Education" />
        )}

        <div className="mt-4 space-y-4">
          {form.education.map((edu) => (
            <div
              key={edu.id}
              className="rounded-lg border border-white/5 bg-white/[0.02] p-4"
            >
              {activeEduForm?.id === edu.id ? (
                <EducationEditForm
                  data={activeEduForm}
                  onChange={setActiveEduForm}
                  onSave={() => {
                    updateField(
                      "education",
                      form.education.map((e) =>
                        e.id === edu.id ? activeEduForm : e,
                      ),
                    );
                    setActiveEduForm(null);
                  }}
                  onCancel={() => setActiveEduForm(null)}
                />
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[14px] font-semibold text-white">
                      {edu.school}
                    </h3>
                    <p className="text-[13px] text-white/60">
                      {edu.degree}
                      {edu.field ? ` in ${edu.field}` : ""}
                    </p>
                    <p className="text-[12px] text-[#8898aa]">
                      {edu.start_year}
                      {edu.end_year ? ` – ${edu.end_year}` : ""}
                    </p>
                  </div>
                  {editing && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveEduForm({ ...edu })}
                        className="rounded p-1 text-white/40 hover:text-white/80 hover:bg-white/10"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateField(
                            "education",
                            form.education.filter((e) => e.id !== edu.id),
                          )
                        }
                        className="rounded p-1 text-white/40 hover:text-rose-400 hover:bg-rose-500/10"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {activeEduForm &&
            !form.education.find((e) => e.id === activeEduForm.id) && (
              <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.01] p-4">
                <EducationEditForm
                  data={activeEduForm}
                  onChange={setActiveEduForm}
                  onSave={() => {
                    updateField("education", [
                      ...form.education,
                      activeEduForm,
                    ]);
                    setActiveEduForm(null);
                  }}
                  onCancel={() => setActiveEduForm(null)}
                />
              </div>
            )}
        </div>
      </div>

      {/* Skills */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-semibold text-white">Skills</h2>
        {form.skills.length === 0 && (
          <p className="mt-3 text-[13px] text-[#8898aa] italic">No skills added yet.</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {form.skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[13px] text-white/80"
            >
              {skill}
              {editing && (
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-white/40 hover:text-rose-400"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </span>
          ))}
        </div>
        {editing && (
          <div className="mt-3 flex items-center gap-2">
            <input
              className={`${inputClass} max-w-[200px]`}
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              placeholder="Add a skill..."
            />
            <button
              type="button"
              onClick={addSkill}
              className="rounded-lg border border-white/20 px-3 py-1.5 text-[12px] text-white/70 hover:border-white/40 hover:text-white transition-colors"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Languages */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-semibold text-white">Languages</h2>
        {form.languages.length === 0 && (
          <p className="mt-3 text-[13px] text-[#8898aa] italic">No languages added yet.</p>
        )}
        <div className="mt-3 space-y-2">
          {form.languages.map((lang) => (
            <div
              key={lang.name}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2.5"
            >
              <div>
                <span className="text-[14px] text-white">{lang.name}</span>
                <span className="ml-3 text-[12px] text-[#8898aa]">
                  {PROFICIENCY_LABELS[lang.proficiency]}
                </span>
              </div>
              {editing && (
                <button
                  type="button"
                  onClick={() => removeLanguage(lang.name)}
                  className="rounded p-1 text-white/40 hover:text-rose-400 hover:bg-rose-500/10"
                >
                  <TrashIcon />
                </button>
              )}
            </div>
          ))}
        </div>
        {editing && (
          <div className="mt-3 flex items-center gap-2">
            <input
              className={`${inputClass} max-w-[160px]`}
              value={newLang.name}
              onChange={(e) => setNewLang({ ...newLang, name: e.target.value })}
              placeholder="Language..."
            />
            <select
              className={inputClass + " max-w-[180px]"}
              value={newLang.proficiency}
              onChange={(e) =>
                setNewLang({
                  ...newLang,
                  proficiency: e.target.value as Language["proficiency"],
                })
              }
            >
              {(
                Object.entries(PROFICIENCY_LABELS) as [
                  Language["proficiency"],
                  string,
                ][]
              ).map(([value, label]) => (
                <option key={value} value={value} className="bg-[#0a2540]">
                  {label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addLanguage}
              className="rounded-lg border border-white/20 px-3 py-1.5 text-[12px] text-white/70 hover:border-white/40 hover:text-white transition-colors"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Certifications */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <SectionHeader
          title="Certifications"
          editing={editing}
          onAdd={() =>
            setActiveCertForm({
              id: generateId(),
              name: "",
              issuer: "",
              date: "",
              url: "",
            })
          }
        />

        {form.certifications.length === 0 && !activeCertForm && (
          <EmptyState label="Certifications" />
        )}

        <div className="mt-4 space-y-4">
          {form.certifications.map((cert) => (
            <div
              key={cert.id}
              className="rounded-lg border border-white/5 bg-white/[0.02] p-4"
            >
              {activeCertForm?.id === cert.id ? (
                <CertEditForm
                  data={activeCertForm}
                  onChange={setActiveCertForm}
                  onSave={() => {
                    updateField(
                      "certifications",
                      form.certifications.map((c) =>
                        c.id === cert.id ? activeCertForm : c,
                      ),
                    );
                    setActiveCertForm(null);
                  }}
                  onCancel={() => setActiveCertForm(null)}
                />
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[14px] font-semibold text-white">
                      {cert.name}
                    </h3>
                    <p className="text-[13px] text-white/60">
                      {cert.issuer}
                      {cert.date ? ` · ${cert.date}` : ""}
                    </p>
                    {cert.url && (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-[12px] text-primary hover:underline"
                      >
                        View credential
                      </a>
                    )}
                  </div>
                  {editing && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveCertForm({ ...cert })}
                        className="rounded p-1 text-white/40 hover:text-white/80 hover:bg-white/10"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateField(
                            "certifications",
                            form.certifications.filter((c) => c.id !== cert.id),
                          )
                        }
                        className="rounded p-1 text-white/40 hover:text-rose-400 hover:bg-rose-500/10"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {activeCertForm &&
            !form.certifications.find((c) => c.id === activeCertForm.id) && (
              <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.01] p-4">
                <CertEditForm
                  data={activeCertForm}
                  onChange={setActiveCertForm}
                  onSave={() => {
                    updateField("certifications", [
                      ...form.certifications,
                      activeCertForm,
                    ]);
                    setActiveCertForm(null);
                  }}
                  onCancel={() => setActiveCertForm(null)}
                />
              </div>
            )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-semibold text-white">Contact Info</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Email</label>
            <p className="text-[14px] text-white/50">{profile.email}</p>
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            {editing ? (
              <input
                className={inputClass}
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+1 234 567 8900"
              />
            ) : (
              <p className="text-[14px] text-white/70">
                {form.phone || <span className="text-white/30">—</span>}
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>Website</label>
            {editing ? (
              <input
                className={inputClass}
                value={form.website}
                onChange={(e) => updateField("website", e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            ) : form.website ? (
              <a
                href={form.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] text-primary hover:underline"
              >
                {form.website.replace(/^https?:\/\//, "")}
              </a>
            ) : (
              <p className="text-[14px] text-white/30">—</p>
            )}
          </div>
          <div>
            <label className={labelClass}>LinkedIn</label>
            {editing ? (
              <input
                className={inputClass}
                value={form.linkedin_url}
                onChange={(e) => updateField("linkedin_url", e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            ) : form.linkedin_url ? (
              <a
                href={form.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] text-primary hover:underline"
              >
                View Profile
              </a>
            ) : (
              <p className="text-[14px] text-white/30">—</p>
            )}
          </div>
        </div>
      </div>

      {/* Career Preferences */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-semibold text-white">Career Preferences</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Experience Level</label>
            {editing ? (
              <select
                className={inputClass}
                value={form.experience_level}
                onChange={(e) => updateField("experience_level", e.target.value)}
              >
                <option value="entry" className="bg-[#0a2540]">Entry</option>
                <option value="mid" className="bg-[#0a2540]">Mid</option>
                <option value="senior" className="bg-[#0a2540]">Senior</option>
                <option value="lead" className="bg-[#0a2540]">Lead / Manager</option>
                <option value="executive" className="bg-[#0a2540]">Executive</option>
              </select>
            ) : (
              <p className="text-[14px] text-white/70 capitalize">
                {form.experience_level}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.remote_ok}
                onChange={(e) => updateField("remote_ok", e.target.checked)}
                disabled={!editing}
                className="h-4 w-4 rounded border-white/20 bg-black/20 text-primary focus:ring-primary/30"
              />
              <span className="text-[14px] text-white/70">Open to remote work</span>
            </label>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Target Roles</label>
            <div className="flex flex-wrap gap-2">
              {form.target_roles.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[13px] text-primary"
                >
                  {role}
                  {editing && (
                    <button
                      type="button"
                      onClick={() => removeTargetRole(role)}
                      className="text-primary/60 hover:text-primary"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </span>
              ))}
            </div>
            {editing && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  className={`${inputClass} max-w-[220px]`}
                  value={newTargetRole}
                  onChange={(e) => setNewTargetRole(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTargetRole())}
                  placeholder="Add target role..."
                />
                <button
                  type="button"
                  onClick={addTargetRole}
                  className="rounded-lg border border-white/20 px-3 py-1.5 text-[12px] text-white/70 hover:border-white/40 hover:text-white transition-colors"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Preferred Locations</label>
            <div className="flex flex-wrap gap-2">
              {form.preferred_locations.map((loc) => (
                <span
                  key={loc}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[13px] text-white/70"
                >
                  {loc}
                  {editing && (
                    <button
                      type="button"
                      onClick={() => removeLocation(loc)}
                      className="text-white/40 hover:text-rose-400"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </span>
              ))}
            </div>
            {editing && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  className={`${inputClass} max-w-[220px]`}
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLocation())}
                  placeholder="Add location..."
                />
                <button
                  type="button"
                  onClick={addLocation}
                  className="rounded-lg border border-white/20 px-3 py-1.5 text-[12px] text-white/70 hover:border-white/40 hover:text-white transition-colors"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CV Section */}
      <div>
        <CVManager onCvUploaded={fetchProfile} />
      </div>
    </div>
  );
}

function ExperienceEditForm({
  data,
  onChange,
  onSave,
  onCancel,
}: {
  data: WorkExperience;
  onChange: (d: WorkExperience) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const inputClass =
    "w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[14px] text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30";
  const labelClass = "block text-[12px] font-medium text-white/60 mb-1";

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Job Title</label>
          <input
            className={inputClass}
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="e.g. Senior Software Engineer"
          />
        </div>
        <div>
          <label className={labelClass}>Company</label>
          <input
            className={inputClass}
            value={data.company}
            onChange={(e) => onChange({ ...data, company: e.target.value })}
            placeholder="e.g. Google"
          />
        </div>
        <div>
          <label className={labelClass}>Location</label>
          <input
            className={inputClass}
            value={data.location}
            onChange={(e) => onChange({ ...data, location: e.target.value })}
            placeholder="e.g. Mountain View, CA"
          />
        </div>
        <div>
          <label className={labelClass}>Start Date</label>
          <input
            className={inputClass}
            value={data.start_date}
            onChange={(e) => onChange({ ...data, start_date: e.target.value })}
            placeholder="e.g. Jan 2022"
          />
        </div>
        <div>
          <label className={labelClass}>End Date</label>
          <input
            className={inputClass}
            value={data.end_date}
            onChange={(e) => onChange({ ...data, end_date: e.target.value })}
            placeholder="e.g. Dec 2023"
            disabled={data.current}
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.current}
              onChange={(e) =>
                onChange({
                  ...data,
                  current: e.target.checked,
                  end_date: e.target.checked ? "" : data.end_date,
                })
              }
              className="h-4 w-4 rounded border-white/20 bg-black/20 text-primary focus:ring-primary/30"
            />
            <span className="text-[13px] text-white/70">I currently work here</span>
          </label>
        </div>
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          className={`${inputClass} min-h-[80px] resize-y`}
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="Describe your responsibilities and achievements..."
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          className="rounded-lg bg-primary px-4 py-1.5 text-[13px] font-medium text-white hover:brightness-110 transition-colors"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/20 px-4 py-1.5 text-[13px] text-white/70 hover:border-white/40 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function EducationEditForm({
  data,
  onChange,
  onSave,
  onCancel,
}: {
  data: Education;
  onChange: (d: Education) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const inputClass =
    "w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[14px] text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30";
  const labelClass = "block text-[12px] font-medium text-white/60 mb-1";

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>School</label>
          <input
            className={inputClass}
            value={data.school}
            onChange={(e) => onChange({ ...data, school: e.target.value })}
            placeholder="e.g. Stanford University"
          />
        </div>
        <div>
          <label className={labelClass}>Degree</label>
          <input
            className={inputClass}
            value={data.degree}
            onChange={(e) => onChange({ ...data, degree: e.target.value })}
            placeholder="e.g. Bachelor's"
          />
        </div>
        <div>
          <label className={labelClass}>Field of Study</label>
          <input
            className={inputClass}
            value={data.field}
            onChange={(e) => onChange({ ...data, field: e.target.value })}
            placeholder="e.g. Computer Science"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Start Year</label>
            <input
              className={inputClass}
              value={data.start_year}
              onChange={(e) => onChange({ ...data, start_year: e.target.value })}
              placeholder="2020"
            />
          </div>
          <div>
            <label className={labelClass}>End Year</label>
            <input
              className={inputClass}
              value={data.end_year}
              onChange={(e) => onChange({ ...data, end_year: e.target.value })}
              placeholder="2024"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          className="rounded-lg bg-primary px-4 py-1.5 text-[13px] font-medium text-white hover:brightness-110 transition-colors"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/20 px-4 py-1.5 text-[13px] text-white/70 hover:border-white/40 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function CertEditForm({
  data,
  onChange,
  onSave,
  onCancel,
}: {
  data: Certification;
  onChange: (d: Certification) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const inputClass =
    "w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[14px] text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30";
  const labelClass = "block text-[12px] font-medium text-white/60 mb-1";

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Certification Name</label>
          <input
            className={inputClass}
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder="e.g. AWS Solutions Architect"
          />
        </div>
        <div>
          <label className={labelClass}>Issuer</label>
          <input
            className={inputClass}
            value={data.issuer}
            onChange={(e) => onChange({ ...data, issuer: e.target.value })}
            placeholder="e.g. Amazon Web Services"
          />
        </div>
        <div>
          <label className={labelClass}>Date</label>
          <input
            className={inputClass}
            value={data.date}
            onChange={(e) => onChange({ ...data, date: e.target.value })}
            placeholder="e.g. Jun 2024"
          />
        </div>
        <div>
          <label className={labelClass}>Credential URL</label>
          <input
            className={inputClass}
            value={data.url}
            onChange={(e) => onChange({ ...data, url: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          className="rounded-lg bg-primary px-4 py-1.5 text-[13px] font-medium text-white hover:brightness-110 transition-colors"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/20 px-4 py-1.5 text-[13px] text-white/70 hover:border-white/40 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
