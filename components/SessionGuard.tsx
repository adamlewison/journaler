"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { login, logout } from "@/lib/actions";
import { Lock } from "lucide-react";
import { PinInput } from "@/components/PinInput";

const INACTIVITY_MS = 5 * 60_000; // 5 minutes
const EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"] as const;
const STORAGE_KEY = "journaler_username";

export default function SessionGuard() {
  const [locked, setLocked] = useState(false);
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [loginState, loginAction, loginPending] = useActionState(login, null);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const pinFormRef = useRef<HTMLFormElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lockedRef = useRef(false);

  useEffect(() => {
    if (!sessionStorage.getItem("journaler_active")) {
      logout();
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setUsername(stored);

    function lock() {
      if (lockedRef.current) return;
      lockedRef.current = true;
      setLocked(true);
    }

    function reset() {
      if (lockedRef.current) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(lock, INACTIVITY_MS);
    }

    reset();
    EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      EVENTS.forEach((e) => window.removeEventListener(e, reset));
    };
  }, []);

  // Unlock on successful PIN
  useEffect(() => {
    if (loginState && "success" in loginState) {
      lockedRef.current = false;
      setLocked(false);
      setPin(["", "", "", "", "", ""]);
      // Restart inactivity timer
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        lockedRef.current = true;
        setLocked(true);
      }, INACTIVITY_MS);
    }
  }, [loginState]);

  // Reset PIN on wrong entry
  useEffect(() => {
    if (loginState && "error" in loginState) {
      setPin(["", "", "", "", "", ""]);
      setTimeout(() => pinRefs.current[0]?.focus(), 60);
    }
  }, [loginState]);

  // Focus PIN on lock
  useEffect(() => {
    if (locked) setTimeout(() => pinRefs.current[0]?.focus(), 60);
  }, [locked]);

  if (!locked) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4 bg-[#060410]">
      {/* Aurora background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="login-aurora-a absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full bg-violet-950/60 blur-[140px]" />
        <div className="login-aurora-b absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 rounded-full bg-purple-950/60 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(rgba(139,92,246,0.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center">
          <div className="relative mb-5">
            <div className="absolute inset-0 rounded-2xl bg-violet-500/30 blur-2xl scale-[1.6]" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/80 to-purple-900 flex items-center justify-center border border-violet-400/20 shadow-[0_0_30px_rgba(139,92,246,0.35)]">
              <Lock className="w-7 h-7 text-violet-200" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Locked</h1>
          <p className="mt-1 text-[10px] font-mono tracking-[0.22em] text-violet-400/50 uppercase">
            Session paused · Enter PIN to continue
          </p>
          {username && (
            <p className="mt-2 text-sm font-mono text-violet-300/50">{username}</p>
          )}
        </div>

        {/* Card */}
        <div className="relative rounded-2xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.07] p-6 shadow-[0_8px_60px_rgba(0,0,0,0.5)]">
          <span className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-violet-500/50 rounded-tl-2xl" />
          <span className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-violet-500/50 rounded-tr-2xl" />
          <span className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-violet-500/50 rounded-bl-2xl" />
          <span className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-violet-500/50 rounded-br-2xl" />

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
                  VERIFYING…
                </span>
              ) : (
                "Unlock"
              )}
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={() => logout()}
          className="block mx-auto text-[11px] font-mono text-white/20 hover:text-white/40 transition-colors"
        >
          Sign out instead
        </button>
      </div>
    </div>
  );
}
