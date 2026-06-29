import { useState } from 'react'

interface Note {
  f: number
  d: number
}

interface Track {
  id: number
  name: string
  color: string
  notes: Note[]
}

interface GeneratedTrack {
  id: number
  name: string
  color: string
  content: string
  filename: string
  totalZ: number
  layerCount: number
}

// Duration of one beat in seconds
const BEAT = 0.15

const MARIO_TRACKS: Track[] = [
  {
    id: 1, name: 'Главная Мелодия (Lead)', color: 'border-red-500 text-red-400',
    notes: [
      { f: 330, d: 1 }, { f: 330, d: 1 }, { f: 0, d: 1 }, { f: 330, d: 1 }, { f: 0, d: 1 }, { f: 262, d: 1 }, { f: 330, d: 2 },
      { f: 392, d: 2 }, { f: 0, d: 2 }, { f: 196, d: 2 }, { f: 0, d: 2 },
    ],
  },
  {
    id: 2, name: 'Гармония (Harmony)', color: 'border-orange-500 text-orange-400',
    notes: [
      { f: 196, d: 1 }, { f: 196, d: 1 }, { f: 0, d: 1 }, { f: 196, d: 1 }, { f: 0, d: 1 }, { f: 165, d: 1 }, { f: 196, d: 2 },
      { f: 262, d: 2 }, { f: 0, d: 2 }, { f: 131, d: 2 }, { f: 0, d: 2 },
    ],
  },
  {
    id: 3, name: 'Бас (Bassline)', color: 'border-blue-500 text-blue-400',
    notes: [
      { f: 131, d: 1 }, { f: 131, d: 1 }, { f: 0, d: 1 }, { f: 131, d: 1 }, { f: 0, d: 1 }, { f: 131, d: 1 }, { f: 131, d: 2 },
      { f: 131, d: 2 }, { f: 0, d: 2 }, { f: 98, d: 2 }, { f: 0, d: 2 },
    ],
  },
  {
    id: 4, name: 'Ударные (Percussion)', color: 'border-neutral-400 text-neutral-300',
    notes: [
      { f: 100, d: 0.5 }, { f: 0, d: 0.5 }, { f: 100, d: 0.5 }, { f: 0, d: 0.5 }, { f: 100, d: 0.5 }, { f: 0, d: 0.5 }, { f: 100, d: 0.5 }, { f: 0, d: 0.5 },
      { f: 100, d: 0.5 }, { f: 0, d: 0.5 }, { f: 100, d: 0.5 }, { f: 0, d: 0.5 }, { f: 100, d: 0.5 }, { f: 0, d: 0.5 }, { f: 100, d: 0.5 }, { f: 0, d: 0.5 },
      { f: 100, d: 0.5 }, { f: 0, d: 0.5 }, { f: 100, d: 0.5 }, { f: 0, d: 0.5 }, { f: 100, d: 0.5 }, { f: 0, d: 0.5 }, { f: 100, d: 0.5 }, { f: 0, d: 0.5 },
      { f: 100, d: 0.5 }, { f: 0, d: 0.5 }, { f: 100, d: 0.5 }, { f: 0, d: 0.5 }, { f: 100, d: 0.5 }, { f: 0, d: 0.5 }, { f: 100, d: 0.5 }, { f: 0, d: 0.5 },
    ],
  },
  {
    id: 5, name: 'Монетки (SFX)', color: 'border-yellow-500 text-yellow-400',
    notes: [
      { f: 0, d: 8 }, { f: 659, d: 1 }, { f: 880, d: 3 }, { f: 0, d: 4 },
    ],
  },
  {
    id: 6, name: 'Метроном (Направляющая)', color: 'border-emerald-500 text-emerald-400',
    notes: [
      { f: 150, d: 0.2 }, { f: 0, d: 3.8 }, { f: 150, d: 0.2 }, { f: 0, d: 3.8 },
      { f: 150, d: 0.2 }, { f: 0, d: 3.8 }, { f: 150, d: 0.2 }, { f: 0, d: 3.8 },
    ],
  },
]

