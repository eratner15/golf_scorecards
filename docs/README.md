# Peel & Eat Golf Scorecards

![Peel & Eat Golf Scorecards](https://placehold.co/600x150/003366/F47863?text=Peel+%26+Eat+Golf+Scorecards&font=playfair)

A web-based application for tracking golf scores and calculating settlements for various golf betting games. This application runs entirely in the browser with no server component required.

## Features

- **8 Popular Golf Games**: Nassau, Skins, Wolf, Bingo Bango Bongo, Bloodsome, Stableford, Banker/Quota, and Vegas
- **Real-time Calculations**: Instant score tracking and settlement calculation
- **Mobile Responsive**: Works on phones, tablets, and desktops
- **Data Persistence**: Save rounds to resume later
- **Export/Import**: Share rounds between devices
- **Settlement Summaries**: Copy detailed settlement information for sharing

## Live Demo

[View Live Demo](https://your-demo-url-here.com)

## Game Types

### Nassau
The classic golf betting game with three separate bets (front 9, back 9, overall match) with optional presses.

### Skins
Compete for individual hole prizes with optional par/birdie validation and carryovers for tied holes.

### Wolf
A 4-player game where one player (the Wolf) chooses whether to play alone or with a partner on each hole.

### Bingo Bango Bongo
Earn points for being first on the green, closest to the pin, and first to hole out on each hole.

### Bloodsome
A team match play format for 4 players (2 teams of 2) with alternate shot rules.

### Stableford
A points-based system where players earn points relative to par with standard or modified scoring options.

### Banker/Quota
Players compete against individual target quotas, earning or losing money based on performance.

### Vegas
A team game with a unique scoring system where team scores combine in a specific way.

## Getting Started

### Online Usage
Simply visit the [live demo](https://your-demo-url-here.com) to use the app in your browser.

### Local Installation
1. Clone the repository:
   ```
   git clone https://github.com/your-username/peel-eat-golf-scorecards.git
   ```
2. Open `index.html` in your browser
3. Start tracking your golf games!

No build process or installation required - the application runs entirely in the browser.

## Development

### Project Structure
```
/
├── index.html               # Main HTML file
├── style.css                # CSS styles
├── script.js                # Core application logic
├── games/                   # Game implementations
│   ├── nassau.js
│   ├── skins.js
│   ├── wolf.js
│   ├── bingo.js
│   ├── bloodsome.js
│   ├── stableford.js
│   ├── banker.js
│   └── vegas.js
└── assets/                  # Images and other assets
```

### Adding a New Game Type
1. Create a new game implementation file in the `games/` directory
2. Implement the required functions (initialize, populate, update, reset)
3. Add the game's HTML markup to `index.html`
4. Register the game in the core application functions

### Technologies Used
- HTML5
- CSS3 with Tailwind CSS
- Vanilla JavaScript (no frameworks)
- localStorage for data persistence

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the various golf betting games played around the world
- Icon elements from [Lucide Icons](https://lucide.dev/)
- Fonts from Google Fonts (Inter & Playfair Display)

## Contact

Your Name - [@your_twitter](https://twitter.com/your_twitter) - email@example.com

Project Link: [https://github.com/your-username/peel-eat-golf-scorecards](https://github.com/your-username/peel-eat-golf-scorecards)
