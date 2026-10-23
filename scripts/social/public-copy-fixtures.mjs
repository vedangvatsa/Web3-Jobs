export function publicThreadFixture(thread) {
  return {
    ...structuredClone(thread),
    posts: thread.posts.map((post, index) => ({
      number: post.number, linkPath: post.linkPath,
      text: `${thread.id}: inspect the evidence for step ${index + 1}.\n\nRun the tests and record the result before relying on the claim.`,
      alt: `Step ${index + 1}: a portfolio evidence checklist with a test command and result.`,
      visual: { headline: 'Inspect the evidence', labels: ['Run the tests', 'Record the result'], composition: 'checklist' },
    })),
  };
}
