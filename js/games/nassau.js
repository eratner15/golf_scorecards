/**
 * Game Implementation: NASSAU
 * 
 * Nassau is a match play format with three separate bets:
 * - Front nine
 * - Back nine
 * - Overall match (all 18 holes)
 * 
 * With optional presses when a player falls behind.
 */

import { currentRoundState, saveState } from '../core/state.js';
import { showAlert } from '../core/ui.js';
import { formatCurrency, formatMatchStatus, getStatusClass, validateScore } from '../core/utils.js';

/**
 * Generate Nassau scorecard rows
 */
export function generateNassauRows() {
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
    
    if (tbody) tbody.innerHTML = html;
}

/**
 * Initialize Nassau: Add listeners for press buttons and player name changes
 */
export function initializeNassau() {
    console.log("Initializing Nassau");
    
    // Add press button event handlers
    document.getElementById('nassau-press-btn-p1')?.addEventListener('click', handleNassauPress);
    document.getElementById('nassau-press-btn-p2')?.addEventListener('click', handleNassauPress);
    
    // Update header names when players change
    const p1Input = document.getElementById('nassau-player1-name');
    const p2Input = document.getElementById('nassau-player2-name');
    const p1Header = document.getElementById('nassau-th-p1');
    const p2Header = document.getElementById('nassau-th-p2');
    
    const updateHeaders = () => {
        if (p1Header) p1Header.textContent = p1Input?.value || 'Player 1';
        if (p2Header) p2Header.textContent = p2Input?.value || 'Player 2';
    };
    
    p1Input?.addEventListener('input', updateHeaders);
    p2Input?.addEventListener('input', updateHeaders);
    
    // Add listener for press rule changes
    document.getElementById('nassau-press-rule')?.addEventListener('change', function() {
        currentRoundState.pressRule = this.value;
        updateNassau();
    });
}

/**
 * Reset Nassau Display: Clear calculated values in the UI
 */
export function resetNassauDisplay() {
    console.log("Reset Nassau Display");
    
    // Reset hole results and status displays
    for (let i = 1; i <= 18; i++) {
        document.getElementById(`nassau-h${i}-result`)?.textContent = '';
        document.getElementById(`nassau-h${i}-status`)?.textContent = '';
        document.getElementById(`nassau-h${i}-status`)?.className = 'td-std font-semibold';
        document.getElementById(`nassau-h${i}-presses`)?.textContent = '';
    }
    
    // Reset summary fields
    document.getElementById('nassau-out-par')?.textContent = '';
    document.getElementById('nassau-in-par')?.textContent = '';
    document.getElementById('nassau-total-par')?.textContent = '';
    
    document.getElementById('nassau-p1-out-score')?.textContent = '';
    document.getElementById('nassau-p1-in-score')?.textContent = '';
    document.getElementById('nassau-p1-total-score')?.textContent = '';
    
    document.getElementById('nassau-p2-out-score')?.textContent = '';
    document.getElementById('nassau-p2-in-score')?.textContent = '';
    document.getElementById('nassau-p2-total-score')?.textContent = '';
    
    document.getElementById('nassau-front9-status')?.textContent = '';
    document.getElementById('nassau-back9-status')?.textContent = '';
    document.getElementById('nassau-overall-status')?.textContent = '';
    
    document.getElementById('nassau-front9-presses')?.textContent = '';
    document.getElementById('nassau-back9-presses')?.textContent = '';
    document.getElementById('nassau-total-presses')?.textContent = '';
    
    // Reset headers
    document.getElementById('nassau-th-p1')?.textContent = 'Player 1';
    document.getElementById('nassau-th-p2')?.textContent = 'Player 2';
    
    // Reset settlement section
    document.getElementById('nassau-settlement-front9-status')?.textContent = '--';
    document.getElementById('nassau-settlement-back9-status')?.textContent = '--';
    document.getElementById('nassau-settlement-overall-status')?.textContent = '--';
    document.getElementById('nassau-settlement-presses-count')?.textContent = '0';
    
    document.getElementById('nassau-settlement-front9-amount')?.textContent = '$0.00';
    document.getElementById('nassau-settlement-back9-amount')?.textContent = '$0.00';
    document.getElementById('nassau-settlement-overall-amount')?.textContent = '$0.00';
    document.getElementById('nassau-settlement-presses-amount')?.textContent = '$0.00';
    
    document.getElementById('nassau-settlement-winner-name')?.textContent = 'Player --';
    document.getElementById('nassau-settlement-total-amount')?.textContent = '$0.00';
    document.getElementById('nassau-settlement-summary-text')?.textContent = 'Player 1 owes Player 2 $0.00';
    
    // Hide press buttons
    document.getElementById('nassau-press-btn-p1')?.classList.add('hidden');
    document.getElementById('nassau-press-btn-p2')?.classList.add('hidden');
}

