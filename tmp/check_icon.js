const fs = require('fs');

function getPNGSize(filename) {
    const data = fs.readFileSync(filename);
    if (data.toString('ascii', 1, 4) !== 'PNG') {
        console.error('Not a PNG file');
        return;
    }
    const width = data.readUInt32BE(16);
    const height = data.readUInt32BE(20);
    console.log(`Dimensions: ${width}x${height}`);
}

getPNGSize('c:\\Users\\kevin\\.gemini\\antigravity\\scratch\\blis-corp\\public\\pwa-icon.png');
