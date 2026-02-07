// ===== 音效管理模块 - 基于 Web Audio API =====
// 为大富翁游戏的各种节点和事件生成独特的音效

let audioCtx = null
let bgmGain = null
let sfxGain = null
let bgmPlaying = false
let bgmNodes = []

// 延迟初始化 AudioContext（需要用户交互后才能使用）
function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    bgmGain = audioCtx.createGain()
    bgmGain.gain.value = 0.18  // 背景音乐音量偏低
    bgmGain.connect(audioCtx.destination)
    sfxGain = audioCtx.createGain()
    sfxGain.gain.value = 0.35  // 音效音量
    sfxGain.connect(audioCtx.destination)
  }
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

// ===== 工具函数 =====
function playTone(freq, duration, type = 'sine', gainVal = 0.3, delay = 0) {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0, ctx.currentTime + delay)
  gain.gain.linearRampToValueAtTime(gainVal, ctx.currentTime + delay + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration)
  osc.connect(gain)
  gain.connect(sfxGain)
  osc.start(ctx.currentTime + delay)
  osc.stop(ctx.currentTime + delay + duration)
}

function playNoise(duration, gainVal = 0.1, delay = 0) {
  const ctx = getCtx()
  const bufferSize = ctx.sampleRate * duration
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5
  const source = ctx.createBufferSource()
  source.buffer = buffer
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(gainVal, ctx.currentTime + delay)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration)
  // 带通滤波器使噪音更好听
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 3000
  filter.Q.value = 0.5
  source.connect(filter)
  filter.connect(gain)
  gain.connect(sfxGain)
  source.start(ctx.currentTime + delay)
  source.stop(ctx.currentTime + delay + duration)
}

// =============================================
// 各种游戏音效
// =============================================

// 🎲 骰子摇动音效 - 快速咔嗒声
export function playDiceRoll() {
  for (let i = 0; i < 12; i++) {
    const freq = 800 + Math.random() * 1200
    playTone(freq, 0.04, 'square', 0.08, i * 0.06)
    playNoise(0.03, 0.06, i * 0.06)
  }
}

// 🎲 骰子结果音效 - 最终结果揭示
export function playDiceResult() {
  playTone(523, 0.15, 'triangle', 0.25)
  playTone(659, 0.15, 'triangle', 0.25, 0.1)
  playTone(784, 0.3, 'triangle', 0.3, 0.2)
}

// 👟 角色移动一步 - 轻快的踏步声
export function playStep() {
  const freq = 300 + Math.random() * 100
  playTone(freq, 0.08, 'square', 0.1)
  playNoise(0.05, 0.04)
}

// 💰 获得金币 - 清脆的叮当声
export function playCoinGain() {
  const notes = [1047, 1319, 1568, 2093]
  notes.forEach((f, i) => {
    playTone(f, 0.2, 'sine', 0.2, i * 0.08)
    playTone(f * 1.5, 0.15, 'sine', 0.06, i * 0.08)  // 泛音
  })
}

// 💸 失去金币 - 低沉下降音
export function playCoinLoss() {
  const notes = [523, 440, 349, 262]
  notes.forEach((f, i) => {
    playTone(f, 0.2, 'sawtooth', 0.1, i * 0.12)
  })
}

// ⭐ 获得星星 - 华丽的上升音阶 + 闪烁
export function playStarCollect() {
  // 五声音阶上升
  const notes = [523, 659, 784, 1047, 1319, 1568, 2093]
  notes.forEach((f, i) => {
    playTone(f, 0.3, 'sine', 0.2, i * 0.07)
    playTone(f * 2, 0.2, 'sine', 0.08, i * 0.07 + 0.03)  // 八度泛音
  })
  // 闪烁结尾
  for (let i = 0; i < 6; i++) {
    playTone(2093 + Math.random() * 500, 0.1, 'sine', 0.1, 0.5 + i * 0.05)
  }
}

// ❗ 随机事件触发 - 神秘的揭示音
export function playEventTrigger() {
  playTone(330, 0.3, 'triangle', 0.2)
  playTone(415, 0.3, 'triangle', 0.2, 0.15)
  playTone(523, 0.4, 'triangle', 0.25, 0.3)
  playTone(659, 0.5, 'sine', 0.15, 0.45)
}

