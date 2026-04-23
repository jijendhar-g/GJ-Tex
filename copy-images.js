const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\JIJEN\\.gemini\\antigravity\\brain\\8344a212-4374-4152-a6ad-6112d26cec7e';
const destDir = path.join(__dirname, 'frontend', 'public', 'images');

// Create destination directory
fs.mkdirSync(destDir, { recursive: true });

const files = {
    'hero_garments_1772951215117.png': 'hero-garments.png',
    'tshirts_category_1772951232287.png': 'tshirts.png',
    'hoodies_category_1772951248334.png': 'hoodies.png',
    'sportswear_category_1772951264205.png': 'sportswear.png',
};

// Copy tshirts as kidswear too
for (const [src, dest] of Object.entries(files)) {
    const srcPath = path.join(srcDir, src);
    const destPath = path.join(destDir, dest);
    fs.copyFileSync(srcPath, destPath);
    console.log('Copied: ' + dest);
}

// Reuse tshirts for kidswear
fs.copyFileSync(
    path.join(srcDir, 'tshirts_category_1772951232287.png'),
    path.join(destDir, 'kidswear.png')
);
console.log('Copied: kidswear.png');

console.log('\nAll images copied to frontend/public/images/');
