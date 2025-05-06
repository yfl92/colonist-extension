# Colonist Card Counter

A Chrome extension that counts cards in the online board game [Colonist.io](https://colonist.io/).

## Features

- Tracks resource cards (wood, brick, sheep, wheat, ore) in play
- Counts development cards
- Monitors game chat/log to track transactions
- Shows progress bars for each resource
- Displays total cards in play

## Installation

1. Clone this repository or download as a ZIP file
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the folder containing this extension
5. The extension should now appear in your Chrome toolbar

## Usage

1. Navigate to [Colonist.io](https://colonist.io/) and start a game
2. Click the extension icon in your toolbar to view the current card counts
3. The extension automatically monitors game actions through the log
4. Use the "Reset Counter" button if needed to reset all counts to zero

## Limitations

- The extension can only track information that appears in the game log
- Discarded cards due to the robber might not be accurate as the game doesn't specify which resources were discarded
- Initial resource distribution during setup may not be fully captured

## Development

### Icon Generation

Run the script in the images folder to generate placeholder icons:

```
cd images
chmod +x create_icons.sh
./create_icons.sh
```

Replace with custom icons as needed.

## License

MIT
