// Game configuration
const config = {
    symbols: ['9', '10', 'j', 'q', 'k', 'a', 'collar', 'bone', 'bowl', 'doghouse', 'wild', 'scatter'],
    symbolWeights: {
        reel1: [15, 12, 10, 8, 7, 6, 5, 4, 3, 2, 0, 10],
        reel2: [12, 10, 8, 7, 6, 5, 4, 3, 2, 1, 5, 8],
        reel3: [10, 8, 7, 6, 5, 4, 3, 2, 1, 1, 6, 8],
        reel4: [12, 10, 8, 7, 6, 5, 4, 3, 2, 1, 5, 8],
        reel5: [15, 12, 10, 8, 7, 6, 5, 4, 3, 2, 0, 10]
    },
    paytable: {
        '9': [0.2, 0.5, 1.0],
        '10': [0.3, 0.7, 1.5],
        'j': [0.4, 0.9, 2.0],
        'q': [0.5, 1.2, 2.5],
        'k': [0.7, 1.5, 3.0],
        'a': [0.9, 2.0, 4.0],
        'collar': [1.5, 3.0, 6.0],
        'bone': [2.0, 5.0, 10.0],
        'bowl': [3.0, 8.0, 15.0],
        'doghouse': [5.0, 12.0, 25.0],
        'wild': [1.0, 2.5, 5.0]
    },
    scatterPays: {
        3: 5,
        4: 20,
        5: 100
    },
    freeSpins: {
        3: 12,
        4: 20,
        5: 50
    },
    betSteps: [0.2, 0.5, 1, 2, 5, 10, 20, 50, 100],
    startingBalance: 1000,
    reelDelay: 100, // ms between reels starting to spin
    reelStopDelay: 300, // ms between reels stopping
    spinDuration: 3000, // ms for full spin
    symbolHeight: 120, // px
    visibleSymbols: 3,
    paylines: [
        [1, 1, 1, 1, 1], // Line 1: middle row
        [0, 0, 0, 0, 0], // Line 2: top row
        [2, 2, 2, 2, 2], // Line 3: bottom row
        [0, 1, 2, 1, 0], // Line 4: V shape
        [2, 1, 0, 1, 2], // Line 5: A shape
        [0, 0, 1, 2, 2], // Line 6
        [2, 2, 1, 0, 0], // Line 7
        [1, 0, 0, 0, 1], // Line 8
        [1, 2, 2, 2, 1], // Line 9
        [0, 1, 1, 1, 0], // Line 10
        [2, 1, 1, 1, 2], // Line 11
        [1, 2, 1, 2, 1], // Line 12
        [1, 0, 1, 0, 1], // Line 13
        [0, 1, 0, 1, 0], // Line 14
        [2, 1, 2, 1, 2], // Line 15
        [1, 1, 2, 1, 1], // Line 16
        [1, 1, 0, 1, 1], // Line 17
        [0, 1, 2, 1, 0], // Line 18
        [2, 1, 0, 1, 2], // Line 19
        [1, 0, 2, 0, 1]  // Line 20
    ]
};

// Game state
const state = {
    balance: config.startingBalance,
    bet: 1,
    win: 0,
    spinning: false,
    freeSpins: 0,
    freeSpinsTotal: 0,
    freeSpinsMultiplier: 1,
    stickyWilds: [],
    autoSpins: 0,
    autoSpinStopOnWin: 0,
    autoSpinStopOnLoss: 0,
    soundEnabled: true,
    currentReels: [[], [], [], [], []],
    reelElements: [],
    reelAnimations: []
};

