// src/store/storage/storage.service.ts

const API_URL = import.meta.env.VITE_API_URL;

type PresignPutResponse = {
  key: string;
  url: string;
  method: "PUT";
  headers: Record<string, string>;
};

type PresignGetResponse = {
  key: string;
  url: string;
  method: "GET";
};

export async function presignPut(contentType: string): Promise<PresignPutResponse> {
  const r = await fetch(`${API_URL}/storage/presign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ op: "put", contentType }),
  });
  if (!r.ok) throw new Error(`presign PUT failed: ${r.status}`);
  return r.json();
}

export async function presignGet(key: string): Promise<PresignGetResponse> {
  const r = await fetch(`${API_URL}/storage/presign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ op: "get", key }),
  });
  if (!r.ok) throw new Error(`presign GET failed: ${r.status}`);
  return r.json();
}

export async function deleteObjects(keys: string[]): Promise<{ results: Array<{ key: string; deleted: boolean }> }> {
  const r = await fetch(`${API_URL}/storage/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keys }),
  });
  if (!r.ok) throw new Error(`delete failed: ${r.status}`);
  return r.json();
}

/**
 * Upload using XHR to get progress + cancellation.
 * Returns a function you can call to cancel (abort).
 */
export function uploadWithProgress(url: string, file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed with status ${xhr.status}`));
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(file);
  });
}


export async function openPresignedGet(key: string, openInNewTab = false): Promise<string> {
  const r = await fetch(`${API_URL}/storage/presign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ op: "get", key }),
  });
  if (!r.ok) throw new Error(`presign GET failed: ${r.status}`);
  const { url } = await r.json();

  if (openInNewTab && url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return url;
}

export async function fetchThumbnailService(key: string): Promise<{ key: string; blobUrl: string }> {
  if (!key) throw new Error("Key is required to fetch thumbnail");

  const response = await fetch(`${API_URL}/storage/thumbnail/${encodeURIComponent(key)}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch thumbnail for key: ${key}`);
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  return { key, blobUrl };
}
