import { lazy } from "react";

export function lazyImport<T extends React.ComponentType<any>>(
  factory: () => Promise<any>, // accept any module shape
  name?: string
) {
  return lazy(async () => {
    const mod = await factory();
    // If a name is provided, treat it as a named export
    if (name && mod[name]) {
      return { default: mod[name] as T };
    }
    // Otherwise fallback to default export
    return { default: (mod as { default: T }).default };
  });
}
