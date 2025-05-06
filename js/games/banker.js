/**
 * Game Implementation: BANKER (QUOTA)
 * 
 * Banker/Quota is a golf game where:
 * - Each player has a quota (target number of points) based on their handicap
 * - Players earn points using a Stableford-like scoring system
 * - At the end, players compare their points to their quota
 * - Players who beat their quota win money, those who don't pay
 */

/**
 * Generate Banker scorecard rows
 */
function generateBankerRows() {
    const tbody = document.getElementById('banker-scorecard-body');
    if (!tbody || tbody.children.length > 0) return; // Already populated
    
    let html = '';
    
    for (let i = 1; i <= 18; i++) {
        html += `
            <tr id="banker-row-h${i}">
                <td class="td-std font-medium">${i}</td>
                <td class="td-std"><input type="number" id="banker-h${i}-par" min="3" max="6" class="input-std input-par" aria-label="Hole ${i} Par"></td>
                <td class="td-std"><input type="number" id="banker-p1-h${i}-score" min="1" class="input-std input-score" aria-label="Player 1 Score Hole ${i}"></td>
                <td class="td-std"><input type="number" id="banker-p2-h${i}-score" min="1" class="input-std input-score" aria-label="Player 2 Score Hole ${i}"></td>
                <td class="td-std"><input type="number" id="banker-p3-h${i}-score" min="1" class="input-std input-score" aria-label="Player 3 Score Hole ${i}"></td>
                <td class="td-std"><input type="number" id="banker-p4-h${i}-score" min="1" class="input-std input-score" aria-label="Player 4 Score Hole ${i}"></td>
                <td class="td-std p1-cell" id="banker-h${i}-p1-pts"></td>
                <td class="td-std p2-cell" id="banker-h${i}-p2-pts"></td>
                <td class="td-std p3-cell" id="banker-h${i}-p3-pts"></td>
                <td class="td-std p4-cell" id="banker-h${i}-p4-pts"></td>
            </tr>`;
        
        // Add summary rows
        if (i === 9) {
            html += `
                <tr class="bg-gray-100 font-semibold">
                    <td class="td-std">OUT</td>
                    <td class="td-std" id="banker-out-par"></td>
                    <td class="td-std" id="banker-p1-out-score"></td>
                    <td class="td-std" id="banker-p2-out-score"></td>
                    <td class="td-std" id="banker-p3-out-score"></td>
                    <td class="td-std" id="banker-p4-out-score"></td>
                    <td class="td-std p1-cell" id="banker-p1-out-pts"></td>
                    <td class="td-std p2-cell" id="banker-p2-out-pts"></td>
                    <td class="td-std p3-cell" id="banker-p3-out-pts"></td>
                    <td class="td-std p4-cell" id="banker-p4-out-pts"></td>
                </tr>`;
        } else if (i === 18) {
            html += `
                <tr class="bg-gray-100 font-semibold">
                    <td class="td-std">IN</td>
                    <td class="td-std" id="banker-in-par"></td>
                    <td class="td-std" id="banker-p1-in-score"></td>
                    <td class="td-std" id="banker-p2-in-score"></td>
                    <td class="td-std" id="banker-p3-in-score"></td>
                    <td class="td-std" id="banker-p4-in-score"></td>
                    <td class="td-std p1-cell" id="banker-p1-in-pts"></td>
                    <td class="td-std p2-cell" id="banker-p2-in-pts"></td>
                    <td class="td-std p3-cell" id="banker-p3-in-pts"></td>
                    <td class="td-std p4-cell" id="banker-p4-in-pts"></td>
                </tr>
                <tr class="bg-gray-200 font-bold">
                    <td class="td-std">TOTAL</td>
                    <td class="td-std" id="banker-total-par"></td>
                    <td class="td-std" id="banker-p1-total-score"></td>
                    <td class="td-std" id="banker-p2-total-score"></td>
                    <td class="td-std" id="banker-p3-total-score"></td>
                    <td class="td-std" id="banker-p4-total-score"></td>
                    <td class="td-std p1-cell" id="banker-p1-total-pts"></td>
                    <td class="td-std p2-cell" id="banker-p2-total-pts"></td>
                    <td class="td-std p3-cell" id="banker-p3-total-pts"></td>
                    <td class="td-std p4-cell" id="banker-p4-total-pts"></td>
                </tr>`;
        }
    }
    
    if (tbody) tbody.innerHTML = html;
}