// ✨ 奖励事件结果 - 欢快上升的铃声 + 撒花感
export function playRewardEvent() {
  // 欢快的上升三和弦
  const notes = [523, 659, 784, 1047]
  notes.forEach((f, i) => {
    playTone(f, 0.25, 'triangle', 0.2, i * 0.1)
    playTone(f * 1.5, 0.2, 'sine', 0.07, i * 0.1 + 0.03)  // 五度泛音
  })
  // 欢快的装饰音闪烁（像撒花/彩带）
  for (let i = 0; i < 8; i++) {
    const sparkle = 1200 + Math.random() * 1200
    playTone(sparkle, 0.1, 'sine', 0.08, 0.45 + i * 0.06)
  }
  // 结尾明亮和弦
  playTone(1047, 0.4, 'triangle', 0.12, 0.9)
  playTone(1319, 0.4, 'sine', 0.08, 0.9)
  playTone(1568, 0.4, 'sine', 0.06, 0.9)
}

// 😤 惩罚事件结果 - 低沉下降 + 失落感
export function playPunishmentEvent() {
  const ctx = getCtx()
  // 不祥的低音下行
  const notes = [440, 370, 330, 262, 220]
  notes.forEach((f, i) => {
    playTone(f, 0.3, 'sawtooth', 0.1, i * 0.14)
    playTone(f * 0.5, 0.25, 'sine', 0.06, i * 0.14)  // 低八度加重
  })
  // 滑稽的 "哇哇" 音效（像失败的号角）
  const wah = ctx.createOscillator()
  const wahGain = ctx.createGain()
  const wahFilter = ctx.createBiquadFilter()
  wah.type = 'sawtooth'
  wah.frequency.setValueAtTime(250, ctx.currentTime + 0.7)
  wah.frequency.linearRampToValueAtTime(180, ctx.currentTime + 1.0)
  wah.frequency.linearRampToValueAtTime(220, ctx.currentTime + 1.15)
  wah.frequency.linearRampToValueAtTime(140, ctx.currentTime + 1.5)
  wahFilter.type = 'lowpass'
  wahFilter.frequency.setValueAtTime(800, ctx.currentTime + 0.7)
  wahFilter.frequency.linearRampToValueAtTime(300, ctx.currentTime + 1.5)
  wahFilter.Q.value = 3
  wahGain.gain.setValueAtTime(0, ctx.currentTime + 0.7)
  wahGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.75)
  wahGain.gain.setValueAtTime(0.12, ctx.currentTime + 1.2)
  wahGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.6)
  wah.connect(wahFilter)
  wahFilter.connect(wahGain)
  wahGain.connect(sfxGain)
  wah.start(ctx.currentTime + 0.7)
  wah.stop(ctx.currentTime + 1.7)
}

// ⚡ 系统事件触发 - 电子 whoosh 音效
export function playSystemEvent() {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(200, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.2)
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.5)
  gain.gain.setValueAtTime(0.15, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
  osc.connect(gain)
  gain.connect(sfxGain)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.6)
  // 点缀音
  playTone(880, 0.1, 'sine', 0.15, 0.1)
  playTone(1760, 0.15, 'sine', 0.1, 0.2)
}

// 👥 NPC 遭遇 - 对话/问候音
export function playNpcEncounter() {
  // 两段式问候音（像对话框弹出）
  const melody = [392, 523, 440, 587]
  melody.forEach((f, i) => {
    playTone(f, 0.15, 'triangle', 0.18, i * 0.12)
  })
  // 小铃铛点缀
  playTone(1568, 0.1, 'sine', 0.06, 0.1)
  playTone(2093, 0.1, 'sine', 0.04, 0.25)
}

// 🎮 小游戏开始 - 欢快的开场 jingle
export function playMiniGameStart() {
  // 经典游戏开始音效
  const notes = [523, 659, 784, 1047, 784, 1047, 1319]
  notes.forEach((f, i) => {
    playTone(f, 0.18, 'square', 0.12, i * 0.1)
    playTone(f / 2, 0.15, 'triangle', 0.06, i * 0.1)  // 低音衬托
  })
}

