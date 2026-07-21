import { useCallback, useEffect, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// Audio engine: synthesized tones via Web Audio API (no external files).
// One oscillator, gain-gated to produce distinct on/off patterns per state.
// Must be started from a user gesture (browser autoplay policy) — we lazily
// create/resume the AudioContext on the first button press.
// ---------------------------------------------------------------------------
const PATTERNS = {
  // Temporal-3 style evacuation horn
  alarm: { freq: 880, type: 'square', steps: [500, 500, 500, 500, 500, 1500] },
  // Slow intermittent trouble beep
  trouble: { freq: 510, type: 'sine', steps: [200, 900] },
  // Distinct supervisory pattern (double chirp) — audibly different from trouble
  supervisory: { freq: 660, type: 'sine', steps: [140, 140, 140, 1100] },
}

function useToneEngine(volume, muted) {
  const ctxRef = useRef(null)
  const oscRef = useRef(null)
  const gainRef = useRef(null)
  const timerRef = useRef(null)
  const stepRef = useRef(0)

  const ensure = useCallback(() => {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      const ctx = new Ctx()
      const gain = ctx.createGain()
      gain.gain.value = 0
      gain.connect(ctx.destination)
      const osc = ctx.createOscillator()
      osc.type = 'square'
      osc.frequency.value = 800
      osc.connect(gain)
      osc.start()
      ctxRef.current = ctx
      gainRef.current = gain
      oscRef.current = osc
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
  }, [])

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.cancelScheduledValues(ctxRef.current.currentTime)
      gainRef.current.gain.setTargetAtTime(0, ctxRef.current.currentTime, 0.01)
    }
  }, [])

  const play = useCallback(
    (name) => {
      ensure()
      const p = PATTERNS[name]
      if (!p) return stop()
      oscRef.current.type = p.type
      oscRef.current.frequency.setValueAtTime(p.freq, ctxRef.current.currentTime)
      stepRef.current = 0

      const tick = () => {
        const idx = stepRef.current % p.steps.length
        const on = idx % 2 === 0 // even steps are "on"
        const dur = p.steps[idx]
        const g = gainRef.current.gain
        const now = ctxRef.current.currentTime
        g.cancelScheduledValues(now)
        g.setTargetAtTime(on && !muted ? volume : 0, now, 0.008)
        stepRef.current += 1
        timerRef.current = setTimeout(tick, dur)
      }
      tick()
    },
    [ensure, stop, volume, muted]
  )

  useEffect(() => () => stop(), [stop])

  return { play, stop, ensure }
}

const initialState = {
  conditions: [], // {type:'alarm'|'trouble'|'supervisory', label}
  silenced: false, // notification appliances silenced
  acked: false, // internal buzzer acknowledged
  deviceStillActive: false, // for the "reset with device active" scenario
  walkTest: false,
  log: [],
}

