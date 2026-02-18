import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createReadStream, createWriteStream, writeFileSync, mkdirSync } from 'fs';
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

    // Preserve resume state: if a currentItem already exists (loaded from progress),
    // do not overwrite it. Only shuffle / pick next item when starting a fresh session.
    state.randomize = randomize;

    if (!state.currentItem) {
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
    }

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

// Serialize in-progress ranking state to CSV (includes sorted items, current item and insertion progress)
const serializeProgressToCSV = (state) => {
  const extraCols = ['_status', '_sortedIndex', '_isCurrent', '_binaryLow', '_binaryHigh', '_comparisonCount', '_unsortedOrder'];
  const columns = [...state.fieldnames, ...extraCols];

  // Use sets/maps for quick lookup
  const sortedSet = new Set(state.sortedItems);
  const unsortedOrderMap = new Map(state.unsortedItems.map((idx, order) => [idx, order]));

  const rows = state.items.map((item, idx) => {
    const isSorted = sortedSet.has(item);
    const isCurrent = state.currentItem && state.currentItem === item;
    const sortedIndex = isSorted ? state.sortedItems.indexOf(item) : '';
    const unsortedOrder = state.unsortedItems.includes(idx) ? unsortedOrderMap.get(idx) : '';

    return {
      ...item,
      _status: isSorted ? 'sorted' : isCurrent ? 'current' : 'unsorted',
      _sortedIndex: isSorted ? sortedIndex : '',
      _isCurrent: isCurrent ? 'true' : '',
      _binaryLow: isCurrent ? state.binaryLow : '',
      _binaryHigh: isCurrent ? state.binaryHigh : '',
      _comparisonCount: isCurrent ? state.comparisonCount : '',
      _unsortedOrder: unsortedOrder !== undefined ? unsortedOrder : ''
    };
  });

  return stringify(rows, {
    header: true,
    columns
  });
};

// Save in-progress state to server and return CSV (writes file to ./progress/)
app.post('/api/save-progress', (req, res) => {
  try {
    const { sessionId, filename } = req.body;
    const state = rankingStates.get(sessionId);

    if (!state) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const csv = serializeProgressToCSV(state);

    const progressDir = path.join(__dirname, 'progress');
    // ensure directory exists
    mkdirSync(progressDir, { recursive: true });

    const fname = filename && filename.trim().length > 0
      ? filename
      : `progress-${sessionId}-${Date.now()}.csv`;
    const filePath = path.join(progressDir, fname);

    writeFileSync(filePath, csv, 'utf8');

    // return saved path and CSV content (front-end can download or store locally)
    res.json({ success: true, path: `progress/${fname}`, csv });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Load a previously-saved progress CSV and reconstruct server session state
app.post('/api/load-progress', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const rows = parse(req.file.buffer.toString('utf8'), {
      columns: true,
      skip_empty_lines: true
    });

    if (!rows || rows.length === 0) return res.status(400).json({ error: 'CSV is empty' });

    // original fieldnames are keys that do NOT start with '_'
    const allKeys = Object.keys(rows[0]);
    const originalFieldnames = allKeys.filter((k) => !k.startsWith('_'));
    if (originalFieldnames.length === 0) {
      return res.status(400).json({ error: 'No original data columns found in CSV' });
    }

    // Recreate items array (preserve original CSV row order)
    const items = rows.map((r) => {
      const obj = {};
      for (const f of originalFieldnames) obj[f] = r[f] ?? '';
      return obj;
    });

    // Reconstruct sortedItems (use _sortedIndex to order them)
    const sortedRows = rows
      .map((r, idx) => ({ r, idx }))
      .filter(({ r }) => r._status === 'sorted' || (r._sortedIndex !== undefined && r._sortedIndex !== ''))
      .sort((a, b) => Number(a.r._sortedIndex) - Number(b.r._sortedIndex));

    const sortedItems = sortedRows.map(({ idx }) => items[idx]);

    // Reconstruct unsortedItems by _unsortedOrder
    const unsortedRows = rows
      .map((r, idx) => ({ r, idx }))
      .filter(({ r }) => r._status === 'unsorted' || (r._unsortedOrder !== undefined && r._unsortedOrder !== ''))
      .sort((a, b) => {
        const ao = a.r._unsortedOrder === '' ? Infinity : Number(a.r._unsortedOrder);
        const bo = b.r._unsortedOrder === '' ? Infinity : Number(b.r._unsortedOrder);
        return ao - bo;
      });

    const unsortedItems = unsortedRows.map(({ idx }) => idx);

    // Find current item and its binary search state
    const currentRowIndex = rows.findIndex((r) => r._status === 'current');
    const currentItem = currentRowIndex >= 0 ? items[currentRowIndex] : null;
    const currentRow = currentRowIndex >= 0 ? rows[currentRowIndex] : null;

    const binaryLow = currentRow && currentRow._binaryLow !== '' ? Number(currentRow._binaryLow) : 0;
    const binaryHigh = currentRow && currentRow._binaryHigh !== '' ? Number(currentRow._binaryHigh) : sortedItems.length;
    const comparisonCount = currentRow && currentRow._comparisonCount !== '' ? Number(currentRow._comparisonCount) : 0;

    const sessionId = Date.now().toString();

    rankingStates.set(sessionId, {
      items,
      fieldnames: originalFieldnames,
      sortedItems,
      unsortedItems,
      currentItem,
      comparisonCount,
      binaryLow,
      binaryHigh,
      randomize: false
    });

    res.json({ sessionId, itemCount: items.length, fieldnames: originalFieldnames });
  } catch (error) {
    res.status(400).json({ error: error.message });
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
