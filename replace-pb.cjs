const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\srees\\Downloads\\paradox_tor\\Paradox-player\\src\\components';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.tsx')) {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes('pb-32')) {
      content = content.replace(/pb-32/g, 'pb-40 md:pb-32');
      fs.writeFileSync(fullPath, content);
      console.log(`Updated ${file}`);
    }
  }
});
