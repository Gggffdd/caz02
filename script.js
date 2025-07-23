document.addEventListener('DOMContentLoaded', () => {
    Telegram.WebApp.expand();
    
    const config = {
        symbols: [
            { id: 0, name: "A", emoji: "♦", payout: [0, 0, 25, 100], color: "#FF6B6B" },
            { id: 1, name: "K", emoji: "♠", payout: [0, 0, 20, 75], color: "#4ECDC4" },
            { id: 2, name: "Q", emoji: "♥", payout: [0, 0, 15, 50], color: "#FF9F1C" },
            { id: 3, name: "J", emoji: "♣", payout: [0, 0, 10, 25], color: "#1A936F" },
            { id: 4, name: "10", emoji: "🔔", payout: [0, 0, 5, 15], color: "#C5D86D" },
            { id: 5, name: "Dog", emoji: "🐶", payout: [0, 0, 50, 200], color: "#FFD166" },
            { id: 6, name: "Bone", emoji: "🦴", payout: [0, 0, 75, 300], color: "#F7F7F7" },
            { id: 7, name: "House", emoji: "🏠", payout: [0, 0, 100, 500], color: "#118AB2" },
            { id: 8, name: "Coin", emoji: "🪙", payout: [0, 0, 0, 0], color: "#FFD700", bonus: true }
        ],
        paylines: [
            [0, 0, 0],
            [1, 1, 1],
            [2, 2, 2]
        ],
        reelStrips: [
            [0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 8],
            [0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 8],
            [0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 8]
        ],
        betOptions: [10, 25, 50, 100, 250, 500],
        initialBalance: 10000
    };
    
    let gameState = {
        balance: config.initialBalance,
        bet: config.betOptions[3],
        spinning: false,
        currentWin: 0,
        bonus: {
            active: false,
            spinsLeft: 0,
            coins: []
        }
    };
    
    initGame();
    
    function initGame() {
        createParticles();
        initReels();
        updateBalance();
        updateBetDisplay();
        
        document.getElementById('spin-btn').addEventListener('click', startSpin);
        document.getElementById('bet-up').addEventListener('click', increaseBet);
        document.getElementById('bet-down').addEventListener('click', decreaseBet);
        
        // Ориентация экрана
        screen.orientation.addEventListener("change", handleOrientationChange);
        handleOrientationChange();
    }
    
    function handleOrientationChange() {
        const container = document.querySelector('.landscape-container');
        const warning = document.querySelector('.orientation-warning');
        
        if (window.matchMedia("(orientation: portrait)").matches) {
            container.style.display = 'none';
            warning.style.display = 'flex';
        } else {
            container.style.display = 'flex';
            warning.style.display = 'none';
        }
    }
    
    function createParticles() {
        const container = document.querySelector('.particles-container');
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            const size = Math.random() * 10 + 5;
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            const duration = Math.random() * 20 + 10;
            const delay = Math.random() * 10;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${posX}%`;
            particle.style.top = `${posY}%`;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${delay}s`;
            
            container.appendChild(particle);
        }
    }
    
    function initReels() {
        const reelsContainer = document.getElementById('reels');
        reelsContainer.innerHTML = '';
        
        for (let i = 0; i < 3; i++) {
            const reel = document.createElement('div');
            reel.className = 'reel';
            reel.id = `reel-${i}`;
            
            for (let j = 0; j < 3; j++) {
                const symbol = document.createElement('div');
                symbol.className = 'reel-symbol';
                symbol.dataset.pos = j;
                symbol.dataset.reel = i;
                
                const symbolIndex = config.reelStrips[i][j];
                const symbolData = config.symbols[symbolIndex];
                symbol.innerHTML = `<div class="symbol-img" style="color:${symbolData.color}">${symbolData.emoji}</div>`;
                symbol.dataset.symbolId = symbolData.id;
                
                if (symbolData.bonus) {
                    symbol.classList.add('coin-symbol');
                }
                
                reel.appendChild(symbol);
            }
            
            reelsContainer.appendChild(reel);
        }
    }
    
    function startSpin() {
        if (gameState.spinning) return;
        
        // Проверка баланса только в обычном режиме
        if (!gameState.bonus.active && gameState.balance < gameState.bet) {
            showMessage("Недостаточно средств!");
            return;
        }
        
        gameState.spinning = true;
        gameState.currentWin = 0;
        
        // Списание средств только в обычном режиме
        if (!gameState.bonus.active) {
            gameState.balance -= gameState.bet;
        }
        
        updateBalance();
        document.getElementById('win-display').textContent = "0";
        
        document.querySelectorAll('.reel-symbol').forEach(sym => {
            sym.classList.remove('win-symbol');
        });
        
        document.querySelectorAll('.payline').forEach(line => {
            line.classList.remove('active');
        });
        
        playSound('spin-sound');
        
        const symbols = document.querySelectorAll('.reel-symbol');
        let completed = 0;
        
        symbols.forEach((symbol, index) => {
            setTimeout(() => {
                animateSymbol(symbol, index, () => {
                    completed++;
                    if (completed === 9) {
                        gameState.spinning = false;
                        checkWins();
                    }
                });
            }, index * 100);
        });
    }
    
    function animateSymbol(symbol, index, callback) {
        const reelIndex = parseInt(symbol.dataset.reel);
        const strip = config.reelStrips[reelIndex];
        const randomIndex = Math.floor(Math.random() * strip.length);
        const symbolData = config.symbols[strip[randomIndex]];
        
        symbol.innerHTML = `<div class="symbol-img" style="color:${symbolData.color}">${symbolData.emoji}</div>`;
        symbol.dataset.symbolId = symbolData.id;
        
        // Обновляем класс для монетки
        if (symbolData.bonus) {
            symbol.classList.add('coin-symbol');
        } else {
            symbol.classList.remove('coin-symbol');
        }
        
        symbol.style.transition = 'none';
        symbol.style.transform = 'translateY(-150%)';
        
        setTimeout(() => {
            symbol.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            symbol.style.transform = 'translateY(0)';
            
            setTimeout(() => {
                playSound('reel-stop-sound');
                if (callback) callback();
            }, 600);
        }, 10);
    }
    
    function checkWins() {
        const reels = document.querySelectorAll('.reel');
        const visibleSymbols = [];
        
        reels.forEach(reel => {
            const symbols = reel.querySelectorAll('.reel-symbol');
            const reelSymbols = [];
            symbols.forEach(sym => {
                reelSymbols.push(parseInt(sym.dataset.symbolId));
            });
            visibleSymbols.push(reelSymbols);
        });
        
        let totalWin = 0;
        let bonusTriggered = false;
        
        // Проверка бонуса (3 монетки на центральной линии)
        const centerLine = [visibleSymbols[0][1], visibleSymbols[1][1], visibleSymbols[2][1]];
        if (centerLine.every(sym => sym === 8)) {
            activateBonus();
            bonusTriggered = true;
        }
        
        // Проверка обычных выигрышей
        config.paylines.forEach((line, lineIndex) => {
            const lineSymbols = line.map((row, col) => visibleSymbols[col][row]);
            const win = evaluateLine(lineSymbols);
            
            if (win > 0) {
                totalWin += win;
                highlightPayline(lineIndex, line);
            }
        });
        
        // Проверка монеток в бонусном режиме
        if (gameState.bonus.active && !bonusTriggered) {
            collectBonusCoins(visibleSymbols);
        }
        
        if (totalWin > 0) {
            gameState.currentWin = totalWin;
            gameState.balance += totalWin;
            updateBalance();
            
            playSound('win-sound');
            animateWin(totalWin);
            document.getElementById('win-display').textContent = totalWin.toLocaleString();
        }
        
        // Завершение бонусного режима
        if (gameState.bonus.active && gameState.bonus.spinsLeft <= 0) {
            finishBonus();
        }
    }
    
    function evaluateLine(symbols) {
        if (symbols[0] === symbols[1] && symbols[1] === symbols[2]) {
            return config.symbols[symbols[0]].payout[3] * gameState.bet;
        }
        return 0;
    }
    
    function highlightPayline(lineIndex, positions) {
        const payline = document.getElementById(`payline${lineIndex + 1}`);
        payline.classList.add('active');
        
        positions.forEach((row, col) => {
            const reel = document.querySelector(`#reel-${col}`);
            const symbol = reel.querySelector(`.reel-symbol:nth-child(${row + 1})`);
            symbol.classList.add('win-symbol');
        });
    }
    
    function activateBonus() {
        gameState.bonus.active = true;
        gameState.bonus.spinsLeft = 5;
        gameState.bonus.coins = [];
        
        document.getElementById('bonus-display').style.display = 'flex';
        updateBonusDisplay();
        
        playSound('bonus-sound');
        showMessage("БОНУС! 5 бесплатных вращений!");
    }
    
    function collectBonusCoins(visibleSymbols) {
        for (let col = 0; col < 3; col++) {
            for (let row = 0; row < 3; row++) {
                if (visibleSymbols[col][row] === 8) {
                    const coinValue = Math.floor(Math.random() * 5 + 1) * gameState.bet;
                    gameState.bonus.coins.push(coinValue);
                    
                    // Отображение значения монетки
                    const symbolElement = document.querySelector(
                        `#reel-${col} .reel-symbol:nth-child(${row + 1})`
                    );
                    
                    showCoinValue(symbolElement, coinValue);
                }
            }
        }
        
        gameState.bonus.spinsLeft--;
        updateBonusDisplay();
    }
    
    function showCoinValue(element, value) {
        const coinValue = document.createElement('div');
        coinValue.className = 'coin-value';
        coinValue.textContent = `+${value}`;
        
        element.appendChild(coinValue);
        playSound('coin-sound');
        
        setTimeout(() => {
            coinValue.remove();
        }, 1500);
    }
    
    function finishBonus() {
        const totalBonus = gameState.bonus.coins.reduce((sum, coin) => sum + coin, 0);
        
        if (totalBonus > 0) {
            gameState.balance += totalBonus;
            updateBalance();
            showMessage(`Бонусные монетки: ${totalBonus.toLocaleString()}!`);
            animateWin(totalBonus);
        }
        
        gameState.bonus.active = false;
        document.getElementById('bonus-display').style.display = 'none';
    }
    
    function updateBonusDisplay() {
        document.getElementById('bonus-spins-left').textContent = gameState.bonus.spinsLeft;
        
        const totalCoins = gameState.bonus.coins.reduce((sum, coin) => sum + coin, 0);
        document.getElementById('bonus-coins').textContent = totalCoins.toLocaleString();
    }
    
    function animateWin(amount) {
        const winAnimation = document.getElementById('win-animation');
        winAnimation.style.display = 'block';
        winAnimation.innerHTML = '';
        
        const winText = document.createElement('div');
        winText.textContent = `WIN ${amount.toLocaleString()}!`;
        winText.className = 'win-text';
        winAnimation.appendChild(winText);
        
        setTimeout(() => {
            winAnimation.style.display = 'none';
        }, 2000);
    }
    
    function increaseBet() {
        playSound('bet-sound');
        const currentIndex = config.betOptions.indexOf(gameState.bet);
        if (currentIndex < config.betOptions.length - 1) {
            gameState.bet = config.betOptions[currentIndex + 1];
            updateBetDisplay();
        }
    }
    
    function decreaseBet() {
        playSound('bet-sound');
        const currentIndex = config.betOptions.indexOf(gameState.bet);
        if (currentIndex > 0) {
            gameState.bet = config.betOptions[currentIndex - 1];
            updateBetDisplay();
        }
    }
    
    function updateBalance() {
        document.getElementById('balance').textContent = gameState.balance.toLocaleString();
    }
    
    function updateBetDisplay() {
        document.getElementById('bet').textContent = gameState.bet.toLocaleString();
    }
    
    function playSound(id) {
        const sound = document.getElementById(id);
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Audio play error:", e));
    }
    
    function showMessage(text) {
        const message = document.createElement('div');
        message.className = 'game-message';
        message.textContent = text;
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 2000);
    }
});
