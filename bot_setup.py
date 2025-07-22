import requests

# ========== НАСТРОЙКИ ========== #
BOT_TOKEN = "7523520150:AAGMPibPAl8D0I0E6ZeNR3zuIp0qKcshXN0"  # Получить у @BotFather
WEBAPP_URL = "https://benevolent-basbousa-044e27.netlify.app"  # Ваш URL на Netlify
CHAT_ID = "NONE"  # Узнать у @userinfobot (можно оставить None для первого теста)
# =============================== #

def setup_bot():
    # 1. Устанавливаем кнопку меню (постоянную)
    menu_response = requests.post(
        f"https://api.telegram.org/bot{BOT_TOKEN}/setChatMenuButton",
        json={
            "menu_button": {
                "type": "web_app",
                "text": "Открыть приложение",
                "web_app": {"url": WEBAPP_URL}
            }
        }
    )
    print("Кнопка меню установлена:", menu_response.json())

    # 2. Отправляем тестовое сообщение с inline-кнопкой
    if CHAT_ID:
        message_response = requests.post(
            f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
            json={
                "chat_id": CHAT_ID,
                "text": "Демонстрация WebApp:\nНажмите кнопку ниже, чтобы открыть приложение",
                "reply_markup": {
                    "inline_keyboard": [[{
                        "text": "🚀 Открыть WebApp",
                        "web_app": {"url": WEBAPP_URL}
                    }]]
                }
            }
        )
        print("Сообщение отправлено:", message_response.json())

if __name__ == "__main__":
    setup_bot()
