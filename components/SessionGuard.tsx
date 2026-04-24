"use client";

import { useEffect, useRef } from "react";
import { logout } from "@/lib/actions";

const INACTIVITY_MS = 60_000;
const EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"] as const;

export default function SessionGuard() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!sessionStorage.getItem("journaler_active")) {
      logout();
      return;
    }

    function reset() {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => logout(), INACTIVITY_MS);
    }

    reset();
    EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }));

    return () => {
      if (timer.current) clearTimeout(timer.current);
      EVENTS.forEach((e) => window.removeEventListener(e, reset));
    };
  }, []);

  return null;
}
