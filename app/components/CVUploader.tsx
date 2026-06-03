import { RefObject } from "react";

export default function CVUploader({
  uploading,
  onFileChange,
  fileInputRef,
}: {
  uploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="mt-6">
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/20 bg-white/[0.03] px-6 py-10 transition-colors hover:border-white/30 hover:bg-white/[0.05]">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={onFileChange}
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
  );
}
