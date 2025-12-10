export const formatDateTime = (isoString?: string) => {
  if (!isoString) return "N/A";
  
  return new Date(isoString).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};