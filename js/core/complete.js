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
function updateNassauSettlement() {
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

/**
 * Game Implementation: VEGAS
 */

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
                <td class="td-std"><input type="number" id="vegas-pA-h${i}-score" min="1" class="input-std input-score" aria-label="Player A Score Hole ${i}"></td>
                <td class="td-std"><input type="number" id="vegas-pB-h${i}-score" min="1" class="input-std input-score" aria-label="Player B Score Hole ${i}"></td>
                <td class="td-std"><input type="number" id="vegas-pC-h${i}-score" min="1" class="input-std input-score" aria-label="Player C Score Hole ${i}"></td>
                <td class="td-std"><input type="number" id="vegas-pD-h${i}-score" min="1" class="input-std input-score" aria-label="Player D Score Hole ${i}"></td>
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
        const pA = pAInput?.value || 'A';
        const pB = pBInput?.value || 'B';
        if (t1Header) t1Header.textContent = `Team 1 (${pA}/${pB})`;
        if (pAHeader) pAHeader.textContent = `Score ${pA}`;
        if (pBHeader) pBHeader.textContent = `Score ${pB}`;
        updateVegas(); // Recalculate if names change affects settlement display
    };
    
    pAInput?.addEventListener('input', updateT1Names);
    pBInput?.addEventListener('input', updateT1Names);

    // Listener for Team 2 names
    const t2Header = document.getElementById('vegas-th-t2');
    const pCInput = document.getElementById('vegas-pC-name');
    const pDInput = document.getElementById('vegas-pD-name');
    const pCHeader = document.getElementById('vegas-th-pC');
    const pDHeader = document.getElementById('vegas-th-pD');
    
    const updateT2Names = () => {
        const pC = pCInput?.value || 'C';
        const pD = pDInput?.value || 'D';
        if (t2Header) t2Header.textContent = `Team 2 (${pC}/${pD})`;
        if (pCHeader) pCHeader.textContent = `Score ${pC}`;
        if (pDHeader) pDHeader.textContent = `Score ${pD}`;
        updateVegas(); // Recalculate if names change affects settlement display
    };
    
    pCInput?.addEventListener('input', updateT2Names);
    pDInput?.addEventListener('input', updateT2Names);
    
    // Listeners for point value changes
    document.getElementById('vegas-point-value')?.addEventListener('input', updateVegas);
}

/**
 * Reset Vegas Display: Clear calculated values in the UI
 */
function resetVegasDisplay() {
    console.log("Reset Vegas Display");
    
    // Clear hole-by-hole team numbers and diffs
    for (let i = 1; i <= 18; i++) {
        document.getElementById(`vegas-h${i}-t1-num`)?.textContent = '';
        document.getElementById(`vegas-h${i}-t2-num`)?.textContent = '';
        const diffCell = document.getElementById(`vegas-h${i}-diff`);
        if(diffCell) {
            diffCell.textContent = '';
            diffCell.className = 'td-std font-semibold'; // Reset class
        }
    }
    
    // Clear summary rows (scores cleared elsewhere)
    document.getElementById('vegas-out-diff')?.textContent = '';
    document.getElementById('vegas-in-diff')?.textContent = '';
    document.getElementById('vegas-total-diff')?.textContent = '';
    document.getElementById('vegas-total-diff')?.className = 'td-std font-extrabold'; // Reset class

    // Clear settlement text
    document.getElementById('vegas-settlement-summary-text')?.textContent = 'Team -- owes Team -- $0.00';

    // Reset headers (names cleared elsewhere)
    document.getElementById('vegas-th-t1').textContent = `Team 1`;
    document.getElementById('vegas-th-t2').textContent = `Team 2`;
    document.getElementById('vegas-th-pA').textContent = `Score A`;
    document.getElementById('vegas-th-pB').textContent = `Score B`;
    document.getElementById('vegas-th-pC').textContent = `Score C`;
    document.getElementById('vegas-th-pD').textContent = `Score D`;
}

/**
 * Populate Vegas inputs from state
 */
