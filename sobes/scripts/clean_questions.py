#!/usr/bin/env python3
"""Удаляет неуместные вопросы и восстанавливает ответы из правильных вариантов."""
import argparse
import json
import re
from pathlib import Path

DEFAULT_PATH = Path(__file__).resolve().parents[1] / "questions.json"
LOW_QUALITY_ID = 4535

# Вопросы с такими формулировками не проверяют знания и часто не имеют
# самостоятельного контекста: это остатки автоматически сгенерированных
# поведенческих/уточняющих карточек.
INAPPROPRIATE_PATTERNS = [
    # Поведенческие вопросы без технической проверяемой части.
    r"^расскажите о себе(?:[,:.]|\?|$)",
    r"^расскажите о себе,? о наиболее интересных проектах",
    r"^почему вы решили (уйти|сменить|искать)",
    r"^почему вы (сейчас )?находитесь в поиске",
    r"^как вы считаете,? какой был бы идеальный кандидат",
    r"^насколько комфортно вам работать",
    r"^какие у вас .* достиж",
    r"расскажите о сложном техническом конфликте",
    r"расскажите о конфликтной ситуации",
    r"расскажите о ситуации, когда вы столкнулись",
    r"^расскажите о вашем опыте работы\??$",
    r"^расскажите о вашем опыте на предыдущем месте",
    r"^расскажите о вашем опыте и ключевых навыках",
    r"^расскажите о вашем опыте и приведите пример",
    # Уточнения, у которых нет предмета и которые нельзя отвечать без
    # неизвестного контекста предыдущего вопроса.
    r"с какими .* вы сталкивались в своей работе\??$",
    r"сталкивались ли вы с каким-либо.* в своей работе",
    r"был ли у вас подобный опыт",
    r"сталкивались ли вы с подобными ситуациями",
    r"расскажите о вашем опыте использования данной технологии",
    r"использовался ли этот инструмент в ваших проектах",
    r"в чём заключалась ваша работа с",
    r"^что входило в состав проекта\??$",
    r"^расскажите подробнее о команде\??$",
]

# Явно повреждённые или лишённые предмета вопросы.
INVALID_PATTERNS = [
    r"яйси зейн",
    r"\bpIT0\b",
    r"расскажите подробнее о команде\??$",
    r"что входило в состав проекта\??$",
    r"для чего нужна команда\??$",
]


def is_inappropriate(item: dict) -> bool:
    question = item.get("question", "")
    text = " ".join(question.split()).strip()
    if item.get("id", 0) >= LOW_QUALITY_ID:
        return True
    return any(re.search(pattern, text, re.IGNORECASE) for pattern in INAPPROPRIATE_PATTERNS + INVALID_PATTERNS)


def polished_answer(item: dict) -> str:
    options = item.get("options") or []
    index = item.get("correctIndex", -1)
    correct = options[index].strip() if isinstance(index, int) and 0 <= index < len(options) else ""
    explanation = " ".join(str(item.get("explanation", "")).split()).strip()
    if not correct:
        return " ".join(str(item.get("answer", "")).split()).strip()
    if not explanation or explanation.rstrip(".") == correct.rstrip("."):
        return correct
    # Правильный вариант обычно содержит прикладные детали, а пояснение
    # добавляет смысл и ограничения; объединяем их в один цельный ответ.
    return f"{correct.rstrip('.')} . {explanation.rstrip('.')} .".replace(" .", ".")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--path", type=Path, default=DEFAULT_PATH)
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()

    with args.path.open(encoding="utf-8") as stream:
        data = json.load(stream)

    original = data["questions"]
    kept = [item for item in original if not is_inappropriate(item)]
    removed = len(original) - len(kept)
    data["questions"] = kept
    repaired = 0
    for item in kept:
        new_answer = polished_answer(item)
        if new_answer != item.get("answer", ""):
            repaired += 1
            item["answer"] = new_answer

    print(f"вопросов: {len(original)} -> {len(kept)}")
    print(f"удалено неуместных: {removed}")
    print(f"ответов обновлено: {repaired}")
    if args.write:
        with args.path.open("w", encoding="utf-8") as stream:
            json.dump(data, stream, ensure_ascii=False, indent=1)
            stream.write("\n")


if __name__ == "__main__":
    main()
