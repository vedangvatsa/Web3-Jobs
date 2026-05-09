const now = new Date();
const count = 5;
const slots = [];
const hours = [1, 9, 17];
const d = new Date(now);
d.setMinutes(0, 0, 0);
while (slots.length < count) {
  for (const h of hours) {
    const slot = new Date(d);
    const utcHour = h < 6 ? (h - 6 + 24) : (h - 6);
    const utcMin = h < 6 ? 30 : 30;
    slot.setUTCHours(utcHour, utcMin, 0, 0);
    if (h < 6) {
      slot.setUTCHours(19, 30, 0, 0);
      slot.setDate(slot.getDate() - 1);
    }
    if (slot > now && slots.length < count) {
      slots.push(new Date(slot));
    }
  }
  d.setDate(d.getDate() + 1);
}
console.log(slots.map(s => s.toISOString()));
