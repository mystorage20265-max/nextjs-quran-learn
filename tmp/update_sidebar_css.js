const fs = require('fs');
let content = fs.readFileSync('src/components/GlobalSidebar.css', 'utf8');

// replace exact hex
content = content.replace(/#f59e0b/g, 'var(--brand-primary)');
content = content.replace(/#fbbf24/g, 'var(--brand-primary-light)');
content = content.replace(/#d97706/g, 'var(--brand-primary-hover)');
content = content.replace(/#b45309/g, 'var(--brand-primary-active)');

// replace rgb variants for rgba
content = content.replace(/245,\s*158,\s*11/g, 'var(--brand-rgb)');
content = content.replace(/217,\s*119,\s*6/g, 'var(--brand-hover-rgb)');
content = content.replace(/180,\s*83,\s*9/g, 'var(--brand-active-rgb)');
content = content.replace(/251,\s*191,\s*36/g, 'var(--brand-light-rgb)');

fs.writeFileSync('src/components/GlobalSidebar.css', content);
console.log("Colors replaced in GlobalSidebar.css successfully.");
