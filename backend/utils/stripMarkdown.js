// to prevent the markdown leaks before saving to db
export function stripMarkdown(text) {
  if (!text) return "";
  return text
    // Remove bold/italic
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    // Remove headings
    .replace(/^#+\s+/gm, "")
    // Remove > quotes
    .replace(/^>\s+/gm, "")
    // Remove remaining backticks
    .replace(/`/g, "")
    // Remove stray markdown links [text](url)
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1");
}