// DOM elements
const elements = {
    balance: document.getElementById('balance'),
    bet: document.getElementById('bet'),
    win: document.getElementById('win'),
    spinBtn: document.getElementById('spin-btn'),
    autoBtn: document.getElementById('auto-btn'),
    autoMenu: document.getElementById('auto-menu'),
    betDown: document.getElementById('bet-down'),
    betUp: document.getElementById('bet-up'),
    betSlider: document.getElementById('bet-slider'),
    paytableBtn: document.getElementById('paytable-btn'),
    paytableModal: document.getElementById('paytable-modal'),
    soundBtn: document.getElementById('sound-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    fsIntroModal: document.getElementById('fs-intro-modal'),
    startFsBtn: document.getElementById('start-fs-btn'),
    fsCount: document.getElementById('fs-count'),
    bowlModal: document.getElementById('bowl-modal'),
    gameMessage: document.getElementById('game-message'),
    reels: document.querySelector('.reels'),
    reel1: document.getElementById('reel1'),
    reel2: document.getElementById('reel2'),
    reel3: document.getElementById('reel3'),
    reel4: document.getElementById('reel4'),
    reel5: document.getElementById('reel5'),
    paylinesOverlay: document.querySelector('.paylines-overlay'),
    winningElements: document.querySelector('.winning-elements')
};

// Audio elements
const audio = {
    reelSpin: document.getElementById('reel-spin'),
    reelStop: document.getElementById('reel-stop'),
    winSound: document.getElementById('win-sound'),
    bigWinSound: document.getElementById('big-win-sound'),
    scatterSound: document.getElementById('scatter-sound'),
    wildSound: document.getElementById('wild-sound'),
    bgMusic: document.getElementById('bg-music'),
    fsMusic: document.getElementById('fs-music'),
    bonusSound: document.getElementById('bonus-sound'),
    buttonSound: document.getElementById('button-sound')
};

// Initialize the game
function init() {
    // Set up reel elements
    elements.reelElements = [elements.reel1, elements.reel2, elements.reel3, elements.reel4, elements.reel5];
    
    // Generate initial reels
    for (let i = 0; i < 5; i++) {
        generateReel(i);
    }
    
    // Update UI
    updateUI();
    
    // Event listeners
    elements.spinBtn.addEventListener('click', handleSpin);
    elements.autoBtn.addEventListener('click', toggleAutoMenu);
    elements.betDown.addEventListener('click', () => changeBet(-1));
    elements.betUp.addEventListener('click', () => changeBet(1));
    elements.betSlider.addEventListener('input', handleBetSlider);
    elements.paytableBtn.addEventListener('click', () => toggleModal(elements.paytableModal));
    elements.soundBtn.addEventListener('click', toggleSound);
    elements.startFsBtn.addEventListener('click', startFreeSpins);
    elements.settingsBtn.addEventListener('click', showSettings);
    
    // Auto spin options
    document.querySelectorAll('.auto-option').forEach(option => {
        option.addEventListener('click', () => selectAutoOption(option));
    });
    
    // Bowl selection
    document.querySelectorAll('.bowl').forEach(bowl => {
        bowl.addEventListener('click', () => selectBowl(bowl));
    });
    
    // Close modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('show');
            });
        });
    });
    
    // Play background music
    if (state.soundEnabled) {
        audio.bgMusic.volume = 0.3;
        audio.bgMusic.play().catch(e => console.log('Autoplay prevented:', e));
    }
    
    // Enable swipe for mobile
    setupSwipe();
}

// Generate symbols for a reel
function generateReel(reelIndex) {
    const reelName = `reel${reelIndex + 1}`;
    const weights = config.symbolWeights[reelName];
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    // Generate 20 symbols for smooth looping
    const reelSymbols = [];
    for (let i = 0; i < 20; i++) {
        let random = Math.random() * totalWeight;
        let symbolIndex = 0;
        
        while (random > weights[symbolIndex]) {
            random -= weights[symbolIndex];
            symbolIndex++;
        }
        
        reelSymbols.push(config.symbols[symbolIndex]);
    }
    
    state.currentReels[reelIndex] = reelSymbols;
    renderReel(reelIndex);
}

