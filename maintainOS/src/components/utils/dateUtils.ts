/**
 * Formats a date string, timestamp, or Date object into "DD/MM/YYYY".
 * Optionally includes time as "DD/MM/YYYY, HH:MM AM/PM".
 *
 * @param dateInput - The date value to format (ISO string, Date object, or timestamp).
 * @param includeTime - Whether to append the time (default: false).
 * @returns The formatted date string or "N/A" if invalid/null.
 */
export function formatDate(
  dateInput?: string | Date | number | null,
  includeTime: boolean = false
): string {
  if (!dateInput) return "N/A";

  const date = new Date(dateInput);

  // Safely handle invalid dates
  if (isNaN(date.getTime())) return "N/A";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const dateString = `${day}/${month}/${year}`;

  if (includeTime) {
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12; // Convert 0 to 12
    return `${dateString}, ${formattedHours}:${minutes} ${ampm}`;
  }

  return dateString;
}