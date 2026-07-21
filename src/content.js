// ============================================================================
// CURATED CONTENT — single source of truth for the whole app.
// The configurator, Learn tab, Test checklist, Simulator and Reference tab
// all read from this file. To expand the app (or add sprinkler/pump families
// later), add entries here rather than editing UI components.
//
// NFPA references are kept at the "which standard governs what" level on
// purpose. Where a specific numeric interval or table value belongs, the text
// says VERIFY against the current adopted edition rather than guessing.
// ============================================================================

// Step = { instruction, expected, caution? }

export const DEVICES = [
  {
    id: 'smoke_photo',
    name: 'Photoelectric Smoke Detector',
    category: 'initiating',
    howItWorks:
      'A photoelectric smoke detector aims an LED across a small dark chamber at an angle away from a light sensor. In clean air almost no light reaches the sensor. When smoke particles enter the chamber they scatter the light onto the sensor, and once the scatter crosses a threshold the detector signals alarm. Photoelectric sensing responds well to the larger particles of smoldering, smoky fires.',
    preTest: [
      'Coordinate with the monitoring company and place the system on test before activating anything.',
      'Confirm the area is clear and that occupants know a test is in progress.',
    ],
    testProcedure: [
      {
        instruction:
          'Introduce listed smoke or aerosol test material (canned "smoke") into the detector per the manufacturer\'s instructions.',
        expected:
          'The detector\'s alarm LED latches on and the panel annunciates an alarm for that device address / zone.',
        caution:
          'Use only the aerosol the detector manufacturer lists. The wrong product can contaminate the chamber.',
      },
      {
        instruction:
          'Confirm the specific device address (addressable) or zone (conventional) shown at the panel matches the detector you activated.',
        expected: 'Panel display identifies the correct device / zone.',
      },
      {
        instruction:
          'Reset the detector and the panel; allow the chamber to clear before expecting a clean reset.',
        expected: 'Detector LED clears and the panel returns to Normal.',
        caution:
          'Residual aerosol can hold the detector in alarm — a failed reset here usually means the chamber has not cleared yet.',
      },
    ],
    expectedResult:
      'Alarm annunciated at the panel with the correct device/zone identified, and a clean reset once the chamber clears.',
    commonFaults: [
      {
        symptom: 'Detector will not go into alarm with test aerosol',
        likelyCause: 'Wrong or empty aerosol, dirty chamber, or detector past end of life',
        check: 'Verify the listed aerosol, inspect for contamination, check the detector age/date',
      },
      {
        symptom: 'Panel will not reset after test',
        likelyCause: 'Chamber still holds test smoke, or device is still in alarm',
        check: 'Allow the chamber to clear and confirm no other device is active before reset',
      },
      {
        symptom: 'Wrong address/zone annunciates',
        likelyCause: 'Miswired or mis-addressed device',
        check: 'Verify the address programming (addressable) or zone wiring (conventional)',
      },
    ],
    codeReference:
      'NFPA 72 governs periodic inspection, testing, and maintenance of smoke detectors. VERIFY current test frequency and sensitivity-testing requirements against the adopted edition.',
  },
  {
    id: 'heat',
    name: 'Heat Detector (Fixed / Rate-of-Rise)',
    category: 'initiating',
    howItWorks:
      'A heat detector responds to temperature. A fixed-temperature element alarms when the surrounding air reaches a set point. A rate-of-rise element alarms when the temperature climbs faster than a set rate (commonly around 15°F per minute), which catches a fast-developing fire before the fixed set point is reached. Many spot detectors combine both.',
    preTest: [
      'Place the system on test and notify monitoring.',
      'Identify whether the detector is a restorable or non-restorable type before applying heat.',
    ],
    testProcedure: [
      {
        instruction:
          'Apply heat to a restorable detector with a listed heat source (e.g. a heat test tool / shrouded heat gun) per the manufacturer.',
        expected: 'The detector signals alarm and the panel annunciates the correct device/zone.',
        caution:
          'Do NOT apply flame or excessive heat. Never heat-test a non-restorable (fusible-link style) detector — it must be functionally tested by other listed means and replaced if operated.',
      },
      {
        instruction: 'Confirm the correct device/zone at the panel.',
        expected: 'Panel identifies the detector you activated.',
      },
      {
        instruction: 'Allow the detector to cool, then reset the panel.',
        expected: 'Detector restores and the panel returns to Normal.',
      },
    ],
    expectedResult:
      'Restorable detector alarms on heat, correct device/zone annunciates, and restores on cooling.',
    commonFaults: [
      {
        symptom: 'No alarm on heat',
        likelyCause: 'Insufficient heat, wrong detector type assumption, or failed element',
        check: 'Confirm restorable type and adequate listed heat source; replace if failed',
      },
      {
        symptom: 'Detector will not restore',
        likelyCause: 'Non-restorable element has operated, or still warm',
        check: 'Allow cooling; if a fusible element operated, replace the detector',
      },
    ],
    codeReference:
      'NFPA 72 covers heat-detector testing. VERIFY restorable vs non-restorable test methods and frequency in the current edition.',
  },
  {
    id: 'pull',
    name: 'Manual Pull Station',
    category: 'initiating',
    howItWorks:
      'A manual pull station lets a person initiate an alarm by hand. Single-action stations alarm with one pull; dual-action stations require a push-then-pull (or lift-then-pull) to reduce accidental activation. Operating the station opens or shorts the initiating circuit, which the panel reads as an alarm.',
    preTest: [
      'Place the system on test and notify monitoring so the pull does not dispatch responders.',
      'Have the correct reset key on hand for keyed stations.',
    ],
    testProcedure: [
      {
        instruction: 'Operate the pull station (single or dual action as applicable).',
        expected:
          'The panel immediately annunciates an alarm identifying the pull-station device/zone.',
      },
      {
        instruction: 'Confirm notification appliances activate (unless in a silent/one-person test mode).',
        expected: 'Horns/strobes operate, or the walk-test indication occurs.',
      },
      {
        instruction: 'Reset the station with the key/tool, then reset the panel.',
        expected: 'Station returns to normal and the panel clears to Normal.',
        caution: 'The panel will not reset while the station is still latched open.',
      },
    ],
    expectedResult:
      'Immediate alarm on operation, correct device/zone annunciated, clean reset after the station is restored.',
    commonFaults: [
      {
        symptom: 'No alarm when operated',
        likelyCause: 'Open/broken initiating wiring or faulty switch',
        check: 'Check circuit continuity and the station switch',
      },
      {
        symptom: 'Panel will not reset',
        likelyCause: 'Station not physically reset/relatched',
        check: 'Re-key/relatch the station, confirm it reads normal at the panel',
      },
    ],
    codeReference:
      'NFPA 72 requires periodic testing of manual fire alarm boxes. VERIFY frequency in the current edition.',
  },
  {
    id: 'duct',
    name: 'Duct Smoke Detector',
    category: 'initiating',
    howItWorks:
      'A duct smoke detector samples air moving through an HVAC duct using sampling tubes that draw air across a smoke-sensing element. On detecting smoke it signals the fire alarm system and, importantly, is typically wired to shut down the associated air-handling unit to stop smoke from being distributed through the building.',
    preTest: [
      'Place the system on test and notify monitoring.',
      'Coordinate with building/facilities before tripping — the test will shut down the associated air handler.',
    ],
    testProcedure: [
      {
        instruction:
          'Access the detector and introduce listed test smoke/aerosol through the sampling arrangement per the manufacturer.',
        expected:
          'The detector signals the panel and the associated air-handling unit shuts down / dampers respond.',
        caution:
          'Confirm HVAC shutdown behavior is expected and coordinated — an uncoordinated shutdown can disrupt building operations.',
      },
      {
        instruction: 'Verify the correct device/zone and any HVAC shutdown/relay function.',
        expected: 'Correct annunciation and confirmed fan shutdown / damper action.',
      },
      {
        instruction: 'Clear the detector, reset the panel, and confirm the air handler restarts as designed.',
        expected: 'System returns to Normal and HVAC returns to normal operation.',
      },
    ],
    expectedResult:
      'Alarm/supervisory signal at the panel with correct annunciation and verified HVAC shutdown, then clean restoration.',
    commonFaults: [
      {
        symptom: 'No signal when tested',
        likelyCause: 'Sampling tubes reversed/blocked, low duct airflow, or contamination',
        check: 'Verify sampling-tube orientation and airflow; clean or service the head',
      },
      {
        symptom: 'HVAC does not shut down',
        likelyCause: 'Relay/interlock wiring or programming issue',
        check: 'Verify the shutdown relay and interlock to the air handler',
      },
    ],
    codeReference:
      'NFPA 72 addresses duct detector testing; HVAC interface requirements also involve the mechanical code. VERIFY specifics in the adopted editions.',
  },
  {
    id: 'waterflow',
    name: 'Waterflow Switch',
    category: 'initiating',
    howItWorks:
      'A waterflow switch on a sprinkler system detects water actually moving through the pipe — as happens when a sprinkler head operates. A vane or pressure-type switch closes a contact and signals the fire alarm panel as an alarm. A built-in retard/time delay filters out brief pressure surges so normal fluctuations do not cause false alarms.',
    preTest: [
      'Place the system on test and notify monitoring — a waterflow alarm is a dispatchable signal.',
      'Coordinate with anyone responsible for the sprinkler system before flowing water.',
    ],
    testProcedure: [
      {
        instruction:
          'Open the inspector\'s test connection (or flow-test provision) to simulate flow of one sprinkler head.',
        expected:
          'After the retard delay, the waterflow switch signals and the panel annunciates a waterflow alarm.',
        caution:
          'This is a coordinated function with the sprinkler system — confirm you are authorized to flow water and know where it drains.',
      },
      {
        instruction: 'Time the delay between flow and alarm if required, and confirm correct annunciation.',
        expected: 'Alarm occurs within the expected retard window and identifies the correct device/zone.',
      },
      {
        instruction: 'Close the test connection, allow flow to stop, and reset the panel.',
        expected: 'Switch restores and the panel returns to Normal.',
      },
    ],
    expectedResult:
      'Waterflow alarm at the panel after the retard delay, correct annunciation, clean reset after flow stops.',
    commonFaults: [
      {
        symptom: 'No alarm on flow',
        likelyCause: 'Stuck vane, wiring open, or excessive retard setting',
        check: 'Inspect the switch and retard setting; verify circuit continuity',
      },
      {
        symptom: 'Alarm with no real flow (false)',
        likelyCause: 'Retard too short or pressure surges',
        check: 'Adjust/verify the retard delay per listing',
      },
    ],
    codeReference:
      'NFPA 72 covers waterflow-device testing on the alarm side; NFPA 25 governs the sprinkler system itself. VERIFY test frequency and delay limits in the adopted editions.',
  },
  {
    id: 'tamper',
    name: 'Tamper / Supervisory Switch',
    category: 'supervisory',
    howItWorks:
      'A tamper (valve supervisory) switch monitors the position of a sprinkler control valve. If the valve is closed even part way — which would impair the sprinkler system — the switch signals the panel as a SUPERVISORY condition, distinct from an alarm. This tells staff a life-safety system has been compromised without dispatching as a fire.',
    preTest: [
      'Place the system on test and notify monitoring.',
      'Coordinate before operating any sprinkler control valve.',
    ],
    testProcedure: [
      {
        instruction:
          'Begin to close the supervised valve until the tamper switch operates (usually within about two turns / one-fifth of travel).',
        expected: 'The panel annunciates a SUPERVISORY signal (not an alarm) identifying the device/zone.',
        caution:
          'Do not fully close and leave a valve closed. Restore the valve to fully open and confirm before leaving.',
      },
      {
        instruction: 'Confirm the supervisory signal is distinct from an alarm at the panel and at monitoring.',
        expected: 'Panel shows a supervisory (not alarm) state with correct identification.',
      },
      {
        instruction: 'Fully re-open the valve and confirm the supervisory condition clears.',
        expected: 'Supervisory clears and the panel returns to Normal.',
      },
    ],
    expectedResult:
      'A distinct supervisory signal on valve movement, correct annunciation, and clearing when the valve is fully restored open.',
    commonFaults: [
      {
        symptom: 'Shows as alarm instead of supervisory',
        likelyCause: 'Miswired to an alarm circuit / mis-programmed point',
        check: 'Verify the point is mapped as supervisory, not alarm',
      },
      {
        symptom: 'No supervisory when valve moved',
        likelyCause: 'Switch not engaging the valve stem, or wiring open',
        check: 'Adjust the switch trip point and verify circuit continuity',
      },
    ],
    codeReference:
      'NFPA 72 covers supervisory-signal-device testing. VERIFY frequency and the distinction from alarm signals in the current edition.',
  },
  {
    id: 'nac',
    name: 'Notification Appliance (Horn / Strobe)',
    category: 'notification',
    howItWorks:
      'Notification appliances are the outputs that tell occupants to evacuate: horns (audible) and strobes (visible). They sit on a Notification Appliance Circuit (NAC) powered and supervised by the panel. Audible signals for evacuation typically use the standardized Temporal-3 pattern. Strobes must flash at their rated candela and be synchronized in a space so the flashes do not compound.',
    preTest: [
      'Place the system on test and notify monitoring and occupants — appliances will sound.',
      'Consider hearing protection and warn anyone photosensitive about strobe activity.',
    ],
    testProcedure: [
      {
        instruction: 'Activate the system (or NAC test function) so notification appliances operate.',
        expected: 'Horns sound the correct pattern (typically Temporal-3) and strobes flash at all required locations.',
        caution: 'Sustained horn testing is loud — protect hearing and limit exposure.',
      },
      {
        instruction: 'Verify audibility/visibility coverage and that synchronized strobes flash together.',
        expected: 'Appliances operate throughout the required coverage area; strobes are synchronized.',
      },
      {
        instruction: 'Silence and reset, confirming the NAC returns to a supervised normal state.',
        expected: 'Appliances stop and the NAC shows normal (no trouble).',
      },
    ],
    expectedResult:
      'All required appliances operate with correct audible pattern and synchronized strobes, then return to a supervised normal state.',
    commonFaults: [
      {
        symptom: 'Some appliances do not operate',
        likelyCause: 'Open on the NAC past a break (Class B), low voltage at end of circuit, or failed appliance',
        check: 'Check NAC voltage/voltage drop at the far appliance and circuit continuity',
      },
      {
        symptom: 'NAC trouble on the panel',
        likelyCause: 'Open circuit or missing/failed end-of-line supervision',
        check: 'Verify EOL device and wiring integrity',
      },
      {
        symptom: 'Strobes not synchronized',
        likelyCause: 'Missing sync module or mixed sync protocols',
        check: 'Confirm a common sync source/protocol for the space',
      },
    ],
    codeReference:
      'NFPA 72 sets audible/visible notification and testing requirements. VERIFY audibility, candela, and synchronization requirements in the current edition.',
  },
]

