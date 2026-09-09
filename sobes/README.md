# Собеседование IT

Веб-приложение для подготовки к техническим собеседованиям в формате карточек вопросов и ответов. Работает в любом браузере — без установки и сборки.

**Открыть:** <https://luciusvaliant.github.io/my-projects/sobes/>

## Возможности

- **3735 вопросов** по 33 категориям направлений и технологий.
- Выбор категории или «Все вопросы» — на стартовом экране карточки категорий с иконками и счётчиком вопросов.
- Выбор количества вопросов за раунд: 5, 10, 15, 20, 30, 40, 50 или все.
- Случайный порядок вопросов в каждом раунде.
- Для каждого вопроса — ответ и отдельное пояснение с ограничениями и нюансами.
- Прогресс-бар с номером текущего вопроса и категорией.
- Экран результатов по завершении раунда.
- Адаптивный интерфейс для компьютеров и мобильных устройств.

## Категории

Backend (прочее), Frontend (прочее), Backend Java, DevOps, Frontend React, Fullstack, Backend Go, Backend C#, QA Manual, Backend Python, QA Automation, Data Engineer, Mobile Android, Backend Rust, Backend C++, System Analyst, Backend Node.js, Бизнес-аналитик, ML Engineer, 1C, Frontend Vue, Backend PHP, Data Scientist, Data Analyst, Security, Sysadmin, Tech Support, Engineering Manager, Embedded, Product Manager, Mobile iOS, Mobile React Native, Low-code.

## Запуск

Приложение загружает банк вопросов через `fetch('questions.json')`, поэтому нужен локальный HTTP-сервер.

```bash
python3 -m http.server 8080
```

Затем откройте `http://localhost:8080` в браузере.

## Структура

```text
sobes/
├── README.md       # Описание и инструкция запуска
├── index.html      # Интерфейс приложения (HTML + CSS + JS в одном файле)
└── questions.json  # Банк вопросов и ответов
```

## Формат вопроса

```json
{
  "id": 1616,
  "category": "Frontend (прочее)",
  "tags": ["frontend", "Performance", "middle"],
  "question": "Что такое кэширование в браузере и HTTP-заголовки?",
  "answer": "Подробный и самостоятельный ответ",
  "explanation": "Дополнительное пояснение и важные ограничения"
}
```

`questions.json` — единственный источник данных приложения. Чтобы добавить или исправить карточку, отредактируйте соответствующий объект в этом файле, сохранив уникальный `id`.