// Render reel symbols in DOM
function renderReel(reelIndex) {
    const reelElement = elements.reelElements[reelIndex];
    reelElement.innerHTML = '';
    
    // Create 3 visible symbols + 2 extra for animation
    for (let i = 0; i < config.visibleSymbols + 2; i++) {
        const symbolIndex = i % state.currentReels[reelIndex].length;
        const symbol = state.currentReels[reelIndex][symbolIndex];
        
        const symbolElement = document.createElement('div');
        symbolElement.className = `reel-symbol symbol symbol-${symbol}`;
        symbolElement.dataset.symbol = symbol;
        symbolElement.style.transform = `translateY(${i * config.symbolHeight}px)`;
        
        reelElement.appendChild(symbolElement);
    }
}

// Handle spin button click
function handleSpin() {
    if (state.spinning) return;
    
    // Play button sound
    playSound(audio.buttonSound);
    
    // Check balance
    if (state.balance < state.bet) {
        showMessage('Not enough balance!');
        return;
    }
    
    // Deduct bet from balance
    state.balance -= state.bet;
    state.win = 0;
    updateUI();
    
    // Start spinning
    state.spinning = true;
    elements.spinBtn.classList.add('spinning');
    
    // Play spin sound
    playSound(audio.reelSpin);
    
    // Clear any sticky wilds if not in free spins
    if (state.freeSpins === 0) {
        state.stickyWilds = [];
    }
    
    // Clear previous win highlights
    clearWins();
    
    // Start spinning each reel with a delay
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            spinReel(i);
        }, i * config.reelDelay);
    }
    
    // Stop reels after spin duration
    setTimeout(() => {
        stopReels();
    }, config.spinDuration);
}

// Spin a single reel
function spinReel(reelIndex) {
    const reelElement = elements.reelElements[reelIndex];
    const symbols = reelElement.querySelectorAll('.reel-symbol');
    
    // Cancel any existing animation
    if (state.reelAnimations[reelIndex]) {
        state.reelAnimations[reelIndex].cancel();
    }
    
    // Create new animation
    const animation = reelElement.animate([
        { transform: 'translateY(0)' },
        { transform: `translateY(-${config.symbolHeight * 20}px)` }
    ], {
        duration: config.spinDuration,
        iterations: Infinity,
        easing: 'linear'
    });
    
    state.reelAnimations[reelIndex] = animation;
}

// Stop all reels
function stopReels() {
    // Determine stop order: 1 → 5 → 2 → 4 → 3
    const stopOrder = [0, 4, 1, 3, 2];
    let stopDelay = 0;
    
    stopOrder.forEach((reelIndex, i) => {
        setTimeout(() => {
            stopReel(reelIndex);
            
            // Play stop sound with increasing pitch
            playSound(audio.reelStop, 0.7 + i * 0.1);
            
            // On last reel, evaluate results
            if (i === stopOrder.length - 1) {
                setTimeout(() => {
                    evaluateResults();
                }, 500);
            }
        }, stopDelay);
        
        stopDelay += config.reelStopDelay;
    });
}

// Stop a single reel
function stopReel(reelIndex) {
    const reelElement = elements.reelElements[reelIndex];
    const animation = state.reelAnimations[reelIndex];
    
    // Cancel the infinite spin animation
    if (animation) {
        animation.cancel();
    }
    
    // Generate new symbols for the reel (except sticky wild positions)
    const newReel = [];
    const weights = config.symbolWeights[`reel${reelIndex + 1}`];
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    for (let i = 0; i < 20; i++) {
        // Check if this position has a sticky wild
        const stickyWild = state.stickyWilds.find(w => w.reel === reelIndex && w.position === i % 3);
        if (stickyWild) {
            newReel.push('wild');
            continue;
        }
        
        // Otherwise generate random symbol
        let random = Math.random() * totalWeight;
        let symbolIndex = 0;
        
        while (random > weights[symbolIndex]) {
            random -= weights[symbolIndex];
            symbolIndex++;
        }
        
        newReel.push(config.symbols[symbolIndex]);
    }
    
    state.currentReels[reelIndex] = newReel;
    
    // Animate reel to stop position with bounce effect
    const symbols = reelElement.querySelectorAll('.reel-symbol');
    const finalPosition = -(Math.floor(Math.random() * 20) * config.symbolHeight);
    
    const stopAnimation = reelElement.animate([
        { transform: `translateY(${reelElement.style.transform ? 
            parseInt(reelElement.style.transform.split('(')[1]) : 0}px)` },
        { transform: `translateY(${finalPosition - 30}px)` },
        { transform: `translateY(${finalPosition}px)` }
    ], {
        duration: 800,
        easing: 'cubic-bezier(0.1, 0.7, 0.1, 1)'
    });
    
    stopAnimation.onfinish = () => {
        reelElement.style.transform = `translateY(${finalPosition}px)`;
        renderReel(reelIndex);
    };
    
    // Mobile vibration
    if ('vibrate' in navigator) {
        navigator.vibrate(50);
    }
}

