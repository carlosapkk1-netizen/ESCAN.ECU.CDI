const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// Define our target dark blue neon
const lightBlue = '#0033FF'; // Dark Neon Blue

// Line 146: icon hover
code = code.replace('group-hover:text-[#00FF4D]', `group-hover:text-[${lightBlue}] dark:group-hover:text-[#00FF4D]`);

// Line 210-211: Status circle indicator
code = code.replace('w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center border border-[#00FF4D]/30 shadow-[0_0_10px_rgba(0,255,77,0.2)]', 
                   `w-6 h-6 rounded-full bg-[#0033FF]/10 dark:bg-green-500/20 flex items-center justify-center border border-[${lightBlue}]/30 dark:border-[#00FF4D]/30 shadow-[0_0_10px_rgba(0,51,255,0.2)] dark:shadow-[0_0_10px_rgba(0,255,77,0.2)]`);
code = code.replace('w-3 h-3 rounded-full bg-[#00FF4D]', `w-3 h-3 rounded-full bg-[${lightBlue}] dark:bg-[#00FF4D]`);

// Line 216: Text 'Conectado'
code = code.replace('text-[#00FF4D] text-sm font-bold tracking-wide uppercase', `text-[${lightBlue}] dark:text-[#00FF4D] text-sm font-bold tracking-wide uppercase`);

// Line 221: OBD icon
code = code.replace('border border-[#00FF4D] rounded flex items-center justify-center bg-[#00FF4D]/5 text-[#00FF4D]', 
                   `border border-[${lightBlue}] dark:border-[#00FF4D] rounded flex items-center justify-center bg-[${lightBlue}]/5 dark:bg-[#00FF4D]/5 text-[${lightBlue}] dark:text-[#00FF4D]`);

// Line 309: Big Code Number Result
code = code.replace('text-black dark:text-[#00FF4D] text-6xl font-black font-mono tracking-wider', `text-[${lightBlue}] dark:text-[#00FF4D] text-6xl font-black font-mono tracking-wider`);

// Line 313: Copy Button Icon
code = code.replace('text-slate-500 dark:text-[#00FF4D] hover:text-black dark:hover:text-green-400 p-2 opacity-80 hover:opacity-100 transition-opacity', 
                   `text-[${lightBlue}] dark:text-[#00FF4D] hover:text-[#0011bb] dark:hover:text-green-400 p-2 opacity-80 hover:opacity-100 transition-opacity`);

// Line 340: Verificações Recomendadas Bullet points
code = code.replace(/bg-\[#00FF4D\]/g, `bg-[${lightBlue}] dark:bg-[#00FF4D]`);

// Line 359: Similar code references
code = code.replace('text-[#00FF4D] text-lg font-bold font-mono', `text-[${lightBlue}] dark:text-[#00FF4D] text-lg font-bold font-mono`);

// Line 395: History big code numbers
code = code.replace('text-black dark:text-[#00FF4D] text-base font-bold font-mono', `text-[${lightBlue}] dark:text-[#00FF4D] text-base font-bold font-mono`);

// Line 435/439: Check circle icon info
code = code.replace(/text-\[#00FF4D\]/g, `text-[${lightBlue}] dark:text-[#00FF4D]`);


fs.writeFileSync('app/page.tsx', code);
console.log("Updated colors to neon blue in light mode!");
