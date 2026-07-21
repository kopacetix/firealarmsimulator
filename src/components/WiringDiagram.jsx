import { useState } from 'react'
import { DEVICE_BY_ID } from '../content.js'

// Short labels for diagram nodes
const SHORT = {
  smoke_photo: 'Smoke',
  heat: 'Heat',
  pull: 'Pull',
  duct: 'Duct',
  waterflow: 'Flow',
  tamper: 'Tamper',
  nac: 'Horn/Strobe',
}

export default function WiringDiagram({ config }) {
  const [fault, setFault] = useState('none') // none | open | short | ground
  const [faultAt, setFaultAt] = useState(1) // segment index the fault sits after
  const [faultCircuit, setFaultCircuit] = useState('init') // 'init' | 'nac'
  const [selected, setSelected] = useState(null)

  const cls = config.wiringClass
  const addr = config.panelType === 'addressable'

  // Split devices onto their real circuits:
  //  - initiating + supervisory devices ride the SLC (addressable) / IDC (conventional)
  //  - notification appliances ride a separate NAC
  const toNode = (id) => ({ id, name: SHORT[id] || id })
  const initDevices = config.devices
    .filter((id) => {
      const c = DEVICE_BY_ID[id]?.category
      return c === 'initiating' || c === 'supervisory'
    })
    .map(toNode)
  const nacDevices = config.devices
    .filter((id) => DEVICE_BY_ID[id]?.category === 'notification')
    .map(toNode)

  const circuits = []
  if (initDevices.length)
    circuits.push({
      key: 'init',
      label: addr ? 'Signaling Line Circuit (SLC)' : 'Initiating Device Circuit (IDC)',
      devices: initDevices,
    })
  if (nacDevices.length)
    circuits.push({
      key: 'nac',
      label: 'Notification Appliance Circuit (NAC)',
      devices: nacDevices,
    })

  // If the currently selected fault circuit has no devices, fall back
  const activeCircuits = circuits.map((c) => c.key)
  const effectiveFaultCircuit = activeCircuits.includes(faultCircuit)
    ? faultCircuit
    : activeCircuits[0]

  // fault -> which device indices go dead on a given circuit
  const affected = (i, circuitKey) => {
    if (fault === 'none' || circuitKey !== effectiveFaultCircuit) return false
    if (fault === 'ground') return false
    if (fault === 'open') {
      if (cls === 'A' || cls === 'X') return false
      return i >= faultAt
    }
    if (fault === 'short') {
      if (cls === 'X') return false
      return i >= faultAt
    }
    return false
  }

  const troubleReported = fault !== 'none'

  // ---- layout ----
  const W = 720
  const isLoop = cls === 'A' || cls === 'X'
  const rowGap = isLoop ? 150 : 118
  const firstRowY = isLoop ? 70 : 70
  const rowY = (i) => firstRowY + i * rowGap
  const H = rowY(circuits.length - 1) + (isLoop ? 95 : 55)

  const panelRight = 120
  const startX = 200
  const nodeXs = (devs) => {
    const n = devs.length
    const gap = n > 1 ? Math.min(150, (W - startX - 70) / n) : 130
    return devs.map((_, i) => startX + i * gap)
  }

  const panelTop = rowY(0) - 36
  const panelBot = rowY(circuits.length - 1) + 36

  const faultMsg = {
    none: 'No fault. All circuits supervised and operating.',
    open:
      cls === 'A'
        ? 'Class A: a single open is reported as trouble, but every device keeps operating — the panel feeds the circuit from both directions.'
        : cls === 'X'
        ? 'Class X: the open is isolated and reported as trouble; devices keep operating.'
        : 'Class B: the panel reports trouble, and every device past the break on that circuit stops working.',
    short:
      cls === 'X'
        ? 'Class X: short-circuit isolators contain the fault so the rest of the loop keeps operating.'
        : 'A short is reported as trouble and impairs the affected segment of that circuit.',
    ground:
      'Ground fault is reported as a trouble condition; devices generally keep operating, but it must be corrected.',
  }[fault]

  return (
    <section className="panel-page">
      <div className="page-head">
        <p className="eyebrow">Wiring</p>
        <h1>Wiring diagram</h1>
        <p className="lede">
          Your circuits as configured: {config.panelType}, Class {cls}. Initiating and supervisory
          devices ride the {addr ? 'SLC' : 'IDC'}; notification appliances ride a separate NAC.
          Inject a fault to see how this class survives it. Click any device to read how it works.
        </p>
      </div>

      <div className="diagram-controls">
        <div className="fault-picker">
          <span className="picker-label">Inject fault:</span>
          {[
            ['none', 'None'],
            ['open', 'Open'],
            ['short', 'Short'],
            ['ground', 'Ground'],
          ].map(([id, label]) => (
            <button
              key={id}
              className={`ghost-btn ${fault === id ? 'active' : ''}`}
              onClick={() => setFault(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {fault !== 'none' && circuits.length > 1 && (
          <div className="fault-picker">
            <span className="picker-label">On circuit:</span>
            {circuits.map((c) => (
              <button
                key={c.key}
                className={`ghost-btn ${effectiveFaultCircuit === c.key ? 'active' : ''}`}
                onClick={() => setFaultCircuit(c.key)}
              >
                {c.key === 'nac' ? 'NAC' : addr ? 'SLC' : 'IDC'}
              </button>
            ))}
          </div>
        )}

        {(fault === 'open' || fault === 'short') &&
          (() => {
            const cd = circuits.find((c) => c.key === effectiveFaultCircuit)
            const n = cd ? cd.devices.length : 0
            if (n < 2) return null
            return (
              <div className="fault-loc">
                <span className="picker-label">Location:</span>
                <input
                  type="range"
                  min="1"
                  max={n - 1}
                  value={Math.min(faultAt, n - 1)}
                  onChange={(e) => setFaultAt(Number(e.target.value))}
                />
                <span className="loc-hint">
                  between devices {Math.min(faultAt, n - 1)} and {Math.min(faultAt, n - 1) + 1}
                </span>
              </div>
            )
          })()}
      </div>

      <div className="diagram-frame">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="wiring-svg"
          role="img"
          aria-label="Wiring diagram"
        >
          {/* Panel (spans all circuits) */}
          <g>
            <rect
              x="30"
              y={panelTop}
              width="90"
              height={panelBot - panelTop}
              rx="6"
              className="svg-panel"
            />
            <text x="75" y={(panelTop + panelBot) / 2 - 4} className="svg-panel-label">
              FACP
            </text>
            <text x="75" y={(panelTop + panelBot) / 2 + 14} className="svg-panel-sub">
              Class {cls}
            </text>
          </g>

          {circuits.map((circuit, ci) => {
            const y = rowY(ci)
            const xs = nodeXs(circuit.devices)
            const n = circuit.devices.length
            const lastX = xs[n - 1]
            const isFaultC = fault !== 'none' && effectiveFaultCircuit === circuit.key
            const faultX =
              fault === 'ground'
                ? panelRight
                : faultAt < n
                ? xs[Math.min(faultAt, n - 1)] - 40
                : startX - 40

            return (
              <g key={circuit.key}>
                {/* circuit label */}
                <text x={panelRight + 6} y={y - 30} className="svg-circuit-label">
                  {circuit.label}
                </text>

                {/* panel -> first device */}
                <line
                  x1={panelRight}
                  y1={y}
                  x2={xs[0] - 26}
                  y2={y}
                  className={`svg-wire ${
                    isFaultC && fault === 'open' && cls === 'B' && faultAt <= 0 ? 'dead' : ''
                  }`}
                />

                {/* between devices */}
                {circuit.devices.slice(1).map((_, k) => {
                  const i = k + 1
                  const segDead =
                    isFaultC && fault === 'open' && cls === 'B' && i >= faultAt
                  return (
                    <line
                      key={i}
                      x1={xs[i - 1] + 26}
                      y1={y}
                      x2={xs[i] - 26}
                      y2={y}
                      className={`svg-wire ${segDead ? 'dead' : ''}`}
                    />
                  )
                })}

                {/* End of line (Class B) */}
                {cls === 'B' && (
                  <g>
                    <line x1={lastX + 26} y1={y} x2={lastX + 58} y2={y} className="svg-wire" />
                    <rect
                      x={lastX + 58}
                      y={y - 12}
                      width="24"
                      height="24"
                      rx="3"
                      className="svg-eol"
                    />
                    <text x={lastX + 70} y={y + 5} className="svg-eol-label">
                      EOL
                    </text>
                  </g>
                )}

                {/* Return path (Class A / X) */}
                {isLoop && (
                  <>
                    <line x1={lastX} y1={y} x2={lastX} y2={y + 60} className="svg-wire return" />
                    <line
                      x1={lastX}
                      y1={y + 60}
                      x2={panelRight}
                      y2={y + 60}
                      className="svg-wire return"
                    />
                    <text x={(lastX + panelRight) / 2} y={y + 76} className="svg-return-label">
                      {cls === 'X' ? 'Class X return (isolated loop)' : 'Class A return path'}
                    </text>
                  </>
                )}

                {/* Fault marker */}
                {isFaultC && (
                  <g>
                    <circle cx={faultX} cy={y} r="9" className={`svg-fault ${fault}`} />
                    <text x={faultX} y={y - 16} className="svg-fault-label">
                      {fault.toUpperCase()}
                    </text>
                  </g>
                )}

                {/* Devices */}
                {circuit.devices.map((d, i) => {
                  const dead = affected(i, circuit.key)
                  return (
                    <g
                      key={d.id + i}
                      className={`svg-device ${dead ? 'dead' : ''} ${
                        selected === d.id ? 'sel' : ''
                      }`}
                      onClick={() => setSelected(d.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle cx={xs[i]} cy={y} r="22" />
                      <text x={xs[i]} y={y + 4} className="svg-device-label">
                        {d.name}
                      </text>
                      {dead && (
                        <text x={xs[i]} y={y - 30} className="svg-dead-x">
                          ✕ off
                        </text>
                      )}
                    </g>
                  )
                })}
              </g>
            )
          })}

          {circuits.length === 0 && (
            <text x={W / 2} y={H / 2} className="svg-return-label" textAnchor="middle">
              Select devices on the Configure tab to draw the circuits.
            </text>
          )}
        </svg>
      </div>

      <div className={`diagram-status ${troubleReported ? 'trouble' : 'ok'}`}>
        {troubleReported ? '▲ Panel: TROUBLE reported' : '● Panel: Normal'} — {faultMsg}
      </div>

      {selected && DEVICE_BY_ID[selected] && (
        <div className="device-detail">
          <div className="device-detail-head">
            <h3>{DEVICE_BY_ID[selected].name}</h3>
            <button className="ghost-btn" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
          <p>{DEVICE_BY_ID[selected].howItWorks}</p>
          <h5>Test procedure</h5>
          <ol className="proc-list">
            {DEVICE_BY_ID[selected].testProcedure.map((s, i) => (
              <li key={i}>
                <span className="proc-instruction">{s.instruction}</span>
                <span className="proc-expected">Expected: {s.expected}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  )
}
