/**
 * Game Implementation: SKINS
 */

/**
 * Generate Skins scorecard rows
 */
function generateSkinsRows() {
    const tbody = document.getElementById('skins-scorecard-body');
    if (!tbody || tbody.children.length > 0) return; // Already populated
    
    let html = '';
    
    for (let i = 1; i <= 18; i++) {
        html += `
            <tr id="skins-row-h${i}">
                <td class="td-std font-medium">${i}</td>
                <td class="td-std"><input type="number" id="skins-h${i}-par" min="3" max="6" class="input-std input-par" aria-label="Hole ${i} Par"></td>
                <td class="td-std"><input type="number" id="skins-p1-h${i}-score" min="1" class="input-std input-score" aria-label="Player 1 Score Hole ${i}"></td>
                <td class="td-std"><input type="number" id="skins-p2-h${i}-score" min="1" class="input-std input-score" aria-label="Player 2 Score Hole ${i}"></td>
                <td class="td-std"><input type="number" id="skins-p3-h${i}-score" min="1" class="input-std input-score" aria-label="Player 3 Score Hole ${i}"></td>
                <td class="td-std"><input type="number" id="skins-p4-h${i}-score" min="1" class="input-std input-score" aria-label="Player 4 Score Hole ${i}"></td>
                <td class="td-std" id="skins-h${i}-winner"></td>
                <td class="td-std" id="skins-h${i}-value"></td>
                <td class="td-std" id="skins-h${i}-carryover"></td>
            </tr>`;
        
        // Add summary rows
        if (i === 9) {
            html += `
                <tr class="bg-gray-100 font-semibold">
                    <td class="td-std">OUT</td>
                    <td class="td-std" id="skins-out-par"></td>
                    <td class="td-std" id="skins-p1-out-score"></td>
                    <td class="td-std" id="skins-p2-out-score"></td>
                    <td class="td-std" id="skins-p3-out-score"></td>
                    <td class="td-std" id="skins-p4-out-score"></td>
                    <td class="td-std" colspan="3"></td>
                </tr>`;
        } else if (i === 18) {
            html += `
                <tr class="bg-gray-100 font-semibold">
                    <td class="td-std">IN</td>
                    <td class="td-std" id="skins-in-par"></td>
                    <td class="td-std" id="skins-p1-in-score"></td>
                    <td class="td-std" id="skins-p2-in-score"></td>
                    <td class="td-std" id="skins-p3-in-score"></td>
                    <td class="td-std" id="skins-p4-in-score"></td>
                    <td class="td-std" colspan="3"></td>
                </tr>
                <tr class="bg-gray-200 font-bold">
                    <td class="td-std">TOTAL</td>
                    <td class="td-std" id="skins-total-par"></td>
                    <td class="td-std" id="skins-p1-total-score"></td>
                    <td class="td-std" id="skins-p2-total-score"></td>
                    <td class="td-std" id="skins-p3-total-score"></td>
                    <td class="td-std" id="skins-p4-total-score"></td>
                    <td class="td-std" colspan="3"></td>
                </tr>`;
        }
    }
    
    if (tbody) tbody.innerHTML = html;
}

/**
 * Initialize Skins: Add listeners for player name changes and option toggles
 */
function initializeSkins() {
    console.log("Initializing Skins");
    
    // Update header names when players change
    const playerInputs = [];
    const playerHeaders = [];
    
    for (let i = 1; i <= 4; i++) {
        playerInputs.push(document.getElementById(`skins-p${i}-name`));
        playerHeaders.push(document.getElementById(`skins-th-p${i}`));
    }
    
    const updateHeaders = () => {
        for (let i = 0; i < 4; i++) {
            if (playerHeaders[i]) {
                playerHeaders[i].textContent = playerInputs[i]?.value || `P${i+1}`;
            }
        }
        updateSkinsSettlement(); // Update settlement names
    };
    
    playerInputs.forEach(input => {
        if (input) input.addEventListener('input', updateHeaders);
    });
    
    // Add listener for validation and carryover option changes
    document.getElementById('skins-validation')?.addEventListener('change', updateSkins);
    document.getElementById('skins-carryover')?.addEventListener('change', updateSkins);
    document.getElementById('skins-wager')?.addEventListener('input', updateSkins);
    
    // Generate rows if needed
    generateSkinsRows();
}