// Evaluate spin results
function evaluateResults() {
    // Get visible symbols
    const visibleSymbols = getVisibleSymbols();
    
    // Check for scatter wins
    const scatterWin = checkScatterWin(visibleSymbols);
    
    // Check for payline wins
    const lineWins = checkPaylineWins(visibleSymbols);
    
    // Calculate total win
    let totalWin = scatterWin;
    lineWins.forEach(win => {
        totalWin += win.amount;
    });
    
    // Apply free spins multiplier if in free spins
    if (state.freeSpins > 0) {
        totalWin *= state.freeSpinsMultiplier;
        state.freeSpinsMultiplier = 1; // Reset after applying
    }
    
    // Update win and balance
    state.win = totalWin;
    state.balance += totalWin;
    
    // Update UI
    updateUI();
    
    // Highlight winning symbols and lines
    highlightWins(lineWins, visibleSymbols);
    
    // Handle big wins
    if (totalWin >= state.bet * 50) {
        showMessage(totalWin >= state.bet * 200 ? 'MEGA WIN!' : 
                   totalWin >= state.bet * 100 ? 'BIG WIN!' : 'NICE WIN!');
        
        // Play big win sound
        playSound(audio.bigWinSound);
        
        // Show celebration
        celebrateWin(totalWin);
    } else if (totalWin > 0) {
        // Play regular win sound
        playSound(audio.winSound);
    }
    
    // Handle scatter triggers (free spins)
    if (scatterWin > 0) {
        const scatterCount = countScatters(visibleSymbols);
        if (scatterCount >= 3) {
            // Check if we're already in free spins (for retrigger)
            if (state.freeSpins > 0) {
                // 50/50 chance for retrigger or pick a bowl
                if (Math.random() < 0.5) {
                    const additionalSpins = config.freeSpins[scatterCount];
                    state.freeSpins += additionalSpins;
                    state.freeSpinsTotal += additionalSpins;
                    showMessage(`+${additionalSpins} FREE SPINS!`);
                } else {
                    showPickABowl();
                }
            } else {
                // Start new free spins
                state.freeSpins = config.freeSpins[scatterCount];
                state.freeSpinsTotal = state.freeSpins;
                showFreeSpinsIntro();
            }
        }
    }
    
    // End of spin
    state.spinning = false;
    elements.spinBtn.classList.remove('spinning');
    
    // Stop spin sound
    audio.reelSpin.pause();
    audio.reelSpin.currentTime = 0;
    
    // Handle auto spins
    if (state.autoSpins > 0 || state.autoSpinStopOnWin > 0 || state.autoSpinStopOnLoss > 0) {
        handleAutoSpin();
    }
}

