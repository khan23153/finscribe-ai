"use client";
import { useEffect } from "react";

export function ClearCookie() {
  useEffect(() => {
    // Ensure bypass cookie is set for onboarded users
    document.cookie =
      'onboarding-bypass=true; max-age=2592000; path=/; SameSite=lax'
  }, [])
  return null;
}
