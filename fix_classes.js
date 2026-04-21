const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

code = code.replace(/dark:hover:text-slate-900 dark:text-white/g, 'dark:hover:text-white');
code = code.replace(/dark:border-slate-300 dark:border-\[#242938\]\/50/g, 'dark:border-[#242938]/50');

code = code.replace(/dark:text-slate-900 dark:text-white/g, 'dark:text-white');

fs.writeFileSync('app/page.tsx', code);
console.log("Fixed classes!");
