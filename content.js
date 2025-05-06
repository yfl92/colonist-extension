// Card counter for Colonist.io
let isGameActive = false;
let cardObserver = null;
let chatObserver = null;

// Default counts
const defaultCounts = {
  wood: 0,
  brick: 0,
  sheep: 0,
  wheat: 0,
  ore: 0,
  devCard: 0
};

// Initialize the card counts
function initializeCardCounts() {
  chrome.storage.local.get('cardCounts', function(result) {
    if (!result.cardCounts) {
      chrome.storage.local.set({cardCounts: defaultCounts});
    }
  });
  chrome.storage.local.set({isActive: isGameActive});
}

// Update card counts
function updateCardCount(resourceType, amount) {
  chrome.storage.local.get('cardCounts', function(result) {
    const counts = result.cardCounts || {...defaultCounts};
    
    // Update count
    counts[resourceType] = Math.max(0, counts[resourceType] + amount);
    
    // Save updated counts
    chrome.storage.local.set({cardCounts: counts}, function() {
      // Notify popup about the update
      chrome.runtime.sendMessage({type: 'countsUpdated'});
    });
  });
}

// Parse game log messages to track resource transactions
function parseGameLog(logEntry) {
  const text = logEntry.textContent.trim();
  
  // Player received resources
  const receivedMatch = text.match(/(.+) received (\d+) (\w+)/i);
  if (receivedMatch) {
    const [_, playerName, amount, resource] = receivedMatch;
    const resourceType = mapResourceToType(resource);
    if (resourceType) {
      updateCardCount(resourceType, parseInt(amount));
    }
    return;
  }
  
  // Player built something (used resources)
  const builtMatch = text.match(/(.+) built a (settlement|city|road|development card)/i);
  if (builtMatch) {
    const [_, playerName, item] = builtMatch;
    switch(item.toLowerCase()) {
      case 'settlement':
        updateCardCount('brick', -1);
        updateCardCount('wood', -1);
        updateCardCount('wheat', -1);
        updateCardCount('sheep', -1);
        break;
      case 'city':
        updateCardCount('ore', -3);
        updateCardCount('wheat', -2);
        break;
      case 'road':
        updateCardCount('brick', -1);
        updateCardCount('wood', -1);
        break;
      case 'development card':
        updateCardCount('ore', -1);
        updateCardCount('wheat', -1);
        updateCardCount('sheep', -1);
        updateCardCount('devCard', 1);
        break;
    }
    return;
  }
  
  // Player played a development card
  const playedDevMatch = text.match(/(.+) played a (knight|year of plenty|monopoly|road building|victory point)/i);
  if (playedDevMatch) {
    updateCardCount('devCard', -1);
    return;
  }
  
  // Trading with bank or other players
  const tradeMatch = text.match(/(.+) traded (\d+) (\w+) for (\d+) (\w+)/i);
  if (tradeMatch) {
    const [_, playerName, giveAmount, giveResource, getAmount, getResource] = tradeMatch;
    const giveType = mapResourceToType(giveResource);
    const getType = mapResourceToType(getResource);
    
    if (giveType) {
      updateCardCount(giveType, -parseInt(giveAmount));
    }
    if (getType) {
      updateCardCount(getType, parseInt(getAmount));
    }
    return;
  }
  
  // Resources stolen by robber
  const stolenMatch = text.match(/(.+) stole (\w+) from (.+)/i);
  if (stolenMatch) {
    const [_, stealer, resource, victim] = stolenMatch;
    const resourceType = mapResourceToType(resource);
    if (resourceType) {
      // No need to update count as cards just change hands
    }
    return;
  }
  
  // Discard because of robber
  const discardMatch = text.match(/(.+) discarded (\d+) cards?/i);
  if (discardMatch) {
    // We don't know which specific resources were discarded
    // This is a limitation since the game doesn't show this information
    return;
  }
  
  // Bank gives resources to a player
  const bankGiveMatch = text.match(/Bank gave (\d+) (\w+) to (.+)/i);
  if (bankGiveMatch) {
    const [_, amount, resource, playerName] = bankGiveMatch;
    const resourceType = mapResourceToType(resource);
    if (resourceType) {
      updateCardCount(resourceType, parseInt(amount));
    }
    return;
  }
}

// Map resource name to our resource type
function mapResourceToType(resourceName) {
  const resourceMap = {
    'wood': 'wood',
    'lumber': 'wood',
    'timber': 'wood',
    'brick': 'brick',
    'clay': 'brick',
    'sheep': 'sheep',
    'wool': 'sheep',
    'wheat': 'wheat',
    'grain': 'wheat',
    'ore': 'ore',
    'stone': 'ore',
    'rock': 'ore',
    'development card': 'devCard',
    'dev card': 'devCard'
  };
  
  return resourceMap[resourceName.toLowerCase()];
}

// Start monitoring the game
function startMonitoring() {
  if (isGameActive) return;
  
  console.log('Colonist Card Counter: Monitoring game');
  isGameActive = true;
  chrome.storage.local.set({isActive: true});
  
  // Set up observers for the game chat/log
  setupGameObservers();
}

// Stop monitoring the game
function stopMonitoring() {
  if (!isGameActive) return;
  
  console.log('Colonist Card Counter: Stopped monitoring');
  isGameActive = false;
  chrome.storage.local.set({isActive: false});
  
  // Clean up observers
  if (cardObserver) {
    cardObserver.disconnect();
    cardObserver = null;
  }
  
  if (chatObserver) {
    chatObserver.disconnect();
    chatObserver = null;
  }
}

// Set up observers to monitor the game log and card displays
function setupGameObservers() {
  // Look for the chat/log container
  const gameLogInterval = setInterval(() => {
    const gameLog = document.querySelector('.game-log-text');
    if (gameLog) {
      clearInterval(gameLogInterval);
      
      // Create an observer for the game log
      chatObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                parseGameLog(node);
              }
            });
          }
        });
      });
      
      // Start observing
      chatObserver.observe(gameLog, { childList: true });
    }
  }, 1000);
  
  // We'll also watch for URL changes to detect when game starts/ends
  setInterval(() => {
    if (window.location.href.includes('game')) {
      startMonitoring();
    } else {
      stopMonitoring();
    }
  }, 2000);
}

// Initialize when the extension loads
initializeCardCounts();

// Monitor for game start/end based on URL
if (window.location.href.includes('game')) {
  startMonitoring();
} else {
  stopMonitoring();
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getStatus') {
    sendResponse({isActive: isGameActive});
  }
}); 