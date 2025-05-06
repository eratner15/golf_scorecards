# Peel & Eat Golf Scorecards Implementation Plan

This document outlines the steps needed to make the Peel & Eat Golf Scorecards web application production-ready.

## Phase 1: Code Structure and Organization

### 1.1 Modularize JavaScript Code

The current monolithic script.js should be reorganized into a more maintainable structure:

```
/src
  /js
    /core
      app.js          // Application initialization
      state.js        // State management
      ui.js           // UI utilities
      utils.js        // Helper functions
    /games
      nassau.js       // Nassau game implementation
      skins.js        // Skins game implementation
      wolf.js         // Wolf game implementation
      bingo.js        // Bingo Bango Bongo implementation
      bloodsome.js    // Bloodsome implementation
      stableford.js   // Stableford implementation
      banker.js       // Banker/Quota implementation
      vegas.js        // Vegas implementation
    main.js           // Entry point
  /css
    styles.css        // Main styles
    responsive.css    // Responsive design styles
  /assets
    /img
    /icons
  index.html
```

### 1.2 Implement a Build Process

Set up a basic Webpack configuration to bundle the modular code:

1. Install required packages:
```bash
npm init -y
npm install --save-dev webpack webpack-cli webpack-dev-server
npm install --save-dev css-loader style-loader html-webpack-plugin
npm install --save-dev babel-loader @babel/core @babel/preset-env
```

2. Create webpack.config.js:
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './js/core/main.js',
  output: {
    filename: 'bundle.[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      favicon: './assets/favicon.ico'
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 8080,
    hot: true
  },
  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};
```

3. Add scripts to package.json:
```json
"scripts": {
  "start": "webpack serve --mode development",
  "build": "webpack --mode production",
  "test": "jest"
}
```

### 1.3 Error Handling

Implement a consistent error handling approach:

```javascript
// src/js/core/error.js
export class AppError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

export function handleError(error, displayToUser = true) {
  console.error(error);
  
  if (displayToUser) {
    const message = error instanceof AppError 
      ? error.message 
      : 'An unexpected error occurred. Please try again.';
    
    // Use the application's alert system
    showAlert(message, 'error');
  }
  
  // Optional: log to monitoring service
  // logErrorToService(error);
}
```

## Phase 2: Testing Framework

### 2.1 Set Up Testing Environment

1. Install Jest for testing:
```bash
npm install --save-dev jest jest-environment-jsdom @testing-library/dom
```

2. Add Jest configuration to package.json:
```json
"jest": {
  "testEnvironment": "jsdom",
  "moduleNameMapper": {
    "\\.(css|less)$": "<rootDir>/__mocks__/styleMock.js",
    "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/__mocks__/fileMock.js"
  }
}
```

3. Create mock files for styles and assets:
```javascript
// __mocks__/styleMock.js
module.exports = {};

// __mocks__/fileMock.js
module.exports = 'test-file-stub';
```

### 2.2 Sample Unit Tests

```javascript
// tests/utils.test.js
import { formatCurrency, calculateStablefordPoints } from '../src/js/core/utils';

describe('Utility functions', () => {
  test('formatCurrency should format numbers correctly', () => {
    expect(formatCurrency(5)).toBe('$5.00');
    expect(formatCurrency(5.5)).toBe('$5.50');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(-10)).toBe('$10.00');
  });
  
  test('calculateStablefordPoints should calculate standard points correctly', () => {
    expect(calculateStablefordPoints(3, 3, 'standard')).toBe(2); // Par
    expect(calculateStablefordPoints(4, 3, 'standard')).toBe(1); // Bogey
    expect(calculateStablefordPoints(5, 3, 'standard')).toBe(0); // Double bogey
    expect(calculateStablefordPoints(2, 3, 'standard')).toBe(3); // Birdie
    expect(calculateStablefordPoints(1, 3, 'standard')).toBe(4); // Eagle
  });
  
  test('calculateStablefordPoints should calculate modified points correctly', () => {
    expect(calculateStablefordPoints(3, 3, 'modified')).toBe(1); // Par
    expect(calculateStablefordPoints(4, 3, 'modified')).toBe(0); // Bogey
    expect(calculateStablefordPoints(5, 3, 'modified')).toBe(-1); // Double bogey
    expect(calculateStablefordPoints(2, 3, 'modified')).toBe(2); // Birdie
    expect(calculateStablefordPoints(1, 3, 'modified')).toBe(3); // Eagle
  });
});
```

### 2.3 Integration Testing

Create test files for game-specific calculations:

```javascript
// tests/games/nassau.test.js
import { calculateMatchStatus, updateNassauSettlement } from '../src/js/games/nassau';

