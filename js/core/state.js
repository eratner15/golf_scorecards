/**
 * Core state management for golf games
 */

// Current round state
export let currentRoundState = {
    gameType: null, // 'nassau', 'vegas', etc.
    players: [], // Player names
    teams: {}, // Team information for team games
    par: [], // Course par values
    scores: {}, // Player scores
    wager: 5, // Default wager amount
    pressRule: 'manual', // Press rule for Nassau
    presses: [], // Press information for Nassau
    results: {}, // Calculated results
    settlement: {} // Settlement information
};

/**
 * Save current state to localStorage
 */
export function saveState() {
    try {
        localStorage.setItem('golfScorecardState', JSON.stringify(currentRoundState));
    } catch (error) {
        console.error('Error saving state:', error);
    }
}

/**
 * Load state from localStorage
 */
export function loadState() {
    try {
        const savedState = localStorage.getItem('golfScorecardState');
        if (savedState) {
            currentRoundState = JSON.parse(savedState);
            return true;
        }
    } catch (error) {
        console.error('Error loading state:', error);
    }
    return false;
}

/**
 * Clear current state
 */
export function clearState() {
    currentRoundState = {
        gameType: null,
        players: [],
        teams: {},
        par: [],
        scores: {},
        wager: 5,
        pressRule: 'manual',
        presses: [],
        results: {},
        settlement: {}
    };
    localStorage.removeItem('golfScorecardState');
} 