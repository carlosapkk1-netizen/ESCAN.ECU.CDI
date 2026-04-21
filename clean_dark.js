const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// The user is asking to restore the colors in dark mode to what they were.
// Currently in the previous run I did things like: 
// text-[#0033FF] dark:text-[#0033FF] dark:text-[#00FF4D] -> which creates duplicate dark classes!
// Let's clean up any duplicate dark classes or messed up colors and make sure dark mode uses #00FF4D for greens and #E70000 for reds

code = code.replace(/dark:text-\[#0033FF\] dark:text-\[#00FF4D\]/g, 'dark:text-[#00FF4D]');
code = code.replace(/dark:text-\[#E70000\] text-3xl/g, 'dark:text-[#E70000] text-3xl');

code = code.replace(/text-\[#0033FF\] dark:text-\[#00FF4D\] text-sm font-bold/g, 'text-[#0033FF] dark:text-[#00FF4D] text-sm font-bold');
// Fix the Status circle which had dark:bg-[#0033FF]
code = code.replace(/dark:bg-\[#0033FF\] dark:bg-\[#00FF4D\]/g, 'dark:bg-[#00FF4D]');
// Fix the text dark mode
code = code.replace(/dark:text-\[#0033FF\] dark:text-\[#00FF4D\]/g, 'dark:text-[#00FF4D]');

fs.writeFileSync('app/page.tsx', code);
console.log("Dark mode duplicates fixed");