describe('Nassau game implementation', () => {
  test('calculateMatchStatus should track match progress correctly', () => {
    // Mock score inputs
    const p1Scores = [4, 3, 5, 4];
    const p2Scores = [5, 3, 4, 5];
    
    // Expected hole results (negative means p1 wins)
    const expectedResults = [-1, 0, 1, -1];
    // Expected cumulative match status (positive means p1 is up)
    const expectedStatus = [1, 1, 0, 1];
    
    const { holeResults, matchStatus } = calculateMatchStatus(p1Scores, p2Scores);
    
    expect(holeResults).toEqual(expectedResults);
    expect(matchStatus).toEqual(expectedStatus);
  });
  
  test('updateNassauSettlement calculates settlement correctly', () => {
    // Mock state
    const mockState = {
      wager: 5,
      players: ['Alice', 'Bob'],
      results: {
        matchStatus: [0, 1, 1, 2, 2, 3, 2, 2, 2, 2, 1, 1, 0, 0, -1, -1, -1, -1],
        pressResults: []
      }
    };
    
    const settlement = updateNassauSettlement(mockState);
    
    expect(settlement.front9Value).toBe(5); // Alice +2 after 9
    expect(settlement.back9Value).toBe(-5); // Bob +3 on back 9
    expect(settlement.overallValue).toBe(-5); // Bob -1 overall
    expect(settlement.summaryText).toContain('Alice owes Bob');
  });
});
```

## Phase 3: Performance Optimizations

### 3.1 Code Splitting

Implement dynamic imports for game-specific code:

```javascript
// src/js/main.js
import { showLoading, hideLoading } from './core/ui';

// Only load game code when needed
async function loadGameModule(gameType) {
  showLoading();
  try {
    let gameModule;
    
    switch (gameType) {
      case 'nassau':
        gameModule = await import('./games/nassau.js');
        break;
      case 'skins':
        gameModule = await import('./games/skins.js');
        break;
      // Add other games...
      default:
        throw new Error(`Unknown game type: ${gameType}`);
    }
    
    return gameModule;
  } catch (error) {
    console.error(`Failed to load game module ${gameType}:`, error);
    throw error;
  } finally {
    hideLoading();
  }
}

// Load and initialize game when selected
document.addEventListener('click', async (event) => {
  if (event.target.matches('.game-select-btn')) {
    const gameType = event.target.dataset.game;
    try {
      const gameModule = await loadGameModule(gameType);
      gameModule.initialize();
    } catch (error) {
      handleError(error);
    }
  }
});
```

### 3.2 Service Worker for Offline Support

Create a basic service worker:

```javascript
// src/service-worker.js
const CACHE_NAME = 'peel-and-eat-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/main.js',
  '/styles.css',
  // Add other assets
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, falling back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});
```

Register the service worker in main.js:

```javascript
// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('ServiceWorker registration failed:', error);
      });
  });
}
```

## Phase 4: Data Storage Enhancements

### 4.1 Enhanced LocalStorage with Encryption

```javascript
// src/js/core/storage.js
import CryptoJS from 'crypto-js';

const STORAGE_KEY_PREFIX = 'peelAndEat_';
const SECRET_KEY = 'your-secret-key'; // Consider environment-based keys in production

export function saveToStorage(key, data) {
  try {
    const fullKey = `${STORAGE_KEY_PREFIX}${key}`;
    const serializedData = JSON.stringify(data);
    const encryptedData = CryptoJS.AES.encrypt(serializedData, SECRET_KEY).toString();
    localStorage.setItem(fullKey, encryptedData);
    return true;
  } catch (error) {
    console.error('Failed to save to storage:', error);
    return false;
  }
}

export function loadFromStorage(key) {
  try {
    const fullKey = `${STORAGE_KEY_PREFIX}${key}`;
    const encryptedData = localStorage.getItem(fullKey);
    
    if (!encryptedData) {
      return null;
    }
    
    const decryptedData = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY).toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Failed to load from storage:', error);
    return null;
  }
}