// --- Геометрия сечения модуля (кусок шестигранника, 60°) ---
const APOTHEM = 51.96 // расстояние от центра до фасадной грани (apothem правильного 6-угольника)
const HALF = 30 // половина ширины фасадной грани (вершины при x = ±30)
const LOCK_DEPTH = 4 // глубина/высота замка "ласточкин хвост"
const RAIL = 3 // размер квадратного канала направляющей (3x3 мм)
const APEX_TRIM = 4 // на сколько мм вдоль каждой радиальной грани срезается острый угол у центра
const PIT_DEPTH = 1.5 // максимальная глубина "акустической ямы" (паузы)

// Единичный вектор от центра к правой вершине и нормаль к радиальной грани (внутрь модуля)
const RX = 0.5
const RY = 0.866
const NX = -0.866
const NY = 0.5

// Угловой паз направляющей у ПРАВОЙ вершины. Канал 3x3 центрируется на радиальном
// ребре (на стыке двух модулей) и открывается наружу. Каждый модуль вырезает свою
// половину: плоская стенка параллельна радиальному ребру и смещена на RAIL/2 внутрь.
const CH_FLOOR = { x: HALF - RAIL * RX, y: APOTHEM - RAIL * RY } // дно канала на радиальном ребре
const CH_INNER = { x: CH_FLOOR.x + (RAIL / 2) * NX, y: CH_FLOOR.y + (RAIL / 2) * NY } // внутренний угол паза
// Точка, где стенка паза выходит на фасадную грань (y = APOTHEM)
const _N3 = { x: HALF + (RAIL / 2) * NX, y: APOTHEM + (RAIL / 2) * NY }
const _aFace = (_N3.y - APOTHEM) / RY
const CH_FACE = { x: _N3.x - _aFace * RX, y: APOTHEM }

// Левая вершина — зеркало правой по оси X
const CHL_FLOOR = { x: -CH_FLOOR.x, y: CH_FLOOR.y }
const CHL_INNER = { x: -CH_INNER.x, y: CH_INNER.y }
const CHL_FACE = { x: -CH_FACE.x, y: CH_FACE.y }

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

