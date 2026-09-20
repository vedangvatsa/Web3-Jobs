export type EventDescriptionBlock =
  | { type: 'p' | 'quote' | 'heading' | 'agenda' | 'code'; text: string }
  | { type: 'ul'; items: string[]; children?: Record<number, EventDescriptionBlock[]> }
  | { type: 'ol'; items: Array<{ number: number; text: string }>; children?: Record<number, EventDescriptionBlock[]> };

function separateAgendaEntries(text: string): string {
  const time = '\\d{1,2}:\\d{2}(?:\\s*[ap]\\.?m\\.?)?';
  const slot = new RegExp(`\\b${time}(?:\\s*(?:to|[-–—])\\s*${time})?\\s*(?:[-:|]\\s*|\\s+)(?![ap]\\.?m\\.?\\b)(?=[\\p{L}])`, 'giu');
  return text.split('\n').map(line => {
    const starts = Array.from(line.matchAll(slot), match => match.index!);
    if (starts.length < 2) return line;
    for (let i = starts.length - 1; i >= 0; i--) {
      const index = starts[i];
      const label = /\b[A-Z][\p{L} &/\-]{1,30}:\s*$/u.exec(line.slice(0, index));
      const boundary = label ? label.index : index;
      line = `${line.slice(0, boundary).trimEnd()}\n${line.slice(boundary)}`;
    }
    return line;
  }).join('\n');
}

export function splitEventDescriptionBlocks(text: string): EventDescriptionBlock[] {
  const blocks: EventDescriptionBlock[] = [];
  let separated = true;
  let code: string[] | null = null;
  const lists: Array<{ indent: number; block: Extract<EventDescriptionBlock, { type: 'ul' | 'ol' }> }> = [];

  for (const line of separateAgendaEntries(text.replace(/\r\n?/g, '\n')).replace(/\s+\|\s+(?=\d{1,2}:\d{2})/g, '\n').split('\n')) {
    const trimmed = line.trim();
    if (/^```/.test(trimmed)) {
      if (code) { blocks.push({ type: 'code', text: code.join('\n') }); code = null; }
      else code = [];
      lists.length = 0;
      continue;
    }
    if (code) { code.push(line); continue; }
    if (!trimmed) {
      separated = true;
      continue;
    }
    const last = blocks[blocks.length - 1];
    const bullet = trimmed.match(/^(?:[-•·▪–—]\s*|\*\s+)(\S.*)$/);
    const ordered = trimmed.match(/^(\d+)[.)](?!\d)\s*(\S.*)$/);
    if (bullet || ordered) {
      const indent = line.length - line.trimStart().length;
      while (lists.length && lists[lists.length - 1].indent > indent) lists.pop();
      const parent = lists[lists.length - 1];
      let list = parent?.indent === indent ? parent.block : undefined;
      const type = bullet ? 'ul' : 'ol';
      if (!list || list.type !== type) {
        const created: Extract<EventDescriptionBlock, { type: 'ul' | 'ol' }> = type === 'ul' ? { type, items: [] } : { type, items: [] };
        if (parent && indent > parent.indent) {
          parent.block.children ||= {};
          (parent.block.children[parent.block.items.length - 1] ||= []).push(created);
        } else {
          if (parent?.indent === indent) lists.pop();
          const ancestor = lists[lists.length - 1];
          if (ancestor) (ancestor.block.children![ancestor.block.items.length - 1] ||= []).push(created);
          else blocks.push(created);
        }
        lists.push({ indent, block: created });
        list = created;
      }
      if (list.type === 'ul') list.items.push(bullet![1]);
      else list.items.push({ number: Number(ordered![1]), text: ordered![2] });
    } else if (/^\s{2,}\S/.test(line) && !separated && (last?.type === 'ul' || last?.type === 'ol')) {
      const index = last.items.length - 1;
      if (last.type === 'ul') last.items[index] += `\n${trimmed}`;
      else last.items[index].text += `\n${trimmed}`;
    } else {
      lists.length = 0;
      const markdownHeading = /^#{1,6}\s+/.test(trimmed);
      const agenda = /^(?:Time:\s*)?\d{1,2}:\d{2}\s*(?:am|pm)?(?:\s*[-–—]\s*\d{1,2}:\d{2}\s*(?:am|pm)?)?\s+\S/i.test(trimmed);
      const type = /^>\s?/.test(trimmed) ? 'quote' : markdownHeading && trimmed.length <= 160 ? 'heading' : agenda ? 'agenda' : 'p';
      const content = type === 'quote' ? trimmed.replace(/^>\s?/, '') : markdownHeading ? trimmed.replace(/^#{1,6}\s+/, '') : trimmed;
      if (!separated && last?.type === type && (type === 'p' || type === 'quote')) last.text += `\n${content}`;
      else blocks.push({ type, text: content });
    }
    separated = false;
  }
  if (code) blocks.push({ type: 'code', text: code.join('\n') });
  return blocks;
}
