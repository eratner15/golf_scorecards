/**
 * Game Implementation: STABLEFORD
 * 
 * Stableford is a scoring system where:
 * - Points are awarded on each hole relative to par
 * - Standard system: 0 points for double bogey or worse, 1 for bogey, 2 for par, 3 for birdie, 4 for eagle
 * - Modified system: -1 for double bogey, 0 for bogey, 1 for par, 2 for birdie, 3 for eagle
 * - The player with the most points at the end of the round wins
 */

/**
 * Generate Stableford scorecard rows
 */
function generateStablefordRows() {
    const tbody = document.getElementById('stableford-scorecard-body');
    if (!tbody || tbody.children.length > 0) return; // Already populated
    
    let html = '';
    
    for (let i = 1; i <= 18; i++) {
        html += `
            <tr id="stableford-row-h${i}">
                <td class="td-std font-medium">${i}</td>
                <td class="td-std"><input type="number" id="stableford-h${i}-par" min="3" max="6" class="input-std input-par" aria-label="Hole ${i} Par"></td>
                <td class="td-std"><input type="number" id="stableford-p1-h${i}-score" min="1" class="input-std input-score" aria-label="Player 1 Score Hole ${i}"></td>
                <td class="td-std"><input type="number" id="stableford-p2-h${i}-score" min="1" class="input-std input-score" aria-label="Player 2 Score Hole ${i}"></td>
                <td class="td-std"><input type="number" id="stableford-p3-h${i}-score" min="1" class="input-std input-score" aria-label="Player 3 Score Hole ${i}"></td>
                <td class="td-std"><input type="number" id="stableford-p4-h${i}-score" min="1" class="input-std input-score" aria-label="Player 4 Score Hole ${i}"></td>
                <td class="td-std p1-cell" id="stableford-h${i}-p1-pts"></td>
                <td class="td-std p2-cell" id="stableford-h${i}-p2-pts"></td>
                <td class="td-std p3-cell" id="stableford-h${i}-p3-pts"></td>
                <td class="td-std p4-cell" id="stableford-h${i}-p4-pts"></td>
            </tr>`;
        
        // Add summary rows
        if (i === 9) {
            html += `
                <tr class="bg-gray-100 font-semibold">
                    <td class="td-std">OUT</td>
                    <td class="td-std" id="stableford-out-par"></td>
                    <td class="td-std" id="stableford-p1-out-score"></td>
                    <td class="td-std" id="stableford-p2-out-score"></td>
                    <td class="td-std" id="stableford-p3-out-score"></td>
                    <td class="td-std" id="stableford-p4-out-score"></td>
                    <td class="td-std p1-cell" id="stableford-p1-out-pts"></td>
                    <td class="td-std p2-cell" id="stableford-p2-out-pts"></td>
                    <td class="td-std p3-cell" id="stableford-p3-out-pts"></td>
                    <td class="td-std p4-cell" id="stableford-p4-out-pts"></td>
                </tr>`;
        } else if (i === 18) {
            html += `
                <tr class="bg-gray-100 font-semibold">
                    <td class="td-std">IN</td>
                    <td class="td-std" id="stableford-in-par"></td>
                    <td class="td-std" id="stableford-p1-in-score"></td>
                    <td class="td-std" id="stableford-p2-in-score"></td>
                    <td class="td-std" id="stableford-p3-in-score"></td>
                    <td class="td-std" id="stableford-p4-in-score"></td>
                    <td class="td-std p1-cell" id="stableford-p1-in-pts"></td>
                    <td class="td-std p2-cell" id="stableford-p2-in-pts"></td>
                    <td class="td-std p3-cell" id="stableford-p3-in-pts"></td>
                    <td class="td-std p4-cell" id="stableford-p4-in-pts"></td>
                </tr>
                <tr class="bg-gray-200 font-bold">
                    <td class="td-std">TOTAL</td>
                    <td class="td-std" id="stableford-total-par"></td>
                    <td class="td-std" id="stableford-p1-total-score"></td>
                    <td class="td-std" id="stableford-p2-total-score"></td>
                    <td class="td-std" id="stableford-p3-total-score"></td>
                    <td class="td-std" id="stableford-p4-total-score"></td>
                    <td class="td-std p1-cell" id="stableford-p1-total-pts"></td>
                    <td class="td-std p2-cell" id="stableford-p2-total-pts"></td>
                    <td class="td-std p3-cell" id="stableford-p3-total-pts"></td>
                    <td class="td-std p4-cell" id="stableford-p4-total-pts"></td>
                </tr>`;
        }
    }
    
    if (tbody) tbody.innerHTML = html;
}

