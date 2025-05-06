// Import core modules
import { currentRoundState, saveState, loadState, clearState } from './state.js';
import { showAlert } from './ui.js';
import { formatCurrency, formatMatchStatus, getStatusClass, validateScore } from './utils.js';
import { validateNumericInput, sanitizeInput } from './validation.js';
import { performanceMonitor } from './performance.js';
import { initializeRecovery, attemptStateRecovery } from './recovery.js';

// Import game implementations
import { 
    generateNassauRows,
    initializeNassau,
    resetNassauDisplay,
    handleNassauPress,
    findCurrentNassauHole,
    populateNassau,
    updateNassau,
    updateNassauSettlement
} from '../games/nassau.js';

import { initializeWolf, updateWolf, resetWolfDisplay } from '../games/wolf.js';

// === GAME IMPLEMENTATION: VEGAS ===

/**
 * Initialize Vegas: Add listeners for team name changes
 */
function initializeVegas() {
    console.log("Init Vegas");
    
    // Listener for Team 1 names
    const t1Header = document.getElementById('vegas-th-t1');
    const pAInput = document.getElementById('vegas-pA-name');
    const pBInput = document.getElementById('vegas-pB-name');
    const pAHeader = document.getElementById('vegas-th-pA');
    const pBHeader = document.getElementById('vegas-th-pB');
    
    const updateT1Names = () => {
        const pA = pAInput && pAInput.value ? pAInput.value : 'A';
        const pB = pBInput && pBInput.value ? pBInput.value : 'B';
        if (t1Header) t1Header.textContent = `Team 1 (${pA}/${pB})`;
        if (pAHeader) pAHeader.textContent = `Score ${pA}`;
        if (pBHeader) pBHeader.textContent = `Score ${pB}`;
        updateVegas(); // Recalculate if names change affects settlement display
    };
    
    if (pAInput) pAInput.addEventListener('input', updateT1Names);
    if (pBInput) pBInput.addEventListener('input', updateT1Names);

    // Listener for Team 2 names
    const t2Header = document.getElementById('vegas-th-t2');
    const pCInput = document.getElementById('vegas-pC-name');
    const pDInput = document.getElementById('vegas-pD-name');
    const pCHeader = document.getElementById('vegas-th-pC');
    const pDHeader = document.getElementById('vegas-th-pD');
    
    const updateT2Names = () => {
        const pC = pCInput && pCInput.value ? pCInput.value : 'C';
        const pD = pDInput && pDInput.value ? pDInput.value : 'D';
        if (t2Header) t2Header.textContent = `Team 2 (${pC}/${pD})`;
        if (pCHeader) pCHeader.textContent = `Score ${pC}`;
        if (pDHeader) pDHeader.textContent = `Score ${pD}`;
        updateVegas(); // Recalculate if names change affects settlement display
    };
    
    if (pCInput) pCInput.addEventListener('input', updateT2Names);
    if (pDInput) pDInput.addEventListener('input', updateT2Names);
    
    // Listeners for point value changes
    const pointValueInput = document.getElementById('vegas-point-value');
    if (pointValueInput) pointValueInput.addEventListener('input', updateVegas);
    
    // Generate scorecard rows if needed
    generateVegasRows();
}

/**
 * Generate Vegas scorecard rows
 */