/**
 * Initialize Banker: Add listeners for player name changes and quota inputs
 */
function initializeBanker() {
    console.log("Initializing Banker/Quota");
    
    // Update header names when players change
    const playerInputs = [];
    const playerHeaders = [];
    const quotaInputs = [];
    
    for (let i = 1; i <= 4; i++) {
        playerInputs.push(document.getElementById(`banker-p${i}-name`));
        playerHeaders.push(document.getElementById(`banker-th-p${i}`));
        playerHeaders.push(document.getElementById(`banker-th-p${i}-pts`));
        quotaInputs.push(document.getElementById(`banker-p${i}-quota`));
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
        updateBankerSettlement();
    };
    
    playerInputs.forEach(input => {
        if (input) input.addEventListener('input', updateHeaders);
    });
    
    // Add listeners for point system, quota, and value changes
    document.getElementById('banker-point-system')?.addEventListener('change', updateBanker);
    document.getElementById('banker-point-value')?.addEventListener('input', updateBanker);
    
    quotaInputs.forEach(input => {
        if (input) input.addEventListener('input', updateBanker);
    });
    
    // Generate rows if needed
    generateBankerRows();
}

/**
 * Reset Banker Display: Clear calculated values in the UI
 */
function resetBankerDisplay() {
    console.log("Reset Banker Display");
    
    // Reset point cells
    for (let i = 1; i <= 18; i++) {
        for (let p = 1; p <= 4; p++) {
            document.getElementById(`banker-h${i}-p${p}-pts`)?.textContent = '';
        }
    }
    
    // Reset summary fields
    document.getElementById('banker-out-par')?.textContent = '';
    document.getElementById('banker-in-par')?.textContent = '';
    document.getElementById('banker-total-par')?.textContent = '';
    
    for (let p = 1; p <= 4; p++) {
        document.getElementById(`banker-p${p}-out-score`)?.textContent = '';
        document.getElementById(`banker-p${p}-in-score`)?.textContent = '';
        document.getElementById(`banker-p${p}-total-score`)?.textContent = '';
        document.getElementById(`banker-p${p}-out-pts`)?.textContent = '';
        document.getElementById(`banker-p${p}-in-pts`)?.textContent = '';
        document.getElementById(`banker-p${p}-total-pts`)?.textContent = '';
    }
    
    // Reset headers
    for (let p = 1; p <= 4; p++) {
        document.getElementById(`banker-th-p${p}`)?.textContent = `P${p}`;
        document.getElementById(`banker-th-p${p}-pts`)?.textContent = `P${p} Pts`;
    }
    
    // Reset settlement area
    for (let p = 1; p <= 4; p++) {
        document.getElementById(`banker-settle-p${p}-name`)?.textContent = `Player ${p}:`;
        document.getElementById(`banker-settle-p${p}-quota`)?.textContent = '36';
        document.getElementById(`banker-settle-p${p}-points`)?.textContent = '0';
        document.getElementById(`banker-settle-p${p}-vs-quota`)?.textContent = '+0';
        document.getElementById(`banker-settle-p${p}-winnings`)?.textContent = '0.00';
    }
    document.getElementById('banker-settlement-summary-text')?.textContent = '';
}

/**
 * Populate Banker inputs from state
 */
function populateBanker() {
    console.log("Populate Banker");
    if (!currentRoundState || currentRoundState.gameType !== 'banker') return;
    
    // Player names and quotas
    for (let i = 0; i < 4; i++) {
        document.getElementById(`banker-p${i+1}-name`).value = currentRoundState.players[i] || '';
        document.getElementById(`banker-p${i+1}-quota`).value = currentRoundState.quotas[i] || 36;
        
        // Update headers with player names
        const playerName = currentRoundState.players[i] || `P${i+1}`;
        document.getElementById(`banker-th-p${i+1}`).textContent = playerName;
        document.getElementById(`banker-th-p${i+1}-pts`).textContent = `${playerName} Pts`;
    }
    
    // Options
    document.getElementById('banker-point-system').value = currentRoundState.pointSystem || 'stableford-standard';
    document.getElementById('banker-point-value').value = currentRoundState.pointValue ?? 1;
    
    // Par and scores
    for (let i = 0; i < 18; i++) {
        const hole = i + 1;
        const parInput = document.getElementById(`banker-h${hole}-par`);
        if (parInput) parInput.value = currentRoundState.par[i] || '';
        
        for (let p = 1; p <= 4; p++) {
            const scoreInput = document.getElementById(`banker-p${p}-h${hole}-score`);
            if (scoreInput) {
                const score = currentRoundState.scores[`p${p}`][i];
                scoreInput.value = score !== null ? score : '';
            }
        }
    }
    
    // Results will be populated by updateBanker
}

