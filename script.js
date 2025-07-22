const symbols = ["🐶", "🐕", "🦴", "🍖", "🍒", "🍋", "🔔", "7"];
let balance = 100;
let bet = 10;

document.getElementById('spin-btn').addEventListener('click', spin);
document.getElementById('cashout-btn').addEventListener('click', cashout);

function spin() {
    if (balance < bet) {
        alert("Недостаточно средств!");
        return;
    }

    balance -= bet;
    updateBalance();

    // Анимация вращения
    const reels = document.querySelectorAll('.reel');
    reels.forEach(reel => {
        reel.style.animation = "spin 0.5s 5";
        setTimeout(() => {
            reel.style.animation = "none";
            reel.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            checkWin();
        }, 2500);
    });
}

function checkWin() {
    const reels = document.querySelectorAll('.reel');
    const values = Array.from(reels).map(reel => reel.textContent);
    
    // Проверка выигрышных комбинаций
    if (values[0] === values[1] && values[1] === values[2]) {
        const winAmount = bet * (symbols.indexOf(values[0]) + 50);
        balance += winAmount;
        alert(`🎉 Вы выиграли ${winAmount} ₽!`);
        updateBalance();
    }
}

function cashout() {
    Telegram.WebApp.sendData(JSON.stringify({
        action: "cashout",
        amount: balance
    }));
    Telegram.WebApp.close();
}

function updateBalance() {
    document.getElementById('balance').textContent = balance;
}

// Для анимации
document.styleSheets[0].insertRule(`
@keyframes spin {
    from { transform: rotateY(0); }
    to { transform: rotateY(360deg); }
}`, 0);