function generateVegasRows() {
    const tbody = document.getElementById('vegas-scorecard-body');
    if (!tbody || tbody.children.length > 0) return; // Already populated
    
    let html = '';
    
    for (let i = 1; i <= 18; i++) {
        html += `
            <tr id="vegas-row-h${i}">
                <td class="td-std font-medium">${i}</td>
                <td class="td-std"><input type="number" id="vegas-pA-h${i}-score" min="1" max="20" class="input-std input-score" aria-label="Player A Score Hole ${i}"></td>
                <td class="td-std"><input type="number" id="vegas-pB-h${i}-score" min="1" max="20" class="input-std input-score" aria-label="Player B Score Hole ${i}"></td>
                <td class="td-std"><input type="number" id="vegas-pC-h${i}-score" min="1" max="20" class="input-std input-score" aria-label="Player C Score Hole ${i}"></td>
                <td class="td-std"><input type="number" id="vegas-pD-h${i}-score" min="1" max="20" class="input-std input-score" aria-label="Player D Score Hole ${i}"></td>
                <td class="td-std vegas-number" id="vegas-h${i}-t1-num"></td>
                <td class="td-std vegas-number" id="vegas-h${i}-t2-num"></td>
                <td class="td-std font-semibold" id="vegas-h${i}-diff"></td>
            </tr>`;
        
        // Add summary rows
        if (i === 9) {
            html += `
                <tr class="bg-gray-100 font-semibold">
                    <td class="td-std">OUT</td>
                    <td id="vegas-pA-out-score" class="td-std"></td>
                    <td id="vegas-pB-out-score" class="td-std"></td>
                    <td id="vegas-pC-out-score" class="td-std"></td>
                    <td id="vegas-pD-out-score" class="td-std"></td>
                    <td class="td-std" colspan="2"></td>
                    <td id="vegas-out-diff" class="td-std font-bold"></td>
                </tr>`;
        } else if (i === 18) {
            html += `
                <tr class="bg-gray-100 font-semibold">
                    <td class="td-std">IN</td>
                    <td id="vegas-pA-in-score" class="td-std"></td>
                    <td id="vegas-pB-in-score" class="td-std"></td>
                    <td id="vegas-pC-in-score" class="td-std"></td>
                    <td id="vegas-pD-in-score" class="td-std"></td>
                    <td class="td-std" colspan="2"></td>
                    <td id="vegas-in-diff" class="td-std font-bold"></td>
                </tr>
                <tr class="bg-gray-200 font-bold">
                    <td class="td-std">TOTAL</td>
                    <td id="vegas-pA-total-score" class="td-std"></td>
                    <td id="vegas-pB-total-score" class="td-std"></td>
                    <td id="vegas-pC-total-score" class="td-std"></td>
                    <td id="vegas-pD-total-score" class="td-std"></td>
                    <td class="td-std" colspan="2"></td>
                    <td id="vegas-total-diff" class="td-std font-extrabold"></td>
                </tr>`;
        }
    }
    
    if (tbody) tbody.innerHTML = html;
}

/**
 * Reset Vegas Display: Clear calculated values in the UI
 */
function resetVegasDisplay() {
    console.log("Reset Vegas Display");
    
    // Clear hole-by-hole team numbers and diffs
    for (let i = 1; i <= 18; i++) {
        const t1NumElement = document.getElementById(`vegas-h${i}-t1-num`);
        const t2NumElement = document.getElementById(`vegas-h${i}-t2-num`);
        if (t1NumElement) {
            t1NumElement.textContent = '';
        }
        if (t2NumElement) {
            t2NumElement.textContent = '';
        }
        const diffCell = document.getElementById(`vegas-h${i}-diff`);
        if(diffCell) {
            diffCell.textContent = '';
            diffCell.className = 'td-std font-semibold'; // Reset class
        }
    }
    
    // Clear summary rows
    const outDiff = document.getElementById('vegas-out-diff');
    const inDiff = document.getElementById('vegas-in-diff');
    const totalDiff = document.getElementById('vegas-total-diff');
    if (outDiff) outDiff.textContent = '';
    if (inDiff) inDiff.textContent = '';
    if (totalDiff) {
        totalDiff.textContent = '';
        totalDiff.className = 'td-std font-extrabold';
    }

    // Clear settlement text
    const settlementText = document.getElementById('vegas-settlement-summary-text');
    if (settlementText) {
        settlementText.textContent = 'Team -- owes Team -- $0.00';
    }

    // Reset headers
    const t1Header = document.getElementById('vegas-th-t1');
    const t2Header = document.getElementById('vegas-th-t2');
    const pAHeader = document.getElementById('vegas-th-pA');
    const pBHeader = document.getElementById('vegas-th-pB');
    const pCHeader = document.getElementById('vegas-th-pC');
    const pDHeader = document.getElementById('vegas-th-pD');
    
    if (t1Header) t1Header.textContent = 'Team 1';
    if (t2Header) t2Header.textContent = 'Team 2';
    if (pAHeader) pAHeader.textContent = 'Score A';
    if (pBHeader) pBHeader.textContent = 'Score B';
    if (pCHeader) pCHeader.textContent = 'Score C';
    if (pDHeader) pDHeader.textContent = 'Score D';
}

/**
 * Populate Vegas inputs from state
 */
