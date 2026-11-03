// A compact display taxonomy. Stored category text remains unchanged and
// searchable; presentation grouping does not change provider requirements.
export function guideCategory(category: string): string {
  const label = category.trim().replace(/\s+/g, " ");
  const value = label.toLowerCase();
  if (
    /project management|project tracking|issue tracking|^work management/.test(
      value,
    )
  )
    return "Project management";
  if (/file storage|cloud storage|^storage$/.test(value)) return "Storage";
  if (/^productivity(?:\s|$|\/)/.test(value)) return "Productivity";
  if (/^developer tools?$/.test(value)) return "Developer tools";
  if (/^communication$/.test(value)) return "Communication";
  return label || "Other";
}