export function removeFromStorage(key) {
  try {
    const fullKey = `${STORAGE_KEY_PREFIX}${key}`;
    localStorage.removeItem(fullKey);
    return true;
  } catch (error) {
    console.error('Failed to remove from storage:', error);
    return false;
  }
}
```

### 4.2 Improved Data Export/Import

```javascript
// src/js/core/export.js
export function exportStateToFile(state, filename = null) {
  try {
    // Add metadata to the state
    const stateToExport = {
      ...state,
      _metadata: {
        version: APP_VERSION,
        timestamp: new Date().toISOString(),
        exported: true
      }
    };
    
    const dataStr = JSON.stringify(stateToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    // Generate filename if not provided
    const defaultFilename = `peel-eat-${state.gameType}-${new Date().toISOString().split('T')[0]}.json`;
    const fileToSave = filename || defaultFilename;
    
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', dataUri);
    downloadLink.setAttribute('download', fileToSave);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    return true;
  } catch (error) {
    console.error('Error exporting state:', error);
    throw new AppError('Failed to export data', 'EXPORT_ERROR', { originalError: error });
  }
}

export function validateImportedState(importedState) {
  // Basic validation
  if (!importedState || typeof importedState !== 'object') {
    throw new AppError('Invalid data format', 'IMPORT_VALIDATION_ERROR');
  }
  
  // Game type validation
  if (!importedState.gameType || !SUPPORTED_GAME_TYPES.includes(importedState.gameType)) {
    throw new AppError('Unsupported or missing game type', 'IMPORT_VALIDATION_ERROR');
  }
  
  // Schema validation (basic example)
  const requiredProps = ['players', 'scores'];
  for (const prop of requiredProps) {
    if (!importedState[prop]) {
      throw new AppError(`Missing required property: ${prop}`, 'IMPORT_VALIDATION_ERROR');
    }
  }
  
  // Game-specific validation could be added here
  
  return true;
}
```

## Phase 5: UI/UX Improvements

### 5.1 Toast Notification System

```javascript
// src/js/core/ui/toast.js
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export default class ToastManager {
  constructor(containerId = 'toast-container') {
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = containerId;
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  }
  
  show(message, type = TOAST_TYPES.INFO, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-icon"></div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" aria-label="Close notification">&times;</button>
      </div>
    `;
    
    // Add close button handler
    toast.querySelector('.toast-close').addEventListener('click', () => {
      this.close(toast);
    });
    
    // Add to container
    this.container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
      toast.classList.add('toast-visible');
    }, 10);
    
    // Auto-close after duration
    if (duration > 0) {
      setTimeout(() => {
        this.close(toast);
      }, duration);
    }
    
    return toast;
  }
  
  close(toast) {
    toast.classList.remove('toast-visible');
    toast.classList.add('toast-hiding');
    
    toast.addEventListener('transitionend', () => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    });
  }
  
  success(message, duration = 3000) {
    return this.show(message, TOAST_TYPES.SUCCESS, duration);
  }
  
  error(message, duration = 5000) {
    return this.show(message, TOAST_TYPES.ERROR, duration);
  }
  
  warning(message, duration = 4000) {
    return this.show(message, TOAST_TYPES.WARNING, duration);
  }
  
  info(message, duration = 3000) {
    return this.show(message, TOAST_TYPES.INFO, duration);
  }
}
```

Add corresponding CSS:

```css
/* toast.css */
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  max-width: 350px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toast {
  background-color: white;
  border-radius: 0.375rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: 0;
  transform: translateY(-20px);
  transition: opacity 0.3s, transform 0.3s;
}

.toast-visible {
  opacity: 1;
  transform: translateY(0);
}

.toast-hiding {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-content {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
}

.toast-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.75rem;
}

.toast-message {
  flex: 1;
  font-size: 0.875rem;
}

.toast-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  margin-left: 0.5rem;
  opacity: 0.6;
}

.toast-close:hover {
  opacity: 1;
}

/* Toast type styling */
.toast-success {
  border-left: 4px solid #10b981;
}

.toast-error {
  border-left: 4px solid #ef4444;
}

.toast-warning {
  border-left: 4px solid #f59e0b;
}

.toast-info {
  border-left: 4px solid #3b82f6;
}
```

### 5.2 Loading States and Transitions

```javascript
// src/js/core/ui/loader.js
export default class LoadingManager {
  constructor(loaderId = 'loading-overlay') {
    this.loader = document.getElementById(loaderId);
    
    if (!this.loader) {
      this.loader = document.createElement('div');
      this.loader.id = loaderId;
      this.loader.className = 'loading-overlay hidden';
      this.loader.innerHTML = `
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <div class="loading-text">Loading...</div>
        </div>
      `;
      document.body.appendChild(this.loader);
    }
    
    this.activePromises = 0;
  }
  
  show(text = null) {
    this.activePromises++;
    
    if (text) {
      const textEl = this.loader.querySelector('.loading-text');
      if (textEl) {
        textEl.textContent = text;
      }
    }
    
    this.loader.classList.remove('hidden');
    return this;
  }
  
  hide() {
    this.activePromises = Math.max(0, this.activePromises - 1);
    
    if (this.activePromises === 0) {
      this.loader.classList.add('hidden');
    }
    
    return this;
  }
  
  async withLoading(promise, text = null) {
    this.show(text);
    
    try {
      return await promise;
    } finally {
      this.hide();
    }
  }
}
```

## Phase 6: Analytics and Monitoring

### 6.1 Simple Analytics Implementation

```javascript
// src/js/core/analytics.js
export default class Analytics {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.userId = options.userId || null;
    this.sessionId = this.generateSessionId();
    this.events = [];
    
    // Initialize tracking
    if (this.enabled) {
      this.trackEvent('session_start', {
        userAgent: navigator.userAgent,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight
      });
    }
  }
  
  generateSessionId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  trackEvent(eventName, eventData = {}) {
    if (!this.enabled) return;
    
    const event = {
      name: eventName,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      ...eventData
    };
    
    this.events.push(event);
    
    // In a real implementation, you might send this to a server
    // this.sendToAnalyticsServer(event);
    
    // For now, just log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Analytics Event:', event);
    }
    
    return event;
  }
  
  trackPageView(pageName) {
    return this.trackEvent('page_view', { page: pageName });
  }
  
  trackGameStart(gameType, players) {
    return this.trackEvent('game_start', { gameType, playerCount: players.filter(Boolean).length });
  }
  
  trackGameComplete(gameType, summary) {
    return this.trackEvent('game_complete', { gameType, ...summary });
  }
  
  trackError(error) {
    return this.trackEvent('error', {
      message: error.message,
      code: error.code || 'UNKNOWN',
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
}
```

## Phase 7: Documentation

### 7.1 Game Rules Documentation

Create detailed documentation for each game type:

```javascript
// src/js/data/gameRules.js
export const gameRules = {
  nassau: {
    title: 'Nassau',
    description: 'The classic golf betting game with three separate bets: front 9, back 9, and overall match.',
    detailedRules: `
# Nassau Rules

The Nassau is a match play format with three separate bets:
1. Front nine
2. Back nine
3. Overall match (all 18 holes)

## Basic Rules:
- Players compete in match play format (holes won/lost/halved)
- Each of the three bets is typically worth the same amount
- The player with the lower score on a hole wins that hole
- If scores are tied, the hole is halved (no points)

## Presses:
- When a player falls behind by 2 or more holes, they can "press" the bet
- A press creates a new bet for the remaining holes
- Presses can be automatic (when a player goes 2-down) or manual

## Scoring:
- Match play scoring is used: Up, Down, or All Square (AS)
- Final settlement combines all three bets plus any presses
    `,
    setupOptions: [
      {
        id: 'wager',
        label: 'Wager per Match',
        type: 'number',
        defaultValue: 5
      },
      {
        id: 'pressRule',
        label: 'Press Rule',
        type: 'select',
        options: [
          { value: 'manual', label: 'Manual Press' },
          { value: 'auto-2down', label: 'Auto 2 Down' },
          { value: 'none', label: 'No Presses' }
        ],
        defaultValue: 'manual'
      }
    ]
  },
  // Add other game rules in similar format
};
```

## Phase 8: Deployment Configuration

### 8.1 Netlify Configuration

Create a netlify.toml file for easy deployment:

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

# Redirect all traffic to index.html for SPA behavior
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Set security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Content-Security-Policy = "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; script-src 'self'"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

# Set cache headers for static assets
[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.woff2"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## Implementation Priorities

1. **Code structure and module system** - This provides the foundation for all other improvements
2. **Testing framework** - Essential for ensuring calculations are accurate
3. **Error handling** - To improve user experience and aid debugging
4. **Data management** - Better storage and export/import options
5. **UI improvements** - Enhance user experience
6. **Offline support** - Crucial for on-course use
7. **Deployment setup** - Prepare for production launch

Each phase should be completed and tested before moving to the next. This incremental approach ensures the application remains functional throughout the development process.
