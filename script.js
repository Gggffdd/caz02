// Game configuration
const config = {
    symbols: ['9', '10', 'j', 'q', 'k', 'a', 'collar', 'bone', 'bowl', 'doghouse', 'wild', 'scatter'],
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
    reelDelay: 100,
    reelStopDelay: 300,
    spinDuration: 3000,
    symbolHeight: 120,
    visibleSymbols: 3,
    paylines: [
        [1, 1, 1, 1, 1], // Line 1: middle row
        [0, 0, 0, 0, 0], // Line 2: top row
        [2, 2, 2, 2, 2], // Line 3: bottom row
        [1, 0, 0, 0, 1], // Line 4: V pattern
        [1, 2, 2, 2, 1]  // Line 5: A pattern
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
    reelAnimations: [],
    user_id: 'default'
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
    resetBtn: document.getElementById('reset-btn'),
    fsIntroModal: document.getElementById('fs-intro-modal'),
    startFsBtn: document.getElementById('start-fs-btn'),
    fsCount: document.getElementById('fs-count'),
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
    
    // Load game state from server
    fetchState();
    
    // Event listeners
    elements.spinBtn.addEventListener('click', handleSpin);
    elements.autoBtn.addEventListener('click', toggleAutoMenu);
    elements.betDown.addEventListener('click', () => changeBet(-1));
    elements.betUp.addEventListener('click', () => changeBet(1));
    elements.betSlider.addEventListener('input', handleBetSlider);
    elements.paytableBtn.addEventListener('click', () => toggleModal(elements.paytableModal));
    elements.soundBtn.addEventListener('click', toggleSound);
    elements.resetBtn.addEventListener('click', resetGame);
    elements.startFsBtn.addEventListener('click', startFreeSpins);
    
    // Auto spin options
    document.querySelectorAll('.auto-option').forEach(option => {
        option.addEventListener('click', () => selectAutoOption(option));
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

// Fetch game state from server
function fetchState() {
    fetch(`/api/state?user_id=${state.user_id}`)
        .then(response => response.json())
        .then(data => {
            state.balance = data.balance;
            state.bet = data.bet;
            state.freeSpins = data.freeSpins;
            updateUI();
        })
        .catch(error => {
            console.error('Error fetching state:', error);
        });
}

// Generate symbols for a reel
function generateReel(reelIndex) {
    // For demo purposes, generate random symbols
    const reelSymbols = [];
    for (let i = 0; i < 20; i++) {
        reelSymbols.push(config.symbols[Math.floor(Math.random() * config.symbols.length)]);
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
        symbolElement.className = 'reel-symbol';
        
        const img = document.createElement('img');
        img.src = `/symbols/${symbol}.png`;
        img.alt = symbol;
        img.className = 'symbol-img';
        symbolElement.appendChild(img);
        
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
    
    // Start spinning animation
    state.spinning = true;
    elements.spinBtn.classList.add('spinning');
    playSound(audio.reelSpin);
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
            playSound(audio.reelStop, 0.7 + i * 0.1);
            
            // On last reel, evaluate results
            if (i === stopOrder.length - 1) {
                setTimeout(() => {
                    sendSpinRequest();
                }, 500);
            }
        }, stopDelay);
        
        stopDelay += config.reelStopDelay;
    });
}

// Send spin request to server
function sendSpinRequest() {
    fetch('/api/spin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: state.user_id
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showMessage(data.error);
            state.spinning = false;
            elements.spinBtn.classList.remove('spinning');
            audio.reelSpin.pause();
            return;
        }
        
        // Update game state
        state.balance = data.balance;
        state.win = data.win;
        state.freeSpins = data.freeSpins;
        
        // Update visible symbols
        data.symbols.forEach((reelSymbols, reelIndex) => {
            state.currentReels[reelIndex] = reelSymbols;
            renderReel(reelIndex);
        });
        
        // Process win
        processWin(data);
    })
    .catch(error => {
        console.error('Error:', error);
        state.spinning = false;
        elements.spinBtn.classList.remove('spinning');
        audio.reelSpin.pause();
    });
}

// Process win results
function processWin(data) {
    // Update UI
    updateUI();
    
    // Highlight wins
    if (data.win > 0) {
        highlightWins();
        
        if (data.win >= state.bet * 50) {
            showMessage(data.win >= state.bet * 200 ? 'MEGA WIN!' : 
                       data.win >= state.bet * 100 ? 'BIG WIN!' : 'NICE WIN!');
            playSound(audio.bigWinSound);
            celebrateWin(data.win);
        } else {
            playSound(audio.winSound);
        }
    }
    
    // Handle free spins trigger
    if (data.freeSpins > 0 && state.freeSpins === data.freeSpins) {
        showFreeSpinsIntro();
    }
    
    // End of spin
    state.spinning = false;
    elements.spinBtn.classList.remove('spinning');
    audio.reelSpin.pause();
    audio.reelSpin.currentTime = 0;
    
    // Handle auto spins
    if (state.autoSpins > 0 || state.autoSpinStopOnWin > 0 || state.autoSpinStopOnLoss > 0) {
        handleAutoSpin();
    }
}