// Get visible symbols from reels
function getVisibleSymbols() {
    const visibleSymbols = [];
    
    for (let reelIndex = 0; reelIndex < 5; reelIndex++) {
        const reelElement = elements.reelElements[reelIndex];
        const transformY = parseInt(reelElement.style.transform?.split('(')[1]) || 0;
        const centerSymbolPos = Math.round(-transformY / config.symbolHeight) % state.currentReels[reelIndex].length;
        
        // Get 3 visible symbols (top, center, bottom)
        const symbols = [];
        for (let i = -1; i <= 1; i++) {
            let pos = centerSymbolPos + i;
            if (pos < 0) pos += state.currentReels[reelIndex].length;
            if (pos >= state.currentReels[reelIndex].length) pos -= state.currentReels[reelIndex].length;
            
            symbols.push({
                symbol: state.currentReels[reelIndex][pos],
                position: i + 1 // 0=top, 1=center, 2=bottom
            });
        }
        
        visibleSymbols.push(symbols);
    }
    
    return visibleSymbols;
}

// Check for scatter wins
function checkScatterWin(visibleSymbols) {
    let scatterCount = 0;
    
    // Count scatters on all reels
    visibleSymbols.forEach(reel => {
        reel.forEach(symbol => {
            if (symbol.symbol === 'scatter') {
                scatterCount++;
            }
        });
    });
    
    // Check if enough scatters for win
    if (scatterCount >= 3) {
        const winAmount = config.scatterPays[scatterCount] * state.bet;
        
        // Play scatter sound
        playSound(audio.scatterSound);
        
        return winAmount;
    }
    
    return 0;
}

// Count scatter symbols
function countScatters(visibleSymbols) {
    let count = 0;
    
    visibleSymbols.forEach(reel => {
        reel.forEach(symbol => {
            if (symbol.symbol === 'scatter') {
                count++;
            }
        });
    });
    
    return count;
}

// Check for payline wins
function checkPaylineWins(visibleSymbols) {
    const wins = [];
    
    config.paylines.forEach((line, lineIndex) => {
        // Get symbols on this payline
        const lineSymbols = [];
        for (let reelIndex = 0; reelIndex < 5; reelIndex++) {
            const row = line[reelIndex];
            lineSymbols.push(visibleSymbols[reelIndex][row].symbol);
        }
        
        // Check for wilds and count consecutive matching symbols from left
        let firstSymbol = null;
        let count = 0;
        let wildMultiplier = 1;
        
        for (let i = 0; i < lineSymbols.length; i++) {
            const symbol = lineSymbols[i];
            
            if (symbol === 'wild') {
                // Wild can substitute for any symbol (except scatter)
                count++;
                
                // Check if wild has a multiplier (50% x2, 50% x3 in base game)
                if (state.freeSpins === 0 && Math.random() < 0.5) {
                    wildMultiplier *= 2;
                } else {
                    wildMultiplier *= 3;
                }
            } 
            else if (symbol === firstSymbol || (firstSymbol === null && symbol !== 'scatter')) {
                firstSymbol = firstSymbol || symbol;
                count++;
            } 
            else if (symbol !== 'scatter' && firstSymbol !== null) {
                // No more matching symbols
                break;
            }
        }
        
        // Check if we have a winning combination (3+ symbols)
        if (count >= 3 && firstSymbol && firstSymbol !== 'scatter') {
            const paytable = config.paytable[firstSymbol];
            const winMultiplier = paytable[count - 3];
            let winAmount = winMultiplier * state.bet;
            
            // Apply wild multipliers in free spins
            if (state.freeSpins > 0) {
                winAmount *= wildMultiplier;
            }
            
            // Add sticky wilds for free spins
            if (state.freeSpins > 0) {
                for (let i = 0; i < count; i++) {
                    const reelIndex = i;
                    const row = line[reelIndex];
                    
                    if (lineSymbols[i] === 'wild') {
                        // Check if wild is not already sticky
                        const existingWild = state.stickyWilds.find(w => 
                            w.reel === reelIndex && w.position === row);
                        
                        if (!existingWild) {
                            state.stickyWilds.push({
                                reel: reelIndex,
                                position: row
                            });
                        }
                    }
                }
            }
            
            wins.push({
                line: lineIndex + 1,
                symbol: firstSymbol,
                count: count,
                amount: winAmount,
                wildMultiplier: wildMultiplier,
                positions: line.map((row, reelIndex) => ({
                    reel: reelIndex,
                    row: row
                })).slice(0, count)
            });
        }
    });
    
    return wins;
}

