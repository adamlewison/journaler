"use client";

import { useEffect } from "react";
import { logout } from "@/lib/actions";

export default function SessionGuard() {
  useEffect(() => {
    if (!sessionStorage.getItem("journaler_active")) {
      logout();
    }
  }, []);

  return null;
}
