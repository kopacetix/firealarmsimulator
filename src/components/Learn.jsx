import { useState } from 'react'
import { DEVICE_BY_ID, TOPICS } from '../content.js'

function ContentCard({ item, open, onToggle }) {
  return (
    <article className={`learn-card ${open ? 'open' : ''}`}>
      <button className="learn-card-head" onClick={onToggle} aria-expanded={open}>
        <span>{item.name}</span>
        <span className="chev" aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="learn-card-body">
          <h4>How it works</h4>
          <p>{item.howItWorks}</p>

          <h4>Before you test</h4>
          <ul>
            {item.preTest.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>

          <h4>Test procedure</h4>
          <ol className="proc-list">
            {item.testProcedure.map((step, i) => (
              <li key={i}>
                <span className="proc-instruction">{step.instruction}</span>
                <span className="proc-expected">Expected: {step.expected}</span>
                {step.caution && <span className="proc-caution">⚠ {step.caution}</span>}
              </li>
            ))}
          </ol>

          <h4>Expected result</h4>
          <p>{item.expectedResult}</p>

          <h4>Common faults</h4>
          <div className="fault-table">
            {item.commonFaults.map((f, i) => (
              <div className="fault-row" key={i}>
                <span className="fault-symptom">{f.symptom}</span>
                <span className="fault-cause">{f.likelyCause}</span>
                <span className="fault-check">{f.check}</span>
              </div>
            ))}
          </div>

          <p className="code-ref">{item.codeReference}</p>
        </div>
      )}
    </article>
  )
}

export default function Learn({ config }) {
  const [openId, setOpenId] = useState(null)
  const devices = config.devices.map((id) => DEVICE_BY_ID[id]).filter(Boolean)

  // Always-relevant topics, plus wiring-class topic emphasized
  const topicList = TOPICS

  const toggle = (id) => setOpenId(openId === id ? null : id)

  return (
    <section className="panel-page">
      <div className="page-head">
        <p className="eyebrow">Step 2</p>
        <h1>Learn your system</h1>
        <p className="lede">
          Walkthroughs assembled for a {config.panelType} panel with Class {config.wiringClass} wiring.
        </p>
      </div>

      <h3 className="section-label">Your devices</h3>
      {devices.length === 0 && (
        <p className="empty">No devices selected yet. Add some on the Configure tab.</p>
      )}
      <div className="learn-list">
        {devices.map((d) => (
          <ContentCard key={d.id} item={d} open={openId === d.id} onToggle={() => toggle(d.id)} />
        ))}
      </div>

      <h3 className="section-label">System operation &amp; concepts</h3>
      <div className="learn-list">
        {topicList.map((t) => (
          <ContentCard key={t.id} item={t} open={openId === t.id} onToggle={() => toggle(t.id)} />
        ))}
      </div>
    </section>
  )
}
