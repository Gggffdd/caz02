import telebot
from telebot.types import MenuButtonWebApp, WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton

TOKEN = "ВАШ_ТОКЕН_БОТА"
WEBAPP_URL = "https://ваш-домен.netlify.app"

bot = telebot.TeleBot(TOKEN)

# Устанавливаем кнопку меню
bot.set_chat_menu_button(
    menu_button=MenuButtonWebApp(
        text="🎰 Dog House Slots",
        web_app=WebAppInfo(url=WEBAPP_URL)
    )
)

# Создаем inline-кнопку для запуска игры
@bot.message_handler(commands=['start'])
def send_welcome(message):
    markup = InlineKeyboardMarkup()
    markup.add(InlineKeyboardButton("Играть в Dog House", web_app=WebAppInfo(url=WEBAPP_URL)))
    
    bot.send_message(
        message.chat.id,
        "🐶 Добро пожаловать в Dog House Slots!\n\n"
        "Это демо-версия слота с виртуальными кредитами. Нажмите кнопку ниже, чтобы начать играть!",
        reply_markup=markup
    )

bot.infinity_polling()
