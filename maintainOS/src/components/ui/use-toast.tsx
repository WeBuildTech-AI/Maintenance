// src/components/ui/use-toast.tsx
"use client";

import toastBase, {
  Toaster,
  type ToastOptions as RHTOptions,
  type Renderable,
} from "react-hot-toast";

/** Public API */
export type ToastVariant = "success" | "error" | "info" | "warning" | "neutral";
export type ToastOptions = Omit<RHTOptions, "iconTheme" | "className"> & {
  style?: React.CSSProperties;
};

/** Styling */
const baseStyle: React.CSSProperties = {
  borderRadius: "10px",
  padding: "12px 14px",
  border: "1px solid #1f2937",
  background: "#111827",
  color: "#f9fafb",
  boxShadow:
    "0 10px 15px -3px rgba(0,0,0,.2), 0 4px 6px -2px rgba(0,0,0,.1)",
  maxWidth: "520px",
};

const palettes = {
  success: { primary: "#065f46", secondary: "#ECFDF5", border: "#065f46" },
  error:   { primary: "#7f1d1d", secondary: "#FEF2F2", border: "#7f1d1d" },
  info:    { primary: "#1e3a8a", secondary: "#EFF6FF", border: "#1e3a8a" },
  warning: { primary: "#78350f", secondary: "#FFFBEB", border: "#78350f" },
  neutral: { primary: "#374151", secondary: "#F3F4F6", border: "#374151" },
} as const;

const variantOptions: Record<ToastVariant, RHTOptions> = {
  success: {
    style: { ...baseStyle, borderColor: palettes.success.border },
    iconTheme: { primary: palettes.success.primary, secondary: palettes.success.secondary },
    duration: 3000,
  },
  error: {
    style: { ...baseStyle, borderColor: palettes.error.border },
    iconTheme: { primary: palettes.error.primary, secondary: palettes.error.secondary },
    duration: 4000,
  },
  info: {
    style: { ...baseStyle, borderColor: palettes.info.border },
    iconTheme: { primary: palettes.info.primary, secondary: palettes.info.secondary },
    duration: 3500,
  },
  warning: {
    style: { ...baseStyle, borderColor: palettes.warning.border },
    iconTheme: { primary: palettes.warning.primary, secondary: palettes.warning.secondary },
    duration: 4000,
  },
  neutral: {
    style: { ...baseStyle, borderColor: palettes.neutral.border },
    iconTheme: { primary: palettes.neutral.primary, secondary: palettes.neutral.secondary },
    duration: 3000,
  },
};

function mergeOptions(variant: ToastVariant, opts?: ToastOptions): RHTOptions {
  const v = variantOptions[variant];
  return {
    ...v,
    ...opts,
    style: { ...(v.style ?? {}), ...(opts?.style ?? {}) },
  };
}

/** The wrapper you call everywhere */
export const toast = {
  success: (message: Renderable, opts?: ToastOptions) =>
    toastBase.success(message, mergeOptions("success", opts)),
  error: (message: Renderable, opts?: ToastOptions) =>
    toastBase.error(message, mergeOptions("error", opts)),
  info: (message: Renderable, opts?: ToastOptions) =>
    toastBase(message, mergeOptions("info", opts)),
  warning: (message: Renderable, opts?: ToastOptions) =>
    toastBase(message, mergeOptions("warning", opts)),
  neutral: (message: Renderable, opts?: ToastOptions) =>
    toastBase(message, mergeOptions("neutral", opts)),
  loading: (message: Renderable, opts?: ToastOptions) =>
    toastBase.loading(message, { ...variantOptions.neutral, ...opts }),
  promise<T>(
    p: Promise<T>,
    messages: {
      loading?: Renderable;
      success: Renderable | ((val: T) => Renderable);
      error: Renderable | ((err: any) => Renderable);
    },
    opts?: { loading?: ToastOptions; success?: ToastOptions; error?: ToastOptions }
  ) {
    return toastBase.promise(
      p,
      {
        loading: messages.loading ?? "Working...",
        success: messages.success,
        error: messages.error,
      },
      {
        loading: mergeOptions("neutral", opts?.loading),
        success: mergeOptions("success", opts?.success),
        error: mergeOptions("error", opts?.error),
      }
    );
  },
};

/** Optional hook-style export for compatibility */
export function useToast() {
  return toast;
}

/** Mount once at root */
export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      gutter={8}
      toastOptions={{ style: baseStyle }}
    />
  );
}