/**
 * Initialize Stableford: Add listeners for player name changes and point system selection
 */
function initializeStableford() {
    console.log("Initializing Stableford");
    
    // Update header names when players change
    const playerInputs = [];
    const playerHeaders = [];
    
    for (let i = 1; i <= 4; i++) {
        playerInputs.push(document.getElementById(`stableford-p${i}-name`));
        playerHeaders.push(document.getElementById(`stableford-th-p${i}`));
        playerHeaders.push(document.getElementById(`stableford-th-p${i}-pts`));
    }
    
    const updateHeaders = () => {
        for (let i = 0; i < 4; i++) {
            const playerName = playerInputs[i]?.value || `P${i+1}`;
            
            // Update both score and points column headers
            if (playerHeaders[i*2]) {
                playerHeaders[i*2].textContent = playerName;
            }
            
            if (playerHeaders[i*2+1]) {
                playerHeaders[i*2+1].textContent = `${playerName} Pts`;
            }
        }
        
        // Update settlement display names
        updateStablefordSettlement();
    };
    
    playerInputs.forEach(input => {
        if (input) input.addEventListener('input', updateHeaders);
    });
    
    // Add listeners for point system and value changes
    document.getElementById('stableford-point-system')?.addEventListener('change', updateStableford);
    document.getElementById('stableford-point-value')?.addEventListener('input', updateStableford);
    
    // Generate rows if needed
    generateStablefordRows();
}

/**
 * Reset Stableford Display: Clear calculated values in the UI
 */
function resetStablefordDisplay() {
    console.log("Reset Stableford Display");
    
    // Reset point cells
    for (let i = 1; i <= 18; i++) {
        for (let p = 1; p <= 4; p++) {
            document.getElementById(`stableford-h${i}-p${p}-pts`)?.textContent = '';
        }
    }
    
    // Reset summary fields
    document.getElementById('stableford-out-par')?.textContent = '';
    document.getElementById('stableford-in-par')?.textContent = '';
    document.getElementById('stableford-total-par')?.textContent = '';
    
    for (let p = 1; p <= 4; p++) {
        document.getElementById(`stableford-p${p}-out-score`)?.textContent = '';
        document.getElementById(`stableford-p${p}-in-score`)?.textContent = '';
        document.getElementById(`stableford-p${p}-total-score`)?.textContent = '';
        document.getElementById(`stableford-p${p}-out-pts`)?.textContent = '';
        document.getElementById(`stableford-p${p}-in-pts`)?.textContent = '';
        document.getElementById(`stableford-p${p}-total-pts`)?.textContent = '';
    }
    
    // Reset headers
    for (let p = 1; p <= 4; p++) {
        document.getElementById(`stableford-th-p${p}`)?.textContent = `P${p}`;
        document.getElementById(`stableford-th-p${p}-pts`)?.textContent = `P${p} Pts`;
    }
    
    // Reset settlement area
    for (let p = 1; p <= 4; p++) {
        document.getElementById(`stableford-settle-p${p}-name`)?.textContent = `Player ${p}:`;
        document.getElementById(`stableford-settle-p${p}-points`)?.textContent = '0';
        document.getElementById(`stableford-settle-p${p}-winnings`)?.textContent = '0.00';
    }
    document.getElementById('stableford-settlement-summary-text')?.textContent = '';
}

/**
 * Populate Stableford inputs from state
 */
