const fs = require('fs');
const path = require('path');

function searchDir(dir, pattern, results = []) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
          searchDir(fullPath, pattern, results);
        } else if (pattern.test(file)) {
          results.push({ path: fullPath, size: stat.size });
        }
      } catch (e) {}
    }
  } catch (e) {}
  return results;
}

console.log('Searching for SRC / Leads files in project and Downloads...');
const projectFiles = searchDir('C:\\Users\\user\\Desktop\\PROJECTS\\lms', /\.(csv|xlsx|json|txt)$/i);
const downloadFiles = searchDir('C:\\Users\\user\\Downloads', /(src|lead|contact|student|phone|knust|campaign)/i);

console.log('\n--- In Project ---');
projectFiles.forEach(f => console.log(f.path, `(${f.size} bytes)`));

console.log('\n--- In Downloads ---');
downloadFiles.forEach(f => console.log(f.path, `(${f.size} bytes)`));
