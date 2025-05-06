/**
 * Game Implementation: WOLF
 */

/**
 * Generate Wolf scorecard rows
 */
function generateWolfRows() {
    const tbody = document.getElementById('wolf-scorecard-body');
    if (!tbody || tbody.children.length > 0) return; // Already populated
    
    let html = '';
    
    for (let i = 1; i <= 18; i++) {
        // Determine wolf player for this hole (1-based index)
        const wolfPlayerIndex = ((i - 1) % 4) + 1;
        
        html += `
            <tr id="wolf-row-h${i}">
                <td class="td-std font-medium">${i}</td>
                <td class="td-std wolf-player" id="wolf-h${i}-wolf-player">P${wolfPlayerIndex}</td>
                <td class="td-std">
                    <select id="wolf-h${i}-selection" class="input-std" aria-label="Wolf Selection Hole ${i}">
                        <option value=""></option>
                        <option value="alone">Alone</option>
                        <option value="p1">Player 1</option>
                        <option value="p2">Player 2</option>
                        <option value="p3">Player 3</option>
                        <option value="p4">Player 4</option>
                    </select>
                </td>
                <td class="td-std"><input type="number" id="wolf-p1-h${i}-score" min="1" class="input-std input-score" aria-label="Player 1 Score Hole ${i}"></td>
                <td class="td-std"><input type="number" id="wolf-p2-h${i}-score" min="1" class="input-std input-score" aria-label="Player 2 Score Hole ${i}"></td>
                <td class="td-std"><input type="number" id="wolf-p3-h${i}-score" min="1" class="input-std input-score" aria-label="Player 3 Score Hole ${i}"></td>
                <td class="td-std"><input type="number" id="wolf-p4-h${i}-score" min="1" class="input-std input-score" aria-label="Player 4 Score Hole ${i}"></td>
                <td class="td-std p1-cell" id="wolf-h${i}-p1-pts"></td>
                <td class="td-std p2-cell" id="wolf-h${i}-p2-pts"></td>
                <td class="td-std p3-cell" id="wolf-h${i}-p3-pts"></td>
                <td class="td-std p4-cell" id="wolf-h${i}-p4-pts"></td>
            </tr>`;
        
        // Add summary rows
        if (i === 9) {
            html += `
                <tr class="bg-gray-100 font-semibold">
                    <td class="td-std" colspan="3">OUT</td>
                    <td class="td-std" id="wolf-p1-out-score"></td>
                    <td class="td-std" id="wolf-p2-out-score"></td>
                    <td class="td-std" id="wolf-p3-out-score"></td>
                    <td class="td-std" id="wolf-p4-out-score"></td>
                    <td class="td-std p1-cell" id="wolf-p1-out-pts"></td>
                    <td class="td-std p2-cell" id="wolf-p2-out-pts"></td>
                    <td class="td-std p3-cell" id="wolf-p3-out-pts"></td>
                    <td class="td-std p4-cell" id="wolf-p4-out-pts"></td>
                </tr>`;
        } else if (i === 18) {
            html += `
                <tr class="bg-gray-100 font-semibold">
                    <td class="td-std" colspan="3">IN</td>
                    <td class="td-std" id="wolf-p1-in-score"></td>
                    <td class="td-std" id="wolf-p2-in-score"></td>
                    <td class="td-std" id="wolf-p3-in-score"></td>
                    <td class="td-std" id="wolf-p4-in-score"></td>
                    <td class="td-std p1-cell" id="wolf-p1-in-pts"></td>
                    <td class="td-std p2-cell" id="wolf-p2-in-pts"></td>
                    <td class="td-std p3-cell" id="wolf-p3-in-pts"></td>
                    <td class="td-std p4-cell" id="wolf-p4-in-pts"></td>
                </tr>
                <tr class="bg-gray-200 font-bold">
                    <td class="td-std" colspan="3">TOTAL</td>
                    <td class="td-std" id="wolf-p1-total-score"></td>
                    <td class="td-std" id="wolf-p2-total-score"></td>
                    <td class="td-std" id="wolf-p3-total-score"></td>
                    <td class="td-std" id="wolf-p4-total-score"></td>
                    <td class="td-std p1-cell" id="wolf-p1-total-pts"></td>
                    <td class="td-std p2-cell" id="wolf-p2-total-pts"></td>
                    <td class="td-std p3-cell" id="wolf-p3-total-pts"></td>
                    <td class="td-std p4-cell" id="wolf-p4-total-pts"></td>
                </tr>`;
        }
    }
    
    if (tbody) tbody.innerHTML = html;
}