// Возвращает точку периметра. depth — текущая глубина "акустической ямы" в мм
// (0 для звучащей ноты, плавно нарастает/спадает по слоям для пауз).
function getShapePoint(t: number, depth: number): { x: number; y: number } {
  if (t < 1 / 3) {
    // Левое радиальное ребро: от срезанного центра к дну левого паза, с впадиной замка
    const u = t * 3
    const ax = -APEX_TRIM * RX
    const ay = APEX_TRIM * RY
    let x = lerp(ax, CHL_FLOOR.x, u)
    let y = lerp(ay, CHL_FLOOR.y, u)
    let lock = 0
    if (u > 0.35 && u < 0.65) {
      if (u < 0.4) lock = -(u - 0.35) / 0.05
      else if (u <= 0.6) lock = -1
      else lock = -(0.65 - u) / 0.05
    }
    x += -0.866 * lock * LOCK_DEPTH
    y += -0.5 * lock * LOCK_DEPTH
    return { x, y }
  } else if (t < 2 / 3) {
    // Фасадная (музыкальная) грань с угловыми пазами и акустической ямой
    const u = (t - 1 / 3) * 3

    // Левый угловой паз направляющей
    if (u < 0.03) {
      const k = u / 0.03
      return { x: lerp(CHL_FLOOR.x, CHL_INNER.x, k), y: lerp(CHL_FLOOR.y, CHL_INNER.y, k) }
    }
    if (u < 0.06) {
      const k = (u - 0.03) / 0.03
      return { x: lerp(CHL_INNER.x, CHL_FACE.x, k), y: lerp(CHL_INNER.y, CHL_FACE.y, k) }
    }
    // Правый угловой паз направляющей
    if (u > 0.97) {
      const k = (u - 0.97) / 0.03
      return { x: lerp(CH_INNER.x, CH_FLOOR.x, k), y: lerp(CH_INNER.y, CH_FLOOR.y, k) }
    }
    if (u > 0.94) {
      const k = (u - 0.94) / 0.03
      return { x: lerp(CH_FACE.x, CH_INNER.x, k), y: lerp(CH_FACE.y, CH_INNER.y, k) }
    }

    // Плоская грань между пазами + акустическая яма
    const w = (u - 0.06) / 0.88
    const x = lerp(CHL_FACE.x, CH_FACE.x, w)
    let y = APOTHEM
    if (depth > 0) {
      // Лёгкий горизонтальный заход по краям, чтобы дно ямы не упиралось в вертикальные стенки
      let r = 1
      if (w < 0.05) r = w / 0.05
      else if (w > 0.95) r = (1 - w) / 0.05
      y = APOTHEM - depth * r
    }
    return { x, y }
  } else {
    // Правое радиальное ребро: от дна правого паза к срезанному центру, с шипом замка
    const u = (t - 2 / 3) * 3
    const bx = APEX_TRIM * RX
    const by = APEX_TRIM * RY
    let x = lerp(CH_FLOOR.x, bx, u)
    let y = lerp(CH_FLOOR.y, by, u)
    let lock = 0
    if (u > 0.35 && u < 0.65) {
      if (u < 0.4) lock = (u - 0.35) / 0.05
      else if (u <= 0.6) lock = 1
      else lock = (0.65 - u) / 0.05
    }
    x += 0.866 * lock * LOCK_DEPTH
    y += -0.5 * lock * LOCK_DEPTH
    return { x, y }
  }
}

// Подставляет известные нам слайсерные плейсхолдеры в пользовательский G-code.
// Температуры и т.п. мы не знаем — их нужно прописывать в Start/End G-code явными
// командами (M104/M109/M140/M190, G28), иначе принтер ругнётся "not hot/not homed".
function fillPlaceholders(gcode: string, totalLayers: number): string {
  const n = String(totalLayers)
  return gcode
    .replace(/[{[]total_layer_count[}\]]/g, n)
    .replace(/[{[]layer_count[}\]]/g, n)
}

// Делит готовый (нарезанный слайсером) G-code на "начало" и "конец", чтобы взять
// из него рабочий стартовый/финишный код, а середину (слои модели) заменить музыкой.
// Начало = всё до первого маркера слоя (или до первого движения с экструзией, если
// маркеров нет) — там нагрев, хоминг, прайм-линия. Конец = всё после последнего
// движения с экструзией — там ретракт, остывание, парковка.
function splitSampleGcode(full: string): { start: string; end: string; startLines: number; endLines: number } | null {
  const raw = full.split(/\r?\n/)
  if (raw.length < 4) return null

  const isExtrudeMove = (line: string) => {
    const s = line.trim()
    if (!/^G[01]\b/i.test(s)) return false
    if (!/\b[XY]-?\d/i.test(s)) return false
    const e = s.match(/\bE(-?\d*\.?\d+)/i)
    return e !== null && parseFloat(e[1]) > 0
  }
  const isLayerMarker = (line: string) =>
    /^;\s*(LAYER_CHANGE|CHANGE_LAYER|BEFORE_LAYER_CHANGE|LAYER[:\s=]|layer\s)/i.test(line.trim())

  let startEnd = raw.findIndex(isLayerMarker)
  if (startEnd === -1) startEnd = raw.findIndex(isExtrudeMove)
  if (startEnd <= 0) return null

  let lastExtrude = -1
  for (let i = raw.length - 1; i >= 0; i--) {
    if (isExtrudeMove(raw[i])) { lastExtrude = i; break }
  }
  if (lastExtrude < startEnd) return null

  const startArr = raw.slice(0, startEnd)
  const endArr = raw.slice(lastExtrude + 1)
  return {
    start: startArr.join('\n'),
    end: endArr.join('\n'),
    startLines: startArr.length,
    endLines: endArr.length,
  }
}

