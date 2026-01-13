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

// Clean up session
app.post('/api/cleanup', (req, res) => {
  const { sessionId } = req.body;
  rankingStates.delete(sessionId);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
