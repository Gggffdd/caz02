import telebot
from telebot.types import MenuButtonWebApp, WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton
from flask import Flask, request, jsonify
import os
from PIL import Image, ImageDraw, ImageFont

# ==================== Telegram Bot Setup ====================
TOKEN = "7523520150:AAGMPibPAl8D0I0E6ZeNR3zuIp0qKcshXN0"
WEBAPP_URL = "https://benevolent-basbousa-044e27.netlify.app"
bot = telebot.TeleBot(TOKEN)

# ==================== Slot Machine Configuration ====================
class DogHouseSlot:
    def __init__(self):
        self.config = {
            'symbols': ['9', '10', 'j', 'q', 'k', 'a', 'collar', 'bone', 'bowl', 'doghouse', 'wild', 'scatter'],
            'symbolWeights': {
                'reel1': [15, 12, 10, 8, 7, 6, 5, 4, 3, 2, 0, 10],
                'reel2': [12, 10, 8, 7, 6, 5, 4, 3, 2, 1, 5, 8],
                'reel3': [10, 8, 7, 6, 5, 4, 3, 2, 1, 1, 6, 8],
                'reel4': [12, 10, 8, 7, 6, 5, 4, 3, 2, 1, 5, 8],
                'reel5': [15, 12, 10, 8, 7, 6, 5, 4, 3, 2, 0, 10]
            },
            'paytable': {
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
            'scatterPays': {3: 5, 4: 20, 5: 100},
            'freeSpins': {3: 12, 4: 20, 5: 50},
            'betSteps': [0.2, 0.5, 1, 2, 5, 10, 20, 50, 100],
            'startingBalance': 1000,
            'reelDelay': 100,
            'reelStopDelay': 300,
            'spinDuration': 3000,
            'symbolHeight': 120,
            'visibleSymbols': 3
        }
        self.state = {
            'balance': self.config['startingBalance'],
            'bet': 1,
            'win': 0,
            'spinning': False,
            'freeSpins': 0,
            'freeSpinsMultiplier': 1,
            'stickyWilds': []
        }
        self.generate_symbols()

    def generate_symbols(self):
        if not os.path.exists('symbols'):
            os.makedirs('symbols')

        SYMBOL_SIZE = (100, 100)
        BACKGROUND_COLOR = (30, 40, 60)
        
        symbols = [
            ('9', '9', (255, 215, 0)), ('10', '10', (255, 215, 0)),
            ('j', 'J', (70, 130, 180)), ('q', 'Q', (220, 20, 60)),
            ('k', 'K', (50, 205, 50)), ('a', 'A', (138, 43, 226)),
            ('collar', 'C', (192, 192, 192)), ('bone', 'B', (210, 180, 140)),
            ('bowl', 'W', (255, 165, 0)), ('doghouse', 'D', (139, 69, 19)),
            ('wild', 'WILD', (255, 215, 0)), ('scatter', 'SC', (255, 0, 0))
        ]

        for symbol in symbols:
            img = Image.new('RGB', SYMBOL_SIZE, BACKGROUND_COLOR)
            draw = ImageDraw.Draw(img)
            
            try:
                font_size = 20 if symbol[0] in ['wild', 'scatter'] else 40
                font = ImageFont.truetype("arial.ttf", font_size)
            except:
                font = ImageFont.load_default()
            
            text_width, text_height = draw.textsize(symbol[1], font=font)
            position = ((SYMBOL_SIZE[0] - text_width) // 2, (SYMBOL_SIZE[1] - text_height) // 2)
            draw.text(position, symbol[1], font=font, fill=symbol[2])
            
            if symbol[0] == 'wild':
                draw.rectangle([5, 5, SYMBOL_SIZE[0]-5, SYMBOL_SIZE[1]-5], outline=(255, 215, 0), width=3)
            elif symbol[0] == 'scatter':
                draw.ellipse([10, 10, SYMBOL_SIZE[0]-10, SYMBOL_SIZE[1]-10], outline=(255, 0, 0), width=3)
            
            img.save(f'symbols/{symbol[0]}.png')

    def spin(self):
        if self.state['spinning'] or self.state['balance'] < self.state['bet']:
            return False

        self.state['balance'] -= self.state['bet']
        self.state['win'] = 0
        self.state['spinning'] = True
        
        if self.state['freeSpins'] == 0:
            self.state['stickyWilds'] = []
        
        return True

    def stop(self):
        if not self.state['spinning']:
            return None

        self.state['spinning'] = False
        
        # Здесь должна быть логика определения выигрыша
        # Для демо-версии просто вернем случайный выигрыш
        import random
        win_multiplier = random.choice([0, 0, 0, 0.5, 1, 2, 5, 10, 20])
        self.state['win'] = self.state['bet'] * win_multiplier
        self.state['balance'] += self.state['win']
        
        # 20% chance to trigger free spins
        if random.random() < 0.2:
            self.state['freeSpins'] = random.choice([10, 15, 20])
        
        return {
            'balance': self.state['balance'],
            'win': self.state['win'],
            'freeSpins': self.state['freeSpins'],
            'symbols': [random.sample(self.config['symbols'][:-2], 3) for _ in range(5)]
        }

# ==================== Flask Web App ====================
app = Flask(__name__)
slot_machine = DogHouseSlot()

@app.route('/api/spin', methods=['POST'])
def spin():
    if slot_machine.spin():
        return jsonify(slot_machine.stop())
    return jsonify({'error': 'Cannot spin'})

@app.route('/api/state', methods=['GET'])
def get_state():
    return jsonify({
        'balance': slot_machine.state['balance'],
        'bet': slot_machine.state['bet'],
        'freeSpins': slot_machine.state['freeSpins']
    })

@app.route('/api/change_bet', methods=['POST'])
def change_bet():
    data = request.json
    if 'bet' in data and data['bet'] in slot_machine.config['betSteps']:
        slot_machine.state['bet'] = data['bet']
        return jsonify({'success': True})
    return jsonify({'error': 'Invalid bet'})

# ==================== Telegram Bot Handlers ====================
@bot.message_handler(commands=['start'])
def send_welcome(message):
    markup = InlineKeyboardMarkup()
    markup.add(InlineKeyboardButton(
        "🎮 Играть в Dog House", 
        web_app=WebAppInfo(url=WEBAPP_URL)
    ))
    
    bot.send_message(
        message.chat.id,
        "🐶 Добро пожаловать в Dog House Slots!\n\n"
        "Это демо-версия слота с виртуальными кредитами.\n"
        "Нажмите кнопку ниже, чтобы начать играть!",
        reply_markup=markup
    )

# ==================== Main Execution ====================
if __name__ == "__main__":
    # Set up Telegram menu button
    bot.set_chat_menu_button(
        menu_button=MenuButtonWebApp(
            type="web_app",
            text="🎰 Dog House Slots",
            web_app=WebAppInfo(url=WEBAPP_URL)
    )
    
    print("Бот запущен и готов к работе!")
    print(f"WebApp доступен по адресу: {WEBAPP_URL}")
    
    # Note: In production you would run Flask and bot in separate processes
    # For demo purposes we'll just run the bot
    bot.infinity_polling()