// 🎮✨ 小游戏揭晓 - 欢快的 "当当当当~" 揭示音
export function playMiniGameReveal() {
  // 经典的 "Ta-Da!" 揭示感（快速上行 + 大和弦展开）
  const fanfare = [392, 494, 587, 659, 784]
  fanfare.forEach((f, i) => {
    playTone(f, 0.12, 'square', 0.15, i * 0.07)
    playTone(f * 1.5, 0.1, 'triangle', 0.06, i * 0.07)
  })
  // 高潮大和弦 "当~当~!"
  const t = 0.4
  playTone(784, 0.5, 'triangle', 0.18, t)
  playTone(988, 0.5, 'triangle', 0.14, t)
  playTone(1175, 0.5, 'sine', 0.1, t)
  playTone(1568, 0.4, 'sine', 0.06, t)
  // 第二下重音
  playTone(1047, 0.6, 'triangle', 0.2, t + 0.25)
  playTone(1319, 0.6, 'triangle', 0.15, t + 0.25)
  playTone(1568, 0.6, 'sine', 0.1, t + 0.25)
  playTone(2093, 0.5, 'sine', 0.06, t + 0.25)
  // 闪烁彩花
  for (let i = 0; i < 10; i++) {
    playTone(1500 + Math.random() * 1500, 0.08, 'sine', 0.05, t + 0.5 + i * 0.04)
  }
}

// 🏆 小游戏胜利 - 胜利号角
export function playVictory() {
  // 号角式上升
  const notes = [523, 523, 659, 784, 659, 784, 1047]
  const durations = [0.12, 0.12, 0.12, 0.25, 0.12, 0.12, 0.5]
  let t = 0
  notes.forEach((f, i) => {
    playTone(f, durations[i] + 0.1, 'triangle', 0.2, t)
    playTone(f * 1.5, durations[i], 'sine', 0.08, t)
    t += durations[i]
  })
}

// 🎉 游戏结束 - 盛大的结局音乐
export function playGameOver() {
  // 宏大的和弦
  const chords = [
    [523, 659, 784],     // C major
    [587, 740, 880],     // D major
    [392, 494, 587],     // G major
    [523, 659, 784, 1047], // C major (加八度)
  ]
  let t = 0
  chords.forEach((chord, ci) => {
    chord.forEach(f => {
      playTone(f, 0.6, 'triangle', 0.12, t)
      playTone(f, 0.6, 'sine', 0.06, t)
    })
    t += ci === chords.length - 1 ? 0.8 : 0.4
  })
  // 结尾闪烁
  for (let i = 0; i < 8; i++) {
    playTone(1047 + Math.random() * 1000, 0.15, 'sine', 0.06, t + i * 0.06)
  }
}

// 🚀 前进特效 - 加速上升音
export function playForwardBoost() {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(300, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.5)
  gain.gain.setValueAtTime(0.12, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
  osc.connect(gain)
  gain.connect(sfxGain)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.6)
}

// 🐢 后退特效 - 减速下降音
export function playBackwardSlow() {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(1500, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.6)
  gain.gain.setValueAtTime(0.12, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7)
  osc.connect(gain)
  gain.connect(sfxGain)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.7)
}

// 🔄 交换位置 - 嗖嗖声
export function playSwap() {
  const ctx = getCtx()
  // 上升
  const osc1 = ctx.createOscillator()
  const gain1 = ctx.createGain()
  osc1.type = 'sine'
  osc1.frequency.setValueAtTime(300, ctx.currentTime)
  osc1.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.2)
  gain1.gain.setValueAtTime(0.15, ctx.currentTime)
  gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
  osc1.connect(gain1); gain1.connect(sfxGain)
  osc1.start(ctx.currentTime); osc1.stop(ctx.currentTime + 0.3)
  // 下降
  const osc2 = ctx.createOscillator()
  const gain2 = ctx.createGain()
  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(1500, ctx.currentTime + 0.2)
  osc2.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.4)
  gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.2)
  gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
  osc2.connect(gain2); gain2.connect(sfxGain)
  osc2.start(ctx.currentTime + 0.2); osc2.stop(ctx.currentTime + 0.5)
}

