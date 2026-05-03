import { useEffect, useRef } from "react";

type Props = {
  src: string;
  poster?: string;
  className?: string;
  /** Defaults to true. Pause when off-screen for performance. */
  pauseWhenOffscreen?: boolean;
  testid?: string;
  objectPosition?: string;
};

export function AutoVideo({
  src,
  poster,
  className = "",
  pauseWhenOffscreen = true,
  testid,
  objectPosition = "center",
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!pauseWhenOffscreen || !ref.current) return;
    const vid = ref.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!ref.current) return;
        if (entry.isIntersecting) {
          ref.current.play().catch(() => {});
        } else {
          ref.current.pause();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(vid);
    return () => io.disconnect();
  }, [pauseWhenOffscreen]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      className={`w-full h-full object-cover ${className}`}
      style={{ objectPosition }}
      data-testid={testid}
    />
  );
}
