# Прогресс генерации quiz-контента

Документ для передачи контекста между сессиями (плагин / CLI / новая сессия).

## Текущее состояние

- **В базе `questions.json`:** 3735 записей после очистки
- **Уникальных текстов в `questions.json`:** 3735 (дубликатов 0)
- **Банк вопросов `enigmai/`:** 6531 записей в файлах / **6205 уникальных** текстов после дедупликации между файлами, 36 файлов по направлениям
- **Уже покрыто уникальных источников:** 6205 (покрытие 100%)
- **Осталось покрыть уникальных источников:** 0
- **Примечание:**
  - Последние ~4k записей были сгенерированы автоматически клонированием ответов/опций от похожих существующих вопросов и удалены из рабочего набора как низкокачественные.
  - Для всех 3735 оставшихся карточек ответы приведены к формату «краткий ответ → объяснение → практический пример».
  - 791 дублирующихся записей удалены, массивы `direction` и `tags` объединены — 144 записи теперь содержат несколько направлений.
- **Источник `enigmai/` исчерпан.**

## Как продолжить

1. Если нужно ещё расширять базу — искать новые источники вопросов вручную.
2. Слить в основную базу:
   ```bash
   python3 scripts/merge_batch.py /tmp/batchNNN.json
   ```
   Скрипт сам присваивает инкрементальные `id`, маппит `group` → `direction` и пропускает дубликаты по тексту вопроса.
3. Повторять до исчерпания банка.

## Формат батча (`/tmp/batchNNN.json`)

```json
[
  {
    "enigmai_id": "auto",
    "question": "Текст вопроса?",
    "group": "backend",
    "tags": ["backend", "Java", "middle"],
    "answer": "Правильный ответ — подробный.",
    "options": [
      "Правильный ответ — подробный.",
      "Неправильный вариант 1 — сопоставимой длины.",
      "Неправильный вариант 2.",
      "Неправильный вариант 3."
    ],
    "correctIndex": 0,
    "explanation": "Краткое пояснение."
  }
]
```

## Правила

- `group` — одно из: `frontend`, `backend`, `fullstack`, `devops`, `general`, `mobile`, `data`, `qa` (маппится в `direction`).
- `correctIndex` всегда `0` — правильный ответ первый в `options` (приложение перемешивает).
- Все 4 варианта сопоставимой длины и детализации — правильный не должен выделяться.
- Уровни в тегах: `junior`, `middle`, `senior`.
- Батчи по ~20 вопросов — чтобы не ловить таймауты.
- Не менять формат и логику приложения.

## Уже покрытые темы (не дублировать)