// 🌠 传送音效 - 魔法传送门
export function playTeleport() {
  const ctx = getCtx()
  for (let i = 0; i < 8; i++) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    const f = 400 + i * 200
    osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.05)
    osc.frequency.exponentialRampToValueAtTime(f * 2, ctx.currentTime + i * 0.05 + 0.1)
    gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.15)
    osc.connect(gain); gain.connect(sfxGain)
    osc.start(ctx.currentTime + i * 0.05)
    osc.stop(ctx.currentTime + i * 0.05 + 0.15)
  }
}

// 🎰 滚动器/转盘 音效 - 快速翻转然后减速
export function playRollerSpin() {
  for (let i = 0; i < 20; i++) {
    const delay = i * (0.04 + i * 0.008) // 逐渐减速
    const freq = 600 + (i % 3) * 200
    playTone(freq, 0.05, 'square', 0.06, delay)
  }
}

// 🎰 滚动器停止 - 最终选定
export function playRollerStop() {
  playTone(784, 0.15, 'triangle', 0.2)
  playTone(1047, 0.15, 'triangle', 0.25, 0.1)
  playTone(1568, 0.4, 'sine', 0.2, 0.2)
}

// 按钮点击音
export function playClick() {
  playTone(800, 0.06, 'square', 0.08)
}