// Highlight winning symbols and paylines
function highlightWins(lineWins, visibleSymbols) {
    // Highlight winning symbols
    lineWins.forEach(win => {
        win.positions.forEach(pos => {
            const reelElement = elements.reelElements[pos.reel];
            const symbolElement = reelElement.querySelectorAll('.reel-symbol')[pos.row];
            symbolElement.classList.add('winning');
            
            // Special effect for wild symbols
            if (visibleSymbols[pos.reel][pos.row].symbol === 'wild') {
                symbolElement.style.animation = 'wild-pulse 0.5s infinite';
                playSound(audio.wildSound);
            }
        });
    });
    
    // Highlight winning paylines
    lineWins.forEach(win => {
        const paylineElement = document.querySelector(`#payline${win.line}`);
        paylineElement.classList.add('active');
        
        // Remove highlight after delay
        setTimeout(() => {
            paylineElement.classList.remove('active');
        }, 3000);
    });
    
    // Add light beams for big wins
    if (state.win >= state.bet * 20) {
        elements.winningElements.querySelector('.light-beam.horizontal').style.opacity = '0.7';
        elements.winningElements.querySelector('.light-beam.vertical').style.opacity = '0.7';
        
        setTimeout(() => {
            elements.winningElements.querySelector('.light-beam.horizontal').style.opacity = '0';
            elements.winningElements.querySelector('.light-beam.vertical').style.opacity = '0';
        }, 1000);
    }
}

// Clear previous win highlights
function clearWins() {
    // Clear winning symbols
    document.querySelectorAll('.reel-symbol.winning').forEach(symbol => {
        symbol.classList.remove('winning');
        symbol.style.animation = '';
    });
    
    // Clear active paylines
    document.querySelectorAll('.payline.active').forEach(line => {
        line.classList.remove('active');
    });
    
    // Clear light beams
    elements.winningElements.querySelector('.light-beam.horizontal').style.opacity = '0';
    elements.winningElements.querySelector('.light-beam.vertical').style.opacity = '0';
    
    // Clear sparkles
    elements.winningElements.querySelector('.sparkles-container').innerHTML = '';
}

// Celebrate big wins
function celebrateWin(winAmount) {
    // Add confetti/sparkles
    const sparklesContainer = elements.winningElements.querySelector('.sparkles-container');
    const sparkleCount = Math.min(50, Math.floor(winAmount / state.bet));
    
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = `${Math.random() * 100}%`;
        sparkle.style.animationDelay = `${Math.random() * 2}s`;
        sparkle.style.backgroundColor = `hsl(${Math.random() * 60 + 30}, 100%, 50%)`;
        sparklesContainer.appendChild(sparkle);
        
        // Remove after animation
        setTimeout(() => {
            sparkle.remove();
        }, 1000);
    }
    
    // Animate dogs for very big wins
    if (winAmount >= state.bet * 100) {
        document.querySelectorAll('.dog').forEach(dog => {
            dog.classList.remove('sleeping');
            dog.classList.add('awake');
            dog.style.animation = 'bark 0.5s infinite';
        });
        
        setTimeout(() => {
            document.querySelectorAll('.dog').forEach(dog => {
                dog.classList.remove('awake');
                dog.classList.add('sleeping');
                dog.style.animation = '';
            });
        }, 3000);
    }
}

// Show free spins intro modal
function showFreeSpinsIntro() {
    elements.fsCount.textContent = state.freeSpins;
    toggleModal(elements.fsIntroModal);
    
    // Play bonus sound
    playSound(audio.bonusSound);
    
    // Switch to free spins music
    if (state.soundEnabled) {
        audio.bgMusic.pause();
        audio.fsMusic.volume = 0.3;
        audio.fsMusic.play().catch(e => console.log('Autoplay prevented:', e));
    }
}