/**
 * Reset Skins Display: Clear calculated values in the UI
 */
function resetSkinsDisplay() {
    console.log("Reset Skins Display");
    
    // Reset winner and value displays
    for (let i = 1; i <= 18; i++) {
        document.getElementById(`skins-h${i}-winner`)?.textContent = '';
        document.getElementById(`skins-h${i}-winner`)?.className = 'td-std';
        document.getElementById(`skins-h${i}-value`)?.textContent = '';
        document.getElementById(`skins-h${i}-carryover`)?.textContent = '';
    }
    
    // Reset summary fields
    document.getElementById('skins-out-par')?.textContent = '';
    document.getElementById('skins-in-par')?.textContent = '';
    document.getElementById('skins-total-par')?.textContent = '';
    
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`skins-p${i}-out-score`)?.textContent = '';
        document.getElementById(`skins-p${i}-in-score`)?.textContent = '';
        document.getElementById(`skins-p${i}-total-score`)?.textContent = '';
    }
    
    // Reset headers
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`skins-th-p${i}`)?.textContent = `P${i}`;
    }
    
    // Reset settlement area
    document.getElementById('skins-total-pot')?.textContent = '0.00';
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`skins-settle-p${i}-name`)?.textContent = `Player ${i}:`;
        document.getElementById(`skins-settle-p${i}-skins`)?.textContent = '0';
        document.getElementById(`skins-settle-p${i}-winnings`)?.textContent = '0.00';
    }
}

/**
 * Populate Skins inputs from state
 */
function populateSkins() {
    console.log("Populate Skins");
    if (!currentRoundState || currentRoundState.gameType !== 'skins') return;
    
    // Player names
    for (let i = 0; i < 4; i++) {
        document.getElementById(`skins-p${i+1}-name`).value = currentRoundState.players[i] || '';
        document.getElementById(`skins-th-p${i+1}`).textContent = currentRoundState.players[i] || `P${i+1}`;
    }
    
    // Options
    document.getElementById('skins-wager').value = currentRoundState.wager ?? 1;
    document.getElementById('skins-validation').checked = !!currentRoundState.validation;
    document.getElementById('skins-carryover').checked = currentRoundState.carryover !== false; // Default to true
    
    // Par and scores
    for (let i = 0; i < 18; i++) {
        const hole = i + 1;
        const parInput = document.getElementById(`skins-h${hole}-par`);
        if (parInput) parInput.value = currentRoundState.par[i] || '';
        
        for (let p = 1; p <= 4; p++) {
            const scoreInput = document.getElementById(`skins-p${p}-h${hole}-score`);
            if (scoreInput) {
                const score = currentRoundState.scores[`p${p}`][i];
                scoreInput.value = score !== null ? score : '';
            }
        }
    }
    
    // Results will be populated by updateSkins
}

/**
 * Update Skins: Calculate skin winners, values, and settlement
 */