/**
 * Initialize Wolf: Add listeners for player name changes and event handlers
 */
function initializeWolf() {
    console.log("Initializing Wolf");
    
    // Update header names and wolf selection dropdowns when players change
    const playerInputs = [];
    const playerHeaders = [];
    
    for (let i = 1; i <= 4; i++) {
        playerInputs.push(document.getElementById(`wolf-p${i}-name`));
        playerHeaders.push(document.getElementById(`wolf-th-p${i}`));
    }
    
    const updateNames = () => {
        // Update column headers
        for (let i = 0; i < 4; i++) {
            const playerName = playerInputs[i]?.value || `P${i+1}`;
            if (playerHeaders[i]) {
                playerHeaders[i].textContent = playerName;
            }
        }
        
        // Update wolf player names in each row
        for (let hole = 1; hole <= 18; hole++) {
            const wolfPlayerIndex = ((hole - 1) % 4);
            const wolfCell = document.getElementById(`wolf-h${hole}-wolf-player`);
            if (wolfCell) {
                const wolfName = playerInputs[wolfPlayerIndex]?.value || `P${wolfPlayerIndex+1}`;
                wolfCell.textContent = wolfName;
            }
            
            // Update selection dropdown options
            const selectionDropdown = document.getElementById(`wolf-h${hole}-selection`);
            if (selectionDropdown) {
                const options = selectionDropdown.options;
                
                // Skip first option (empty or "Choose...")
                for (let i = 0; i < 4; i++) {
                    const playerName = playerInputs[i]?.value || `Player ${i+1}`;
                    const optIndex = i + 2; // +2 because first is empty, second is "Alone"
                    
                    if (options[optIndex]) {
                        options[optIndex].text = playerName;
                    }
                }
            }
        }
        
        // Update settlement display names
        updateWolfSettlement();
    };
    
    playerInputs.forEach(input => {
        if (input) input.addEventListener('input', updateNames);
    });
    
    // Add listeners for point value and multiplier
    document.getElementById('wolf-point-value')?.addEventListener('input', updateWolf);
    document.getElementById('wolf-lone-multiplier')?.addEventListener('input', updateWolf);
    
    // Generate rows if needed
    generateWolfRows();
    
    // Add event handlers to selection dropdowns (after generation)
    for (let i = 1; i <= 18; i++) {
        document.getElementById(`wolf-h${i}-selection`)?.addEventListener('change', function() {
            // Disable selecting the wolf player as partner
            const wolfPlayerIndex = ((i - 1) % 4) + 1;
            const selectedValue = this.value;
            
            if (selectedValue === `p${wolfPlayerIndex}`) {
                showAlert("Wolf player cannot select themselves as a partner", "warning");
                this.value = ""; // Reset selection
                return;
            }
            
            updateWolf();
        });
    }
}

/**
 * Reset Wolf Display: Clear calculated values in the UI
 */