function populateVegas() {
    console.log("Populate Vegas");
    if (!currentRoundState || currentRoundState.gameType !== 'vegas') return;

    // Populate setup fields
    const pANameInput = document.getElementById('vegas-pA-name');
    const pBNameInput = document.getElementById('vegas-pB-name');
    const pCNameInput = document.getElementById('vegas-pC-name');
    const pDNameInput = document.getElementById('vegas-pD-name');
    const pointValueInput = document.getElementById('vegas-point-value');

    if (pANameInput && currentRoundState.teams && currentRoundState.teams.t1) {
        pANameInput.value = currentRoundState.teams.t1.pA || '';
    }
    if (pBNameInput && currentRoundState.teams && currentRoundState.teams.t1) {
        pBNameInput.value = currentRoundState.teams.t1.pB || '';
    }
    if (pCNameInput && currentRoundState.teams && currentRoundState.teams.t2) {
        pCNameInput.value = currentRoundState.teams.t2.pC || '';
    }
    if (pDNameInput && currentRoundState.teams && currentRoundState.teams.t2) {
        pDNameInput.value = currentRoundState.teams.t2.pD || '';
    }
    if (pointValueInput) {
        pointValueInput.value = currentRoundState.pointValue !== undefined ? currentRoundState.pointValue : 1;
    }

    // Update headers immediately
    const pA = currentRoundState.teams && currentRoundState.teams.t1 ? currentRoundState.teams.t1.pA || 'A' : 'A';
    const pB = currentRoundState.teams && currentRoundState.teams.t1 ? currentRoundState.teams.t1.pB || 'B' : 'B';
    const pC = currentRoundState.teams && currentRoundState.teams.t2 ? currentRoundState.teams.t2.pC || 'C' : 'C';
    const pD = currentRoundState.teams && currentRoundState.teams.t2 ? currentRoundState.teams.t2.pD || 'D' : 'D';

    const t1Header = document.getElementById('vegas-th-t1');
    const t2Header = document.getElementById('vegas-th-t2');
    const pAHeader = document.getElementById('vegas-th-pA');
    const pBHeader = document.getElementById('vegas-th-pB');
    const pCHeader = document.getElementById('vegas-th-pC');
    const pDHeader = document.getElementById('vegas-th-pD');

    if (t1Header) t1Header.textContent = `Team 1 (${pA}/${pB})`;
    if (t2Header) t2Header.textContent = `Team 2 (${pC}/${pD})`;
    if (pAHeader) pAHeader.textContent = `Score ${pA}`;
    if (pBHeader) pBHeader.textContent = `Score ${pB}`;
    if (pCHeader) pCHeader.textContent = `Score ${pC}`;
    if (pDHeader) pDHeader.textContent = `Score ${pD}`;

    // Populate individual scores
    const players = ['pA', 'pB', 'pC', 'pD'];
    for (let i = 0; i < 18; i++) {
        players.forEach(pKey => {
            const scoreInput = document.getElementById(`vegas-${pKey}-h${i + 1}-score`);
            if (scoreInput && currentRoundState.scores && currentRoundState.scores[pKey]) {
                const score = currentRoundState.scores[pKey][i];
                scoreInput.value = score !== undefined ? score : '';
            }
        });
    }
    // Calculated fields (team nums, diff, settlement) will be populated by updateVegas()
}

/**
 * Helper to calculate Vegas team number (low score * 10 + high score)
 * @param {number} score1 - First player's score
 * @param {number} score2 - Second player's score
 * @returns {number|null} - Vegas team number or null if scores not complete
 */
function calculateVegasTeamNumber(score1, score2) {
    if (score1 === null || score2 === null) return null;
    const low = Math.min(score1, score2);
    const high = Math.max(score1, score2);
    // Handle scores >= 10 for high score correctly
    return low * 10 + high;
}

/**
 * Update Vegas: Calculate team numbers, points difference, settlement, and update UI
 */
