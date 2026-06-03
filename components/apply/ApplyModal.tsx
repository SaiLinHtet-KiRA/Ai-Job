"use client";

import { useState, useRef, useEffect, useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import ModalHeader from "./ModalHeader";
import Step0Form from "./Step0Form";
import Step1Form from "./Step1Form";
import SuccessView from "./SuccessView";
import ModalFooter from "./ModalFooter";

interface ApplyModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ApplyModal({ open, onClose }: ApplyModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [positionSearch, setPositionSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [allTitles, setAllTitles] = useState<string[]>([]);
  const [type, setType] = useState("on-site");
  const [salary, setSalary] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const positionAnchorRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const filteredTitles = allTitles
    .filter((t) => t.toLowerCase().includes(positionSearch.toLowerCase()))
    .slice(0, 50);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open) {
      fetch("/api/titles")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setAllTitles(data.map((t: { id: number; name: string }) => t.name));
          }
        })
        .catch(() => {});
    }
  }, [open]);

  const handleClose = useCallback(() => {
    setDropdownOpen(false);
    setStep(0);
    setErrors({});
    onClose();
  }, [onClose]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, handleClose]);

  if (!open) return null;

  function selectPosition(title: string) {
    setPosition(title);
    setPositionSearch(title);
    setDropdownOpen(false);
    setErrors((prev) => ({ ...prev, position: "" }));
  }

  function validateStep0() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email";
    if (!position) errs.position = "Please select a position";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep1() {
    const errs: Record<string, string> = {};
    if (!salary.trim()) errs.salary = "Salary is required";
    if (!resume) errs.resume = "Please upload your resume";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function nextStep() {
    if (step === 0 && validateStep0()) setStep(1);
  }

  function prevStep() {
    setStep(0);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateStep1()) return;

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("position", position);
    formData.append("type", type);
    formData.append("salary", salary);
    formData.append("resume", resume!);

    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("success");
        setName("");
        setEmail("");
        setPosition("");
        setPositionSearch("");
        setType("on-site");
        setSalary("");
        setResume(null);
        if (fileRef.current) fileRef.current.value = "";
        setTimeout(() => {
          onClose();
          setMessage("");
          setStep(0);
          router.push(
            `/results?position=${encodeURIComponent(position)}&name=${encodeURIComponent(name)}`,
          );
        }, 1000);
      } else {
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setMessage("Network error. Please try again.");
    }
    setLoading(false);
  }

  const totalSteps = 2;
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        ref={modalRef}
        className="flex max-h-[92vh] w-full animate-slide-up flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-zinc-900 sm:max-w-lg sm:rounded-3xl"
      >
        <ModalHeader step={step} totalSteps={totalSteps} progress={progress} onClose={handleClose} />

        <form
          id="apply-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 pb-6 pt-6 sm:px-8 sm:pb-8"
        >
          {message === "success" ? (
            <SuccessView />
          ) : (
            <>
              {step === 0 && (
                <Step0Form
                  name={name}
                  email={email}
                  position={position}
                  positionSearch={positionSearch}
                  errors={errors}
                  dropdownOpen={dropdownOpen}
                  filteredTitles={filteredTitles}
                  onNameChange={(v) => { setName(v); setErrors((p) => ({ ...p, name: "" })); }}
                  onEmailChange={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: "" })); }}
                  onPositionSearchChange={(v) => { setPositionSearch(v); setPosition(""); setDropdownOpen(true); setErrors((p) => ({ ...p, position: "" })); }}
                  onPositionSelect={selectPosition}
                  onDropdownOpen={setDropdownOpen}
                  onClearSearch={() => { setPositionSearch(""); setPosition(""); }}
                  dropdownRef={dropdownRef}
                  positionAnchorRef={positionAnchorRef}
                />
              )}
              {step === 1 && (
                <Step1Form
                  type={type}
                  salary={salary}
                  resume={resume}
                  errors={errors}
                  fileRef={fileRef}
                  onTypeChange={setType}
                  onSalaryChange={(v) => { setSalary(v); setErrors((p) => ({ ...p, salary: "" })); }}
                  onResumeChange={(f) => { setResume(f); setErrors((p) => ({ ...p, resume: "" })); }}
                />
              )}
              {message && message !== "success" && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                  {message}
                </div>
              )}
            </>
          )}
        </form>

        {message !== "success" && (
          <ModalFooter
            step={step}
            loading={loading}
            onCancel={handleClose}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
      </div>
    </div>
  );
}
