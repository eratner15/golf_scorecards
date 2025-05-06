// Vegas game state
const vegasState = {
    course: '',
    date: '',
    pointValue: 1,
    players: {
        team1: { playerA: '', playerB: '' },
        team2: { playerC: '', playerD: '' }
    },
    scores: Array(18).fill().map(() => ({
        team1: { scoreA: '', scoreB: '', teamNum: '' },
        team2: { scoreC: '', scoreD: '', teamNum: '' },
        pointsDiff: ''
    }))
};

// Initialize Vegas game
function initializeVegas() {
    // Set up event listeners for player names
    const playerInputs = [
        'vegas-pA-name',
        'vegas-pB-name',
        'vegas-pC-name',
        'vegas-pD-name'
    ];

    playerInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', updateVegasNames);
        }
    });

    // Set up event listeners for course, date, and point value
    const courseInput = document.getElementById('vegas-course');
    const dateInput = document.getElementById('vegas-date');
    const pointValueInput = document.getElementById('vegas-point-value');

    if (courseInput) courseInput.addEventListener('input', e => {
        vegasState.course = e.target.value;
    });

    if (dateInput) dateInput.addEventListener('input', e => {
        vegasState.date = e.target.value;
    });

    if (pointValueInput) pointValueInput.addEventListener('input', e => {
        vegasState.pointValue = parseFloat(e.target.value) || 0;
        updateVegasSettlement();
    });

    // Generate scorecard rows
    generateVegasRows();
}

