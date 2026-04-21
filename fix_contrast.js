const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// Boost light mode text colors for accessibility (WCAG)
code = code.replace(/text-slate-200\b/g, 'text-slate-600');
code = code.replace(/text-slate-300\b/g, 'text-slate-600');
code = code.replace(/text-slate-400\b/g, 'text-slate-700');
code = code.replace(/text-slate-500\b/g, 'text-slate-800');
code = code.replace(/text-gray-400\b/g, 'text-slate-700');
code = code.replace(/text-gray-500\b/g, 'text-slate-800');

// Counter numbers and strong labels
code = code.replace(/text-4xl font-bold font-mono/g, 'text-5xl font-black font-mono text-slate-900');
code = code.replace(/text-5xl font-bold font-mono/g, 'text-6xl font-black font-mono text-slate-900');

fs.writeFileSync('app/page.tsx', code);
console.log("Contrast improved!");
