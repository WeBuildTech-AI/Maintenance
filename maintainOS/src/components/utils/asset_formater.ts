// utils/formatters.ts
export const formatLabel = (value?: string): string => {
  if (!value) return "-";

  return value
    // handle camelCase → words
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    // handle snake_case / kebab-case just in case
    .replace(/[_-]/g, " ")
    // capitalize each word
    .replace(/\w\S*/g, (word) =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
};
