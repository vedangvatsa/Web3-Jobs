const STREET_DESIGNATOR = /(?:\b(?:street|st\.?|road|rd\.?|avenue|ave\.?|boulevard|blvd\.?|lane|ln\.?|drive|dr\.?|way|place|pl\.?|square|sq\.?|terrace|highway|hwy\.?|parkway|pkwy\.?|court|ct\.?|close|crescent|mews|quay|wharf|esplanade|promenade|plaza|broadway|green|grn\.?|hill|center|centre|ctr\.?|marg|tower|city|ward|chome|rue|chemin|allee|allée|route|strasse|straße|platz|gasse|via|viale|piazza|calle|carrera|avenida|av\.?|rua|travessa|estrada|jalan|lorong|soi|ro|gil|daero)\b|[路街道巷])/i;
const HOUSE_NUMBER = /(?:^|[\s,])#?\d{1,5}[a-z]?(?:-\d{1,5}[a-z]?)?(?:\/\d{1,5})?(?=$|[\s,])/i;
const KOREAN_LOT_ADDRESS = /\b\d{1,4}(?:-\d{1,4})?\s+[\p{Script=Hangul}A-Za-z0-9-]+-dong\b/iu;

// Require both a house/building number and a street-style designator. This deliberately
// rejects venue labels and locality-only values that Luma sometimes places in streetAddress.
export function hasDetailedStreetAddress(value?: string | null): boolean {
  const address = value?.trim() ?? '';
  if (address.length < 7 || address.length > 250 || !HOUSE_NUMBER.test(address)) return false;
  return STREET_DESIGNATOR.test(address) || KOREAN_LOT_ADDRESS.test(address);
}
