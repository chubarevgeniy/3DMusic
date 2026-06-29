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

function getShapePoint(t: number, isSilence: boolean): { x: number; y: number } {
  if (t < 1 / 3) {
    const u = t * 3
    let x = -30 * u
    let y = 51.96 * u
    let lock = 0
    if (u > 0.35 && u < 0.65) {
      if (u < 0.4) lock = -(u - 0.35) / 0.05
      else if (u <= 0.6) lock = -1
      else lock = -(0.65 - u) / 0.05
    }
    x += -0.866 * lock * 4
    y += -0.5 * lock * 4
    return { x, y }
  } else if (t < 2 / 3) {
    const u = (t - 1 / 3) * 3
    let x = -30 + 60 * u
    let y = 51.96

    if (u <= 0.05) {
      if (u < 0.01) { x = -30; y = 51.96 - 300 * u }
      else if (u < 0.04) { x = -30 + 100 * (u - 0.01); y = 48.96 }
      else { x = -27; y = 48.96 + 300 * (u - 0.04) }
    } else if (u >= 0.95) {
      if (u < 0.96) { x = 27; y = 51.96 - 300 * (u - 0.95) }
      else if (u < 0.99) { x = 27 + 100 * (u - 0.96); y = 48.96 }
      else { x = 30; y = 48.96 + 300 * (u - 0.99) }
    } else if (isSilence) {
      if (u < 0.08) y = 51.96 - 1.5 * (u - 0.05) / 0.03
      else if (u > 0.92) y = 51.96 - 1.5 * (0.95 - u) / 0.03
      else y = 50.46
    }

    return { x, y }
  } else {
    const u = (t - 2 / 3) * 3
    let x = 30 - 30 * u
    let y = 51.96 - 51.96 * u
    let lock = 0
    if (u > 0.35 && u < 0.65) {
      if (u < 0.4) lock = (u - 0.35) / 0.05
      else if (u <= 0.6) lock = 1
      else lock = (0.65 - u) / 0.05
    }
    x += 0.866 * lock * 4
    y += -0.5 * lock * 4
    return { x, y }
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
  const STEPS_PER_LAYER = 150
  const BASE_LAYERS = 10
  const BASE_LAYER_HEIGHT = 0.2

  const lines: string[] = []
  lines.push(`; --- Музыкальный Модуль: ${track.name} ---`)
  lines.push(startGcode)
  lines.push('M83 ; Относительная экструзия (Обязательно для точности)')
  lines.push('G92 E0 ; Обнуляем экструдер')

  let currentZ = BASE_LAYER_HEIGHT
  lines.push(`G1 Z${currentZ} F1200`)

  let totalG1Lines = 0

  const filamentRadius = FILAMENT_DIAM / 2
  const filamentArea = Math.PI * filamentRadius * filamentRadius

  for (let layer = 0; layer < BASE_LAYERS; layer++) {
    for (let step = 1; step <= STEPS_PER_LAYER; step++) {
      const pt = getShapePoint(step / STEPS_PER_LAYER, false)
      currentZ += BASE_LAYER_HEIGHT / STEPS_PER_LAYER
      const dist = 1.5
      const eStep = (dist * BASE_LAYER_HEIGHT * LINE_WIDTH) / filamentArea * flowMultiplier
      lines.push(
        `G1 X${(CENTER_X + pt.x).toFixed(3)} Y${(CENTER_Y + pt.y).toFixed(3)} Z${currentZ.toFixed(3)} E${eStep.toFixed(4)}`,
      )
      totalG1Lines++
    }
  }

  for (const note of track.notes) {
    const isSilence = note.f === 0
    let layerHeight = isSilence ? 0.25 : swipeSpeed / note.f
    if (layerHeight < 0.1) layerHeight = 0.1
    if (layerHeight > 0.35) layerHeight = 0.35

    const physicalHeight = swipeSpeed * (note.d * BEAT)
    const layersCount = Math.max(1, Math.round(physicalHeight / layerHeight))

    for (let layer = 0; layer < layersCount; layer++) {
      for (let step = 1; step <= STEPS_PER_LAYER; step++) {
        const pt = getShapePoint(step / STEPS_PER_LAYER, isSilence)
        currentZ += layerHeight / STEPS_PER_LAYER
        const dist = 1.5
        const eStep = (dist * layerHeight * LINE_WIDTH) / filamentArea * flowMultiplier
        lines.push(
          `G1 X${(CENTER_X + pt.x).toFixed(3)} Y${(CENTER_Y + pt.y).toFixed(3)} Z${currentZ.toFixed(3)} E${eStep.toFixed(4)}`,
        )
        totalG1Lines++
      }
    }
  }

  lines.push(endGcode)

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
  const [generatedTracks, setGeneratedTracks] = useState<GeneratedTrack[]>([])

  const estimatedHeight = (swipeSpeed * 16 * BEAT + 2).toFixed(1)

  const handleGenerate = () => {
    const results = MARIO_TRACKS.map((track) => {
      const { content, totalZ, layerCount } = generateGcode(
        track, startGcode, endGcode, swipeSpeed, flowMultiplier,
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-400">Начальный G-Code</label>
            <textarea
              value={startGcode}
              onChange={(e) => setStartGcode(e.target.value)}
              className="w-full h-28 bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs font-mono text-emerald-400/80 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all outline-none resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-400">Конечный G-Code</label>
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
