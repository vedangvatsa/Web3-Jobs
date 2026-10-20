import grammarReview from '../../content/events/grammar-review-2026-10-20.json';

export function expectedEventDescriptionHash(id: string, originalHash: string): string {
  const revision = grammarReview.records.find(record => record.id === id && record.beforeSha256 === originalHash);
  return revision?.afterSha256 || originalHash;
}