function populateVegas() {
    console.log("Populate Vegas");
    if (!currentRoundState || currentRoundState.gameType !== 'vegas') return;

    // Populate setup fields
    document.getElementById('vegas-pA-name').value = currentRoundState.teams?.t1?.pA || '';
    document.getElementById('vegas-pB-name').value = currentRoundState.teams?.t1?.pB || '';
    document.getElementById('vegas-pC-name').value = currentRoundState.teams?.t2?.pC || '';
    document.getElementById('vegas-pD-name').value = currentRoundState.teams?.t2?.pD || '';
    document.getElementById('vegas-point-value').value = currentRoundState.pointValue ?? 1;

    // Update headers immediately
    const pA = currentRoundState.teams?.t1?.pA || 'A';
    const pB = currentRoundState.teams?.t1?.pB || 'B';
    const pC = currentRoundState.teams?.t2?.pC || 'C';
    const pD = currentRoundState.teams?.t2?.pD || 'D';
    document.getElementById('vegas-th-t1').textContent = `Team 1 (${pA}/${pB})`;
    document.getElementById('vegas-th-t2').textContent = `Team 2 (${pC}/${pD})`;
    document.getElementById('vegas-th-pA').textContent = `Score ${pA}`;
    document.getElementById('vegas-th-pB').textContent = `Score ${pB}`;
    document.getElementById('vegas-th-pC').textContent = `Score ${pC}`;
    document.getElementById('vegas-th-pD').textContent = `Score ${pD}`;

    // Populate individual scores
    const players = ['pA', 'pB', 'pC', 'pD'];
    for (let i = 0; i < 18; i++) {
        players.forEach(pKey => {
            const scoreInput = document.getElementById(`vegas-${pKey}-h${i + 1}-score`);
            if (scoreInput) scoreInput.value = currentRoundState.scores?.[pKey]?.[i] ?? '';
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
    currentRoundState.teams = {
        t1: {
            pA: document.getElementById('vegas-pA-name')?.value || '',
            pB: document.getElementById('vegas-pB-name')?.value || ''
        },
        t2: {
            pC: document.getElementById('vegas-pC-name')?.value || '',
            pD: document.getElementById('vegas-pD-name')?.value || ''
        }
    };
    
    currentRoundState.pointValue = parseFloat(document.getElementById('vegas-point-value')?.value) || 0;

    let scores = { pA: [], pB: [], pC: [], pD: [] };
    let totalScores = { pA: 0, pB: 0, pC: 0, pD: 0 };
    let outScores = { pA: 0, pB: 0, pC: 0, pD: 0 };
    let inScores = { pA: 0, pB: 0, pC: 0, pD: 0 };
    const players = ['pA', 'pB', 'pC', 'pD'];

    for (let i = 0; i < 18; i++) {
        players.forEach(pKey => {
            const scoreVal = document.getElementById(`vegas-${pKey}-h${i + 1}-score`)?.value;
            const score = scoreVal === '' ? null : parseInt(scoreVal);
            scores[pKey][i] = score;
            if (score !== null) {
                totalScores[pKey] += score;
                if (i < 9) outScores[pKey] += score; else inScores[pKey] += score;
            }
        });
    }
    currentRoundState.scores = scores;

    // --- 2. Calculate Vegas Numbers and Points Difference ---
    let results = { t1Num: Array(18).fill(null), t2Num: Array(18).fill(null), diff: Array(18).fill(0) };
    let totalDiff = 0;
    let outDiff = 0;
    let inDiff = 0;

    for (let i = 0; i < 18; i++) {
        const hole = i + 1;
        const scoreA = scores.pA[i];
        const scoreB = scores.pB[i];
        const scoreC = scores.pC[i];
        const scoreD = scores.pD[i];

        const t1Num = calculateVegasTeamNumber(scoreA, scoreB);
        const t2Num = calculateVegasTeamNumber(scoreC, scoreD);
        results.t1Num[i] = t1Num;
        results.t2Num[i] = t2Num;

        let holeDiff = 0;
        if (t1Num !== null && t2Num !== null) {
            holeDiff = t2Num - t1Num; // Points won/lost by Team 1
            results.diff[i] = holeDiff;
            totalDiff += holeDiff;
            if (i < 9) outDiff += holeDiff; else inDiff += holeDiff;
        } else {
            results.diff[i] = 0; // No difference if scores incomplete
        }

        // --- 3. Update UI for the hole ---
        document.getElementById(`vegas-h${hole}-t1-num`).textContent = t1Num ?? '--';
        document.getElementById(`vegas-h${hole}-t2-num`).textContent = t2Num ?? '--';
        const diffCell = document.getElementById(`vegas-h${hole}-diff`);
        if (diffCell) {
            diffCell.textContent = (t1Num !== null && t2Num !== null) ? (holeDiff/**
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

/**
 * Helper Functions
 */

/**
 * Formats currency value
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount) {
    // Handle edge cases
    if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
    
    // Format the number with 2 decimal places
    return '// script.js - Complete Golf Scorecard Web App
// @version 1.0.0

/**
 * Constants and State Management
 */
const CURRENT_ROUND_STORAGE_KEY = 'golfScorecardRoundData';
const APP_VERSION = '1.0.0';
let currentRoundState = {}; // Global state object
let debounceTimer; // For input debouncing
let DOM = {}; // DOM element cache

/**
 * DOM Ready Event Listener
 */
document.addEventListener('DOMContentLoaded', initializeApp);

/**
 * Initialize the application
 */
function initializeApp() {
    console.log("Initializing Peel & Eat Golf Scorecards...");
    
    // Cache DOM elements
    cacheDOM();
    
    // Set current year in footer
    if (DOM.currentYearSpan) {
        DOM.currentYearSpan.textContent = new Date().getFullYear();
    }
    
    // Check for localStorage support
    if (!isStorageAvailable()) {
        console.warn("LocalStorage not available. State persistence disabled.");
        showAlert("Your browser doesn't support saving progress. Export your data manually when finished.", "warning", 5000);
    }

    // Generate scorecard tables
    generateAllScorecardRows();
    
    // Try to load saved state
    const savedState = loadState();
    if (savedState && savedState.gameType) {
        currentRoundState = savedState;
        console.log("Resuming previous round:", currentRoundState.gameType);
        
        if (document.getElementById(`${currentRoundState.gameType}-card`)) {
            showScorecard(currentRoundState.gameType);
            DOM.resumeRoundButton.classList.remove('hidden');
        } else {
            console.error(`HTML for saved game type "${currentRoundState.gameType}" not found. Clearing state.`);
            currentRoundState = {};
            localStorage.removeItem(CURRENT_ROUND_STORAGE_KEY);
            showGameSelection();
            DOM.resumeRoundButton.classList.add('hidden');
        }
    } else {
        showGameSelection();
        DOM.resumeRoundButton.classList.add('hidden');
    }

    // Add event listeners
    addEventListeners();
    
    console.log("App Initialized");
}

/**
 * Cache DOM elements for performance
 */
function cacheDOM() {
    DOM.gameSelectionSection = document.getElementById('game-selection');
    DOM.activeScorecardSection = document.getElementById('active-scorecard');
    DOM.gameSelectButtons = document.querySelectorAll('.game-select-btn');
    DOM.scorecardContainers = document.querySelectorAll('.scorecard');
    DOM.backButton = document.getElementById('back-to-selection-btn');
    DOM.clearButton = document.getElementById('clear-round-btn');
    DOM.copySummaryButton = document.getElementById('copy-summary-btn');
    DOM.exportButton = document.getElementById('export-data-btn');
    DOM.importButton = document.getElementById('import-data-btn');
    DOM.importFileInput = document.getElementById('import-file-input');
    DOM.resumeRoundButton = document.getElementById('resume-round-btn');
    DOM.currentYearSpan = document.getElementById('current-year');
    DOM.loadingOverlay = document.getElementById('loading-overlay');
    DOM.alertMessage = document.getElementById('alert-message');
}

/**
 * Add event listeners to interactive elements
 */
function addEventListeners() {
    // Game selection buttons
    DOM.gameSelectButtons.forEach(button => {
        button.addEventListener('click', () => {
            const gameType = button.dataset.game;
            const cardElement = document.getElementById(`${gameType}-card`);

            // Basic check if card exists
            if (!cardElement) {
                console.warn(`${gameType.toUpperCase()} scorecard not implemented.`);
                showAlert(`${gameType.toUpperCase()} scorecard is not available in this version.`, "warning");
                return;
            }

            // Check if we need to clear existing game
            if (currentRoundState.gameType && currentRoundState.gameType !== gameType) {
                if (!confirm(`Starting a new ${gameType} game will clear the previous ${currentRoundState.gameType} round data. Continue?`)) {
                    return;
                }
                
                const previousGameType = currentRoundState.gameType;
                currentRoundState = {}; // Clear state first
                
                // Reset the display of the previous card
                resetDisplay(previousGameType);
            } else if (!currentRoundState.gameType) {
                currentRoundState = {};
            }

            currentRoundState.gameType = gameType;
            initializeDefaultState(gameType); // Setup default state structure
            saveState(); // Save the new default state
            showScorecard(gameType); // Show the card
        });
    });

    // Navigation and control buttons
    DOM.backButton.addEventListener('click', showGameSelection);
    DOM.clearButton.addEventListener('click', clearCurrentRound);
    DOM.copySummaryButton.addEventListener('click', copySummary);
    
    // Data export/import buttons
    if (DOM.exportButton) DOM.exportButton.addEventListener('click', exportState);
    if (DOM.importButton) DOM.importButton.addEventListener('click', () => DOM.importFileInput.click());
    if (DOM.importFileInput) DOM.importFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            importState(e.target.files[0]);
        }
    });
    
    // Resume button
    DOM.resumeRoundButton.addEventListener('click', () => {
        const savedState = loadState();
        if (savedState && savedState.gameType && document.getElementById(`${savedState.gameType}-card`)) {
            currentRoundState = savedState;
            showScorecard(savedState.gameType);
        } else {
            showAlert("No previous round data found or scorecard not implemented.", "error");
            DOM.resumeRoundButton.classList.add('hidden');
            if (localStorage.getItem(CURRENT_ROUND_STORAGE_KEY)) {
                localStorage.removeItem(CURRENT_ROUND_STORAGE_KEY);
            }
        }
    });

    // Event delegation for inputs within active scorecard
    DOM.activeScorecardSection.addEventListener('input', handleInputEvent);
    DOM.activeScorecardSection.addEventListener('change', handleInputEvent);
    DOM.activeScorecardSection.addEventListener('click', handleClickEvent);
    
    // Alert close button
    document.getElementById('alert-close')?.addEventListener('click', () => {
        DOM.alertMessage.classList.add('hidden');
    });
}

/**
 * Handles input/change events in the active scorecard
 * @param {Event} event - The input event
 */
function handleInputEvent(event) {
    if (!currentRoundState?.gameType) return;
    
    const target = event.target;
    const cardId = target.closest('.scorecard')?.id;
    const gameType = cardId ? cardId.replace('-card', '') : null;

    if (gameType !== currentRoundState.gameType) return;

    // Determine if the event target should trigger an update
    const isRelevantInput = target.matches('input, select');
    
    if (!isRelevantInput) return; // Ignore irrelevant events
    
    // Validate score inputs
    if (target.classList.contains('input-score') && target.value) {
        const hole = parseInt(target.id.match(/h(\d+)/)?.[1]);
        const parInput = document.getElementById(`${gameType}-h${hole}-par`);
        const par = parInput ? parseInt(parInput.value) : null;
        
        const validation = validateScore(target.value, par);
        
        if (!validation.valid) {
            target.classList.add('input-invalid');
            target.setCustomValidity(validation.message);
            target.reportValidity();
            return; // Don't update with invalid data
        } else if (validation.warning) {
            target.classList.add('input-warning');
            target.classList.remove('input-invalid');
            target.setCustomValidity(''); // Clear validation message but keep warning class
        } else {
            target.classList.remove('input-invalid', 'input-warning');
            target.setCustomValidity('');
        }
    }

    console.log(`Input on ${gameType}:`, target.id || target.tagName, target.value ?? target.checked);
    
    updateActiveCard(gameType, event); // Update calculations and UI
    saveState(); // Save the new state
}

/**
 * Handles click events in the active scorecard
 * @param {Event} event - The click event
 */
function handleClickEvent(event) {
    if (!currentRoundState?.gameType) return;
    
    const target = event.target;
    const cardId = target.closest('.scorecard')?.id;
    const gameType = cardId ? cardId.replace('-card', '') : null;

    if (gameType !== currentRoundState.gameType) return;

    // Handle specific button clicks
    const isRelevantButton = target.matches('.nassau-press-btn'); // Add other button classes as needed
    
    if (!isRelevantButton) return; // Ignore irrelevant clicks
    
    console.log(`Button click on ${gameType}:`, target.id);
    
    // Call specific handlers if needed
    if (target.classList.contains('nassau-press-btn')) {
        handleNassauPress(event);
    }
    // Add other button handlers as needed
    
    updateActiveCard(gameType, event); // Update calculations and UI
    saveState(); // Save the new state
}

/**
 * Alert display function
 * @param {string} message - Message to display
 * @param {string} type - Alert type: 'success', 'error', 'warning'
 * @param {number} duration - Duration in ms (0 for no auto-close)
 */
function showAlert(message, type = 'success', duration = 3000) {
    const alertBox = document.getElementById('alert-message');
    const alertContent = document.getElementById('alert-content');
    const alertIcon = document.getElementById('alert-icon');
    
    if (!alertBox || !alertContent) return;
    
    // Set content and styling
    alertContent.textContent = message;
    alertBox.classList.remove('hidden');
    
    // Set icon based on type
    let iconSvg = '';
    switch (type) {
        case 'success':
            iconSvg = '<svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
            break;
        case 'error':
            iconSvg = '<svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
            break;
        case 'warning':
            iconSvg = '<svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>';
            break;
    }
    
    if (alertIcon) alertIcon.innerHTML = iconSvg;
    
    // Auto-hide after duration (if not 0)
    if (duration > 0) {
        setTimeout(() => {
            alertBox.classList.add('hidden');
        }, duration);
    }
    
    // Add close button handler
    document.getElementById('alert-close')?.addEventListener('click', () => {
        alertBox.classList.add('hidden');
    });
}

/**
 * Shows the loading overlay
 * @param {boolean} show - Whether to show or hide the overlay
 */
function showLoading(show = true) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.toggle('hidden', !show);
    }
}

/**
 * Checks if browser supports localStorage
 * @returns {boolean} - Whether localStorage is available
 */
function isStorageAvailable() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Saves currentRoundState to localStorage
 * @returns {boolean} Success indicator
 */
function saveState() {
    if (!isStorageAvailable()) {
        console.warn("LocalStorage not available. State cannot be saved.");
        return false;
    }
    
    try {
        // Add metadata to the state
        const stateToSave = {
            ...currentRoundState,
            _metadata: {
                version: APP_VERSION,
                timestamp: new Date().toISOString(),
            }
        };
        
        localStorage.setItem(CURRENT_ROUND_STORAGE_KEY, JSON.stringify(stateToSave));
        console.log("Round state saved");
        
        // Update resume button visibility
        DOM.resumeRoundButton?.classList.toggle('hidden', !localStorage.getItem(CURRENT_ROUND_STORAGE_KEY));
        return true;
    } catch (e) {
        console.error("Error saving state to localStorage:", e);
        showAlert("Could not save round progress. Local storage might be full or disabled.", "error");
        return false;
    }
}

/**
 * Loads round state from localStorage
 * @returns {Object|null} - The loaded state or null
 */
function loadState() {
    if (!isStorageAvailable()) {
        console.warn("LocalStorage not available. State cannot be loaded.");
        return null;
    }
    
    try {
        const savedState = localStorage.getItem(CURRENT_ROUND_STORAGE_KEY);
        if (savedState) {
            console.log("Round state loaded");
            return JSON.parse(savedState);
        }
        return null;
    } catch (e) {
        console.error("Error loading state from localStorage:", e);
        localStorage.removeItem(CURRENT_ROUND_STORAGE_KEY);
        showAlert("There was an error loading your previous round.", "error");
        return null;
    }
}

/**
 * Exports the current state to a JSON file
 */
function exportState() {
    if (!currentRoundState || !currentRoundState.gameType) {
        showAlert("No active round to export.", "warning");
        return;
    }
    
    try {
        // Add metadata to the state
        const stateToExport = {
            ...currentRoundState,
            _metadata: {
                version: APP_VERSION,
                timestamp: new Date().toISOString(),
                exported: true
            }
        };
        
        const dataStr = JSON.stringify(stateToExport, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const fileName = `peel-eat-${currentRoundState.gameType}-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', fileName);
        linkElement.style.display = 'none';
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
        
        showAlert("Round data exported successfully!", "success");
    } catch (e) {
        console.error("Error exporting state:", e);
        showAlert("Failed to export round data.", "error");
    }
}

/**
 * Imports state from a JSON file
 * @param {File} file - The file to import
 */
function importState(file) {
    if (!file) {
        showAlert("No file selected.", "warning");
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(event) {
        try {
            const importedState = JSON.parse(event.target.result);
            
            // Basic validation
            if (!importedState || !importedState.gameType) {
                throw new Error("Invalid data format");
            }
            
            // Check if the game type is supported
            if (!document.getElementById(`${importedState.gameType}-card`)) {
                throw new Error("Game type not supported in this version");
            }
            
            // Confirm before overwriting current state
            if (currentRoundState.gameType && !confirm(`This will overwrite your current ${currentRoundState.gameType} round. Continue?`)) {
                return;
            }
            
            // Set the state and update UI
            currentRoundState = importedState;
            saveState();
            showScorecard(importedState.gameType);
            showAlert("Round data imported successfully!", "success");
        } catch (e) {
            console.error("Error importing state:", e);
            showAlert("Failed to import round data. Invalid file format.", "error");
        }
    };
    
    reader.onerror = function() {
        showAlert("Error reading file.", "error");
    };
    
    reader.readAsText(file);
}

/**
 * Shows the specified scorecard and hides others
 * @param {string} gameType - Type of game to show
 */
function showScorecard(gameType) {
    // Show loading indicator for large state changes
    showLoading(true);
    
    setTimeout(() => {
        DOM.gameSelectionSection.classList.add('hidden');
        DOM.activeScorecardSection.classList.remove('hidden');
    
        let cardFound = false;
        DOM.scorecardContainers.forEach(container => {
            const isTarget = container.id === `${gameType}-card`;
            container.classList.toggle('hidden', !isTarget);
            if (isTarget) cardFound = true;
        });
    
        if (!cardFound) {
            console.error(`Scorecard container not found for game type: ${gameType}`);
            showGameSelection();
            showAlert(`Could not find scorecard for ${gameType}`, "error");
            return;
        }
    
        DOM.gameSelectButtons.forEach(btn => {
             btn.classList.toggle('selected', btn.dataset.game === gameType);
        });
    
        initializeActiveCard(gameType);
        showLoading(false);
    }, 100); // Short timeout to allow UI to render loading indicator
}

/**
 * Shows the game selection screen
 */
function showGameSelection() {
    DOM.activeScorecardSection.classList.add('hidden');
    DOM.gameSelectionSection.classList.remove('hidden');
    DOM.gameSelectButtons.forEach(btn => btn.classList.remove('selected'));
}

/**
 * Clears current round state and resets UI
 */
function clearCurrentRound() {
    if (confirm("Are you sure you want to clear all data for the current round? This cannot be undone.")) {
        const previousGameType = currentRoundState.gameType; // Get type before clearing
        currentRoundState = {};
        localStorage.removeItem(CURRENT_ROUND_STORAGE_KEY);
        showGameSelection();

        // Reset all inputs
        DOM.scorecardContainers.forEach(container => {
            container.querySelectorAll('input, select').forEach(input => {
                 if (input.type === 'checkbox' || input.type === 'radio') input.checked = false;
                 else input.value = '';
            });
        });

        // Call specific reset functions for the previous game type
        if (previousGameType) {
            resetDisplay(previousGameType);
        }

        console.log("Current round cleared.");
        DOM.resumeRoundButton.classList.add('hidden');
        showAlert("Round data cleared successfully", "success");
    }
}

/**
 * Reset display for a specific game type
 * @param {string} gameType - The game type to reset
 */
function resetDisplay(gameType) {
    switch (gameType) {
        case 'nassau': resetNassauDisplay(); break;
        case 'skins': resetSkinsDisplay(); break;
        case 'wolf': resetWolfDisplay(); break;
        case 'bingo': resetBingoDisplay(); break;
        case 'bloodsome': resetBloodsomeDisplay(); break;
        case 'stableford': resetStablefordDisplay(); break;
        case 'banker': resetBankerDisplay(); break;
        case 'vegas': resetVegasDisplay(); break;
        default:
            console.warn(`No reset function for game type: ${gameType}`);
    }
}

/**
 * Sets up the default data structure for a game type in currentRoundState
 * @param {string} gameType - The type of game to initialize
 */
function initializeDefaultState(gameType) {
    currentRoundState = { gameType: gameType }; // Base state
    const defaultPar = Array(18).fill(4); // Common default

    switch (gameType) {
        case 'nassau':
            currentRoundState.players = ['', ''];
            currentRoundState.wager = 5;
            currentRoundState.pressRule = 'manual';
            currentRoundState.par = [...defaultPar];
            currentRoundState.scores = { p1: Array(18).fill(null), p2: Array(18).fill(null) };
            currentRoundState.presses = [];
            currentRoundState.results = { holeResults: [], matchStatus: [], pressResults: [] };
            currentRoundState.settlement = {};
            break;
        case 'skins':
             currentRoundState.players = ['', '', '', ''];
             currentRoundState.wager = 1;
             currentRoundState.validation = false;
             currentRoundState.carryover = true;
             currentRoundState.par = [...defaultPar];
             currentRoundState.scores = { p1: Array(18).fill(null), p2: Array(18).fill(null), p3: Array(18).fill(null), p4: Array(18).fill(null) };
             currentRoundState.results = { winners: Array(18).fill(null), values: Array(18).fill(0), carryovers: Array(18).fill(0) };
             currentRoundState.settlement = { skinsWon: [0, 0, 0, 0], winnings: [0, 0, 0, 0], totalPot: 0, summaryText: '' };
            break;
        case 'wolf':
             currentRoundState.players = ['', '', '', ''];
             currentRoundState.pointValue = 1;
             currentRoundState.loneMultiplier = 3;
             currentRoundState.scores = { p1: Array(18).fill(null), p2: Array(18).fill(null), p3: Array(18).fill(null), p4: Array(18).fill(null) };
             currentRoundState.selections = Array(18).fill('');
             currentRoundState.results = { points: Array(18).fill(null).map(() => [0, 0, 0, 0]) };
             currentRoundState.settlement = { totalPoints: [0, 0, 0, 0], winnings: [0, 0, 0, 0], summaryText: '' };
            break;
        case 'bingo':
             currentRoundState.players = ['', '', '', ''];
             currentRoundState.pointValue = 0.5;
             currentRoundState.marks = {
                 p1: { bi: Array(18).fill(false), ba: Array(18).fill(false), bo: Array(18).fill(false) },
                 p2: { bi: Array(18).fill(false), ba: Array(18).fill(false), bo: Array(18).fill(false) },
                 p3: { bi: Array(18).fill(false), ba: Array(18).fill(false), bo: Array(18).fill(false) },
                 p4: { bi: Array(18).fill(false), ba: Array(18).fill(false), bo: Array(18).fill(false) }
             };
             currentRoundState.results = { pointsPerHole: Array(18).fill(null).map(() => [0, 0, 0, 0]) };
             currentRoundState.settlement = { totalPoints: [0, 0, 0, 0], winnings: [0, 0, 0, 0], summaryText: '' };
            break;
        case 'bloodsome':
             currentRoundState.teams = { t1: { pA: '', pB: '' }, t2: { pC: '', pD: '' } };
             currentRoundState.wager = 10;
             currentRoundState.drives = { t1: Array(18).fill(''), t2: Array(18).fill('') };
             currentRoundState.scores = { t1: Array(18).fill(null), t2: Array(18).fill(null) };
             currentRoundState.results = { holeResults: Array(18).fill(0), matchStatus: Array(18).fill(0) };
             currentRoundState.settlement = { finalStatusText: '--', summaryText: '' };
            break;
        case 'stableford':
             currentRoundState.players = ['', '', '', ''];
             currentRoundState.pointSystem = 'standard';
             currentRoundState.pointValue = 1;
             currentRoundState.par = [...defaultPar];
             currentRoundState.scores = { p1: Array(18).fill(null), p2: Array(18).fill(null), p3: Array(18).fill(null), p4: Array(18).fill(null) };
             currentRoundState.results = { points: { p1: Array(18).fill(0), p2: Array(18).fill(0), p3: Array(18).fill(0), p4: Array(18).fill(0) } };
             currentRoundState.settlement = { totalPoints: [0, 0, 0, 0], winnings: [0, 0, 0, 0], summaryText: '' };
            break;
        case 'banker':
             currentRoundState.players = ['', '', '', ''];
             currentRoundState.quotas = [36, 36, 36, 36];
             currentRoundState.pointValue = 1;
             currentRoundState.pointSystem = 'stableford-standard';
             currentRoundState.par = [...defaultPar];
             currentRoundState.scores = { p1: Array(18).fill(null), p2: Array(18).fill(null), p3: Array(18).fill(null), p4: Array(18).fill(null) };
             currentRoundState.points = { p1: Array(18).fill(null), p2: Array(18).fill(null), p3: Array(18).fill(null), p4: Array(18).fill(null) };
             currentRoundState.results = {};
             currentRoundState.settlement = { totalPoints: [0, 0, 0, 0], vsQuota: [0, 0, 0, 0], winnings: [0, 0, 0, 0], summaryText: '' };
            break;
        case 'vegas':
             currentRoundState.teams = { // Team player names
                 t1: { pA: '', pB: '' },
                 t2: { pC: '', pD: '' }
             };
             currentRoundState.pointValue = 1; // Value per point difference
             currentRoundState.scores = { // Individual gross scores
                 pA: Array(18).fill(null), pB: Array(18).fill(null),
                 pC: Array(18).fill(null), pD: Array(18).fill(null)
             };
             currentRoundState.results = { // Calculated results per hole
                 t1Num: Array(18).fill(null), // Team 1 combined number
                 t2Num: Array(18).fill(null), // Team 2 combined number
                 diff: Array(18).fill(0) // Points difference (T2_Num - T1_Num)
             };
             currentRoundState.settlement = { // Final settlement
                 totalDiff: 0, // Total points difference over 18 holes
                 summaryText: ''
             };
            break;
    }
    console.log("Initialized default state for:", gameType);
}

/**
 * Generates rows for all scorecards
 */
function generateAllScorecardRows() {
    generateNassauRows();
    generateSkinsRows();
    generateWolfRows();
    generateBingoRows();
    generateBloodsomeRows();
    generateStablefordRows();
    generateBankerRows();
    generateVegasRows();
}

/**
 * Calls the appropriate initialization function for the active card
 * @param {string} gameType - The type of game to initialize
 */
function initializeActiveCard(gameType) {
    console.log(`Initializing ${gameType} card...`);
    
    switch (gameType) {
        case 'nassau': initializeNassau(); break;
        case 'skins': initializeSkins(); break;
        case 'wolf': initializeWolf(); break;
        case 'bingo': initializeBingo(); break;
        case 'bloodsome': initializeBloodsome(); break;
        case 'stableford': initializeStableford(); break;
        case 'banker': initializeBanker(); break;
        case 'vegas': initializeVegas(); break;
    }
    populateCardFromState(gameType); // Populate inputs AFTER listeners are added
    updateActiveCard(gameType); // Run initial calculation/display update
}

/**
 * Calls the appropriate update function for the active card
 * @param {string} gameType - The type of game to update
 * @param {Event} event - The event that triggered the update (optional)
 */
function updateActiveCard(gameType, event = null) {
    if (!currentRoundState || currentRoundState.gameType !== gameType) {
        console.warn("State mismatch, skipping update for", gameType);
        return;
    }
    
    // Use the debounced version for input events to improve performance
    if (event && (event.type === 'input' || event.type === 'change')) {
        debouncedUpdate(gameType, event);
        return;
    }
    
    console.log(`Updating ${gameType} card...`);
    
    // Specific update functions should read inputs into state first
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
}

/**
  + Math.abs(parseFloat(amount)).toFixed(2);
}

/**
 * Gets CSS class based on match status (relative to P1/T1)
 * @param {number|string} status - The status value
 * @returns {string} - CSS class name
 */
function getStatusClass(status) {
    if (status === 0 || status === 'AS' || status === 'ALL SQUARE') return 'status-halve';
    if (status > 0 || String(status).includes('UP')) return 'status-win';
    return 'status-loss';
}

/**
 * Gets CSS class based on numeric value (positive/negative)
 * @param {number} value - The numeric value
 * @returns {string} - CSS class name
 */
function getValueClass(value) {
    if (value === 0) return '';
    return value > 0 ? 'value-positive' : 'value-negative';
}

/**
 * Formats match play status string
 * @param {number} status - The status value (positive if P1 is up)
 * @param {number} holesRemaining - Number of holes remaining
 * @param {boolean} isFinal - Whether this is the final status
 * @param {string} p1Name - Player 1's name
 * @param {string} p2Name - Player 2's name
 * @returns {string} - Formatted status string
 */
function formatMatchStatus(status, holesRemaining, isFinal = false, p1Name = 'P1', p2Name = 'P2') {
    if (status === 0) {
        return holesRemaining > 0 ? 'AS' : 'TIED';
    }
    
    const abs = Math.abs(status);
    const leader = status > 0 ? p1Name : p2Name;
    
    if (abs > holesRemaining) {
        return `${leader} ${abs - holesRemaining} & ${abs > holesRemaining + 1 ? holesRemaining + 1 : holesRemaining}`;
    }
    
    // Standard display
    return `${leader} ${abs}${isFinal ? '' : ' UP'}`;
}

/**
 * Calculates Stableford points for a given score relative to par
 * @param {number} score - The player's score
 * @param {number} par - The par for the hole
 * @param {string} system - 'standard' or 'modified' Stableford system
 * @returns {number|null} - The Stableford points earned
 */
function calculateStablefordPoints(score, par, system = 'standard') {
    if (score === null || score === undefined || par === null || par === undefined) {
        return null;
    }
    
    const scoreDiff = score - par; // Positive is over par, negative is under par
    
    if (system === 'standard') {
        // Standard: Bogey = 1, Par = 2, Birdie = 3, Eagle = 4, etc.
        switch (scoreDiff) {
            case 0: return 2;  // Par
            case 1: return 1;  // Bogey
            case -1: return 3; // Birdie
            case -2: return 4; // Eagle
            case -3: return 5; // Double Eagle / Albatross
            default:
                return scoreDiff >= 2 ? 0 : 5 - scoreDiff; // 0 for double bogey or worse
        }
    } else if (system === 'modified') {
        // Modified: Net Double = -1, Bogey = 0, Par = 1, Birdie = 2, etc.
        switch (scoreDiff) {
            case 0: return 1;  // Par
            case 1: return 0;  // Bogey
            case 2: return -1; // Double Bogey
            case -1: return 2; // Birdie
            case -2: return 3; // Eagle
            case -3: return 4; // Double Eagle / Albatross
            default:
                return scoreDiff >= 3 ? -2 : 4 - scoreDiff; // -2 for triple bogey or worse
        }
    }
    
    // Default case - return null for unknown systems
    return null;
}

/**
 * Validates a score input relative to par
 * @param {number} score - The entered score
 * @param {number} par - The par for the hole
 * @returns {Object} - Validation result {valid: boolean, message: string}
 */
function validateScore(score, par) {
    if (score === null || score === undefined || score === '') {
        return { valid: true, message: '' }; // Empty is allowed
    }
    
    // Convert to number
    const numScore = parseInt(score);
    const numPar = parseInt(par);
    
    // Basic validation
    if (isNaN(numScore) || numScore < 1) {
        return { valid: false, message: 'Score must be a positive number' };
    }
    
    // Par-related validation
    if (!isNaN(numPar) && numPar > 0) {
        if (numScore > numPar + 5) {
            return { valid: true, warning: true, message: 'Score seems high relative to par' };
        }
        if (numScore < numPar - 3 && numPar > 3) {
            return { valid: true, warning: true, message: 'Score seems low relative to par' };
        }
    }
    
    return { valid: true, message: '' };
}

/**
 * Game Implementation: NASSAU
 */

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
    
    if (tbody) tbody.innerHTML = html;
}

/**
 * Initialize Nassau: Add listeners for press buttons and player name changes
 */
function initializeNassau() {
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
function resetNassauDisplay() {
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
function handleNassauPress(event) {
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
function findCurrentNassauHole() {
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
function populateNassau() {
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
function updateNassau(event = null) {
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
        const p1Score = p1Scores[// script.js - Complete Golf Scorecard Web App
// @version 1.0.0

/**
 * Constants and State Management
 */
const CURRENT_ROUND_STORAGE_KEY = 'golfScorecardRoundData';
const APP_VERSION = '1.0.0';
let currentRoundState = {}; // Global state object
let debounceTimer; // For input debouncing
let DOM = {}; // DOM element cache

/**
 * DOM Ready Event Listener
 */
document.addEventListener('DOMContentLoaded', initializeApp);

/**
 * Initialize the application
 */
function initializeApp() {
    console.log("Initializing Peel & Eat Golf Scorecards...");
    
    // Cache DOM elements
    cacheDOM();
    
    // Set current year in footer
    if (DOM.currentYearSpan) {
        DOM.currentYearSpan.textContent = new Date().getFullYear();
    }
    
    // Check for localStorage support
    if (!isStorageAvailable()) {
        console.warn("LocalStorage not available. State persistence disabled.");
        showAlert("Your browser doesn't support saving progress. Export your data manually when finished.", "warning", 5000);
    }

    // Generate scorecard tables
    generateAllScorecardRows();
    
    // Try to load saved state
    const savedState = loadState();
    if (savedState && savedState.gameType) {
        currentRoundState = savedState;
        console.log("Resuming previous round:", currentRoundState.gameType);
        
        if (document.getElementById(`${currentRoundState.gameType}-card`)) {
            showScorecard(currentRoundState.gameType);
            DOM.resumeRoundButton.classList.remove('hidden');
        } else {
            console.error(`HTML for saved game type "${currentRoundState.gameType}" not found. Clearing state.`);
            currentRoundState = {};
            localStorage.removeItem(CURRENT_ROUND_STORAGE_KEY);
            showGameSelection();
            DOM.resumeRoundButton.classList.add('hidden');
        }
    } else {
        showGameSelection();
        DOM.resumeRoundButton.classList.add('hidden');
    }

    // Add event listeners
    addEventListeners();
    
    console.log("App Initialized");
}

/**
 * Cache DOM elements for performance
 */
function cacheDOM() {
    DOM.gameSelectionSection = document.getElementById('game-selection');
    DOM.activeScorecardSection = document.getElementById('active-scorecard');
    DOM.gameSelectButtons = document.querySelectorAll('.game-select-btn');
    DOM.scorecardContainers = document.querySelectorAll('.scorecard');
    DOM.backButton = document.getElementById('back-to-selection-btn');
    DOM.clearButton = document.getElementById('clear-round-btn');
    DOM.copySummaryButton = document.getElementById('copy-summary-btn');
    DOM.exportButton = document.getElementById('export-data-btn');
    DOM.importButton = document.getElementById('import-data-btn');
    DOM.importFileInput = document.getElementById('import-file-input');
    DOM.resumeRoundButton = document.getElementById('resume-round-btn');
    DOM.currentYearSpan = document.getElementById('current-year');
    DOM.loadingOverlay = document.getElementById('loading-overlay');
    DOM.alertMessage = document.getElementById('alert-message');
}

/**
 * Add event listeners to interactive elements
 */
function addEventListeners() {
    // Game selection buttons
    DOM.gameSelectButtons.forEach(button => {
        button.addEventListener('click', () => {
            const gameType = button.dataset.game;
            const cardElement = document.getElementById(`${gameType}-card`);

            // Basic check if card exists
            if (!cardElement) {
                console.warn(`${gameType.toUpperCase()} scorecard not implemented.`);
                showAlert(`${gameType.toUpperCase()} scorecard is not available in this version.`, "warning");
                return;
            }

            // Check if we need to clear existing game
            if (currentRoundState.gameType && currentRoundState.gameType !== gameType) {
                if (!confirm(`Starting a new ${gameType} game will clear the previous ${currentRoundState.gameType} round data. Continue?`)) {
                    return;
                }
                
                const previousGameType = currentRoundState.gameType;
                currentRoundState = {}; // Clear state first
                
                // Reset the display of the previous card
                resetDisplay(previousGameType);
            } else if (!currentRoundState.gameType) {
                currentRoundState = {};
            }

            currentRoundState.gameType = gameType;
            initializeDefaultState(gameType); // Setup default state structure
            saveState(); // Save the new default state
            showScorecard(gameType); // Show the card
        });
    });

    // Navigation and control buttons
    DOM.backButton.addEventListener('click', showGameSelection);
    DOM.clearButton.addEventListener('click', clearCurrentRound);
    DOM.copySummaryButton.addEventListener('click', copySummary);
    
    // Data export/import buttons
    if (DOM.exportButton) DOM.exportButton.addEventListener('click', exportState);
    if (DOM.importButton) DOM.importButton.addEventListener('click', () => DOM.importFileInput.click());
    if (DOM.importFileInput) DOM.importFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            importState(e.target.files[0]);
        }
    });
    
    // Resume button
    DOM.resumeRoundButton.addEventListener('click', () => {
        const savedState = loadState();
        if (savedState && savedState.gameType && document.getElementById(`${savedState.gameType}-card`)) {
            currentRoundState = savedState;
            showScorecard(savedState.gameType);
        } else {
            showAlert("No previous round data found or scorecard not implemented.", "error");
            DOM.resumeRoundButton.classList.add('hidden');
            if (localStorage.getItem(CURRENT_ROUND_STORAGE_KEY)) {
                localStorage.removeItem(CURRENT_ROUND_STORAGE_KEY);
            }
        }
    });

    // Event delegation for inputs within active scorecard
    DOM.activeScorecardSection.addEventListener('input', handleInputEvent);
    DOM.activeScorecardSection.addEventListener('change', handleInputEvent);
    DOM.activeScorecardSection.addEventListener('click', handleClickEvent);
    
    // Alert close button
    document.getElementById('alert-close')?.addEventListener('click', () => {
        DOM.alertMessage.classList.add('hidden');
    });
}

/**
 * Handles input/change events in the active scorecard
 * @param {Event} event - The input event
 */
function handleInputEvent(event) {
    if (!currentRoundState?.gameType) return;
    
    const target = event.target;
    const cardId = target.closest('.scorecard')?.id;
    const gameType = cardId ? cardId.replace('-card', '') : null;

    if (gameType !== currentRoundState.gameType) return;

    // Determine if the event target should trigger an update
    const isRelevantInput = target.matches('input, select');
    
    if (!isRelevantInput) return; // Ignore irrelevant events
    
    // Validate score inputs
    if (target.classList.contains('input-score') && target.value) {
        const hole = parseInt(target.id.match(/h(\d+)/)?.[1]);
        const parInput = document.getElementById(`${gameType}-h${hole}-par`);
        const par = parInput ? parseInt(parInput.value) : null;
        
        const validation = validateScore(target.value, par);
        
        if (!validation.valid) {
            target.classList.add('input-invalid');
            target.setCustomValidity(validation.message);
            target.reportValidity();
            return; // Don't update with invalid data
        } else if (validation.warning) {
            target.classList.add('input-warning');
            target.classList.remove('input-invalid');
            target.setCustomValidity(''); // Clear validation message but keep warning class
        } else {
            target.classList.remove('input-invalid', 'input-warning');
            target.setCustomValidity('');
        }
    }

    console.log(`Input on ${gameType}:`, target.id || target.tagName, target.value ?? target.checked);
    
    updateActiveCard(gameType, event); // Update calculations and UI
    saveState(); // Save the new state
}

/**
 * Handles click events in the active scorecard
 * @param {Event} event - The click event
 */
function handleClickEvent(event) {
    if (!currentRoundState?.gameType) return;
    
    const target = event.target;
    const cardId = target.closest('.scorecard')?.id;
    const gameType = cardId ? cardId.replace('-card', '') : null;

    if (gameType !== currentRoundState.gameType) return;

    // Handle specific button clicks
    const isRelevantButton = target.matches('.nassau-press-btn'); // Add other button classes as needed
    
    if (!isRelevantButton) return; // Ignore irrelevant clicks
    
    console.log(`Button click on ${gameType}:`, target.id);
    
    // Call specific handlers if needed
    if (target.classList.contains('nassau-press-btn')) {
        handleNassauPress(event);
    }
    // Add other button handlers as needed
    
    updateActiveCard(gameType, event); // Update calculations and UI
    saveState(); // Save the new state
}

/**
 * Alert display function
 * @param {string} message - Message to display
 * @param {string} type - Alert type: 'success', 'error', 'warning'
 * @param {number} duration - Duration in ms (0 for no auto-close)
 */
function showAlert(message, type = 'success', duration = 3000) {
    const alertBox = document.getElementById('alert-message');
    const alertContent = document.getElementById('alert-content');
    const alertIcon = document.getElementById('alert-icon');
    
    if (!alertBox || !alertContent) return;
    
    // Set content and styling
    alertContent.textContent = message;
    alertBox.classList.remove('hidden');
    
    // Set icon based on type
    let iconSvg = '';
    switch (type) {
        case 'success':
            iconSvg = '<svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
            break;
        case 'error':
            iconSvg = '<svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
            break;
        case 'warning':
            iconSvg = '<svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>';
            break;
    }
    
    if (alertIcon) alertIcon.innerHTML = iconSvg;
    
    // Auto-hide after duration (if not 0)
    if (duration > 0) {
        setTimeout(() => {
            alertBox.classList.add('hidden');
        }, duration);
    }
    
    // Add close button handler
    document.getElementById('alert-close')?.addEventListener('click', () => {
        alertBox.classList.add('hidden');
    });
}

/**
 * Shows the loading overlay
 * @param {boolean} show - Whether to show or hide the overlay
 */
function showLoading(show = true) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.toggle('hidden', !show);
    }
}

/**
 * Checks if browser supports localStorage
 * @returns {boolean} - Whether localStorage is available
 */
function isStorageAvailable() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Saves currentRoundState to localStorage
 * @returns {boolean} Success indicator
 */
function saveState() {
    if (!isStorageAvailable()) {
        console.warn("LocalStorage not available. State cannot be saved.");
        return false;
    }
    
    try {
        // Add metadata to the state
        const stateToSave = {
            ...currentRoundState,
            _metadata: {
                version: APP_VERSION,
                timestamp: new Date().toISOString(),
            }
        };
        
        localStorage.setItem(CURRENT_ROUND_STORAGE_KEY, JSON.stringify(stateToSave));
        console.log("Round state saved");
        
        // Update resume button visibility
        DOM.resumeRoundButton?.classList.toggle('hidden', !localStorage.getItem(CURRENT_ROUND_STORAGE_KEY));
        return true;
    } catch (e) {
        console.error("Error saving state to localStorage:", e);
        showAlert("Could not save round progress. Local storage might be full or disabled.", "error");
        return false;
    }
}

/**
 * Loads round state from localStorage
 * @returns {Object|null} - The loaded state or null
 */
function loadState() {
    if (!isStorageAvailable()) {
        console.warn("LocalStorage not available. State cannot be loaded.");
        return null;
    }
    
    try {
        const savedState = localStorage.getItem(CURRENT_ROUND_STORAGE_KEY);
        if (savedState) {
            console.log("Round state loaded");
            return JSON.parse(savedState);
        }
        return null;
    } catch (e) {
        console.error("Error loading state from localStorage:", e);
        localStorage.removeItem(CURRENT_ROUND_STORAGE_KEY);
        showAlert("There was an error loading your previous round.", "error");
        return null;
    }
}

/**
 * Exports the current state to a JSON file
 */
function exportState() {
    if (!currentRoundState || !currentRoundState.gameType) {
        showAlert("No active round to export.", "warning");
        return;
    }
    
    try {
        // Add metadata to the state
        const stateToExport = {
            ...currentRoundState,
            _metadata: {
                version: APP_VERSION,
                timestamp: new Date().toISOString(),
                exported: true
            }
        };
        
        const dataStr = JSON.stringify(stateToExport, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const fileName = `peel-eat-${currentRoundState.gameType}-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', fileName);
        linkElement.style.display = 'none';
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
        
        showAlert("Round data exported successfully!", "success");
    } catch (e) {
        console.error("Error exporting state:", e);
        showAlert("Failed to export round data.", "error");
    }
}

/**
 * Imports state from a JSON file
 * @param {File} file - The file to import
 */
function importState(file) {
    if (!file) {
        showAlert("No file selected.", "warning");
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(event) {
        try {
            const importedState = JSON.parse(event.target.result);
            
            // Basic validation
            if (!importedState || !importedState.gameType) {
                throw new Error("Invalid data format");
            }
            
            // Check if the game type is supported
            if (!document.getElementById(`${importedState.gameType}-card`)) {
                throw new Error("Game type not supported in this version");
            }
            
            // Confirm before overwriting current state
            if (currentRoundState.gameType && !confirm(`This will overwrite your current ${currentRoundState.gameType} round. Continue?`)) {
                return;
            }
            
            // Set the state and update UI
            currentRoundState = importedState;
            saveState();
            showScorecard(importedState.gameType);
            showAlert("Round data imported successfully!", "success");
        } catch (e) {
            console.error("Error importing state:", e);
            showAlert("Failed to import round data. Invalid file format.", "error");
        }
    };
    
    reader.onerror = function() {
        showAlert("Error reading file.", "error");
    };
    
    reader.readAsText(file);
}

/**
 * Shows the specified scorecard and hides others
 * @param {string} gameType - Type of game to show
 */
function showScorecard(gameType) {
    // Show loading indicator for large state changes
    showLoading(true);
    
    setTimeout(() => {
        DOM.gameSelectionSection.classList.add('hidden');
        DOM.activeScorecardSection.classList.remove('hidden');
    
        let cardFound = false;
        DOM.scorecardContainers.forEach(container => {
            const isTarget = container.id === `${gameType}-card`;
            container.classList.toggle('hidden', !isTarget);
            if (isTarget) cardFound = true;
        });
    
        if (!cardFound) {
            console.error(`Scorecard container not found for game type: ${gameType}`);
            showGameSelection();
            showAlert(`Could not find scorecard for ${gameType}`, "error");
            return;
        }
    
        DOM.gameSelectButtons.forEach(btn => {
             btn.classList.toggle('selected', btn.dataset.game === gameType);
        });
    
        initializeActiveCard(gameType);
        showLoading(false);
    }, 100); // Short timeout to allow UI to render loading indicator
}

/**
 * Shows the game selection screen
 */
function showGameSelection() {
    DOM.activeScorecardSection.classList.add('hidden');
    DOM.gameSelectionSection.classList.remove('hidden');
    DOM.gameSelectButtons.forEach(btn => btn.classList.remove('selected'));
}

/**
 * Clears current round state and resets UI
 */
function clearCurrentRound() {
    if (confirm("Are you sure you want to clear all data for the current round? This cannot be undone.")) {
        const previousGameType = currentRoundState.gameType; // Get type before clearing
        currentRoundState = {};
        localStorage.removeItem(CURRENT_ROUND_STORAGE_KEY);
        showGameSelection();

        // Reset all inputs
        DOM.scorecardContainers.forEach(container => {
            container.querySelectorAll('input, select').forEach(input => {
                 if (input.type === 'checkbox' || input.type === 'radio') input.checked = false;
                 else input.value = '';
            });
        });

        // Call specific reset functions for the previous game type
        if (previousGameType) {
            resetDisplay(previousGameType);
        }

        console.log("Current round cleared.");
        DOM.resumeRoundButton.classList.add('hidden');
        showAlert("Round data cleared successfully", "success");
    }
}

/**
 * Reset display for a specific game type
 * @param {string} gameType - The game type to reset
 */
function resetDisplay(gameType) {
    switch (gameType) {
        case 'nassau': resetNassauDisplay(); break;
        case 'skins': resetSkinsDisplay(); break;
        case 'wolf': resetWolfDisplay(); break;
        case 'bingo': resetBingoDisplay(); break;
        case 'bloodsome': resetBloodsomeDisplay(); break;
        case 'stableford': resetStablefordDisplay(); break;
        case 'banker': resetBankerDisplay(); break;
        case 'vegas': resetVegasDisplay(); break;
        default:
            console.warn(`No reset function for game type: ${gameType}`);
    }
}

/**
 * Sets up the default data structure for a game type in currentRoundState
 * @param {string} gameType - The type of game to initialize
 */
function initializeDefaultState(gameType) {
    currentRoundState = { gameType: gameType }; // Base state
    const defaultPar = Array(18).fill(4); // Common default

    switch (gameType) {
        case 'nassau':
            currentRoundState.players = ['', ''];
            currentRoundState.wager = 5;
            currentRoundState.pressRule = 'manual';
            currentRoundState.par = [...defaultPar];
            currentRoundState.scores = { p1: Array(18).fill(null), p2: Array(18).fill(null) };
            currentRoundState.presses = [];
            currentRoundState.results = { holeResults: [], matchStatus: [], pressResults: [] };
            currentRoundState.settlement = {};
            break;
        case 'skins':
             currentRoundState.players = ['', '', '', ''];
             currentRoundState.wager = 1;
             currentRoundState.validation = false;
             currentRoundState.carryover = true;
             currentRoundState.par = [...defaultPar];
             currentRoundState.scores = { p1: Array(18).fill(null), p2: Array(18).fill(null), p3: Array(18).fill(null), p4: Array(18).fill(null) };
             currentRoundState.results = { winners: Array(18).fill(null), values: Array(18).fill(0), carryovers: Array(18).fill(0) };
             currentRoundState.settlement = { skinsWon: [0, 0, 0, 0], winnings: [0, 0, 0, 0], totalPot: 0, summaryText: '' };
            break;
        case 'wolf':
             currentRoundState.players = ['', '', '', ''];
             currentRoundState.pointValue = 1;
             currentRoundState.loneMultiplier = 3;
             currentRoundState.scores = { p1: Array(18).fill(null), p2: Array(18).fill(null), p3: Array(18).fill(null), p4: Array(18).fill(null) };
             currentRoundState.selections = Array(18).fill('');
             currentRoundState.results = { points: Array(18).fill(null).map(() => [0, 0, 0, 0]) };
             currentRoundState.settlement = { totalPoints: [0, 0, 0, 0], winnings: [0, 0, 0, 0], summaryText: '' };
            break;
        case 'bingo':
             currentRoundState.players = ['', '', '', ''];
             currentRoundState.pointValue = 0.5;
             currentRoundState.marks = {
                 p1: { bi: Array(18).fill(false), ba: Array(18).fill(false), bo: Array(18).fill(false) },
                 p2: { bi: Array(18).fill(false), ba: Array(18).fill(false), bo: Array(18).fill(false) },
                 p3: { bi: Array(18).fill(false), ba: Array(18).fill(false), bo: Array(18).fill(false) },
                 p4: { bi: Array(18).fill(false), ba: Array(18).fill(false), bo: Array(18).fill(false) }
             };
             currentRoundState.results = { pointsPerHole: Array(18).fill(null).map(() => [0, 0, 0, 0]) };
             currentRoundState.settlement = { totalPoints: [0, 0, 0, 0], winnings: [0, 0, 0, 0], summaryText: '' };
            break;
        case 'bloodsome':
             currentRoundState.teams = { t1: { pA: '', pB: '' }, t2: { pC: '', pD: '' } };
             currentRoundState.wager = 10;
             currentRoundState.drives = { t1: Array(18).fill(''), t2: Array(18).fill('') };
             currentRoundState.scores = { t1: Array(18).fill(null), t2: Array(18).fill(null) };
             currentRoundState.results = { holeResults: Array(18).fill(0), matchStatus: Array(18).fill(0) };
             currentRoundState.settlement = { finalStatusText: '--', summaryText: '' };
            break;
        case 'stableford':
             currentRoundState.players = ['', '', '', ''];
             currentRoundState.pointSystem = 'standard';
             currentRoundState.pointValue = 1;
             currentRoundState.par = [...defaultPar];
             currentRoundState.scores = { p1: Array(18).fill(null), p2: Array(18).fill(null), p3: Array(18).fill(null), p4: Array(18).fill(null) };
             currentRoundState.results = { points: { p1: Array(18).fill(0), p2: Array(18).fill(0), p3: Array(18).fill(0), p4: Array(18).fill(0) } };
             currentRoundState.settlement = { totalPoints: [0, 0, 0, 0], winnings: [0, 0, 0, 0], summaryText: '' };
            break;
        case 'banker':
             currentRoundState.players = ['', '', '', ''];
             currentRoundState.quotas = [36, 36, 36, 36];
             currentRoundState.pointValue = 1;
             currentRoundState.pointSystem = 'stableford-standard';
             currentRoundState.par = [...defaultPar];
             currentRoundState.scores = { p1: Array(18).fill(null), p2: Array(18).fill(null), p3: Array(18).fill(null), p4: Array(18).fill(null) };
             currentRoundState.points = { p1: Array(18).fill(null), p2: Array(18).fill(null), p3: Array(18).fill(null), p4: Array(18).fill(null) };
             currentRoundState.results = {};
             currentRoundState.settlement = { totalPoints: [0, 0, 0, 0], vsQuota: [0, 0, 0, 0], winnings: [0, 0, 0, 0], summaryText: '' };
            break;
        case 'vegas':
             currentRoundState.teams = { // Team player names
                 t1: { pA: '', pB: '' },
                 t2: { pC: '', pD: '' }
             };
             currentRoundState.pointValue = 1; // Value per point difference
             currentRoundState.scores = { // Individual gross scores
                 pA: Array(18).fill(null), pB: Array(18).fill(null),
                 pC: Array(18).fill(null), pD: Array(18).fill(null)
             };
             currentRoundState.results = { // Calculated results per hole
                 t1Num: Array(18).fill(null), // Team 1 combined number
                 t2Num: Array(18).fill(null), // Team 2 combined number
                 diff: Array(18).fill(0) // Points difference (T2_Num - T1_Num)
             };
             currentRoundState.settlement = { // Final settlement
                 totalDiff: 0, // Total points difference over 18 holes
                 summaryText: ''
             };
            break;
    }
    console.log("Initialized default state for:", gameType);
}

/**
 * Generates rows for all scorecards
 */
function generateAllScorecardRows() {
    generateNassauRows();
    generateSkinsRows();
    generateWolfRows();
    generateBingoRows();
    generateBloodsomeRows();
    generateStablefordRows();
    generateBankerRows();
    generateVegasRows();
}

/**
 * Calls the appropriate initialization function for the active card
 * @param {string} gameType - The type of game to initialize
 */
function initializeActiveCard(gameType) {
    console.log(`Initializing ${gameType} card...`);
    
    switch (gameType) {
        case 'nassau': initializeNassau(); break;
        case 'skins': initializeSkins(); break;
        case 'wolf': initializeWolf(); break;
        case 'bingo': initializeBingo(); break;
        case 'bloodsome': initializeBloodsome(); break;
        case 'stableford': initializeStableford(); break;
        case 'banker': initializeBanker(); break;
        case 'vegas': initializeVegas(); break;
    }
    populateCardFromState(gameType); // Populate inputs AFTER listeners are added
    updateActiveCard(gameType); // Run initial calculation/display update
}

/**
 * Calls the appropriate update function for the active card
 * @param {string} gameType - The type of game to update
 * @param {Event} event - The event that triggered the update (optional)
 */
function updateActiveCard(gameType, event = null) {
    if (!currentRoundState || currentRoundState.gameType !== gameType) {
        console.warn("State mismatch, skipping update for", gameType);
        return;
    }
    
    // Use the debounced version for input events to improve performance
    if (event && (event.type === 'input' || event.type === 'change')) {
        debouncedUpdate(gameType, event);
        return;
    }
    
    console.log(`Updating ${gameType} card...`);
    
    // Specific update functions should read inputs into state first
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
}

/**
 