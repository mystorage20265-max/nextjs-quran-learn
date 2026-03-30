const fs = require('fs');
let content = fs.readFileSync('src/styles/design-system.css', 'utf8');

// We will inject the RGB variables and also switch the default to Green.

const darkGreenVars = `  /* Default Green Theme - Dark Mode */
  --brand-primary: #10b981;
  --brand-primary-hover: #059669;
  --brand-primary-active: #047857;
  --brand-primary-light: #34d399;
  --brand-rgb: 16, 185, 129;
  --brand-hover-rgb: 5, 150, 105;
  --brand-active-rgb: 4, 120, 87;
  --brand-light-rgb: 52, 211, 153;
  
  --brand-primary-soft: rgba(16, 185, 129, 0.12);
  --brand-primary-glow: rgba(16, 185, 129, 0.2);`;

const lightGreenVars = `  /* Default Green Theme - Light Mode */
  --brand-primary: #059669;
  --brand-primary-hover: #047857;
  --brand-primary-active: #064e3b;
  --brand-primary-light: #10b981;
  --brand-rgb: 5, 150, 105;
  --brand-hover-rgb: 4, 120, 87;
  --brand-active-rgb: 6, 78, 59;
  --brand-light-rgb: 16, 185, 129;
  
  --brand-primary-soft: rgba(5, 150, 105, 0.1);
  --brand-primary-glow: rgba(5, 150, 105, 0.15);`;

// Replace dark mode brand colors
content = content.replace(/\/\* Brand colors - Warm amber gold \*\/[\s\S]*?--brand-primary-glow: rgba\(245, 158, 11, 0\.2\);/, 
  '/* Brand colors */\\n' + darkGreenVars);

// Replace light mode brand colors
content = content.replace(/\/\* Brand colors - Deeper amber for contrast \*\/[\s\S]*?--brand-primary-glow: rgba\(217, 119, 6, 0\.15\);/, 
  '/* Brand colors */\\n' + lightGreenVars);

// Also we should inject the Amber Theme classes so we can toggle
const themeClasses = \`

/* ============ THEME: AMBER ============ */
[data-color-theme="amber"] {
  --brand-primary: #f59e0b;
  --brand-primary-hover: #d97706;
  --brand-primary-active: #b45309;
  --brand-primary-light: #fbbf24;
  --brand-rgb: 245, 158, 11;
  --brand-hover-rgb: 217, 119, 6;
  --brand-active-rgb: 180, 83, 9;
  --brand-light-rgb: 251, 191, 36;
  --brand-primary-soft: rgba(245, 158, 11, 0.12);
  --brand-primary-glow: rgba(245, 158, 11, 0.2);
}

[data-theme="light"][data-color-theme="amber"] {
  --brand-primary: #d97706;
  --brand-primary-hover: #b45309;
  --brand-primary-active: #92400e;
  --brand-primary-light: #f59e0b;
  --brand-rgb: 217, 119, 6;
  --brand-hover-rgb: 180, 83, 9;
  --brand-active-rgb: 146, 64, 14;
  --brand-light-rgb: 245, 158, 11;
  --brand-primary-soft: rgba(217, 119, 6, 0.1);
  --brand-primary-glow: rgba(217, 119, 6, 0.15);
}

/* ============ THEME: GREEN ============ */
[data-color-theme="green"] {
  --brand-primary: #10b981;
  --brand-primary-hover: #059669;
  --brand-primary-active: #047857;
  --brand-primary-light: #34d399;
  --brand-rgb: 16, 185, 129;
  --brand-hover-rgb: 5, 150, 105;
  --brand-active-rgb: 4, 120, 87;
  --brand-light-rgb: 52, 211, 153;
  --brand-primary-soft: rgba(16, 185, 129, 0.12);
  --brand-primary-glow: rgba(16, 185, 129, 0.2);
}

[data-theme="light"][data-color-theme="green"] {
  --brand-primary: #059669;
  --brand-primary-hover: #047857;
  --brand-primary-active: #064e3b;
  --brand-primary-light: #10b981;
  --brand-rgb: 5, 150, 105;
  --brand-hover-rgb: 4, 120, 87;
  --brand-active-rgb: 6, 78, 59;
  --brand-light-rgb: 16, 185, 129;
  --brand-primary-soft: rgba(5, 150, 105, 0.1);
  --brand-primary-glow: rgba(5, 150, 105, 0.15);
}
\`;

content += themeClasses;

fs.writeFileSync('src/styles/design-system.css', content);
console.log("CSS Updated");
