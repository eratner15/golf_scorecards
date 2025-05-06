// Bingo Bango Bongo game state
const bingoState = {
    course: '',
    date: '',
    pointValue: 1,
    players: {
        p1: { name: '', total: 0, out: 0, in: 0 },
        p2: { name: '', total: 0, out: 0, in: 0 },
        p3: { name: '', total: 0, out: 0, in: 0 },
        p4: { name: '', total: 0, out: 0, in: 0 }
    },
    scores: Array(18).fill().map(() => ({
        p1: { bingo: '', bango: '', bongo: '' },
        p2: { bingo: '', bango: '', bongo: '' },
        p3: { bingo: '', bango: '', bongo: '' },
        p4: { bingo: '', bango: '', bongo: '' }
    }))
};

// Initialize Bingo Bango Bongo game
function initializeBingo() {
    // Set up event listeners for player names
    const playerInputs = [
        'bingo-p1-name',
        'bingo-p2-name',
        'bingo-p3-name',
        'bingo-p4-name'
    ];

    playerInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', updateBingoNames);
        }
    });

    // Set up event listeners for course, date, and point value
    const courseInput = document.getElementById('bingo-course');
    const dateInput = document.getElementById('bingo-date');
    const pointValueInput = document.getElementById('bingo-point-value');

    if (courseInput) courseInput.addEventListener('input', e => {
        bingoState.course = e.target.value;
    });

    if (dateInput) dateInput.addEventListener('input', e => {
        bingoState.date = e.target.value;
    });

    if (pointValueInput) pointValueInput.addEventListener('input', e => {
        bingoState.pointValue = parseFloat(e.target.value) || 0;
        updateBingoSettlement();
    });

    // Generate scorecard rows
    generateBingoRows();
}

// Generate scorecard rows
function generateBingoRows() {
    const tbody = document.getElementById('bingo-scorecard-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    // Generate rows for holes 1-18
    for (let i = 0; i < 18; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="td-std font-semibold">${i + 1}</td>
            <td class="td-std"><input type="text" maxlength="1" class="input-std w-full text-center" data-hole="${i}" data-player="p1" data-type="bingo"></td>
            <td class="td-std"><input type="text" maxlength="1" class="input-std w-full text-center" data-hole="${i}" data-player="p1" data-type="bango"></td>
            <td class="td-std"><input type="text" maxlength="1" class="input-std w-full text-center" data-hole="${i}" data-player="p1" data-type="bongo"></td>
            <td class="td-std p1-total">0</td>
            <td class="td-std"><input type="text" maxlength="1" class="input-std w-full text-center" data-hole="${i}" data-player="p2" data-type="bingo"></td>
            <td class="td-std"><input type="text" maxlength="1" class="input-std w-full text-center" data-hole="${i}" data-player="p2" data-type="bango"></td>
            <td class="td-std"><input type="text" maxlength="1" class="input-std w-full text-center" data-hole="${i}" data-player="p2" data-type="bongo"></td>
            <td class="td-std p2-total">0</td>
            <td class="td-std"><input type="text" maxlength="1" class="input-std w-full text-center" data-hole="${i}" data-player="p3" data-type="bingo"></td>
            <td class="td-std"><input type="text" maxlength="1" class="input-std w-full text-center" data-hole="${i}" data-player="p3" data-type="bango"></td>
            <td class="td-std"><input type="text" maxlength="1" class="input-std w-full text-center" data-hole="${i}" data-player="p3" data-type="bongo"></td>
            <td class="td-std p3-total">0</td>
            <td class="td-std"><input type="text" maxlength="1" class="input-std w-full text-center" data-hole="${i}" data-player="p4" data-type="bingo"></td>
            <td class="td-std"><input type="text" maxlength="1" class="input-std w-full text-center" data-hole="${i}" data-player="p4" data-type="bango"></td>
            <td class="td-std"><input type="text" maxlength="1" class="input-std w-full text-center" data-hole="${i}" data-player="p4" data-type="bongo"></td>
            <td class="td-std p4-total">0</td>
        `;

        // Add event listeners for inputs
        const inputs = row.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', handleBingoInput);
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
            <td colspan="${colspan}" class="td-std">P1 ${label}: <span id="bingo-p1-${label.toLowerCase()}-total">0</span></td><td></td>
            <td colspan="${colspan}" class="td-std">P2 ${label}: <span id="bingo-p2-${label.toLowerCase()}-total">0</span></td><td></td>
            <td colspan="${colspan}" class="td-std">P3 ${label}: <span id="bingo-p3-${label.toLowerCase()}-total">0</span></td><td></td>
            <td colspan="${colspan}" class="td-std">P4 ${label}: <span id="bingo-p4-${label.toLowerCase()}-total">0</span></td><td></td>
        `;
        tbody.appendChild(row);
    });
}

