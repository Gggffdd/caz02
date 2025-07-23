import telebot
from telebot.types import MenuButtonWebApp, WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton

TOKEN = "7523520150:AAGMPibPAl8D0I0E6ZeNR3zuIp0qKcshXN0"  # Замените на реальный токен
WEBAPP_URL = "https://benevolent-basbousa-044e27.netlify.app"  # Ваш URL WebApp

bot = telebot.TeleBot(TOKEN)

# Установка кнопки меню (исправленная версия)
bot.set_chat_menu_button(
    menu_button=MenuButtonWebApp(
        type="web_app",
        text="🎰 Dog House Slots",
        web_app=WebAppInfo(url=WEBAPP_URL)
)

# Обработчик команды /start
@bot.message_handler(commands=['start'])
def send_welcome(message):
    markup = InlineKeyboardMarkup()
    markup.add(
        InlineKeyboardButton(
            text="🎮 Играть в Dog House", 
            web_app=WebAppInfo(url=WEBAPP_URL)
        )
    )
    
    bot.send_message(
        chat_id=message.chat.id,
        text=(
            "🐶 Добро пожаловать в Dog House Slots!\n\n"
            "Это демо-версия слота с виртуальными кредитами. "
            "Нажмите кнопку ниже, чтобы начать играть!"
        ),
        reply_markup=markup
    )

if __name__ == "__main__":
    print("Бот успешно запущен!")
    print(f"WebApp доступен по адресу: {WEBAPP_URL}")
    bot.infinity_polling()
