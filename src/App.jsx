import { useState } from 'react'
import Configurator from './components/Configurator.jsx'
import Learn from './components/Learn.jsx'
import TestChecklist from './components/TestChecklist.jsx'
import Simulator from './components/Simulator.jsx'
import WiringDiagram from './components/WiringDiagram.jsx'
import Reference from './components/Reference.jsx'
import AdBanner from './components/AdBanner.jsx'

const TABS = [
  { id: 'configure', label: 'Configure' },
  { id: 'learn', label: 'Learn' },
  { id: 'test', label: 'Test' },
  { id: 'simulate', label: 'Simulate' },
  { id: 'diagram', label: 'Diagram' },
  { id: 'reference', label: 'Reference' },
]

const DEFAULT_CONFIG = {
  panelType: 'addressable', // 'addressable' | 'conventional'
  wiringClass: 'B', // 'A' | 'B' | 'X'
  devices: ['smoke_photo', 'pull', 'nac'],
  zones: 4,
}

export default function App() {
  const [tab, setTab] = useState('configure')
  const [config, setConfig] = useState(DEFAULT_CONFIG)

  return (
    <div className="app">
      <AdBanner />

      <header className="masthead">
        <div className="masthead-inner">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">▚</span>
            <div className="brand-text">
              <span className="brand-name">FireTest Trainer</span>
              <span className="brand-tag">Fire alarm testing &amp; operation</span>
            </div>
          </div>
          <div className="config-chip" title="Current configuration">
            <span>{config.panelType === 'addressable' ? 'Addressable' : 'Conventional'}</span>
            <span className="dot" />
            <span>Class {config.wiringClass}</span>
            <span className="dot" />
            <span>{config.devices.length} device type{config.devices.length === 1 ? '' : 's'}</span>
          </div>
        </div>

        <nav className="tabs" aria-label="Primary">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? 'page' : undefined}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="content">
        {tab === 'configure' && (
          <Configurator config={config} setConfig={setConfig} goTo={setTab} />
        )}
        {tab === 'learn' && <Learn config={config} />}
        {tab === 'test' && <TestChecklist config={config} />}
        {tab === 'simulate' && <Simulator config={config} goTo={setTab} />}
        {tab === 'diagram' && <WiringDiagram config={config} />}
        {tab === 'reference' && <Reference />}
      </main>

      <footer className="disclaimer">
        <strong>Training tool only.</strong> This app is for familiarization. Always follow the
        equipment manufacturer&apos;s published instructions, the current adopted edition of NFPA 72,
        and the requirements of the Authority Having Jurisdiction. Procedures and testing frequencies
        vary by equipment, occupancy, and jurisdiction. Never test a live system without first
        coordinating with the monitoring company and building occupants.
      </footer>
    </div>
  )
}
