"use client";

import { useEffect } from "react";
import { unlockAudio } from "@/lib/sounds";

// Invisible component — mounts once and listens for the first
// user gesture to unlock the Web Audio context.
export default function AudioUnlocker() {
  useEffect(() => {
    const unlock = () => {
      unlockAudio();
      // Remove listeners after first interaction
      window.removeEventListener("click",      unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown",    unlock);
    };

    window.addEventListener("click",      unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
    window.addEventListener("keydown",    unlock, { once: true });

    return () => {
      window.removeEventListener("click",      unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown",    unlock);
    };
  }, []);

  return null; // renders nothing
}