export function resetWolfDisplay() {
    console.log("Reset Wolf Display");
    
    // Reset wolf player names
    for (let i = 1; i <= 18; i++) {
        const wolfPlayerIndex = ((i - 1) % 4) + 1;
        document.getElementById(`wolf-h${i}-wolf-player`).textContent = `P${wolfPlayerIndex}`;
        document.getElementById(`wolf-h${i}-selection`).value = '';
        
        // Reset point cells
        for (let p = 1; p <= 4; p++) {
            document.getElementById(`wolf-h${i}-p${p}-pts`)?.textContent = '';
        }
    }
    
    // Reset summary fields
    for (let p = 1; p <= 4; p++) {
        document.getElementById(`wolf-p${p}-out-score`)?.textContent = '';
        document.getElementById(`wolf-p${p}-in-score`)?.textContent = '';
        document.getElementById(`wolf-p${p}-total-score`)?.textContent = '';
        document.getElementById(`wolf-p${p}-out-pts`)?.textContent = '';
        document.getElementById(`wolf-p${p}-in-pts`)?.textContent = '';
        document.getElementById(`wolf-p${p}-total-pts`)?.textContent = '';
    }
    
    // Reset headers
    for (let p = 1; p <= 4; p++) {
        document.getElementById(`wolf-th-p${p}`)?.textContent = `P${p}`;
    }
    
    // Reset settlement area
    for (let p = 1; p <= 4; p++) {
        document.getElementById(`wolf-settle-p${p}-name`)?.textContent = `Player ${p}:`;
        document.getElementById(`wolf-settle-p${p}-points`)?.textContent = '0';
        document.getElementById(`wolf-settle-p${p}-winnings`)?.textContent = '0.00';
    }
    document.getElementById('wolf-settlement-summary-text')?.textContent = '';
}

/**
 * Update Wolf: Calculate points for each player on each hole and update settlement
 */