/**
 * Update Banker: Calculate points vs quota for each player and update settlement
 */
function updateBanker() {
    console.log("Update Banker");
    if (!currentRoundState || currentRoundState.gameType !== 'banker') return;
    
    // --- 1. Read inputs into state ---
    // Players and quotas
    currentRoundState.players = [];
    currentRoundState.quotas = [];
    
    for (let i = 1; i <= 4; i++) {
        currentRoundState.players.push(document.getElementById(`banker-p${i}-name`)?.value || '');
        const quotaVal = document.getElementById(`banker-p${i}-quota`)?.value;
        currentRoundState.quotas.push(quotaVal === '' ? 36 : parseInt(quotaVal));
    }
    
    // Point system and value
    const pointSystemVal = document.getElementById('banker-point-system')?.value || 'stableford-standard';
    currentRoundState.pointSystem = pointSystemVal;
    currentRoundState.pointValue = parseFloat(document.getElementById('banker-point-value')?.value) || 1;
    
    // Parse the point system type
    let system = 'standard';
    if (pointSystemVal === 'stableford-modified') {
        system = 'modified';
    }
    
    // Read par and scores
    const par = [];
    const scores = { p1: [], p2: [], p3: [], p4: [] };
    
    for (let i = 1; i <= 18; i++) {
        const parVal = document.getElementById(`banker-h${i}-par`)?.value;
        par.push(parVal === '' ? null : parseInt(parVal));
        
        for (let p = 1; p <= 4; p++) {
            const scoreVal = document.getElementById(`banker-p${p}-h${i}-score`)?.value;
            scores[`p${p}`].push(scoreVal === '' ? null : parseInt(scoreVal));
        }
    }
    
    currentRoundState.par = par;
    currentRoundState.scores = scores;
    
    // --- 2. Calculate points ---
    // For each player and hole, calculate points based on the selected system
    const points = {
        p1: [],
        p2: [],
        p3: [],
        p4: []
    };
    
    for (let i = 0; i < 18; i++) {
        const holePar = par[i];
        
        for (let p = 1; p <= 4; p++) {
            const score = scores[`p${p}`][i];
            let holePoints = null;
            
            // Calculate points if we have both par and score
            if (holePar !== null && score !== null) {
                holePoints = calculateStablefordPoints(score, holePar, system);
            }
            
            points[`p${p}`].push(holePoints);
        }
    }
    
    // Store results in state
    currentRoundState.points = points;
    
    // --- 3. Update UI ---
    // Update hole-by-hole points
    for (let i = 0; i < 18; i++) {
        const hole = i + 1;
        
        for (let p = 1; p <= 4; p++) {
            const pointsCell = document.getElementById(`banker-h${hole}-p${p}-pts`);
            const pointsValue = points[`p${p}`][i];
            
            if (pointsCell) {
                if (pointsValue !== null) {
                    pointsCell.textContent = pointsValue;
                    pointsCell.className = `td-std ${pointsValue > 0 ? 'high-points' : ''}`;
                } else {
                    pointsCell.textContent = '';
                    pointsCell.className = 'td-std';
                }
            }
        }
    }
    
    // Calculate and display summary statistics
    let frontPar = 0, backPar = 0, totalPar = 0;
    const frontScores = [0, 0, 0, 0];
    const backScores = [0, 0, 0, 0];
    const totalScores = [0, 0, 0, 0];
    const frontPoints = [0, 0, 0, 0];
    const backPoints = [0, 0, 0, 0];
    const totalPoints = [0, 0, 0, 0];
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
            const pKey = `p${p+1}`;
            const score = scores[pKey][i];
            const pointsValue = points[pKey][i];
            
            if (score !== null) {
                if (holeNum <= 9) frontScores[p] += score;
                else backScores[p] += score;
                totalScores[p] += score;
            } else {
                if (holeNum <= 9) frontValid[p] = false;
                else backValid[p] = false;
            }
            
            if (pointsValue !== null) {
                if (holeNum <= 9) frontPoints[p] += pointsValue;
                else backPoints[p] += pointsValue;
                totalPoints[p] += pointsValue;
            }
        }
    }
    
    // Update summary row cells
    document.getElementById('banker-out-par').textContent = frontPar || '';
    document.getElementById('banker-in-par').textContent = backPar || '';
    document.getElementById('banker-total-par').textContent = totalPar || '';
    
    for (let p = 0; p < 4; p++) {
        document.getElementById(`banker-p${p+1}-out-score`).textContent = frontValid[p] ? frontScores[p] : '';
        document.getElementById(`banker-p${p+1}-in-score`).textContent = backValid[p] ? backScores[p] : '';
        document.getElementById(`banker-p${p+1}-total-score`).textContent = (frontValid[p] || backValid[p]) ? totalScores[p] : '';
        
        // Points summary
        document.getElementById(`banker-p${p+1}-out-pts`).textContent = frontPoints[p] || '';
        document.getElementById(`banker-p${p+1}-in-pts`).textContent = backPoints[p] || '';
        document.getElementById(`banker-p${p+1}-total-pts`).textContent = totalPoints[p] || '';
    }
    
    // Update settlement
    updateBankerSettlement(totalPoints);
}

