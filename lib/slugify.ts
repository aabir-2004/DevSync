export function slugify(text: string): string {
  let slug = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")           // Replace spaces with -
    .replace(/[^\w\-]+/g, "");      // Remove all non-word chars

  // Replace multiple consecutive hyphens with a single hyphen safely
  while (slug.includes("--")) {
    slug = slug.replaceAll("--", "-");
  }

  // Trim hyphens from the start and end using standard string operations
  if (slug.startsWith("-")) {
    slug = slug.substring(1);
  }
  if (slug.endsWith("-")) {
    slug = slug.substring(0, slug.length - 1);
  }

  return slug;
}