// Generate scorecard rows
function generateVegasRows() {
    const tbody = document.getElementById('vegas-scorecard-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    // Generate rows for holes 1-18
    for (let i = 0; i < 18; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="td-std font-semibold">${i + 1}</td>
            <td class="td-std"><input type="number" class="input-std w-full text-center" min="1" data-hole="${i}" data-team="1" data-player="A"></td>
            <td class="td-std"><input type="number" class="input-std w-full text-center" min="1" data-hole="${i}" data-team="1" data-player="B"></td>
            <td class="td-std team1-num"></td>
            <td class="td-std"><input type="number" class="input-std w-full text-center" min="1" data-hole="${i}" data-team="2" data-player="C"></td>
            <td class="td-std"><input type="number" class="input-std w-full text-center" min="1" data-hole="${i}" data-team="2" data-player="D"></td>
            <td class="td-std team2-num"></td>
            <td class="td-std points-diff"></td>
        `;

        // Add event listeners for inputs
        const inputs = row.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', handleVegasInput);
        });

        tbody.appendChild(row);
    }

    // Add summary rows
    const summaryRows = [
        { label: 'OUT', colspan: 3 },
        { label: 'IN', colspan: 3 },
        { label: 'TOTAL', colspan: 3 }
    ];

    summaryRows.forEach(({ label, colspan }) => {
        const row = document.createElement('tr');
        row.className = 'total-row';
        row.innerHTML = `
            <th class="th-std">${label}</th>
            <td colspan="${colspan}" class="td-std">Team 1 Total Points: <span class="team1-total">0</span></td>
            <td colspan="${colspan}" class="td-std">Team 2 Total Points: <span class="team2-total">0</span></td>
            <td class="td-std">${label} +/- T1: <span class="points-diff-total">0</span></td>
        `;
        tbody.appendChild(row);
    });
}

// Handle input changes
function handleVegasInput(e) {
    const input = e.target;
    const hole = parseInt(input.dataset.hole);
    const team = input.dataset.team;
    const player = input.dataset.player;

    // Update state
    if (team === '1') {
        if (player === 'A') {
            vegasState.scores[hole].team1.scoreA = parseInt(input.value) || '';
        } else {
            vegasState.scores[hole].team1.scoreB = parseInt(input.value) || '';
        }
    } else {
        if (player === 'C') {
            vegasState.scores[hole].team2.scoreC = parseInt(input.value) || '';
        } else {
            vegasState.scores[hole].team2.scoreD = parseInt(input.value) || '';
        }
    }

    updateVegasScores();
    updateVegasSettlement();
}

// Calculate team number
function calculateTeamNumber(score1, score2) {
    if (!score1 || !score2) return '';
    
    // If either score is 10 or higher, put that score first
    if (score1 >= 10 || score2 >= 10) {
        return Math.max(score1, score2).toString() + Math.min(score1, score2).toString();
    }
    
    // Otherwise, put lower score first
    return Math.min(score1, score2).toString() + Math.max(score1, score2).toString();
}

// Update team names in headers
function updateVegasNames() {
    const playerA = document.getElementById('vegas-pA-name')?.value || 'A';
    const playerB = document.getElementById('vegas-pB-name')?.value || 'B';
    const playerC = document.getElementById('vegas-pC-name')?.value || 'C';
    const playerD = document.getElementById('vegas-pD-name')?.value || 'D';

    const team1Text = `Team 1 (${playerA}/${playerB})`;
    const team2Text = `Team 2 (${playerC}/${playerD})`;

    const thTeam1 = document.getElementById('vegas-th-t1');
    const thTeam2 = document.getElementById('vegas-th-t2');
    const team1Display = document.getElementById('vegas-team1-display-name');
    const team2Display = document.getElementById('vegas-team2-display-name');

    if (thTeam1) thTeam1.textContent = team1Text;
    if (thTeam2) thTeam2.textContent = team2Text;
    if (team1Display) team1Display.textContent = team1Text;
    if (team2Display) team2Display.textContent = team2Text;

    // Update state
    vegasState.players.team1.playerA = playerA;
    vegasState.players.team1.playerB = playerB;
    vegasState.players.team2.playerC = playerC;
    vegasState.players.team2.playerD = playerD;
}

// Update scores and points
function updateVegasScores() {
    const scores = vegasState.scores;
    let team1Total = 0;
    let team2Total = 0;
    let team1Out = 0;
    let team2Out = 0;
    let team1In = 0;
    let team2In = 0;

    // Update each hole
    scores.forEach((score, index) => {
        const row = document.querySelector(`#vegas-scorecard-body tr:nth-child(${index + 1})`);
        if (!row) return;

        // Calculate team numbers
        const team1Num = calculateTeamNumber(score.team1.scoreA, score.team1.scoreB);
        const team2Num = calculateTeamNumber(score.team2.scoreC, score.team2.scoreD);

        // Update display
        row.querySelector('.team1-num').textContent = team1Num;
        row.querySelector('.team2-num').textContent = team2Num;

        // Calculate points difference
        let pointsDiff = '';
        if (team1Num && team2Num) {
            pointsDiff = parseInt(team1Num) - parseInt(team2Num);
            row.querySelector('.points-diff').textContent = pointsDiff;
        } else {
            row.querySelector('.points-diff').textContent = '';
        }

        // Update totals
        if (pointsDiff !== '') {
            if (index < 9) {
                team1Out += pointsDiff;
                team2Out -= pointsDiff;
            } else {
                team1In += pointsDiff;
                team2In -= pointsDiff;
            }
            team1Total += pointsDiff;
            team2Total -= pointsDiff;
        }
    });

    // Update summary rows
    const summaryRows = document.querySelectorAll('#vegas-scorecard-body .total-row');
    if (summaryRows.length >= 3) {
        // OUT
        summaryRows[0].querySelector('.team1-total').textContent = team1Out;
        summaryRows[0].querySelector('.team2-total').textContent = team2Out;
        summaryRows[0].querySelector('.points-diff-total').textContent = team1Out;

        // IN
        summaryRows[1].querySelector('.team1-total').textContent = team1In;
        summaryRows[1].querySelector('.team2-total').textContent = team2In;
        summaryRows[1].querySelector('.points-diff-total').textContent = team1In;

        // TOTAL
        summaryRows[2].querySelector('.team1-total').textContent = team1Total;
        summaryRows[2].querySelector('.team2-total').textContent = team2Total;
        summaryRows[2].querySelector('.points-diff-total').textContent = team1Total;
    }

    // Update settlement display
    document.getElementById('vegas-team1-total').textContent = team1Total;
    document.getElementById('vegas-team2-total').textContent = team2Total;
    document.getElementById('vegas-point-diff').textContent = Math.abs(team1Total);
}