/**
 * Handler for Nassau press buttons
 * @param {Event} event - Click event from press button
 */
export function handleNassauPress(event) {
    if (!currentRoundState || currentRoundState.gameType !== 'nassau') return;
    
    const button = event.target;
    const playerNum = button.dataset.player;
    
    if (!playerNum) return;
    
    const currentHole = findCurrentNassauHole();
    if (currentHole === null) {
        showAlert("Please enter scores before adding a press", "warning");
        return;
    }
    
    // Create a new press
    const newPress = {
        hole: currentHole,
        player: playerNum,
        // Get the current match status at this hole
        initialMatchStatus: currentRoundState.results.matchStatus[currentHole - 1] || 0
    };
    
    // Add the press to the state
    if (!currentRoundState.presses) currentRoundState.presses = [];
    currentRoundState.presses.push(newPress);
    
    console.log(`Added press for P${playerNum} at hole ${currentHole}`);
    
    // Update display
    updateNassau();
    saveState();
}

/**
 * Finds the current hole in Nassau (last hole with scores entered)
 * @returns {number|null} - Hole number or null if no scores yet
 */
export function findCurrentNassauHole() {
    if (!currentRoundState || !currentRoundState.scores) return null;
    
    const { p1, p2 } = currentRoundState.scores;
    
    // Find the last hole where both players have a score
    for (let i = 17; i >= 0; i--) {
        if (p1[i] !== null && p2[i] !== null) {
            return i + 1; // Return 1-based hole number
        }
    }
    
    return null; // No holes with both scores yet
}

/**
 * Populate Nassau inputs from state
 */
export function populateNassau() {
    if (!currentRoundState || currentRoundState.gameType !== 'nassau') return;
    
    // Player names
    document.getElementById('nassau-player1-name').value = currentRoundState.players?.[0] || '';
    document.getElementById('nassau-player2-name').value = currentRoundState.players?.[1] || '';
    
    // Update headers
    document.getElementById('nassau-th-p1').textContent = currentRoundState.players?.[0] || 'Player 1';
    document.getElementById('nassau-th-p2').textContent = currentRoundState.players?.[1] || 'Player 2';
    
    // Wager and press rule
    document.getElementById('nassau-wager').value = currentRoundState.wager ?? 5;
    document.getElementById('nassau-press-rule').value = currentRoundState.pressRule || 'manual';
    
    // Par and scores
    for (let i = 0; i < 18; i++) {
        const hole = i + 1;
        const parInput = document.getElementById(`nassau-h${hole}-par`);
        const p1ScoreInput = document.getElementById(`nassau-p1-h${hole}-score`);
        const p2ScoreInput = document.getElementById(`nassau-p2-h${hole}-score`);
        
        if (parInput) parInput.value = currentRoundState.par?.[i] || '';
        if (p1ScoreInput) p1ScoreInput.value = currentRoundState.scores?.p1?.[i] ?? '';
        if (p2ScoreInput) p2ScoreInput.value = currentRoundState.scores?.p2?.[i] ?? '';
    }
}

