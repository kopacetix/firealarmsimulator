# FireTest Trainer — Fire Alarm Testing & Operation

An interactive training app that teaches technicians and newcomers how to test and
operate fire alarm systems. Describe your system in the **Configure** tab and the rest of
the app tailors itself to it.

## Tabs

- **Configure** — declare your system: panel type (addressable/conventional), wiring class
  (A / B / X), device mix, monitoring, building type, zones/loops. Everything else reads
  from this.
- **Learn** — curated walkthroughs per device and per system concept: how it works,
  pre-test coordination, step-by-step procedure with expected results, common faults, and
  the relevant standard.
- **Test** — a tickable checklist assembled from your configured devices, with a persistent
  pre-test coordination banner and progress tracking.
- **Simulate** — an operable virtual FACP (generic Notifier-family look). Trigger conditions
  and practice Acknowledge → Silence → Reset. **Makes sound**: a Temporal-3 alarm horn, plus
  distinct intermittent trouble and supervisory beeps (synthesized via the Web Audio API —
  no audio files). Audio starts on your first button press (browser autoplay rule) and there
  is a mute/volume control.
- **Diagram** — an interactive wiring/riser diagram drawn for your wiring class. Inject an
  open/short/ground fault and watch which devices drop off, tied to the Class A vs B vs X
  teaching point. Click any device for its detail.
- **Reference** — searchable library of all curated content.

## Content model

All curated content lives in `src/content.js` — the single source of truth for every tab.
Add or edit devices and concepts there; the UI updates automatically. This is also where
you'd extend into sprinkler/pump families later using the same shape.

> NFPA references are kept at the "which standard governs what" level on purpose. Where a
> specific interval or table value belongs, the text says **VERIFY** against the current
> adopted edition rather than guessing. Fill those in against your adopted code.

## Ad banner

The persistent banner is in `src/components/AdBanner.jsx`. Swap the creative by replacing
`public/leader.jpg` (or change `AD_IMAGE_SRC`). It links to `https://firelign.com` in a new
tab and is labeled "Sponsored."

## Run locally

```bash
npm install
npm run dev
```

## Build for production / deploy

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build
```

Deploys as a static site (Vite). On Vercel, import the repo and it builds with the default
Vite settings (`npm run build`, output `dist`).

---

**Training tool only.** Always follow the equipment manufacturer's published instructions,
the current adopted edition of NFPA 72, and the Authority Having Jurisdiction. Procedures and
testing frequencies vary by equipment, occupancy, and jurisdiction. Never test a live system
without first coordinating with the monitoring company and building occupants.
