# Espresso Recipe HTML Generator

This application displays espresso recipes and can generate static HTML files with current data.

## Features

- **Dynamic Recipe Display**: Shows 3 espresso recipes with details like bean type, grind size, temperature, etc.
- **Manual HTML Generation**: Click the "Test HTML Generation" button to manually generate HTML files
- **Automatic HTML Generation**: HTML is automatically generated 30 seconds after any data changes
- **Image Management**: Images are automatically copied to the generated output

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser to `http://localhost:3000/index.html`

## API Endpoints

- `GET /get-text` - Fetch current espresso data
- `POST /update-data` - Update espresso data (triggers auto-generation after 30s)
- `POST /generate-html` - Manually generate HTML files

## Generated Files

Generated files are saved in the `generated/` directory:
- `espresso.html` - Static HTML file with current data
- `*.png` - Image files (smallContainer.png, mediumContainer.png, largeContainer.png)

## Usage

### Manual Generation
1. Open the espresso page in your browser
2. Click "Test HTML Generation" button  
3. Files will be generated in the `generated/` folder

### Automatic Generation
1. Update data via the API:
```bash
curl -X POST http://localhost:3000/update-data \
  -H "Content-Type: application/json" \
  -d '{"beanName1":"New Bean Name","weight1":"20g"}'
```
2. HTML will automatically generate after 30 seconds