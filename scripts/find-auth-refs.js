const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, '../src'));
const patterns = ['useAuthStore', 'accessToken', 'setAuth', 'clearAuth'];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const matched = [];
  patterns.forEach(pat => {
    if (content.includes(pat)) {
      matched.push(pat);
    }
  });
  if (matched.length > 0) {
    console.log(`${path.relative(path.join(__dirname, '..'), file)}: matches [${matched.join(', ')}]`);
  }
});