function populateStableford() {
    console.log("Populate Stableford");
    if (!currentRoundState || currentRoundState.gameType !== 'stableford') return;
    
    // Player names
    for (let i = 0; i < 4; i++) {
        document.getElementById(`stableford-p${i+1}-name`).value = currentRoundState.players[i] || '';
        
        // Update headers with player names
        const playerName = currentRoundState.players[i] || `P${i+1}`;
        document.getElementById(`stableford-th-p${i+1}`).textContent = playerName;
        document.getElementById(`stableford-th-p${i+1}-pts`).textContent = `${playerName} Pts`;
    }
    
    // Options
    document.getElementById('stableford-point-system').value = currentRoundState.pointSystem || 'standard';
    document.getElementById('stableford-point-value').value = currentRoundState.pointValue ?? 1;
    
    // Par and scores
    for (let i = 0; i < 18; i++) {
        const hole = i + 1;
        const parInput = document.getElementById(`stableford-h${hole}-par`);
        if (parInput) parInput.value = currentRoundState.par[i] || '';
        
        for (let p = 1; p <= 4; p++) {
            const scoreInput = document.getElementById(`stableford-p${p}-h${hole}-score`);
            if (scoreInput) {
                const score = currentRoundState.scores[`p${p}`][i];
                scoreInput.value = score !== null ? score : '';
            }
        }
    }
    
    // Results will be populated by updateStableford
}

/**
 * Update Stableford: Calculate points for each player and update settlement
 */
function updateStableford() {
    console.log("Update Stableford");
    if (!currentRoundState || currentRoundState.gameType !== 'stableford') return;
    
    // --- 1. Read inputs into state ---
    currentRoundState.players = [];
    for (let i = 1; i <= 4; i++) {
        currentRoundState.players.push(document.getElementById(`stableford-p${i}-name`)?.value || '');
    }
    
    currentRoundState.pointSystem = document.getElementById('stableford-point-system')?.value || 'standard';
    currentRoundState.pointValue = parseFloat(document.getElementById('stableford-point-value')?.value) || 1;
    
    // Read par and scores
    const par = [];
    const scores = { p1: [], p2: [], p3: [], p4: [] };
    
    for (let i = 1; i <= 18; i++) {
        const parVal = document.getElementById(`stableford-h${i}-par`)?.value;
        par.push(parVal === '' ? null : parseInt(parVal));
        
        for (let p = 1; p <= 4; p++) {
            const scoreVal = document.getElementById(`stableford-p${p}-h${i}-score`)?.value;
            scores[`p${p}`].push(scoreVal === '' ? null : parseInt(scoreVal));
        }
    }
    
    currentRoundState.par = par;
    currentRoundState.scores = scores;
    
    // --- 2. Calculate Stableford points ---
    // For each player and hole, calculate points based on the selected system
    const points = {
        p1: [],
        p2: [],
        p3: [],
        p4: []
    };
    
    for (let i = 0; i < 18; i++) {
        const holePar = par[i];
        if (holePar === null) continue;
        
        for (let p = 1; p <= 4; p++) {
            const score = scores[`p${p}`][i];
            if (score === null) {
                points[`p${p}`].push(null);
                continue;
            }
            
            const diff = score - holePar;
            let pointValue;
            
            if (currentRoundState.pointSystem === 'standard') {
                // Standard system: 0 for double bogey or worse, 1 for bogey, 2 for par, 3 for birdie, 4 for eagle
                if (diff >= 2) pointValue = 0;
                else if (diff === 1) pointValue = 1;
                else if (diff === 0) pointValue = 2;
                else if (diff === -1) pointValue = 3;
                else pointValue = 4; // Eagle or better
            } else {
                // Modified system: -1 for double bogey, 0 for bogey, 1 for par, 2 for birdie, 3 for eagle
                if (diff >= 2) pointValue = -1;
                else if (diff === 1) pointValue = 0;
                else if (diff === 0) pointValue = 1;
                else if (diff === -1) pointValue = 2;
                else pointValue = 3; // Eagle or better
            }
            
            points[`p${p}`].push(pointValue);
        }
    }
    
    // --- 3. Update UI with points ---
    for (let i = 0; i < 18; i++) {
        for (let p = 1; p <= 4; p++) {
            const pointCell = document.getElementById(`stableford-h${i+1}-p${p}-pts`);
            if (pointCell) {
                const pointValue = points[`p${p}`][i];
                pointCell.textContent = pointValue !== null ? pointValue : '';
            }
        }
    }
    
    // --- 4. Calculate and display summaries ---
    // Calculate par totals
    const outPar = par.slice(0, 9).reduce((sum, p) => sum + (p || 0), 0);
    const inPar = par.slice(9).reduce((sum, p) => sum + (p || 0), 0);
    const totalPar = outPar + inPar;
    
    document.getElementById('stableford-out-par').textContent = outPar;
    document.getElementById('stableford-in-par').textContent = inPar;
    document.getElementById('stableford-total-par').textContent = totalPar;
    
    // Calculate score and point totals for each player
    for (let p = 1; p <= 4; p++) {
        const playerScores = scores[`p${p}`];
        const playerPoints = points[`p${p}`];
        
        // Front nine
        const outScore = playerScores.slice(0, 9).reduce((sum, s) => sum + (s || 0), 0);
        const outPoints = playerPoints.slice(0, 9).reduce((sum, pts) => sum + (pts || 0), 0);
        
        // Back nine
        const inScore = playerScores.slice(9).reduce((sum, s) => sum + (s || 0), 0);
        const inPoints = playerPoints.slice(9).reduce((sum, pts) => sum + (pts || 0), 0);
        
        // Totals
        const totalScore = outScore + inScore;
        const totalPoints = outPoints + inPoints;
        
        // Update UI
        document.getElementById(`stableford-p${p}-out-score`).textContent = outScore;
        document.getElementById(`stableford-p${p}-in-score`).textContent = inScore;
        document.getElementById(`stableford-p${p}-total-score`).textContent = totalScore;
        
        document.getElementById(`stableford-p${p}-out-pts`).textContent = outPoints;
        document.getElementById(`stableford-p${p}-in-pts`).textContent = inPoints;
        document.getElementById(`stableford-p${p}-total-pts`).textContent = totalPoints;
    }
    
    // --- 5. Update settlement ---
    updateStablefordSettlement();
}

