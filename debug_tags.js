
import fs from 'fs';

const content = fs.readFileSync('c:\\Users\\kevin\\.gemini\\antigravity\\scratch\\blis-corp\\components\\superadmin\\POSManager.tsx', 'utf8');

function countTags(content) {
    let divOpen = 0;
    let divClose = 0;
    
    // Simple regex for tags, ignoring props for simplicity
    const openingDivs = content.match(/<div(\s|>)/g) || [];
    const closingDivs = content.match(/<\/div>/g) || [];
    
    console.log('Opening divs:', openingDivs.length);
    console.log('Closing divs:', closingDivs.length);
    console.log('Difference:', openingDivs.length - closingDivs.length);
}

countTags(content);
