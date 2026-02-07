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
// 🎵 背景音乐 - 新春喜庆风格（五声音阶）
// =============================================
export function startBGM() {
  if (bgmPlaying) return
  bgmPlaying = true

  const ctx = getCtx()

  // 五声音阶（宫商角徵羽）— 新春喜庆感
  // C D E G A 对应频率
  const pentatonic = [
    262, 294, 330, 392, 440,   // 低音
    523, 587, 659, 784, 880,   // 中音
    1047, 1175, 1319, 1568, 1760  // 高音
  ]

  // 旋律模式 - 轻快的新春风格
  const melodyPatterns = [
    // 模式1 - 欢快上行
    [5, 6, 7, 9, 7, 6, 5, 4],
    // 模式2 - 婉转下行
    [9, 7, 6, 5, 4, 5, 6, 5],
    // 模式3 - 跳跃活泼
    [5, 7, 5, 9, 7, 5, 6, 4],
    // 模式4 - 华丽展开
    [4, 5, 7, 9, 10, 9, 7, 5],
  ]

  // 低音伴奏模式
  const bassPatterns = [
    [0, -1, 2, -1, 0, -1, 4, -1],
    [0, -1, 3, -1, 2, -1, 0, -1],
  ]

  let patternIdx = 0
  let noteIdx = 0
  let bassPatternIdx = 0
  let bassNoteIdx = 0

  function playNextNote() {
    if (!bgmPlaying) return

    const pattern = melodyPatterns[patternIdx]
    const noteI = pattern[noteIdx]
    const freq = pentatonic[noteI]

    // 主旋律
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    osc.connect(gain)
    gain.connect(bgmGain)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.4)
    bgmNodes.push(osc)

    // 柔和的泛音
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.value = freq * 2
    gain2.gain.setValueAtTime(0, ctx.currentTime)
    gain2.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.02)
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
    osc2.connect(gain2)
    gain2.connect(bgmGain)
    osc2.start(ctx.currentTime)
    osc2.stop(ctx.currentTime + 0.3)
    bgmNodes.push(osc2)

    // 低音伴奏（每两拍一次）
    if (noteIdx % 2 === 0) {
      const bPattern = bassPatterns[bassPatternIdx]
      const bNoteI = bPattern[bassNoteIdx]
      if (bNoteI >= 0) {
        const bFreq = pentatonic[bNoteI]
        const bOsc = ctx.createOscillator()
        const bGain = ctx.createGain()
        bOsc.type = 'sine'
        bOsc.frequency.value = bFreq
        bGain.gain.setValueAtTime(0, ctx.currentTime)
        bGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.03)
        bGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
        bOsc.connect(bGain)
        bGain.connect(bgmGain)
        bOsc.start(ctx.currentTime)
        bOsc.stop(ctx.currentTime + 0.55)
        bgmNodes.push(bOsc)
      }
      bassNoteIdx = (bassNoteIdx + 1) % bPattern.length
      if (bassNoteIdx === 0) bassPatternIdx = (bassPatternIdx + 1) % bassPatterns.length
    }

    noteIdx++
    if (noteIdx >= pattern.length) {
      noteIdx = 0
      patternIdx = (patternIdx + 1) % melodyPatterns.length
    }
  }

  // 节奏：BPM ~120, 每拍约 280ms
  const intervalId = setInterval(playNextNote, 280)
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