export function updateWolf() {
    console.log("Update Wolf");
    if (!currentRoundState || currentRoundState.gameType !== 'wolf') return;
    
    // --- 1. Read inputs into state ---
    currentRoundState.players = [];
    for (let i = 1; i <= 4; i++) {
        currentRoundState.players.push(document.getElementById(`wolf-p${i}-name`)?.value || '');
    }
    
    currentRoundState.pointValue = parseFloat(document.getElementById('wolf-point-value')?.value) || 1;
    currentRoundState.loneMultiplier = parseFloat(document.getElementById('wolf-lone-multiplier')?.value) || 3;
    
    // Read selection and scores
    const selections = [];
    const scores = { p1: [], p2: [], p3: [], p4: [] };
    
    for (let i = 1; i <= 18; i++) {
        // Selection
        const selectionVal = document.getElementById(`wolf-h${i}-selection`)?.value;
        selections.push(selectionVal || '');
        
        // Scores
        for (let p = 1; p <= 4; p++) {
            const scoreVal = document.getElementById(`wolf-p${p}-h${i}-score`)?.value;
            scores[`p${p}`].push(scoreVal === '' ? null : parseInt(scoreVal));
        }
    }
    
    currentRoundState.selections = selections;
    currentRoundState.scores = scores;
    
    // --- 2. Calculate points for each hole ---
    const points = Array(18).fill(null).map(() => [0, 0, 0, 0]);
    
    for (let i = 0; i < 18; i++) {
        const wolfPlayerIndex = (i % 4); // 0-based index
        const selection = selections[i];
        
        // Skip holes without selection or scores
        if (!selection) continue;
        
        const holeScores = [
            scores.p1[i],
            scores.p2[i],
            scores.p3[i],
            scores.p4[i]
        ];
        
        // Skip holes with incomplete scores
        if (holeScores.some(s => s === null)) continue;
        
        // Find lowest score
        const lowestScore = Math.min(...holeScores);
        
        // Handle 'alone' selection (wolf plays alone)
        if (selection === 'alone') {
            const wolfScore = holeScores[wolfPlayerIndex];
            
            // Wolf wins if they have the lowest score (tied or outright)
            if (wolfScore === lowestScore) {
                // Wolf wins points from all other players
                const multiplier = currentRoundState.loneMultiplier || 3;
                points[i][wolfPlayerIndex] = multiplier; // Lone wolf gets 3x points by default
                
                // Other players lose 1 point each
                for (let p = 0; p < 4; p++) {
                    if (p !== wolfPlayerIndex) {
                        points[i][p] = -1;
                    }
                }
            }
            // Wolf loses if they don't have the lowest score
            else {
                // Wolf loses to all other players
                points[i][wolfPlayerIndex] = -3; // Lose to 3 players
                
                // Other players win 1 point each
                for (let p = 0; p < 4; p++) {
                    if (p !== wolfPlayerIndex) {
                        points[i][p] = 1;
                    }
                }
            }
        }
        // Handle partner selection
        else if (selection.startsWith('p')) {
            const partnerIndex = parseInt(selection.substring(1)) - 1; // 0-based index
            
            // Skip invalid partners (the wolf themselves)
            if (partnerIndex === wolfPlayerIndex) continue;
            
            const wolfTeamScores = [holeScores[wolfPlayerIndex], holeScores[partnerIndex]];
            const wolfTeamLowest = Math.min(...wolfTeamScores);
            
            // Determine opponents
            const opponents = [0, 1, 2, 3].filter(p => p !== wolfPlayerIndex && p !== partnerIndex);
            
            if (wolfTeamLowest === lowestScore) {
                // Wolf team wins
                points[i][wolfPlayerIndex] = 2; // Wolf gets 2 points
                points[i][partnerIndex] = 1;   // Partner gets 1 point
                
                // Opponents lose 1 point each
                opponents.forEach(p => {
                    points[i][p] = -1;
                });
            } else {
                // Wolf team loses
                points[i][wolfPlayerIndex] = -2; // Wolf loses 2 points
                points[i][partnerIndex] = -1;   // Partner loses 1 point
                
                // Opponents win 1 point each
                opponents.forEach(p => {
                    points[i][p] = 1;
                });
            }
        }
    }
    
    // Store results in state
    currentRoundState.results = { points: points };
    
    // --- 3. Update UI ---
    // Update hole-by-hole points
    for (let i = 0; i < 18; i++) {
        const hole = i + 1;
        
        for (let p = 0; p < 4; p++) {
            const pointsCell = document.getElementById(`wolf-h${hole}-p${p+1}-pts`);
            const pointValue = points[i][p];
            
            if (pointsCell) {
                if (pointValue !== 0) {
                    pointsCell.textContent = pointValue > 0 ? `+${pointValue}` : pointValue;
                    pointsCell.className = `td-std ${getValueClass(pointValue)}`;
                } else {
                    pointsCell.textContent = '';
                    pointsCell.className = 'td-std';
                }
            }
        }
    }
    
    // Calculate and display summary statistics
    const outScores = [0, 0, 0, 0];
    const inScores = [0, 0, 0, 0];
    const totalScores = [0, 0, 0, 0];
    const outPoints = [0, 0, 0, 0];
    const inPoints = [0, 0, 0, 0];
    const totalPoints = [0, 0, 0, 0];
    const frontValid = [true, true, true, true];
    const backValid = [true, true, true, true];
    
    for (let i = 0; i < 18; i++) {
        const holeNum = i + 1;
        
        for (let p = 0; p < 4; p++) {
            const score = scores[`p${p+1}`][i];
            
            if (score !== null) {
                if (holeNum <= 9) outScores[p] += score;
                else inScores[p] += score;
                totalScores[p] += score;
            } else {
                if (holeNum <= 9) frontValid[p] = false;
                else backValid[p] = false;
            }
            
            // Add points
            const pointValue = points[i][p];
            if (holeNum <= 9) outPoints[p] += pointValue;
            else inPoints[p] += pointValue;
            totalPoints[p] += pointValue;
        }
    }
    
    // Update summary row cells
    for (let p = 0; p < 4; p++) {
        document.getElementById(`wolf-p${p+1}-out-score`).textContent = frontValid[p] ? outScores[p] : '';
        document.getElementById(`wolf-p${p+1}-in-score`).textContent = backValid[p] ? inScores[p] : '';
        document.getElementById(`wolf-p${p+1}-total-score`).textContent = (frontValid[p] || backValid[p]) ? totalScores[p] : '';
        
        // Points summary
        document.getElementById(`wolf-p${p+1}-out-pts`).textContent = outPoints[p] !== 0 ? outPoints[p] : '';
        document.getElementById(`wolf-p${p+1}-in-pts`).textContent = inPoints[p] !== 0 ? inPoints[p] : '';
        document.getElementById(`wolf-p${p+1}-total-pts`).textContent = totalPoints[p] !== 0 ? totalPoints[p] : '';
    }
    
    // Update settlement
    updateWolfSettlement(totalPoints);
    
    // Save state
    saveState();
}