function generateGcode(
  track: Track,
  startGcode: string,
  endGcode: string,
  swipeSpeed: number,
  flowMultiplier: number,
): { content: string; totalZ: number; layerCount: number } {
  const CENTER_X = 135.0
  const CENTER_Y = 135.0
  const FILAMENT_DIAM = 1.75
  const LINE_WIDTH = 0.6
  const STEPS_PER_LAYER = 240
  const BASE_LAYERS = 10
  const BASE_LAYER_HEIGHT = 0.2
  // Максимальный горизонтальный сдвиг стенки на единицу высоты слоя при входе/выходе
  // из ямы паузы. 0.7 ≈ 35° от вертикали — печатается без провисаний (бриджинга).
  // В режиме вазы стенка одинарная, опоры по бокам нет, поэтому ограничивать наклон
  // нужно с ОБЕИХ сторон ямы (и вход, и выход), иначе нависание сверху или снизу.
  const MAX_OVERHANG = 0.7

  // 1) Разворачиваем партитуру в плоский список слоёв (нужно заранее — чтобы знать
  //    общее число слоёв для подстановки плейсхолдеров в Start G-code).
  const layerList: { layerHeight: number; isSilence: boolean }[] = []
  for (const note of track.notes) {
    const isSilence = note.f === 0
    let layerHeight = isSilence ? 0.25 : swipeSpeed / note.f
    if (layerHeight < 0.1) layerHeight = 0.1
    if (layerHeight > 0.35) layerHeight = 0.35

    const physicalHeight = swipeSpeed * (note.d * BEAT)
    const layersCount = Math.max(1, Math.round(physicalHeight / layerHeight))
    for (let i = 0; i < layersCount; i++) layerList.push({ layerHeight, isSilence })
  }
  const totalLayers = BASE_LAYERS + layerList.length

  // 2) Глубина ямы по слоям с плавными склонами с ОБЕИХ сторон. Считаем как нижнюю
  //    огибающую: depth[i] не может превышать соседей больше, чем на high*MAX_OVERHANG.
  //    Прямой проход ограничивает вход (низ ямы), обратный — выход (верх ямы).
  const depths: number[] = layerList.map((l) => (l.isSilence ? PIT_DEPTH : 0))
  for (let i = 1; i < depths.length; i++) {
    const maxStep = layerList[i].layerHeight * MAX_OVERHANG
    if (depths[i] - depths[i - 1] > maxStep) depths[i] = depths[i - 1] + maxStep
  }
  for (let i = depths.length - 2; i >= 0; i--) {
    const maxStep = layerList[i + 1].layerHeight * MAX_OVERHANG
    if (depths[i] - depths[i + 1] > maxStep) depths[i] = depths[i + 1] + maxStep
  }

  const lines: string[] = []
  lines.push(`; --- Музыкальный Модуль: ${track.name} ---`)
  lines.push(fillPlaceholders(startGcode, totalLayers))
  lines.push('M83 ; Относительная экструзия (Обязательно для точности)')
  lines.push('G92 E0 ; Обнуляем экструдер')

  let currentZ = BASE_LAYER_HEIGHT
  lines.push(`G1 Z${currentZ} F1200`)

  let totalG1Lines = 0

  const filamentRadius = FILAMENT_DIAM / 2
  const filamentArea = Math.PI * filamentRadius * filamentRadius

  // Экструзия считается по фактической длине отрезка XY, поэтому корректна при
  // любом числе шагов и при разной длине сегментов (углы, дно ямы и т.д.).
  let prev = getShapePoint(0, 0)
  const emit = (pt: { x: number; y: number }, z: number, layerHeight: number) => {
    const dist = Math.hypot(pt.x - prev.x, pt.y - prev.y)
    const eStep = (dist * layerHeight * LINE_WIDTH) / filamentArea * flowMultiplier
    lines.push(
      `G1 X${(CENTER_X + pt.x).toFixed(3)} Y${(CENTER_Y + pt.y).toFixed(3)} Z${z.toFixed(3)} E${eStep.toFixed(4)}`,
    )
    prev = pt
    totalG1Lines++
  }

  for (let layer = 0; layer < BASE_LAYERS; layer++) {
    for (let step = 1; step <= STEPS_PER_LAYER; step++) {
      const pt = getShapePoint(step / STEPS_PER_LAYER, 0)
      currentZ += BASE_LAYER_HEIGHT / STEPS_PER_LAYER
      emit(pt, currentZ, BASE_LAYER_HEIGHT)
    }
  }

  // 3) Печатаем слои
  for (let li = 0; li < layerList.length; li++) {
    const { layerHeight } = layerList[li]
    const depth = depths[li]
    for (let step = 1; step <= STEPS_PER_LAYER; step++) {
      const pt = getShapePoint(step / STEPS_PER_LAYER, depth)
      currentZ += layerHeight / STEPS_PER_LAYER
      emit(pt, currentZ, layerHeight)
    }
  }

  lines.push(fillPlaceholders(endGcode, totalLayers))

  return {
    content: lines.join('\n'),
    totalZ: currentZ,
    layerCount: totalG1Lines / STEPS_PER_LAYER,
  }
}

