"use client";

import { useState, useEffect, useRef } from "react";

interface Location {
  id: number;
  name: string;
  jobs_size: number;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  allowCreate?: boolean;
}

const inputClasses =
  "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-primary dark:focus:bg-zinc-800";

export default function LocationSelector({ value, onChange, required, allowCreate = true }: Props) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const endpoint = allowCreate ? "/api/admin/locations" : "/api/locations";
    fetch(endpoint)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setLocations(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = locations
    .filter((l) => l.name.toLowerCase().includes(value.toLowerCase()))
    .sort((a, b) => b.jobs_size - a.jobs_size)
    .slice(0, 50);

  const exactMatch = locations.find(
    (l) => l.name.toLowerCase() === value.trim().toLowerCase()
  );

  function selectLocation(name: string) {
    onChange(name);
    setOpen(false);
  }

  async function createLocation() {
    const name = value.trim();
    if (!name) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const newLocation = await res.json();
        setLocations((prev) => [...prev, newLocation].sort((a, b) => a.name.localeCompare(b.name)));
        selectLocation(newLocation.name);
      }
    } catch {}
    setCreating(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
          />
        </svg>
        <input
          className={`${inputClasses} pl-10 pr-10`}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search location..."
          required={required}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-zinc-200 bg-white py-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <svg className="h-5 w-5 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            </div>
          ) : filtered.length > 0 ? (
            <div className="max-h-56 overflow-y-auto">
              {filtered.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => selectLocation(l.name)}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                    value === l.name
                      ? "bg-primary/10 text-primary-dark dark:bg-primary/20 dark:text-primary/70"
                      : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  }`}
                >
                  <span className="font-medium">{l.name}</span>
                  <span className="text-xs text-zinc-400 tabular-nums">
                    {l.jobs_size} {l.jobs_size === 1 ? "job" : "jobs"}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-zinc-500">No locations found.</div>
          )}

          {value.trim() && !exactMatch && allowCreate && (
            <div className="border-t border-zinc-100 dark:border-zinc-700">
              <button
                type="button"
                onClick={createLocation}
                disabled={creating}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-60 dark:text-primary/80 dark:hover:bg-primary/20"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                {creating ? "Creating..." : `Create "${value.trim()}"`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
