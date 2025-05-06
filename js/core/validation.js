/**
 * Validation utilities for golf games
 */

/**
 * Validate a numeric input
 * @param {number|string} value - The value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {boolean} - Whether the value is valid
 */
export function validateNumericInput(value, min, max) {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
}

/**
 * Validate a state object
 * @param {Object} state - The state to validate
 * @returns {boolean} - Whether the state is valid
 * @throws {Error} - If state is invalid
 */
export function validateState(state) {
    if (!state || typeof state !== 'object') {
        throw new Error('Invalid state: must be an object');
    }

    if (!state.gameType) {
        throw new Error('Invalid state: missing gameType');
    }

    // Game-specific validation
    switch (state.gameType) {
        case 'nassau':
            if (!Array.isArray(state.players) || state.players.length !== 2) {
                throw new Error('Invalid Nassau state: players array must contain 2 players');
            }
            if (typeof state.wager !== 'number' || state.wager < 0) {
                throw new Error('Invalid Nassau state: wager must be a non-negative number');
            }
            break;
        case 'wolf':
            if (!Array.isArray(state.players) || state.players.length !== 4) {
                throw new Error('Invalid Wolf state: players array must contain 4 players');
            }
            if (typeof state.pointValue !== 'number' || state.pointValue < 0) {
                throw new Error('Invalid Wolf state: pointValue must be a non-negative number');
            }
            if (typeof state.loneMultiplier !== 'number' || state.loneMultiplier < 1) {
                throw new Error('Invalid Wolf state: loneMultiplier must be a positive number');
            }
            break;
        // Add other game validations as needed
    }

    return true;
}

/**
 * Validate a score
 * @param {number} score - The score to validate
 * @param {number} par - The hole's par
 * @returns {boolean} - Whether the score is valid
 */
export function validateScore(score, par) {
    if (score === null || score === undefined) return false;
    if (typeof score !== 'number' || isNaN(score)) return false;
    if (score < 1) return false;
    if (score > par + 10) return false; // Allow up to 10 over par
    return true;
}

/**
 * Sanitize input string
 * @param {string} input - The input to sanitize
 * @returns {string} - Sanitized input
 */
export function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.replace(/[<>]/g, '').trim();
}

/**
 * Format error message for display
 * @param {Error} error - The error to format
 * @returns {string} - Formatted error message
 */
export function formatErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
} 