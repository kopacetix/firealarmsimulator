import { DEVICES } from '../content.js'

const DEVICE_OPTIONS = DEVICES.map((d) => ({ id: d.id, name: d.name }))

export default function Configurator({ config, setConfig, goTo }) {
  const update = (patch) => setConfig({ ...config, ...patch })

  const toggleDevice = (id) => {
    const has = config.devices.includes(id)
    update({
      devices: has ? config.devices.filter((d) => d !== id) : [...config.devices, id],
    })
  }

  const classOptions =
    config.panelType === 'addressable' ? ['A', 'B', 'X'] : ['A', 'B']

  // keep wiring class valid if panel type changes away from addressable
  const setPanel = (panelType) => {
    let wiringClass = config.wiringClass
    if (panelType === 'conventional' && wiringClass === 'X') wiringClass = 'B'
    update({ panelType, wiringClass })
  }

  return (
    <section className="panel-page">
      <div className="page-head">
        <p className="eyebrow">Step 1</p>
        <h1>Describe your system</h1>
        <p className="lede">
          Tell the trainer what you have in front of you. Every other tab — the walkthroughs, the
          test checklist, the panel simulator, and the wiring diagram — reflects these choices.
        </p>
      </div>

      <div className="config-grid">
        <fieldset className="config-block">
          <legend>Panel type</legend>
          <div className="choice-row">
            {['addressable', 'conventional'].map((pt) => (
              <button
                key={pt}
                className={`choice ${config.panelType === pt ? 'selected' : ''}`}
                onClick={() => setPanel(pt)}
              >
                {pt === 'addressable' ? 'Addressable' : 'Conventional'}
              </button>
            ))}
          </div>
          <p className="hint">
            Addressable panels identify each device individually; conventional panels report by zone.
          </p>
        </fieldset>

        <fieldset className="config-block">
          <legend>Wiring class</legend>
          <div className="choice-row">
            {classOptions.map((c) => (
              <button
                key={c}
                className={`choice ${config.wiringClass === c ? 'selected' : ''}`}
                onClick={() => update({ wiringClass: c })}
              >
                Class {c}
              </button>
            ))}
          </div>
          <p className="hint">
            {config.wiringClass === 'A' &&
              'Class A loops out and back — a single open still leaves all devices working.'}
            {config.wiringClass === 'B' &&
              'Class B is a single path — a break disables devices past it (panel still reports trouble).'}
            {config.wiringClass === 'X' &&
              'Class X adds short-circuit isolation — survives both an open and a short.'}
          </p>
        </fieldset>

        <fieldset className="config-block wide">
          <legend>Devices on the system</legend>
          <div className="device-grid">
            {DEVICE_OPTIONS.map((d) => (
              <label
                key={d.id}
                className={`device-chip ${config.devices.includes(d.id) ? 'on' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={config.devices.includes(d.id)}
                  onChange={() => toggleDevice(d.id)}
                />
                {d.name}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="config-block">
          <legend>{config.panelType === 'addressable' ? 'Loops' : 'Zones'}</legend>
          <input
            type="number"
            min="1"
            max="99"
            value={config.zones}
            onChange={(e) => update({ zones: Math.max(1, Number(e.target.value) || 1) })}
          />
        </fieldset>
      </div>

      <div className="config-actions">
        <button className="primary-btn" onClick={() => goTo('simulate')}>
          Build my panel →
        </button>
      </div>
    </section>
  )
}
