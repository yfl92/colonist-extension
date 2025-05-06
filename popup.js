document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements
  const woodCount = document.getElementById('wood-count');
  const brickCount = document.getElementById('brick-count');
  const sheepCount = document.getElementById('sheep-count');
  const wheatCount = document.getElementById('wheat-count');
  const oreCount = document.getElementById('ore-count');
  const devCardCount = document.getElementById('dev-card-count');
  const totalCount = document.getElementById('total-count');
  const statusElement = document.getElementById('status');
  const resetBtn = document.getElementById('reset-btn');
  
  // Progress bars
  const woodProgress = document.getElementById('wood-progress');
  const brickProgress = document.getElementById('brick-progress');
  const sheepProgress = document.getElementById('sheep-progress');
  const wheatProgress = document.getElementById('wheat-progress');
  const oreProgress = document.getElementById('ore-progress');
  
  // Card limits in standard Catan
  const CARD_LIMITS = {
    wood: 19,
    brick: 19,
    sheep: 19,
    wheat: 19,
    ore: 19,
    devCard: 25
  };

  // Total cards in the game
  const TOTAL_CARDS = 95; // 19*4 resource cards + 25 dev cards
  
  // Load current counts from storage
  function loadCounts() {
    chrome.storage.local.get(['cardCounts', 'isActive'], function(result) {
      if (result.cardCounts) {
        const counts = result.cardCounts;
        woodCount.textContent = counts.wood;
        brickCount.textContent = counts.brick;
        sheepCount.textContent = counts.sheep;
        wheatCount.textContent = counts.wheat;
        oreCount.textContent = counts.ore;
        devCardCount.textContent = counts.devCard;
        
        // Update progress bars
        updateProgressBars(counts);
        
        // Update total count
        const total = counts.wood + counts.brick + counts.sheep + counts.wheat + counts.ore + counts.devCard;
        totalCount.textContent = total;
      }
      
      // Update status
      if (result.isActive) {
        statusElement.textContent = 'Connected to game';
        statusElement.className = 'status active';
      } else {
        statusElement.textContent = 'Not connected to a game';
        statusElement.className = 'status inactive';
      }
    });
  }
  
  // Update progress bars based on counts
  function updateProgressBars(counts) {
    woodProgress.style.width = `${(counts.wood / CARD_LIMITS.wood) * 100}%`;
    brickProgress.style.width = `${(counts.brick / CARD_LIMITS.brick) * 100}%`;
    sheepProgress.style.width = `${(counts.sheep / CARD_LIMITS.sheep) * 100}%`;
    wheatProgress.style.width = `${(counts.wheat / CARD_LIMITS.wheat) * 100}%`;
    oreProgress.style.width = `${(counts.ore / CARD_LIMITS.ore) * 100}%`;
  }
  
  // Reset counter
  resetBtn.addEventListener('click', function() {
    const defaultCounts = {
      wood: 0,
      brick: 0,
      sheep: 0,
      wheat: 0,
      ore: 0,
      devCard: 0
    };
    
    chrome.storage.local.set({cardCounts: defaultCounts}, function() {
      loadCounts();
    });
  });
  
  // Listen for updates from content script
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'countsUpdated') {
      loadCounts();
    }
  });
  
  // Initial load
  loadCounts();
}); 