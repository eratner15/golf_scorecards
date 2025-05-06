// Bloodsome game state
const bloodsomeState = {
    course: '',
    date: '',
    wager: 5,
    players: {
        team1: { playerA: '', playerB: '' },
        team2: { playerC: '', playerD: '' }
    },
    scores: Array(18).fill().map(() => ({
        team1Drive: '',
        team1Score: '',
        team2Drive: '',
        team2Score: '',
        result: '',
        status: ''
    }))
};

// Initialize Bloodsome game
function initializeBloodsome() {
    // Set up event listeners for player names
    const playerInputs = [
        'bloodsome-playerA-name',
        'bloodsome-playerB-name',
        'bloodsome-playerC-name',
        'bloodsome-playerD-name'
    ];

    playerInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', updateBloodsomeNames);
        }
    });

    // Set up event listeners for course, date, and wager
    const courseInput = document.getElementById('bloodsome-course');
    const dateInput = document.getElementById('bloodsome-date');
    const wagerInput = document.getElementById('bloodsome-wager');

    if (courseInput) courseInput.addEventListener('input', e => {
        bloodsomeState.course = e.target.value;
    });

    if (dateInput) dateInput.addEventListener('input', e => {
        bloodsomeState.date = e.target.value;
    });

    if (wagerInput) wagerInput.addEventListener('input', e => {
        bloodsomeState.wager = parseInt(e.target.value) || 0;
        updateBloodsomeSettlement();
    });

    // Generate scorecard rows
    generateBloodsomeRows();
}

