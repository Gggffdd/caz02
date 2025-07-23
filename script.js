document.addEventListener('DOMContentLoaded', () => {
    // Инициализация Telegram WebApp
    Telegram.WebApp.expand();
    Telegram.WebApp.BackButton.hide();
    
    // Конфигурация игры
    const config = {
        symbols: [
            { id: 0, name: "A", emoji: "♦", payout: [0, 5, 25, 100], color: "#FF6B6B" },
            { id: 1, name: "K", emoji: "♠", payout: [0, 4, 20, 75], color: "#4ECDC4" },
            { id: 2, name: "Q", emoji: "♥", payout: [0, 3, 15, 50], color: "#FF9F1C" },
            { id: 3, name: "J", emoji: "♣", payout: [0, 2, 10, 25], color: "#1A936F" },
            { id: 4, name: "10", emoji: "🔔", payout: [0, 1, 5, 15], color: "#C5D86D" },
            { id: 5, name: "Dog", emoji: "🐶", payout: [0, 10, 50, 200], color: "#FFD166" },
            { id: 6, name: "Bone", emoji: "🦴", payout: [0, 15, 75, 300], color: "#F7F7F7" },
            { id: 7, name: "House", emoji: "🏠", payout: [0, 20, 100, 500], color: "#118AB2" }
        ],
        paylines: [
            [0, 0, 0], // Верхняя линия
            [1, 1, 1], // Центральная линия
            [2, 2, 2], // Нижняя линия
            [0, 1, 2], // Диагональ вниз
            [2, 1, 0], // Диагональ вверх
            [1, 0, 1]  // V-образная
        ],
        reelStrips: [
            [0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5]
        ],
        betOptions: [10, 25, 50, 100, 250, 500],
        initialBalance: 10000,
        soundEnabled: true
    };
    
    // Состояние игры
    let gameState = {
        balance: config.initialBalance,
        bet: config.betOptions[3],
        spinning: false,
        currentWin: 0,
        spinCount: 0
    };
    
    // Инициализация UI
    initGame();
    
    function initGame() {
        // Создаем частицы фона
        createParticles();
        
        // Создаем барабаны
        initReels();
        
        // Обновляем UI
        updateBalance();
        updateBetDisplay();
        initPaytable();
        
        // Назначаем обработчики событий
        document.getElementById('spin-btn').addEventListener('click', startSpin);
        document.getElementById('bet-up').addEventListener('click', increaseBet);
        document.getElementById('bet-down').addEventListener('click', decreaseBet);
        document.getElementById('paytable-btn').addEventListener('click', showPaytable);
        document.querySelector('.close').addEventListener('click', hidePaytable);
        document.getElementById('sound-toggle').addEventListener('click', toggleSound);
        document.getElementById('mystery-box').addEventListener('click', mysteryBonus);
        
        // Инициализируем звук
        setSoundState(config.soundEnabled);
    }
    
    function createParticles() {
        const container = document.querySelector('.particles-container');
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // Случайные свойства
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
            
            // Случайный цвет
            const colors = ['#FF9F1C', '#2EC4B6', '#E71D36', '#FFD700'];
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
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
            
            // Создаем 3 видимых символа
            for (let j = 0; j < 3; j++) {
                const symbol = document.createElement('div');
                symbol.className = 'reel-symbol';
                symbol.dataset.pos = j;
                symbol.dataset.reel = i;
                
                // Заполняем начальными символами
                const symbolIndex = config.reelStrips[i][j];
                const symbolData = config.symbols[symbolIndex];
                symbol.innerHTML = `<div class="symbol-img" style="color:${symbolData.color}">${symbolData.emoji}</div>`;
                symbol.dataset.symbolId = symbolData.id;
                
                reel.appendChild(symbol);
            }
            
            reelsContainer.appendChild(reel);
        }
    }
    
    function startSpin() {
        if (gameState.spinning) return;
        if (gameState.balance < gameState.bet) {
            showMessage("Недостаточно средств!");
            return;
        }
        
        gameState.spinning = true;
        gameState.currentWin = 0;
        gameState.balance -= gameState.bet;
        gameState.spinCount++;
        updateBalance();
        document.getElementById('win-display').textContent = "0";
        document.querySelector('.win-crown').style.display = 'none';
        
        // Сбрасываем подсветку символов
        document.querySelectorAll('.reel-symbol').forEach(sym => {
            sym.classList.remove('win-symbol');
        });
        
        // Сбрасываем линии выплат
        document.querySelectorAll('.payline').forEach(line => {
            line.classList.remove('active');
        });
        
        // Запускаем звук вращения
        playSound('spin-sound');
        
        // Анимация вращения для каждого барабана
        const reels = document.querySelectorAll('.reel');
        reels.forEach((reel, index) => {
            spinReel(reel, index);
        });
    }
    
    function spinReel(reel, reelIndex) {
        const symbols = reel.querySelectorAll('.reel-symbol');
        const spinDuration = 2000 + Math.random() * 1000;
        const startTime = Date.now();
        const reelHeight = 100; // 100% на символ
        
        // Создаем клоны для бесконечной прокрутки
        symbols.forEach(symbol => {
            const clone = symbol.cloneNode(true);
            clone.style.transform = `translateY(-${reelHeight}%)`;
            reel.appendChild(clone);
        });
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / spinDuration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3); // Кубическое замедление
            
            // Прокрутка символов
            symbols.forEach((symbol, i) => {
                const position = -(easedProgress * reelHeight * 3) + (i * reelHeight);
                symbol.style.transform = `translateY(${position}%)`;
                
                // Клоны
                const clone = reel.children[i + 3];
                if (clone) {
                    clone.style.transform = `translateY(${position - reelHeight}%)`;
                }
            });
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                stopReel(reel, reelIndex);
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    function stopReel(reel, reelIndex) {
        // Удаляем клоны
        while (reel.children.length > 3) {
            reel.removeChild(reel.lastChild);
        }
        
        // Выбираем случайную позицию для остановки
        const stopPos = Math.floor(Math.random() * (config.reelStrips[reelIndex].length - 2));
        const symbols = reel.querySelectorAll('.reel-symbol');
        
        // Обновляем символы
        symbols.forEach((symbol, symbolIndex) => {
            const stripPos = (stopPos + symbolIndex) % config.reelStrips[reelIndex].length;
            const symbolData = config.symbols[config.reelStrips[reelIndex][stripPos]];
            symbol.innerHTML = `<div class="symbol-img" style="color:${symbolData.color}">${symbolData.emoji}</div>`;
            symbol.dataset.symbolId = symbolData.id;
            symbol.style.transform = `translateY(${symbolIndex * 100}%)`;
        });
        
        // Звук остановки барабана
        playSound('reel-stop-sound');
        
        // Проверяем все ли барабаны остановились
        setTimeout(() => {
            const allStopped = [...document.querySelectorAll('.reel')].every(r => {
                return !r.classList.contains('spinning');
            });
            
            if (allStopped) {
                gameState.spinning = false;
                checkWins();
            }
        }, 300);
    }
    
    function checkWins() {
        const reels = document.querySelectorAll('.reel');
        const visibleSymbols = [];
        
        // Собираем видимые символы
        reels.forEach(reel => {
            const symbols = reel.querySelectorAll('.reel-symbol');
            const reelSymbols = [];
            symbols.forEach(sym => {
                reelSymbols.push(parseInt(sym.dataset.symbolId));
            });
            visibleSymbols.push(reelSymbols);
        });
        
        // Проверяем все линии выплат
        let totalWin = 0;
        config.paylines.forEach((line, lineIndex) => {
            const lineSymbols = line.map((row, col) => visibleSymbols[col][row]);
            const win = evaluateLine(lineSymbols);
            
            if (win > 0) {
                totalWin += win;
                highlightPayline(lineIndex, line);
            }
        });
        
        if (totalWin > 0) {
            gameState.currentWin = totalWin;
            gameState.balance += totalWin;
            updateBalance();
            
            playSound('win-sound');
            animateWin(totalWin);
            
            // Анимация выигрыша
            document.getElementById('win-display').textContent = totalWin.toLocaleString();
            document.querySelector('.win-crown').style.display = 'block';
            
            // Большой выигрыш
            if (totalWin > gameState.bet * 10) {
                document.querySelector('.win-crown').style.animation = 'bounce 0.5s infinite';
            }
        }
    }
    
    function evaluateLine(symbols) {
        // Проверяем комбинации
        if (symbols[0] === symbols[1] && symbols[1] === symbols[2]) {
            return config.symbols[symbols[0]].payout[3] * gameState.bet;
        }
        
        if (symbols[0] === symbols[1]) {
            return config.symbols[symbols[0]].payout[1] * gameState.bet;
        }
        
        if (symbols[1] === symbols[2]) {
            return config.symbols[symbols[1]].payout[1] * gameState.bet;
        }
        
        return 0;
    }
    
    function highlightPayline(lineIndex, positions) {
        // Активируем линию выплат
        const payline = document.getElementById(`payline${lineIndex + 1}`);
        payline.classList.add('active');
        
        // Подсвечиваем выигравшие символы
        positions.forEach((row, col) => {
            const reel = document.querySelector(`#reel-${col}`);
            const symbol = reel.querySelector(`.reel-symbol:nth-child(${row + 1})`);
            symbol.classList.add('win-symbol');
        });
    }
    
    function animateWin(amount) {
        const winAnimation = document.getElementById('win-animation');
        winAnimation.style.display = 'block';
        winAnimation.innerHTML = '';
        
        // Создаем элементы анимации
        for (let i = 0; i < 50; i++) {
            const coin = document.createElement('div');
            coin.innerHTML = '🪙';
            coin.style.position = 'absolute';
            coin.style.fontSize = '3rem';
            coin.style.left = `${Math.random() * 100}%`;
            coin.style.top = `${Math.random() * 100}%`;
            coin.style.animation = `float ${Math.random() * 3 + 2}s linear forwards`;
            winAnimation.appendChild(coin);
        }
        
        // Создаем текст выигрыша
        const winText = document.createElement('div');
        winText.textContent = `WIN ${amount.toLocaleString()}!`;
        winText.style.position = 'absolute';
        winText.style.top = '50%';
        winText.style.left = '50%';
        winText.style.transform = 'translate(-50%, -50%)';
        winText.style.fontSize = '4rem';
        winText.style.fontWeight = 'bold';
        winText.style.color = 'gold';
        winText.style.textShadow = '0 0 20px rgba(255,215,0,0.8)';
        winText.style.animation = 'bounce 1s infinite';
        winAnimation.appendChild(winText);
        
        // Через 3 секунды скрываем анимацию
        setTimeout(() => {
            winAnimation.style.display = 'none';
        }, 3000);
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
        document.querySelector('.bet-shadow').textContent = gameState.bet.toLocaleString();
        
        // Анимация изменения ставки
        const betDisplay = document.getElementById('bet');
        betDisplay.style.transform = 'scale(1.2)';
        setTimeout(() => {
            betDisplay.style.transform = 'scale(1)';
        }, 300);
    }
    
    function initPaytable() {
        const paytable = document.getElementById('paytable');
        paytable.innerHTML = '';
        
        config.symbols.forEach(symbol => {
            const item = document.createElement('div');
            item.className = 'paytable-item';
            
            item.innerHTML = `
                <div class="symbol-img" style="color:${symbol.color}">${symbol.emoji}</div>
                <div class="symbol-name">${symbol.name}</div>
                <div class="symbol-payout">
                    3x: ${symbol.payout[3]}x<br>
                    2x: ${symbol.payout[1]}x
                </div>
            `;
            
            paytable.appendChild(item);
        });
    }
    
    function showPaytable() {
        document.getElementById('paytable-modal').style.display = 'flex';
        playSound('bet-sound');
    }
    
    function hidePaytable() {
        document.getElementById('paytable-modal').style.display = 'none';
        playSound('bet-sound');
    }
    
    function toggleSound() {
        config.soundEnabled = !config.soundEnabled;
        setSoundState(config.soundEnabled);
        playSound('bet-sound');
    }
    
    function setSoundState(enabled) {
        const icon = document.querySelector('#sound-toggle i');
        if (enabled) {
            icon.className = 'fas fa-volume-up';
            icon.style.color = '#2EC4B6';
        } else {
            icon.className = 'fas fa-volume-mute';
            icon.style.color = '#E71D36';
        }
    }
    
    function playSound(id) {
        if (!config.soundEnabled) return;
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
            message.style.opacity = '0';
            setTimeout(() => {
                message.remove();
            }, 500);
        }, 2500);
    }
    
    function mysteryBonus() {
        if (gameState.spinning) return;
        
        // Случайный бонус
        const bonuses = [
            { type: 'cash', amount: 500 },
            { type: 'multiplier', value: 2 },
            { type: 'free-spin', count: 5 }
        ];
        
        const bonus = bonuses[Math.floor(Math.random() * bonuses.length)];
        
        // Анимация бонуса
        const box = document.querySelector('.mystery-box');
        box.style.animation = 'bounce 0.5s';
        
        // Применяем бонус
        switch (bonus.type) {
            case 'cash':
                gameState.balance += bonus.amount;
                updateBalance();
                showMessage(`+${bonus.amount} BONUS!`);
                break;
                
            case 'multiplier':
                gameState.bet *= bonus.value;
                if (gameState.bet > config.betOptions[config.betOptions.length - 1]) {
                    gameState.bet = config.betOptions[config.betOptions.length - 1];
                }
                updateBetDisplay();
                showMessage(`BET x${bonus.value} MULTIPLIER!`);
                break;
                
            case 'free-spin':
                showMessage(`${bonus.count} FREE SPINS!`);
                for (let i = 0; i < bonus.count; i++) {
                    setTimeout(() => {
                        if (!gameState.spinning) startSpin();
                    }, i * 2000);
                }
                break;
        }
        
        playSound('bonus-sound');
        
        // Сброс анимации
        setTimeout(() => {
            box.style.animation = 'bounce 3s infinite';
        }, 500);
    }
});
