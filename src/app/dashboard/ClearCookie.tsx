"use client";
import { useEffect } from "react";

export function ClearCookie() {
  useEffect(() => {
    // Clear the onboarding bypass cookie now
    // that we are safely on dashboard
    document.cookie =
      'onboarding-bypass=; Max-Age=0; path=/'
  }, [])
  return null;
}
