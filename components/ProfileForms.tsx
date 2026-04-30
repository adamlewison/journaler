"use client";

import { useActionState } from "react";
import { updateUsername, updatePin } from "@/lib/actions";
import { User, Lock, Download, CheckCircle, AlertCircle } from "lucide-react";

function StatusMessage({ state }: { state: { error: string } | { success: true } | null }) {
  if (!state) return null;
  if ("error" in state) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-red-500 mt-2">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        {state.error}
      </p>
    );
  }
  return (
    <p className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 mt-2">
      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
      Saved successfully.
    </p>
  );
}

const inputClass =
  "w-full bg-[#f2f2f7] dark:bg-[#3a3a3c] text-[#1c1c1e] dark:text-[#f2f2f7] placeholder:text-[#8e8e93] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40";

const btnClass =
  "mt-3 w-full py-2.5 rounded-xl text-sm font-semibold bg-violet-600 dark:bg-violet-500 text-white hover:bg-violet-700 dark:hover:bg-violet-600 transition-colors disabled:opacity-50";

export default function ProfileForms({ username }: { username: string }) {
  const [usernameState, usernameAction, usernamePending] = useActionState(updateUsername, null);
  const [pinState, pinAction, pinPending] = useActionState(updatePin, null);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

      {/* Username */}
      <section className="bg-white dark:bg-[#2c2c2e] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <h2 className="text-sm font-semibold text-[#1c1c1e] dark:text-[#f2f2f7]">Username</h2>
        </div>
        <form action={usernameAction}>
          <input
            name="username"
            defaultValue={username}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={32}
            required
            className={inputClass}
          />
          {"error" in (usernameState ?? {}) && (
            <p className="flex items-center gap-1.5 text-xs text-red-500 mt-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {(usernameState as { error: string }).error}
            </p>
          )}
          <button type="submit" disabled={usernamePending} className={btnClass}>
            {usernamePending ? "Saving…" : "Update Username"}
          </button>
        </form>
      </section>

      {/* PIN */}
      <section className="bg-white dark:bg-[#2c2c2e] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <h2 className="text-sm font-semibold text-[#1c1c1e] dark:text-[#f2f2f7]">PIN Code</h2>
        </div>
        <form action={pinAction} className="space-y-2">
          <input
            name="current_pin"
            type="password"
            inputMode="numeric"
            placeholder="Current 6-digit PIN"
            maxLength={6}
            pattern="\d{6}"
            required
            className={inputClass}
          />
          <input
            name="new_pin"
            type="password"
            inputMode="numeric"
            placeholder="New 6-digit PIN"
            maxLength={6}
            pattern="\d{6}"
            required
            className={inputClass}
          />
          <StatusMessage state={pinState} />
          <button type="submit" disabled={pinPending} className={btnClass}>
            {pinPending ? "Saving…" : "Update PIN"}
          </button>
        </form>
      </section>

      {/* Export */}
      <section className="bg-white dark:bg-[#2c2c2e] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Download className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <h2 className="text-sm font-semibold text-[#1c1c1e] dark:text-[#f2f2f7]">Export Journal</h2>
        </div>
        <p className="text-xs text-[#8e8e93] mb-4">
          Download all your entries as a CSV file.
        </p>
        <a
          href="/journal/export"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold bg-[#f2f2f7] dark:bg-[#3a3a3c] text-[#1c1c1e] dark:text-[#f2f2f7] hover:bg-[#e5e5ea] dark:hover:bg-[#48484a] transition-colors"
        >
          <Download className="w-4 h-4" />
          Download CSV
        </a>
      </section>

    </div>
  );
}
