import { useMemo, useState } from 'react'
import { DEVICE_BY_ID, TOPICS } from '../content.js'

export default function TestChecklist({ config }) {
  const onTestTopic = TOPICS.find((t) => t.id === 'on_test')

  const items = useMemo(() => {
    const list = []
    // System-level pre-test coordination first
    onTestTopic.testProcedure.forEach((step, i) => {
      list.push({
        key: `sys-${i}`,
        group: 'Pre-test coordination',
        instruction: step.instruction,
        expected: step.expected,
        caution: step.caution,
      })
    })
    // Each configured device's procedure
    config.devices.forEach((id) => {
      const d = DEVICE_BY_ID[id]
      if (!d) return
      d.testProcedure.forEach((step, i) => {
        list.push({
          key: `${id}-${i}`,
          group: d.name,
          instruction: step.instruction,
          expected: step.expected,
          caution: step.caution,
        })
      })
    })
    return list
  }, [config.devices]) // eslint-disable-line

  const [done, setDone] = useState({})
  const completed = items.filter((it) => done[it.key]).length

  const toggle = (key) => setDone((d) => ({ ...d, [key]: !d[key] }))
  const reset = () => setDone({})

  // group items in order while preserving group headers
  const grouped = []
  let lastGroup = null
  items.forEach((it) => {
    if (it.group !== lastGroup) {
      grouped.push({ header: it.group })
      lastGroup = it.group
    }
    grouped.push(it)
  })

  return (
    <section className="panel-page">
      <div className="page-head">
        <p className="eyebrow">Step 3</p>
        <h1>Guided test checklist</h1>
        <p className="lede">
          Assembled from the devices you configured. Work top to bottom; each item shows what a
          passing result looks like.
        </p>
      </div>

      <div className="coordination-banner">
        <strong>Coordinate before you activate anything.</strong> Notify the monitoring company / AHJ,
        place the system on test, and make sure everyone who could be affected knows a test is in
        progress before you trip a single device.
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-meta">
          <span>
            {completed} / {items.length} complete
          </span>
          <button className="ghost-btn" onClick={reset}>
            Reset checklist
          </button>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: items.length ? `${(completed / items.length) * 100}%` : '0%' }}
          />
        </div>
      </div>

      <ul className="checklist">
        {grouped.map((row, i) =>
          row.header ? (
            <li className="checklist-group" key={`h-${i}`}>
              {row.header}
            </li>
          ) : (
            <li className={`checklist-item ${done[row.key] ? 'checked' : ''}`} key={row.key}>
              <label>
                <input
                  type="checkbox"
                  checked={!!done[row.key]}
                  onChange={() => toggle(row.key)}
                />
                <span className="check-body">
                  <span className="check-instruction">{row.instruction}</span>
                  <span className="check-expected">Expected: {row.expected}</span>
                  {row.caution && <span className="check-caution">⚠ {row.caution}</span>}
                </span>
              </label>
            </li>
          )
        )}
      </ul>
    </section>
  )
}