function updateVegas() {
    console.log("Update Vegas");
    if (!currentRoundState || currentRoundState.gameType !== 'vegas') return;

    // --- 1. Read Inputs into State ---
    const pANameInput = document.getElementById('vegas-pA-name');
    const pBNameInput = document.getElementById('vegas-pB-name');
    const pCNameInput = document.getElementById('vegas-pC-name');
    const pDNameInput = document.getElementById('vegas-pD-name');
    const pointValueInput = document.getElementById('vegas-point-value');

    currentRoundState.teams = {
        t1: {
            pA: pANameInput && pANameInput.value || '',
            pB: pBNameInput && pBNameInput.value || ''
        },
        t2: {
            pC: pCNameInput && pCNameInput.value || '',
            pD: pDNameInput && pDNameInput.value || ''
        }
    };
    
    currentRoundState.pointValue = pointValueInput && parseFloat(pointValueInput.value) || 0;

    let scores = { pA: [], pB: [], pC: [], pD: [] };
    let totalScores = { pA: 0, pB: 0, pC: 0, pD: 0 };
    let outScores = { pA: 0, pB: 0, pC: 0, pD: 0 };
    let inScores = { pA: 0, pB: 0, pC: 0, pD: 0 };
    const players = ['pA', 'pB', 'pC', 'pD'];

    for (let i = 0; i < 18; i++) {
        players.forEach(pKey => {
            const scoreInput = document.getElementById(`vegas-${pKey}-h${i + 1}-score`);
            const scoreVal = scoreInput && scoreInput.value || null;
            if (scoreVal) {
                const score = parseInt(scoreVal);
                scores[pKey].push(score);
                totalScores[pKey] += score;
                if (i < 9) outScores[pKey] += score;
                else inScores[pKey] += score;
            }
        });
    }
    
    currentRoundState.scores = scores;
    currentRoundState.totalScores = totalScores;
    currentRoundState.outScores = outScores;
    currentRoundState.inScores = inScores;
    
    // Calculate team numbers
    const t1Num = calculateVegasTeamNumber(scores.pA[0], scores.pA[1]);
    const t2Num = calculateVegasTeamNumber(scores.pC[0], scores.pC[1]);
    
    currentRoundState.results = currentRoundState.results || {};
    currentRoundState.results.t1Num = t1Num;
    currentRoundState.results.t2Num = t2Num;
    
    // Calculate points difference
    const diff = t2Num - t1Num;
    currentRoundState.results.diff = diff;
    
    // Calculate settlement
    let settlementText = '';
    let settlementAmount = 0;
    let winner = null;
    
    if (diff === 0) {
        settlementText = "All square - no money changes hands";
        settlementAmount = 0;
        winner = null;
    } else if (diff > 0) {
        settlementText = `Team 2 owes Team 1 ${Math.abs(diff)} points`;
        settlementAmount = Math.abs(diff);
        winner = 'Team 2';
    } else {
        settlementText = `Team 1 owes Team 2 ${Math.abs(diff)} points`;
        settlementAmount = Math.abs(diff);
        winner = 'Team 1';
    }
    
    currentRoundState.settlement = {
        summaryText: settlementText,
        amount: settlementAmount,
        winner: winner
    };
    
    // Update UI
    for (let i = 1; i <= 18; i++) {
        const t1NumCell = document.getElementById(`vegas-h${i}-t1-num`);
        const t2NumCell = document.getElementById(`vegas-h${i}-t2-num`);
        const diffCell = document.getElementById(`vegas-h${i}-diff`);
        
        if (t1NumCell) t1NumCell.textContent = t1Num !== null ? t1Num : '';
        if (t2NumCell) t2NumCell.textContent = t2Num !== null ? t2Num : '';
        if (diffCell) {
            diffCell.textContent = diff !== null ? diff : '';
            diffCell.className = `td-std font-semibold ${getStatusClass(diff)}`;
        }
    }
    
    // Update summary rows
    const outDiffCell = document.getElementById('vegas-out-diff');
    const inDiffCell = document.getElementById('vegas-in-diff');
    const totalDiffCell = document.getElementById('vegas-total-diff');
    const settlementTextCell = document.getElementById('vegas-settlement-summary-text');
    
    if (outDiffCell) outDiffCell.textContent = diff !== null ? diff : '';
    if (inDiffCell) inDiffCell.textContent = diff !== null ? diff : '';
    if (totalDiffCell) {
        totalDiffCell.textContent = diff !== null ? diff : '';
        totalDiffCell.className = `td-std font-extrabold ${getStatusClass(diff)}`;
    }
    if (settlementTextCell) settlementTextCell.textContent = settlementText;
}

/**
 * Debounced version of updateActiveCard to avoid excessive updates
 */
const debouncedUpdate = function(gameType, event) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        console.log(`Debounced update for ${gameType}...`);
        
        switch (gameType) {
            case 'nassau': updateNassau(event); break;
            case 'skins': updateSkins(); break;
            case 'wolf': updateWolf(); break;
            case 'bingo': updateBingo(); break;
            case 'bloodsome': updateBloodsome(); break;
            case 'stableford': updateStableford(); break;
            case 'banker': updateBanker(); break;
            case 'vegas': updateVegas(); break;
        }
    }, 300); // 300ms debounce delay
};