// Update settlement display
function updateVegasSettlement() {
    const team1Total = parseInt(document.getElementById('vegas-team1-total').textContent) || 0;
    const amount = Math.abs(team1Total) * vegasState.pointValue;
    
    document.getElementById('vegas-amount-owed').textContent = `$${amount.toFixed(2)}`;
    
    const summaryText = document.getElementById('vegas-settlement-summary-text');
    if (team1Total > 0) {
        summaryText.textContent = `Team 2 owes Team 1 $${amount.toFixed(2)}`;
    } else if (team1Total < 0) {
        summaryText.textContent = `Team 1 owes Team 2 $${amount.toFixed(2)}`;
    } else {
        summaryText.textContent = 'Teams are tied - No settlement needed';
    }
}

// Reset Vegas display
function resetVegasDisplay() {
    // Reset inputs
    const inputs = document.querySelectorAll('#vegas-card input');
    inputs.forEach(input => {
        if (input.type === 'number') {
            input.value = '';
        } else if (input.type === 'text') {
            input.value = '';
        }
    });

    // Reset state
    vegasState.course = '';
    vegasState.date = '';
    vegasState.pointValue = 1;
    vegasState.players = {
        team1: { playerA: '', playerB: '' },
        team2: { playerC: '', playerD: '' }
    };
    vegasState.scores = Array(18).fill().map(() => ({
        team1: { scoreA: '', scoreB: '', teamNum: '' },
        team2: { scoreC: '', scoreD: '', teamNum: '' },
        pointsDiff: ''
    }));

    // Reset settlement display
    document.getElementById('vegas-team1-total').textContent = '0';
    document.getElementById('vegas-team2-total').textContent = '0';
    document.getElementById('vegas-point-diff').textContent = '0';
    document.getElementById('vegas-amount-owed').textContent = '$0.00';
    document.getElementById('vegas-settlement-summary-text').textContent = 'Team -- owes Team -- $0.00';

    // Update names
    updateVegasNames();
}

// Populate Vegas from state
function populateVegas() {
    // Populate course, date, point value
    const courseInput = document.getElementById('vegas-course');
    const dateInput = document.getElementById('vegas-date');
    const pointValueInput = document.getElementById('vegas-point-value');

    if (courseInput) courseInput.value = vegasState.course;
    if (dateInput) dateInput.value = vegasState.date;
    if (pointValueInput) pointValueInput.value = vegasState.pointValue;

    // Populate player names
    const playerAInput = document.getElementById('vegas-pA-name');
    const playerBInput = document.getElementById('vegas-pB-name');
    const playerCInput = document.getElementById('vegas-pC-name');
    const playerDInput = document.getElementById('vegas-pD-name');

    if (playerAInput) playerAInput.value = vegasState.players.team1.playerA;
    if (playerBInput) playerBInput.value = vegasState.players.team1.playerB;
    if (playerCInput) playerCInput.value = vegasState.players.team2.playerC;
    if (playerDInput) playerDInput.value = vegasState.players.team2.playerD;

    // Update names display
    updateVegasNames();

    // Populate scores
    vegasState.scores.forEach((score, index) => {
        const row = document.querySelector(`#vegas-scorecard-body tr:nth-child(${index + 1})`);
        if (row) {
            const inputs = row.querySelectorAll('input');
            inputs.forEach(input => {
                const team = input.dataset.team;
                const player = input.dataset.player;
                if (team === '1') {
                    if (player === 'A') {
                        input.value = score.team1.scoreA;
                    } else {
                        input.value = score.team1.scoreB;
                    }
                } else {
                    if (player === 'C') {
                        input.value = score.team2.scoreC;
                    } else {
                        input.value = score.team2.scoreD;
                    }
                }
            });
        }
    });

    // Update scores and settlement
    updateVegasScores();
    updateVegasSettlement();
} 