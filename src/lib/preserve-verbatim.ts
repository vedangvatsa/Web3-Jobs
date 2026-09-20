export function hasVerbatimText(text: string): boolean {
  return /<(?:pre|code)\b|^\s*```/im.test(text);
}

export function transformOutsideVerbatim(text: string, transform: (text: string) => string): string {
  return text.split(/(<pre\b[^>]*>[\s\S]*?<\/pre>|<code\b[^>]*>[\s\S]*?<\/code>|^\s*```[^\n]*\n[\s\S]*?^\s*```[^\S\n]*(?:\n|$))/gim)
    .map((part, index) => {
      if (index % 2) return part;
      const result = transform(part);
      const leading = /^\s+/.exec(part)?.[0] || '';
      const trailing = /\s+$/.exec(part)?.[0] || '';
      return `${/^\s/.test(result) ? '' : leading}${result}${/\s$/.test(result) ? '' : trailing}`;
    }).join('');
}
