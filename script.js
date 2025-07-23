/**
 * Dog House Slot Machine - Full Implementation
 * Version 1.0.0
 * File: script.js
 * Author: SlotMaster
 * Description: Complete slot machine with all features
 */

class DogHouseSlot {
  constructor() {
    // Game configuration
    this.config = {
      symbols: [
        // Low paying symbols
        { id: 0, name: "9", emoji: "🦴", payout: [0,0,0.2,0.5,1.0], type: "low", weight: [15,14,14,14,15], color: "#FFFFFF" },
        { id: 1, name: "10", emoji: "❌", payout: [0,0,0.3,0.7,1.5], type: "low", weight: [15,14,14,14,15], color: "#FF6B6B" },
        { id: 2, name: "J", emoji: "🐕", payout: [0,0,0.4,0.9,2.0], type: "low", weight: [14,13,13,13,14], color: "#4ECDC4" },
        { id: 3, name: "Q", emoji: "🐩", payout: [0,0,0.5,1.2,2.5], type: "low", weight: [14,13,13,13,14], color: "#FF9F1C" },
        { id: 4, name: "K", emoji: "🐕‍🦺", payout: [0,0,0.7,1.5,3.0], type: "low", weight: [13,12,12,12,13], color: "#1A936F" },
        { id: 5, name: "A", emoji: "🐶", payout: [0,0,0.9,2.0,4.0], type: "low", weight: [13,12,12,12,13], color: "#C5D86D" },
        
        // High paying symbols
        { id: 6, name: "Ошейник", emoji: "⛓️", payout: [0,0,1.5,3.0,6.0], type: "high", weight: [5,4,4,4,5], color: "#118AB2" },
        { id: 7, name: "Кость", emoji: "🍖", payout: [0,0,2.0,5.0,10.0], type: "high", weight: [5,4,4,4,5], color: "#FFD166" },
        { id: 8, name: "Миска", emoji: "🥣", payout: [0,0,3.0,8.0,15.0], type: "high", weight: [4,3,3,3,4], color: "#9B59B6" },
        { id: 9, name: "Будка", emoji: "🏠", payout: [0,0,5.0,12.0,25.0], type: "high", weight: [3,2,2,2,3], color: "#E74C3C" },
        
        // Special symbols
        { id: 10, name: "Wild", emoji: "🌟", payout: [0,0,1.0,2.5,5.0], type: "wild", weight: [0,5,5,5,0], color: "#FFD700", multiplier: [2,3] },
        { id: 11, name: "Scatter", emoji: "🚧", payout: [0,0,5,20,100], type: "scatter", weight: [2,2,2,2,2], color: "#2ECC71" }
      ],
      
      reels: [
        [0,1,2,3,4,5,6,7,8,9,11], // Reel 1 (no wild)
        [0,1,2,3,4,5,6,7,8,9,10,11], // Reel 2
        [0,1,2,3,4,5,6,7,8,9,10,11], // Reel 3
        [0,1,2,3,4,5,6,7,8,9,10,11], // Reel 4
        [0,1,2,3,4,5,6,7,8,9,11]  // Reel 5 (no wild)
      ],
      
      paylines: [
        {id: 1, positions: [0,0,0,0,0], color: "#FF0000"}, // Top line
        {id: 2, positions: [1,1,1,1,1], color: "#00FF00"}, // Center line
        {id: 3, positions: [2,2,2,2,2], color: "#0000FF"}, // Bottom line
        {id: 4, positions: [0,1,2,1,0], color: "#FFFF00"}, // V shape
        {id: 5, positions: [2,1,0,1,2], color: "#FF00FF"}, // Inverted V
        {id: 6, positions: [0,0,1,2,2], color: "#00FFFF"}, // Z shape
        {id: 7, positions: [2,2,1,0,0], color: "#FFFFFF"}, // Inverted Z
        {id: 8, positions: [1,0,0,0,1], color: "#FF8800"}, // Inner V
        {id: 9, positions: [1,2,2,2,1], color: "#8800FF"}, // Inner inverted V
        {id: 10, positions: [0,1,1,1,0], color: "#FF0088"}  // Double line
      ],
      
      reelDelays: [0, 100, 200, 100, 0], // Wave spin effect
      reelStopSequence: [0, 4, 1, 3, 2], // Stopping order
      
      bonus: {
        freeSpins: [12, 20, 50], // For 3,4,5 scatters
        pickGame: {
          prizes: [
            {value: 2, probability: 60},
            {value: 3, probability: 25},
            {value: 5, probability: 10},
            {value: 10, probability: 5}
          ]
        },
        stickyWilds: true,
        retriggerable: true
      },
      
      betOptions: [0.2, 0.5, 1, 2, 5, 10, 20, 50, 100],
      initialBalance: 1000
    };

    // Game state
    this.state = {
      balance: this.config.initialBalance,
      bet: this.config.betOptions[2],
      spinning: false,
      autoplay: false,
      autoplaySpins: 0,
      currentWin: 0,
      bonus: {
        active: false,
        spinsLeft: 0,
        stickyWilds: [],
        multiplier: 1,
        totalWin: 0
      }
    };

    // Initialize game
    this.init();
  }

