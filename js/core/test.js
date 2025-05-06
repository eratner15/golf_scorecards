// Test Suite for Peel & Eat Golf Scorecards

// Test Helper Functions
function assert(condition, message) {
    if (!condition) {
        console.error(`❌ Test Failed: ${message}`);
        return false;
    }
    console.log(`✅ Test Passed: ${message}`);
    return true;
}

function runTest(testName, testFn) {
    console.log(`\n🧪 Running Test: ${testName}`);
    try {
        testFn();
    } catch (error) {
        console.error(`❌ Test Error: ${testName}`, error);
    }
}

// Vegas Game Tests
function testVegasGame() {
    // Test 1: Basic Team Setup
    runTest('Vegas Team Setup', () => {
        // Setup test data
        document.getElementById('vegas-pA-name').value = 'John';
        document.getElementById('vegas-pB-name').value = 'Mike';
        document.getElementById('vegas-pC-name').value = 'Tom';
        document.getElementById('vegas-pD-name').value = 'Jerry';
        document.getElementById('vegas-point-value').value = '1';
        
        // Trigger update
        updateVegas();
        
        // Verify team names
        assert(document.getElementById('vegas-th-t1').textContent === 'Team 1 (John/Mike)', 'Team 1 names should be updated');
        assert(document.getElementById('vegas-th-t2').textContent === 'Team 2 (Tom/Jerry)', 'Team 2 names should be updated');
    });

    // Test 2: Team Number Calculation
    runTest('Vegas Team Number Calculation', () => {
        // Setup test scores
        document.getElementById('vegas-pA-h1-score').value = '4';
        document.getElementById('vegas-pB-h1-score').value = '5';
        document.getElementById('vegas-pC-h1-score').value = '3';
        document.getElementById('vegas-pD-h1-score').value = '6';
        
        // Trigger update
        updateVegas();
        
        // Verify team numbers
        assert(document.getElementById('vegas-h1-t1-num').textContent === '45', 'Team 1 number should be 45');
        assert(document.getElementById('vegas-h1-t2-num').textContent === '36', 'Team 2 number should be 36');
    });

    // Test 3: Point Difference
    runTest('Vegas Point Difference', () => {
        // Setup test scores for multiple holes
        for (let i = 1; i <= 3; i++) {
            document.getElementById(`vegas-pA-h${i}-score`).value = '4';
            document.getElementById(`vegas-pB-h${i}-score`).value = '5';
            document.getElementById(`vegas-pC-h${i}-score`).value = '3';
            document.getElementById(`vegas-pD-h${i}-score`).value = '6';
        }
        
        // Trigger update
        updateVegas();
        
        // Verify point differences
        assert(document.getElementById('vegas-h1-diff').textContent === '-9', 'Hole 1 point difference should be -9');
    });
}

// Nassau Game Tests
function testNassauGame() {
    // Test 1: Basic Match Setup
    runTest('Nassau Match Setup', () => {
        // Setup test data
        document.getElementById('nassau-player1-name').value = 'John';
        document.getElementById('nassau-player2-name').value = 'Mike';
        document.getElementById('nassau-wager').value = '5';
        
        // Trigger update
        updateNassau();
        
        // Verify player names
        assert(document.getElementById('nassau-th-p1').textContent === 'John', 'Player 1 name should be updated');
        assert(document.getElementById('nassau-th-p2').textContent === 'Mike', 'Player 2 name should be updated');
    });

    // Test 2: Match Scoring
    runTest('Nassau Match Scoring', () => {
        // Setup test scores for front nine
        for (let i = 1; i <= 9; i++) {
            document.getElementById(`nassau-p1-h${i}-score`).value = '4';
            document.getElementById(`nassau-p2-h${i}-score`).value = '5';
        }
        
        // Trigger update
        updateNassau();
        
        // Verify front nine status
        assert(document.getElementById('nassau-settlement-front9-status').textContent === 'P1 9&0', 'Front nine should show P1 winning 9&0');
    });
}

// Skins Game Tests
function testSkinsGame() {
    // Test 1: Basic Skins Setup
    runTest('Skins Game Setup', () => {
        // Setup test data
        document.getElementById('skins-p1-name').value = 'John';
        document.getElementById('skins-p2-name').value = 'Mike';
        document.getElementById('skins-p3-name').value = 'Tom';
        document.getElementById('skins-p4-name').value = 'Jerry';
        document.getElementById('skins-wager').value = '1';
        
        // Trigger update
        updateSkins();
        
        // Verify player names
        assert(document.getElementById('skins-th-p1').textContent === 'John', 'Player 1 name should be updated');
        assert(document.getElementById('skins-th-p2').textContent === 'Mike', 'Player 2 name should be updated');
    });

    // Test 2: Skin Winner Determination
    runTest('Skins Winner Determination', () => {
        // Setup test scores for a hole
        document.getElementById('skins-p1-h1-score').value = '4';
        document.getElementById('skins-p2-h1-score').value = '5';
        document.getElementById('skins-p3-h1-score').value = '3';
        document.getElementById('skins-p4-h1-score').value = '6';
        
        // Trigger update
        updateSkins();
        
        // Verify skin winner
        assert(document.getElementById('skins-h1-winner').textContent === 'P3', 'Player 3 should win the skin');
    });
}

// Run all tests
console.log('🚀 Starting Test Suite for Peel & Eat Golf Scorecards\n');

// Initialize games
initializeVegas();
initializeNassau();
initializeSkins();

// Run tests
testVegasGame();
testNassauGame();
testSkinsGame();

console.log('\n✨ Test Suite Complete'); 