// Highlight winning symbols and paylines
function highlightWins() {
    // Highlight all symbols for demo
    document.querySelectorAll('.reel-symbol').forEach(symbol => {
        symbol.classList.add('winning');
        setTimeout(() => {
            symbol.classList.remove('winning');
        }, 2000);
    });
    
    // Highlight paylines
    document.querySelectorAll('.payline').forEach(line => {
        line.classList.add('active');
        setTimeout(() => {
            line.classList.remove('active');
        }, 2000);
    });
    
    // Show light beams for big wins
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
    document.querySelectorAll('.reel-symbol.winning').forEach(symbol => {
        symbol.classList.remove('winning');
    });
    document.querySelectorAll('.payline.active').forEach(line => {
        line.classList.remove('active');
    });
    elements.winningElements.querySelector('.light-beam.horizontal').style.opacity = '0';
    elements.winningElements.querySelector('.light-beam.vertical').style.opacity = '0';
    elements.winningElements.querySelector('.sparkles-container').innerHTML = '';
}

// Celebrate big wins
function celebrateWin(winAmount) {
    const sparklesContainer = elements.winningElements.querySelector('.sparkles-container');
    const sparkleCount = Math.min(50, Math.floor(winAmount / state.bet));
    
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = `${Math.random() * 100}%`;
        sparkle.style.animationDelay = `${Math.random() * 2}s`;
        sparkle.style.backgroundColor = `hsl(${Math.random() * 60 + 30}, 100%, 50%)`;
        sparklesContainer.appendChild(sparkle);
        
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
    playSound(audio.bonusSound);
    
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

// Handle auto spin
function handleAutoSpin() {
    if (state.autoSpinStopOnWin > 0 && state.win >= state.autoSpinStopOnWin) {
        state.autoSpins = 0;
        state.autoSpinStopOnWin = 0;
        showMessage('Auto Spin stopped: Big win!');
    } 
    else if (state.autoSpinStopOnLoss > 0 && 
             state.balance < config.startingBalance * (1 - state.autoSpinStopOnLoss / 100)) {
        state.autoSpins = 0;
        state.autoSpinStopOnLoss = 0;
        showMessage('Auto Spin stopped: Balance decreased!');
    } 
    else if (state.autoSpins > 0) {
        state.autoSpins--;
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
    
    if (!state.spinning) {
        handleSpin();
    }
}

// Change bet amount
function changeBet(step) {
    const currentIndex = config.betSteps.indexOf(state.bet);
    let newIndex = currentIndex + step;
    newIndex = Math.max(0, Math.min(newIndex, config.betSteps.length - 1));
    
    if (newIndex !== currentIndex) {
        const newBet = config.betSteps[newIndex];
        
        fetch('/api/change_bet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: state.user_id,
                bet: newBet
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                state.bet = newBet;
                elements.betSlider.value = state.bet;
                updateUI();
                playSound(audio.buttonSound);
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

// Handle bet slider change
function handleBetSlider() {
    const value = parseFloat(elements.betSlider.value);
    let closest = config.betSteps[0];
    let minDiff = Math.abs(value - closest);
    
    for (let i = 1; i < config.betSteps.length; i++) {
        const diff = Math.abs(value - config.betSteps[i]);
        if (diff < minDiff) {
            minDiff = diff;
            closest = config.betSteps[i];
        }
    }
    
    if (state.bet !== closest) {
        changeBet(config.betSteps.indexOf(closest) - config.betSteps.indexOf(state.bet));
    }
}

// Toggle sound on/off
function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    elements.soundBtn.innerHTML = state.soundEnabled ? 
        '<i class="fas fa-volume-up"></i> SOUND: ON' : 
        '<i class="fas fa-volume-mute"></i> SOUND: OFF';
    
    if (state.soundEnabled) {
        if (state.freeSpins > 0) {
            audio.fsMusic.play().catch(e => console.log('Autoplay prevented:', e));
        } else {
            audio.bgMusic.play().catch(e => console.log('Autoplay prevented:', e));
        }
    } else {
        audio.bgMusic.pause();
        audio.fsMusic.pause();
    }
    
    playSound(audio.buttonSound);
}

// Reset game
function resetGame() {
    fetch('/api/reset', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: state.user_id
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            state.balance = config.startingBalance;
            state.bet = 1;
            state.win = 0;
            state.freeSpins = 0;
            state.freeSpinsMultiplier = 1;
            state.stickyWilds = [];
            updateUI();
            showMessage('Game reset!');
            playSound(audio.buttonSound);
        }
    })
    .catch(error => console.error('Error:', error));
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
    if (state.soundEnabled && audioElement) {
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
    
    if (state.freeSpins > 0) {
        elements.spinBtn.querySelector('.spin-text').textContent = `FREE SPINS (${state.freeSpins})`;
    } else {
        elements.spinBtn.querySelector('.spin-text').textContent = 'SPIN';
    }
    
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
        
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 50) changeBet(1);
            else if (dx < -50) changeBet(-1);
        } else if (dy < -50 && !state.spinning) {
            handleSpin();
        }
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