  // Initialize the game
  init() {
    this.createReels();
    this.setupControls();
    this.loadSounds();
    this.updateUI();
    this.setupEventListeners();
    
    console.log("Dog House Slot initialized");
  }

  // Create reel DOM elements
  createReels() {
    const reelsContainer = document.getElementById('reels');
    reelsContainer.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
      const reel = document.createElement('div');
      reel.className = 'reel';
      reel.id = `reel-${i}`;
      
      for (let j = 0; j < 3; j++) {
        const symbol = this.createSymbol(i, j);
        reel.appendChild(symbol);
      }
      
      reelsContainer.appendChild(reel);
    }
  }

  // Create a single symbol element
  createSymbol(reel, position) {
    const symbol = document.createElement('div');
    symbol.className = 'symbol';
    symbol.dataset.reel = reel;
    symbol.dataset.pos = position;
    
    const symbolData = this.getInitialSymbol(reel, position);
    this.updateSymbol(symbol, symbolData);
    
    return symbol;
  }

  // Get initial symbol for position
  getInitialSymbol(reel, position) {
    const symbolIndex = this.config.reels[reel][position];
    return this.config.symbols[symbolIndex];
  }

  // Update symbol appearance
  updateSymbol(element, symbolData) {
    element.innerHTML = `
      <div class="symbol-inner" style="color:${symbolData.color}">
        ${symbolData.emoji}
        ${symbolData.type === 'wild' ? '<div class="wild-multiplier">x'+(this.state.bonus.active ? 3 : this.getRandomMultiplier())+'</div>' : ''}
      </div>
    `;
    element.dataset.symbolId = symbolData.id;
    element.className = `symbol ${symbolData.type}-symbol`;
    
    // Special styling for wilds in bonus
    if (symbolData.type === 'wild' && this.state.bonus.active) {
      element.classList.add('wild-bonus');
    }
  }

  // Get random multiplier for wild (2 or 3)
  getRandomMultiplier() {
    const multipliers = this.config.symbols.find(s => s.id === 10).multiplier;
    return multipliers[Math.floor(Math.random() * multipliers.length)];
  }

  // Setup control buttons
  setupControls() {
    // Spin button
    this.spinBtn = document.getElementById('spin-btn');
    
    // Bet controls
    this.betDisplay = document.getElementById('bet-display');
    this.betUpBtn = document.getElementById('bet-up');
    this.betDownBtn = document.getElementById('bet-down');
    
    // Autoplay controls
    this.autoplayBtn = document.getElementById('autoplay-btn');
    this.autoplayMenu = document.getElementById('autoplay-menu');
    
    // Balance display
    this.balanceDisplay = document.getElementById('balance');
    
    // Win display
    this.winDisplay = document.getElementById('win-display');
  }

  // Setup event listeners
  setupEventListeners() {
    // Spin button
    this.spinBtn.addEventListener('click', () => {
      if (!this.state.spinning) {
        this.spin();
      }
    });
    
    // Bet controls
    this.betUpBtn.addEventListener('click', () => this.increaseBet());
    this.betDownBtn.addEventListener('click', () => this.decreaseBet());
    
    // Autoplay
    this.autoplayBtn.addEventListener('click', () => this.toggleAutoplay());
    
    // Paytable button
    document.getElementById('paytable-btn').addEventListener('click', () => this.showPaytable());
  }

  // Load sound effects
  loadSounds() {
    this.sounds = {
      'spin-start': new Audio('sounds/spin_start.mp3'),
      'reel-stop-1': new Audio('sounds/reel_stop_1.mp3'),
      'reel-stop-2': new Audio('sounds/reel_stop_2.mp3'),
      'reel-stop-3': new Audio('sounds/reel_stop_3.mp3'),
      'reel-stop-4': new Audio('sounds/reel_stop_4.mp3'),
      'reel-stop-5': new Audio('sounds/reel_stop_5.mp3'),
      'win': new Audio('sounds/win.mp3'),
      'big-win': new Audio('sounds/big_win.mp3'),
      'bonus-trigger': new Audio('sounds/bonus_trigger.mp3'),
      'wild-appear': new Audio('sounds/wild_appear.mp3'),
      'scatter-appear': new Audio('sounds/scatter_appear.mp3')
    };
    
    // Set volume
    Object.values(this.sounds).forEach(sound => {
      sound.volume = 0.6;
    });
  }

  // Play sound effect
  playSound(name) {
    if (this.sounds[name]) {
      this.sounds[name].currentTime = 0;
      this.sounds[name].play().catch(e => console.log("Sound play error:", e));
    }
  }

  // Main spin function
  spin() {
    if (this.state.spinning) return;
    
    // Check balance
    if (!this.state.bonus.active && this.state.balance < this.state.bet) {
      this.showMessage("Not enough balance!");
      return;
    }
    
    this.prepareSpin();
    this.animatePreSpin();
    
    // Start each reel spinning with delays
    for (let i = 0; i < 5; i++) {
      this.startReelSpin(i);
    }
  }

  // Prepare for new spin
  prepareSpin() {
    this.state.spinning = true;
    this.state.currentWin = 0;
    this.clearWinEffects();
    
    // Deduct bet if not in bonus
    if (!this.state.bonus.active) {
      this.state.balance -= this.state.bet;
      this.updateBalance();
    }
    
    // Update win display
    this.winDisplay.textContent = "0";
    this.winDisplay.classList.remove('big-win');
  }

  // Animate pre-spin effects
  animatePreSpin() {
    // Button animation
    this.spinBtn.classList.add('spin-pressed');
    setTimeout(() => {
      this.spinBtn.classList.remove('spin-pressed');
    }, 300);
    
    // Dog animation
    document.querySelector('.dog').classList.add('dog-anticipate');
    setTimeout(() => {
      document.querySelector('.dog').classList.remove('dog-anticipate');
    }, 1000);
    
    // Sound
    this.playSound('spin-start');
  }

  // Start a single reel spinning
  startReelSpin(reelIndex) {
    const reel = document.getElementById(`reel-${reelIndex}`);
    const symbols = reel.querySelectorAll('.symbol');
    
    // Delay for wave effect
    const delay = this.config.reelDelays[reelIndex];
    
    setTimeout(() => {
      // Visual feedback for spinning
      reel.classList.add('reel-accelerating');
      
      // Animate each symbol
      symbols.forEach((symbol, i) => {
        this.animateSymbolSpin(symbol, reelIndex, i);
      });
      
      // Stop the reel after random duration
      setTimeout(() => {
        this.stopReel(reelIndex);
      }, 1500 + Math.random() * 500);
      
    }, delay);
  }

  // Animate symbol during spin
  animateSymbolSpin(symbol, reelIndex, posIndex) {
    // Initial state
    symbol.style.transition = 'none';
    symbol.style.transform = 'translateY(-150%)';
    symbol.classList.add('blur');
    
    // Change symbol rapidly during spin
    const spinInterval = setInterval(() => {
      const randomSymbol = this.getRandomSymbol(reelIndex);
      this.updateSymbol(symbol, randomSymbol);
    }, 100);
    
    // Clear interval when stopping
    setTimeout(() => {
      clearInterval(spinInterval);
    }, 1400 + Math.random() * 400);
  }

  // Get random symbol for reel according to weights
  getRandomSymbol(reelIndex) {
    const weights = this.config.symbols.map(s => s.weight[reelIndex]);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    let symbolIndex = 0;
    
    for (let i = 0; i < weights.length; i++) {
      if (random < weights[i]) {
        symbolIndex = i;
        break;
      }
      random -= weights[i];
    }
    
    // Increase wild chance during bonus (except reels 1 and 5)
    if (this.state.bonus.active && reelIndex > 0 && reelIndex < 4 && Math.random() < 0.3) {
      symbolIndex = 10; // Wild
    }
    
    return this.config.symbols[symbolIndex];
  }

  // Stop a specific reel
  stopReel(reelIndex) {
    const reel = document.getElementById(`reel-${reelIndex}`);
    const symbols = reel.querySelectorAll('.symbol');
    
    // Stop accelerating animation
    reel.classList.remove('reel-accelerating');
    
    // Set final symbols
    symbols.forEach((symbol, i) => {
      const newSymbol = this.getRandomSymbol(reelIndex);
      this.updateSymbol(symbol, newSymbol);
      
      // Special handling for sticky wilds in bonus
      if (this.state.bonus.active && this.state.bonus.stickyWilds.some(sw => 
          sw.reel === reelIndex && sw.pos === i)) {
        const wildSymbol = this.config.symbols.find(s => s.id === 10);
        this.updateSymbol(symbol, wildSymbol);
      }
      
      // Animate stopping with bounce
      symbol.style.transition = `transform ${0.5 + i*0.1}s cubic-bezier(0.1, 0.7, 0.1, 1.15)`;
      symbol.style.transform = 'translateY(0)';
      symbol.classList.remove('blur');
      
      // Handle stop completion
      symbol.addEventListener('transitionend', () => {
        this.onSymbolStopped(reelIndex, i);
      }, {once: true});
    });
    
    // Play stop sound
    this.playSound(`reel-stop-${reelIndex+1}`);
    
    // Mobile vibration
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }

  // Handle when a symbol has stopped
  onSymbolStopped(reelIndex, posIndex) {
    // Check if all reels have stopped
    if (this.allReelsStopped()) {
      this.evaluateSpinResult();
    }
  }

  // Check if all reels are stopped
  allReelsStopped() {
    for (let i = 0; i < 5; i++) {
      const reel = document.getElementById(`reel-${i}`);
      const symbols = reel.querySelectorAll('.symbol');
      
      for (let j = 0; j < 3; j++) {
        if (symbols[j].style.transform !== 'translateY(0)') {
          return false;
        }
      }
    }
    return true;
  }

  // Evaluate the result of a spin
  evaluateSpinResult() {
    // Small delay before evaluation
    setTimeout(() => {
      // Count scatters first
      const scatterCount = this.countScatters();
      
      // Handle scatter wins
      if (scatterCount >= 3) {
        if (this.state.bonus.active && this.config.bonus.retriggerable) {
          // Retrigger bonus spins
          const additionalSpins = this.config.bonus.freeSpins[scatterCount - 3];
          this.state.bonus.spinsLeft += additionalSpins;
          this.showMessage(`RETRIGGER! +${additionalSpins} spins`);
          this.updateBonusDisplay();
        } else if (!this.state.bonus.active) {
          // Activate bonus
          this.activateFreeSpins(scatterCount);
          return;
        }
      }
      
      // Check regular paylines
      const wins = this.checkPaylines();
      
      // Process any wins
      if (wins.total > 0) {
        this.processWin(wins);
      }
      
      // Finish spin
      this.finishSpin();
    }, 500);
  }

  // Count scatter symbols on screen
  countScatters() {
    let count = 0;
    for (let i = 0; i < 5; i++) {
      const reel = document.getElementById(`reel-${i}`);
      const symbols = reel.querySelectorAll('.symbol');
      
      for (let j = 0; j < 3; j++) {
        if (parseInt(symbols[j].dataset.symbolId) === 11) { // Scatter ID
          count++;
        }
      }
    }
    return count;
  }

  // Check all paylines for wins
  checkPaylines() {
    const result = {
      total: 0,
      lines: []
    };
    
    // Get visible symbols
    const visibleSymbols = this.getVisibleSymbols();
    
    // Check each payline
    this.config.paylines.forEach(payline => {
      const lineSymbols = payline.positions.map((row, col) => visibleSymbols[col][row]);
      const win = this.evaluatePayline(lineSymbols);
      
      if (win > 0) {
        result.total += win;
        result.lines.push({
          id: payline.id,
          symbols: lineSymbols,
          win: win,
          positions: payline.positions,
          color: payline.color
        });
      }
    });
    
    return result;
  }

  // Evaluate a single payline
  evaluatePayline(symbols) {
    // First symbol is our match target (excluding wilds)
    let targetSymbol = symbols.find(s => s.id !== 10);
    if (!targetSymbol) targetSymbol = symbols[0]; // All wilds
    
    // Count consecutive matching symbols (wilds substitute for any)
    let count = 0;
    for (let i = 0; i < symbols.length; i++) {
      if (symbols[i].id === targetSymbol.id || symbols[i].id === 10) {
        count++;
      } else {
        break;
      }
    }
    
    // Need at least 3 matching symbols
    if (count < 3) return 0;
    
    // Get payout from symbol config
    const symbolData = this.config.symbols.find(s => s.id === targetSymbol.id);
    const payout = symbolData.payout[count - 1];
    
    // Apply bet and multipliers
    let winAmount = payout * this.state.bet;
    
    // Apply wild multipliers
    const wildCount = symbols.slice(0, count).filter(s => s.id === 10).length;
    if (wildCount > 0) {
      const wildMultiplier = this.state.bonus.active ? 3 : this.getRandomMultiplier();
      winAmount *= Math.pow(wildMultiplier, wildCount);
    }
    
    // Bonus game multiplier
    if (this.state.bonus.active) {
      winAmount *= this.state.bonus.multiplier;
    }
    
    return winAmount;
  }

  // Get visible symbols on screen
  getVisibleSymbols() {
    const visibleSymbols = [];
    
    for (let i = 0; i < 5; i++) {
      const reel = document.getElementById(`reel-${i}`);
      const symbols = reel.querySelectorAll('.symbol');
      const reelSymbols = [];
      
      for (let j = 0; j < 3; j++) {
        const symbolId = parseInt(symbols[j].dataset.symbolId);
        reelSymbols.push(this.config.symbols.find(s => s.id === symbolId));
      }
      
      visibleSymbols.push(reelSymbols);
    }
    
    return visibleSymbols;
  }

  // Process win results
  processWin(winResult) {
    // Update balance
    this.state.balance += winResult.total;
    this.state.currentWin = winResult.total;
    
    // Update UI
    this.updateBalance();
    this.animateWin(winResult);
    
    // Play sound
    if (winResult.total > this.state.bet * 20) {
      this.playSound('big-win');
      this.winDisplay.classList.add('big-win');
    } else {
      this.playSound('win');
    }
    
    // Add sticky wilds in bonus mode
    if (this.state.bonus.active && this.config.bonus.stickyWilds) {
      this.addStickyWilds();
    }
  }

  // Animate winning lines
  animateWin(winResult) {
    // Update win display with counting animation
    this.animateWinCounter(winResult.total);
    
    // Highlight winning lines
    winResult.lines.forEach(line => {
      this.highlightPayline(line);
    });
    
    // Special effects for big wins
    if (winResult.total > this.state.bet * 50) {
      this.showBigWinEffect(winResult.total);
    }
  }

  // Animate the win counter
  animateWinCounter(amount) {
    const duration = 2000; // ms
    const start = 0;
    const increment = amount / (duration / 16); // 60fps
    
    const winDisplay = this.winDisplay;
    let current = start;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      current = Math.min(amount, start + (elapsed / duration) * amount);
      winDisplay.textContent = current.toFixed(2);
      
      if (current < amount) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }

  // Highlight a winning payline
  highlightPayline(line) {
    // Create line element
    const lineElement = document.createElement('div');
    lineElement.className = 'win-line';
    lineElement.style.backgroundColor = line.color;
    
    // Position the line
    // (Implementation depends on your CSS layout)
    
    // Add to DOM
    document.getElementById('paylines-container').appendChild(lineElement);
    
    // Remove after animation
    setTimeout(() => {
      lineElement.remove();
    }, 3000);
  }

  // Show big win effect
  showBigWinEffect(amount) {
    const bigWinElement = document.createElement('div');
    bigWinElement.className = 'big-win-effect';
    bigWinElement.textContent = `BIG WIN! ${amount.toFixed(2)}`;
    
    document.body.appendChild(bigWinElement);
    
    setTimeout(() => {
      bigWinElement.remove();
    }, 5000);
  }

  // Add sticky wilds during bonus
  addStickyWilds() {
    const visibleSymbols = this.getVisibleSymbols();
    
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 3; j++) {
        if (visibleSymbols[i][j].id === 10) { // Wild
          const existingIndex = this.state.bonus.stickyWilds.findIndex(
            sw => sw.reel === i && sw.pos === j
          );
          
          if (existingIndex === -1) {
            this.state.bonus.stickyWilds.push({reel: i, pos: j});
          }
        }
      }
    }
  }

  // Activate free spins bonus
  activateFreeSpins(scatterCount) {
    const spins = this.config.bonus.freeSpins[scatterCount - 3];
    
    this.state.bonus = {
      active: true,
      spinsLeft: spins,
      stickyWilds: [],
      multiplier: 1,
      totalWin: 0
    };
    
    // Show bonus activation screen
    this.showBonusActivation(spins);
    
    // Play sound
    this.playSound('bonus-trigger');
    
    // Mobile vibration
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  }

  // Show bonus activation screen
  showBonusActivation(spins) {
    const bonusScreen = document.getElementById('bonus-activation');
    const spinsDisplay = document.getElementById('bonus-spins-awarded');
    
    spinsDisplay.textContent = `${spins} FREE SPINS`;
    bonusScreen.style.display = 'flex';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      bonusScreen.style.display = 'none';
      this.updateBonusDisplay();
    }, 3000);
  }

  // Finish spin and cleanup
  finishSpin() {
    this.state.spinning = false;
    
    // Update bonus spin count
    if (this.state.bonus.active) {
      this.state.bonus.spinsLeft--;
      this.state.bonus.totalWin += this.state.currentWin;
      this.updateBonusDisplay();
      
      // Check if bonus is over
      if (this.state.bonus.spinsLeft <= 0) {
        this.finishBonus();
      }
    }
    
    // Continue autoplay if active
    if (this.state.autoplay && this.state.autoplaySpins > 0) {
      this.state.autoplaySpins--;
      
      if (this.state.autoplaySpins > 0) {
        setTimeout(() => this.spin(), 1000);
      } else {
        this.toggleAutoplay(false);
      }
    }
  }

  // Finish bonus round
  finishBonus() {
    // Show bonus summary
    this.showBonusSummary();
    
    // Reset bonus state
    this.state.bonus = {
      active: false,
      spinsLeft: 0,
      stickyWilds: [],
      multiplier: 1,
      totalWin: 0
    };
    
    // Update UI
    this.updateBonusDisplay();
  }

  // Show bonus summary screen
  showBonusSummary() {
    const bonusSummary = document.getElementById('bonus-summary');
    const totalWinDisplay = document.getElementById('bonus-total-win');
    
    totalWinDisplay.textContent = this.state.bonus.totalWin.toFixed(2);
    bonusSummary.style.display = 'flex';
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
      bonusSummary.style.display = 'none';
    }, 4000);
  }

  // Clear win highlight effects
  clearWinEffects() {
    document.querySelectorAll('.win-line').forEach(el => el.remove());
    document.querySelectorAll('.big-win-effect').forEach(el => el.remove());
  }

  // Update balance display
  updateBalance() {
    this.balanceDisplay.textContent = this.state.balance.toFixed(2);
  }

  // Update bonus display
  updateBonusDisplay() {
    const bonusDisplay = document.getElementById('bonus-display');
    
    if (this.state.bonus.active) {
      bonusDisplay.style.display = 'block';
      document.getElementById('bonus-spins-count').textContent = this.state.bonus.spinsLeft;
      document.getElementById('bonus-total').textContent = this.state.bonus.totalWin.toFixed(2);
      
      // Add bonus class to reels
      document.getElementById('reels').classList.add('bonus-active');
    } else {
      bonusDisplay.style.display = 'none';
      document.getElementById('reels').classList.remove('bonus-active');
    }
  }

  // Increase bet amount
  increaseBet() {
    const currentIndex = this.config.betOptions.indexOf(this.state.bet);
    if (currentIndex < this.config.betOptions.length - 1) {
      this.state.bet = this.config.betOptions[currentIndex + 1];
      this.updateBetDisplay();
      this.playSound('bet-change');
    }
  }

  // Decrease bet amount
  decreaseBet() {
    const currentIndex = this.config.betOptions.indexOf(this.state.bet);
    if (currentIndex > 0) {
      this.state.bet = this.config.betOptions[currentIndex - 1];
      this.updateBetDisplay();
      this.playSound('bet-change');
    }
  }

  // Update bet display
  updateBetDisplay() {
    this.betDisplay.textContent = this.state.bet.toFixed(2);
  }

  // Toggle autoplay
  toggleAutoplay(enable = !this.state.autoplay) {
    this.state.autoplay = enable;
    
    if (enable) {
      this.state.autoplaySpins = 10; // Default 10 spins
      this.autoplayBtn.classList.add('active');
      this.spin(); // Start spinning
    } else {
      this.state.autoplaySpins = 0;
      this.autoplayBtn.classList.remove('active');
    }
  }

  // Show paytable
  showPaytable() {
    const paytable = document.getElementById('paytable');
    paytable.style.display = 'block';
    
    // Populate paytable
    const paytableContent = document.getElementById('paytable-content');
    paytableContent.innerHTML = '';
    
    // Add symbols and payouts
    this.config.symbols.forEach(symbol => {
      if (symbol.payout.some(p => p > 0)) {
        const row = document.createElement('tr');
        
        const symbolCell = document.createElement('td');
        symbolCell.innerHTML = `<div class="symbol-paytable" style="color:${symbol.color}">${symbol.emoji}</div>`;
        
        const nameCell = document.createElement('td');
        nameCell.textContent = symbol.name;
        
        // Add payout cells
        const payout3 = document.createElement('td');
        payout3.textContent = symbol.payout[2] > 0 ? symbol.payout[2] + 'x' : '-';
        
        const payout4 = document.createElement('td');
        payout4.textContent = symbol.payout[3] > 0 ? symbol.payout[3] + 'x' : '-';
        
        const payout5 = document.createElement('td');
        payout5.textContent = symbol.payout[4] > 0 ? symbol.payout[4] + 'x' : '-';
        
        row.appendChild(symbolCell);
        row.appendChild(nameCell);
        row.appendChild(payout3);
        row.appendChild(payout4);
        row.appendChild(payout5);
        
        paytableContent.appendChild(row);
      }
    });
  }

  // Show message to player
  showMessage(text) {
    const message = document.createElement('div');
    message.className = 'game-message';
    message.textContent = text;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.remove();
    }, 3000);
  }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const game = new DogHouseSlot();
  
  // Make game available globally for debugging
  window.game = game;
});
