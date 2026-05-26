"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const inputClasses =
  "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:bg-zinc-800";

const labelClasses =
  "flex flex-col gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300";

export default function NewJobPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("On-site");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title) {
      setError("Title is required.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          company,
          email,
          location,
          type,
          salary,
          description,
          image_url: imageUrl,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/admin/jobs");
      } else {
        setError(data.error || "Failed to create job.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Create Job Post
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Fill in the details for a new job listing
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50"
      >
        <label className={labelClasses}>
          Title <span className="text-red-500">*</span>
          <input
            className={inputClasses}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Senior Frontend Developer"
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className={labelClasses}>
            Company
            <input
              className={inputClasses}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Acme Inc."
            />
          </label>

          <label className={labelClasses}>
            Email
            <input
              className={inputClasses}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="careers@acme.com"
            />
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <label className={labelClasses}>
            Location
            <input
              className={inputClasses}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Yangon"
            />
          </label>

          <label className={labelClasses}>
            Type
            <select
              className={inputClasses}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="On-site">On-site</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </label>

          <label className={labelClasses}>
            Salary
            <input
              className={inputClasses}
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="$80k - $120k"
            />
          </label>
        </div>

        <label className={labelClasses}>
          Description
          <textarea
            className={`${inputClasses} min-h-[120px] resize-y`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the role and responsibilities..."
          />
        </label>

        <label className={labelClasses}>
          Image URL
          <input
            className={inputClasses}
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
          />
        </label>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Job"}
          </button>
        </div>
      </form>
    </div>
  );
}
