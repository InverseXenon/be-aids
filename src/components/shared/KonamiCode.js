"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

export default function KonamiCode() {
  const [seq, setSeq] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const handler = (e) => {
      setSeq((prev) => {
        const next = [...prev, e.key].slice(-KONAMI.length);
        if (next.length === KONAMI.length && next.every((k, i) => k === KONAMI[i])) {
          router.push("/bloopers");
        }
        return next;
      });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);

  return null;
}
