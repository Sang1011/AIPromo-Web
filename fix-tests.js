const fs = require('fs');
const path = require('path');

const baseDir = 'd:\\AIPromo-Web\\src\\test\\unit\\components\\Staff';

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix store mocks: '../../../store/' -> '../../../store/' (this is correct from subfolder)
  // Actually from 'src/test/unit/components/Staff/{subfolder}/' to 'src/store/'
  // Need: '../../../../../store/'
  content = content.replace(
    /jest\.mock\('\.\.\/\.\.\/\.\.\/store\//g,
    "jest.mock('../../../store/"
  );
  
  // Fix utils mocks
  content = content.replace(
    /jest\.mock\('\.\.\/\.\.\/\.\.\/utils\//g,
    "jest.mock('../../../utils/"
  );
  
  // Fix component mocks
  content = content.replace(
    /jest\.mock\('\.\.\/\.\.\/\.\.\/components\//g,
    "jest.mock('../../../../../components/"
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed:', filePath);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.test.tsx')) {
      fixFile(fullPath);
    }
  }
}

walkDir(baseDir);
console.log('Done!');
