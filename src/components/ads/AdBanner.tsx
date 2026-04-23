"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { AdSlot } from "@/types";

interface Props {
  slot: AdSlot;
  className?: string;
}

export default function AdBanner({ slot, className }: Props) {
  const { isPro, loading } = useAuth();
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPro || loading) return;
    // Push AdSense ad once container is ready
    try {
      // @ts-expect-error — adsbygoogle is injected by AdSense script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {/* AdSense not loaded yet */}
  }, [isPro, loading]);

  // Pro users — show nothing
  if (isPro) return null;

  // Loading — show skeleton
  if (loading) {
    return <div className={cn("skeleton", className)} />;
  }

  return (
    <div className={cn("ad-slot", className)} ref={adRef}>
      {/* In production, replace this div with an AdSense ins tag:
          <ins className="adsbygoogle"
               style={{ display: "block" }}
               data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
               data-ad-slot="XXXXXXXXXX"
               data-ad-format="auto"
               data-full-width-responsive="true" />
      */}
      <span>Advertisement · <a href="/pro" style={{ color: "var(--accent)" }}>Remove ads →</a></span>
    </div>
  );
}
