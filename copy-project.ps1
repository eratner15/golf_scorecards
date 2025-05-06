# Source and destination paths
$sourceDir = "C:\Users\ratnere\.cursor-tutor"
$destDir = "C:\Users\ratnere\Documents\peel-eat-golf-scorecards"

# Create destination directories if they don't exist
New-Item -ItemType Directory -Force -Path "$destDir\js\core"
New-Item -ItemType Directory -Force -Path "$destDir\js\games"
New-Item -ItemType Directory -Force -Path "$destDir\assets"
New-Item -ItemType Directory -Force -Path "$destDir\dist"
New-Item -ItemType Directory -Force -Path "$destDir\test"

# Copy root files
Copy-Item "$sourceDir\package.json" -Destination "$destDir\package.json" -Force
Copy-Item "$sourceDir\webpack.config.js" -Destination "$destDir\webpack.config.js" -Force
Copy-Item "$sourceDir\.gitignore" -Destination "$destDir\.gitignore" -Force
Copy-Item "$sourceDir\index.html" -Destination "$destDir\index.html" -Force
Copy-Item "$sourceDir\style.css" -Destination "$destDir\style.css" -Force
Copy-Item "$sourceDir\jest.config.js" -Destination "$destDir\jest.config.js" -Force

# Copy core files
Get-ChildItem "$sourceDir\js\core\*.js" | ForEach-Object {
    Copy-Item $_.FullName -Destination "$destDir\js\core\" -Force
}

# Copy game files
Get-ChildItem "$sourceDir\js\games\*.js" | ForEach-Object {
    Copy-Item $_.FullName -Destination "$destDir\js\games\" -Force
}

# Copy assets
Copy-Item "$sourceDir\assets\*" -Destination "$destDir\assets\" -Recurse -Force

Write-Host "Files copied successfully!" 