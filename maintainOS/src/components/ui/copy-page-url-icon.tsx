"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Link as LinkIcon, Check } from "lucide-react";
import toast from "react-hot-toast";
import { AppToaster } from "./use-toast";



type Props = {
  value?: string;
  className?: string;
  revertMs?: number;
  toastTitle?: string;
  toastDescription?: string;
};

export default function CopyPageU({
  value,
  className = "inline-flex h-4 w-4 items-center justify-center text-primary cursor-pointer",
  revertMs = 1200,
  toastTitle = "Copied to clipboard!",
  toastDescription,
}: Props) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  const handleCopy = useCallback(async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    setCopied(true); // flip immediately
    const text = value ?? window.location.href;

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly",""); ta.style.position="fixed"; ta.style.opacity="0";
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
    } finally {
      toast.success(toastTitle);
    //   toast({ title: toastTitle, description: toastDescription ?? text, variant: "default" });
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), revertMs);
    }
  }, [value, toast, revertMs, toastTitle, toastDescription]);

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy link"}
      title={copied ? "Copied" : "Copy link"}
      className={className}
    >
      {copied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
    </button>
  );
}
