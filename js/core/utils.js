/**
 * Core utilities for golf games
 */

/**
 * Format a currency value
 * @param {number} value - The value to format
 * @returns {string} - Formatted currency string
 */
export function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}

/**
 * Format match status text
 * @param {number} status - The match status (positive means p1 is up)
 * @param {number} holesRemaining - Number of holes remaining
 * @param {boolean} isSummary - Whether this is a summary status
 * @param {string} p1Name - Player 1's name
 * @param {string} p2Name - Player 2's name
 * @returns {string} - Formatted status text
 */
export function formatMatchStatus(status, holesRemaining, isSummary, p1Name, p2Name) {
    if (status === 0) {
        return isSummary ? 'All Square' : 'AS';
    }
    
    const absStatus = Math.abs(status);
    const leader = status > 0 ? p1Name : p2Name;
    
    if (isSummary) {
        return `${leader} ${absStatus} UP`;
    }
    
    if (holesRemaining === 0) {
        return `${leader} ${absStatus}`;
    }
    
    return `${leader} ${absStatus} & ${holesRemaining}`;
}

/**
 * Get CSS class for match status
 * @param {number} status - The match status
 * @returns {string} - CSS class name
 */
export function getStatusClass(status) {
    if (status === 0) return 'text-gray-600';
    return status > 0 ? 'text-green-600' : 'text-red-600';
}

/**
 * Validate a golf score
 * @param {number} score - The score to validate
 * @param {number} par - The hole's par
 * @returns {boolean} - Whether the score is valid
 */
export function validateScore(score, par) {
    if (score === null || score === undefined) return false;
    if (score < 1) return false;
    if (score > par + 10) return false; // Allow up to 10 over par
    return true;
}

/**
 * Get CSS class for point values
 * @param {number} value - The point value
 * @returns {string} - CSS class name
 */
export function getValueClass(value) {
    if (value === 0) return 'text-gray-600';
    return value > 0 ? 'text-green-600' : 'text-red-600';
} 