/**
 * Update Nassau: Calculate match status, handle presses, update settlement
 * @param {Event} event - The event that triggered the update (optional)
 */
export function updateNassau(event = null) {
    if (!currentRoundState || currentRoundState.gameType !== 'nassau') return;
    
    // --- 1. Read inputs into state ---
    currentRoundState.players = [
        document.getElementById('nassau-player1-name')?.value || '',
        document.getElementById('nassau-player2-name')?.value || ''
    ];
    
    currentRoundState.wager = parseFloat(document.getElementById('nassau-wager')?.value) || 5;
    currentRoundState.pressRule = document.getElementById('nassau-press-rule')?.value || 'manual';
    
    // Read par and scores
    const par = [];
    const p1Scores = [];
    const p2Scores = [];
    
    for (let i = 1; i <= 18; i++) {
        const parVal = document.getElementById(`nassau-h${i}-par`)?.value;
        const p1Val = document.getElementById(`nassau-p1-h${i}-score`)?.value;
        const p2Val = document.getElementById(`nassau-p2-h${i}-score`)?.value;
        
        par.push(parVal === '' ? null : parseInt(parVal));
        p1Scores.push(p1Val === '' ? null : parseInt(p1Val));
        p2Scores.push(p2Val === '' ? null : parseInt(p2Val));
    }
    
    currentRoundState.par = par;
    currentRoundState.scores = { p1: p1Scores, p2: p2Scores };
    
    // --- 2. Calculate match status and handle auto-presses ---
    const holeResults = []; // Difference between p1 and p2 scores (negative means p1 wins the hole)
    const matchStatus = []; // Running status (positive means p1 is up X holes)
    
    // Calculate hole-by-hole results and match status
    let currentStatus = 0;
    
    for (let i = 0; i < 18; i++) {
        const p1Score = p1Scores[i];
        const p2Score = p2Scores[i];
        
        let result = null;
        if (p1Score !== null && p2Score !== null) {
            result = p1Score - p2Score;
            
            // Update match status
            if (result < 0) currentStatus++; // P1 won hole
            else if (result > 0) currentStatus--; // P2 won hole
            // If result === 0, halved hole, no change to status
        }
        
        holeResults.push(result);
        matchStatus.push(currentStatus);
        
        // Handle auto 2-down presses if enabled
        if (currentRoundState.pressRule === 'auto-2down' && i > 0) {
            const prevStatus = matchStatus[i-1];
            
            // Check if just went 2 down
            if ((prevStatus === -1 && currentStatus === -2) || (prevStatus === 1 && currentStatus === 2)) {
                // Add auto press if not already pressed on this hole
                const playerDown = currentStatus > 0 ? '2' : '1'; // Player who is down
                
                // Check if we already have a press on this hole
                const existingPress = currentRoundState.presses?.find(p => p.hole === i + 1);
                
                if (!existingPress && p1Score !== null && p2Score !== null) {
                    if (!currentRoundState.presses) currentRoundState.presses = [];
                    currentRoundState.presses.push({
                        hole: i + 1,
                        player: playerDown,
                        initialMatchStatus: currentStatus,
                        auto: true
                    });
                    
                    console.log(`Auto press added at hole ${i+1} for player ${playerDown}`);
                }
            }
        }
    }
    
    currentRoundState.results = currentRoundState.results || {};
    currentRoundState.results.holeResults = holeResults;
    currentRoundState.results.matchStatus = matchStatus;
    
    // --- 3. Calculate press results ---
    const pressResults = [];
    
    if (currentRoundState.presses && currentRoundState.presses.length > 0) {
        for (const press of currentRoundState.presses) {
            const startHole = press.hole - 1; // 0-based index
            
            if (startHole >= 0 && startHole < 18) {
                const initialStatus = press.initialMatchStatus;
                let finalStatus = null;
                
                // Find the final hole that has scores
                let endHole = 17; // Default to 18th hole
                while (endHole >= startHole) {
                    if (p1Scores[endHole] !== null && p2Scores[endHole] !== null) {
                        break;
                    }
                    endHole--;
                }
                
                if (endHole >= startHole) {
                    // Calculate final status for the press
                    finalStatus = matchStatus[endHole] - initialStatus;
                    
                    pressResults.push({
                        press: press,
                        startHole: startHole,
                        endHole: endHole,
                        initialStatus: initialStatus,
                        finalStatus: finalStatus
                    });
                }
            }
        }
    }
    
    currentRoundState.results.pressResults = pressResults;
    
    // --- 4. Update UI ---
    // Update hole results and match status
    for (let i = 0; i < 18; i++) {
        const hole = i + 1;
        const result = holeResults[i];
        const status = matchStatus[i];
        
        const resultCell = document.getElementById(`nassau-h${hole}-result`);
        const statusCell = document.getElementById(`nassau-h${hole}-status`);
        const pressesCell = document.getElementById(`nassau-h${hole}-presses`);
        
        // Show hole result
        if (resultCell) {
            if (result === null) {
                resultCell.textContent = '';
            } else if (result === 0) {
                resultCell.textContent = 'HALVE';
            } else {
                const winner = result < 0 ? currentRoundState.players[0] || 'P1' : currentRoundState.players[1] || 'P2';
                resultCell.textContent = `${winner} +${Math.abs(result)}`;
            }
        }
        
        // Show match status
        if (statusCell) {
            if (status === null || p1Scores[i] === null || p2Scores[i] === null) {
                statusCell.textContent = '';
                statusCell.className = 'td-std font-semibold';
            } else {
                const holesRemaining = 18 - (i + 1);
                statusCell.textContent = formatMatchStatus(status, holesRemaining, false, currentRoundState.players[0] || 'P1', currentRoundState.players[1] || 'P2');
                statusCell.className = `td-std font-semibold ${getStatusClass(status)}`;
            }
        }
        
        // Show presses
        if (pressesCell) {
            const holeHasPresses = currentRoundState.presses?.some(p => p.hole === hole);
            pressesCell.textContent = holeHasPresses ? '📌' : '';
        }
    }
    
    // Calculate and display summary statistics
    let frontPar = 0, backPar = 0, totalPar = 0;
    let p1Front = 0, p1Back = 0, p1Total = 0;
    let p2Front = 0, p2Back = 0, p2Total = 0;
    let frontValid = true, backValid = true;
    
    for (let i = 0; i < 18; i++) {
        const holeNum = i + 1;
        const curPar = par[i];
        const p1Score = p1Scores[i];
        const p2Score = p2Scores[i];
        
        if (curPar !== null) {
            if (holeNum <= 9) frontPar += curPar;
            else backPar += curPar;
            totalPar += curPar;
        }
        
        if (p1Score !== null) {
            if (holeNum <= 9) p1Front += p1Score;
            else p1Back += p1Score;
            p1Total += p1Score;
        } else {
            if (holeNum <= 9) frontValid = false;
            else backValid = false;
        }
        
        if (p2Score !== null) {
            if (holeNum <= 9) p2Front += p2Score;
            else p2Back += p2Score;
            p2Total += p2Score;
        } else {
            if (holeNum <= 9) frontValid = false;
            else backValid = false;
        }
    }
    
    // Update summary row cells
    document.getElementById('nassau-out-par').textContent = frontPar || '';
    document.getElementById('nassau-in-par').textContent = backPar || '';
    document.getElementById('nassau-total-par').textContent = totalPar || '';
    
    document.getElementById('nassau-p1-out-score').textContent = frontValid ? p1Front : '';
    document.getElementById('nassau-p1-in-score').textContent = backValid ? p1Back : '';
    document.getElementById('nassau-p1-total-score').textContent = (frontValid || backValid) ? p1Total : '';
    
    document.getElementById('nassau-p2-out-score').textContent = frontValid ? p2Front : '';
    document.getElementById('nassau-p2-in-score').textContent = backValid ? p2Back : '';
    document.getElementById('nassau-p2-total-score').textContent = (frontValid || backValid) ? p2Total : '';
    
    // Calculate and display 9-hole and overall status
    const front9Status = frontValid ? matchStatus[8] : null;
    const back9StartStatus = frontValid ? matchStatus[8] : 0;
    const back9Status = backValid ? (matchStatus[17] - back9StartStatus) : null;
    const overallStatus = (frontValid || backValid) ? matchStatus[17] : null;
    
    if (front9Status !== null) {
        const elem = document.getElementById('nassau-front9-status');
        elem.textContent = formatMatchStatus(front9Status, 0, true, currentRoundState.players[0] || 'P1', currentRoundState.players[1] || 'P2');
        elem.className = `td-std ${getStatusClass(front9Status)}`;
    } else {
        document.getElementById('nassau-front9-status').textContent = '';
    }
    
    if (back9Status !== null) {
        const elem = document.getElementById('nassau-back9-status');
        elem.textContent = formatMatchStatus(back9Status, 0, true, currentRoundState.players[0] || 'P1', currentRoundState.players[1] || 'P2');
        elem.className = `td-std ${getStatusClass(back9Status)}`;
    } else {
        document.getElementById('nassau-back9-status').textContent = '';
    }
    
    if (overallStatus !== null) {
        const elem = document.getElementById('nassau-overall-status');
        elem.textContent = formatMatchStatus(overallStatus, 0, true, currentRoundState.players[0] || 'P1', currentRoundState.players[1] || 'P2');
        elem.className = `td-std ${getStatusClass(overallStatus)}`;
    } else {
        document.getElementById('nassau-overall-status').textContent = '';
    }
    
    // Update press counts
    document.getElementById('nassau-front9-presses').textContent = currentRoundState.presses?.filter(p => p.hole <= 9).length || '';
    document.getElementById('nassau-back9-presses').textContent = currentRoundState.presses?.filter(p => p.hole > 9).length || '';
    document.getElementById('nassau-total-presses').textContent = currentRoundState.presses?.length || '';
    
    // --- 5. Handle press button visibility ---
    const p1PressBtn = document.getElementById('nassau-press-btn-p1');
    const p2PressBtn = document.getElementById('nassau-press-btn-p2');
    
    // Only show if press rule is manual and game has started
    const canPress = currentRoundState.pressRule === 'manual' && holeResults.some(r => r !== null);
    
    if (canPress) {
        const currentHole = findCurrentNassauHole();
        
        // Determine which player can press (generally the one who is down)
        if (currentHole && currentHole <= 18) {
            const status = matchStatus[currentHole - 1];
            
            // Show press button for player who is down
            if (status !== 0) {
                if (p1PressBtn) {
                    p1PressBtn.classList.toggle('hidden', status >= 0); // P1 can press if down (status negative)
                }
                if (p2PressBtn) {
                    p2PressBtn.classList.toggle('hidden', status <= 0); // P2 can press if down (status positive)
                }
            } else {
                // All square, hide both
                p1PressBtn?.classList.add('hidden');
                p2PressBtn?.classList.add('hidden');
            }
        } else {
            // No scores entered yet, hide both
            p1PressBtn?.classList.add('hidden');
            p2PressBtn?.classList.add('hidden');
        }
    } else {
        // Not manual press or no scores, hide both
        p1PressBtn?.classList.add('hidden');
        p2PressBtn?.classList.add('hidden');
    }
    
    // --- 6. Calculate and update settlement ---
    updateNassauSettlement();
}

