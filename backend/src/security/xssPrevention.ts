/** XSS Prevention */
export const preventXSS = (html: string) => {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;' };
  return html.replace(/[&<>"'/]/g, (char) => map[char]);
};