// Start free spins
function startFreeSpins() {
    toggleModal(elements.fsIntroModal);
    handleSpin();
}

// Show Pick a Bowl bonus
function showPickABowl() {
    toggleModal(elements.bowlModal);
    playSound(audio.bonusSound);
}

// Handle bowl selection
function selectBowl(bowl) {
    if (bowl.classList.contains('flipped')) return;
    
    // Determine multiplier based on probabilities
    const rand = Math.random();
    let multiplier;
    
    if (rand < 0.6) multiplier = 2;
    else if (rand < 0.85) multiplier = 3;
    else if (rand < 0.95) multiplier = 5;
    else multiplier = 10;
    
    // Set multiplier on bowl
    bowl.dataset.multiplier = multiplier;
    bowl.classList.add('flipped');
    
    // Show multiplier after animation
    setTimeout(() => {
        bowl.classList.add(`multiplier-${multiplier}`);
        bowl.querySelector('.bowl-bottom').textContent = `x${multiplier}`;
        
        // Apply multiplier to next spin
        state.freeSpinsMultiplier = multiplier;
        
        // Special effects for big multipliers
        if (multiplier >= 5) {
            showMessage(`NEXT SPIN x${multiplier} MULTIPLIER!`);
            
            // Animate dogs
            document.querySelectorAll('.dog').forEach(dog => {
                dog.classList.remove('sleeping');
                dog.classList.add('awake');
            });
            
            setTimeout(() => {
                document.querySelectorAll('.dog').forEach(dog => {
                    dog.classList.remove('awake');
                    dog.classList.add('sleeping');
                });
            }, 2000);
        }
        
        // Close modal after delay
        setTimeout(() => {
            toggleModal(elements.bowlModal);
            handleSpin();
        }, 1500);
    }, 600);
}

// Handle auto spin
function handleAutoSpin() {
    if (state.autoSpinStopOnWin > 0 && state.win >= state.autoSpinStopOnWin) {
        // Stop on win condition met
        state.autoSpins = 0;
        state.autoSpinStopOnWin = 0;
        showMessage('Auto Spin stopped: Big win!');
    } 
    else if (state.autoSpinStopOnLoss > 0 && 
             state.balance < config.startingBalance * (1 - state.autoSpinStopOnLoss / 100)) {
        // Stop on loss condition met
        state.autoSpins = 0;
        state.autoSpinStopOnLoss = 0;
        showMessage('Auto Spin stopped: Balance decreased!');
    } 
    else if (state.autoSpins > 0) {
        // Continue auto spinning
        state.autoSpins--;
        
        // Small delay before next spin
        setTimeout(() => {
            if (!state.spinning) {
                handleSpin();
            }
        }, 1000);
    }
}

// Toggle auto spin menu
function toggleAutoMenu() {
    elements.autoMenu.classList.toggle('show');
    playSound(audio.buttonSound);
}

// Select auto spin option
function selectAutoOption(option) {
    const spins = parseInt(option.dataset.spins) || 0;
    const stopOnWin = parseInt(option.dataset.stopOnWin) || 0;
    const stopOnLoss = parseInt(option.dataset.stopOnLoss) || 0;
    
    state.autoSpins = spins;
    state.autoSpinStopOnWin = stopOnWin;
    state.autoSpinStopOnLoss = stopOnLoss;
    
    elements.autoMenu.classList.remove('show');
    
    if (spins > 0) {
        showMessage(`Auto Spin: ${spins} spins`);
    } else if (stopOnWin > 0) {
        showMessage(`Auto Spin: Stop on win >${stopOnWin}x`);
    } else if (stopOnLoss > 0) {
        showMessage(`Auto Spin: Stop if balance decreases by ${stopOnLoss}%`);
    }
    
    // Start auto spin if not already spinning
    if (!state.spinning) {
        handleSpin();
    }
}

