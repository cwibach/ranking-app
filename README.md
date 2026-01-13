# Full-Stack Ranking Application

NOTE: So far all code & Rest of README generated with Copilot as an experiment. Many changes will be coming by myself.

A modern web application for ranking CSV data through pairwise comparisons using binary insertion sort. Built with React + TypeScript (frontend) and Node.js + Express (backend).

## Features

- 📊 CSV file upload and parsing
- 🔄 Pairwise comparison ranking interface
- ⚡ Binary insertion sort algorithm (efficient ranking)
- 💾 Save/resume progress functionality
- 🔀 Randomization option to remove ordering bias
- 📥 Export ranked results to CSV
- 🎨 Modern, professional UI with responsive design

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, CSS
- **Backend**: Node.js, Express.js
- **Data Processing**: CSV parsing and stringification
- **Server Port**: 5000
- **Client Port**: 3000

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Install frontend dependencies:
```bash
npm install
```

2. Install backend dependencies:
```bash
cd server
npm install
cd ..
```

### Development

Start the backend server (in one terminal):
```bash
npm run dev:server
```

Start the frontend dev server (in another terminal):
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Building

```bash
npm run build
```

## Project Structure

```
ranking-app/
├── src/
│   ├── components/
│   │   ├── FileSelection.tsx    # CSV upload interface
│   │   ├── RankingOptions.tsx   # Configuration screen
│   │   ├── RankingScreen.tsx    # Pairwise comparison UI
│   │   └── Results.tsx          # Final results display
│   ├── App.tsx                   # Main application component
│   └── App.css                   # Global styling
├── server/
│   ├── index.js                  # Express API server
│   └── package.json              # Backend dependencies
├── package.json                  # Frontend dependencies
└── vite.config.ts               # Vite configuration
```

## API Endpoints

- `POST /api/upload-csv` - Upload and parse CSV file
- `POST /api/start-ranking` - Initialize ranking session
- `POST /api/compare` - Submit comparison choice
- `POST /api/save-results` - Download ranked results as CSV
- `POST /api/cleanup` - Clean up session

## Algorithm

The application uses **binary insertion sort** for efficient ranking:

1. First item is automatically added to sorted list
2. For each new item, binary search determines insertion position
3. User makes pairwise comparisons to guide the search
4. Item is inserted at determined position
5. Process repeats until all items are ranked

**Time Complexity**: O(n²) comparisons worst case, but only O(log n) per item due to binary search optimization.

## Color Scheme

- Primary Blue: #1565c0
- Success Green: #2e7d32
- Accent Orange: #f57c00
- Light Background: #f5f5f5

## Future Features

- Session persistence to database
- Batch processing of multiple CSV files
- Custom comparison criteria
- Undo/redo during ranking
- Multiple ranking algorithms

## License

MIT
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
