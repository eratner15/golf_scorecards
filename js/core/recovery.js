/**
 * State recovery utilities
 */

import { currentRoundState } from './state.js';
import { validateState } from './validation.js';
import { showAlert } from './ui.js';

/**
 * Attempt to recover state from localStorage
 * @returns {boolean} - Whether recovery was successful
 */
export function attemptStateRecovery() {
    try {
        const savedState = localStorage.getItem('golfGameState');
        if (!savedState) return false;

        const parsedState = JSON.parse(savedState);
        
        // Validate the recovered state
        if (!validateState(parsedState)) {
            console.warn('Recovered state failed validation');
            return false;
        }

        // Restore the state
        Object.assign(currentRoundState, parsedState);
        showAlert('Game state recovered successfully', 'success');
        return true;
    } catch (error) {
        console.error('State recovery failed:', error);
        showAlert('Failed to recover game state', 'error');
        return false;
    }
}

/**
 * Create a state backup
 * @returns {boolean} - Whether backup was successful
 */
export function createStateBackup() {
    try {
        const backup = JSON.stringify(currentRoundState);
        localStorage.setItem('golfGameStateBackup', backup);
        return true;
    } catch (error) {
        console.error('State backup failed:', error);
        return false;
    }
}

/**
 * Restore from state backup
 * @returns {boolean} - Whether restore was successful
 */
export function restoreFromBackup() {
    try {
        const backup = localStorage.getItem('golfGameStateBackup');
        if (!backup) return false;

        const parsedBackup = JSON.parse(backup);
        
        // Validate the backup
        if (!validateState(parsedBackup)) {
            console.warn('Backup state failed validation');
            return false;
        }

        // Restore from backup
        Object.assign(currentRoundState, parsedBackup);
        showAlert('Game state restored from backup', 'success');
        return true;
    } catch (error) {
        console.error('Backup restore failed:', error);
        showAlert('Failed to restore from backup', 'error');
        return false;
    }
}

/**
 * Initialize state recovery system
 */
export function initializeRecovery() {
    // Create initial backup
    createStateBackup();

    // Set up periodic backups
    setInterval(() => {
        createStateBackup();
    }, 60000); // Backup every minute

    // Set up error recovery
    window.addEventListener('error', (event) => {
        console.error('Application error:', event.error);
        if (attemptStateRecovery()) {
            showAlert('Recovered from application error', 'warning');
        }
    });
} 