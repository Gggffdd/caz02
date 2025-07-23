document.addEventListener('DOMContentLoaded', () => {
    // Инициализация Telegram WebApp
    Telegram.WebApp.expand();
    Telegram.WebApp.BackButton.hide();
    
    // Конфигурация игры
    const config = {
        symbols: [
            { id: 0, name: "A", img: "A.png", payout: [0, 5, 25, 100] },
            { id: 1, name: "K", img: "K.png", payout: [0, 4, 20, 75] },
            { id: 2, name: "Q", img: "Q.png", payout: [0, 3, 15, 50] },
            { id: 3, name: "J", img: "J.png", payout: [0, 2, 10, 25] },
            { id: 4, name: "10", img: "10.png", payout: [0, 1, 5, 15] },
            { id: 5, name: "Dog", img: "dog.png", payout: [0, 10, 50, 200] },
            { id: 6, name: "Bone", img: "bone.png", payout: [0, 15, 75, 300] },
            { id: 7, name: "House", img: "house.png", payout: [0, 20, 100, 500] }
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
        initialBalance: 10000
    };
    
    // Состояние игры
    let gameState = {
        balance: config.initialBalance,
        bet: config.betOptions[3],
        spinning: false,
        currentWin: 0
    };
    
    // Инициализация UI
    initGame();
    
    function initGame() {
        // Создаем барабаны
        const reelsContainer = document.getElementById('reels');
        reelsContainer.innerHTML = '';
        
        for (let i = 0; i < 3; i++) {
            const reel = document.createElement('div');
            reel.className = 'reel';
            reel.id = `reel-${i}`;
            
            // Создаем 3 видимых символа + 2 скрытых для анимации
            for (let j = 0; j < 5; j++) {
                const symbol = document.createElement('div');
                symbol.className = 'reel-symbol';
                symbol.dataset.pos = j;
                symbol.dataset.reel = i;
                
                // Заполняем начальными символами
                const symbolIndex = config.reelStrips[i][j];
                const symbolData = config.symbols[symbolIndex];
                symbol.innerHTML = `<img src="assets/images/symbols/${symbolData.img}" alt="${symbolData.name}">`;
                
                reel.appendChild(symbol);
            }
            
            reelsContainer.appendChild(reel);
        }
        
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
        updateBalance();
        document.getElementById('win-display').textContent = "0";
        
        // Запускаем звук вращения
        document.getElementById('spin-sound').currentTime = 0;
        document.getElementById('spin-sound').play();
        
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
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / spinDuration, 1);
            
            // Прокрутка символов
            symbols.forEach(symbol => {
                const pos = parseInt(symbol.dataset.pos);
                const newPos = (pos + progress * 50) % 5;
                symbol.style.transform = `translateY(${newPos * 100}px)`;
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
        // Выбираем случайную позицию для остановки
        const stopPos = Math.floor(Math.random() * config.reelStrips[reelIndex].length);
        const symbols = reel.querySelectorAll('.reel-symbol');
        
        // Обновляем символы
        symbols.forEach((symbol, symbolIndex) => {
            const stripPos = (stopPos + symbolIndex) % config.reelStrips[reelIndex].length;
            const symbolData = config.symbols[config.reelStrips[reelIndex][stripPos]];
            symbol.innerHTML = `<img src="assets/images/symbols/${symbolData.img}" alt="${symbolData.name}">`;
            symbol.dataset.symbolId = symbolData.id;
        });
        
        // Звук остановки барабана
        document.getElementById('reel-stop-sound').currentTime = 0;
        document.getElementById('reel-stop-sound').play();
        
        // Проверяем все ли барабаны остановились
        setTimeout(() => {
            const allStopped = [...document.querySelectorAll('.reel')].every(r => {
                return !r.querySelector('.reel-symbol').style.transform.includes('translateY');
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
        
        // Собираем видимые символы (центральные позиции)
        reels.forEach(reel => {
            const symbols = reel.querySelectorAll('.reel-symbol');
            visibleSymbols.push([
                parseInt(symbols[0].dataset.symbolId),
                parseInt(symbols[1].dataset.symbolId),
                parseInt(symbols[2].dataset.symbolId)
            ]);
        });
        
        // Проверяем все линии выплат
        let totalWin = 0;
        config.paylines.forEach((line, lineIndex) => {
            const lineSymbols = line.map((row, col) => visibleSymbols[col][row]);
            const win = evaluateLine(lineSymbols);
            
            if (win > 0) {
                totalWin += win;
                highlightPayline(lineIndex);
            }
        });
        
        if (totalWin > 0) {
            gameState.currentWin = totalWin;
            gameState.balance += totalWin;
            updateBalance();
            
            document.getElementById('win-sound').currentTime = 0;
            document.getElementById('win-sound').play();
            
            animateWin(totalWin);
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
    
    // ... (остальные функции для управления ставками, выплатами и UI)
});