/**
 * Populates the active card's inputs from the current state
 * @param {string} gameType - The type of game to populate
 */
function populateCardFromState(gameType) {
    console.log(`Populating ${gameType} card from state...`);
    const cardElement = document.getElementById(`${gameType}-card`);
    if (!cardElement || !currentRoundState || !currentRoundState.gameType || currentRoundState.gameType !== gameType) {
         console.warn(`Cannot populate ${gameType}: State mismatch or card not found.`);
         return;
    }
    
    showLoading(true); // Show loading indicator for larger state changes
    
    try {
        switch (gameType) {
            case 'nassau': populateNassau(); break;
            case 'skins': populateSkins(); break;
            case 'wolf': populateWolf(); break;
            case 'bingo': populateBingo(); break;
            case 'bloodsome': populateBloodsome(); break;
            case 'stableford': populateStableford(); break;
            case 'banker': populateBanker(); break;
            case 'vegas': populateVegas(); break;
            default: console.warn(`Population logic not implemented for ${gameType}`);
        }
        console.log(`Population complete for ${gameType}.`);
    } catch (error) {
        console.error(`Error populating ${gameType} card:`, error);
        showAlert(`Error loading ${gameType} data: ${error.message}`, "error");
    } finally {
        showLoading(false); // Hide loading indicator
    }
}

/**
 * Generates and copies a summary of the round results
 */
