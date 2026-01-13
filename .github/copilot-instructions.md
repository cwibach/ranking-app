# Full-Stack Ranking Application

## Project Overview
A modern web application for ranking CSV data through pairwise comparisons using binary insertion sort.

## Tech Stack
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- Styling: Modern card-based UI with blue (#1565c0), green (#2e7d32), orange (#f57c00) color scheme

## Features
✅ CSV file upload and parsing
✅ Pairwise comparison ranking interface
✅ Binary insertion sort algorithm
✅ Randomization option
✅ Export ranked results to CSV
✅ Modern, responsive UI
✅ Full-stack with dedicated frontend and backend

## Running the Application

### Start Backend Server:
```
cd server
node index.js
```
Server runs on http://localhost:5000

### Start Frontend Dev Server (in another terminal):
```
npm run dev
```
Frontend runs on http://localhost:3000

## Project Structure
- `/src` - React components and styling
  - `components/` - FileSelection, RankingOptions, RankingScreen, Results
  - `App.tsx` - Main application logic
  - `App.css` - Global styling
- `/server` - Express backend API
  - `index.js` - API endpoints for CSV upload, ranking, and results
- `/public` - Static assets

## Development Status
✅ Project fully implemented and both servers running
✅ All components created and styled
✅ API endpoints functional
✅ Ready for use