function updateSkins() {
    console.log("Update Skins");
    if (!currentRoundState || currentRoundState.gameType !== 'skins') return;
    
    // --- 1. Read inputs into state ---
    currentRoundState.players = [];
    for (let i = 1; i <= 4; i++) {
        currentRoundState.players.push(document.getElementById(`skins-p${i}-name`)?.value || '');
    }
    
    currentRoundState.wager = parseFloat(document.getElementById('skins-wager')?.value) || 1;
    currentRoundState.validation = document.getElementById('skins-validation')?.checked || false;
    currentRoundState.carryover = document.getElementById('skins-carryover')?.checked !== false; // Default to true
    
    // Read par and scores
    const par = [];
    const scores = { p1: [], p2: [], p3: [], p4: [] };
    
    for (let i = 1; i <= 18; i++) {
        const parVal = document.getElementById(`skins-h${i}-par`)?.value;
        par.push(parVal === '' ? null : parseInt(parVal));
        
        for (let p = 1; p <= 4; p++) {
            const scoreVal = document.getElementById(`skins-p${p}-h${i}-score`)?.value;
            scores[`p${p}`].push(scoreVal === '' ? null : parseInt(scoreVal));
        }
    }
    
    currentRoundState.par = par;
    currentRoundState.scores = scores;
    
    // --- 2. Calculate skin winners and values ---
    const winners = Array(18).fill(null);
    const values = Array(18).fill(0);
    const carryovers = Array(18).fill(0);
    
    let carryoverAmount = 0;
    
    for (let i = 0; i < 18; i++) {
        // Get scores for this hole
        const holeScores = [
            scores.p1[i],
            scores.p2[i],
            scores.p3[i],
            scores.p4[i]
        ];
        
        // Count players with valid scores on the hole
        const validPlayers = holeScores.filter(s => s !== null).length;
        if (validPlayers < 2) continue; // Need at least 2 players to compete
        
        // Value of this hole (wager * number of players + carryover)
        const baseValue = currentRoundState.wager * validPlayers;
        const holeValue = baseValue + carryoverAmount;
        
        // Check if validation is enabled and hole has par
        const validationRequired = currentRoundState.validation && par[i] !== null;
        
        // Find the lowest score
        const minScore = Math.min(...holeScores.filter(s => s !== null));
        
        // Check how many players achieved the lowest score
        const lowestScorers = [];
        for (let p = 0; p < 4; p++) {
            if (holeScores[p] === minScore) {
                lowestScorers.push(p);
            }
        }
        
        // Single lowest score = skin winner
        if (lowestScorers.length === 1) {
            const winnerIndex = lowestScorers[0];
            
            // If validation required, check if score beats par
            if (validationRequired) {
                const currentPar = par[i];
                if (minScore <= currentPar) { // Must be par or better
                    winners[i] = winnerIndex;
                    values[i] = holeValue;
                    carryoverAmount = 0; // Reset carryover
                } else {
                    // Failed validation, carry over 
                    carryoverAmount = currentRoundState.carryover ? (carryoverAmount + baseValue) : 0;
                    carryovers[i] = carryoverAmount;
                }
            } else {
                // No validation required, award skin
                winners[i] = winnerIndex;
                values[i] = holeValue;
                carryoverAmount = 0; // Reset carryover
            }
        } else {
            // Tie, carry over if enabled
            carryoverAmount = currentRoundState.carryover ? (carryoverAmount + baseValue) : 0;
            carryovers[i] = carryoverAmount;
        }
    }
    
    // Store results in state
    currentRoundState.results = {
        winners: winners,
        values: values,
        carryovers: carryovers
    };
    
    // --- 3. Update UI ---
    // Update hole results
    for (let i = 0; i < 18; i++) {
        const hole = i + 1;
        const winner = winners[i];
        const value = values[i];
        const carryover = carryovers[i];
        
        const winnerCell = document.getElementById(`skins-h${hole}-winner`);
        const valueCell = document.getElementById(`skins-h${hole}-value`);
        const carryoverCell = document.getElementById(`skins-h${hole}-carryover`);
        
        // Show winner
        if (winnerCell) {
            if (winner === null) {
                winnerCell.textContent = '';
                winnerCell.className = 'td-std';
            } else {
                const winnerName = currentRoundState.players[winner] || `P${winner + 1}`;
                winnerCell.textContent = winnerName;
                winnerCell.className = 'td-std skin-winner-cell';
            }
        }
        
        // Show value
        if (valueCell) {
            valueCell.textContent = value > 0 ? formatCurrency(value) : '';
        }
        
        // Show carryover
        if (carryoverCell) {
            carryoverCell.textContent = carryover > 0 ? formatCurrency(carryover) : '';
        }
    }
    
    // Calculate and display summary statistics
    let frontPar = 0, backPar = 0, totalPar = 0;
    const frontScores = [0, 0, 0, 0];
    const backScores = [0, 0, 0, 0];
    const totalScores = [0, 0, 0, 0];
    const frontValid = [true, true, true, true];
    const backValid = [true, true, true, true];
    
    for (let i = 0; i < 18; i++) {
        const holeNum = i + 1;
        const curPar = par[i];
        
        if (curPar !== null) {
            if (holeNum <= 9) frontPar += curPar;
            else backPar += curPar;
            totalPar += curPar;
        }
        
        for (let p = 0; p < 4; p++) {
            const score = scores[`p${p+1}`][i];
            if (score !== null) {
                if (holeNum <= 9) frontScores[p] += score;
                else backScores[p] += score;
                totalScores[p] += score;
            } else {
                if (holeNum <= 9) frontValid[p] = false;
                else backValid[p] = false;
            }
        }
    }
    
    // Update summary row cells
    document.getElementById('skins-out-par').textContent = frontPar || '';
    document.getElementById('skins-in-par').textContent = backPar || '';
    document.getElementById('skins-total-par').textContent = totalPar || '';
    
    for (let p = 0; p < 4; p++) {
        document.getElementById(`skins-p${p+1}-out-score`).textContent = frontValid[p] ? frontScores[p] : '';
        document.getElementById(`skins-p${p+1}-in-score`).textContent = backValid[p] ? backScores[p] : '';
        document.getElementById(`skins-p${p+1}-total-score`).textContent = (frontValid[p] || backValid[p]) ? totalScores[p] : '';
    }
    
    // Update settlement
    updateSkinsSettlement();
}