function copySummary() {
    if (!currentRoundState || !currentRoundState.gameType) {
        showAlert("No active round to summarize.", "warning");
        return;
    }

    let summaryText = `Peel & Eat Scorecard Summary\n============================\n`;
    summaryText += `Game: ${currentRoundState.gameType.toUpperCase()}\n`;
    summaryText += `Date: ${new Date().toLocaleDateString()}\n`;
    
    // Adjust player display for team games
    if (currentRoundState.players) {
         summaryText += `Players: ${currentRoundState.players.filter(p => p).join(', ') || 'N/A'}\n`;
    } else if (currentRoundState.teams) {
         const t1 = currentRoundState.teams.t1;
         const t2 = currentRoundState.teams.t2;
         const t1Name = `${t1.pA || 'P A'}/${t1.pB || 'P B'}`;
         const t2Name = `${t2.pC || 'P C'}/${t2.pD || 'P D'}`;
         summaryText += `Team 1: ${t1Name}\n`;
         summaryText += `Team 2: ${t2Name}\n`;
    }

    // Show wager/value information
    if (currentRoundState.wager !== undefined || currentRoundState.pointValue !== undefined) {
        const value = currentRoundState.wager ?? currentRoundState.pointValue ?? '?';
        let unit = 'per Point/Match';
        if (currentRoundState.gameType === 'skins') unit = 'per Skin';
        else if (['wolf', 'bingo', 'stableford', 'banker', 'vegas'].includes(currentRoundState.gameType)) unit = 'per Point';
        else if (currentRoundState.gameType === 'bloodsome') unit = 'per Match';
        summaryText += `Value: ${formatCurrency(value)} ${unit}\n`;
    }
    
    // Add Quotas for Banker
    if (currentRoundState.gameType === 'banker' && currentRoundState.quotas) {
        summaryText += `Quotas: ${currentRoundState.players.map((name, i) => 
            `${name || `P${i+1}`}: ${currentRoundState.quotas[i]}`).join(', ')}\n`;
    }

    // Results section
    summaryText += `\n--- Results & Settlement ---\n`;
    const settlement = currentRoundState.settlement; // Shortcut

    switch (currentRoundState.gameType) {
        case 'nassau':
            if (settlement?.summaryText) {
                summaryText += `Front 9: ${settlement.front9StatusText || '--'} (${settlement.front9AmountText || '$0.00'})\n`;
                summaryText += `Back 9: ${settlement.back9StatusText || '--'} (${settlement.back9AmountText || '$0.00'})\n`;
                summaryText += `Overall: ${settlement.overallStatusText || '--'} (${settlement.overallAmountText || '$0.00'})\n`;
                summaryText += `Presses (${settlement.pressesCount || 0}): ${settlement.pressesAmountText || '$0.00'}\n`;
                summaryText += `--------------------\n`;
                summaryText += `Final: ${settlement.summaryText}\n`;
            } else {
                summaryText += "Settlement not calculated.\n";
            }
            break;
            
        case 'skins':
            if (settlement && settlement.summaryText) {
                currentRoundState.players.forEach((name, i) => {
                    const pName = name || `P${i+1}`;
                    summaryText += `${pName}: ${settlement.skinsWon?.[i] || 0} Skins, ${formatCurrency(settlement.winnings?.[i] || 0)}\n`;
                });
                summaryText += `--------------------\n`;
                summaryText += `Total Pot Value: ${formatCurrency(settlement.totalPot || 0)}\n`;
            } else {
                summaryText += "Skins settlement not calculated.\n";
            }
            break;
            
        case 'wolf':
            if (settlement && settlement.summaryText) {
                currentRoundState.players.forEach((name, i) => {
                    const pName = name || `P${i+1}`;
                    summaryText += `${pName}: ${settlement.totalPoints?.[i] || 0} Pts, ${formatCurrency(settlement.winnings?.[i] || 0)}\n`;
                });
                summaryText += `--------------------\n`;
                summaryText += `Settlement: ${settlement.summaryText}\n`;
            } else {
                summaryText += "Wolf settlement not calculated.\n";
            }
            break;
            
        case 'bingo':
            if (settlement && settlement.summaryText) {
                currentRoundState.players.forEach((name, i) => {
                    const pName = name || `P${i+1}`;
                    summaryText += `${pName}: ${settlement.totalPoints?.[i] || 0} Pts, ${formatCurrency(settlement.winnings?.[i] || 0)}\n`;
                });
                summaryText += `--------------------\n`;
                summaryText += `Settlement: ${settlement.summaryText}\n`;
            } else {
                summaryText += "Bingo Bango Bongo settlement not calculated.\n";
            }
            break;
            
        case 'bloodsome':
            summaryText += settlement?.summaryText || "Bloodsome settlement not calculated.\n";
            break;
            
        case 'stableford':
            if (settlement && settlement.summaryText) {
                currentRoundState.players.forEach((name, i) => {
                    const pName = name || `P${i+1}`;
                    summaryText += `${pName}: ${settlement.totalPoints?.[i] || 0} Pts, ${formatCurrency(settlement.winnings?.[i] || 0)}\n`;
                });
                summaryText += `--------------------\n`;
                summaryText += `Settlement: ${settlement.summaryText}\n`;
            } else {
                summaryText += "Stableford settlement not calculated.\n";
            }
            break;
            
        case 'banker':
            if (settlement && settlement.summaryText) {
                currentRoundState.players.forEach((name, i) => {
                    const pName = name || `P${i+1}`;
                    const vsQuota = settlement.vsQuota?.[i] || 0;
                    summaryText += `${pName}: ${settlement.totalPoints?.[i] || 0} Pts (Quota ${currentRoundState.quotas?.[i]}, ${vsQuota >= 0 ? '+' : ''}${vsQuota}), ${formatCurrency(settlement.winnings?.[i] || 0)}\n`;
                });
                summaryText += `--------------------\n`;
                summaryText += `Settlement: ${settlement.summaryText}\n`;
            } else {
                summaryText += "Banker/Quota settlement not calculated.\n";
            }
            break;
            
        case 'vegas':
            summaryText += settlement?.summaryText || "Vegas settlement not calculated.\n";
            break;
            
        default:
            summaryText += settlement?.summaryText || "Settlement not implemented for this game.";
            break;
    }
    summaryText += `============================\n`;

    // Try to copy to clipboard with improved error handling
    try {
        navigator.clipboard.writeText(summaryText)
            .then(() => {
                showAlert("Round summary copied to clipboard!", "success");
            })
            .catch(err => {
                console.error('Failed to copy summary: ', err);
                showAlert("Unable to automatically copy to clipboard. Manual copy option provided.", "warning");
                
                // Create temporary textarea for manual copy
                const textarea = document.createElement('textarea');
                textarea.value = summaryText;
                textarea.style.position = 'fixed';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                
                try {
                    document.execCommand('copy');
                    showAlert("Summary copied to clipboard using alternative method.", "success");
                } catch (e) {
                    console.error('Secondary copy method failed:', e);
                    alert("Please copy the summary manually:\n\n" + summaryText);
                }
                
                document.body.removeChild(textarea);
            });
    } catch (e) {
        console.error('Clipboard API not available:', e);
        alert("Please copy the summary manually:\n\n" + summaryText);
    }
}

// Export functions
export {
    initializeVegas,
    generateVegasRows,
    resetVegasDisplay,
    populateVegas,
    updateVegas,
    calculateVegasTeamNumber,
    debouncedUpdate,
    populateCardFromState,
    copySummary
};