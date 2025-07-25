import telebot
from telebot.types import MenuButtonWebApp, WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton
from flask import Flask, request, jsonify, send_from_directory
import os
from PIL import Image, ImageDraw, ImageFont, ImageOps
import random
import time
import json
from threading import Thread
import numpy as np
from io import BytesIO
import base64

# ==================== Telegram Bot Setup ====================
TOKEN = "7523520150:AAGMPibPAl8D0I0E6ZeNR3zuIp0qKcshXN0"
WEBAPP_URL = "https://benevolent-basbousa-044e27.netlify.app"
bot = telebot.TeleBot(TOKEN)

# ==================== Slot Machine Configuration ====================
class DogHouseSlot:
    def __init__(self, user_id=None):
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
        self.user_id = user_id or "default"
        self.state_file = f"user_{self.user_id}.json"
        self.load_state()
        
        if not os.path.exists('symbols'):
            self.generate_symbols()

    def load_state(self):
        try:
            if os.path.exists(self.state_file):
                with open(self.state_file, 'r') as f:
                    self.state = json.load(f)
            else:
                self.reset_state()
        except:
            self.reset_state()

    def save_state(self):
        with open(self.state_file, 'w') as f:
            json.dump(self.state, f)

    def reset_state(self):
        self.state = {
            'balance': self.config['startingBalance'],
            'bet': 1,
            'win': 0,
            'spinning': False,
            'freeSpins': 0,
            'freeSpinsMultiplier': 1,
            'stickyWilds': [],
            'lastSpinTime': 0
        }
        self.save_state()

    def generate_symbols(self):
        os.makedirs('symbols', exist_ok=True)

        SYMBOL_SIZE = (100, 100)
        COLORS = {
            '9': (255, 215, 0), '10': (255, 215, 0),
            'j': (70, 130, 180), 'q': (220, 20, 60),
            'k': (50, 205, 50), 'a': (138, 43, 226),
            'collar': (192, 192, 192), 'bone': (210, 180, 140),
            'bowl': (255, 165, 0), 'doghouse': (139, 69, 19),
            'wild': (255, 215, 0), 'scatter': (255, 0, 0)
        }
        
        # Создание сложных текстур для символов
        def create_textured_background(color, size):
            # Градиентный фон
            base = Image.new('RGB', size, color)
            draw = ImageDraw.Draw(base)
            
            # Добавление текстур
            for _ in range(50):
                x, y = random.randint(0, size[0]), random.randint(0, size[1])
                r = random.randint(2, 10)
                draw.ellipse([x, y, x+r, y+r], fill=self.adjust_color(color, 30))
            
            # Добавление бликов
            for _ in range(10):
                x, y = random.randint(0, size[0]), random.randint(0, size[1])
                r = random.randint(3, 8)
                draw.ellipse([x, y, x+r, y+r], fill=self.adjust_color(color, 80))
            
            # Добавление тени
            shadow = Image.new('RGBA', size, (0, 0, 0, 0))
            draw_shadow = ImageDraw.Draw(shadow)
            draw_shadow.rectangle([5, 5, size[0]-5, size[1]-5], fill=(0, 0, 0, 50))
            base = Image.alpha_composite(base.convert('RGBA'), shadow)
            
            return base
        
        def create_doghouse_symbol(size):
            img = Image.new('RGBA', size, (0, 0, 0, 0))
            draw = ImageDraw.Draw(img)
            
            # Основа будки
            draw.rectangle([20, 40, 80, 90], fill=(139, 69, 19))
            
            # Крыша
            draw.polygon([(10, 40), (50, 10), (90, 40)], fill=(160, 82, 45))
            
            # Дверь
            draw.rectangle([45, 60, 55, 90], fill=(101, 67, 33))
            
            # Окна
            draw.rectangle([30, 50, 40, 60], fill=(135, 206, 250))
            draw.rectangle([60, 50, 70, 60], fill=(135, 206, 250))
            
            return img
        
        def create_bone_symbol(size):
            img = Image.new('RGBA', size, (0, 0, 0, 0))
            draw = ImageDraw.Draw(img)
            
            # Основная часть
            draw.rectangle([30, 45, 70, 55], fill=(245, 222, 179))
            
            # Концы кости
            draw.ellipse([25, 40, 45, 60], fill=(245, 222, 179))
            draw.ellipse([55, 40, 75, 60], fill=(245, 222, 179))
            
            return img
        
        def create_bowl_symbol(size):
            img = Image.new('RGBA', size, (0, 0, 0, 0))
            draw = ImageDraw.Draw(img)
            
            # Миска
            draw.ellipse([20, 50, 80, 90], fill=(210, 180, 140))
            draw.ellipse([25, 45, 75, 85], fill=(255, 165, 0))
            
            return img
        
        def create_collar_symbol(size):
            img = Image.new('RGBA', size, (0, 0, 0, 0))
            draw = ImageDraw.Draw(img)
            
            # Ошейник
            draw.ellipse([30, 40, 70, 80], fill=(192, 192, 192))
            draw.ellipse([35, 45, 65, 75], fill=(220, 220, 220))
            
            # Пряжка
            draw.rectangle([47, 47, 53, 53], fill=(255, 215, 0))
            
            return img
        
        def create_scatter_symbol(size):
            img = Image.new('RGBA', size, (0, 0, 0, 0))
            draw = ImageDraw.Draw(img)
            
            # Внешний круг
            draw.ellipse([10, 10, 90, 90], fill=(255, 50, 50, 200))
            
            # Внутренний круг
            draw.ellipse([20, 20, 80, 80], fill=(255, 100, 100, 220))
            
            # Звездочка
            points = []
            for i in range(5):
                angle = 2 * np.pi * i / 5 - np.pi/2
                points.append((50 + 25 * np.cos(angle), 50 + 25 * np.sin(angle)))
                angle += 2 * np.pi / 10
                points.append((50 + 10 * np.cos(angle), 50 + 10 * np.sin(angle)))
            
            draw.polygon(points, fill=(255, 215, 0))
            
            return img
        
        def create_wild_symbol(size):
            img = Image.new('RGBA', size, (0, 0, 0, 0))
            draw = ImageDraw.Draw(img)
            
            # Внешний ромб
            draw.polygon([(50, 10), (90, 50), (50, 90), (10, 50)], fill=(255, 215, 0, 220))
            
            # Внутренний ромб
            draw.polygon([(50, 25), (75, 50), (50, 75), (25, 50)], fill=(255, 165, 0, 240))
            
            # Буква W
            draw.polygon([(30, 60), (40, 40), (50, 60), (60, 40), (70, 60), (65, 65), (50, 45), (35, 65)], fill=(0, 0, 0))
            
            return img
        
        self.adjust_color = lambda color, amount: tuple(max(0, min(255, c + amount)) for c in color)
        
        for symbol in self.config['symbols']:
            if symbol == 'doghouse':
                img = create_doghouse_symbol(SYMBOL_SIZE)
            elif symbol == 'bone':
                img = create_bone_symbol(SYMBOL_SIZE)
            elif symbol == 'bowl':
                img = create_bowl_symbol(SYMBOL_SIZE)
            elif symbol == 'collar':
                img = create_collar_symbol(SYMBOL_SIZE)
            elif symbol == 'scatter':
                img = create_scatter_symbol(SYMBOL_SIZE)
            elif symbol == 'wild':
                img = create_wild_symbol(SYMBOL_SIZE)
            else:
                # Для стандартных символов
                img = create_textured_background(COLORS[symbol], SYMBOL_SIZE)
                draw = ImageDraw.Draw(img)
                
                try:
                    font_size = 40 if symbol not in ['wild', 'scatter'] else 30
                    font = ImageFont.truetype("arialbd.ttf", font_size)
                except:
                    font = ImageFont.load_default()
                
                text = symbol.upper() if symbol in ['wild', 'scatter'] else symbol
                text_width, text_height = draw.textsize(text, font=font)
                position = ((SYMBOL_SIZE[0] - text_width) // 2, (SYMBOL_SIZE[1] - text_height) // 2)
                
                # Тень текста
                shadow_position = (position[0] + 2, position[1] + 2)
                draw.text(shadow_position, text, font=font, fill=(0, 0, 0, 128))
                
                # Основной текст
                draw.text(position, text, font=font, fill=(255, 255, 255))
                
                # Обводка
                if symbol == 'wild':
                    draw.rectangle([5, 5, SYMBOL_SIZE[0]-5, SYMBOL_SIZE[1]-5], outline=(255, 215, 0), width=3)
                elif symbol == 'scatter':
                    draw.ellipse([10, 10, SYMBOL_SIZE[0]-10, SYMBOL_SIZE[1]-10], outline=(255, 0, 0), width=3)
            
            # Добавление блестящего эффекта
            shine = Image.new('RGBA', SYMBOL_SIZE, (0, 0, 0, 0))
            draw_shine = ImageDraw.Draw(shine)
            draw_shine.ellipse([-30, -30, 70, 70], fill=(255, 255, 255, 100))
            img = Image.alpha_composite(img, shine)
            
            img.save(f'symbols/{symbol}.png')

    def spin(self):
        current_time = time.time()
        if (self.state['spinning'] or 
            self.state['balance'] < self.state['bet'] or 
            current_time - self.state['lastSpinTime'] < 0.5):
            return False

        self.state['balance'] -= self.state['bet']
        self.state['win'] = 0
        self.state['spinning'] = True
        self.state['lastSpinTime'] = current_time
        
        if self.state['freeSpins'] == 0:
            self.state['stickyWilds'] = []
        
        self.save_state()
        return True

    def stop(self):
        if not self.state['spinning']:
            return None

        # Generate reel results
        reels = []
        for i in range(5):
            reel_name = f'reel{i+1}'
            weights = self.config['symbolWeights'][reel_name]
            total_weight = sum(weights)
            reel = []
            
            for _ in range(3):  # 3 visible positions
                rand_val = random.uniform(0, total_weight)
                for idx, weight in enumerate(weights):
                    if rand_val < weight:
                        reel.append(self.config['symbols'][idx])
                        break
                    rand_val -= weight
            reels.append(reel)
        
        # Calculate wins
        win_amount = 0
        scatter_count = 0
        free_spins_triggered = False
        
        # Count scatters
        for reel in reels:
            for symbol in reel:
                if symbol == 'scatter':
                    scatter_count += 1
        
        # Scatter win
        if scatter_count >= 3:
            win_amount += self.config['scatterPays'][min(scatter_count, 5)] * self.state['bet']
            free_spins_triggered = True
        
        # Line wins
        paylines = [
            [1, 1, 1, 1, 1],  # Middle line
            [0, 0, 0, 0, 0],  # Top line
            [2, 2, 2, 2, 2],  # Bottom line
            [1, 0, 0, 0, 1],  # V pattern
            [1, 2, 2, 2, 1]   # A pattern
        ]
        
        for line in paylines:
            symbols = [reels[i][line[i]] for i in range(5)]
            
            # Check for wilds and count matches
            symbol_to_match = None
            consecutive = 0
            multiplier = 1
            
            for symbol in symbols:
                if symbol == 'wild':
                    consecutive += 1
                    multiplier *= random.choice([2, 3])  # Wild multiplier
                elif symbol_to_match is None and symbol != 'scatter':
                    symbol_to_match = symbol
                    consecutive += 1
                elif symbol == symbol_to_match:
                    consecutive += 1
                else:
                    break
            
            if consecutive >= 3 and symbol_to_match:
                win_multiplier = self.config['paytable'][symbol_to_match][consecutive - 3]
                win_amount += win_multiplier * self.state['bet'] * multiplier
        
        # Free spins trigger
        free_spins = 0
        if free_spins_triggered and self.state['freeSpins'] == 0:
            free_spins = self.config['freeSpins'][min(scatter_count, 5)]
        
        # Update state
        self.state['balance'] += win_amount
        self.state['win'] = win_amount
        self.state['spinning'] = False
        
        if free_spins > 0:
            self.state['freeSpins'] = free_spins
        elif self.state['freeSpins'] > 0:
            self.state['freeSpins'] -= 1
        
        self.save_state()
        
        return {
            'balance': self.state['balance'],
            'win': win_amount,
            'freeSpins': self.state['freeSpins'],
            'symbols': reels
        }

# ==================== Flask Web App ====================
app = Flask(__name__)
app.secret_key = 'your_secret_key_here'

# User session management
user_slots = {}

def get_slot_machine(user_id):
    if user_id not in user_slots:
        user_slots[user_id] = DogHouseSlot(user_id)
    return user_slots[user_id]

@app.route('/api/spin', methods=['POST'])
def spin():
    user_id = request.json.get('user_id', 'default')
    slot_machine = get_slot_machine(user_id)
    
    if slot_machine.spin():
        result = slot_machine.stop()
        return jsonify(result)
    return jsonify({'error': 'Cannot spin'}), 400

@app.route('/api/state', methods=['GET'])
def get_state():
    user_id = request.args.get('user_id', 'default')
    slot_machine = get_slot_machine(user_id)
    return jsonify({
        'balance': slot_machine.state['balance'],
        'bet': slot_machine.state['bet'],
        'freeSpins': slot_machine.state['freeSpins']
    })

@app.route('/api/change_bet', methods=['POST'])
def change_bet():
    user_id = request.json.get('user_id', 'default')
    new_bet = request.json.get('bet')
    slot_machine = get_slot_machine(user_id)
    
    if new_bet in slot_machine.config['betSteps']:
        slot_machine.state['bet'] = new_bet
        slot_machine.save_state()
        return jsonify({'success': True})
    return jsonify({'error': 'Invalid bet'}), 400

@app.route('/api/reset', methods=['POST'])
def reset_game():
    user_id = request.json.get('user_id', 'default')
    slot_machine = get_slot_machine(user_id)
    slot_machine.reset_state()
    return jsonify({'success': True})

# Serve symbols
@app.route('/symbols/<filename>')
def serve_symbol(filename):
    return send_from_directory('symbols', filename)

# ==================== Telegram Bot Handlers ====================
@bot.message_handler(commands=['start', 'help'])
def send_welcome(message):
    markup = InlineKeyboardMarkup()
    markup.add(InlineKeyboardButton(
        "🎮 Play Dog House Slots", 
        web_app=WebAppInfo(url=WEBAPP_URL)
    ))
    
    bot.send_message(
        message.chat.id,
        "🐶 Welcome to Dog House Slots!\n\n"
        "This is a demo version with virtual credits.\n"
        "Click the button below to start playing!",
        reply_markup=markup
    )

@bot.message_handler(commands=['balance'])
def show_balance(message):
    slot_machine = get_slot_machine(str(message.chat.id))
    bot.send_message(
        message.chat.id,
        f"💰 Your current balance: {slot_machine.state['balance']:.2f} credits\n"
        f"🎰 Current bet: {slot_machine.state['bet']:.2f}\n"
        f"🎁 Free spins: {slot_machine.state['freeSpins']}"
    )

# ==================== Main Execution ====================
def run_bot():
    bot.infinity_polling()

def run_flask():
    app.run(host='0.0.0.0', port=5000)

if __name__ == "__main__":
    # Set up Telegram menu button
    bot.set_chat_menu_button(
        menu_button=MenuButtonWebApp(
            type="web_app",
            text="🎰 Dog House Slots",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )
    )
    
    print("Bot is running and ready!")
    print(f"WebApp available at: {WEBAPP_URL}")
    
    # Run both in separate threads
    bot_thread = Thread(target=run_bot)
    flask_thread = Thread(target=run_flask)
    
    bot_thread.start()
    flask_thread.start()
    
    bot_thread.join()
    flask_thread.join()
