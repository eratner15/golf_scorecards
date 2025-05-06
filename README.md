# Golf Scorecard Web Application

A modern web application for tracking golf scores and managing different golf betting games including Vegas, Nassau, and Wolf.

## Features

- Multiple golf betting game support:
  - Vegas
  - Nassau
  - Wolf
- Real-time score tracking
- Automatic settlement calculations
- Responsive design
- Offline support
- State persistence

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/golf-scorecard.git
cd golf-scorecard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Development

### Project Structure

```
golf-scorecard/
├── js/
│   ├── core/           # Core functionality
│   └── games/          # Game implementations
├── public/             # Static assets
├── dist/              # Build output
└── webpack.config.js  # Build configuration
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run linter

## Deployment

This project is configured for easy deployment to Netlify. Simply connect your GitHub repository to Netlify and it will automatically build and deploy your site.

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` directory to your hosting provider

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 