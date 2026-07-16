"use client";

import { useEffect, useRef, useState } from "react";
import type { AnimationItem } from "lottie-web";
import animationData from "./favorite-heart-animation.json";

export function FavoriteHeart({ active, className = "" }: { active: boolean; className?: string }) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<AnimationItem | null>(null);
  const activeRef = useRef(active);
  const previousActiveRef = useRef(active);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    let cancelled = false;

    void import("lottie-web/build/player/lottie_light").then(({ default: lottie }) => {
      if (cancelled || !containerRef.current) return;
      const animation = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: false,
        autoplay: false,
        animationData,
        rendererSettings: { progressiveLoad: true },
      });
      animation.setSubframe(false);
      const settleToCurrentState = () => animation.goToAndStop(activeRef.current ? 44 : 0, true);
      animation.addEventListener("complete", settleToCurrentState);
      animation.goToAndStop(activeRef.current ? 44 : 0, true);
      animationRef.current = animation;
      setReady(true);
    });

    return () => {
      cancelled = true;
      animationRef.current?.destroy();
      animationRef.current = null;
    };
  }, []);

  useEffect(() => {
    const animation = animationRef.current;
    if (!animation || previousActiveRef.current === active) return;
    previousActiveRef.current = active;

    if (!active) {
      animation.goToAndStop(0, true);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      animation.goToAndStop(44, true);
      return;
    }

    animation.setDirection(1);
    animation.goToAndPlay(0, true);
  }, [active, ready]);

  return (
    <span className={`favorite-heart ${active ? "is-active" : ""} ${className}`.trim()} data-lottie="favorite-heart" aria-hidden="true">
      <span ref={containerRef} className="favorite-heart-lottie" />
      <span className={`favorite-heart-fallback ${ready && active ? "is-hidden" : ""}`}>{active ? "♥" : "♡"}</span>
    </span>
  );
}
