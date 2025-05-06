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
    
    tbody.innerHTML = html;
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

    if (pANameInput) pANameInput.value = currentRoundState.teams && currentRoundState.teams.t1 && currentRoundState.teams.t1.pA || '';
    if (pBNameInput) pBNameInput.value = currentRoundState.teams && currentRoundState.teams.t1 && currentRoundState.teams.t1.pB || '';
    if (pCNameInput) pCNameInput.value = currentRoundState.teams && currentRoundState.teams.t2 && currentRoundState.teams.t2.pC || '';
    if (pDNameInput) pDNameInput.value = currentRoundState.teams && currentRoundState.teams.t2 && currentRoundState.teams.t2.pD || '';
    if (pointValueInput) pointValueInput.value = currentRoundState.pointValue !== undefined ? currentRoundState.pointValue : 1;

    // Update headers immediately
    const pA = currentRoundState.teams && currentRoundState.teams.t1 && currentRoundState.teams.t1.pA || 'A';
    const pB = currentRoundState.teams && currentRoundState.teams.t1 && currentRoundState.teams.t1.pB || 'B';
    const pC = currentRoundState.teams && currentRoundState.teams.t2 && currentRoundState.teams.t2.pC || 'C';
    const pD = currentRoundState.teams && currentRoundState.teams.t2 && currentRoundState.teams.t2.pD || 'D';

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
            if (scoreInput) {
                const score = currentRoundState.scores && currentRoundState.scores[pKey] && currentRoundState.scores[pKey][i];
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

// === GAME IMPLEMENTATION: NASSAU ===

/**
 * Initialize Nassau: Add listeners for press buttons and player name changes
 */
function initializeNassau() {
    console.log("Initializing Nassau");
    
    // Add listeners for press buttons
    const p1PressBtn = document.getElementById('nassau-press-btn-p1');
    const p2PressBtn = document.getElementById('nassau-press-btn-p2');
    if (p1PressBtn) p1PressBtn.addEventListener('click', handleNassauPress);
    if (p2PressBtn) p2PressBtn.addEventListener('click', handleNassauPress);

    // Add listeners for player name changes
    const p1Header = document.getElementById('nassau-th-p1');
    const p2Header = document.getElementById('nassau-th-p2');
    const p1Input = document.getElementById('nassau-player1-name');
    const p2Input = document.getElementById('nassau-player2-name');
    
    const updateHeaders = () => {
        if (p1Header && p1Input) p1Header.textContent = p1Input.value || 'Player 1';
        if (p2Header && p2Input) p2Header.textContent = p2Input.value || 'Player 2';
    };
    
    if (p1Input) p1Input.addEventListener('input', updateHeaders);
    if (p2Input) p2Input.addEventListener('input', updateHeaders);
    
    // Add listener for press rule changes
    const pressRuleSelect = document.getElementById('nassau-press-rule');
    if (pressRuleSelect) {
        pressRuleSelect.addEventListener('change', function() {
            updateNassau();
        });
    }
    
    // Generate scorecard rows if needed
    generateNassauRows();
}

/**
 * Generate Nassau scorecard rows
 */
function generateNassauRows() {
    const tbody = document.getElementById('nassau-scorecard-body');
    if (!tbody || tbody.children.length > 0) return; // Already populated
    
    let html = '';
    
    for (let i = 1; i <= 18; i++) {
        html += `
            <tr id="nassau-row-h${i}">
                <td class="td-std font-medium">${i}</td>
                <td class="td-std"><input type="number" id="nassau-h${i}-par" min="3" max="6" class="input-std input-par" aria-label="Hole ${i} Par"></td>
                <td class="td-std"><input type="number" id="nassau-p1-h${i}-score" min="1" class="input-std input-score" aria-label="Player 1 Score Hole ${i}"></td>
                <td class="td-std"><input type="number" id="nassau-p2-h${i}-score" min="1" class="input-std input-score" aria-label="Player 2 Score Hole ${i}"></td>
                <td class="td-std text-gray-500" id="nassau-h${i}-result"></td>
                <td class="td-std font-semibold" id="nassau-h${i}-status"></td>
                <td class="td-std text-xs text-gray-500" id="nassau-h${i}-presses"></td>
            </tr>`;
        
        // Add summary rows
        if (i === 9) {
            html += `
                <tr class="bg-gray-100 font-semibold">
                    <td class="td-std">OUT</td>
                    <td class="td-std" id="nassau-out-par"></td>
                    <td class="td-std" id="nassau-p1-out-score"></td>
                    <td class="td-std" id="nassau-p2-out-score"></td>
                    <td class="td-std">Front 9:</td>
                    <td class="td-std" id="nassau-front9-status"></td>
                    <td class="td-std" id="nassau-front9-presses"></td>
                </tr>`;
        } else if (i === 18) {
            html += `
                <tr class="bg-gray-100 font-semibold">
                    <td class="td-std">IN</td>
                    <td class="td-std" id="nassau-in-par"></td>
                    <td class="td-std" id="nassau-p1-in-score"></td>
                    <td class="td-std" id="nassau-p2-in-score"></td>
                    <td class="td-std">Back 9:</td>
                    <td class="td-std" id="nassau-back9-status"></td>
                    <td class="td-std" id="nassau-back9-presses"></td>
                </tr>
                <tr class="bg-gray-200 font-bold">
                    <td class="td-std">TOTAL</td>
                    <td class="td-std" id="nassau-total-par"></td>
                    <td class="td-std" id="nassau-p1-total-score"></td>
                    <td class="td-std" id="nassau-p2-total-score"></td>
                    <td class="td-std">Overall:</td>
                    <td class="td-std" id="nassau-overall-status"></td>
                    <td class="td-std" id="nassau-total-presses"></td>
                </tr>`;
        }
    }
    
    tbody.innerHTML = html;
}

/**
 * Reset Nassau Display: Clear calculated values in the UI
 */
function resetNassauDisplay() {
    console.log("Reset Nassau Display");
    
    // Clear hole-by-hole results
    for (let i = 1; i <= 18; i++) {
        const resultCell = document.getElementById(`nassau-h${i}-result`);
        const statusCell = document.getElementById(`nassau-h${i}-status`);
        const pressesCell = document.getElementById(`nassau-h${i}-presses`);
        
        if (resultCell) resultCell.textContent = '';
        if (statusCell) {
            statusCell.textContent = '';
            statusCell.className = 'td-std font-semibold';
        }
        if (pressesCell) pressesCell.textContent = '';
    }
    
    // Clear summary rows
    const outPar = document.getElementById('nassau-out-par');
    const inPar = document.getElementById('nassau-in-par');
    const totalPar = document.getElementById('nassau-total-par');
    const p1OutScore = document.getElementById('nassau-p1-out-score');
    const p1InScore = document.getElementById('nassau-p1-in-score');
    const p1TotalScore = document.getElementById('nassau-p1-total-score');
    const p2OutScore = document.getElementById('nassau-p2-out-score');
    const p2InScore = document.getElementById('nassau-p2-in-score');
    const p2TotalScore = document.getElementById('nassau-p2-total-score');
    const front9Status = document.getElementById('nassau-front9-status');
    const back9Status = document.getElementById('nassau-back9-status');
    const overallStatus = document.getElementById('nassau-overall-status');
    const front9Presses = document.getElementById('nassau-front9-presses');
    const back9Presses = document.getElementById('nassau-back9-presses');
    const totalPresses = document.getElementById('nassau-total-presses');
    
    if (outPar) outPar.textContent = '';
    if (inPar) inPar.textContent = '';
    if (totalPar) totalPar.textContent = '';
    if (p1OutScore) p1OutScore.textContent = '';
    if (p1InScore) p1InScore.textContent = '';
    if (p1TotalScore) p1TotalScore.textContent = '';
    if (p2OutScore) p2OutScore.textContent = '';
    if (p2InScore) p2InScore.textContent = '';
    if (p2TotalScore) p2TotalScore.textContent = '';
    if (front9Status) front9Status.textContent = '';
    if (back9Status) back9Status.textContent = '';
    if (overallStatus) overallStatus.textContent = '';
    if (front9Presses) front9Presses.textContent = '';
    if (back9Presses) back9Presses.textContent = '';
    if (totalPresses) totalPresses.textContent = '';
    
    // Reset headers
    const p1Header = document.getElementById('nassau-th-p1');
    const p2Header = document.getElementById('nassau-th-p2');
    if (p1Header) p1Header.textContent = 'Player 1';
    if (p2Header) p2Header.textContent = 'Player 2';
    
    // Reset settlement display
    const front9StatusSettlement = document.getElementById('nassau-settlement-front9-status');
    const back9StatusSettlement = document.getElementById('nassau-settlement-back9-status');
    const overallStatusSettlement = document.getElementById('nassau-settlement-overall-status');
    const pressesCount = document.getElementById('nassau-settlement-presses-count');
    const front9Amount = document.getElementById('nassau-settlement-front9-amount');
    const back9Amount = document.getElementById('nassau-settlement-back9-amount');
    const overallAmount = document.getElementById('nassau-settlement-overall-amount');
    const pressesAmount = document.getElementById('nassau-settlement-presses-amount');
    const winnerName = document.getElementById('nassau-settlement-winner-name');
    const totalAmount = document.getElementById('nassau-settlement-total-amount');
    const summaryText = document.getElementById('nassau-settlement-summary-text');
    
    if (front9StatusSettlement) front9StatusSettlement.textContent = '--';
    if (back9StatusSettlement) back9StatusSettlement.textContent = '--';
    if (overallStatusSettlement) overallStatusSettlement.textContent = '--';
    if (pressesCount) pressesCount.textContent = '0';
    if (front9Amount) front9Amount.textContent = '$0.00';
    if (back9Amount) back9Amount.textContent = '$0.00';
    if (overallAmount) overallAmount.textContent = '$0.00';
    if (pressesAmount) pressesAmount.textContent = '$0.00';
    if (winnerName) winnerName.textContent = 'Player --';
    if (totalAmount) totalAmount.textContent = '$0.00';
    if (summaryText) summaryText.textContent = 'Player 1 owes Player 2 $0.00';
    
    // Hide press buttons
    const p1PressBtn = document.getElementById('nassau-press-btn-p1');
    const p2PressBtn = document.getElementById('nassau-press-btn-p2');
    if (p1PressBtn) p1PressBtn.classList.add('hidden');
    if (p2PressBtn) p2PressBtn.classList.add('hidden');
}

/**
 * Populate Nassau inputs from state
 */
function populateNassau() {
    console.log("Populate Nassau");
    if (!currentRoundState || currentRoundState.gameType !== 'nassau') return;

    // Populate player names
    const p1NameInput = document.getElementById('nassau-player1-name');
    const p2NameInput = document.getElementById('nassau-player2-name');
    const p1Header = document.getElementById('nassau-th-p1');
    const p2Header = document.getElementById('nassau-th-p2');

    const p1Name = currentRoundState.players && currentRoundState.players[0] || '';
    const p2Name = currentRoundState.players && currentRoundState.players[1] || '';

    if (p1NameInput) p1NameInput.value = p1Name;
    if (p2NameInput) p2NameInput.value = p2Name;
    if (p1Header) p1Header.textContent = p1Name || 'Player 1';
    if (p2Header) p2Header.textContent = p2Name || 'Player 2';

    // Populate scores
    for (let i = 0; i < 18; i++) {
        const parInput = document.getElementById(`nassau-h${i + 1}-par`);
        const p1ScoreInput = document.getElementById(`nassau-p1-h${i + 1}-score`);
        const p2ScoreInput = document.getElementById(`nassau-p2-h${i + 1}-score`);

        const parValue = currentRoundState.par && currentRoundState.par[i] || '';
        const p1Score = currentRoundState.scores && currentRoundState.scores.p1 && currentRoundState.scores.p1[i];
        const p2Score = currentRoundState.scores && currentRoundState.scores.p2 && currentRoundState.scores.p2[i];

        if (parInput) parInput.value = parValue;
        if (p1ScoreInput) p1ScoreInput.value = p1Score !== undefined ? p1Score : '';
        if (p2ScoreInput) p2ScoreInput.value = p2Score !== undefined ? p2Score : '';
    }

    // Calculated fields will be populated by updateNassau()
    updateNassau();
}

/**
 * Update Nassau: Calculate match status, handle presses, update settlement
 * @param {Event} event - The event that triggered the update (optional)
 */
function updateNassau(event = null) {
    console.log("Update Nassau");
    if (!currentRoundState || currentRoundState.gameType !== 'nassau') return;

    // --- 1. Read Inputs into State ---
    const p1NameInput = document.getElementById('nassau-player1-name');
    const p2NameInput = document.getElementById('nassau-player2-name');
    const wagerInput = document.getElementById('nassau-wager');
    const pressRuleInput = document.getElementById('nassau-press-rule');

    currentRoundState.players = [
        p1NameInput && p1NameInput.value || '',
        p2NameInput && p2NameInput.value || ''
    ];

    currentRoundState.wager = wagerInput && parseFloat(wagerInput.value) || 5;
    currentRoundState.pressRule = pressRuleInput && pressRuleInput.value || 'manual';

    let par = [];
    let scores = { p1: [], p2: [] };

    for (let i = 0; i < 18; i++) {
        const parInput = document.getElementById(`nassau-h${i + 1}-par`);
        const p1Input = document.getElementById(`nassau-p1-h${i + 1}-score`);
        const p2Input = document.getElementById(`nassau-p2-h${i + 1}-score`);

        const parVal = parInput && parInput.value || '';
        const p1Val = p1Input && p1Input.value || '';
        const p2Val = p2Input && p2Input.value || '';

        if (parVal) par[i] = parseInt(parVal);
        if (p1Val) scores.p1[i] = parseInt(p1Val);
        if (p2Val) scores.p2[i] = parseInt(p2Val);
    }

    currentRoundState.par = par;
    currentRoundState.scores = scores;

    // --- 2. Calculate Match Status ---
    let front9Score = 0;
    let back9Score = 0;
    let totalScore = 0;

    for (let i = 0; i < 18; i++) {
        const p1Score = scores.p1[i];
        const p2Score = scores.p2[i];

        if (p1Score !== undefined && p2Score !== undefined) {
            const holeDiff = p2Score - p1Score;
            const resultCell = document.getElementById(`nassau-h${i + 1}-result`);
            const statusCell = document.getElementById(`nassau-h${i + 1}-status`);
            const pressesCell = document.getElementById(`nassau-h${i + 1}-presses`);
            
            resultCell.textContent = holeDiff;
            statusCell.textContent = holeDiff > 0 ? 'W' : holeDiff < 0 ? 'L' : 'T';
            pressesCell.textContent = '0';

            if (i < 9) front9Score += holeDiff;
            else back9Score += holeDiff;
            totalScore += holeDiff;
        }
    }

    let front9Status = null;
    let back9Status = null;
    let overallStatus = null;

    if (front9Score > 0) front9Status = 'W';
    else if (front9Score < 0) front9Status = 'L';
    else front9Status = 'T';

    if (back9Score > 0) back9Status = 'W';
    else if (back9Score < 0) back9Status = 'L';
    else back9Status = 'T';

    if (totalScore > 0) overallStatus = 'W';
    else if (totalScore < 0) overallStatus = 'L';
    else overallStatus = 'T';

    // Update UI
    for (let i = 0; i < 18; i++) {
        const resultCell = document.getElementById(`nassau-h${i + 1}-result`);
        const statusCell = document.getElementById(`nassau-h${i + 1}-status`);
        const pressesCell = document.getElementById(`nassau-h${i + 1}-presses`);
        
        resultCell.textContent = scores.p1[i] !== undefined && scores.p2[i] !== undefined ? scores.p2[i] - scores.p1[i] : '';
        statusCell.textContent = front9Status !== null && back9Status !== null && overallStatus !== null ? statusCell.textContent : '';
        pressesCell.textContent = '0';
    }

    // Update settlement
    let settlementText = '';
    let settlementAmount = 0;
    let winner = null;
    
    if (front9Score === 0 && back9Score === 0 && totalScore === 0) {
        settlementText = "All square - no money changes hands";
        settlementAmount = 0;
        winner = null;
    } else if (front9Score > 0 && back9Score > 0 && totalScore > 0) {
        settlementText = "Team 2 wins";
        settlementAmount = Math.abs(front9Score) + Math.abs(back9Score);
        winner = 'Team 2';
    } else if (front9Score < 0 && back9Score < 0 && totalScore < 0) {
        settlementText = "Team 1 wins";
        settlementAmount = Math.abs(front9Score) + Math.abs(back9Score);
        winner = 'Team 1';
    } else {
        settlementText = "Team 1 owes Team 2 money";
        settlementAmount = Math.abs(front9Score) + Math.abs(back9Score);
        winner = 'Team 1';
    }
    
    currentRoundState.settlement = {
        summaryText: settlementText,
        amount: settlementAmount,
        winner: winner
    };

    // Update summary rows
    const outPar = document.getElementById('nassau-out-par');
    const inPar = document.getElementById('nassau-in-par');
    const totalPar = document.getElementById('nassau-total-par');
    const p1OutScore = document.getElementById('nassau-p1-out-score');
    const p1InScore = document.getElementById('nassau-p1-in-score');
    const p1TotalScore = document.getElementById('nassau-p1-total-score');
    const p2OutScore = document.getElementById('nassau-p2-out-score');
    const p2InScore = document.getElementById('nassau-p2-in-score');
    const p2TotalScore = document.getElementById('nassau-p2-total-score');
    const front9StatusCell = document.getElementById('nassau-front9-status');
    const back9StatusCell = document.getElementById('nassau-back9-status');
    const overallStatusCell = document.getElementById('nassau-overall-status');
    const front9Presses = document.getElementById('nassau-front9-presses');
    const back9Presses = document.getElementById('nassau-back9-presses');
    const totalPresses = document.getElementById('nassau-total-presses');
    
    if (outPar) outPar.textContent = front9Score > 0 ? 'Front 9: W' : front9Score < 0 ? 'Front 9: L' : 'Front 9: T';
    if (inPar) inPar.textContent = back9Score > 0 ? 'Back 9: W' : back9Score < 0 ? 'Back 9: L' : 'Back 9: T';
    if (totalPar) totalPar.textContent = overallStatus !== null ? overallStatus : '';
    if (p1OutScore) p1OutScore.textContent = front9Score > 0 ? scores.p1[0] !== undefined && scores.p2[0] !== undefined ? scores.p2[0] - scores.p1[0] : '' : '';
    if (p1InScore) p1InScore.textContent = front9Score < 0 ? scores.p1[0] !== undefined && scores.p2[0] !== undefined ? scores.p2[0] - scores.p1[0] : '' : '';
    if (p1TotalScore) p1TotalScore.textContent = front9Score > 0 ? scores.p1[0] !== undefined && scores.p2[0] !== undefined ? scores.p2[0] : '' : '';
    if (p2OutScore) p2OutScore.textContent = back9Score > 0 ? scores.p2[0] !== undefined && scores.p1[0] !== undefined ? scores.p2[0] - scores.p1[0] : '' : '';
    if (p2InScore) p2InScore.textContent = back9Score < 0 ? scores.p2[0] !== undefined && scores.p1[0] !== undefined ? scores.p2[0] - scores.p1[0] : '' : '';
    if (p2TotalScore) p2TotalScore.textContent = back9Score > 0 ? scores.p2[0] !== undefined && scores.p1[0] !== undefined ? scores.p2[0] : '' : '';
    if (front9StatusCell) front9StatusCell.textContent = front9Status !== null ? front9Status : '';
    if (back9StatusCell) back9StatusCell.textContent = back9Status !== null ? back9Status : '';
    if (overallStatusCell) overallStatusCell.textContent = overallStatus !== null ? overallStatus : '';
    if (front9Presses) front9Presses.textContent = front9Score > 0 ? 'Front 9: W' : front9Score < 0 ? 'Front 9: L' : 'Front 9: T';
    if (back9Presses) back9Presses.textContent = back9Score > 0 ? 'Back 9: W' : back9Score < 0 ? 'Back 9: L' : 'Back 9: T';
    if (totalPresses) totalPresses.textContent = overallStatus !== null ? overallStatus : '';
}