// Generate scorecard rows
function generateBloodsomeRows() {
    const tbody = document.getElementById('bloodsome-scorecard-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    // Generate rows for holes 1-18
    for (let i = 0; i < 18; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="td-std font-semibold">${i + 1}</td>
            <td class="td-std"><input type="text" class="input-std w-full text-center" maxlength="1" data-hole="${i}" data-team="1" data-type="drive"></td>
            <td class="td-std"><input type="number" class="input-std w-full text-center" min="1" data-hole="${i}" data-team="1" data-type="score"></td>
            <td class="td-std"><input type="text" class="input-std w-full text-center" maxlength="1" data-hole="${i}" data-team="2" data-type="drive"></td>
            <td class="td-std"><input type="number" class="input-std w-full text-center" min="1" data-hole="${i}" data-team="2" data-type="score"></td>
            <td class="td-std"><input type="text" class="input-std w-full text-center" data-hole="${i}" data-type="result"></td>
            <td class="td-std"><input type="text" class="input-std w-full text-center" data-hole="${i}" data-type="status"></td>
        `;

        // Add event listeners for inputs
        const inputs = row.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', handleBloodsomeInput);
        });

        tbody.appendChild(row);
    }

    // Add summary rows
    const summaryRows = [
        { label: 'OUT', colspan: 2 },
        { label: 'IN', colspan: 2 },
        { label: 'TOTAL', colspan: 2 }
    ];

    summaryRows.forEach(({ label, colspan }) => {
        const row = document.createElement('tr');
        row.className = 'total-row';
        row.innerHTML = `
            <th class="th-std">${label}</th>
            <td colspan="${colspan}" class="td-std">T1 Score: <span class="team1-score">--</span></td>
            <td colspan="${colspan}" class="td-std">T2 Score: <span class="team2-score">--</span></td>
            <td colspan="2" class="td-std">Status: <span class="match-status">--</span></td>
        `;
        tbody.appendChild(row);
    });
}

// Handle input changes
function handleBloodsomeInput(e) {
    const input = e.target;
    const hole = parseInt(input.dataset.hole);
    const team = input.dataset.team;
    const type = input.dataset.type;

    if (type === 'drive') {
        bloodsomeState.scores[hole][`team${team}Drive`] = input.value.toUpperCase();
    } else if (type === 'score') {
        bloodsomeState.scores[hole][`team${team}Score`] = parseInt(input.value) || '';
    } else if (type === 'result') {
        bloodsomeState.scores[hole].result = input.value;
    } else if (type === 'status') {
        bloodsomeState.scores[hole].status = input.value;
    }

    updateBloodsomeScores();
    updateBloodsomeSettlement();
}

// Update team names in headers
function updateBloodsomeNames() {
    const playerA = document.getElementById('bloodsome-playerA-name')?.value || 'A';
    const playerB = document.getElementById('bloodsome-playerB-name')?.value || 'B';
    const playerC = document.getElementById('bloodsome-playerC-name')?.value || 'C';
    const playerD = document.getElementById('bloodsome-playerD-name')?.value || 'D';

    const team1Text = `Team 1 (${playerA}/${playerB})`;
    const team2Text = `Team 2 (${playerC}/${playerD})`;

    const thTeam1 = document.getElementById('bloodsome-th-t1');
    const thTeam2 = document.getElementById('bloodsome-th-t2');
    const team1Display = document.getElementById('bloodsome-team1-display-name');
    const team2Display = document.getElementById('bloodsome-team2-display-name');

    if (thTeam1) thTeam1.textContent = team1Text;
    if (thTeam2) thTeam2.textContent = team2Text;
    if (team1Display) team1Display.textContent = team1Text;
    if (team2Display) team2Display.textContent = team2Text;

    // Update state
    bloodsomeState.players.team1.playerA = playerA;
    bloodsomeState.players.team1.playerB = playerB;
    bloodsomeState.players.team2.playerC = playerC;
    bloodsomeState.players.team2.playerD = playerD;
}

// Update scores and status
function updateBloodsomeScores() {
    const scores = bloodsomeState.scores;
    let team1Total = 0;
    let team2Total = 0;
    let team1Out = 0;
    let team2Out = 0;
    let team1In = 0;
    let team2In = 0;

    // Calculate totals
    scores.forEach((score, index) => {
        const team1Score = parseInt(score.team1Score) || 0;
        const team2Score = parseInt(score.team2Score) || 0;

        if (index < 9) {
            team1Out += team1Score;
            team2Out += team2Score;
        } else {
            team1In += team1Score;
            team2In += team2Score;
        }

        team1Total += team1Score;
        team2Total += team2Score;
    });

    // Update summary rows
    const summaryRows = document.querySelectorAll('#bloodsome-scorecard-body .total-row');
    if (summaryRows.length >= 3) {
        // OUT
        summaryRows[0].querySelector('.team1-score').textContent = team1Out || '--';
        summaryRows[0].querySelector('.team2-score').textContent = team2Out || '--';
        summaryRows[0].querySelector('.match-status').textContent = getMatchStatus(team1Out, team2Out);

        // IN
        summaryRows[1].querySelector('.team1-score').textContent = team1In || '--';
        summaryRows[1].querySelector('.team2-score').textContent = team2In || '--';
        summaryRows[1].querySelector('.match-status').textContent = getMatchStatus(team1In, team2In);

        // TOTAL
        summaryRows[2].querySelector('.team1-score').textContent = team1Total || '--';
        summaryRows[2].querySelector('.team2-score').textContent = team2Total || '--';
        summaryRows[2].querySelector('.match-status').textContent = getMatchStatus(team1Total, team2Total);
    }
}

// Get match status text
function getMatchStatus(score1, score2) {
    if (!score1 || !score2) return '--';
    const diff = score1 - score2;
    if (diff === 0) return 'Tied';
    return `${diff > 0 ? 'T2' : 'T1'} ${Math.abs(diff)}UP`;
}

// Update settlement display
function updateBloodsomeSettlement() {
    const scores = bloodsomeState.scores;
    let team1Wins = 0;
    let team2Wins = 0;
    let holesPlayed = 0;

    // Count wins
    scores.forEach(score => {
        if (score.result) {
            holesPlayed++;
            if (score.result === 'T1 Win') team1Wins++;
            if (score.result === 'T2 Win') team2Wins++;
        }
    });

    // Calculate settlement
    const winningTeam = team1Wins > team2Wins ? 'Team 1' : team2Wins > team1Wins ? 'Team 2' : 'Tied';
    const finalScore = `${team1Wins}-${team2Wins}`;
    const amount = Math.abs(team1Wins - team2Wins) * bloodsomeState.wager;

    // Update display
    const winningTeamEl = document.getElementById('bloodsome-winning-team');
    const finalScoreEl = document.getElementById('bloodsome-final-score');
    const amountEl = document.getElementById('bloodsome-settlement-amount');

    if (winningTeamEl) winningTeamEl.textContent = winningTeam;
    if (finalScoreEl) finalScoreEl.textContent = finalScore;
    if (amountEl) amountEl.textContent = `$${amount.toFixed(2)}`;
}

// Reset Bloodsome display
function resetBloodsomeDisplay() {
    // Reset inputs
    const inputs = document.querySelectorAll('#bloodsome-card input');
    inputs.forEach(input => {
        if (input.type === 'number') {
            input.value = '';
        } else if (input.type === 'text') {
            input.value = '';
        }
    });

    // Reset state
    bloodsomeState.course = '';
    bloodsomeState.date = '';
    bloodsomeState.wager = 5;
    bloodsomeState.players = {
        team1: { playerA: '', playerB: '' },
        team2: { playerC: '', playerD: '' }
    };
    bloodsomeState.scores = Array(18).fill().map(() => ({
        team1Drive: '',
        team1Score: '',
        team2Drive: '',
        team2Score: '',
        result: '',
        status: ''
    }));

    // Reset settlement display
    const winningTeamEl = document.getElementById('bloodsome-winning-team');
    const finalScoreEl = document.getElementById('bloodsome-final-score');
    const amountEl = document.getElementById('bloodsome-settlement-amount');

    if (winningTeamEl) winningTeamEl.textContent = '--';
    if (finalScoreEl) finalScoreEl.textContent = '--';
    if (amountEl) amountEl.textContent = '$0.00';

    // Update names
    updateBloodsomeNames();
}

// Populate Bloodsome from state
function populateBloodsome() {
    // Populate course, date, wager
    const courseInput = document.getElementById('bloodsome-course');
    const dateInput = document.getElementById('bloodsome-date');
    const wagerInput = document.getElementById('bloodsome-wager');

    if (courseInput) courseInput.value = bloodsomeState.course;
    if (dateInput) dateInput.value = bloodsomeState.date;
    if (wagerInput) wagerInput.value = bloodsomeState.wager;

    // Populate player names
    const playerAInput = document.getElementById('bloodsome-playerA-name');
    const playerBInput = document.getElementById('bloodsome-playerB-name');
    const playerCInput = document.getElementById('bloodsome-playerC-name');
    const playerDInput = document.getElementById('bloodsome-playerD-name');

    if (playerAInput) playerAInput.value = bloodsomeState.players.team1.playerA;
    if (playerBInput) playerBInput.value = bloodsomeState.players.team1.playerB;
    if (playerCInput) playerCInput.value = bloodsomeState.players.team2.playerC;
    if (playerDInput) playerDInput.value = bloodsomeState.players.team2.playerD;

    // Update names display
    updateBloodsomeNames();

    // Populate scores
    bloodsomeState.scores.forEach((score, index) => {
        const row = document.querySelector(`#bloodsome-scorecard-body tr:nth-child(${index + 1})`);
        if (row) {
            const inputs = row.querySelectorAll('input');
            inputs.forEach(input => {
                const type = input.dataset.type;
                const team = input.dataset.team;
                if (type === 'drive') {
                    input.value = score[`team${team}Drive`];
                } else if (type === 'score') {
                    input.value = score[`team${team}Score`];
                } else if (type === 'result') {
                    input.value = score.result;
                } else if (type === 'status') {
                    input.value = score.status;
                }
            });
        }
    });

    // Update scores and settlement
    updateBloodsomeScores();
    updateBloodsomeSettlement();
} 