// =============================================
// 🎵 背景音乐 - 新春喜庆欢快风格（锣鼓喧天版）
// =============================================
export function startBGM() {
  if (bgmPlaying) return
  bgmPlaying = true

  const ctx = getCtx()
  const BPM = 152  // 快节奏，喜庆感
  const beat = 60 / BPM  // 一拍时长（秒）
  const sixteenth = beat / 4  // 十六分音符

  // ===== 五声音阶频率表（D调 - 更喜庆明亮）=====
  // D E F# A B
  const P = [
    147, 165, 185, 220, 247,       // 0-4:  低音 D E F# A B
    294, 330, 370, 440, 494,       // 5-9:  中音 D E F# A B
    587, 659, 740, 880, 988,       // 10-14: 高音 D E F# A B
    1175, 1319, 1480,              // 15-17: 超高音 D E F#
  ]

  // ===== 旋律乐句 - 类似《春节序曲》《恭喜发财》风格 =====
  // 每个乐句 = 16 个十六分音符 = 1 小节 (4拍)
  // -1 = 休止符, 数字 = P数组索引
  const melodyPhrases = [
    // A段 - 开场欢快 (模拟唢呐/笛子)
    [10, 12, 14, 12, 10, 9, 10, 12,  10, 9, 7, 5, 7, 9, 10, 9],
    [10, 12, 14, 12, 14, 15, 14, 12,  10, 9, 10, 12, 10, -1, 10, -1],
    [7, 9, 10, 12, 10, 9, 7, 5,  7, 9, 7, 5, 4, 5, 7, 5],
    [7, 9, 10, 12, 14, 12, 10, 9,  10, 12, 10, -1, 10, -1, -1, -1],

    // B段 - 高潮激昂
    [14, 15, 14, 12, 14, -1, 12, 10,  12, 14, 12, 10, 9, 10, 12, 10],
    [14, 15, 17, 15, 14, 12, 14, 15,  14, 12, 10, 9, 10, -1, 10, -1],
    [5, 7, 9, 10, 12, 10, 9, 7,  9, 10, 9, 7, 5, 7, 9, 7],
    [10, 12, 14, 15, 14, 12, 10, 12,  14, 12, 10, -1, 10, -1, -1, -1],

    // C段 - 变奏活泼（快速装饰音多）
    [10, 10, 12, 12, 14, 14, 12, 10,  9, 9, 10, 10, 12, 12, 10, 9],
    [10, 12, 10, 12, 14, 12, 14, 15,  14, 12, 10, 9, 7, 9, 10, -1],
    [5, 5, 7, 7, 9, 9, 10, 10,  12, 10, 9, 7, 5, 7, 5, -1],
    [10, 14, 12, 10, 14, 12, 10, 9,  10, 12, 14, 15, 14, -1, 14, -1],
  ]

  // ===== 锣鼓节奏（春节锣鼓经典 "咚 呛 咚咚 呛"）=====
  // D=大鼓(低) d=小鼓(中) C=钹/锣(高) .=休止
  const drumPatterns = [
    // 基本锣鼓: 咚 呛 咚咚 呛
    'D.C.D.C.DdC.D.C.',
    'D.C.DdC.D.C.DdCd',
    // 紧凑锣鼓: 急急风
    'DCDC.DdCDCDC.DdC',
    'D.DdCdD.DdCdDDCC',
    // 花鼓
    'D..CD.CdDdDCD.C.',
    'DdCdDdCdD.C.DdCC',
  ]

  // ===== 低音伴奏（每拍根音）=====
  const bassLines = [
    [5, -1, 5, -1, 7, -1, 5, -1,  5, -1, 7, -1, 5, -1, 4, -1],
    [5, -1, 7, -1, 9, -1, 7, -1,  5, -1, 4, -1, 5, -1, 5, -1],
    [0, -1, 0, -1, 2, -1, 4, -1,  0, -1, 2, -1, 0, -1, 0, -1],
    [5, -1, 5, -1, 4, -1, 2, -1,  0, -1, 2, -1, 5, -1, 5, -1],
  ]

  // ===== 和弦填充（每半拍一个柔和和弦音）=====
  const chordPads = [
    [5, 7, 10, 5, 7, 10, 5, 7],
    [7, 9, 12, 7, 9, 12, 7, 9],
    [5, 9, 12, 5, 9, 12, 5, 9],
    [4, 7, 10, 4, 7, 10, 4, 7],
  ]

  let step = 0  // 全局十六分音符计数器
  let melodyPhraseIdx = 0
  let drumPatternIdx = 0
  let bassIdx = 0
  let chordIdx = 0

  // --- 播放一个合成音 ---
  function note(freq, dur, type, vol, startTime) {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = type
    o.frequency.value = freq
    g.gain.setValueAtTime(0, startTime)
    g.gain.linearRampToValueAtTime(vol, startTime + 0.01)
    g.gain.setValueAtTime(vol * 0.8, startTime + dur * 0.3)
    g.gain.exponentialRampToValueAtTime(0.001, startTime + dur)
    o.connect(g)
    g.connect(bgmGain)
    o.start(startTime)
    o.stop(startTime + dur + 0.02)
    bgmNodes.push(o)
  }

  // --- 播放噪声打击乐 ---
  function drum(type, startTime) {
    const dur = type === 'D' ? 0.12 : type === 'd' ? 0.08 : 0.06
    const bufLen = Math.max(1, Math.floor(ctx.sampleRate * dur))
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < bufLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufLen * 0.3))
    }
    const src = ctx.createBufferSource()
    src.buffer = buf
    const g = ctx.createGain()
    const flt = ctx.createBiquadFilter()

    if (type === 'D') {
      // 大鼓 - 低频
      flt.type = 'lowpass'
      flt.frequency.value = 200
      flt.Q.value = 1.5
      g.gain.setValueAtTime(0.25, startTime)
      // 加一个低频正弦波模拟鼓皮共振
      const kick = ctx.createOscillator()
      const kGain = ctx.createGain()
      kick.type = 'sine'
      kick.frequency.setValueAtTime(120, startTime)
      kick.frequency.exponentialRampToValueAtTime(40, startTime + 0.1)
      kGain.gain.setValueAtTime(0.2, startTime)
      kGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12)
      kick.connect(kGain)
      kGain.connect(bgmGain)
      kick.start(startTime)
      kick.stop(startTime + 0.15)
      bgmNodes.push(kick)
    } else if (type === 'd') {
      // 小鼓 - 中频
      flt.type = 'bandpass'
      flt.frequency.value = 800
      flt.Q.value = 1
      g.gain.setValueAtTime(0.12, startTime)
    } else {
      // 钹/锣 - 高频 + 金属感
      flt.type = 'highpass'
      flt.frequency.value = 3000
      flt.Q.value = 0.5
      g.gain.setValueAtTime(0.1, startTime)
      // 加一个高频正弦模拟金属锣声
      const cym = ctx.createOscillator()
      const cGain = ctx.createGain()
      cym.type = 'square'
      cym.frequency.value = 4000 + Math.random() * 1000
      cGain.gain.setValueAtTime(0.04, startTime)
      cGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08)
      cym.connect(cGain)
      cGain.connect(bgmGain)
      cym.start(startTime)
      cym.stop(startTime + 0.1)
      bgmNodes.push(cym)
    }

    g.gain.exponentialRampToValueAtTime(0.001, startTime + dur)
    src.connect(flt)
    flt.connect(g)
    g.connect(bgmGain)
    src.start(startTime)
    src.stop(startTime + dur + 0.02)
    bgmNodes.push(src)
  }

  // ===== 预排 4 小节（64个十六分音符）后循环 =====
  function scheduleBar() {
    if (!bgmPlaying) return

    const now = ctx.currentTime + 0.05  // 小偏移防止抖动

    for (let i = 0; i < 16; i++) {
      const t = now + i * sixteenth
      const localStep = (step + i) % 16

      // 1) 主旋律 - 明亮的笛子/唢呐音色
      const melody = melodyPhrases[melodyPhraseIdx]
      const mNote = melody[localStep]
      if (mNote >= 0) {
        const freq = P[mNote]
        // 主音 - triangle 模拟笛子
        note(freq, sixteenth * 1.8, 'triangle', 0.1, t)
        // 亮度泛音 - 高八度微弱
        note(freq * 2, sixteenth * 1.2, 'sine', 0.025, t)
        // 微弱五度泛音增加丰富度
        note(freq * 1.5, sixteenth * 0.8, 'sine', 0.012, t)
      }

      // 2) 锣鼓节奏
      const dPat = drumPatterns[drumPatternIdx]
      const dChar = dPat[localStep % dPat.length]
      if (dChar !== '.') {
        drum(dChar, t)
      }

      // 3) 低音伴奏
      const bass = bassLines[bassIdx]
      const bNote = bass[localStep]
      if (bNote >= 0) {
        note(P[bNote] * 0.5, beat * 0.8, 'sine', 0.07, t)
      }

      // 4) 和弦填充（每半拍 = 每2个十六分音符）
      if (localStep % 2 === 0) {
        const cPad = chordPads[chordIdx]
        const cNote = cPad[(localStep / 2) % cPad.length]
        if (cNote >= 0) {
          note(P[cNote], beat * 0.5, 'sine', 0.025, t)
        }
      }
    }

    // 一小节结束，切换到下一个乐句
    step = (step + 16) % 16
    melodyPhraseIdx = (melodyPhraseIdx + 1) % melodyPhrases.length
    // 每 2 小节换一次鼓点和低音
    if (melodyPhraseIdx % 2 === 0) {
      drumPatternIdx = (drumPatternIdx + 1) % drumPatterns.length
      bassIdx = (bassIdx + 1) % bassLines.length
      chordIdx = (chordIdx + 1) % chordPads.length
    }
  }

  // 每小节（16个十六分音符）调度一次
  const barMs = sixteenth * 16 * 1000
  scheduleBar()  // 立即播放第一小节
  const intervalId = setInterval(scheduleBar, barMs)
  bgmNodes._intervalId = intervalId
}

export function stopBGM() {
  bgmPlaying = false
  if (bgmNodes._intervalId) clearInterval(bgmNodes._intervalId)
  bgmNodes.forEach(node => {
    try { node.stop() } catch (e) { /* ignore */ }
  })
  bgmNodes = []
}

// 音量控制
export function setBGMVolume(vol) {
  if (bgmGain) bgmGain.gain.value = Math.max(0, Math.min(1, vol))
}

export function setSFXVolume(vol) {
  if (sfxGain) sfxGain.gain.value = Math.max(0, Math.min(1, vol))
}

// 初始化（确保在用户交互时调用）
export function initAudio() {
  getCtx()
}
