"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import CVUploader from "./CVUploader";
import CVCard from "./CVCard";
import type { CV } from "./types-cv";

export default function CVManager() {
  const [cv, setCv] = useState<CV | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    void fetchCV();
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
        <CVCard
          cv={cv}
          onDelete={handleDelete}
          deleting={deleting}
          onFileChange={handleFileChange}
          uploading={uploading}
        />
      ) : (
        <CVUploader
          uploading={uploading}
          onFileChange={handleFileChange}
          fileInputRef={fileInputRef}
        />
      )}
    </div>
  );
}
