const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    let entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Source and Destination paths
const src = path.join(__dirname, '../Frontend/dist');
const dest = path.join(__dirname, '../Backend/public');

if (fs.existsSync(src)) {
    // Clear destination directory first
    if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true, force: true });
    }
    copyDir(src, dest);
    console.log('Frontend build copied successfully to Backend/public!');
} else {
    console.error('Error: Frontend/dist directory does not exist. Please run npm run build on Frontend first.');
    process.exit(1);
}
