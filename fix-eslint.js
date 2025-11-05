#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to fix common ESLint issues
function fixCommonIssues(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix unescaped entities
    content = content.replace(/'/g, '&apos;');
    content = content.replace(/"/g, '&quot;');
    
    // Fix require() imports (basic pattern)
    content = content.replace(/const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\)/g, 'import $1 from "$2"');
    
    // Fix prefer-const issues (basic pattern)
    content = content.replace(/let\s+(\w+)\s*=\s*([^;]+);(\s*\/\/.*)?$/gm, (match, varName, value, comment) => {
      // Only replace if the variable doesn't seem to be reassigned later
      const lines = content.split('\n');
      const currentLineIndex = content.substring(0, content.indexOf(match)).split('\n').length - 1;
      const remainingLines = lines.slice(currentLineIndex + 1);
      const isReassigned = remainingLines.some(line => 
        line.includes(`${varName} =`) || line.includes(`${varName}++`) || line.includes(`${varName}--`)
      );
      
      if (!isReassigned) {
        return `const ${varName} = ${value};${comment || ''}`;
      }
      return match;
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

// Function to recursively find TypeScript/JavaScript files
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !['node_modules', '.next', '.git'].includes(item)) {
        traverse(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Main execution
const srcDir = path.join(__dirname, 'src');
if (fs.existsSync(srcDir)) {
  const files = findFiles(srcDir);
  console.log(`Found ${files.length} files to process...`);
  
  files.forEach(fixCommonIssues);
  console.log('✅ Common issues fixed!');
} else {
  console.error('src directory not found');
}
