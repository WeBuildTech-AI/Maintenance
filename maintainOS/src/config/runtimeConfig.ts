export type RuntimeConfig = {
  api_url: string;
  socket_url: string;
  maintenance_mode: boolean;
};

let cachedConfig: RuntimeConfig | null = null;

export async function getRuntimeConfig(): Promise<RuntimeConfig> {
  if (cachedConfig) return cachedConfig;

  const res = await fetch(import.meta.env.VITE_RUNTIME_CONFIG_URL, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load runtime config");
  }

  cachedConfig = await res.json();
  return cachedConfig;
}
