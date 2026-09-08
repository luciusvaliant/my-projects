#!/usr/bin/env python3
"""Расширяет ответы учебным объяснением и практическим примером."""
import argparse
import json
from pathlib import Path

DEFAULT_PATH = Path(__file__).resolve().parents[1] / "questions.json"
MARKER = "Практический пример:"


def compact(value: object) -> str:
    return " ".join(str(value or "").split()).strip()


def make_example(item: dict) -> str:
    return compact(item.get("example"))


def enrich(item: dict) -> str:
    options = item.get("options") or []
    index = item.get("correctIndex", -1)
    correct = options[index].strip() if isinstance(index, int) and 0 <= index < len(options) else compact(item.get("answer"))
    parts = [correct] if correct else []
    example = make_example(item)
    if example:
        parts.append(f"{MARKER} {example}")
    return "\n\n".join(parts)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--path", type=Path, default=DEFAULT_PATH)
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    with args.path.open(encoding="utf-8") as stream:
        data = json.load(stream)
    updated = 0
    for item in data["questions"]:
        answer = enrich(item)
        if answer != item.get("answer", ""):
            item["answer"] = answer
            updated += 1
    print(f"ответов обновлено: {updated} из {len(data['questions'])}")
    if args.write:
        with args.path.open("w", encoding="utf-8") as stream:
            json.dump(data, stream, ensure_ascii=False, indent=1)
            stream.write("\n")


if __name__ == "__main__":
    main()
