document.addEventListener('DOMContentLoaded', () => {
    Telegram.WebApp.expand();
    
    // Конфигурация игры
    const config = {
        symbols: [
            { id: 0, name: "A", emoji: "♦", payout: [0, 0, 10, 40], color: "#FF6B6B" },
            { id: 1, name: "K", emoji: "♠", payout: [0, 0, 8, 30], color: "#4ECDC4" },
            { id: 2, name: "Q", emoji: "♥", payout: [0, 0, 6, 25], color: "#FF9F1C" },
            { id: 3, name: "J", emoji: "♣", payout: [0, 0, 5, 20], color: "#1A936F" },
            { id: 4, name: "10", emoji: "🔔", payout: [0, 0, 4, 15], color: "#C5D86D" },
            { id: 5, name: "Dog", emoji: "🐶", payout: [0, 0, 50, 250], color: "#FFD166" },
            { id: 6, name: "Bone", emoji: "🦴", payout: [0, 0, 75, 400], color: "#F7F7F7" },
            { id: 7, name: "House", emoji: "🏠", payout: [0, 0, 150, 1000], color: "#118AB2" },
            { id: 8, name: "Coin", emoji: "🪙", payout: [0, 0, 0, 0], color: "#FFD700", bonus: true }
        ],
        paylines: [
            [0, 0, 0], [1, 1, 1], [2, 2, 2], // Горизонтальные линии
            [0, 1, 2], [2, 1, 0],             // Диагонали
            [0, 0, 1], [2, 2, 1],             // V-образные
            [0, 2, 0], [2, 0, 2], [1, 0, 1]    // Z-образные
        ],
        reelStrips: [
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 1, 2, 3, 4, 5, 6, 7, 8],
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 1, 2, 3, 4, 5, 6, 7, 8],
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 1, 2, 3, 4, 5, 6, 7, 8]
        ],
        betOptions: [10, 25, 50, 100, 250, 500],
        initialBalance: 10000,
        bonusBuyMultiplier: 50,
        coinChance: 0.25, // 25% шанс выпадения монеты
        bonusTriggerCoins: 3, // Нужно 3 монеты для бонуса
        bonusSpins: 10 // Количество бесплатных спинов в бонусе
    };
    
    // Состояние игры
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
    
    // Инициализация игры
    function initGame() {
        createParticles();
        initReels();
        updateBalance();
        updateBetDisplay();
        updateBonusPrice();
        
        // Назначение обработчиков событий
        document.getElementById('spin-btn').addEventListener('click', startSpin);
        document.getElementById('bet-up').addEventListener('click', increaseBet);
        document.getElementById('bet-down').addEventListener('click', decreaseBet);
        document.getElementById('bonus-buy-btn').addEventListener('click', buyBonus);
    }
    
    // Создание частиц для фона
    function createParticles() {
        const container = document.querySelector('.particles-container');
        for (let i = 0; i < 25; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            const size = Math.random() * 15 + 5;
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            const duration = Math.random() * 20 + 15;
            const delay = Math.random() * 15;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${posX}%`;
            particle.style.top = `${posY}%`;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${delay}s`;
            particle.style.backgroundColor = `rgba(${Math.random()*55 + 200}, ${Math.random()*55 + 200}, ${Math.random()*55 + 200}, ${Math.random()*0.3 + 0.1})`;
            
            container.appendChild(particle);
        }
    }
    
    // Инициализация барабанов
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
    
    // Запуск вращения
    function startSpin() {
        if (gameState.spinning) return;
        
        if (!gameState.bonus.active && gameState.balance < gameState.bet) {
            showMessage("Недостаточно средств!");
            return;
        }
        
        gameState.spinning = true;
        gameState.currentWin = 0;
        
        if (!gameState.bonus.active) {
            gameState.balance -= gameState.bet;
            updateBalance();
        }
        
        document.getElementById('win-display').textContent = "0";
        clearWinHighlights();
        playSound('spin-sound');
        
        const symbols = document.querySelectorAll('.reel-symbol');
        let completed = 0;
        
        symbols.forEach((symbol, index) => {
            setTimeout(() => {
                const reelIndex = parseInt(symbol.dataset.reel);
                const duration = getSpinDuration(reelIndex);
                
                setTimeout(() => {
                    animateSymbol(symbol, () => {
                        completed++;
                        if (completed === 9) {
                            gameState.spinning = false;
                            checkWins();
                        }
                    });
                }, index * 100);
            }, 0);
        });
    }
    
    // Определение длительности вращения для эффекта замедления
    function getSpinDuration(reelIndex) {
        // Замедляем последний барабан, если на первых двух есть монеты
        if (reelIndex === 2 && hasCoinsOnFirstTwoReels()) {
            return 1.2; // Увеличенная длительность
        }
        return 0.6; // Стандартная длительность
    }
    
    // Проверка наличия монет на первых двух барабанах
    function hasCoinsOnFirstTwoReels() {
        const reels = document.querySelectorAll('.reel');
        for (let i = 0; i < 2; i++) {
            const symbols = reels[i].querySelectorAll('.reel-symbol');
            for (let j = 0; j < symbols.length; j++) {
                if (parseInt(symbols[j].dataset.symbolId) === 8) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // Анимация символа
    function animateSymbol(symbol, callback) {
        const reelIndex = parseInt(symbol.dataset.reel);
        const posIndex = parseInt(symbol.dataset.pos);
        const strip = config.reelStrips[reelIndex];
        
        // Выбираем случайный символ с учетом шанса монеты
        let symbolData;
        if (Math.random() < config.coinChance) {
            symbolData = config.symbols[8]; // Монета
        } else {
            const randomIndex = Math.floor(Math.random() * strip.length);
            symbolData = config.symbols[strip[randomIndex]];
        }
        
        // Обновляем символ
        symbol.innerHTML = `<div class="symbol-img" style="color:${symbolData.color}">${symbolData.emoji}</div>`;
        symbol.dataset.symbolId = symbolData.id;
        
        if (symbolData.bonus) {
            symbol.classList.add('coin-symbol');
        } else {
            symbol.classList.remove('coin-symbol');
        }
        
        // Анимация вращения
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
    
    // Проверка выигрышных комбинаций
    function checkWins() {
        const visibleSymbols = getVisibleSymbols();
        const coinCount = countCoins(visibleSymbols);
        
        // Активация бонуса при 3+ монетах
        if (coinCount >= config.bonusTriggerCoins && !gameState.bonus.active) {
            activateBonus();
        }
        
        // Проверка обычных выигрышей
        let totalWin = 0;
        config.paylines.forEach((line, lineIndex) => {
            const lineSymbols = line.map((row, col) => visibleSymbols[col][row]);
            const win = evaluateLine(lineSymbols);
            
            if (win > 0) {
                totalWin += win;
                highlightPayline(lineIndex, line);
            }
        });
        
        // Обработка выигрыша
        if (totalWin > 0) {
            processWin(totalWin);
        }
        
        // Сбор монет в бонусном режиме
        if (gameState.bonus.active) {
            collectBonusCoins(visibleSymbols);
        }
        
        // Завершение бонусного режима
        if (gameState.bonus.active && gameState.bonus.spinsLeft <= 0) {
            finishBonus();
        }
    }
    
    // Получение видимых символов
    function getVisibleSymbols() {
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
        
        return visibleSymbols;
    }
    
    // Подсчет монет на экране
    function countCoins(visibleSymbols) {
        let count = 0;
        for (let col = 0; col < 3; col++) {
            for (let row = 0; row < 3; row++) {
                if (visibleSymbols[col][row] === 8) count++;
            }
        }
        return count;
    }
    
    // Активация бонусного режима
    function activateBonus() {
        gameState.bonus.active = true;
        gameState.bonus.spinsLeft = config.bonusSpins;
        gameState.bonus.coins = [];
        
        document.getElementById('bonus-display').style.display = 'flex';
        document.getElementById('bonus-spins-counter').style.display = 'flex';
        updateBonusDisplay();
        
        playSound('bonus-sound');
        showMessage(`БОНУС! ${config.bonusSpins} бесплатных вращений!`);
        animateBonusActivation();
    }
    
    // Анимация активации бонуса
    function animateBonusActivation() {
        const winAnimation = document.getElementById('bonus-win-animation');
        winAnimation.style.display = 'flex';
        winAnimation.innerHTML = '<div class="bonus-win-text">BONUS ACTIVATED!</div>';
        
        setTimeout(() => {
            winAnimation.style.display = 'none';
        }, 3000);
    }
    
    // Сбор монет в бонусном режиме
    function collectBonusCoins(visibleSymbols) {
        for (let col = 0; col < 3; col++) {
            for (let row = 0; row < 3; row++) {
                if (visibleSymbols[col][row] === 8) {
                    const coinValue = calculateCoinValue();
                    gameState.bonus.coins.push(coinValue);
                    
                    const symbolElement = document.querySelector(
                        `#reel-${col} .reel-symbol:nth-child(${row + 1})`
                    );
                    
                    if (symbolElement) {
                        showCoinValue(symbolElement, coinValue);
                    }
                }
            }
        }
        
        gameState.bonus.spinsLeft--;
        updateBonusDisplay();
    }
    
    // Расчет стоимости монеты
    function calculateCoinValue() {
        return Math.floor(Math.random() * 5 + 1) * gameState.bet * 5;
    }
    
    // Отображение стоимости монеты
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
    
    // Завершение бонусного режима
    function finishBonus() {
        const totalBonus = gameState.bonus.coins.reduce((sum, coin) => sum + coin, 0);
        
        if (totalBonus > 0) {
            gameState.balance += totalBonus;
            updateBalance();
            showMessage(`Бонусные монетки: ${totalBonus.toLocaleString()}!`);
            animateWin(totalBonus, true);
        }
        
        gameState.bonus.active = false;
        document.getElementById('bonus-display').style.display = 'none';
        document.getElementById('bonus-spins-counter').style.display = 'none';
    }
    
    // Оценка выигрышной линии
    function evaluateLine(symbols) {
        if (symbols[0] === symbols[1] && symbols[1] === symbols[2]) {
            const symbol = config.symbols[symbols[0]];
            return symbol.payout[3] * gameState.bet;
        }
        return 0;
    }
    
    // Подсветка выигрышной линии
    function highlightPayline(lineIndex, positions) {
        const payline = document.getElementById(`payline${lineIndex + 1}`);
        if (payline) payline.classList.add('active');
        
        positions.forEach((row, col) => {
            const reel = document.querySelector(`#reel-${col}`);
            if (reel) {
                const symbol = reel.querySelector(`.reel-symbol:nth-child(${row + 1})`);
                if (symbol) symbol.classList.add('win-symbol');
            }
        });
    }
    
    // Очистка подсветки выигрышей
    function clearWinHighlights() {
        document.querySelectorAll('.reel-symbol').forEach(sym => {
            sym.classList.remove('win-symbol');
        });
        
        document.querySelectorAll('.payline').forEach(line => {
            line.classList.remove('active');
        });
    }
    
    // Обработка выигрыша
    function processWin(amount) {
        gameState.currentWin = amount;
        gameState.balance += amount;
        updateBalance();
        
        playSound('win-sound');
        animateWin(amount, false);
        document.getElementById('win-display').textContent = amount.toLocaleString();
    }
    
    // Анимация выигрыша
    function animateWin(amount, isBonus) {
        const winAnimation = isBonus 
            ? document.getElementById('bonus-win-animation')
            : document.getElementById('win-animation');
            
        winAnimation.style.display = 'flex';
        winAnimation.innerHTML = `
            <div class="${isBonus ? 'bonus-win-text' : 'win-text'}">
                ${isBonus ? 'BONUS ' : ''}${amount.toLocaleString()}!
            </div>
        `;
        
        setTimeout(() => {
            winAnimation.style.display = 'none';
        }, isBonus ? 3000 : 2500);
    }
    
    // Покупка бонуса
    function buyBonus() {
        if (gameState.spinning) return;
        
        const bonusCost = gameState.bet * config.bonusBuyMultiplier;
        
        if (gameState.balance < bonusCost) {
            showMessage("Недостаточно средств для покупки бонуса!");
            return;
        }
        
        gameState.balance -= bonusCost;
        updateBalance();
        
        // Специальный спин с гарантированными монетами
        gameState.spinning = true;
        playSound('bonus-sound');
        
        const symbols = document.querySelectorAll('.reel-symbol');
        let completed = 0;
        
        symbols.forEach((symbol, index) => {
            setTimeout(() => {
                const reelIndex = parseInt(symbol.dataset.reel);
                const posIndex = parseInt(symbol.dataset.pos);
                
                // Гарантируем выпадение монет на центральной линии
                let symbolData;
                if (posIndex === 1) { // Центральная позиция
                    symbolData = config.symbols[8]; // Монета
                } else {
                    const strip = config.reelStrips[reelIndex];
                    const randomIndex = Math.floor(Math.random() * strip.length);
                    symbolData = config.symbols[strip[randomIndex]];
                }
                
                // Обновляем символ
                symbol.innerHTML = `<div class="symbol-img" style="color:${symbolData.color}">${symbolData.emoji}</div>`;
                symbol.dataset.symbolId = symbolData.id;
                
                if (symbolData.bonus) {
                    symbol.classList.add('coin-symbol');
                } else {
                    symbol.classList.remove('coin-symbol');
                }
                
                // Анимация
                symbol.style.transition = 'none';
                symbol.style.transform = 'translateY(-150%)';
                
                setTimeout(() => {
                    symbol.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    symbol.style.transform = 'translateY(0)';
                    
                    setTimeout(() => {
                        playSound('reel-stop-sound');
                        completed++;
                        
                        if (completed === 9) {
                            gameState.spinning = false;
                            activateBonus();
                            checkWins();
                        }
                    }, 600);
                }, 10);
            }, index * 100);
        });
    }
    
    // Увеличение ставки
    function increaseBet() {
        playSound('bet-sound');
        const currentIndex = config.betOptions.indexOf(gameState.bet);
        if (currentIndex < config.betOptions.length - 1) {
            gameState.bet = config.betOptions[currentIndex + 1];
            updateBetDisplay();
            updateBonusPrice();
        }
    }
    
    // Уменьшение ставки
    function decreaseBet() {
        playSound('bet-sound');
        const currentIndex = config.betOptions.indexOf(gameState.bet);
        if (currentIndex > 0) {
            gameState.bet = config.betOptions[currentIndex - 1];
            updateBetDisplay();
            updateBonusPrice();
        }
    }
    
    // Обновление отображения баланса
    function updateBalance() {
        document.getElementById('balance').textContent = gameState.balance.toLocaleString();
    }
    
    // Обновление отображения ставки
    function updateBetDisplay() {
        document.getElementById('bet').textContent = gameState.bet.toLocaleString();
    }
    
    // Обновление цены бонуса
    function updateBonusPrice() {
        const price = gameState.bet * config.bonusBuyMultiplier;
        document.getElementById('bonus-price').textContent = price.toLocaleString();
    }
    
    // Обновление отображения бонуса
    function updateBonusDisplay() {
        document.getElementById('bonus-spins-left').textContent = gameState.bonus.spinsLeft;
        const totalCoins = gameState.bonus.coins.reduce((sum, coin) => sum + coin, 0);
        document.getElementById('bonus-coins').textContent = totalCoins.toLocaleString();
    }
    
    // Воспроизведение звука
    function playSound(id) {
        const sound = document.getElementById(id);
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Audio play error:", e));
    }
    
    // Показать сообщение
    function showMessage(text) {
        const message = document.createElement('div');
        message.className = 'game-message';
        message.textContent = text;
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }
    
    // Инициализация игры
    initGame();
});
