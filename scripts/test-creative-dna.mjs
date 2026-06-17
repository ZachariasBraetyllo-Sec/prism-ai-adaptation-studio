import { readFile } from "node:fs/promises";

const sourceText = await readFile(
  "samples/prism-demo-story.md",
  "utf8"
);

const response = await fetch(
  "http://localhost:3000/api/analyze-creative-dna",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sourceText }),
  }
);

const text = await response.text();

console.log(`Status: ${response.status}`);
console.log(text);