import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { Resend } from "resend";

async function fetchSpreadsheetHtml() {
  const url = "https://docs.google.com/spreadsheets/d/1y3D1zB9IIGJbLeF8aicSYoXxtiZ5kAS25Wj4a5hvovg/htmlview";
  const res = await fetch(url);
  const html = await res.text();
  console.log(`Fetched HTML length: ${html.length}`);
  
  // Extract table rows or text content containing emails / event titles
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = Array.from(new Set(html.match(emailRegex) || []));
  console.log(`Found ${matches.length} unique email addresses in sheet HTML:`);
  console.log(matches);
}

fetchSpreadsheetHtml();
