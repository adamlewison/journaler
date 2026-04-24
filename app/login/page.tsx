"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/actions";
import { BookOpen, ArrowLeft } from "lucide-react";

const STORAGE_KEY = "journaler_username";

// ── PIN input ──────────────────────────────────────────────────────────────────

function PinInput({
  pin,
  setPin,
  inputRefs,
}: {
  pin: string[];
  setPin: (p: string[]) => void;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
}) {
  function handleChange(i: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...pin];
    next[i] = value;
    setPin(next);
    if (value && i < 5) inputRefs.current[i + 1]?.focus();
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
  }

  return (
    <div className="flex gap-2 justify-between" onPaste={handlePaste}>
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
          className="w-11 h-14 text-center text-2xl font-bold rounded-xl bg-[#f2f2f7] dark:bg-[#2c2c2e] text-[#1c1c1e] dark:text-[#f2f2f7] focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 caret-transparent tracking-widest"
        />
      ))}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [loginState, loginAction, loginPending] = useActionState(login, null);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const usernameRef = useRef<HTMLInputElement>(null);

  // On mount: restore remembered username and jump straight to PIN step
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setUsername(stored);
      setStep(2);
    } else {
      usernameRef.current?.focus();
    }
  }, []);

  // Focus first PIN cell when step 2 becomes active
  useEffect(() => {
    if (step === 2) {
      // Small delay so the DOM has rendered
      setTimeout(() => pinRefs.current[0]?.focus(), 60);
    }
  }, [step]);

  // Navigate to journal on success, setting the per-tab sessionStorage flag first
  useEffect(() => {
    if (loginState && "success" in loginState) {
      sessionStorage.setItem("journaler_active", "1");
      router.push("/journal");
    }
  }, [loginState, router]);

  // Reset PIN whenever login fails so the user starts fresh
  useEffect(() => {
    if (loginState && "error" in loginState) {
      setPin(["", "", "", "", "", ""]);
      setTimeout(() => pinRefs.current[0]?.focus(), 60);
    }
  }, [loginState]);

  function handleUsernameSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = username.trim().toLowerCase();
    if (!name) return;
    setUsername(name);
    localStorage.setItem(STORAGE_KEY, name);
    setStep(2);
  }

  function handleNotMe() {
    localStorage.removeItem(STORAGE_KEY);
    setUsername("");
    setPin(["", "", "", "", "", ""]);
    setStep(1);
    setTimeout(() => usernameRef.current?.focus(), 60);
  }

  // ── Step 1: username ──────────────────────────────────────────────────────

  if (step === 1) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center bg-[#f2f2f7] dark:bg-[#1c1c1e] px-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center mb-4 shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-[#1c1c1e] dark:text-[#f2f2f7]">Journaler</h1>
            <p className="text-sm text-[#8e8e93] mt-1">Your personal journal</p>
          </div>

          <div className="bg-white dark:bg-[#2c2c2e] rounded-2xl shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10 p-6">
            <form onSubmit={handleUsernameSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#8e8e93] uppercase tracking-wider mb-2">
                  Username
                </label>
                <input
                  ref={usernameRef}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="username"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-[#f2f2f7] dark:bg-[#3a3a3c] text-[#1c1c1e] dark:text-[#f2f2f7] text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 placeholder:text-[#c7c7cc] dark:placeholder:text-[#48484a]"
                  placeholder="your username"
                />
              </div>

              <button
                type="submit"
                disabled={!username.trim()}
                className="w-full py-3 rounded-xl bg-violet-600 dark:bg-violet-500 text-white font-semibold text-sm hover:bg-violet-700 dark:hover:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-[#8e8e93] mt-4">
            New here? An account will be created automatically.
          </p>
        </div>
      </div>
    );
  }

  // ── Step 2: PIN ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-full flex flex-col items-center justify-center bg-[#f2f2f7] dark:bg-[#1c1c1e] px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[#1c1c1e] dark:text-[#f2f2f7]">Welcome back</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-[#8e8e93]">{username}</p>
            <button
              type="button"
              onClick={handleNotMe}
              className="text-sm text-violet-600 dark:text-violet-400 hover:underline"
            >
              Not me
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#2c2c2e] rounded-2xl shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10 p-6">
          <form action={loginAction} className="space-y-5">
            <input type="hidden" name="username" value={username} />
            <input type="hidden" name="pin" value={pin.join("")} />

            <div>
              <label className="block text-xs font-semibold text-[#8e8e93] uppercase tracking-wider mb-3">
                Enter your 6-digit PIN
              </label>
              <PinInput pin={pin} setPin={setPin} inputRefs={pinRefs} />
            </div>

            {loginState && "error" in loginState && (
              <p className="text-sm text-red-500">{loginState.error}</p>
            )}

            <button
              type="submit"
              disabled={loginPending || pin.join("").length !== 6}
              className="w-full py-3 rounded-xl bg-violet-600 dark:bg-violet-500 text-white font-semibold text-sm hover:bg-violet-700 dark:hover:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loginPending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={handleNotMe}
          className="flex items-center gap-1 mx-auto mt-4 text-xs text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7] transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Use a different account
        </button>
      </div>
    </div>
  );
}