/**
 * Update Nassau settlement information
 */
export function updateNassauSettlement() {
    if (!currentRoundState || currentRoundState.gameType !== 'nassau') return;
    
    const matchStatus = currentRoundState.results.matchStatus;
    const pressResults = currentRoundState.results.pressResults;
    const wager = currentRoundState.wager || 5;
    const p1Name = currentRoundState.players[0] || 'Player 1';
    const p2Name = currentRoundState.players[1] || 'Player 2';
    
    // Extract statuses
    const front9Status = matchStatus[8] || 0; // Status after 9 holes
    const back9StartStatus = front9Status;
    const overallStatus = matchStatus[17] || 0; // Final status
    const back9Status = overallStatus - back9StartStatus; // Change in status on back 9
    
    // Calculate monetary values
    const front9Value = front9Status === 0 ? 0 : (front9Status > 0 ? wager : -wager);
    const back9Value = back9Status === 0 ? 0 : (back9Status > 0 ? wager : -wager);
    const overallValue = overallStatus === 0 ? 0 : (overallStatus > 0 ? wager : -wager);
    
    // Calculate press values
    let pressesTotal = 0;
    for (const press of pressResults || []) {
        if (press.finalStatus !== 0) {
            pressesTotal += (press.finalStatus > 0) ? wager : -wager;
        }
    }
    
    // Calculate total and determine winner
    const totalValue = front9Value + back9Value + overallValue + pressesTotal;
    const settlement = {
        front9StatusText: formatMatchStatus(front9Status, 0, true, p1Name, p2Name),
        front9AmountText: formatCurrency(Math.abs(front9Value)),
        back9StatusText: formatMatchStatus(back9Status, 0, true, p1Name, p2Name),
        back9AmountText: formatCurrency(Math.abs(back9Value)),
        overallStatusText: formatMatchStatus(overallStatus, 0, true, p1Name, p2Name),
        overallAmountText: formatCurrency(Math.abs(overallValue)),
        pressesCount: pressResults?.length || 0,
        pressesAmountText: formatCurrency(Math.abs(pressesTotal)),
    };
    
    // Determine final outcome
    if (totalValue === 0) {
        settlement.summaryText = "All square - no money changes hands";
        settlement.winnerName = "Match Tied";
        settlement.totalAmount = formatCurrency(0);
    } else if (totalValue > 0) {
        settlement.summaryText = `${p2Name} owes ${p1Name} ${formatCurrency(totalValue)}`;
        settlement.winnerName = p1Name;
        settlement.totalAmount = formatCurrency(totalValue);
    } else {
        settlement.summaryText = `${p1Name} owes ${p2Name} ${formatCurrency(Math.abs(totalValue))}`;
        settlement.winnerName = p2Name;
        settlement.totalAmount = formatCurrency(Math.abs(totalValue));
    }
    
    currentRoundState.settlement = settlement;
    
    // Update UI
    document.getElementById('nassau-settlement-front9-status').textContent = settlement.front9StatusText;
    document.getElementById('nassau-settlement-back9-status').textContent = settlement.back9StatusText;
    document.getElementById('nassau-settlement-overall-status').textContent = settlement.overallStatusText;
    document.getElementById('nassau-settlement-presses-count').textContent = settlement.pressesCount;
    
    document.getElementById('nassau-settlement-front9-amount').textContent = settlement.front9AmountText;
    document.getElementById('nassau-settlement-back9-amount').textContent = settlement.back9AmountText;
    document.getElementById('nassau-settlement-overall-amount').textContent = settlement.overallAmountText;
    document.getElementById('nassau-settlement-presses-amount').textContent = settlement.pressesAmountText;
    
    document.getElementById('nassau-settlement-winner-name').textContent = settlement.winnerName;
    document.getElementById('nassau-settlement-total-amount').textContent = settlement.totalAmount;
    document.getElementById('nassau-settlement-summary-text').textContent = settlement.summaryText;
} 