// Change bet amount
function changeBet(step) {
    const currentIndex = config.betSteps.indexOf(state.bet);
    let newIndex = currentIndex + step;
    
    // Clamp to valid range
    newIndex = Math.max(0, Math.min(newIndex, config.betSteps.length - 1));
    
    if (newIndex !== currentIndex) {
        state.bet = config.betSteps[newIndex];
        elements.betSlider.value = state.bet;
        updateUI();
        playSound(audio.buttonSound);
    }
}

// Handle bet slider change
function handleBetSlider() {
    const value = parseFloat(elements.betSlider.value);
    
    // Find closest bet step
    let closest = config.betSteps[0];
    let minDiff = Math.abs(value - closest);
    
    for (let i = 1; i < config.betSteps.length; i++) {
        const diff = Math.abs(value - config.betSteps[i]);
        if (diff < minDiff) {
            minDiff = diff;
            closest = config.betSteps[i];
        }
    }
    
    state.bet = closest;
    elements.betSlider.value = state.bet;
    updateUI();
}

// Toggle sound on/off
function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    elements.soundBtn.textContent = `SOUND: ${state.soundEnabled ? 'ON' : 'OFF'}`;
    
    if (state.soundEnabled) {
        // Resume appropriate music
        if (state.freeSpins > 0) {
            audio.fsMusic.play().catch(e => console.log('Autoplay prevented:', e));
        } else {
            audio.bgMusic.play().catch(e => console.log('Autoplay prevented:', e));
        }
    } else {
        // Pause all audio
        audio.bgMusic.pause();
        audio.fsMusic.pause();
        audio.reelSpin.pause();
    }
    
    playSound(audio.buttonSound);
}

// Show settings
function showSettings() {
    // In a real implementation, this would show a settings modal
    playSound(audio.buttonSound);
    showMessage('Settings coming soon!');
}

// Toggle modal visibility
function toggleModal(modal) {
    modal.classList.toggle('show');
    playSound(audio.buttonSound);
}

// Show temporary message
function showMessage(text) {
    elements.gameMessage.textContent = text;
    elements.gameMessage.classList.add('show');
    
    setTimeout(() => {
        elements.gameMessage.classList.remove('show');
    }, 3000);
}

// Play sound if enabled
function playSound(audioElement, rate = 1) {
    if (state.soundEnabled) {
        audioElement.currentTime = 0;
        audioElement.playbackRate = rate;
        audioElement.play().catch(e => console.log('Audio play prevented:', e));
    }
}

// Update UI elements
function updateUI() {
    elements.balance.textContent = state.balance.toFixed(2);
    elements.bet.textContent = state.bet.toFixed(2);
    elements.win.textContent = state.win.toFixed(2);
    
    // Update spin button text if in free spins
    if (state.freeSpins > 0) {
        elements.spinBtn.querySelector('.spin-text').textContent = `FREE SPINS (${state.freeSpins})`;
    } else {
        elements.spinBtn.querySelector('.spin-text').textContent = 'SPIN';
    }
    
    // Disable buttons if spinning
    const disabled = state.spinning;
    elements.spinBtn.disabled = disabled;
    elements.autoBtn.disabled = disabled;
    elements.betDown.disabled = disabled;
    elements.betUp.disabled = disabled;
    elements.betSlider.disabled = disabled;
}

// Set up swipe controls for mobile
function setupSwipe() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, false);
    
    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, false);
    
    function handleSwipe() {
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        
        // Check if it's mostly horizontal (not a scroll)
        if (Math.abs(dx) > Math.abs(dy) {
            if (dx > 50) {
                // Swipe right - increase bet
                changeBet(1);
            } else if (dx < -50) {
                // Swipe left - decrease bet
                changeBet(-1);
            }
        } else if (dy < -50) {
            // Swipe up - spin
            if (!state.spinning) {
                handleSpin();
            }
        }
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
