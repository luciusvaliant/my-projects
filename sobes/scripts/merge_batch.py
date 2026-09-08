#!/usr/bin/env python3
import json, sys

BATCH = sys.argv[1]
MAIN = '/home/oem/MY/my-projects/sobes/questions.json'

with open(MAIN) as f:
    data = json.load(f)
questions = data['questions']
max_id = max(q['id'] for q in questions)
existing = set(q['question'].strip().lower() for q in questions)

with open(BATCH) as f:
    batch = json.load(f)

added = 0
for item in batch:
    t = item['question'].strip().lower()
    if t in existing:
        continue
    existing.add(t)
    max_id += 1
    questions.append({
        'id': max_id,
        'direction': [item['group']],
        'tags': item['tags'],
        'question': item['question'],
        'answer': item['answer'],
        'options': item['options'],
        'correctIndex': item['correctIndex'],
        'explanation': item['explanation'],
    })
    added += 1

with open(MAIN, 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=1)
print(f'добавлено {added}, всего теперь {len(questions)}')
