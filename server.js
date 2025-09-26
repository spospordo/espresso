const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Mock espresso data - this would normally come from a database
let espressoData = {
    beanName1: "Arabica Blend",
    roastDate1: "2024-01-15", 
    weight1: "18g",
    grind1: "Fine",
    tempIn1: "93°C",
    pressure1: "9 bar",
    soak1: "30s",
    notes1: "Smooth, chocolatey",
    time1: "28s",
    weightOut1: "36g",
    
    beanName2: "Ethiopian Yirgacheffe",
    roastDate2: "2024-01-12",
    weight2: "20g", 
    grind2: "Medium-Fine",
    tempIn2: "91°C",
    pressure2: "9 bar",
    soak2: "25s",
    notes2: "Floral, citrusy",
    time2: "30s",
    weightOut2: "40g",
    
    beanName3: "Colombian Supremo",
    roastDate3: "2024-01-10",
    weight3: "19g",
    grind3: "Fine",
    tempIn3: "92°C", 
    pressure3: "9 bar",
    soak3: "35s",
    notes3: "Nutty, balanced",
    time3: "26s",
    weightOut3: "38g"
};

let changeTimeout = null;

// Endpoint to get espresso data
app.get('/get-text', (req, res) => {
    res.json(espressoData);
});

// Endpoint to update espresso data
app.post('/update-data', (req, res) => {
    try {
        espressoData = { ...espressoData, ...req.body };
        
        // Clear existing timeout and set a new one for 30 seconds
        if (changeTimeout) {
            clearTimeout(changeTimeout);
        }
        
        changeTimeout = setTimeout(() => {
            console.log('Auto-generating HTML after data change...');
            generateHTMLFile();
        }, 30000); // 30 seconds
        
        res.json({ success: true, message: 'Data updated, HTML generation scheduled' });
    } catch (error) {
        console.error('Error updating data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Manual HTML generation endpoint
app.post('/generate-html', (req, res) => {
    try {
        generateHTMLFile();
        res.json({ success: true, message: 'HTML generated successfully' });
    } catch (error) {
        console.error('Error generating HTML:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Function to generate HTML file with current data
async function generateHTMLFile() {
    try {
        console.log('Generating HTML file...');
        
        // Create generated directory if it doesn't exist
        const generatedDir = path.join(__dirname, 'generated');
        if (!fs.existsSync(generatedDir)) {
            fs.mkdirSync(generatedDir, { recursive: true });
        }
        
        // Read the original HTML template
        const htmlTemplate = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
        
        // Replace the dynamic fetching with static data
        let staticHTML = htmlTemplate.replace(
            /fetch\(config\.serverURL\).*?\.catch\(error => console\.error\('Error fetching text values:', error\)\);/s,
            `// Static data embedded in HTML
            const data = ${JSON.stringify(espressoData, null, 8)};
            // Loop through the received text data and update the page content
            for (const key in data) {
                // Update the text content for each dynamic section
                const element = document.getElementById(key);
                if (element) {
                    element.textContent = data[key];
                }
            }`
        );
        
        // Update image paths to use local copies
        staticHTML = staticHTML.replace(
            `import config from './config.js';`,
            `// Static configuration
            const config = {
                imagePaths: {
                    smallContainer: './smallContainer.png',
                    mediumContainer: './mediumContainer.png',
                    largeContainer: './largeContainer.png'
                }
            };`
        );
        
        // Save the generated HTML
        const outputPath = path.join(generatedDir, 'espresso.html');
        fs.writeFileSync(outputPath, staticHTML);
        
        // Copy image files to generated directory
        const imageFiles = ['smallContainer.png', 'mediumContainer.png', 'largeContainer.png'];
        imageFiles.forEach(imageFile => {
            const sourcePath = path.join(__dirname, imageFile);
            const destPath = path.join(generatedDir, imageFile);
            if (fs.existsSync(sourcePath)) {
                fs.copyFileSync(sourcePath, destPath);
                console.log(`Copied ${imageFile} to generated directory`);
            }
        });
        
        console.log(`HTML generated successfully: ${outputPath}`);
        console.log('Images copied to generated directory');
        
        return outputPath;
    } catch (error) {
        console.error('Error in generateHTMLFile:', error);
        throw error;
    }
}

// Start the server
app.listen(PORT, () => {
    console.log(`Espresso server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('  GET /get-text - Fetch espresso data');
    console.log('  POST /update-data - Update espresso data (triggers auto-generation)');
    console.log('  POST /generate-html - Manually generate HTML file');
});

module.exports = app;