/**
 * Update Stableford Settlement: Calculate and display winnings
 */
function updateStablefordSettlement() {
    console.log("Update Stableford Settlement");
    if (!currentRoundState || currentRoundState.gameType !== 'stableford') return;
    
    // Get total points for each player
    const playerPoints = [];
    for (let p = 1; p <= 4; p++) {
        const totalPoints = document.getElementById(`stableford-p${p}-total-pts`)?.textContent;
        playerPoints.push(totalPoints ? parseInt(totalPoints) : 0);
    }
    
    // Calculate winnings
    const pointValue = currentRoundState.pointValue || 1;
    const winnings = playerPoints.map(points => points * pointValue);
    
    // Update settlement display
    for (let p = 1; p <= 4; p++) {
        const playerName = currentRoundState.players[p-1] || `Player ${p}`;
        document.getElementById(`stableford-settle-p${p}-name`).textContent = `${playerName}:`;
        document.getElementById(`stableford-settle-p${p}-points`).textContent = playerPoints[p-1];
        document.getElementById(`stableford-settle-p${p}-winnings`).textContent = winnings[p-1].toFixed(2);
    }
    
    // Update summary text
    const summaryText = document.getElementById('stableford-settlement-summary-text');
    if (summaryText) {
        const maxPoints = Math.max(...playerPoints);
        const winners = playerPoints
            .map((points, index) => ({ points, name: currentRoundState.players[index] || `Player ${index + 1}` }))
            .filter(player => player.points === maxPoints)
            .map(player => player.name);
        
        if (winners.length === 1) {
            summaryText.textContent = `${winners[0]} wins with ${maxPoints} points!`;
        } else {
            summaryText.textContent = `${winners.join(' and ')} tie for the win with ${maxPoints} points each!`;
        }
    }
}

// Export functions for use in other files
export {
    generateStablefordRows,
    initializeStableford,
    resetStablefordDisplay,
    populateStableford,
    updateStableford,
    updateStablefordSettlement
}; 