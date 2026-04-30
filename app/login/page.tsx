"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/actions";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { PinInput } from "@/components/PinInput";

const STORAGE_KEY = "journaler_username";

// ── Background ─────────────────────────────────────────────────────────────────

function HiTechBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#060410]">
      {/* Aurora blobs */}
      <div className="login-aurora-a absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full bg-violet-950/60 blur-[140px]" />
      <div className="login-aurora-b absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 rounded-full bg-purple-950/60 blur-[140px]" />
      <div className="login-aurora-a absolute top-1/3 right-1/4 w-1/3 h-1/3 rounded-full bg-indigo-950/40 blur-[100px]" />
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(139,92,246,0.8) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Top fade */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#060410] to-transparent" />
      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#060410] to-transparent" />
    </div>
  );
}

// ── Card wrapper ───────────────────────────────────────────────────────────────

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-2xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.07] p-6 shadow-[0_8px_60px_rgba(0,0,0,0.5),0_0_80px_rgba(139,92,246,0.05)]">
      {/* Corner brackets */}
      <span className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-violet-500/50 rounded-tl-2xl" />
      <span className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-violet-500/50 rounded-tr-2xl" />
      <span className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-violet-500/50 rounded-bl-2xl" />
      <span className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-violet-500/50 rounded-br-2xl" />
      {children}
    </div>
  );
}

// ── Logo ───────────────────────────────────────────────────────────────────────

function Logo({ subtitle }: { subtitle: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-2xl bg-violet-500/30 blur-2xl scale-[1.6]" />
        <img
          src="/icon.svg"
          alt="Journaler"
          className="relative w-16 h-16 rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.4)]"
        />
      </div>
      <h1 className="text-2xl font-semibold text-white tracking-tight">
        JRNLR
      </h1>
      <p className="mt-1 text-[10px] font-mono tracking-[0.22em] text-violet-400/50 uppercase">
        {subtitle}
      </p>
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
  const pinFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setUsername(stored);
      setStep(2);
    } else {
      usernameRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    if (step === 2) setTimeout(() => pinRefs.current[0]?.focus(), 60);
  }, [step]);

  useEffect(() => {
    if (loginState && "success" in loginState) {
      sessionStorage.setItem("journaler_active", "1");
      router.push("/journal");
    }
  }, [loginState, router]);

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
      <div className="min-h-full flex flex-col items-center justify-center px-4">
        <HiTechBackground />

        <div className="w-full max-w-sm space-y-8">
          <Logo subtitle="Easy access private journaling" />

          <GlassCard>
            <form onSubmit={handleUsernameSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-mono font-semibold text-violet-400/60 uppercase tracking-[0.2em] mb-2.5">
                  Identify
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
                  placeholder="username"
                  className="w-full px-3.5 py-2.5 rounded-xl font-mono text-sm
                             bg-white/5 border border-white/10 text-white
                             placeholder:text-white/20
                             focus:outline-none focus:border-violet-500/60 focus:bg-violet-500/5
                             focus:shadow-[0_0_0_1px_rgba(139,92,246,0.3),0_0_20px_rgba(139,92,246,0.12)]
                             transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={!username.trim()}
                className="group w-full py-3 rounded-xl
                           bg-gradient-to-r from-violet-600 to-purple-700
                           hover:from-violet-500 hover:to-purple-600
                           text-white font-semibold text-sm tracking-wide
                           disabled:opacity-40 disabled:cursor-not-allowed
                           shadow-[0_0_24px_rgba(139,92,246,0.3)]
                           hover:shadow-[0_0_36px_rgba(139,92,246,0.5)]
                           active:scale-[0.99] transition-all duration-200"
              >
                <span className="flex items-center justify-center gap-1.5">
                  Continue
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            </form>
          </GlassCard>

          <p className="text-center text-[11px] font-mono text-white/20">
            New here? Account created automatically.
          </p>
        </div>
      </div>
    );
  }

  // ── Step 2: PIN ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-4">
      <HiTechBackground />

      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center">
          <Logo subtitle="Authentication Required" />
          <div className="flex items-center gap-2 mt-3">
            <span className="text-sm font-mono text-violet-300/60">
              {username}
            </span>
            <span className="text-white/15">·</span>
            <button
              type="button"
              onClick={handleNotMe}
              className="text-[11px] font-mono text-violet-400/50 hover:text-violet-300/70 transition-colors"
            >
              not me
            </button>
          </div>
        </div>

        <GlassCard>
          <form ref={pinFormRef} action={loginAction} className="space-y-5">
            <input type="hidden" name="username" value={username} />
            <input type="hidden" name="pin" value={pin.join("")} />

            <div>
              <label className="block text-[10px] font-mono font-semibold text-violet-400/60 uppercase tracking-[0.2em] mb-3.5">
                6-digit PIN
              </label>
              <PinInput pin={pin} setPin={setPin} inputRefs={pinRefs} formRef={pinFormRef} />
            </div>

            {loginState && "error" in loginState && (
              <p className="text-[11px] font-mono text-red-400/90 text-center">
                ✗ {loginState.error}
              </p>
            )}

            <button
              type="submit"
              disabled={loginPending || pin.join("").length !== 6}
              className="group w-full py-3 rounded-xl
                         bg-gradient-to-r from-violet-600 to-purple-700
                         hover:from-violet-500 hover:to-purple-600
                         text-white font-semibold text-sm tracking-wide
                         disabled:opacity-40 disabled:cursor-not-allowed
                         shadow-[0_0_24px_rgba(139,92,246,0.3)]
                         hover:shadow-[0_0_36px_rgba(139,92,246,0.5)]
                         active:scale-[0.99] transition-all duration-200"
            >
              {loginPending ? (
                <span className="font-mono text-violet-200 text-xs tracking-widest">
                  AUTHENTICATING…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  Sign in
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </button>
          </form>
        </GlassCard>

        <button
          type="button"
          onClick={handleNotMe}
          className="flex items-center gap-1.5 mx-auto text-[11px] font-mono text-white/20 hover:text-white/40 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          different account
        </button>
      </div>
    </div>
  );
}
