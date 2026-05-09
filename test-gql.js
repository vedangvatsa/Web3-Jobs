const TOKEN = 'WLGVA8tQgQ6lHyM267pKDys4EEN5kls4SAVvO-TTFtB';
async function run() {
  const res = await fetch('https://api.buffer.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({
      query: `query {
        channel(input: { id: "69c5b139af47dacb695b5feb" }) {
          pending {
            edges { node { id text dueAt } }
          }
        }
      }`
    })
  });
  console.log(JSON.stringify(await res.json(), null, 2));
}
run();
