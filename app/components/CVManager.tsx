"use client";

import { useState, useEffect, useCallback } from "react";

interface CV {
  id: number;
  fileName: string;
  url: string;
  uploadedAt: string;
  parsedText: string;
}

export default function CVManager() {
  const [cv, setCv] = useState<CV | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchCV = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cv/upload");

      const data = await res.json();
      if (data.cv) {
        setCv(data.cv);
      }
    } catch (err) {
      console.error("Failed to fetch CV:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCV();
  }, [fetchCV]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setError(null);
    setSuccess(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/cv/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to upload CV");
        return;
      }

      setCv(data.cv);
      setSuccess("CV uploaded successfully!");
    } catch (err) {
      setError("Failed to upload CV. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your CV?")) return;

    setDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/cv/delete", {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete CV");
        return;
      }

      setCv(null);
      setSuccess("CV deleted successfully");
    } catch (err) {
      setError("Failed to delete CV");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
      <h3 className="text-lg font-semibold text-white">Your CV</h3>
      <p className="mt-1 text-[13px] text-[#8898aa]">
        Upload your CV once. We&apos;ll use it for all your job applications.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-400">
          {success}
        </div>
      )}

      {cv ? (
        <div className="mt-6 space-y-4">
          {/* CV Info Card */}
          <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.05] p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-500/20">
              <svg className="h-6 w-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium text-white">{cv.fileName}</p>
              <p className="text-[12px] text-[#8898aa]">
                Uploaded {new Date(cv.uploadedAt).toLocaleDateString()}
              </p>
            </div>
            <a
              href={cv.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/10 px-3 py-2 text-[12px] font-medium text-[#8898aa] transition-colors hover:border-white/20 hover:text-white"
            >
              View
            </a>
          </div>

          {/* Parsed Text Preview */}
          {cv.parsedText && (
            <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
              <p className="text-[12px] font-medium uppercase tracking-wider text-[#8898aa]">Preview</p>
              <p className="mt-2 line-clamp-4 text-[13px] text-[#8898aa]">{cv.parsedText}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/[0.1] px-4 py-2.5 text-[13px] font-medium text-primary transition-colors hover:bg-primary/[0.15]">
                {uploading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Replace CV
                  </>
                )}
              </div>
            </label>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center justify-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-[13px] font-medium text-rose-400 transition-colors hover:bg-rose-500/20"
            >
              {deleting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              )}
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/20 bg-white/[0.03] px-6 py-10 transition-colors hover:border-white/30 hover:bg-white/[0.05]">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
            </div>
            <p className="mt-3 text-[14px] font-medium text-white">
              {uploading ? "Uploading..." : "Click to upload your CV"}
            </p>
            <p className="mt-1 text-[12px] text-[#8898aa]">PDF only, max 5MB</p>
            {uploading && (
              <div className="mt-3 h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            )}
          </label>
        </div>
      )}
    </div>
  );
}
