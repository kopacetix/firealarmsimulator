import { useMemo, useState } from 'react'
import { DEVICES, TOPICS } from '../content.js'

export default function Reference() {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all') // all | devices | topics

  const pool = useMemo(() => {
    if (filter === 'devices') return DEVICES
    if (filter === 'topics') return TOPICS
    return [...DEVICES, ...TOPICS]
  }, [filter])

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return pool
    return pool.filter((item) => {
      const hay = [
        item.name,
        item.howItWorks,
        item.expectedResult,
        item.codeReference,
        ...item.preTest,
        ...item.testProcedure.map((s) => `${s.instruction} ${s.expected} ${s.caution || ''}`),
        ...item.commonFaults.map((f) => `${f.symptom} ${f.likelyCause} ${f.check}`),
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(term)
    })
  }, [q, pool])

  return (
    <section className="panel-page">
      <div className="page-head">
        <p className="eyebrow">Library</p>
        <h1>Reference</h1>
        <p className="lede">Every device and concept in the trainer, searchable.</p>
      </div>

      <div className="ref-controls">
        <input
          className="ref-search"
          placeholder="Search devices, faults, procedures…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="ref-filters">
          {[
            ['all', 'All'],
            ['devices', 'Devices'],
            ['topics', 'Concepts'],
          ].map(([id, label]) => (
            <button
              key={id}
              className={`ghost-btn ${filter === id ? 'active' : ''}`}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {results.length === 0 && <p className="empty">No matches for “{q}”.</p>}

      <div className="ref-list">
        {results.map((item) => (
          <article className="ref-card" key={item.id}>
            <h3>{item.name}</h3>
            <p>{item.howItWorks}</p>
            <details>
              <summary>Test procedure &amp; faults</summary>
              <h5>Procedure</h5>
              <ol className="proc-list">
                {item.testProcedure.map((s, i) => (
                  <li key={i}>
                    <span className="proc-instruction">{s.instruction}</span>
                    <span className="proc-expected">Expected: {s.expected}</span>
                    {s.caution && <span className="proc-caution">⚠ {s.caution}</span>}
                  </li>
                ))}
              </ol>
              <h5>Common faults</h5>
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
            </details>
          </article>
        ))}
      </div>
    </section>
  )
}
