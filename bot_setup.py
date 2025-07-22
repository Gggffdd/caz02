import telebot
from telebot.types import MenuButtonWebApp, WebAppInfo

TOKEN = "7523520150:AAGMPibPAl8D0I0E6ZeNR3zuIp0qKcshXN0"
WEBAPP_URL = "https://benevolent-basbousa-044e27.netlify.app"

bot = telebot.TeleBot(TOKEN)

# Устанавливаем кнопку меню
bot.set_chat_menu_button(
    menu_button=MenuButtonWebApp(
        text="Играть в Dog House",
        web_app=WebAppInfo(url=WEBAPP_URL)
)

# Обработчик для вывода денег
@bot.message_handler(func=lambda m: True)
def handle_messages(message):
    if message.web_app_data:
        data = json.loads(message.web_app_data.data)
        if data['action'] == 'cashout':
            bot.send_message(
                message.chat.id,
                f"💰 Вы вывели {data['amount']} ₽!\n"
                "Деньги будут зачислены в течение 24 часов."
            )

bot.infinity_polling()