/**
 * Update Banker settlement information
 * @param {Array} totalPoints - Array of total points for each player
 */
function updateBankerSettlement(totalPoints = null) {
    if (!currentRoundState || currentRoundState.gameType !== 'banker') return;
    
    // Use provided points or get from state
    const points = totalPoints || [0, 0, 0, 0].map((_, i) => {
        const playerPoints = currentRoundState.points?.[`p${i+1}`] || [];
        return playerPoints.reduce((sum, p) => sum + (p || 0), 0);
    });
    
    // Compare each player's points to their quota
    const quotas = currentRoundState.quotas || [36, 36, 36, 36];
    const vsQuota = points.map((p, i) => p - quotas[i]);
    
    // Calculate winnings based on point value and vs quota
    const pointValue = currentRoundState.pointValue || 1;
    const winnings = vsQuota.map(vq => vq * pointValue);
    
    // Create settlement summary
    const settlement = {
        totalPoints: points,
        vsQuota: vsQuota,
        winnings: winnings,
        summaryText: ''
    };
    
    // Generate summary text
    const summaryLines = [];
    for (let p = 0; p < 4; p++) {
        if (winnings[p] !== 0) {
            const playerName = currentRoundState.players[p] || `Player ${p+1}`;
            if (winnings[p] > 0) {
                summaryLines.push(`${playerName} collects ${formatCurrency(winnings[p])}`);
            } else {
                summaryLines.push(`${playerName} pays ${formatCurrency(Math.abs(winnings[p]))}`);
            }
        }
    }
    
    if (summaryLines.length > 0) {
        settlement.summaryText = summaryLines.join(', ');
    } else {
        settlement.summaryText = 'No points awarded yet';
    }
    
    currentRoundState.settlement = settlement;
    
    // Update UI
    for (let p = 0; p < 4; p++) {
        const vsQuotaCell = document.getElementById(`banker-settle-p${p+1}-vs-quota`);
        
        document.getElementById(`banker-settle-p${p+1}-name`).textContent = `${currentRoundState.players[p] || `Player ${p+1}`}:`;
        document.getElementById(`banker-settle-p${p+1}-quota`).textContent = quotas[p] || '36';
        document.getElementById(`banker-settle-p${p+1}-points`).textContent = points[p] || '0';
        
        if (vsQuotaCell) {
            const vq = vsQuota[p] || 0;
            vsQuotaCell.textContent = vq > 0 ? `+${vq}` : vq;
            vsQuotaCell.className = `${vq > 0 ? 'above-quota' : (vq < 0 ? 'below-quota' : '')}`;
        }
        
        document.getElementById(`banker-settle-p${p+1}-winnings`).textContent = formatCurrency(winnings[p] || 0).replace('$', '');
    }
    
    document.getElementById('banker-settlement-summary-text').textContent = settlement.summaryText;
}