// Handle input changes
function handleBingoInput(e) {
    const input = e.target;
    const hole = parseInt(input.dataset.hole);
    const player = input.dataset.player;
    const type = input.dataset.type;

    // Update state
    bingoState.scores[hole][player][type] = input.value.toUpperCase();

    updateBingoScores();
    updateBingoSettlement();
}

// Update player names in headers
function updateBingoNames() {
    const players = ['p1', 'p2', 'p3', 'p4'];
    players.forEach(player => {
        const nameInput = document.getElementById(`bingo-${player}-name`);
        const name = nameInput ? nameInput.value : `Player ${player.slice(1)}`;
        const shortName = name.substring(0, 6);

        const thEl = document.getElementById(`bingo-th-${player}`);
        const settleHeadEl = document.getElementById(`bingo-settle-head-${player}`);
        const settleRowEl = document.getElementById(`bingo-settle-row-${player}`);

        if (thEl) thEl.textContent = name;
        if (settleHeadEl) settleHeadEl.textContent = shortName;
        if (settleRowEl) settleRowEl.textContent = shortName;

        bingoState.players[player].name = name;
    });
}

// Update scores and totals
function updateBingoScores() {
    const players = ['p1', 'p2', 'p3', 'p4'];
    const scores = bingoState.scores;

    players.forEach(player => {
        let outTotal = 0;
        let inTotal = 0;
        let runningTotal = 0;

        scores.forEach((score, index) => {
            const playerScore = score[player];
            const pointsThisHole = calculatePlayerPoints(playerScore);
            runningTotal += pointsThisHole;

            const totalCell = document.querySelector(`tr[data-hole-index="${index}"] .${player}-total`);
            if (totalCell) totalCell.textContent = runningTotal;

            if (index < 9) {
                outTotal += pointsThisHole;
            } else {
                inTotal += pointsThisHole;
            }
        });

        // Update OUT, IN, TOTAL displays
        document.getElementById(`bingo-${player}-out-total`).textContent = outTotal;
        document.getElementById(`bingo-${player}-in-total`).textContent = inTotal;
        document.getElementById(`bingo-${player}-total-total`).textContent = runningTotal;

        // Update state
        bingoState.players[player].out = outTotal;
        bingoState.players[player].in = inTotal;
        bingoState.players[player].total = runningTotal;
    });
}

// Calculate points for a player on a hole
function calculatePlayerPoints(playerScore) {
    const nameInput = document.getElementById(`bingo-p${playerScore.player.slice(1)}-name`);
    const playerInitial = nameInput ? nameInput.value.charAt(0).toUpperCase() : '';
    let points = 0;

    if (playerInitial) {
        if (playerScore.bingo === playerInitial) points++;
        if (playerScore.bango === playerInitial) points++;
        if (playerScore.bongo === playerInitial) points++;
    }

    return points;
}

