import telebot
from telebot.types import MenuButtonWebApp, WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton

# Токен вашего бота (замените на реальный)
TOKEN = "7523520150:AAGMPibPAl8D0I0E6ZeNR3zuIp0qKcshXN0"
# URL вашего Web-приложения
WEBAPP_URL = "https://benevolent-basbousa-044e27.netlify.app"

# Инициализация бота
bot = telebot.TeleBot(TOKEN)

# Установка кнопки меню в чате (открывает WebApp)
bot.set_chat_menu_button(
    menu_button=MenuButtonWebApp(
        type="web_app",
        text="🎰 Dog House Slots",
        web_app=WebAppInfo(url=WEBAPP_URL)
    )  # Закрывающая скобка для set_chat_menu_button

# Обработчик команды /start
@bot.message_handler(commands=['start'])
def send_welcome(message):
    markup = InlineKeyboardMarkup()
    markup.add(InlineKeyboardButton(
        "🎮 Играть в Dog House", 
        web_app=WebAppInfo(url=WEBAPP_URL)
    ))  # Закрывающая скобка для add()
    
    bot.send_message(
        message.chat.id,
        "🐶 Добро пожаловать в Dog House Slots!\n\n"
        "Это демо-версия слота с виртуальными кредитами.\n"
        "Нажмите кнопку ниже, чтобы начать играть!",
        reply_markup=markup
    )

# Запуск бота
if __name__ == "__main__":
    print("Бот запущен и готов к работе!")
    print(f"WebApp доступен по адресу: {WEBAPP_URL}")
    bot.infinity_polling()
