import { useEffect, useState } from "react";

interface RotatingWordsProps {
  words: string[];
  intervalMs?: number;
  className?: string;
}

export function RotatingWords({
  words,
  intervalMs = 2400,
  className,
}: RotatingWordsProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % words.length),
      intervalMs,
    );
    return () => window.clearInterval(id);
  }, [words.length, intervalMs]);

  return (
    <span className="relative inline-block align-top">
      {/* reserve width for the longest word so layout stays stable */}
      <span aria-hidden className="invisible block">
        {words.reduce((a, b) => (b.length > a.length ? b : a), "")}
      </span>
      <span
        key={index}
        className={`absolute inset-0 animate-fade-in ${className ?? ""}`}
      >
        {words[index]}
      </span>
      <span className="sr-only">{words.join(", ")}</span>
    </span>
  );
}
