import * as fs from 'fs';
const TOKEN = 'WLGVA8tQgQ6lHyM267pKDys4EEN5kls4SAVvO-TTFtB';
const LINKEDIN_ID = '69c5b139af47dacb695b5feb';

async function run() {
 const res = await fetch(`https://api.bufferapp.com/1/profiles/${LINKEDIN_ID}/updates/pending.json?access_token=${TOKEN}`);
 const data = await res.json();
 console.log(JSON.stringify(data, null, 2));
}
run();
