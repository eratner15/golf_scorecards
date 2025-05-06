# Peel & Eat Golf Scorecard Implementation

This document provides an overview of the implementation of the Peel & Eat Golf Scorecard web application, which allows golfers to track scores and calculate settlements for various golf betting games.

## Architecture Overview

The application follows a simple architecture:

1. **HTML Structure**: Defines the UI elements for each game type
2. **CSS Styling**: Provides responsive styling for the application
3. **JavaScript Logic**:
   - Core application functions (app initialization, state management, UI handling)
   - Game-specific implementations for each game type

The application uses localStorage for data persistence, allowing users to resume rounds later and export/import their data.

## Core Components

### State Management

The application uses a centralized state object (`currentRoundState`) to store all game data, including:
- Game type
- Player names
- Scores
- Bets/wagers
- Game-specific settings
- Calculated results

This state is saved to localStorage whenever it changes, enabling game resumption.

### UI Management

The UI is structured with:
- Game selection screen
- Active scorecard view (showing the selected game)
- Control buttons (back, clear, export, import)
- Settlement display area for each game

The application dynamically generates scorecard rows for each game type and handles the switching between game views.

### Event Handling

Event handling uses delegation for optimal performance, capturing:
- Input changes (scores, player names, game options)
- Button clicks
- Form submissions

Changes trigger calculations that update both the state and the UI display in real-time.

## Implemented Game Types

### 1. Nassau

The Nassau is a classic golf betting game with three separate bets:
- Front nine
- Back nine
- Overall match

**Key Features:**
- Supports manual or automatic presses
- Tracks match status hole-by-hole
- Calculates settlement based on match play rules

### 2. Skins

Skins is a game where each hole is worth a set amount, awarded to the player with the lowest score on that hole.

**Key Features:**
- Optional par/birdie validation
- Carryover support for tied holes
- Dynamic calculation of skin values
- Settlement display showing skins won and total amounts

### 3. Wolf

Wolf is a 4-player game where one player (the Wolf) chooses whether to play alone or with a partner on each hole.

**Key Features:**
- Automatic Wolf rotation
- Partner selection interface
- Points calculation based on team performance
- Multipliers for lone Wolf victories

### 4. Bingo Bango Bongo

A points-based game with three achievements per hole:
- Bingo: First player on the green
- Bango: Closest to the pin once all balls are on the green
- Bongo: First player to hole out

**Key Features:**
- Checkbox interface for marking achievements
- Exclusivity enforcement (only one player can earn each achievement)
- Points tallying and settlement calculation

### 5. Bloodsome

A team match play format for 4 players (2 teams of 2):
- Teams alternate tee shots
- Team selects which ball to play for the remainder of the hole
- Alternate shots until holed out

**Key Features:**
- Team formation interface
- Driver selection tracking
- Match status calculation
- Settlement based on match play rules

### 6. Stableford

A points-based system where players earn points relative to par:
- Standard: 0 (double bogey+), 1 (bogey), 2 (par), 3 (birdie), 4 (eagle)
- Modified: -1 (double bogey), 0 (bogey), 1 (par), 2 (birdie), 3 (eagle)

**Key Features:**
- Par and score input
- Points calculation using standard or modified systems
- Settlement based on total points

### 7. Banker/Quota

A game where each player has a target number of points (quota):
- Players earn Stableford points on each hole
- Final scores are compared to the player's quota
- Players who beat their quota win money

**Key Features:**
- Individual quota setting
- Stableford point calculation
- Performance vs. quota tracking
- Settlement based on points relative to quota

### 8. Vegas

A team game with a unique scoring system:
- Teams of 2 players each
- Team score is formed by combining the individual scores (lowest digit first)
- E.g., scores of 5 and 6 = 56

**Key Features:**
- Team formation interface
- Automatic Vegas number calculation
- Running point difference tracking
- Final settlement calculation

## Implementation Details

### Game Initialization Pattern

Each game follows a consistent initialization pattern:

1. **Generate Rows**: Create the HTML structure for the scorecard
2. **Add Event Listeners**: Set up event handlers for inputs and actions
3. **Reset Display**: Provide method to clear calculated values
4. **Populate From State**: Fill UI from the current state
5. **Update Calculations**: Calculate and display results

### Calculation Pattern

Calculations for each game follow a similar pattern:

1. **Read Inputs**: Get values from the UI into the state
2. **Calculate Results**: Perform game-specific calculations
3. **Update UI**: Display the calculated results
4. **Update Settlement**: Calculate and show the final settlement

### Helper Functions

Common utilities used across games:

- `formatCurrency()`: Consistent money display
- `formatMatchStatus()`: Format match play status text
- `calculateStablefordPoints()`: Point calculation for Stableford-based games
- `validateScore()`: Input validation for scores

## Integration with Application Core

The game-specific implementations integrate with the core application through:

1. **Initialization**: When a game is selected, the appropriate initialization function is called
2. **State Management**: Game-specific data is stored in the central state object
3. **Event Handling**: Input changes trigger game-specific updates via event delegation
4. **Settlement Display**: Each game calculates and formats its own settlement information

## Extensibility

The application architecture makes it easy to add new game types by:

1. Adding HTML markup for the new game
2. Implementing the required JavaScript functions following the established patterns
3. Registering the game in the core application functions

## Data Export/Import

The application supports:
- Exporting the current game state to a JSON file
- Importing previously exported games
- Copying a text summary of the round results

This allows players to save their rounds, transfer between devices, and share results.

## Conclusion

The Peel & Eat Golf Scorecard implementation provides a comprehensive solution for tracking various golf betting games with a focus on:
- Ease of use
- Accurate calculations
- Flexible game options
- Data persistence
- Mobile responsiveness

The modular architecture makes it easy to maintain and extend the application with additional features or game types in the future.
