type UploadCardProps = {
  file: File | null;
  dragActive: boolean;
  error: string | null;
  loading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
  onDragOver: () => void;
  onDragLeave: () => void;
};

export default function UploadCard({ file, dragActive, error, loading, fileInputRef, onFileDrop, onFileSelect, onAnalyze, onDragOver, onDragLeave }: UploadCardProps) {
  return (
    <div className="relative">
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] opacity-60 blur-sm" style={{ animation: "gradient-shift 4s ease infinite" }} />
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] opacity-80" style={{ animation: "gradient-shift 4s ease infinite" }} />

      <div className="relative rounded-2xl bg-[#0f2d4d] p-8 sm:p-10">
        <div className="absolute right-6 top-6 h-32 w-32 rounded-full bg-primary/10 blur-[50px]" />

        <div
          onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
          onDragLeave={onDragLeave}
          onDrop={onFileDrop}
          onClick={() => !file && fileInputRef.current?.click()}
          className={`
            group relative cursor-pointer rounded-xl border border-dashed p-10 text-center transition-all duration-300
            ${dragActive
              ? "border-primary bg-primary/10 scale-[1.02]"
              : file
                ? "border-primary/30 bg-primary/[0.05]"
                : "border-white/[0.12] hover:border-white/25 hover:bg-white/[0.03]"
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={onFileSelect}
          />

          {!file ? (
            <>
              <div className="mx-auto mb-6 flex h-20 w-16 flex-col items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] shadow-lg shadow-black/20 transition-transform duration-500 group-hover:-translate-y-1">
                <div className="mb-2 h-1 w-8 rounded-full bg-white/15" />
                <div className="mb-1.5 h-1 w-10 rounded-full bg-white/10" />
                <div className="mb-1.5 h-1 w-7 rounded-full bg-white/10" />
                <div className="h-1 w-9 rounded-full bg-white/10" />
              </div>
              <p className="text-[15px] font-medium text-white">
                Drop your CV here
              </p>
              <p className="mt-1 text-[13px] text-[#8898aa]">
                or <span className="text-primary transition-colors group-hover:text-primary-dark">click to browse</span>
              </p>
              <p className="mt-3 text-[11px] text-[#8898aa]/40">
                PDF or Word &middot; Max 5 MB
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <p className="truncate text-[15px] font-medium text-white">{file.name}</p>
              <p className="mt-0.5 text-[13px] text-[#8898aa]">{(file.size / 1024).toFixed(0)} KB</p>
              <button
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="mt-2 text-[12px] font-medium text-primary/60 transition-colors hover:text-primary"
              >
                Change file
              </button>
            </>
          )}
        </div>

        {error && (
          <p className="mt-4 text-center text-[13px] font-medium text-rose-400">{error}</p>
        )}

        {file && !loading && (
          <button
            onClick={onAnalyze}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[14px] font-semibold text-white transition-all duration-200 hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            Analyze my CV
          </button>
        )}

        {loading && (
          <div className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl bg-white/[0.04] py-3.5">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
            <span className="text-[13px] font-medium text-[#8898aa]">Analyzing your CV&hellip;</span>
          </div>
        )}

        <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-[#8898aa]/40">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          Your CV is analyzed in memory and never stored
        </p>
      </div>
    </div>
  );
}
