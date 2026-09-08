#!/usr/bin/env python3
"""Экспортирует вопросы без ответов и вариантов для независимой генерации."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
source_path = ROOT / "questions.json"
target_path = ROOT / "questions-only.json"

with source_path.open(encoding="utf-8") as source:
    source_data = json.load(source)

questions = []
for item in source_data["questions"]:
    questions.append({
        "id": item["id"],
        "question": item["question"],
        "category": item.get("category", ""),
        "tags": item.get("tags", []),
    })

output = {
    "title": "Вопросы для независимой генерации ответов",
    "description": "Файл содержит только вопросы и контекст. Поля answer, explanation, options и correctIndex намеренно исключены.",
    "questions": questions,
}

with target_path.open("w", encoding="utf-8") as target:
    json.dump(output, target, ensure_ascii=False, indent=1)
    target.write("\n")

print(f"экспортировано вопросов: {len(questions)}")
print(f"файл: {target_path}")