- **Frontend:** WebAssembly, Service Workers, Cache API, Web Animations, Canvas/SVG/WebGL, WebRTC, Clipboard API, a11y (ARIA, keyboard nav, contrast, focus, screen readers, forms, live regions), Testing Library, Cypress, Playwright, snapshot testing.
- **Backend общее:** system design (capacity, scaling, caching, queues, URL shortener, chat, news feed, rate limiter, notifications, search, file storage, booking, high-load, recommendations, payments, video streaming), REST/GraphQL/gRPC, OAuth2/JWT/SSO/RBAC, микросервисы (паттерны: API Gateway, BFF, Circuit Breaker, Saga, Outbox, Database per Service, Sidecar, Strangler Fig), кэш (cache-aside, write-through, write-behind, TTL), DDD (Bounded Context, агрегаты, Domain Events), Clean/Hexagonal/Layered, CQRS, Event Sourcing, ACL, API Composition.
- **Языки:** Python (индексация -1, кортежи со списками/словарями, массивы), Java (JVM/JRE/JDK, память — stack/heap/metaspace, коллекции, generics, Stream API, Optional, лямбды, потоки Thread, concurrency, volatile, GC, Spring, Spring Boot, JPA/Hibernate, Maven/Gradle, String Pool, virtual threads, HashMap, equals/hashCode, final, static, ==/equals, функциональные интерфейсы, исключения — иерархия checked/unchecked, try-with-resources, type erasure, method reference, Java 17/21, Project Reactor, @Transactional, bean scopes, примитивные/ссылочные типы, String, Object.equals/hashCode), Go (слайсы), Rust, Node.js, JavaScript (var/let/const, основы), C++, C#, Kotlin, Swift, PHP/Laravel (типы данных), Ruby/Rails.
- **DevOps:** Linux (LVM, NAT, inode, /proc, процессы), Docker, docker-compose, Kubernetes (архитектура: API Server, etcd, Scheduler, Controller Manager, kubelet, kube-proxy, runtime; Pods, Deployments, Services, Ingress, ConfigMaps/Secrets, Helm), IaC (Terraform, Ansible), GitOps, мониторинг/observability (Prometheus, метрики, логи, трейсы), деплой (blue-green, canary, rolling), feature flags, секреты, облака (AWS/GCP/Azure, serverless, S3, autoscaling, managed services, VPC, IAM, multi-region, cost optimization), service mesh.
- **БД/данные:** база данных, нормализация, индексы (B-tree, hash, составные, покрывающие), транзакции/изоляция, блокировки, N+1, миграции, партиционирование, view/materialized views, EXPLAIN, Redis, кэширование, MongoDB, Elasticsearch, графовые БД, time-series, колоночные БД, первичный/внешний ключи, репликация.
- **Распределённые системы:** CAP, eventual consistency, консенсус (Raft/Paxos), шардирование, репликация, leader election, split-brain, vector clocks, consistent hashing, gossip, 2PC, CRDT, кворум, распределённые блокировки, идемпотентность, backpressure, circuit breaker, bulkhead, retry, timeout.
- **Messaging:** Kafka (topics, partitions, consumer groups, Connect), RabbitMQ (exchanges), гарантии доставки, DLQ, порядок сообщений, CDC, outbox, stream processing (Flink, windowing), Schema Registry.
- **ОС/конкурентность:** процессы/потоки, виртуальная память, syscall, планировщик, IPC, ФС, inodes, links, фрагментация, page faults, CPU cache, context switch, kernel/user mode, bootloader, прерывания, драйверы, монолит vs микроядро, семафоры, condition variables, readers-writers, атомарные операции, lock-free/wait-free, happens-before, thread-local, пулы потоков, async/await, futures/promises, actor model, CSP, memory ordering, false sharing, ABA, work stealing, structured concurrency, cooperative/preemptive, green threads, deadlock, livelock, race condition, mutex, мониторы, spinlock, реактивное программирование.
- **Алгоритмы:** Big O, бинарный поиск, quicksort, mergesort, хеш-таблицы, связные списки, AVL/Red-Black, B-деревья, графы, BFS, DFS, Дейкстра, DP, жадные, divide & conquer, backtracking, sliding window, two pointers, топологическая сортировка, Union-Find, heap, trie, LRU, NP-полнота, Bloom filter, skip list, KMP/Rabin-Karp, A*, MST, max flow, битовые операции, префиксные суммы, segment tree, Fenwick, sparse table, regex (включая lookahead/lookbehind, катастрофический backtracking).
- **Процессы/общее:** Git Flow, trunk-based, code review, техдолг, Agile/Scrum/Kanban, estimation, ретроспективы, pair programming, менторство, онбординг, 1-on-1, делегирование, психбезопасность, bus factor, выгорание, интервью (типы, system design, behavioral/STAR), документация (типы, ADR, RFC, API docs, changelog, SemVer), инциденты (управление, postmortem, on-call), SLO/SLA/SLI, error budget.
- **Тестирование/QA:** пирамида тестирования, unit/integration/E2E, моки/стабы, TDD/BDD, покрытие, regression/smoke/load/A/B/contract/mutation/property-based, flaky tests, test doubles, функциональное/нефункциональное, статическое/динамическое, техники тест-дизайна (эквивалентные классы, граничные значения, pairwise, state-transition).
- **ML/Data:** supervised/unsupervised/RL, overfitting, cross-validation, метрики, feature engineering, регуляризация, gradient descent, NN (CNN, RNN/LSTM, transformers), transfer learning, ensembles, деревья, boosting, кластеризация, PCA, A/B, pipelines, DWH/lake, Spark, Airflow, dbt, feature store, MLOps, vector DB, RAG, fine-tuning, prompt engineering, embeddings, токенизация, attention mask, галлюцинации, temperature, context window, LLM, аналитика (KPI, funnel, cohort, retention, LTV/CAC, RFM, статзначимость, корреляция/причинность, дизайн экспериментов, multiple comparisons).
- **ФП/ООП:** чистые функции, иммутабельность, HOF, каррирование, композиция, рекурсия, мемоизация, ленивость, pattern matching, монады, функторы, ADT, Option/Result, tail recursion, trampolining, lenses, transducers, persistent structures; инкапсуляция, наследование, полиморфизм, композиция vs наследование, интерфейсы, абстрактные классы; SOLID; DI, IoC; паттерны (creational/structural/behavioral, Singleton, Factory, Observer, Strategy, Adapter, Decorator, Facade, Builder, Command, Iterator, Template Method).
- **Сети/безопасность:** HTTPS/TLS, XSS, CSRF, SQLi, CSP, security headers, OWASP, секреты, 2FA, сессии, least privilege, валидация, безопасные ошибки, dependency security, аудит, pentest, DNS, TCP/UDP, handshake, HTTP/2, HTTP/3/QUIC, CDN, load balancers, reverse proxy, NAT, firewall, VPN, IP/subnets, OSI, WebSocket, идемпотентность, пагинация, HATEOAS, webhooks, API Gateway.

## Приоритет дальше

Брать вопросы из файлов `enigmai/*.json` с наибольшим `freq`, начиная с `backend-java.json` (там больше всего непокрытого), затем `qa-manual`, `qa-automation`, `devops`, `frontend-other`.