export default function App() {
  const [startGcode, setStartGcode] = useState(
    '; Стартовый код (Snapmaker U1 / Klipper)\nM104 S220\nM109 S220\nG28\n',
  )
  const [endGcode, setEndGcode] = useState(
    '; Конечный код\nM104 S0\nM140 S0\nG28 X Y\nM84\n',
  )
  const [swipeSpeed, setSwipeSpeed] = useState(40)
  const [flowMultiplier, setFlowMultiplier] = useState(1.0)
  const [sampleGcode, setSampleGcode] = useState('')
  const [generatedTracks, setGeneratedTracks] = useState<GeneratedTrack[]>([])

  const estimatedHeight = (swipeSpeed * 16 * BEAT + 2).toFixed(1)

  // Если вставлен готовый файл — берём из него реальные начало/конец
  const sampleSplit = sampleGcode.trim() ? splitSampleGcode(sampleGcode) : null
  const usingSample = sampleSplit !== null

  const handleGenerate = () => {
    const effStart = sampleSplit ? sampleSplit.start : startGcode
    const effEnd = sampleSplit ? sampleSplit.end : endGcode
    const results = MARIO_TRACKS.map((track) => {
      const { content, totalZ, layerCount } = generateGcode(
        track, effStart, effEnd, swipeSpeed, flowMultiplier,
      )
      return {
        id: track.id,
        name: track.name,
        color: track.color,
        content,
        filename: `mario_${track.id}_${track.name.split(' ')[0].toLowerCase()}.gcode`,
        totalZ,
        layerCount,
      }
    })
    setGeneratedTracks(results)
  }

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-4 md:p-8 font-sans selection:bg-teal-500/30">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 pb-2">
            Super Mario Pipe Generator
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto text-sm md:text-base">
            Генератор 6 модулей для сборки музыкального цилиндра с интегрированной партитурой.
            Улучшенная геометрия с пазами для направляющих и "Акустической ямой" для пауз.
          </p>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
          <div className="space-y-4 md:col-span-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="bg-neutral-800 p-1.5 rounded-md">⚙️</span> Настройки профиля
            </h2>
          </div>

          {/* Образец готового G-code: из него берутся рабочие начало и конец */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-neutral-400 flex justify-between items-center">
              <span>Образец готового G-code (режим вазы) — опционально</span>
              {sampleGcode.trim() && (
                usingSample ? (
                  <span className="text-emerald-400 text-xs font-semibold">
                    ✓ Начало: {sampleSplit!.startLines} строк · Конец: {sampleSplit!.endLines} строк
                  </span>
                ) : (
                  <span className="text-red-400 text-xs font-semibold">
                    ✗ Не удалось распознать слои — будут использованы поля ниже
                  </span>
                )
              )}
            </label>
            <textarea
              value={sampleGcode}
              onChange={(e) => setSampleGcode(e.target.value)}
              placeholder="Вставьте сюда целиком .gcode любой вашей печати в режиме вазы (например, цилиндра) с этого же принтера. Начало (нагрев, хоминг, прайм) и конец (ретракт, парковка) возьмутся автоматически, а слои заменятся музыкой."
              className="w-full h-28 bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs font-mono text-emerald-400/80 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all outline-none resize-none"
            />
            <p className="text-xs text-neutral-500">
              Рекомендуется: так начало/конец гарантированно подходят вашему принтеру (с температурами и хомингом). Если поле пустое — используются ручные поля ниже.
            </p>
          </div>

          <div className={`space-y-2 transition-opacity ${usingSample ? 'opacity-40' : ''}`}>
            <label className="text-sm font-medium text-neutral-400">
              Начальный G-Code {usingSample && <span className="text-neutral-600">(не используется — взято из образца)</span>}
            </label>
            <textarea
              value={startGcode}
              onChange={(e) => setStartGcode(e.target.value)}
              className="w-full h-28 bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs font-mono text-emerald-400/80 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all outline-none resize-none"
            />
          </div>

          <div className={`space-y-2 transition-opacity ${usingSample ? 'opacity-40' : ''}`}>
            <label className="text-sm font-medium text-neutral-400">
              Конечный G-Code {usingSample && <span className="text-neutral-600">(не используется — взято из образца)</span>}
            </label>
            <textarea
              value={endGcode}
              onChange={(e) => setEndGcode(e.target.value)}
              className="w-full h-28 bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs font-mono text-emerald-400/80 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all outline-none resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-400 flex justify-between">
              Скорость ведения рукой <span className="text-white font-bold">{swipeSpeed} мм/с</span>
            </label>
            <input
              type="range" min="20" max="80" step="5" value={swipeSpeed}
              onChange={(e) => setSwipeSpeed(Number(e.target.value))}
              className="w-full accent-teal-500"
            />
            <p className="text-xs text-neutral-500">
              Определяет общую высоту цилиндра (При {swipeSpeed} мм/с высота будет ~{estimatedHeight} мм)
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-400 flex justify-between">
              Множитель потока <span className="text-white font-bold">{flowMultiplier}</span>
            </label>
            <input
              type="range" min="0.8" max="1.5" step="0.05" value={flowMultiplier}
              onChange={(e) => setFlowMultiplier(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <p className="text-xs text-neutral-500">Увеличьте, если замок хрупкий. 1.0 = 100%.</p>
          </div>
        </div>

        {/* Generate button */}
        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-teal-600 rounded-full hover:bg-teal-500 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 shadow-[0_0_40px_rgba(13,148,136,0.4)]"
          >
            Сгенерировать 6 файлов Марио
          </button>
        </div>

        {/* Results */}
        {generatedTracks.length > 0 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-white text-center">Готовые Модули</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedTracks.map((track) => (
                <div
                  key={track.id}
                  className={`bg-neutral-900 border-t-4 ${track.color} rounded-xl p-5 shadow-lg flex flex-col justify-between h-full hover:bg-neutral-800 transition-colors`}
                >
                  <div>
                    <h3 className="font-bold text-lg mb-1">{track.name}</h3>
                    <p className="text-xs text-neutral-400 mb-4 font-mono">
                      Высота: {track.totalZ.toFixed(1)} мм<br />
                      Слоев: {track.layerCount.toFixed(0)}
                    </p>
                  </div>
                  <button
                    onClick={() => downloadFile(track.filename, track.content)}
                    className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-semibold rounded-lg border border-neutral-700 hover:border-neutral-500 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Скачать .gcode
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
