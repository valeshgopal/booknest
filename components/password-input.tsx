"use client";

import { useState, type InputHTMLAttributes } from "react";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

/** Password field with a show/hide toggle. `label` names the field in the toggle's accessible name. */
export function PasswordInput({ label, className = "", ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative mt-1.5">
      <input
        {...props}
        type={visible ? "text" : "password"}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        className={`w-full pr-11 ${className}`}
      />
      <button
        type="button"
        aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        aria-pressed={visible}
        aria-controls={props.id}
        onClick={() => setVisible((current) => !current)}
        className="press absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-md text-muted hover:text-ink"
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M1.75 10s3-5.75 8.25-5.75S18.25 10 18.25 10s-3 5.75-8.25 5.75S1.75 10 1.75 10Z" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M8.2 4.45A8.6 8.6 0 0 1 10 4.25c5.25 0 8.25 5.75 8.25 5.75a14 14 0 0 1-2.1 2.85M5.3 5.9A14.2 14.2 0 0 0 1.75 10s3 5.75 8.25 5.75a8 8 0 0 0 3.7-.9" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M8.25 8.2a2.5 2.5 0 0 0 3.55 3.55" strokeLinecap="round" />
      <path d="m3 3 14 14" strokeLinecap="round" />
    </svg>
  );
}