// Update settlement display
function updateBingoSettlement() {
    const players = ['p1', 'p2', 'p3', 'p4'];
    const valuePerPoint = bingoState.pointValue;

    players.forEach((player, i) => {
        let netPoints = 0;
        let netAmount = 0;

        players.forEach((otherPlayer, j) => {
            if (i === j) return;

            const diff = bingoState.players[player].total - bingoState.players[otherPlayer].total;
            const cellId = `bingo-${player}-vs-${otherPlayer}`;
            const cellEl = document.getElementById(cellId);
            if (cellEl) {
                cellEl.textContent = diff >= 0 ? `+${diff}` : diff;
                cellEl.style.color = diff > 0 ? 'green' : (diff < 0 ? 'red' : 'black');
            }
            netPoints += diff;
        });

        netAmount = netPoints * valuePerPoint;

        // Update Net Pts and Net Amt columns
        const netPtsEl = document.getElementById(`bingo-${player}-net-pts`);
        const netAmtEl = document.getElementById(`bingo-${player}-net-amt`);

        if (netPtsEl) {
            netPtsEl.textContent = netPoints >= 0 ? `+${netPoints}` : netPoints;
            netPtsEl.style.color = netPoints > 0 ? 'green' : (netPoints < 0 ? 'red' : 'black');
        }

        if (netAmtEl) {
            netAmtEl.textContent = netAmount >= 0 ? `+$${netAmount.toFixed(2)}` : `-$${Math.abs(netAmount).toFixed(2)}`;
            netAmtEl.style.color = netAmount > 0 ? 'green' : (netAmount < 0 ? 'red' : 'black');
        }
    });
}

// Reset Bingo display
function resetBingoDisplay() {
    // Reset inputs
    const inputs = document.querySelectorAll('#bingo-card input');
    inputs.forEach(input => {
        if (input.type === 'number') {
            input.value = input.id === 'bingo-point-value' ? '1' : '';
        } else if (input.type === 'text') {
            input.value = '';
        }
    });

    // Reset state
    bingoState.course = '';
    bingoState.date = '';
    bingoState.pointValue = 1;
    bingoState.players = {
        p1: { name: '', total: 0, out: 0, in: 0 },
        p2: { name: '', total: 0, out: 0, in: 0 },
        p3: { name: '', total: 0, out: 0, in: 0 },
        p4: { name: '', total: 0, out: 0, in: 0 }
    };
    bingoState.scores = Array(18).fill().map(() => ({
        p1: { bingo: '', bango: '', bongo: '' },
        p2: { bingo: '', bango: '', bongo: '' },
        p3: { bingo: '', bango: '', bongo: '' },
        p4: { bingo: '', bango: '', bongo: '' }
    }));

    // Update names and scores
    updateBingoNames();
    updateBingoScores();
    updateBingoSettlement();
}

// Populate Bingo from state
function populateBingo() {
    // Populate course, date, point value
    const courseInput = document.getElementById('bingo-course');
    const dateInput = document.getElementById('bingo-date');
    const pointValueInput = document.getElementById('bingo-point-value');

    if (courseInput) courseInput.value = bingoState.course;
    if (dateInput) dateInput.value = bingoState.date;
    if (pointValueInput) pointValueInput.value = bingoState.pointValue;

    // Populate player names
    const players = ['p1', 'p2', 'p3', 'p4'];
    players.forEach(player => {
        const nameInput = document.getElementById(`bingo-${player}-name`);
        if (nameInput) nameInput.value = bingoState.players[player].name;
    });

    // Update names display
    updateBingoNames();

    // Populate scores
    bingoState.scores.forEach((score, index) => {
        const row = document.querySelector(`#bingo-scorecard-body tr[data-hole-index="${index}"]`);
        if (row) {
            const inputs = row.querySelectorAll('input');
            inputs.forEach(input => {
                const player = input.dataset.player;
                const type = input.dataset.type;
                input.value = score[player][type];
            });
        }
    });

    // Update scores and settlement
    updateBingoScores();
    updateBingoSettlement();
} 