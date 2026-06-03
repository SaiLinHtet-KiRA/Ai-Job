"use client";

import { useState } from "react";

const cardClasses = "rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50";
const btnPrimary = "inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all hover:from-primary-dark hover:to-primary-dark disabled:opacity-50";
const btnSecondary = "inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary-dark dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-primary/40 dark:hover:bg-primary/20 dark:hover:text-primary/80 disabled:opacity-50";

export default function ActionsPage() {
  const [running, setRunning] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev].slice(0, 20));
  };

  const runAction = async (action: string, label: string) => {
    setRunning(action);
    addLog(`Starting: ${label}...`);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setLastRun((prev) => ({ ...prev, [action]: new Date().toISOString() }));
    addLog(`Completed: ${label}`);
    setRunning(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Manual Actions</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Trigger system operations manually</p>

      {/* Matching & Jobs */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Matching & Jobs</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className={cardClasses}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h3 className="mt-3 font-semibold text-zinc-900 dark:text-white">Run Matching</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Match users to jobs and generate daily matches</p>
            {lastRun.matching && (
              <p className="mt-2 text-xs text-zinc-400">Last run: {new Date(lastRun.matching).toLocaleString()}</p>
            )}
            <button 
              onClick={() => runAction("matching", "Daily Matching")}
              disabled={running === "matching"}
              className={`${btnPrimary} mt-4 w-full justify-center`}
            >
              {running === "matching" ? "Running..." : "Run Now"}
            </button>
          </div>

          <div className={cardClasses}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/15">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="mt-3 font-semibold text-zinc-900 dark:text-white">Ingest Jobs</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Fetch new jobs from RSS feeds (Remotive, etc.)</p>
            {lastRun.ingest && (
              <p className="mt-2 text-xs text-zinc-400">Last run: {new Date(lastRun.ingest).toLocaleString()}</p>
            )}
            <button 
              onClick={() => runAction("ingest", "Job Ingestion")}
              disabled={running === "ingest"}
              className={`${btnSecondary} mt-4 w-full justify-center`}
            >
              {running === "ingest" ? "Running..." : "Ingest Now"}
            </button>
          </div>

          <div className={cardClasses}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/15">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h3 className="mt-3 font-semibold text-zinc-900 dark:text-white">Send Digests</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Send daily digest emails to all users with matches</p>
            {lastRun.digest && (
              <p className="mt-2 text-xs text-zinc-400">Last run: {new Date(lastRun.digest).toLocaleString()}</p>
            )}
            <button 
              onClick={() => runAction("digest", "Send Digests")}
              disabled={running === "digest"}
              className={`${btnSecondary} mt-4 w-full justify-center`}
            >
              {running === "digest" ? "Sending..." : "Send Now"}
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Data Management</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className={cardClasses}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="mt-3 font-semibold text-zinc-900 dark:text-white">Re-score All CVs</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Re-run CV scoring for all stored CVs</p>
            <button 
              onClick={() => runAction("rescore", "CV Re-scoring")}
              disabled={running === "rescore"}
              className={`${btnSecondary} mt-4 w-full justify-center`}
            >
              {running === "rescore" ? "Running..." : "Re-score"}
            </button>
          </div>

          <div className={cardClasses}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/15">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <h3 className="mt-3 font-semibold text-zinc-900 dark:text-white">Clear Old Matches</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Delete matches older than 30 days</p>
            <button 
              onClick={() => runAction("cleanup", "Clear Old Matches")}
              disabled={running === "cleanup"}
              className={`${btnSecondary} mt-4 w-full justify-center`}
            >
              {running === "cleanup" ? "Cleaning..." : "Clear Old"}
            </button>
          </div>

          <div className={cardClasses}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/15">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </div>
            <h3 className="mt-3 font-semibold text-zinc-900 dark:text-white">Export All Data</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Download full database backup as JSON</p>
            <button 
              onClick={() => runAction("export", "Data Export")}
              disabled={running === "export"}
              className={`${btnSecondary} mt-4 w-full justify-center`}
            >
              {running === "export" ? "Exporting..." : "Export"}
            </button>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Activity Log</h2>
        <div className={`${cardClasses} mt-4`}>
          {logs.length === 0 ? (
            <p className="text-sm text-zinc-400">No actions run yet. Click a button above to see activity.</p>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {logs.map((log, i) => (
                <p key={i} className="text-xs font-mono text-zinc-600 dark:text-zinc-400">{log}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
