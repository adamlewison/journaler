"use client";

import React from "react";

export function PinInput({
  pin,
  setPin,
  inputRefs,
  formRef,
}: {
  pin: string[];
  setPin: (p: string[]) => void;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  formRef: React.RefObject<HTMLFormElement | null>;
}) {
  function handleChange(i: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...pin];
    next[i] = value;
    setPin(next);
    if (value && i < 5) {
      inputRefs.current[i + 1]?.focus();
    } else if (value && i === 5) {
      setTimeout(() => formRef.current?.requestSubmit(), 0);
    }
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !pin[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < digits.length; i++) next[i] = digits[i];
    setPin(next);
    inputRefs.current[Math.min(digits.length, 5)]?.focus();
    if (digits.length === 6) setTimeout(() => formRef.current?.requestSubmit(), 0);
  }

  return (
    <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
      {pin.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="pin-cell w-11 h-[3.25rem] text-center text-xl font-mono font-bold rounded-xl
                     bg-white/5 border border-violet-500/25 text-violet-200
                     focus:outline-none focus:border-violet-400/70 focus:bg-violet-500/10
                     transition-colors duration-150 caret-transparent"
        />
      ))}
    </div>
  );
}
