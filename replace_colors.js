const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

code = code.replace(/bg-\[#080B12\]/g, 'bg-slate-50 dark:bg-[#080B12]');
code = code.replace(/bg-\[#121620\]/g, 'bg-white dark:bg-[#121620]');
code = code.replace(/bg-\[#0B0E14\]/g, 'bg-slate-100 dark:bg-[#0B0E14]');
code = code.replace(/bg-\[#0A0D14\]/g, 'bg-slate-50 dark:bg-[#0A0D14]');
code = code.replace(/bg-\[#1A1F2D\]/g, 'bg-slate-100 dark:bg-[#1A1F2D]');

// Text colors
code = code.replace(/text-\[#8C92A0\]/g, 'text-slate-500 dark:text-[#8C92A0]');
code = code.replace(/text-\[#ADB0B8\]/g, 'text-slate-700 dark:text-[#ADB0B8]');
code = code.replace(/text-\[#64748B\]/g, 'text-slate-400 dark:text-[#64748B]');
code = code.replace(/text-\[#242938\]/g, 'text-slate-300 dark:text-[#242938]');

// Hover text
code = code.replace(/hover:text-gray-300/g, 'hover:text-slate-600 dark:hover:text-gray-300');
code = code.replace(/hover:text-white/g, 'hover:text-slate-900 dark:hover:text-white');

// Borders
code = code.replace(/border-\[#242938\]\/50/g, 'border-slate-300 dark:border-[#242938]/50');
code = code.replace(/border-\[#242938\]/g, 'border-slate-300 dark:border-[#242938]');

// Shadows
code = code.replace(/shadow-black\/40/g, 'shadow-slate-300/50 dark:shadow-black/40');

// text-white
code = code.replace(/text-white/g, 'text-slate-900 dark:text-white');

// Revert button text specifically
code = code.replace(/Search className="w-5 h-5 text-slate-900 dark:text-white"/g, 'Search className="w-5 h-5 text-white"');
code = code.replace(/<span className="text-slate-900 dark:text-white text-sm font-bold tracking-wider uppercase">Executar Diagnóstico<\/span>/g, '<span className="text-white text-sm font-bold tracking-wider uppercase">Executar Diagnóstico</span>');
code = code.replace(/text-slate-900 dark:text-white hover:text-slate-600/g, 'text-slate-900 dark:text-white hover:text-slate-600');

fs.writeFileSync('app/page.tsx', code);
console.log("Colors replaced!");
