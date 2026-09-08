#!/usr/bin/env python3
"""Менеджер батчей для генерации ответов.
- Читает questions-only.json
- Отслеживает уже обработанные id (из answers-*.json)
- Выдаёт следующий батч по N вопросов в порядке id по возрастанию
- Поддерживает команды: next, status, append, verify
"""
import json
import os
import re
import sys
from pathlib import Path

SOBES = Path(__file__).parent
SRC = SOBES / "questions-only.json"
BATCH_SIZE = 100


def slug(cat: str) -> str:
    s = cat.lower()
    s = re.sub(r"[^a-z0-9а-я]+", "-", s, flags=re.UNICODE)
    s = re.sub(r"-+", "-", s).strip("-")
    return s or "other"


def answer_files():
    return sorted(SOBES.glob("answers-*.json"))


def processed_ids() -> set:
    done = set()
    for f in answer_files():
        try:
            d = json.loads(f.read_text(encoding="utf-8"))
            for a in d.get("answers", []):
                if "id" in a:
                    done.add(a["id"])
        except Exception as e:
            print(f"WARN: cannot read {f}: {e}", file=sys.stderr)
    return done


def load_questions():
    d = json.loads(SRC.read_text(encoding="utf-8"))
    qs = d["questions"]
    qs.sort(key=lambda q: q["id"])
    return qs


def cmd_status():
    qs = load_questions()
    done = processed_ids()
    total = len(qs)
    print(f"total={total} done={len(done)} remaining={total - len(done)}")
    rem = [q for q in qs if q["id"] not in done]
    if rem:
        print(f"next ids: {[q['id'] for q in rem[:BATCH_SIZE]]}")
        print(f"next category: {rem[0]['category']}")


def cmd_next():
    qs = load_questions()
    done = processed_ids()
    rem = [q for q in qs if q["id"] not in done]
    batch = rem[:BATCH_SIZE]
    print(json.dumps({"batch": batch}, ensure_ascii=False, indent=2))


def cmd_append(json_path: str):
    """Добавить ответы из файла в соответствующие category-файлы.
    Файл должен содержать {"answers":[...]}.
    """
    d = json.loads(Path(json_path).read_text(encoding="utf-8"))
    answers = d.get("answers", [])
    by_cat = {}
    for a in answers:
        # нужен category — возьмём из источника по id
        by_cat.setdefault(a.get("_category", "unknown"), []).append(a)

    # загрузим категории из источника
    cat_by_id = {q["id"]: q["category"] for q in load_questions()}

    grouped = {}
    for a in answers:
        cat = cat_by_id.get(a["id"], a.get("_category", "unknown"))
        a.pop("_category", None)
        grouped.setdefault(cat, []).append(a)

    for cat, items in grouped.items():
        f = SOBES / f"answers-{slug(cat)}.json"
        if f.exists():
            existing = json.loads(f.read_text(encoding="utf-8"))
        else:
            existing = {"answers": []}
        existing_ids = {a["id"] for a in existing["answers"]}
        for a in items:
            if a["id"] in existing_ids:
                # заменим
                existing["answers"] = [
                    a if x["id"] == a["id"] else x for x in existing["answers"]
                ]
            else:
                existing["answers"].append(a)
        existing["answers"].sort(key=lambda x: x["id"])
        f.write_text(
            json.dumps(existing, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        print(f"updated {f.name}: +{len(items)} (total {len(existing['answers'])})")


def cmd_verify():
    qs = load_questions()
    src_ids = {q["id"] for q in qs}
    done = processed_ids()
    missing = src_ids - done
    extra = done - src_ids
    print(f"src={len(src_ids)} done={len(done)} missing={len(missing)} extra={len(extra)}")
    if missing:
        print(f"missing sample: {sorted(missing)[:20]}")
    if extra:
        print(f"extra: {sorted(extra)[:20]}")
    # проверка дубликатов
    seen = {}
    dups = []
    for f in answer_files():
        d = json.loads(f.read_text(encoding="utf-8"))
        for a in d.get("answers", []):
            if a["id"] in seen:
                dups.append((a["id"], seen[a["id"]], f.name))
            seen[a["id"]] = f.name
    if dups:
        print(f"DUPLICATES ({len(dups)}):")
        for did, f1, f2 in dups[:20]:
            print(f"  id={did} in {f1} and {f2}")
    else:
        print("no duplicates")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: batch_manager.py {status|next|append <file>|verify}")
        sys.exit(1)
    cmd = sys.argv[1]
    if cmd == "status":
        cmd_status()
    elif cmd == "next":
        cmd_next()
    elif cmd == "append":
        cmd_append(sys.argv[2])
    elif cmd == "verify":
        cmd_verify()
    else:
        print(f"unknown command: {cmd}")
        sys.exit(1)