export const TOPICS = [
  {
    id: 'on_test',
    name: 'Placing the System on Test & Notifying Monitoring',
    howItWorks:
      'Before you activate any device, the monitored fire alarm system has to be put "on test" with the monitoring company so your test signals do not dispatch the fire department. You provide account identification, request a test window, and confirm the account is on test before proceeding. When finished you take the system off test and confirm signals are being received live again.',
    preTest: [
      'Have the account number and site contact information ready.',
      'Confirm the building occupants and any on-site staff know testing is happening.',
    ],
    testProcedure: [
      {
        instruction: 'Contact the monitoring company and place the account on test for a defined window.',
        expected: 'Monitoring confirms the account is on test and will not dispatch on incoming signals.',
        caution:
          'Never begin testing a monitored system until you have positive confirmation it is on test — an uncoordinated alarm can dispatch responders.',
      },
      {
        instruction: 'Perform testing within the confirmed window.',
        expected: 'Signals are logged as tests, not emergencies.',
      },
      {
        instruction: 'When finished, take the system off test and verify live signal reception.',
        expected: 'Monitoring confirms the account is restored to live monitoring.',
        caution: 'Leaving a system on test means real alarms may not be acted on — always confirm restoration.',
      },
    ],
    expectedResult:
      'Positive confirmation on test before testing, and positive confirmation restored to live monitoring afterward.',
    commonFaults: [
      {
        symptom: 'Monitoring reports signals not received during test',
        likelyCause: 'Communication path (dialer/cellular/IP) fault',
        check: 'Verify the communicator and its supervised paths',
      },
    ],
    codeReference:
      'NFPA 72 addresses supervising-station communication and testing coordination. VERIFY notification and record-keeping requirements in the current edition.',
  },
  {
    id: 'ack_silence_reset',
    name: 'Acknowledge · Silence · Reset Sequence',
    howItWorks:
      'These three panel functions do different jobs and are often confused. ACKNOWLEDGE tells the panel you have seen the event — it silences the panel\'s internal buzzer and steadies the indicator, but the field devices keep operating. SILENCE turns off the notification appliances (horns/strobes) while the alarm condition itself remains. RESET attempts to return the whole system to normal, and only succeeds if the initiating condition has actually cleared.',
    preTest: ['Understand the current panel state before pressing anything.'],
    testProcedure: [
      {
        instruction: 'With an active alarm, press Acknowledge.',
        expected: 'Internal buzzer silences, the event indicator goes steady, the event is logged; appliances still operate.',
      },
      {
        instruction: 'Press Silence.',
        expected: 'Notification appliances stop, but the alarm indicator remains until reset.',
      },
      {
        instruction: 'Clear the initiating device, then press Reset.',
        expected: 'System returns to Normal.',
        caution:
          'If the initiating device is still in alarm, Reset will fail and the panel will re-annunciate — clear the device first.',
      },
    ],
    expectedResult:
      'Each function behaves distinctly, and Reset only succeeds once the initiating condition is cleared.',
    commonFaults: [
      {
        symptom: 'Panel re-alarms immediately after reset',
        likelyCause: 'Initiating device still active (smoke in chamber, latched pull, etc.)',
        check: 'Clear/restore the device before attempting reset',
      },
    ],
    codeReference: 'Operational sequences follow the panel listing and NFPA 72 operating requirements.',
  },
  {
    id: 'walk_test',
    name: 'Walk Test / One-Person Test Mode',
    howItWorks:
      'Walk test (one-person test) mode lets a single technician test many devices efficiently. In this mode, activating a device produces a brief local indication and logs the device — often pulsing the appliances momentarily instead of holding a full evacuation alarm — then auto-resets so the tech can move to the next device without returning to the panel each time.',
    preTest: [
      'Place the system on test with monitoring first.',
      'Confirm the panel supports walk test and how it annunciates in that mode.',
    ],
    testProcedure: [
      {
        instruction: 'Enable walk-test mode at the panel per its instructions.',
        expected: 'Panel indicates it is in test mode.',
      },
      {
        instruction: 'Activate each device in turn.',
        expected: 'Each device gives a brief local indication and is logged, without holding a full alarm.',
      },
      {
        instruction: 'Exit walk-test mode and confirm the system returns to full normal operation.',
        expected: 'Panel is out of test mode and fully normal/supervised.',
        caution: 'Do not leave the panel in walk-test mode — it will not respond as a live system.',
      },
    ],
    expectedResult:
      'Each device is confirmed and logged in test mode, then the panel is returned to full normal operation.',
    commonFaults: [
      {
        symptom: 'Device not logged in walk test',
        likelyCause: 'Device fault, addressing issue, or not actually activated',
        check: 'Re-test the device and verify its address/zone',
      },
    ],
    codeReference: 'Test methods including one-person testing are addressed in NFPA 72. VERIFY in the current edition.',
  },
  {
    id: 'trouble_supervisory',
    name: 'Trouble vs Supervisory Conditions',
    howItWorks:
      'A TROUBLE signal means the system itself has a problem that could impair its operation — an open circuit, a ground fault, low battery, or a missing device. A SUPERVISORY signal means a protective feature has been changed from its normal state — most commonly a sprinkler valve partly closed (tamper). Both are distinct from an ALARM and usually annunciate with their own indicator and a different, intermittent sounder pattern so an operator can tell them apart by ear.',
    preTest: ['Know which indicator and sounder pattern the panel uses for each state.'],
    testProcedure: [
      {
        instruction: 'Create a trouble condition (e.g. open an initiating or notification circuit, or remove a device).',
        expected: 'Trouble LED lights and the panel gives the trouble sounder pattern; the event is logged.',
        caution: 'Do this only in a controlled test with the system on test.',
      },
      {
        instruction: 'Create a supervisory condition (e.g. operate a tamper switch).',
        expected: 'Supervisory LED lights with its own distinct sounder pattern, separate from trouble and alarm.',
      },
      {
        instruction: 'Restore both conditions and confirm each clears.',
        expected: 'Panel returns to Normal.',
      },
    ],
    expectedResult:
      'Trouble and supervisory each annunciate on their own indicators and sounder patterns and clear when restored.',
    commonFaults: [
      {
        symptom: 'Condition annunciates as the wrong type',
        likelyCause: 'Point mapped/wired incorrectly',
        check: 'Verify point programming: alarm vs supervisory vs trouble',
      },
    ],
    codeReference: 'Signal types and their distinct annunciation are defined in NFPA 72.',
  },
  {
    id: 'wiring_class',
    name: 'Class A vs Class B vs Class X Wiring',
    howItWorks:
      'Circuit "class" describes how a pathway survives a fault. CLASS B runs out to an end-of-line device in a single path — a single open disables everything downstream of the break, though the panel does report the trouble. CLASS A loops the wiring out and back to the panel, so a single open still leaves every device operational because the panel feeds the circuit from both directions. CLASS X (on addressable systems) adds short-circuit isolation so the loop survives both an open and a short. More survivability means more wire and cost.',
    preTest: ['Identify the class of each circuit before testing fault response.'],
    testProcedure: [
      {
        instruction: 'On a Class B circuit, introduce an open and observe.',
        expected: 'Panel reports a trouble; devices downstream of the break stop functioning.',
        caution: 'Only introduce faults in a controlled test with the system on test.',
      },
      {
        instruction: 'On a Class A circuit, introduce a single open and observe.',
        expected: 'Panel reports a trouble but all devices keep operating via the return path.',
      },
      {
        instruction: 'On a Class X circuit, introduce an open and then a short and observe.',
        expected: 'Circuit isolates the fault and maintains operation; panel reports the trouble.',
      },
    ],
    expectedResult:
      'Fault behavior matches the circuit class: B loses downstream devices, A survives a single open, X survives open and short.',
    commonFaults: [
      {
        symptom: 'Class A circuit loses devices on a single open (behaves like B)',
        likelyCause: 'Return path not actually landed, or wired as B',
        check: 'Verify both circuit legs return to the panel as designed',
      },
    ],
    codeReference:
      'Circuit pathway survivability and classes are defined in NFPA 72. VERIFY class designations and requirements in the current edition.',
  },
]

// Quick lookup helpers
export const DEVICE_BY_ID = Object.fromEntries(DEVICES.map((d) => [d.id, d]))
export const ALL_CONTENT = [...DEVICES, ...TOPICS]
