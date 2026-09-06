// ============================================================
//  Rhinestone Ornament Generator
//  Генератор орнаментов для выкладки стразами разных размеров
// ============================================================

(function () {
    'use strict';

    // --- Конфигурация размеров страз (по стандарту SS) ---
    const SIZES = {
        small:  { label: 'SS6',  mm: 2.0, radius: 4,  color: '#4a9eff' },
        medium: { label: 'SS10', mm: 2.8, radius: 6,  color: '#7c5cff' },
        large:  { label: 'SS16', mm: 3.8, radius: 9,  color: '#c084fc' },
        xlarge: { label: 'SS20', mm: 4.8, radius: 13, color: '#f0abfc' },
    };

    // --- Цветовые палитры ---
    const PALETTES = {
        diamond:  ['#e0e8ff', '#b0c4de', '#f0f8ff', '#d4d4ff', '#c0d0f0', '#e8e8ff'],
        sapphire: ['#0f52ba', '#1e90ff', '#87ceeb', '#4682b4', '#6495ed', '#b0e0e6'],
        ruby:     ['#9b111e', '#e0115f', '#ff6b6b', '#dc143c', '#cd5c5c', '#f08080'],
        emerald:  ['#01796f', '#50c878', '#a8e6cf', '#2e8b57', '#3cb371', '#98fb98'],
        amethyst: ['#9966cc', '#d8bfd8', '#e6e6fa', '#9370db', '#ba55d3', '#dda0dd'],
        gold:     ['#b8860b', '#ffd700', '#fff8dc', '#daa520', '#f0e68c', '#ffec8b'],
        rainbow:  ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0096ff', '#4b0082', '#9400d3'],
        sunset:   ['#ff6b6b', '#feca57', '#ff9ff3', '#f368e0', '#ee5a6f', '#ffa502'],
    };

    // --- Настройки по умолчанию для типа ---
    const DEFAULT_TYPE_SETTINGS = {
        symmetry: 8,
        rings: 6,
        density: 5,
        palette: 'diamond',
        enabledSizes: { small: true, medium: true, large: true, xlarge: true },
    };

    // --- Состояние приложения ---
    const state = {
        selectedTypes: [],
        activeType: null,
        typeSettings: {},
        symmetry: 8,
        rings: 6,
        density: 5,
        palette: 'diamond',
        enabledSizes: { small: true, medium: true, large: true, xlarge: true },
        showGrid: false,
        showInfo: true,
        seed: Math.random(),
        expandedGroups: new Set(['floral']),
        schemaMode: false,
        activeTab: 'ornaments',
        drawnPaths: [],
        drawGenerated: false,
        drawSymmetry: 1,
        drawDensity: 5,
        // Свои палитра и размеры для слоя ручного рисования
        drawPalette: 'diamond',
        drawEnabledSizes: { small: true, medium: true, large: true, xlarge: true },
    };

    // --- Группы орнаментов ---
    const GROUPS = [
        { id: 'geometric', label: 'Геометрические фигуры' },
        { id: 'fields',    label: 'Физические поля' },
        { id: 'folk',      label: 'Орнаменты народов' },
        { id: 'floral',    label: 'Растительные' },
        { id: 'abstract',  label: 'Абстрактные' },
    ];

    // --- Реестр видов орнаментов ---
    const ORNAMENT_TYPES = {
        // Геометрические фигуры
        circle:       { group: 'geometric', label: 'Круг',            shape: 'circle' },
        square:       { group: 'geometric', label: 'Квадрат',         shape: 'square' },
        triangle:     { group: 'geometric', label: 'Треугольник',     shape: 'circle' },
        rhombus:      { group: 'geometric', label: 'Ромб',            shape: 'square' },
        hexagon:      { group: 'geometric', label: 'Шестиугольник',   shape: 'square' },
        star:         { group: 'geometric', label: 'Звезда',          shape: 'circle' },
        spiral:       { group: 'geometric', label: 'Спираль',         shape: 'circle' },
        meander:      { group: 'geometric', label: 'Меандр',          shape: 'square' },
        wave:         { group: 'geometric', label: 'Волна',           shape: 'square' },
        // Физические поля
        magnetic:     { group: 'fields', label: 'Магнитное поле',     shape: 'square' },
        vortex:       { group: 'fields', label: 'Вихрь',              shape: 'circle' },
        galaxy:       { group: 'fields', label: 'Галактика',          shape: 'circle' },
        interference: { group: 'fields', label: 'Интерференция',      shape: 'square' },
        fractal:      { group: 'fields', label: 'Фрактал',            shape: 'circle' },
        crystal:      { group: 'fields', label: 'Кристалл',           shape: 'square' },
        // Орнаменты народов
        islamic:      { group: 'folk', label: 'Исламский',            shape: 'square' },
        celtic:       { group: 'folk', label: 'Кельтский',            shape: 'square' },
        aztec:        { group: 'folk', label: 'Ацтекский',            shape: 'circle' },
        rangoli:      { group: 'folk', label: 'Ранголи',              shape: 'circle' },
        african:      { group: 'folk', label: 'Африканский',          shape: 'rect' },
        chinese:      { group: 'folk', label: 'Китайский',            shape: 'square' },
        norse:        { group: 'folk', label: 'Скандинавский',        shape: 'square' },
        // Растительные
        mandala:      { group: 'floral', label: 'Мандала',            shape: 'circle' },
        floral:       { group: 'floral', label: 'Цветок',             shape: 'circle' },
        lotus:        { group: 'floral', label: 'Лотос',              shape: 'circle' },
        rose:         { group: 'floral', label: 'Роза',               shape: 'circle' },
        tree:         { group: 'floral', label: 'Древо жизни',        shape: 'square' },
        vine:         { group: 'floral', label: 'Лоза',               shape: 'rect' },
        // Абстрактные
        kaleidoscope: { group: 'abstract', label: 'Калейдоскоп',     shape: 'circle' },
        mosaic:       { group: 'abstract', label: 'Мозаика',          shape: 'square' },
    };

    // --- DOM-элементы ---
    const canvas = document.getElementById('ornamentCanvas');
    const ctx = canvas.getContext('2d');

    // --- Утилиты ---

    function mulberry32(seed) {
        let t = Math.floor(seed * 1e9);
        return function () {
            t = (t + 0x6D2B79F5) | 0;
            let r = Math.imul(t ^ (t >>> 15), 1 | t);
            r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
            return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
        };
    }

    let rng = mulberry32(state.seed);

    function pick(arr) {
        return arr[Math.floor(rng() * arr.length)];
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function lerpColor(c1, c2, t) {
        const r1 = parseInt(c1.slice(1, 3), 16);
        const g1 = parseInt(c1.slice(3, 5), 16);
        const b1 = parseInt(c1.slice(5, 7), 16);
        const r2 = parseInt(c2.slice(1, 3), 16);
        const g2 = parseInt(c2.slice(3, 5), 16);
        const b2 = parseInt(c2.slice(5, 7), 16);
        const r = Math.round(lerp(r1, r2, t));
        const g = Math.round(lerp(g1, g2, t));
        const b = Math.round(lerp(b1, b2, t));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    function getEnabledSizeKeys() {
        return Object.keys(state.enabledSizes).filter(k => state.enabledSizes[k]);
    }

    function pickSize() {
        const keys = getEnabledSizeKeys();
        if (keys.length === 0) return SIZES.medium;
        return SIZES[pick(keys)];
    }

    function pickSizeByIndex(idx, total) {
        const keys = getEnabledSizeKeys();
        if (keys.length === 0) return SIZES.medium;
        const t = idx / Math.max(total - 1, 1);
        const sizeIdx = Math.floor(t * (keys.length - 0.001));
        return SIZES[keys[Math.min(sizeIdx, keys.length - 1)]];
    }

    // --- Рендеринг одного страза ---
    function drawRhinestone(cx, cy, radius, baseColor) {
        radius = Math.max(1.5, radius);

        if (state.schemaMode) {
            ctx.strokeStyle = hexToRgba(baseColor, 0.7);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = hexToRgba(baseColor, 0.15);
            ctx.fill();
            return;
        }

        // Внешнее свечение
        const glow = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 2.5);
        glow.addColorStop(0, hexToRgba(baseColor, 0.35));
        glow.addColorStop(0.5, hexToRgba(baseColor, 0.1));
        glow.addColorStop(1, hexToRgba(baseColor, 0));
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Тень-основание
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(cx + radius * 0.15, cy + radius * 0.15, radius, 0, Math.PI * 2);
        ctx.fill();

        // Тело страза с градиентом (3D-эффект)
        const grad = ctx.createRadialGradient(
            cx - radius * 0.35, cy - radius * 0.35, radius * 0.1,
            cx, cy, radius
        );
        grad.addColorStop(0, lightenColor(baseColor, 0.5));
        grad.addColorStop(0.3, lightenColor(baseColor, 0.15));
        grad.addColorStop(0.7, baseColor);
        grad.addColorStop(1, darkenColor(baseColor, 0.3));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Блик (световой отблеск сверху-слева)
        const highlight = ctx.createRadialGradient(
            cx - radius * 0.4, cy - radius * 0.4, 0,
            cx - radius * 0.4, cy - radius * 0.4, radius * 0.6
        );
        highlight.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        highlight.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = highlight;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Контур
        ctx.strokeStyle = hexToRgba(darkenColor(baseColor, 0.4), 0.4);
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    function lightenColor(hex, amount) {
        const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + Math.round(255 * amount));
        const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + Math.round(255 * amount));
        const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + Math.round(255 * amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    function darkenColor(hex, amount) {
        const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - Math.round(255 * amount));
        const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - Math.round(255 * amount));
        const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - Math.round(255 * amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // --- Хранение страз для статистики ---
    let stoneStats = { small: 0, medium: 0, large: 0, xlarge: 0 };

    function recordStone(sizeKey) {
        if (stoneStats[sizeKey] !== undefined) {
            stoneStats[sizeKey]++;
        }
    }

    function getSizeKey(sizeObj) {
        for (const key of Object.keys(SIZES)) {
            if (SIZES[key].radius === sizeObj.radius) return key;
        }
        return 'medium';
    }

    // --- Настройки per-type ---
    function ensureTypeSettings(typeId) {
        if (!state.typeSettings[typeId]) {
            state.typeSettings[typeId] = {
                ...DEFAULT_TYPE_SETTINGS,
                enabledSizes: { ...DEFAULT_TYPE_SETTINGS.enabledSizes },
            };
        }
        return state.typeSettings[typeId];
    }

    function applyTypeSettings(typeId) {
        const ts = ensureTypeSettings(typeId);
        state.symmetry = ts.symmetry;
        state.rings = ts.rings;
        state.density = ts.density;
        state.palette = ts.palette;
        state.enabledSizes = { ...ts.enabledSizes };
    }

    function syncSlidersToActive() {
        const ts = state.activeType ? ensureTypeSettings(state.activeType) : DEFAULT_TYPE_SETTINGS;
        const symSlider = document.getElementById('symmetry');
        const ringsSlider = document.getElementById('rings');
        const densSlider = document.getElementById('density');
        if (symSlider) { symSlider.value = ts.symmetry; document.getElementById('symmetryValue').textContent = ts.symmetry; }
        if (ringsSlider) { ringsSlider.value = ts.rings; document.getElementById('ringsValue').textContent = ts.rings; }
        if (densSlider) { densSlider.value = ts.density; document.getElementById('densityValue').textContent = ts.density; }
        const activeLabel = document.getElementById('activeTypeLabel');
        if (activeLabel) {
            activeLabel.textContent = state.activeType ? ORNAMENT_TYPES[state.activeType].label : '—';
        }
        const sliderGroup = document.getElementById('sliderGroup');
        if (sliderGroup) {
            sliderGroup.style.opacity = state.activeType ? '1' : '0.4';
            sliderGroup.style.pointerEvents = state.activeType ? 'auto' : 'none';
        }
        syncPaletteSizeUI();
    }

    // Синхронизация UI палитры и размеров с настройками текущего режима
    function syncPaletteSizeUI() {
        let palette, sizes;
        if (state.activeTab === 'draw') {
            palette = state.drawPalette;
            sizes = state.drawEnabledSizes;
        } else {
            const ts = state.activeType ? ensureTypeSettings(state.activeType) : DEFAULT_TYPE_SETTINGS;
            palette = ts.palette;
            sizes = ts.enabledSizes;
        }
        document.querySelectorAll('.palette-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.palette === palette);
        });
        document.querySelectorAll('.size-toggle input').forEach(cb => {
            cb.checked = sizes[cb.dataset.size];
        });
    }

    // --- Размещение страза с учётом симметрии ---
    function placeSymmetrical(cx, cy, radius, color, angle, distance, symmetry) {
        for (let i = 0; i < symmetry; i++) {
            const a = angle + (Math.PI * 2 * i) / symmetry;
            const x = cx + Math.cos(a) * distance;
            const y = cy + Math.sin(a) * distance;
            drawRhinestone(x, y, radius, color);
        }
    }

    // --- Генераторы орнаментов ---

    function generateMandala(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const sym = state.symmetry;
        const numRings = state.rings;
        const dens = state.density;

        // Центральный крупный страз
        const centerSize = SIZES.xlarge;
        const centerColor = pick(palette);
        drawRhinestone(cx, cy, centerSize.radius * 1.4, centerColor);
        recordStone('xlarge');

        for (let ring = 0; ring < numRings; ring++) {
            const t = (ring + 1) / numRings;
            const ringRadius = maxRadius * t * 0.85;
            const stonesPerWedge = Math.max(1, Math.floor(dens * (1 + ring * 0.3)));
            const totalStones = sym * stonesPerWedge;

            for (let w = 0; w < stonesPerWedge; w++) {
                const angle = (Math.PI * 2 * w) / totalStones;
                const sizeObj = pickSizeByIndex(ring, numRings);
                const colorIdx = Math.floor(rng() * palette.length);
                const color = palette[colorIdx];

                // Лёгкое колебание радиуса для органичности
                const wobble = (rng() - 0.5) * maxRadius * 0.02;
                const r = ringRadius + wobble;

                placeSymmetrical(cx, cy, sizeObj.radius, color, angle, r, sym);
                recordStone(getSizeKey(sizeObj));
            }

            // Декоративные стразы между кольцами
            if (ring < numRings - 1 && rng() > 0.3) {
                const midRadius = ringRadius + (maxRadius * ((ring + 2) / numRings) * 0.85 - ringRadius) * 0.5;
                const midStones = sym * Math.max(1, Math.floor(dens * 0.5));
                for (let w = 0; w < midStones; w++) {
                    const angle = (Math.PI * 2 * w) / midStones + Math.PI / sym;
                    const sizeObj = SIZES.small;
                    const color = pick(palette);
                    placeSymmetrical(cx, cy, sizeObj.radius, color, angle, midRadius, sym);
                    recordStone('small');
                }
            }
        }
    }

    function generateFloral(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const sym = state.symmetry;
        const numRings = state.rings;
        const dens = state.density;

        // Центр
        const centerColor = pick(palette);
        drawRhinestone(cx, cy, SIZES.xlarge.radius * 1.5, centerColor);
        recordStone('xlarge');

        // Кольцо вокруг центра
        const innerRing = maxRadius * 0.12;
        for (let i = 0; i < sym; i++) {
            const a = (Math.PI * 2 * i) / sym;
            const x = cx + Math.cos(a) * innerRing;
            const y = cy + Math.sin(a) * innerRing;
            drawRhinestone(x, y, SIZES.large.radius, pick(palette));
            recordStone('large');
        }

        // Лепестки
        for (let ring = 0; ring < numRings; ring++) {
            const t = (ring + 1) / numRings;
            const ringR = maxRadius * t * 0.85;
            const petalLength = maxRadius * 0.12 * (1 + ring * 0.1);
            const stonesPerPetal = Math.max(2, Math.floor(dens * 0.8));

            for (let i = 0; i < sym; i++) {
                const baseAngle = (Math.PI * 2 * i) / sym;

                // Стразы вдоль лепестка
                for (let s = 0; s < stonesPerPetal; s++) {
                    const st = s / stonesPerPetal;
                    const dist = ringR + st * petalLength;
                    const spread = (st - 0.5) * 0.3;
                    const angle = baseAngle + spread;
                    const sizeObj = st < 0.3 ? SIZES.large : (st < 0.7 ? SIZES.medium : SIZES.small);
                    const color = lerpColor(pick(palette), pick(palette), st);
                    drawRhinestone(
                        cx + Math.cos(angle) * dist,
                        cy + Math.sin(angle) * dist,
                        sizeObj.radius,
                        color
                    );
                    recordStone(getSizeKey(sizeObj));
                }

                // Страза на кончике лепестка
                const tipDist = ringR + petalLength;
                const tipAngle = baseAngle;
                drawRhinestone(
                    cx + Math.cos(tipAngle) * tipDist,
                    cy + Math.sin(tipAngle) * tipDist,
                    SIZES.xlarge.radius,
                    pick(palette)
                );
                recordStone('xlarge');
            }

            // Заполнение между лепестками
            if (dens > 3) {
                for (let i = 0; i < sym; i++) {
                    const fillAngle = (Math.PI * 2 * i) / sym + Math.PI / sym;
                    const fillDist = ringR + petalLength * 0.5;
                    drawRhinestone(
                        cx + Math.cos(fillAngle) * fillDist,
                        cy + Math.sin(fillAngle) * fillDist,
                        SIZES.small.radius,
                        pick(palette)
                    );
                    recordStone('small');
                }
            }
        }
    }

    function generateGeometric(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const sym = state.symmetry;
        const numRings = state.rings;
        const dens = state.density;

        // Центр
        drawRhinestone(cx, cy, SIZES.xlarge.radius * 1.3, pick(palette));
        recordStone('xlarge');

        for (let ring = 0; ring < numRings; ring++) {
            const t = (ring + 1) / numRings;
            const ringR = maxRadius * t * 0.85;

            // Стразы по кольцу
            const count = sym * Math.max(1, Math.floor(dens * (1 + ring * 0.2)));
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * i) / count;
                const sizeObj = ring % 2 === 0 ? SIZES.medium : SIZES.large;
                const color = palette[(i + ring) % palette.length];
                drawRhinestone(
                    cx + Math.cos(angle) * ringR,
                    cy + Math.sin(angle) * ringR,
                    sizeObj.radius,
                    color
                );
                recordStone(getSizeKey(sizeObj));
            }

            // Радиальные линии (спицы)
            if (ring > 0) {
                const prevR = maxRadius * (t - 1 / numRings) * 0.85;
                for (let i = 0; i < sym; i++) {
                    const angle = (Math.PI * 2 * i) / sym;
                    const steps = Math.max(2, Math.floor(dens * 0.6));
                    for (let s = 1; s < steps; s++) {
                        const st = s / steps;
                        const r = lerp(prevR, ringR, st);
                        drawRhinestone(
                            cx + Math.cos(angle) * r,
                            cy + Math.sin(angle) * r,
                            SIZES.small.radius,
                            pick(palette)
                        );
                        recordStone('small');
                    }
                }
            }
        }
    }

    function generateStarburst(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const sym = state.symmetry;
        const numRings = state.rings;
        const dens = state.density;

        // Центр
        drawRhinestone(cx, cy, SIZES.xlarge.radius * 1.6, pick(palette));
        recordStone('xlarge');

        // Внутреннее кольцо
        const innerR = maxRadius * 0.1;
        for (let i = 0; i < sym * 2; i++) {
            const a = (Math.PI * 2 * i) / (sym * 2);
            drawRhinestone(
                cx + Math.cos(a) * innerR,
                cy + Math.sin(a) * innerR,
                SIZES.small.radius,
                pick(palette)
            );
            recordStone('small');
        }

        // Лучи звезды
        for (let ring = 0; ring < numRings; ring++) {
            const t = (ring + 1) / numRings;
            const innerRadius = maxRadius * t * 0.7;
            const outerRadius = maxRadius * t * 0.9;
            const rays = sym;
            const stonesPerRay = Math.max(2, Math.floor(dens * 0.7));

            for (let i = 0; i < rays; i++) {
                const angle = (Math.PI * 2 * i) / rays;

                // Луч наружу
                for (let s = 0; s < stonesPerRay; s++) {
                    const st = s / stonesPerRay;
                    const r = lerp(innerRadius, outerRadius, st);
                    const sizeObj = st < 0.3 ? SIZES.xlarge : (st < 0.6 ? SIZES.large : SIZES.medium);
                    const color = lerpColor(palette[ring % palette.length], palette[(ring + 2) % palette.length], st);
                    drawRhinestone(
                        cx + Math.cos(angle) * r,
                        cy + Math.sin(angle) * r,
                        sizeObj.radius,
                        color
                    );
                    recordStone(getSizeKey(sizeObj));
                }

                // Возвратный луч (меньшие стразы)
                const retAngle = angle + Math.PI / rays;
                const retStones = Math.max(1, Math.floor(stonesPerRay * 0.6));
                for (let s = 0; s < retStones; s++) {
                    const st = s / retStones;
                    const r = lerp(innerRadius, (innerRadius + outerRadius) / 2, st);
                    drawRhinestone(
                        cx + Math.cos(retAngle) * r,
                        cy + Math.sin(retAngle) * r,
                        SIZES.small.radius,
                        pick(palette)
                    );
                    recordStone('small');
                }
            }

            // Кольцевые стразы на пиках
            if (dens > 4) {
                for (let i = 0; i < rays; i++) {
                    const angle = (Math.PI * 2 * i) / rays + Math.PI / rays;
                    drawRhinestone(
                        cx + Math.cos(angle) * outerRadius,
                        cy + Math.sin(angle) * outerRadius,
                        SIZES.medium.radius,
                        pick(palette)
                    );
                    recordStone('medium');
                }
            }
        }
    }

    // --- Генераторы орнаментов разных культур ---

    // Исламский геометрический: 8-конечные звёзды (два квадрата) с мозаичным заполнением
    function generateIslamic(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const numRings = state.rings;
        const dens = state.density;
        const sym = Math.max(6, state.symmetry);

        // Центральная звезда
        drawNPointStar(cx, cy, maxRadius * 0.12, maxRadius * 0.06, sym, palette);
        drawRhinestone(cx, cy, SIZES.xlarge.radius, pick(palette));
        recordStone('xlarge');

        // Концентрические 8-конечные звёзды
        for (let ring = 0; ring < numRings; ring++) {
            const t = (ring + 1) / numRings;
            const outerR = maxRadius * t * 0.92;
            const innerR = outerR * 0.65;
            const points = sym;

            // Контур звезды из страз
            const starPoints = [];
            for (let i = 0; i < points * 2; i++) {
                const a = (Math.PI * i) / points - Math.PI / 2;
                const r = i % 2 === 0 ? outerR : innerR;
                starPoints.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
            }

            // Стразы по контуру звезды
            const edgeStones = Math.max(3, Math.floor(dens * 1.2));
            for (let i = 0; i < starPoints.length; i++) {
                const p1 = starPoints[i];
                const p2 = starPoints[(i + 1) % starPoints.length];
                for (let s = 0; s < edgeStones; s++) {
                    const st = s / edgeStones;
                    const x = lerp(p1.x, p2.x, st);
                    const y = lerp(p1.y, p2.y, st);
                    const sizeObj = i % 2 === 0 ? SIZES.large : SIZES.small;
                    drawRhinestone(x, y, sizeObj.radius, palette[(i + ring) % palette.length]);
                    recordStone(getSizeKey(sizeObj));
                }
            }

            // Внутреннее заполнение — малые звёзды между лучами
            if (dens > 3) {
                for (let i = 0; i < points; i++) {
                    const a = (Math.PI * 2 * i) / points + Math.PI / points;
                    const midR = (outerR + innerR) / 2;
                    const mx = cx + Math.cos(a) * midR;
                    const my = cy + Math.sin(a) * midR;
                    drawRhinestone(mx, my, SIZES.medium.radius, palette[(i + 2) % palette.length]);
                    recordStone('medium');
                }
            }
        }
    }

    // Кельтский узел: плетёная сетка из диагональных полос
    function generateCeltic(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const numRings = state.rings;
        const dens = state.density;
        const gridSize = Math.max(4, Math.min(12, state.symmetry));
        const half = gridSize / 2;

        const cellSize = (maxRadius * 1.7) / gridSize;
        const startX = cx - (gridSize * cellSize) / 2;
        const startY = cy - (gridSize * cellSize) / 2;

        // Диагональные полосы — \ направление
        for (let band = -half; band <= half + 1; band++) {
            const offset = band * cellSize * 0.5;
            const stonesPerBand = Math.max(3, Math.floor(dens * 1.5));
            for (let s = 0; s <= gridSize + 2; s++) {
                const t = s / (gridSize + 2);
                const x = startX + t * gridSize * cellSize + offset;
                const y = startY + t * gridSize * cellSize;
                if (x < startX - cellSize || x > startX + gridSize * cellSize + cellSize) continue;
                if (y < startY - cellSize || y > startY + gridSize * cellSize + cellSize) continue;
                const sizeObj = (s + band) % 3 === 0 ? SIZES.large : SIZES.medium;
                const color = palette[Math.abs(band + s) % palette.length];
                drawRhinestone(x, y, sizeObj.radius, color);
                recordStone(getSizeKey(sizeObj));
            }
        }

        // Диагональные полосы — / направление
        for (let band = -half; band <= half + 1; band++) {
            const offset = band * cellSize * 0.5;
            const stonesPerBand = Math.max(3, Math.floor(dens * 1.5));
            for (let s = 0; s <= gridSize + 2; s++) {
                const t = s / (gridSize + 2);
                const x = startX + t * gridSize * cellSize + offset;
                const y = startY + (1 - t) * gridSize * cellSize;
                if (x < startX - cellSize || x > startX + gridSize * cellSize + cellSize) continue;
                if (y < startY - cellSize || y > startY + gridSize * cellSize + cellSize) continue;
                const sizeObj = (s + band) % 3 === 0 ? SIZES.large : SIZES.small;
                const color = palette[Math.abs(band - s + 3) % palette.length];
                drawRhinestone(x, y, sizeObj.radius, color);
                recordStone(getSizeKey(sizeObj));
            }
        }

        // Узлы на пересечениях
        for (let i = 0; i <= gridSize; i++) {
            for (let j = 0; j <= gridSize; j++) {
                if ((i + j) % 2 === 0) {
                    const x = startX + i * cellSize;
                    const y = startY + j * cellSize;
                    drawRhinestone(x, y, SIZES.xlarge.radius * 0.8, pick(palette));
                    recordStone('xlarge');
                }
            }
        }

        // Рамка
        drawRectBorder(startX, startY, gridSize * cellSize, gridSize * cellSize, SIZES.medium, palette);
    }

    // Ацтекский: ступенчатые пирамиды и солнечные лучи
    function generateAztec(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const sym = Math.max(4, state.symmetry);
        const numRings = state.rings;
        const dens = state.density;

        // Солнечный диск в центре
        drawRhinestone(cx, cy, SIZES.xlarge.radius * 1.8, pick(palette));
        recordStone('xlarge');

        // Внутренний круг
        const innerR = maxRadius * 0.1;
        for (let i = 0; i < sym * 2; i++) {
            const a = (Math.PI * 2 * i) / (sym * 2);
            drawRhinestone(cx + Math.cos(a) * innerR, cy + Math.sin(a) * innerR, SIZES.small.radius, pick(palette));
            recordStone('small');
        }

        // Ступенчатые лучи
        for (let ring = 0; ring < numRings; ring++) {
            const t = (ring + 1) / numRings;
            const baseR = maxRadius * t * 0.85;
            const steps = Math.max(3, Math.floor(dens * 0.8));

            for (let i = 0; i < sym; i++) {
                const angle = (Math.PI * 2 * i) / sym;

                // Ступенчатый луч
                for (let s = 0; s < steps; s++) {
                    const st = s / steps;
                    const r = baseR + st * maxRadius * 0.08;
                    const stepWidth = maxRadius * 0.04 * (1 - st * 0.5);

                    // Две точки ступени (вверх и вниз по перпендикуляру)
                    const perpA = angle + Math.PI / 2;
                    const x1 = cx + Math.cos(angle) * r + Math.cos(perpA) * stepWidth;
                    const y1 = cy + Math.sin(angle) * r + Math.sin(perpA) * stepWidth;
                    const x2 = cx + Math.cos(angle) * r - Math.cos(perpA) * stepWidth;
                    const y2 = cy + Math.sin(angle) * r - Math.sin(perpA) * stepWidth;

                    const sizeObj = s < steps / 2 ? SIZES.large : SIZES.medium;
                    const color = palette[(i + ring + s) % palette.length];
                    drawRhinestone(x1, y1, sizeObj.radius, color);
                    drawRhinestone(x2, y2, sizeObj.radius, color);
                    recordStone(getSizeKey(sizeObj));
                    recordStone(getSizeKey(sizeObj));
                }

                // Вершина луча
                const tipR = baseR + maxRadius * 0.08;
                drawRhinestone(cx + Math.cos(angle) * tipR, cy + Math.sin(angle) * tipR, SIZES.xlarge.radius, palette[i % palette.length]);
                recordStone('xlarge');
            }

            // Зигзаг между лучами
            if (dens > 3) {
                const zigR = baseR + maxRadius * 0.04;
                const zigSteps = sym * 2;
                for (let i = 0; i < zigSteps; i++) {
                    const a1 = (Math.PI * 2 * i) / zigSteps;
                    const a2 = (Math.PI * 2 * (i + 0.5)) / zigSteps;
                    const r1 = zigR + (i % 2 === 0 ? maxRadius * 0.02 : 0);
                    drawRhinestone(cx + Math.cos(a1) * r1, cy + Math.sin(a1) * r1, SIZES.small.radius, pick(palette));
                    recordStone('small');
                }
            }
        }
    }

    // Ранголи (Индия): лотос с 4-сторонней симметрией и декоративной рамкой
    function generateRangoli(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const sym = Math.max(4, state.symmetry);
        const numRings = state.rings;
        const dens = state.density;

        // Центральный лотос
        drawRhinestone(cx, cy, SIZES.xlarge.radius * 1.5, pick(palette));
        recordStone('xlarge');

        // Внутренние лепестки лотоса (4 направления)
        for (let dir = 0; dir < 4; dir++) {
            const baseAngle = (Math.PI * 2 * dir) / 4;
            const petalLen = maxRadius * 0.15;
            const petalStones = Math.max(3, Math.floor(dens * 0.6));

            for (let s = 1; s <= petalStones; s++) {
                const st = s / petalStones;
                const r = st * petalLen;
                const spread = Math.sin(st * Math.PI) * 0.25;
                for (let side = -1; side <= 1; side += 2) {
                    const a = baseAngle + side * spread;
                    drawRhinestone(cx + Math.cos(a) * r, cy + Math.sin(a) * r, SIZES.medium.radius, pick(palette));
                    recordStone('medium');
                }
                // Центр лепестка
                drawRhinestone(cx + Math.cos(baseAngle) * r, cy + Math.sin(baseAngle) * r, SIZES.large.radius, pick(palette));
                recordStone('large');
            }
        }

        // Кольца с лепестками
        for (let ring = 0; ring < numRings; ring++) {
            const t = (ring + 1) / numRings;
            const ringR = maxRadius * (0.25 + t * 0.65);
            const petals = sym;
            const stonesPerPetal = Math.max(2, Math.floor(dens * 0.7));

            for (let i = 0; i < petals; i++) {
                const angle = (Math.PI * 2 * i) / petals;

                for (let s = 0; s < stonesPerPetal; s++) {
                    const st = s / stonesPerPetal;
                    const r = ringR + st * maxRadius * 0.06;
                    const spread = Math.sin(st * Math.PI) * 0.15;
                    const a = angle + spread * (s % 2 === 0 ? 1 : -1);
                    const sizeObj = st < 0.5 ? SIZES.medium : SIZES.small;
                    drawRhinestone(cx + Math.cos(a) * r, cy + Math.sin(a) * r, sizeObj.radius, palette[(i + ring) % palette.length]);
                    recordStone(getSizeKey(sizeObj));
                }

                // Кончик лепестка
                drawRhinestone(cx + Math.cos(angle) * (ringR + maxRadius * 0.06), cy + Math.sin(angle) * (ringR + maxRadius * 0.06), SIZES.large.radius, pick(palette));
                recordStone('large');
            }

            // Точки между лепестками
            for (let i = 0; i < petals; i++) {
                const a = (Math.PI * 2 * i) / petals + Math.PI / petals;
                drawRhinestone(cx + Math.cos(a) * ringR, cy + Math.sin(a) * ringR, SIZES.small.radius, pick(palette));
                recordStone('small');
            }
        }

        // Декоративная внешняя рамка
        const borderR = maxRadius * 0.95;
        const borderCount = Math.max(16, sym * 4);
        for (let i = 0; i < borderCount; i++) {
            const a = (Math.PI * 2 * i) / borderCount;
            const sizeObj = i % 2 === 0 ? SIZES.medium : SIZES.small;
            drawRhinestone(cx + Math.cos(a) * borderR, cy + Math.sin(a) * borderR, sizeObj.radius, pick(palette));
            recordStone(getSizeKey(sizeObj));
        }
    }

    // Африканский (мудклоф): горизонтальные зигзагообразные полосы
    function generateAfrican(cx, cy, maxRadius, width, height) {
        const palette = PALETTES[state.palette];
        const numRings = state.rings;
        const dens = state.density;

        const w = width || maxRadius * 1.8;
        const h = height || maxRadius * 1.8;
        const left = cx - w / 2;
        const top = cy - h / 2;
        const bandHeight = h / (numRings + 1);

        for (let band = 0; band <= numRings; band++) {
            const y0 = top + band * bandHeight;
            const y1 = y0 + bandHeight;
            const yMid = (y0 + y1) / 2;
            const zigCount = Math.max(4, Math.floor(dens * 2));
            const zigWidth = w / zigCount;
            const zigAmp = bandHeight * 0.3;

            // Зигзаг
            for (let i = 0; i < zigCount; i++) {
                const x0 = left + i * zigWidth;
                const x1 = x0 + zigWidth;
                const dir = (i + band) % 2 === 0 ? 1 : -1;

                const stonesPerSeg = Math.max(3, Math.floor(dens * 1.2));
                for (let s = 0; s <= stonesPerSeg; s++) {
                    const st = s / stonesPerSeg;
                    const x = lerp(x0, x1, st);
                    const y = yMid + Math.sin(st * Math.PI) * zigAmp * dir;
                    const sizeObj = s === 0 || s === stonesPerSeg ? SIZES.large : SIZES.medium;
                    const color = palette[(i + band) % palette.length];
                    drawRhinestone(x, y, sizeObj.radius, color);
                    recordStone(getSizeKey(sizeObj));
                }
            }

            // Точки между зигзагами
            if (dens > 3) {
                for (let i = 0; i <= zigCount; i++) {
                    const x = left + i * zigWidth;
                    drawRhinestone(x, y0, SIZES.small.radius, pick(palette));
                    recordStone('small');
                }
            }
        }

        // Боковые рамки
        drawRectBorder(left, top, w, h, SIZES.small, palette);
    }

    // Китайский: решётчатый узор с мотивом облаков
    function generateChinese(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const gridSize = Math.max(4, Math.min(10, Math.floor(state.symmetry * 0.7)));
        const dens = state.density;

        const cellSize = (maxRadius * 1.7) / gridSize;
        const startX = cx - (gridSize * cellSize) / 2;
        const startY = cy - (gridSize * cellSize) / 2;

        // Решётка
        for (let i = 0; i <= gridSize; i++) {
            const stonesPerLine = Math.max(4, Math.floor(dens * 1.5));
            for (let s = 0; s <= stonesPerLine; s++) {
                const st = s / stonesPerLine;
                const sizeObj = s === 0 || s === stonesPerLine ? SIZES.large : SIZES.small;

                // Горизонтальная линия
                const xH = startX + st * gridSize * cellSize;
                const yH = startY + i * cellSize;
                drawRhinestone(xH, yH, sizeObj.radius, palette[i % palette.length]);
                recordStone(getSizeKey(sizeObj));

                // Вертикальная линия
                const xV = startX + i * cellSize;
                const yV = startY + st * gridSize * cellSize;
                drawRhinestone(xV, yV, sizeObj.radius, palette[i % palette.length]);
                recordStone(getSizeKey(sizeObj));
            }
        }

        // Мотивы облаков на пересечениях
        for (let i = 0; i <= gridSize; i++) {
            for (let j = 0; j <= gridSize; j++) {
                if ((i + j) % 2 === 0) {
                    const x = startX + i * cellSize;
                    const y = startY + j * cellSize;
                    drawRhinestone(x, y, SIZES.xlarge.radius * 0.7, pick(palette));
                    recordStone('xlarge');

                    // Облачные завитки
                    if (dens > 3 && i < gridSize && j < gridSize) {
                        const midX = x + cellSize / 2;
                        const midY = y + cellSize / 2;
                        drawRhinestone(midX, midY, SIZES.medium.radius, pick(palette));
                        recordStone('medium');
                    }
                }
            }
        }

        // Угловые акценты
        const corners = [
            { x: startX, y: startY },
            { x: startX + gridSize * cellSize, y: startY },
            { x: startX, y: startY + gridSize * cellSize },
            { x: startX + gridSize * cellSize, y: startY + gridSize * cellSize },
        ];
        for (const c of corners) {
            drawRhinestone(c.x, c.y, SIZES.xlarge.radius * 1.2, pick(palette));
            recordStone('xlarge');
        }

        // Рамка
        drawRectBorder(startX, startY, gridSize * cellSize, gridSize * cellSize, SIZES.medium, palette);
    }

    // --- Новые генераторы: геометрические фигуры ---

    function generateCircle(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const numRings = state.rings;
        const dens = state.density;
        drawRhinestone(cx, cy, SIZES.xlarge.radius * 1.3, pick(palette));
        recordStone('xlarge');
        for (let ring = 0; ring < numRings; ring++) {
            const r = maxRadius * ((ring + 1) / numRings) * 0.9;
            const count = Math.max(8, Math.floor(r * 0.5 * dens * 0.3));
            for (let i = 0; i < count; i++) {
                const a = (Math.PI * 2 * i) / count;
                const sizeObj = ring % 2 === 0 ? SIZES.medium : SIZES.small;
                drawRhinestone(cx + Math.cos(a) * r, cy + Math.sin(a) * r, sizeObj.radius, palette[i % palette.length]);
                recordStone(getSizeKey(sizeObj));
            }
        }
    }

    function generateSquare(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const numRings = state.rings;
        const dens = state.density;
        const half = maxRadius * 0.85;
        drawRhinestone(cx, cy, SIZES.xlarge.radius, pick(palette));
        recordStone('xlarge');
        for (let ring = 0; ring < numRings; ring++) {
            const t = (ring + 1) / numRings;
            const s = half * t;
            const stonesPerSide = Math.max(4, Math.floor(s * dens * 0.15));
            for (let i = 0; i <= stonesPerSide; i++) {
                const st = i / stonesPerSide;
                const sizeObj = i % 3 === 0 ? SIZES.large : SIZES.small;
                const c1 = palette[(ring + i) % palette.length];
                drawRhinestone(cx - s + st * 2 * s, cy - s, sizeObj.radius, c1);
                drawRhinestone(cx - s + st * 2 * s, cy + s, sizeObj.radius, c1);
                drawRhinestone(cx - s, cy - s + st * 2 * s, sizeObj.radius, c1);
                drawRhinestone(cx + s, cy - s + st * 2 * s, sizeObj.radius, c1);
                recordStone(getSizeKey(sizeObj)); recordStone(getSizeKey(sizeObj));
                recordStone(getSizeKey(sizeObj)); recordStone(getSizeKey(sizeObj));
            }
        }
    }

    function generateTriangle(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const sym = Math.max(3, Math.min(6, state.symmetry));
        const numRings = state.rings;
        const dens = state.density;
        drawRhinestone(cx, cy, SIZES.xlarge.radius * 1.2, pick(palette));
        recordStone('xlarge');
        for (let ring = 0; ring < numRings; ring++) {
            const t = (ring + 1) / numRings;
            const r = maxRadius * t * 0.85;
            for (let i = 0; i < sym; i++) {
                const baseA = (Math.PI * 2 * i) / sym - Math.PI / 2;
                const stonesPerEdge = Math.max(3, Math.floor(dens * 1.2));
                for (let s = 0; s < stonesPerEdge; s++) {
                    const st = s / stonesPerEdge;
                    const a1 = baseA;
                    const a2 = baseA + Math.PI * 2 / sym;
                    const x = cx + Math.cos(a1) * r * (1 - st) + Math.cos(a2) * r * st;
                    const y = cy + Math.sin(a1) * r * (1 - st) + Math.sin(a2) * r * st;
                    const sizeObj = s === 0 ? SIZES.large : SIZES.small;
                    drawRhinestone(x, y, sizeObj.radius, palette[(i + s) % palette.length]);
                    recordStone(getSizeKey(sizeObj));
                }
            }
        }
    }

    function generateRhombus(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const numRings = state.rings;
        const dens = state.density;
        drawRhinestone(cx, cy, SIZES.xlarge.radius, pick(palette));
        recordStone('xlarge');
        for (let ring = 0; ring < numRings; ring++) {
            const t = (ring + 1) / numRings;
            const rx = maxRadius * t * 0.85;
            const ry = maxRadius * t * 0.5;
            const count = Math.max(6, Math.floor(dens * 4));
            for (let i = 0; i < count; i++) {
                const a = (Math.PI * 2 * i) / count;
                const x = cx + Math.cos(a) * rx;
                const y = cy + Math.sin(a) * ry;
                const sizeObj = i % 2 === 0 ? SIZES.medium : SIZES.small;
                drawRhinestone(x, y, sizeObj.radius, palette[(i + ring) % palette.length]);
                recordStone(getSizeKey(sizeObj));
            }
            // Диагонали
            if (dens > 3) {
                const diagStones = Math.max(3, Math.floor(dens));
                for (let s = 1; s < diagStones; s++) {
                    const st = s / diagStones;
                    drawRhinestone(cx - rx + st * 2 * rx, cy, SIZES.small.radius, pick(palette));
                    drawRhinestone(cx, cy - ry + st * 2 * ry, SIZES.small.radius, pick(palette));
                    recordStone('small'); recordStone('small');
                }
            }
        }
    }

    function generateHexagon(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const numRings = state.rings;
        const dens = state.density;
        drawRhinestone(cx, cy, SIZES.xlarge.radius * 1.1, pick(palette));
        recordStone('xlarge');
        for (let ring = 1; ring <= numRings; ring++) {
            const r = maxRadius * (ring / numRings) * 0.85;
            const hexR = r;
            const stonesPerEdge = Math.max(2, Math.floor(dens * 0.8));
            for (let edge = 0; edge < 6; edge++) {
                const a1 = (Math.PI * edge) / 3 - Math.PI / 2;
                const a2 = (Math.PI * (edge + 1)) / 3 - Math.PI / 2;
                for (let s = 0; s < stonesPerEdge; s++) {
                    const st = s / stonesPerEdge;
                    const x = cx + Math.cos(a1) * hexR * (1 - st) + Math.cos(a2) * hexR * st;
                    const y = cy + Math.sin(a1) * hexR * (1 - st) + Math.sin(a2) * hexR * st;
                    const sizeObj = s === 0 ? SIZES.large : SIZES.medium;
                    drawRhinestone(x, y, sizeObj.radius, palette[(edge + ring) % palette.length]);
                    recordStone(getSizeKey(sizeObj));
                }
            }
        }
    }

    function generateSpiral(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const arms = Math.max(1, Math.floor(state.symmetry / 4));
        const dens = state.density;
        const turns = state.rings;
        drawRhinestone(cx, cy, SIZES.xlarge.radius, pick(palette));
        recordStone('xlarge');
        for (let arm = 0; arm < arms; arm++) {
            const armOffset = (Math.PI * 2 * arm) / arms;
            const totalStones = Math.max(30, Math.floor(dens * 20 * turns));
            for (let i = 1; i < totalStones; i++) {
                const t = i / totalStones;
                const angle = armOffset + t * turns * Math.PI * 2;
                const r = t * maxRadius * 0.9;
                const sizeObj = t < 0.3 ? SIZES.small : (t < 0.7 ? SIZES.medium : SIZES.large);
                const color = lerpColor(palette[0], palette[palette.length - 1], t);
                drawRhinestone(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, sizeObj.radius, color);
                recordStone(getSizeKey(sizeObj));
            }
        }
    }

    function generateMeander(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const dens = state.density;
        const side = maxRadius * 1.6;
        const left = cx - side / 2;
        const top = cy - side / 2;
        const bands = Math.max(3, Math.floor(state.rings * 0.7));
        const bandH = side / bands;
        const keyWidth = side / Math.max(4, Math.floor(dens * 2));
        for (let band = 0; band < bands; band++) {
            const y0 = top + band * bandH;
            const yMid = y0 + bandH / 2;
            const keys = Math.floor(side / keyWidth);
            for (let k = 0; k < keys; k++) {
                const x0 = left + k * keyWidth;
                const dir = (k + band) % 2 === 0 ? 1 : -1;
                const stonesPerKey = Math.max(4, Math.floor(dens * 1.5));
                for (let s = 0; s < stonesPerKey; s++) {
                    const st = s / stonesPerKey;
                    let x, y;
                    if (st < 0.25) { x = x0 + st * 4 * keyWidth * 0.4; y = yMid; }
                    else if (st < 0.5) { x = x0 + keyWidth * 0.4; y = yMid - (st - 0.25) * 4 * bandH * 0.35 * dir; }
                    else if (st < 0.75) { x = x0 + keyWidth * 0.4 - (st - 0.5) * 4 * keyWidth * 0.4; y = yMid - bandH * 0.35 * dir; }
                    else { x = x0; y = yMid - bandH * 0.35 * dir + (st - 0.75) * 4 * bandH * 0.35 * dir; }
                    const sizeObj = s === 0 || s === stonesPerKey - 1 ? SIZES.medium : SIZES.small;
                    drawRhinestone(x, y, sizeObj.radius, palette[(k + band) % palette.length]);
                    recordStone(getSizeKey(sizeObj));
                }
            }
        }
        drawRectBorder(left, top, side, side, SIZES.small, palette);
    }

    function generateWave(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const numRings = state.rings;
        const dens = state.density;
        drawRhinestone(cx, cy, SIZES.xlarge.radius * 1.2, pick(palette));
        recordStone('xlarge');
        for (let ring = 0; ring < numRings; ring++) {
            const r = maxRadius * ((ring + 1) / numRings) * 0.88;
            const arcs = Math.max(6, Math.floor(state.symmetry * 1.5));
            for (let i = 0; i < arcs; i++) {
                const a = (Math.PI * 2 * i) / arcs;
                const waveR = r + Math.sin(a * dens) * maxRadius * 0.03;
                const sizeObj = i % 2 === 0 ? SIZES.medium : SIZES.small;
                drawRhinestone(cx + Math.cos(a) * waveR, cy + Math.sin(a) * waveR, sizeObj.radius, palette[(i + ring) % palette.length]);
                recordStone(getSizeKey(sizeObj));
            }
            // Заполнение между волнами
            if (dens > 4) {
                for (let i = 0; i < arcs; i++) {
                    const a = (Math.PI * 2 * i) / arcs + Math.PI / arcs;
                    drawRhinestone(cx + Math.cos(a) * r, cy + Math.sin(a) * r, SIZES.small.radius, pick(palette));
                    recordStone('small');
                }
            }
        }
    }

    // --- Новые генераторы: физические поля ---

    function generateMagnetic(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const dens = state.density;
        const sep = maxRadius * 0.25;
        const nPole = { x: cx - sep, y: cy };
        const sPole = { x: cx + sep, y: cy };
        drawRhinestone(nPole.x, nPole.y, SIZES.xlarge.radius, palette[0]);
        drawRhinestone(sPole.x, sPole.y, SIZES.xlarge.radius, palette[palette.length - 1]);
        recordStone('xlarge'); recordStone('xlarge');
        const lines = Math.max(6, state.symmetry * 2);
        for (let i = 0; i < lines; i++) {
            const t = (i + 0.5) / lines;
            const startAngle = Math.PI * t;
            const steps = Math.max(20, Math.floor(dens * 15));
            let x = nPole.x + Math.cos(startAngle) * 5;
            let y = nPole.y + Math.sin(startAngle) * 5;
            for (let s = 0; s < steps; s++) {
                const dxN = nPole.x - x, dyN = nPole.y - y;
                const dxS = sPole.x - x, dyS = sPole.y - y;
                const dN = Math.sqrt(dxN * dxN + dyN * dyN) + 1;
                const dS = Math.sqrt(dxS * dxS + dyS * dyS) + 1;
                const fx = dxN / (dN * dN) - dxS / (dS * dS);
                const fy = dyN / (dN * dN) - dyS / (dS * dS);
                const fl = Math.sqrt(fx * fx + fy * fy) + 1e-6;
                const stepSize = maxRadius * 0.015;
                x += (fx / fl) * stepSize;
                y += (fy / fl) * stepSize;
                if (s % 2 === 0) {
                    const sizeObj = s < steps * 0.3 ? SIZES.small : (s < steps * 0.7 ? SIZES.medium : SIZES.small);
                    const color = lerpColor(palette[0], palette[palette.length - 1], s / steps);
                    drawRhinestone(x, y, sizeObj.radius, color);
                    recordStone(getSizeKey(sizeObj));
                }
                if (Math.hypot(x - sPole.x, y - sPole.y) < 8) break;
            }
        }
    }

    function generateVortex(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const arms = Math.max(3, Math.floor(state.symmetry / 2));
        const dens = state.density;
        const turns = state.rings * 0.5;
        drawRhinestone(cx, cy, SIZES.xlarge.radius * 1.5, pick(palette));
        recordStone('xlarge');
        for (let arm = 0; arm < arms; arm++) {
            const armOffset = (Math.PI * 2 * arm) / arms;
            const totalStones = Math.max(20, Math.floor(dens * 12));
            for (let i = 1; i < totalStones; i++) {
                const t = i / totalStones;
                const angle = armOffset + t * turns * Math.PI * 2;
                const r = t * maxRadius * 0.88;
                const sizeObj = t < 0.2 ? SIZES.small : (t < 0.6 ? SIZES.medium : SIZES.large);
                drawRhinestone(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, sizeObj.radius, palette[(arm + i) % palette.length]);
                recordStone(getSizeKey(sizeObj));
            }
        }
    }

    function generateGalaxy(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const arms = Math.max(2, Math.floor(state.symmetry / 3));
        const dens = state.density;
        drawRhinestone(cx, cy, SIZES.xlarge.radius * 1.8, pick(palette));
        recordStone('xlarge');
        for (let arm = 0; arm < arms; arm++) {
            const armOffset = (Math.PI * 2 * arm) / arms;
            const totalStones = Math.max(30, Math.floor(dens * 18));
            for (let i = 1; i < totalStones; i++) {
                const t = i / totalStones;
                const angle = armOffset + t * Math.PI * 3;
                const r = t * maxRadius * 0.9;
                const wobble = (rng() - 0.5) * maxRadius * 0.04;
                const sizeObj = t < 0.15 ? SIZES.small : (t < 0.5 ? SIZES.medium : (t < 0.85 ? SIZES.large : SIZES.small));
                drawRhinestone(cx + Math.cos(angle) * (r + wobble), cy + Math.sin(angle) * (r + wobble), sizeObj.radius, palette[i % palette.length]);
                recordStone(getSizeKey(sizeObj));
                // Звёзды-спутники
                if (rng() > 0.6) {
                    const sa = angle + (rng() - 0.5) * 0.5;
                    const sr = r + (rng() - 0.5) * maxRadius * 0.06;
                    drawRhinestone(cx + Math.cos(sa) * sr, cy + Math.sin(sa) * sr, SIZES.small.radius, pick(palette));
                    recordStone('small');
                }
            }
        }
    }

    function generateInterference(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const numRings = state.rings;
        const dens = state.density;
        const sep = maxRadius * 0.2;
        const src1 = { x: cx - sep, y: cy };
        const src2 = { x: cx + sep, y: cy };
        drawRhinestone(src1.x, src1.y, SIZES.large.radius, palette[0]);
        drawRhinestone(src2.x, src2.y, SIZES.large.radius, palette[1]);
        recordStone('large'); recordStone('large');
        const gridSize = Math.max(20, Math.floor(dens * 8));
        const step = (maxRadius * 1.7) / gridSize;
        const startX = cx - (gridSize * step) / 2;
        const startY = cy - (gridSize * step) / 2;
        const wavelength = maxRadius * 0.15;
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const x = startX + i * step;
                const y = startY + j * step;
                const d1 = Math.hypot(x - src1.x, y - src1.y);
                const d2 = Math.hypot(x - src2.x, y - src2.y);
                const phase = (d1 + d2) / wavelength;
                const intensity = (Math.cos(phase * Math.PI * 2) + 1) / 2;
                if (intensity > 0.55) {
                    const sizeObj = intensity > 0.8 ? SIZES.medium : SIZES.small;
                    const colorIdx = Math.floor(intensity * palette.length) % palette.length;
                    drawRhinestone(x, y, sizeObj.radius, palette[colorIdx]);
                    recordStone(getSizeKey(sizeObj));
                }
            }
        }
    }

    function generateFractal(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const branches = Math.max(3, Math.min(8, state.symmetry));
        const depth = Math.min(5, Math.max(2, Math.floor(state.rings * 0.7)));
        const dens = state.density;
        drawRhinestone(cx, cy, SIZES.xlarge.radius * 1.3, pick(palette));
        recordStone('xlarge');
        function branch(x, y, angle, length, d) {
            if (d <= 0 || length < 3) return;
            const stones = Math.max(2, Math.floor(dens * 0.8));
            for (let s = 0; s < stones; s++) {
                const st = s / stones;
                const px = x + Math.cos(angle) * length * st;
                const py = y + Math.sin(angle) * length * st;
                const sizeObj = d > 2 ? SIZES.large : (d > 1 ? SIZES.medium : SIZES.small);
                drawRhinestone(px, py, sizeObj.radius, palette[d % palette.length]);
                recordStone(getSizeKey(sizeObj));
            }
            const ex = x + Math.cos(angle) * length;
            const ey = y + Math.sin(angle) * length;
            const spread = 0.5;
            for (let b = 0; b < 2; b++) {
                const newAngle = angle + (b === 0 ? -spread : spread) + (rng() - 0.5) * 0.2;
                branch(ex, ey, newAngle, length * 0.65, d - 1);
            }
        }
        for (let i = 0; i < branches; i++) {
            const a = (Math.PI * 2 * i) / branches - Math.PI / 2;
            branch(cx, cy, a, maxRadius * 0.35, depth);
        }
    }

    function generateCrystal(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const dens = state.density;
        const gridSize = Math.max(5, Math.min(12, Math.floor(state.symmetry * 0.8)));
        const cellSize = (maxRadius * 1.7) / gridSize;
        const startX = cx - (gridSize * cellSize) / 2;
        const startY = cy - (gridSize * cellSize) / 2;
        // Узлы решётки
        for (let i = 0; i <= gridSize; i++) {
            for (let j = 0; j <= gridSize; j++) {
                const x = startX + i * cellSize;
                const y = startY + j * cellSize;
                drawRhinestone(x, y, SIZES.large.radius, palette[(i + j) % palette.length]);
                recordStone('large');
            }
        }
        // Связи
        if (dens > 2) {
            for (let i = 0; i <= gridSize; i++) {
                for (let j = 0; j <= gridSize; j++) {
                    const x = startX + i * cellSize;
                    const y = startY + j * cellSize;
                    if (i < gridSize) {
                        const stones = Math.max(2, Math.floor(dens));
                        for (let s = 1; s < stones; s++) {
                            const st = s / stones;
                            drawRhinestone(x + st * cellSize, y, SIZES.small.radius, pick(palette));
                            recordStone('small');
                        }
                    }
                    if (j < gridSize) {
                        const stones = Math.max(2, Math.floor(dens));
                        for (let s = 1; s < stones; s++) {
                            const st = s / stones;
                            drawRhinestone(x, y + st * cellSize, SIZES.small.radius, pick(palette));
                            recordStone('small');
                        }
                    }
                }
            }
        }
        drawRectBorder(startX, startY, gridSize * cellSize, gridSize * cellSize, SIZES.medium, palette);
    }

    // --- Новые генераторы: растительные ---

    function generateLotus(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const layers = Math.max(3, Math.floor(state.rings * 0.7));
        const dens = state.density;
        drawRhinestone(cx, cy, SIZES.xlarge.radius * 1.4, pick(palette));
        recordStone('xlarge');
        for (let layer = 0; layer < layers; layer++) {
            const lt = (layer + 1) / layers;
            const petals = Math.max(6, state.symmetry);
            const petalR = maxRadius * lt * 0.8;
            const petalLen = maxRadius * 0.12 * lt;
            for (let p = 0; p < petals; p++) {
                const angle = (Math.PI * 2 * p) / petals + layer * 0.3;
                const stones = Math.max(3, Math.floor(dens * 0.7));
                for (let s = 0; s < stones; s++) {
                    const st = s / stones;
                    const r = petalR + st * petalLen;
                    const spread = Math.sin(st * Math.PI) * 0.2;
                    const sizeObj = st < 0.5 ? SIZES.medium : SIZES.small;
                    drawRhinestone(cx + Math.cos(angle + spread) * r, cy + Math.sin(angle + spread) * r, sizeObj.radius, palette[(p + layer) % palette.length]);
                    recordStone(getSizeKey(sizeObj));
                    drawRhinestone(cx + Math.cos(angle - spread) * r, cy + Math.sin(angle - spread) * r, sizeObj.radius, palette[(p + layer) % palette.length]);
                    recordStone(getSizeKey(sizeObj));
                }
                drawRhinestone(cx + Math.cos(angle) * (petalR + petalLen), cy + Math.sin(angle) * (petalR + petalLen), SIZES.large.radius, pick(palette));
                recordStone('large');
            }
        }
    }

    function generateRose(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const numRings = state.rings;
        const dens = state.density;
        const k = Math.max(2, Math.floor(state.symmetry / 2));
        drawRhinestone(cx, cy, SIZES.xlarge.radius * 1.3, pick(palette));
        recordStone('xlarge');
        for (let ring = 0; ring < numRings; ring++) {
            const rt = (ring + 1) / numRings;
            const r0 = maxRadius * rt * 0.85;
            const count = Math.max(40, Math.floor(dens * 30));
            for (let i = 0; i < count; i++) {
                const theta = (Math.PI * 2 * i) / count;
                const petalR = r0 * Math.abs(Math.cos(k * theta));
                if (petalR < 3) continue;
                const sizeObj = petalR > r0 * 0.6 ? SIZES.medium : SIZES.small;
                drawRhinestone(cx + Math.cos(theta) * petalR, cy + Math.sin(theta) * petalR, sizeObj.radius, palette[(i + ring) % palette.length]);
                recordStone(getSizeKey(sizeObj));
            }
        }
    }

    function generateTree(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const dens = state.density;
        const trunkH = maxRadius * 0.7;
        const trunkStones = Math.max(8, Math.floor(dens * 4));
        // Ствол
        for (let s = 0; s < trunkStones; s++) {
            const st = s / trunkStones;
            const y = cy + maxRadius * 0.7 - st * trunkH;
            const sizeObj = st > 0.7 ? SIZES.medium : SIZES.large;
            drawRhinestone(cx, y, sizeObj.radius, palette[0]);
            recordStone(getSizeKey(sizeObj));
        }
        // Крона — круги ветвей
        const crownY = cy + maxRadius * 0.7 - trunkH;
        const crownR = maxRadius * 0.55;
        const branches = Math.max(4, Math.floor(state.symmetry / 2));
        for (let b = 0; b < branches; b++) {
            const angle = -Math.PI / 2 + (b - branches / 2) * 0.5;
            const bStones = Math.max(5, Math.floor(dens * 3));
            for (let s = 0; s < bStones; s++) {
                const st = s / bStones;
                const r = st * crownR;
                const wobble = Math.sin(st * Math.PI) * 0.15;
                const x = cx + Math.cos(angle + wobble) * r;
                const y = crownY + Math.sin(angle + wobble) * r;
                const sizeObj = st < 0.3 ? SIZES.medium : (st < 0.7 ? SIZES.small : SIZES.small);
                drawRhinestone(x, y, sizeObj.radius, palette[(b + s) % palette.length]);
                recordStone(getSizeKey(sizeObj));
                // Листья-стразы вокруг ветви
                if (st > 0.3 && rng() > 0.4) {
                    const la = angle + wobble + (rng() - 0.5) * 0.6;
                    const lr = r + (rng() - 0.5) * maxRadius * 0.05;
                    drawRhinestone(cx + Math.cos(la) * lr, crownY + Math.sin(la) * lr, SIZES.small.radius, pick(palette));
                    recordStone('small');
                }
            }
        }
        // Корни
        for (let b = 0; b < 3; b++) {
            const angle = Math.PI / 2 + (b - 1) * 0.4;
            for (let s = 0; s < 5; s++) {
                const st = s / 5;
                const r = st * maxRadius * 0.2;
                drawRhinestone(cx + Math.cos(angle) * r, cy + maxRadius * 0.7 + Math.sin(angle) * r, SIZES.small.radius, pick(palette));
                recordStone('small');
            }
        }
    }

    function generateVine(cx, cy, maxRadius, width, height) {
        const palette = PALETTES[state.palette];
        const dens = state.density;
        const w = width || maxRadius * 1.8;
        const h = height || maxRadius * 1.8;
        const left = cx - w / 2;
        const top = cy - h / 2;
        const spirals = Math.max(3, Math.floor(state.rings * 0.6));
        const spiralW = w / spirals;
        drawRhinestone(left, cy, SIZES.large.radius, pick(palette));
        recordStone('large');
        for (let sp = 0; sp < spirals; sp++) {
            const x0 = left + sp * spiralW + spiralW / 2;
            const amp = spiralW * 0.35;
            const turns = 1 + sp % 2;
            const stones = Math.max(15, Math.floor(dens * 12));
            for (let i = 0; i < stones; i++) {
                const t = i / stones;
                const y = top + t * h;
                const x = x0 + Math.sin(t * turns * Math.PI * 2) * amp;
                const sizeObj = i % 4 === 0 ? SIZES.medium : SIZES.small;
                drawRhinestone(x, y, sizeObj.radius, palette[(sp + i) % palette.length]);
                recordStone(getSizeKey(sizeObj));
                // Листья
                if (i % 5 === 0 && dens > 2) {
                    const la = Math.sin(t * turns * Math.PI * 2) > 0 ? 0.5 : -0.5;
                    drawRhinestone(x + Math.cos(la) * amp * 0.4, y + Math.sin(la) * amp * 0.4, SIZES.small.radius, pick(palette));
                    recordStone('small');
                }
            }
        }
        drawRectBorder(left, top, w, h, SIZES.small, palette);
    }

    // --- Новые генераторы: абстрактные ---

    function generateKaleidoscope(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const sym = state.symmetry;
        const dens = state.density;
        const numRings = state.rings;
        drawRhinestone(cx, cy, SIZES.xlarge.radius * 1.2, pick(palette));
        recordStone('xlarge');
        for (let ring = 0; ring < numRings; ring++) {
            const r = maxRadius * ((ring + 1) / numRings) * 0.85;
            const wedgeStones = Math.max(3, Math.floor(dens * 1.5));
            for (let w = 0; w < wedgeStones; w++) {
                const wt = w / wedgeStones;
                const angle = wt * (Math.PI * 2 / sym);
                const wr = r * (0.3 + rng() * 0.7);
                const sizeObj = pickSize();
                const color = pick(palette);
                placeSymmetrical(cx, cy, sizeObj.radius, color, angle, wr, sym);
                recordStone(getSizeKey(sizeObj));
            }
        }
    }

    function generateMosaic(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const dens = state.density;
        const gridSize = Math.max(6, Math.min(14, Math.floor(state.symmetry * 1.2)));
        const cellSize = (maxRadius * 1.7) / gridSize;
        const startX = cx - (gridSize * cellSize) / 2;
        const startY = cy - (gridSize * cellSize) / 2;
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const x = startX + i * cellSize + cellSize / 2;
                const y = startY + j * cellSize + cellSize / 2;
                const dist = Math.hypot(x - cx, y - cy);
                const t = dist / maxRadius;
                if (t > 1) continue;
                const sizeObj = rng() > 0.3 ? SIZES.medium : SIZES.small;
                const colorIdx = Math.floor((Math.sin(i * 0.5) + Math.cos(j * 0.5) + 2) * palette.length / 4) % palette.length;
                drawRhinestone(x, y, sizeObj.radius, palette[colorIdx]);
                recordStone(getSizeKey(sizeObj));
                if (dens > 4 && rng() > 0.5) {
                    drawRhinestone(x + cellSize * 0.25, y + cellSize * 0.25, SIZES.small.radius, pick(palette));
                    recordStone('small');
                }
            }
        }
        drawRectBorder(startX, startY, gridSize * cellSize, gridSize * cellSize, SIZES.medium, palette);
    }

    // --- Новые генераторы: скандинавский ---

    function generateNorse(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const dens = state.density;
        const gridSize = Math.max(4, Math.min(8, Math.floor(state.symmetry * 0.5)));
        const cellSize = (maxRadius * 1.6) / gridSize;
        const startX = cx - (gridSize * cellSize) / 2;
        const startY = cy - (gridSize * cellSize) / 2;
        // Решётка из X-образных узлов
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const x = startX + i * cellSize + cellSize / 2;
                const y = startY + j * cellSize + cellSize / 2;
                // Центральный узел
                drawRhinestone(x, y, SIZES.large.radius, palette[(i + j) % palette.length]);
                recordStone('large');
                // X-образные связи
                if (dens > 1) {
                    const r = cellSize * 0.3;
                    const stones = Math.max(2, Math.floor(dens * 0.5));
                    for (let s = 1; s <= stones; s++) {
                        const st = s / (stones + 1);
                        for (let d = 0; d < 4; d++) {
                            const a = (Math.PI * d) / 2 + Math.PI / 4;
                            drawRhinestone(x + Math.cos(a) * r * st, y + Math.sin(a) * r * st, SIZES.small.radius, palette[(i + j + d) % palette.length]);
                            recordStone('small');
                        }
                    }
                }
            }
        }
        // Рамка с зубцами
        drawRectBorder(startX, startY, gridSize * cellSize, gridSize * cellSize, SIZES.medium, palette);
        // Угловые акценты
        const corners = [[0, 0], [gridSize, 0], [0, gridSize], [gridSize, gridSize]];
        for (const [ci, cj] of corners) {
            drawRhinestone(startX + ci * cellSize, startY + cj * cellSize, SIZES.xlarge.radius, pick(palette));
            recordStone('xlarge');
        }
    }

    // --- Вспомогательные функции для новых генераторов ---

    function drawNPointStar(cx, cy, outerR, innerR, points, palette) {
        const starPoints = [];
        for (let i = 0; i < points * 2; i++) {
            const a = (Math.PI * i) / points - Math.PI / 2;
            const r = i % 2 === 0 ? outerR : innerR;
            starPoints.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
        }
        for (let i = 0; i < starPoints.length; i++) {
            const p = starPoints[i];
            const sizeObj = i % 2 === 0 ? SIZES.large : SIZES.small;
            drawRhinestone(p.x, p.y, sizeObj.radius, pick(palette));
            recordStone(getSizeKey(sizeObj));
        }
    }

    function drawRectBorder(x, y, w, h, sizeObj, palette) {
        const stonesPerSide = Math.max(6, Math.floor(w / (sizeObj.radius * 3)));
        for (let s = 0; s <= stonesPerSide; s++) {
            const t = s / stonesPerSide;
            // Верх
            drawRhinestone(x + t * w, y, sizeObj.radius, pick(palette));
            // Низ
            drawRhinestone(x + t * w, y + h, sizeObj.radius, pick(palette));
            // Лево
            drawRhinestone(x, y + t * h, sizeObj.radius, pick(palette));
            // Право
            drawRhinestone(x + w, y + t * h, sizeObj.radius, pick(palette));
            recordStone(getSizeKey(sizeObj));
            recordStone(getSizeKey(sizeObj));
            recordStone(getSizeKey(sizeObj));
            recordStone(getSizeKey(sizeObj));
        }
    }

    // --- Сетка-направляющая ---
    function drawGrid(cx, cy, maxRadius) {
        ctx.save();
        ctx.strokeStyle = 'rgba(124, 158, 255, 0.12)';
        ctx.lineWidth = 1;

        // Концентрические круги
        for (let i = 1; i <= state.rings + 1; i++) {
            ctx.beginPath();
            ctx.arc(cx, cy, (maxRadius * i) / (state.rings + 1), 0, Math.PI * 2);
            ctx.stroke();
        }

        // Линии симметрии
        for (let i = 0; i < state.symmetry; i++) {
            const a = (Math.PI * 2 * i) / state.symmetry;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(a) * maxRadius, cy + Math.sin(a) * maxRadius);
            ctx.stroke();
        }
        ctx.restore();
    }

    // --- Ручная рисовальная система ---
    let isDrawing = false;
    let currentPath = null;

    function getCanvasCoords(e) {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: (clientX - rect.left) * (canvas.width / rect.width) / dpr,
            y: (clientY - rect.top) * (canvas.height / rect.height) / dpr,
        };
    }

    function drawSchemaPaths(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        ctx.save();
        ctx.strokeStyle = 'rgba(124, 158, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (const path of state.drawnPaths) {
            if (path.points.length < 2) {
                // Одиночная точка
                ctx.fillStyle = 'rgba(124, 158, 255, 0.4)';
                ctx.beginPath();
                ctx.arc(path.points[0].x, path.points[0].y, 3, 0, Math.PI * 2);
                ctx.fill();
                continue;
            }
            ctx.beginPath();
            ctx.moveTo(path.points[0].x, path.points[0].y);
            for (let i = 1; i < path.points.length; i++) {
                ctx.lineTo(path.points[i].x, path.points[i].y);
            }
            ctx.stroke();

            // Симметричные копии
            if (state.drawSymmetry > 1) {
                for (let s = 1; s < state.drawSymmetry; s++) {
                    const angle = (Math.PI * 2 * s) / state.drawSymmetry;
                    ctx.save();
                    ctx.translate(cx, cy);
                    ctx.rotate(angle);
                    ctx.translate(-cx, -cy);
                    ctx.beginPath();
                    ctx.moveTo(path.points[0].x, path.points[0].y);
                    for (let i = 1; i < path.points.length; i++) {
                        ctx.lineTo(path.points[i].x, path.points[i].y);
                    }
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }
        ctx.restore();
    }

    function generateRhinestonesFromPaths(cx, cy, maxRadius) {
        const palette = PALETTES[state.palette];
        const dens = state.drawDensity;
        const spacing = Math.max(6, 22 - dens * 2);

        for (const path of state.drawnPaths) {
            if (path.points.length === 0) continue;

            if (path.points.length === 1) {
                drawRhinestone(path.points[0].x, path.points[0].y, pickSize().radius, pick(palette));
                recordStone(getSizeKey(pickSize()));
                continue;
            }

            // Интерполируем точки по пути с заданным шагом
            let accumulated = 0;
            let lastPlaced = -spacing;

            for (let i = 1; i < path.points.length; i++) {
                const p0 = path.points[i - 1];
                const p1 = path.points[i];
                const segLen = Math.hypot(p1.x - p0.x, p1.y - p0.y);
                if (segLen < 0.5) continue;

                const steps = Math.ceil(segLen / 2);
                for (let s = 0; s <= steps; s++) {
                    const t = s / steps;
                    const x = lerp(p0.x, p1.x, t);
                    const y = lerp(p0.y, p1.y, t);
                    accumulated += segLen / steps;

                    if (accumulated - lastPlaced >= spacing) {
                        const sizeObj = pickSize();
                        const color = pick(palette);
                        placeDrawnStone(cx, cy, x, y, sizeObj.radius, color);
                        lastPlaced = accumulated;
                    }
                }
            }

            // Конечная точка
            const last = path.points[path.points.length - 1];
            const sizeObj = SIZES.large;
            placeDrawnStone(cx, cy, last.x, last.y, sizeObj.radius, pick(palette));
        }
    }

    function placeDrawnStone(cx, cy, x, y, radius, color) {
        drawRhinestone(x, y, radius, color);
        recordStone(getSizeKey({ radius }));
        if (state.drawSymmetry > 1) {
            const dx = x - cx, dy = y - cy;
            const dist = Math.hypot(dx, dy);
            const baseAngle = Math.atan2(dy, dx);
            for (let s = 1; s < state.drawSymmetry; s++) {
                const angle = baseAngle + (Math.PI * 2 * s) / state.drawSymmetry;
                const sx = cx + Math.cos(angle) * dist;
                const sy = cy + Math.sin(angle) * dist;
                drawRhinestone(sx, sy, radius, color);
                recordStone(getSizeKey({ radius }));
            }
        }
    }

    function initDrawEvents() {
        canvas.addEventListener('mousedown', (e) => {
            if (state.activeTab !== 'draw') return;
            isDrawing = true;
            const pt = getCanvasCoords(e);
            currentPath = { points: [pt] };
            state.drawnPaths.push(currentPath);
            render();
        });

        canvas.addEventListener('mousemove', (e) => {
            if (state.activeTab !== 'draw' || !isDrawing || !currentPath) return;
            const pt = getCanvasCoords(e);
            const last = currentPath.points[currentPath.points.length - 1];
            if (Math.hypot(pt.x - last.x, pt.y - last.y) > 2) {
                currentPath.points.push(pt);
                render();
            }
        });

        canvas.addEventListener('mouseup', () => {
            if (state.activeTab !== 'draw') return;
            isDrawing = false;
            currentPath = null;
        });

        canvas.addEventListener('mouseleave', () => {
            if (state.activeTab !== 'draw') return;
            isDrawing = false;
            currentPath = null;
        });

        // Touch
        canvas.addEventListener('touchstart', (e) => {
            if (state.activeTab !== 'draw') return;
            e.preventDefault();
            isDrawing = true;
            const pt = getCanvasCoords(e);
            currentPath = { points: [pt] };
            state.drawnPaths.push(currentPath);
            render();
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            if (state.activeTab !== 'draw' || !isDrawing || !currentPath) return;
            e.preventDefault();
            const pt = getCanvasCoords(e);
            const last = currentPath.points[currentPath.points.length - 1];
            if (Math.hypot(pt.x - last.x, pt.y - last.y) > 2) {
                currentPath.points.push(pt);
                render();
            }
        }, { passive: false });

        canvas.addEventListener('touchend', () => {
            if (state.activeTab !== 'draw') return;
            isDrawing = false;
            currentPath = null;
        });
    }

    // --- Карта генераторов ---
    const GENERATORS = {
        mandala:       generateMandala,
        floral:        generateFloral,
        geometric:     generateGeometric,
        starburst:     generateStarburst,
        islamic:       generateIslamic,
        celtic:        generateCeltic,
        aztec:         generateAztec,
        rangoli:       generateRangoli,
        african:       generateAfrican,
        chinese:       generateChinese,
        circle:        generateCircle,
        square:        generateSquare,
        triangle:      generateTriangle,
        rhombus:       generateRhombus,
        hexagon:       generateHexagon,
        star:          generateStarburst,
        spiral:        generateSpiral,
        meander:       generateMeander,
        wave:          generateWave,
        magnetic:      generateMagnetic,
        vortex:        generateVortex,
        galaxy:        generateGalaxy,
        interference:  generateInterference,
        fractal:       generateFractal,
        crystal:       generateCrystal,
        lotus:         generateLotus,
        rose:          generateRose,
        tree:          generateTree,
        vine:          generateVine,
        kaleidoscope:  generateKaleidoscope,
        mosaic:        generateMosaic,
        norse:         generateNorse,
    };

    // --- Определение формы canvas по выбранным типам ---
    function getActiveShape() {
        const types = state.selectedTypes;
        if (types.length === 0) return 'circle';
        if (types.length === 1) return ORNAMENT_TYPES[types[0]].shape;
        // Несколько типов: если все одинаковая форма — используем её,
        // иначе приоритет: rect > square > circle
        const shapes = types.map(t => ORNAMENT_TYPES[t].shape);
        if (shapes.every(s => s === 'circle')) return 'circle';
        if (shapes.every(s => s === 'square')) return 'square';
        if (shapes.includes('rect')) return 'rect';
        if (shapes.includes('square')) return 'square';
        return 'circle';
    }

    // --- Главный рендеринг ---
    function render() {
        rng = mulberry32(state.seed);
        stoneStats = { small: 0, medium: 0, large: 0, xlarge: 0 };

        const dpr = window.devicePixelRatio || 1;
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;
        const cx = w / 2;
        const cy = h / 2;
        const maxRadius = Math.min(w, h) * 0.46;
        const shape = getActiveShape();

        ctx.clearRect(0, 0, w, h);

        // Фон-подложка
        if (shape === 'circle') {
            const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius);
            bgGrad.addColorStop(0, 'rgba(30, 36, 52, 0.6)');
            bgGrad.addColorStop(0.7, 'rgba(20, 24, 36, 0.4)');
            bgGrad.addColorStop(1, 'rgba(13, 17, 23, 0.2)');
            ctx.fillStyle = bgGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, maxRadius * 1.02, 0, Math.PI * 2);
            ctx.fill();
        } else {
            const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.6);
            bgGrad.addColorStop(0, 'rgba(30, 36, 52, 0.6)');
            bgGrad.addColorStop(0.7, 'rgba(20, 24, 36, 0.4)');
            bgGrad.addColorStop(1, 'rgba(13, 17, 23, 0.2)');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, w, h);
        }

        // Сетка
        if (state.showGrid) {
            drawGrid(cx, cy, maxRadius);
        }

        // Генерация орнаментов — наслоение всех выбранных типов
        const types = state.selectedTypes;
        const perTypeAlpha = types.length > 1 ? 0.85 : 1.0;

        for (let i = 0; i < types.length; i++) {
            const typeId = types[i];
            const gen = GENERATORS[typeId];
            if (!gen) continue;

            // Применяем настройки выбранного типа
            applyTypeSettings(typeId);

            if (types.length > 1 && i > 0) {
                ctx.save();
                ctx.globalAlpha = perTypeAlpha;
            }

            if (typeId === 'african' || typeId === 'vine') {
                gen(cx, cy, maxRadius, w, h);
            } else {
                gen(cx, cy, maxRadius);
            }

            if (types.length > 1 && i > 0) {
                ctx.restore();
            }
        }

        // Слой ручного рисования — поверх орнаментов, сохраняется при переключении вкладок.
        // Использует собственные палитру и размеры, независимые от орнаментов.
        state.palette = state.drawPalette;
        state.enabledSizes = { ...state.drawEnabledSizes };
        // Линии-схема: всегда во вкладке рисования; во вкладке орнаментов — только если стразы ещё не сгенерированы.
        if (state.activeTab === 'draw' || !state.drawGenerated) {
            drawSchemaPaths(cx, cy, maxRadius);
        }
        if (state.drawGenerated) {
            generateRhinestonesFromPaths(cx, cy, maxRadius);
        }

        // Восстанавливаем настройки активного типа для слайдеров
        if (state.activeType) {
            applyTypeSettings(state.activeType);
        }

        updateStats();
    }

    // --- Настройка размера canvas ---
    function resizeCanvas() {
        const area = document.querySelector('.canvas-area');
        const rect = area.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const shape = getActiveShape();

        // Убираем старые классы формы
        canvas.classList.remove('shape-square', 'shape-rect');

        let dimW, dimH;
        if (shape === 'rect') {
            dimW = Math.min(rect.width - 40, 600);
            dimH = Math.min(rect.height - 40, 500);
            canvas.classList.add('shape-rect');
        } else if (shape === 'square') {
            dimW = dimH = Math.min(rect.width - 40, rect.height - 40);
            canvas.classList.add('shape-square');
        } else {
            dimW = dimH = Math.min(rect.width - 40, rect.height - 40);
        }

        canvas.style.width = dimW + 'px';
        canvas.style.height = dimH + 'px';
        canvas.width = dimW * dpr;
        canvas.height = dimH * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        render();
    }

    // --- Статистика ---
    function updateStats() {
        const total = stoneStats.small + stoneStats.medium + stoneStats.large + stoneStats.xlarge;
        document.getElementById('totalStones').textContent = total;

        const breakdown = document.getElementById('sizeBreakdown');
        breakdown.innerHTML = '';

        const entries = [
            { key: 'small',  label: 'SS6' },
            { key: 'medium', label: 'SS10' },
            { key: 'large',  label: 'SS16' },
            { key: 'xlarge', label: 'SS20' },
        ];

        for (const e of entries) {
            if (stoneStats[e.key] > 0) {
                const chip = document.createElement('div');
                chip.className = 'stat-chip';
                chip.innerHTML = `<span class="stat-chip-dot" style="background:${SIZES[e.key].color}"></span>${e.label}: ${stoneStats[e.key]}`;
                breakdown.appendChild(chip);
            }
        }
    }

    // --- Полный сброс приложения (как при перезагрузке) ---
    function resetAll() {
        // Состояние
        state.selectedTypes = [];
        state.activeType = null;
        state.typeSettings = {};
        state.symmetry = DEFAULT_TYPE_SETTINGS.symmetry;
        state.rings = DEFAULT_TYPE_SETTINGS.rings;
        state.density = DEFAULT_TYPE_SETTINGS.density;
        state.palette = DEFAULT_TYPE_SETTINGS.palette;
        state.enabledSizes = { ...DEFAULT_TYPE_SETTINGS.enabledSizes };
        state.showGrid = false;
        state.showInfo = true;
        state.seed = Math.random();
        state.expandedGroups = new Set(['floral']);
        state.schemaMode = false;
        state.activeTab = 'ornaments';
        state.drawnPaths = [];
        state.drawGenerated = false;
        state.drawSymmetry = 1;
        state.drawDensity = 5;
        state.drawPalette = 'diamond';
        state.drawEnabledSizes = { ...DEFAULT_TYPE_SETTINGS.enabledSizes };
        isDrawing = false;
        currentPath = null;

        // UI: список орнаментов, бейдж, слайдеры, палитра, размеры
        buildGroupUI();
        updateComboBadge();
        syncSlidersToActive();

        // UI: тогглы
        document.getElementById('showGrid').checked = false;
        document.getElementById('showInfo').checked = true;
        document.getElementById('stats').style.display = 'block';
        const schemaToggle = document.getElementById('schemaMode');
        if (schemaToggle) schemaToggle.checked = false;

        // UI: слайдеры и кнопка вкладки рисования
        const drawSymSlider = document.getElementById('drawSymmetry');
        if (drawSymSlider) {
            drawSymSlider.value = 1;
            document.getElementById('drawSymmetryValue').textContent = '1';
        }
        const drawDensSlider = document.getElementById('drawDensity');
        if (drawDensSlider) {
            drawDensSlider.value = 5;
            document.getElementById('drawDensityValue').textContent = '5';
        }
        const drawGenBtn = document.getElementById('drawGenerateBtn');
        if (drawGenBtn) drawGenBtn.textContent = 'Показать стразы';

        // UI: вкладка «Готовые орнаменты»
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.tab === 'ornaments');
        });
        document.querySelectorAll('.tab-panel').forEach(p => {
            p.classList.toggle('active', p.id === 'tab-ornaments');
        });
        canvas.classList.remove('draw-cursor');

        resizeCanvas();
    }

    // --- Скачивание PNG ---
    function downloadPNG() {
        const types = state.selectedTypes.length > 0 ? state.selectedTypes.join('-') : 'mandala';
        const link = document.createElement('a');
        link.download = `rhinestone-ornament-${types}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    // --- Построение UI групп орнаментов ---
    function buildGroupUI() {
        const container = document.getElementById('ornamentGroups');
        container.innerHTML = '';

        for (const group of GROUPS) {
            const typesInGroup = Object.keys(ORNAMENT_TYPES).filter(
                tid => ORNAMENT_TYPES[tid].group === group.id
            );
            if (typesInGroup.length === 0) continue;

            const selectedInGroup = typesInGroup.filter(t => state.selectedTypes.includes(t));

            const groupEl = document.createElement('div');
            groupEl.className = 'ornament-group';
            if (state.expandedGroups.has(group.id)) groupEl.classList.add('expanded');

            const header = document.createElement('div');
            header.className = 'ornament-group__header';
            header.innerHTML = `
                <span class="ornament-group__title">${group.label}</span>
                <div style="display:flex;align-items:center;gap:6px;">
                    <span class="ornament-group__count">${selectedInGroup.length}</span>
                    <svg class="ornament-group__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                </div>
            `;
            header.addEventListener('click', () => {
                if (state.expandedGroups.has(group.id)) {
                    state.expandedGroups.delete(group.id);
                    groupEl.classList.remove('expanded');
                } else {
                    state.expandedGroups.add(group.id);
                    groupEl.classList.add('expanded');
                }
            });

            const body = document.createElement('div');
            body.className = 'ornament-group__body';

            for (const typeId of typesInGroup) {
                const btn = document.createElement('button');
                btn.className = 'type-btn';
                btn.textContent = ORNAMENT_TYPES[typeId].label;
                btn.dataset.type = typeId;
                if (state.selectedTypes.includes(typeId)) btn.classList.add('active');
                if (state.activeType === typeId) btn.classList.add('is-active');

                btn.addEventListener('click', () => {
                    const idx = state.selectedTypes.indexOf(typeId);
                    if (idx >= 0) {
                        if (state.activeType === typeId) {
                            // Активный тип — снимаем выделение
                            state.selectedTypes.splice(idx, 1);
                            btn.classList.remove('active');
                            state.activeType = state.selectedTypes.length > 0 ? state.selectedTypes[0] : null;
                        } else {
                            // Уже выбран, но не активен — делаем активным
                            state.activeType = typeId;
                        }
                    } else {
                        // Добавляем и делаем активным
                        state.selectedTypes.push(typeId);
                        btn.classList.add('active');
                        state.activeType = typeId;
                    }
                    // Обновляем класс is-active на всех кнопках
                    document.querySelectorAll('.type-btn').forEach(b => {
                        b.classList.toggle('is-active', b.dataset.type === state.activeType);
                    });
                    updateGroupCounts();
                    updateComboBadge();
                    syncSlidersToActive();
                    resizeCanvas();
                });

                body.appendChild(btn);
            }

            groupEl.appendChild(header);
            groupEl.appendChild(body);
            container.appendChild(groupEl);
        }
    }

    function updateGroupCounts() {
        const groups = document.querySelectorAll('.ornament-group');
        GROUPS.forEach((group, gi) => {
            const typesInGroup = Object.keys(ORNAMENT_TYPES).filter(
                tid => ORNAMENT_TYPES[tid].group === group.id
            );
            const count = typesInGroup.filter(t => state.selectedTypes.includes(t)).length;
            const countEl = groups[gi]?.querySelector('.ornament-group__count');
            if (countEl) countEl.textContent = count;
        });
    }

    function updateComboBadge() {
        const badge = document.getElementById('comboBadge');
        const n = state.selectedTypes.length;
        if (n === 0) {
            badge.textContent = 'ничего не выбрано';
        } else if (n === 1) {
            badge.textContent = '1 выбран';
        } else {
            badge.textContent = `${n} выбрано`;
        }
    }

    // --- Обработчики событий ---
    function initEvents() {
        // Палитра
        document.querySelectorAll('.palette-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.palette = btn.dataset.palette;
                if (state.activeTab === 'draw') {
                    state.drawPalette = state.palette;
                } else if (state.activeType) {
                    ensureTypeSettings(state.activeType).palette = state.palette;
                }
                render();
            });
        });

        // Слайдеры — сохраняем настройки для активного типа
        const symmetrySlider = document.getElementById('symmetry');
        symmetrySlider.addEventListener('input', () => {
            state.symmetry = parseInt(symmetrySlider.value);
            document.getElementById('symmetryValue').textContent = state.symmetry;
            if (state.activeType) {
                ensureTypeSettings(state.activeType).symmetry = state.symmetry;
            }
            render();
        });

        const ringsSlider = document.getElementById('rings');
        ringsSlider.addEventListener('input', () => {
            state.rings = parseInt(ringsSlider.value);
            document.getElementById('ringsValue').textContent = state.rings;
            if (state.activeType) {
                ensureTypeSettings(state.activeType).rings = state.rings;
            }
            render();
        });

        const densitySlider = document.getElementById('density');
        densitySlider.addEventListener('input', () => {
            state.density = parseInt(densitySlider.value);
            document.getElementById('densityValue').textContent = state.density;
            if (state.activeType) {
                ensureTypeSettings(state.activeType).density = state.density;
            }
            render();
        });

        // Размеры
        document.querySelectorAll('.size-toggle input').forEach(cb => {
            cb.addEventListener('change', () => {
                state.enabledSizes[cb.dataset.size] = cb.checked;
                if (state.activeTab === 'draw') {
                    state.drawEnabledSizes[cb.dataset.size] = cb.checked;
                } else if (state.activeType) {
                    ensureTypeSettings(state.activeType).enabledSizes[cb.dataset.size] = cb.checked;
                }
                render();
            });
        });

        // Тогглы
        document.getElementById('showGrid').addEventListener('change', (e) => {
            state.showGrid = e.target.checked;
            render();
        });

        document.getElementById('showInfo').addEventListener('change', (e) => {
            state.showInfo = e.target.checked;
            document.getElementById('stats').style.display = e.target.checked ? 'block' : 'none';
        });

        // Режим «только схема»
        const schemaToggle = document.getElementById('schemaMode');
        if (schemaToggle) {
            schemaToggle.addEventListener('change', (e) => {
                state.schemaMode = e.target.checked;
                render();
            });
        }

        // Переключение вкладок
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                const tabId = btn.dataset.tab;
                document.getElementById('tab-' + tabId).classList.add('active');
                state.activeTab = tabId;
                canvas.classList.toggle('draw-cursor', tabId === 'draw');
                syncPaletteSizeUI();
                render();
            });
        });

        // Симметрия рисования
        const drawSymSlider = document.getElementById('drawSymmetry');
        if (drawSymSlider) {
            drawSymSlider.addEventListener('input', () => {
                state.drawSymmetry = parseInt(drawSymSlider.value);
                document.getElementById('drawSymmetryValue').textContent = state.drawSymmetry;
                render();
            });
        }

        // Плотность рисования
        const drawDensSlider = document.getElementById('drawDensity');
        if (drawDensSlider) {
            drawDensSlider.addEventListener('input', () => {
                state.drawDensity = parseInt(drawDensSlider.value);
                document.getElementById('drawDensityValue').textContent = state.drawDensity;
                render();
            });
        }

        // Генерация стразов по нарисованной схеме
        const drawGenBtn = document.getElementById('drawGenerateBtn');
        if (drawGenBtn) {
            drawGenBtn.addEventListener('click', () => {
                state.drawGenerated = !state.drawGenerated;
                drawGenBtn.textContent = state.drawGenerated ? 'Скрыть стразы' : 'Показать стразы';
                render();
            });
        }

        // Полный сброс приложения
        const drawClearBtn = document.getElementById('drawClearBtn');
        if (drawClearBtn) {
            drawClearBtn.addEventListener('click', resetAll);
        }

        // Кнопки
        document.getElementById('regenerateBtn').addEventListener('click', () => {
            state.seed = Math.random();
            render();
        });

        document.getElementById('downloadBtn').addEventListener('click', downloadPNG);

        // Ресайз
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resizeCanvas, 150);
        });

        // События рисования на canvas
        initDrawEvents();
    }

    // --- Инициализация ---
    function init() {
        buildGroupUI();
        updateComboBadge();
        syncSlidersToActive();
        initEvents();
        resizeCanvas();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