/**
 * Update Skins settlement information
 */
function updateSkinsSettlement() {
    if (!currentRoundState || currentRoundState.gameType !== 'skins') return;
    
    const winners = currentRoundState.results.winners;
    const values = currentRoundState.results.values;
    
    // Calculate skins won and winnings for each player
    const skinsWon = [0, 0, 0, 0];
    const winnings = [0, 0, 0, 0];
    let totalPot = 0;
    
    for (let i = 0; i < 18; i++) {
        const winner = winners[i];
        const value = values[i];
        
        if (winner !== null && value > 0) {
            skinsWon[winner]++;
            winnings[winner] += value;
            totalPot += value;
        }
    }
    
    // Create settlement summary
    const settlement = {
        skinsWon: skinsWon,
        winnings: winnings,
        totalPot: totalPot,
        summaryText: ''
    };
    
    // Generate summary text (optional)
    if (totalPot > 0) {
        const summaryLines = [];
        for (let p = 0; p < 4; p++) {
            if (winnings[p] > 0) {
                const playerName = currentRoundState.players[p] || `Player ${p+1}`;
                summaryLines.push(`${playerName} won ${skinsWon[p]} skin${skinsWon[p] !== 1 ? 's' : ''} (${formatCurrency(winnings[p])})`);
            }
        }
        settlement.summaryText = summaryLines.join(', ');
    } else {
        settlement.summaryText = 'No skins awarded yet';
    }
    
    currentRoundState.settlement = settlement;
    
    // Update UI
    document.getElementById('skins-total-pot').textContent = formatCurrency(totalPot).replace('$', '');
    
    for (let p = 0; p < 4; p++) {
        document.getElementById(`skins-settle-p${p+1}-name`).textContent = `${currentRoundState.players[p] || `Player ${p+1}`}:`;
        document.getElementById(`skins-settle-p${p+1}-skins`).textContent = skinsWon[p];
        document.getElementById(`skins-settle-p${p+1}-winnings`).textContent = formatCurrency(winnings[p]).replace('$', '');
    }
}
