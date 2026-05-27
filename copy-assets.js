const fs = require('fs');
const path = require('path');

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  let entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy templates
if (fs.existsSync('src/templates')) {
  copyDirSync('src/templates', 'dist/templates');
  console.log('Templates copied successfully.');
}

// Copy swagger.json
if (fs.existsSync('src/swagger.json')) {
  fs.copyFileSync('src/swagger.json', 'dist/swagger.json');
  console.log('swagger.json copied successfully.');
}
