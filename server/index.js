import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createReadStream, createWriteStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Store ranking states in memory
const rankingStates = new Map();

// Parse CSV from buffer
const parseCSV = (buffer) => {
  const content = buffer.toString('utf8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true
  });
};

// Upload and parse CSV
app.post('/api/upload-csv', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const items = parseCSV(req.file.buffer);
    const sessionId = Date.now().toString();

    rankingStates.set(sessionId, {
      items,
      fieldnames: items.length > 0 ? Object.keys(items[0]) : [],
      sortedItems: [],
      unsortedItems: items.map((_, i) => i),
      currentItem: null,
      comparisonCount: 0,
      binaryLow: 0,
      binaryHigh: 0,
      randomize: false
    });

    res.json({
      sessionId,
      itemCount: items.length,
      fieldnames: items.length > 0 ? Object.keys(items[0]) : []
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Load in-progress CSV (first row: sortedCount,binaryLow,binaryHigh; then header + ordered rows)
app.post('/api/load-inprogress', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const raw = req.file.buffer.toString('utf8').replace(/\r\n/g, '\n').trim();
    if (!raw) return res.status(400).json({ error: 'Empty file' });

    const lines = raw.split('\n').filter((l) => l.trim() !== '');
    if (lines.length < 2) return res.status(400).json({ error: 'Invalid in-progress CSV format' });

    const firstParts = lines[0].split(',').map(s => s.trim());
    if (firstParts.length < 3) return res.status(400).json({ error: 'First row must contain three integers: sortedCount,binaryLow,binaryHigh' });

    const sortedCount = parseInt(firstParts[0], 10);
    const binaryLow = parseInt(firstParts[1], 10);
    const binaryHigh = parseInt(firstParts[2], 10);

    if ([sortedCount, binaryLow, binaryHigh].some(v => Number.isNaN(v))) {
      return res.status(400).json({ error: 'First row values must be integers' });
    }

    const restCSV = lines.slice(1).join('\n');
    const items = parse(restCSV, { columns: true, skip_empty_lines: true });

    if (sortedCount < 0 || sortedCount > items.length) return res.status(400).json({ error: 'sortedCount out of range' });
    if (binaryLow < 0 || binaryHigh < 0 || binaryLow > binaryHigh || binaryHigh > sortedCount) {
      return res.status(400).json({ error: 'binaryLow/binaryHigh values are invalid for the provided sortedCount' });
    }

    const sessionId = Date.now().toString();
    const fieldnames = items.length > 0 ? Object.keys(items[0]) : [];

    const sortedItems = items.slice(0, sortedCount);
    let currentItem = null;
    const unsortedItems = [];

    if (sortedCount < items.length) {
      currentItem = items[sortedCount];
      for (let i = sortedCount + 1; i < items.length; i++) unsortedItems.push(i);
    }

    rankingStates.set(sessionId, {
      items,
      fieldnames,
      sortedItems,
      unsortedItems,
      currentItem,
      comparisonCount: 0,
      binaryLow,
      binaryHigh,
      randomize: false
    });

    if (currentItem === null) {
      return res.json({ status: 'complete', sessionId, itemCount: items.length, fieldnames, sortedItems });
    }

    if (binaryLow < binaryHigh) {
      const mid = Math.floor((binaryLow + binaryHigh) / 2);
      return res.json({
        status: 'ranking',
        sessionId,
        leftItem: currentItem,
        rightItem: sortedItems[mid],
        itemsDone: items.length - unsortedItems.length - 1,
        totalItems: items.length,
        comparisons: 0,
        fieldnames
      });
    }

    return res.json({ status: 'ready-to-insert', sessionId, itemCount: items.length, fieldnames, sortedCount, binaryLow, binaryHigh });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start ranking
app.post('/api/start-ranking', (req, res) => {
  try {
    const { sessionId, randomize } = req.body;
    const state = rankingStates.get(sessionId);

    if (!state) {
      return res.status(404).json({ error: 'Session not found' });
    }

    state.randomize = randomize;
    
    if (randomize) {
      for (let i = state.unsortedItems.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.unsortedItems[i], state.unsortedItems[j]] = [
          state.unsortedItems[j],
          state.unsortedItems[i]
        ];
      }
    }

    getNextItem(state);
    showRankingScreen(res, state, sessionId);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get next item to rank
const getNextItem = (state) => {
  if (state.unsortedItems.length === 0) {
    state.currentItem = null;
    return;
  }

  const index = state.unsortedItems.shift();
  state.currentItem = state.items[index];
  state.binaryLow = 0;
  state.binaryHigh = state.sortedItems.length;
  state.comparisonCount = 0;
};

// Check if more comparisons needed
const hasMoreComparisons = (state) => {
  return state.binaryLow < state.binaryHigh;
};

// Get binary search middle
const getBinarySearchMiddle = (state) => {
  return Math.floor((state.binaryLow + state.binaryHigh) / 2);
};

// Show ranking screen
const showRankingScreen = (res, state, sessionId) => {
  if (state.currentItem === null) {
    return res.json({
      status: 'complete',
      sessionId,
      sortedItems: state.sortedItems
    });
  }

  if (!hasMoreComparisons(state)) {
    state.sortedItems.splice(state.binaryLow, 0, state.currentItem);
    getNextItem(state);
    return showRankingScreen(res, state, sessionId);
  }

  const mid = getBinarySearchMiddle(state);
  const leftItem = state.currentItem;
  const rightItem = state.sortedItems[mid];

  res.json({
    status: 'ranking',
    sessionId,
    leftItem,
    rightItem,
    itemsDone: state.items.length - state.unsortedItems.length - 1,
    totalItems: state.items.length,
    comparisons: state.comparisonCount,
    fieldnames: state.fieldnames
  });
};

// Handle comparison choice
app.post('/api/compare', (req, res) => {
  try {
    const { sessionId, currentBetter } = req.body;
    const state = rankingStates.get(sessionId);

    if (!state) {
      return res.status(404).json({ error: 'Session not found' });
    }

    state.comparisonCount += 1;
    const mid = getBinarySearchMiddle(state);

    if (currentBetter) {
      state.binaryHigh = mid;
    } else {
      state.binaryLow = mid + 1;
    }

    showRankingScreen(res, state, sessionId);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save results to CSV
app.post('/api/save-results', (req, res) => {
  try {
    const { sessionId } = req.body;
    const state = rankingStates.get(sessionId);

    if (!state) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const csv = stringify(state.sortedItems, {
      header: true,
      columns: state.fieldnames
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="ranked_results.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save in-progress state to CSV (first row: sortedCount,binaryLow,binaryHigh; then header + ordered rows)
app.post('/api/save-progress', (req, res) => {
  try {
    const { sessionId } = req.body;
    const state = rankingStates.get(sessionId);

    if (!state) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const sortedCount = state.sortedItems.length;
    const binaryLow = typeof state.binaryLow === 'number' ? state.binaryLow : 0;
    const binaryHigh = typeof state.binaryHigh === 'number' ? state.binaryHigh : 0;

    // Build ordered list: already-sorted, currentItem (if any), then remaining unsorted items in queue order
    const ordered = [];
    for (const it of state.sortedItems) ordered.push(it);
    if (state.currentItem) ordered.push(state.currentItem);
    for (const idx of state.unsortedItems) ordered.push(state.items[idx]);

    const csvBody = stringify(ordered, { header: true, columns: state.fieldnames });
    const headerLine = `${sortedCount},${binaryLow},${binaryHigh}\n`;
    const csv = headerLine + csvBody;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="inprogress_results.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clean up session
app.post('/api/cleanup', (req, res) => {
  const { sessionId } = req.body;
  rankingStates.delete(sessionId);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
