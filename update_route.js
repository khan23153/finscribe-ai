const fs = require('fs');

const filePath = 'src/app/api/ai/route.ts';
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(
  /gemini-2\.0-flash/g,
  'gemini-1.5-flash'
);

content = content.replace(
  "console.error('Gemini error:', JSON.stringify(data))",
  "console.error('Gemini FULL ERROR:', JSON.stringify(data, null, 2))\n      console.error('Gemini status:', response.status)\n      console.error('Gemini key present:', !!process.env.GEMINI_API_KEY)\n      console.error('Gemini key prefix:', process.env.GEMINI_API_KEY?.substring(0, 8))"
);

fs.writeFileSync(filePath, content, 'utf-8');