export default function Simulator({ config, goTo }) {
  const [st, setSt] = useState(initialState)
  const [volume, setVolume] = useState(0.14)
  const [muted, setMuted] = useState(false)
  const [lampTest, setLampTest] = useState(false)
  const { play, stop, ensure } = useToneEngine(volume, muted)

  const addr = config.panelType === 'addressable'

  const has = (type) => st.conditions.some((c) => c.type === type)
  const hasAlarm = has('alarm')
  const hasTrouble = has('trouble')
  const hasSupervisory = has('supervisory')

  // decide audible pattern
  let audible = 'none'
  if (hasAlarm && !st.silenced) audible = 'alarm'
  else if (hasSupervisory && !st.acked) audible = 'supervisory'
  else if (hasTrouble && !st.acked) audible = 'trouble'

  useEffect(() => {
    if (audible === 'none' || muted) stop()
    else play(audible)
  }, [audible, muted, volume, play, stop])

  const log = (msg) =>
    setSt((s) => ({
      ...s,
      log: [{ t: new Date().toLocaleTimeString(), msg }, ...s.log].slice(0, 40),
    }))

  const primaryState = hasAlarm
    ? 'ALARM'
    : hasSupervisory
    ? 'SUPERVISORY'
    : hasTrouble
    ? 'TROUBLE'
    : 'SYSTEM NORMAL'

  const activeLabel = st.conditions[0]?.label

  // ---- device / condition triggers ----
  const addCondition = (type, label) => {
    ensure()
    setSt((s) => {
      if (s.conditions.some((c) => c.type === type && c.label === label)) return s
      return { ...s, conditions: [{ type, label }, ...s.conditions] }
    })
  }

  const triggerDevice = (type, label, opts = {}) => {
    ensure()
    if (st.walkTest && type === 'alarm') {
      // walk test: brief indication, auto-reset, logged — no latched alarm
      log(`WALK TEST — ${label} — OK`)
      play('alarm')
      setTimeout(() => stop(), 500)
      return
    }
    addCondition(type, label)
    log(`${type.toUpperCase()} — ${label}`)
    if (opts.stickyDevice) setSt((s) => ({ ...s, deviceStillActive: true }))
  }

  // ---- panel buttons ----
  const onAck = () => {
    ensure()
    setSt((s) => ({ ...s, acked: true }))
    log('ACKNOWLEDGE — internal buzzer silenced')
  }

  const onSilence = () => {
    ensure()
    if (!hasAlarm) {
      log('SILENCE pressed — no notification appliances active')
      return
    }
    setSt((s) => ({ ...s, silenced: true }))
    log('SIGNAL SILENCE — notification appliances silenced (alarm still present)')
  }

  const onReset = () => {
    ensure()
    if (st.deviceStillActive && hasAlarm) {
      log('RESET FAILED — initiating device still in alarm. Clear the device first.')
      // re-annunciate: momentarily un-silence
      setSt((s) => ({ ...s, silenced: false, acked: false }))
      return
    }
    setSt({ ...initialState, walkTest: st.walkTest })
    log('SYSTEM RESET — returned to normal')
  }

  const onDrill = () => {
    ensure()
    triggerDevice('alarm', 'MANUAL DRILL / EVAC')
  }

  const onLampTest = () => {
    ensure()
    setLampTest(true)
    log('LAMP TEST — all indicators')
    setTimeout(() => setLampTest(false), 1200)
  }

  const clearStickyDevice = () => {
    setSt((s) => ({ ...s, deviceStillActive: false }))
    log('Initiating device cleared — reset will now succeed')
  }

  const toggleWalk = () => {
    ensure()
    setSt((s) => ({ ...s, walkTest: !s.walkTest }))
    log(st.walkTest ? 'Exited walk-test mode' : 'Entered walk-test mode')
  }

  const led = (on, cls) => `led ${cls} ${on || lampTest ? 'on' : ''}`

  const displayLine1 = lampTest ? '████████████████' : primaryState
  const displayLine2 = lampTest
    ? '████████████████'
    : hasAlarm || hasTrouble || hasSupervisory
    ? (addr ? '' : '') + (activeLabel || '')
    : addr
    ? `${config.zones} LOOP(S) SUPERVISED`
    : `${config.zones} ZONE(S) SUPERVISED`

  return (
    <section className="panel-page">
      <div className="page-head">
        <p className="eyebrow">Step 4</p>
        <h1>Panel simulator</h1>
        <p className="lede">
          Operate a virtual {addr ? 'addressable' : 'conventional'} fire alarm control panel. Trigger
          a condition, then practice the acknowledge → silence → reset sequence. Audio starts on your
          first button press.
        </p>
      </div>

      <div className="sim-layout">
        {/* ---------------- PANEL FACE ---------------- */}
        <div className="facp">
          <div className="facp-top">
            <span className="facp-title">FIRE ALARM CONTROL PANEL</span>
            <span className="facp-model">FT-Series</span>
          </div>

          <div className="facp-body">
            <div className="lcd">
              <div className="lcd-line">{displayLine1}</div>
              <div className="lcd-line small">{displayLine2}</div>
            </div>

            <div className="led-stack">
              <div className="led-row">
                <span className={led(hasAlarm, 'red')} />
                <span className="led-label">ALARM</span>
              </div>
              <div className="led-row">
                <span className={led(hasSupervisory, 'amber2')} />
                <span className="led-label">SUPERVISORY</span>
              </div>
              <div className="led-row">
                <span className={led(hasTrouble, 'amber')} />
                <span className="led-label">TROUBLE</span>
              </div>
              <div className="led-row">
                <span className={led(true, 'green')} />
                <span className="led-label">AC POWER</span>
              </div>
              <div className="led-row">
                <span className={led(st.silenced, 'amber')} />
                <span className="led-label">SILENCED</span>
              </div>
              <div className="led-row">
                <span className={led(st.walkTest, 'blue')} />
                <span className="led-label">TEST</span>
              </div>
            </div>
          </div>

          <div className="facp-keys">
            <button className="mkey" onClick={onAck}>
              Acknowledge
            </button>
            <button className="mkey" onClick={onSilence}>
              Signal Silence
            </button>
            <button className="mkey danger" onClick={onReset}>
              System Reset
            </button>
            <button className="mkey" onClick={onDrill}>
              Drill
            </button>
            <button className="mkey" onClick={onLampTest}>
              Lamp Test
            </button>
            <button className={`mkey ${st.walkTest ? 'active' : ''}`} onClick={toggleWalk}>
              Walk Test
            </button>
          </div>

          <div className="facp-keypad" aria-hidden="true">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
              <span className="kp" key={k}>
                {k}
              </span>
            ))}
          </div>

          <div className="audio-ctl">
            <button className="ghost-btn" onClick={() => setMuted((m) => !m)}>
              {muted ? '🔇 Unmute' : '🔊 Mute'}
            </button>
            <input
              type="range"
              min="0"
              max="0.4"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volume"
            />
          </div>
        </div>

        {/* ---------------- CONTROLS + LOG ---------------- */}
        <div className="sim-side">
          <div className="scenario-box">
            <h3>Trigger a condition</h3>
            <div className="scenario-grid">
              <button
                onClick={() =>
                  triggerDevice('alarm', addr ? 'D:014  PULL STATION' : 'ZONE 1  PULL STATION')
                }
              >
                Pull-station activation
              </button>
              <button
                onClick={() =>
                  triggerDevice('alarm', addr ? 'D:007  SMOKE' : 'ZONE 2  SMOKE')
                }
              >
                Smoke detector alarm
              </button>
              <button onClick={() => triggerDevice('trouble', 'GROUND FAULT')}>
                Ground fault
              </button>
              <button onClick={() => triggerDevice('trouble', 'OPEN CIRCUIT — NAC 1')}>
                Open circuit (trouble)
              </button>
              <button onClick={() => triggerDevice('supervisory', 'VALVE TAMPER — RISER')}>
                Valve tamper (supervisory)
              </button>
              <button
                onClick={() =>
                  triggerDevice(
                    'alarm',
                    addr ? 'D:007  SMOKE (HELD)' : 'ZONE 2  SMOKE (HELD)',
                    { stickyDevice: true }
                  )
                }
              >
                Reset with device still active
              </button>
            </div>

            {st.deviceStillActive && (
              <button className="ghost-btn clear-device" onClick={clearStickyDevice}>
                Clear the held device (then try Reset)
              </button>
            )}
          </div>

          <div className="event-log">
            <div className="event-log-head">
              <h3>Event log</h3>
              <span className="live-dot" title="live">
                ●
              </span>
            </div>
            <ul>
              {st.log.length === 0 && <li className="muted">No events yet.</li>}
              {st.log.map((e, i) => (
                <li key={i}>
                  <span className="log-time">{e.t}</span>
                  <span className="log-msg">{e.msg}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <p className="sim-note">
        Teaching points baked in: <strong>Acknowledge</strong> silences the internal buzzer only,
        <strong> Signal Silence</strong> stops the horns/strobes but leaves the alarm present, and
        <strong> Reset</strong> only succeeds once the initiating device has cleared — try the last
        scenario to see a reset fail. Trouble and supervisory use distinct beep patterns so you can
        tell them apart by ear.
      </p>

      <div className="learn-more">
        <h3>Go deeper</h3>
        <div className="learn-more-grid">
          <button className="learn-link" onClick={() => goTo('learn')}>
            <span className="learn-link-title">Learn how it works →</span>
            <span className="learn-link-sub">
              Plain-language walkthroughs for every device on your panel — how it operates, how to
              test it, expected signals, and common faults.
            </span>
          </button>
          <button className="learn-link" onClick={() => goTo('test')}>
            <span className="learn-link-title">Guided test checklist →</span>
            <span className="learn-link-sub">
              A tickable, step-by-step field checklist assembled from your configured devices, with
              the expected result on every step.
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
