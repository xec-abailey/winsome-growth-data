# Dog Metrics Plotter - Development Setup

A web application for visualizing and analyzing dog growth metrics with interactive charts and data management.

## Development Server

This repository includes multiple options for running a local development server:

### Option 1: Quick Start (Python - Recommended)
```bash
# Start development server on port 3000
python3 -m http.server 3000
```
Then open http://localhost:3000 in your browser.

### Option 2: Using npm scripts
```bash
# Install dependencies (optional, for Node.js server)
npm install

# Start with Python server
npm run dev

# Start with Node.js server (auto-opens browser)
npm run dev-node

# Alternative ports
npm run serve  # Port 8080
```

### Option 3: Using the dev script
```bash
# Default port 3000
./dev-server.sh

# Custom port
./dev-server.sh 8080
```

### Option 4: VS Code Live Server Extension
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Features

- **Interactive Charts**: Scatter plots with configurable X/Y axes
- **Data Filtering**: Filter by sex, sort by columns
- **Data Management**: Add, delete, import/export CSV data  
- **Local Storage**: Changes persist in browser localStorage
- **Responsive Design**: Works on desktop and mobile

## File Structure

```
├── index.html          # Main application
├── data/
│   └── original_data.json  # Source data
├── package.json        # Node.js configuration
├── dev-server.sh      # Development server script
└── README.md          # This file
```

## Development Notes

- The app uses CDN resources (Chart.js, Tailwind CSS) so it needs to be served via HTTP
- Data is loaded from `data/original_data.json` on first visit
- Local changes are saved to browser localStorage
- Export functionality creates downloadable CSV files

## Browser Support

Modern browsers with ES6+ support. Tested on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
