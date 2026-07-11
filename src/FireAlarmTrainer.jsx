import React, { useState, useMemo, useEffect, useRef } from "react";

/* =====================================================================
   CURATED CONTENT DATASET
   Everything the app teaches lives here, separated from presentation.
   To add sprinkler / pump families later: add a new family object with
   the same shape and extend the configurator.
   ===================================================================== */

const VERIFY = "⚠ verify against the current adopted edition of NFPA 72 and the manufacturer's instructions";

const DEVICES = {
  photoSmoke: {
    id: "photoSmoke",
    name: "Photoelectric smoke detector",
    kind: "alarm",
    icon: "smoke",
    howItWorks:
      "Inside the sensing chamber, an LED fires a beam past a photodiode that normally sees almost no light. When smoke particles enter the chamber they scatter the beam onto the photodiode. When scattered light crosses the alarm threshold, the detector latches into alarm and reports to the panel. Photoelectric technology responds fastest to the large, pale particles of smoldering fires — furniture, wiring, bedding — which is why it dominates commercial installs.",
    preTest: [
      "Confirm the system is on test with the monitoring company and the building is notified.",
      "Bring listed aerosol smoke (canned smoke) or a listed functional test tool — never open flame.",
      "Plan ladder access; detectors are usually on the ceiling. Have a second person spot you where required.",
    ],
    testProcedure: [
      { instruction: "Verify the panel is normal (or in walk-test mode) and the system is on test.", expected: "Panel shows System Normal or Walk Test active; monitoring confirmed on test." },
      { instruction: "Apply listed aerosol smoke into the detector head per the can's instructions (short bursts, correct distance).", expected: "Detector's local LED latches on solid within seconds.", caution: "Over-saturating the chamber with aerosol can leave residue and cause later nuisance alarms." },
      { instruction: "Watch the panel: confirm the alarm annunciates with the correct address (addressable) or zone (conventional).", expected: "Panel enters alarm; display identifies this exact device/zone. A wrong label here is a failed test — fix the programming or the as-builts." },
      { instruction: "Verify notification appliances activate (skip if in walk-test / silent test mode by design).", expected: "Horns/strobes on the associated circuits operate." },
      { instruction: "Clear the smoke from the chamber (fan the detector or wait), then reset the detector and the panel.", expected: "Detector LED returns to normal blink; panel resets to System Normal without re-alarming." },
    ],
    expectedResult:
      "Alarm at the panel with the correct device address or zone, notification appliances (or walk-test indication) operating, and a clean reset once the chamber is clear.",
    commonFaults: [
      { symptom: "Detector alarms at the panel with no smoke (nuisance alarms)", likelyCause: "Dirty chamber — dust and debris scatter light exactly like smoke", check: "Check the sensitivity/percent-obscuration reading at an addressable panel; clean or replace the head per manufacturer." },
      { symptom: "Panel shows the wrong location for the device you tested", likelyCause: "Address set wrong at the head, or panel programming/label mismatch", check: "Compare the device's set address (dials/programming tool) against the panel program and the as-built drawings." },
      { symptom: "No response to aerosol smoke", likelyCause: "Head not seated on its base, wrong device type programmed, or failed sensor", check: "Re-seat the head, confirm the panel sees the device at all (addressable), then functionally retest." },
      { symptom: "Very slow response", likelyCause: "Sensitivity drift or partially blocked chamber insect screen", check: "Run a sensitivity test; NFPA 72 requires detectors to be within their listed sensitivity range." },
    ],
    codeReference:
      "NFPA 72 governs inspection, testing and maintenance of smoke detectors, including functional (smoke-entry) testing and periodic sensitivity testing. Specific frequencies and methods: " + VERIFY + ".",
  },

  heat: {
    id: "heat",
    name: "Heat detector (fixed-temp / rate-of-rise)",
    kind: "alarm",
    icon: "heat",
    howItWorks:
      "A fixed-temperature element operates when the sensing element reaches its rated temperature (commonly a mid-100s °F rating — check the listing on the device). A rate-of-rise element operates when temperature climbs faster than a set rate, using an air chamber with a calibrated vent: fast heating expands the air faster than the vent can bleed it off, flexing a diaphragm and closing the contacts. Many spot detectors combine both. Heat detectors are property-protection devices — slower than smoke detection, but immune to dust, steam and fumes.",
    preTest: [
      "Identify whether each detector is RESTORABLE (can be heat-tested and reused) or NON-RESTORABLE (fusible element — functional heat testing destroys it).",
      "Bring a listed heat-test tool (heat gun / lamp-style tester on a pole). Never use open flame.",
      "Confirm system on test and building notified.",
    ],
    testProcedure: [
      { instruction: "Confirm the detector type: restorable rate-of-rise / electronic fixed-temp vs. non-restorable fusible element.", expected: "Type identified from the device label or drawings.", caution: "Do NOT heat-test non-restorable fixed-temperature detectors — they are tested by replacement or by laboratory sample testing per NFPA 72." },
      { instruction: "For restorable detectors: apply the listed heat source to the element per the tool's instructions.", expected: "Detector operates within the tool manufacturer's stated time window." },
      { instruction: "Confirm the alarm at the panel with the correct address or zone.", expected: "Panel in alarm; display identifies this device/zone." },
      { instruction: "Allow the element to cool, then reset the panel.", expected: "Rate-of-rise elements self-restore after cooling; panel resets clean to System Normal." },
    ],
    expectedResult:
      "Restorable detector operates under the listed heat source, annunciates correctly at the panel, self-restores after cooling, and the panel resets clean.",
    commonFaults: [
      { symptom: "No response to heat test", likelyCause: "Painted-over or damaged element, or open circuit to the device", check: "Inspect the element visually (paint on a heat detector generally means replacement), then check circuit continuity/addressing." },
      { symptom: "Rate-of-rise trips from normal HVAC or door openings", likelyCause: "Detector mounted where rapid but non-fire temperature swings occur (near unit heaters, dock doors)", check: "Review placement against the drawings; relocate or substitute fixed-temperature-only where appropriate." },
      { symptom: "Detector won't restore after test", likelyCause: "Element damaged by overheating during the test, or it was actually a non-restorable type", check: "Verify type; replace the head if the element no longer resets." },
    ],
    codeReference:
      "NFPA 72 covers heat detector testing, including the restorable vs non-restorable distinction and sample-replacement testing of fusible elements. Intervals and sample sizes: " + VERIFY + ".",
  },

  pull: {
    id: "pull",
    name: "Manual pull station",
    kind: "alarm",
    icon: "pull",
    howItWorks:
      "A pull station is a mechanically latching switch. Operating the handle (single-action) or lifting a cover / pushing then pulling (dual-action) closes the alarm contacts and physically latches the handle down so responders can see which station was used. It stays in alarm until someone opens the station with its reset key or tool and re-arms the mechanism — a panel reset alone will not clear it.",
    preTest: [
      "Confirm the system is on test and occupants are notified — a pull station test drives a full alarm unless the panel is in a test mode.",
      "Bring the station reset key/tool (they vary by manufacturer).",
    ],
    testProcedure: [
      { instruction: "Operate the station exactly as an occupant would (lift cover if dual-action, then pull until it latches).", expected: "Handle latches in the down/operated position." },
      { instruction: "Confirm alarm at the panel with the correct address or zone, and notification appliances if applicable.", expected: "Panel in alarm identifying this station; horns/strobes operate (or walk-test indication)." },
      { instruction: "Attempt a panel reset BEFORE resetting the station (do this at least once during the test session).", expected: "Panel fails to clear and re-annunciates the alarm — the station is still latched. This proves the panel can't mask a device left in alarm.", caution: "This is a teaching step: a reset only succeeds after the initiating device is restored." },
      { instruction: "Open the station with its key/tool, re-arm the handle, close it up, then reset the panel.", expected: "Panel resets clean to System Normal." },
    ],
    expectedResult:
      "Station latches mechanically, annunciates at the correct address/zone, resists panel reset until re-armed, then the system resets clean.",
    commonFaults: [
      { symptom: "Handle won't latch or feels gritty", likelyCause: "Worn or damaged mechanism, paint or debris inside", check: "Open the station and inspect; replace if the latch is unreliable — an occupant only gets one chance to use it." },
      { symptom: "Panel resets even though the station is still pulled", likelyCause: "Wiring or programming error — the station isn't actually the device the panel thinks is in alarm", check: "Verify address/zone assignment; trace the circuit." },
      { symptom: "No signal when operated", likelyCause: "Open circuit, failed switch, or device not in the panel program", check: "Check the loop/zone for troubles, confirm the address exists in programming." },
    ],
    codeReference:
      "NFPA 72 requires periodic functional testing of manual fire alarm boxes. Frequency: " + VERIFY + ".",
  },

  duct: {
    id: "duct",
    name: "Duct smoke detector",
    kind: "supervisoryOrAlarm",
    icon: "duct",
    howItWorks:
      "A duct detector samples the air moving through HVAC ductwork. A sampling tube with holes facing upstream and an exhaust tube facing downstream create a pressure differential that pulls a continuous air sample across a smoke sensor in the housing. On smoke, it typically shuts down the associated air handler to stop smoke being pushed through the building, and reports to the fire alarm panel. Depending on the system design it may be programmed as an ALARM or as a SUPERVISORY signal — check the design documents; both are common.",
    preTest: [
      "Confirm with building engineering before testing — a duct detector test can shut down air handlers serving occupied or sensitive areas.",
      "Confirm system on test with monitoring; know whether this detector is programmed alarm or supervisory.",
      "Locate the remote test station / remote indicator if the housing is above hard ceiling.",
    ],
    testProcedure: [
      { instruction: "Verify the air handler is running (a duct detector only samples with airflow).", expected: "Fan on; airflow present at the sampling tube." },
      { instruction: "Introduce listed aerosol smoke at the sampling tube inlet or test port, or use the manufacturer's magnet/remote test feature where permitted for functional checks.", expected: "Detector operates; local/remote indicator lights.", caution: "A magnet test proves the electronics, not smoke entry. Periodic testing must verify actual smoke response per NFPA 72 — don't let magnet tests be the only test ever performed." },
      { instruction: "Confirm the signal at the panel — alarm or supervisory per the system design — with correct identification.", expected: "Panel annunciates the programmed signal type for this exact detector." },
      { instruction: "Verify the fan shutdown (or damper action) the detector is supposed to drive.", expected: "Associated air handler stops / dampers move as designed." },
      { instruction: "Clear the detector, restart the air handler with building engineering, reset the panel.", expected: "Detector restores, fan restarts, panel resets clean." },
    ],
    expectedResult:
      "Detector operates from a sample at the tube, reports the designed signal type at the panel, performs its fan shutdown function, and everything restores cleanly.",
    commonFaults: [
      { symptom: "No response even with heavy test smoke", likelyCause: "Sampling tube installed backwards or holes not facing airflow, or insufficient duct velocity", check: "Pull the tube and check hole orientation vs. the airflow arrow; verify duct velocity is within the detector's listed range." },
      { symptom: "Trouble signal from the detector", likelyCause: "Low/no airflow (fan off, filter loaded) on models that supervise airflow", check: "Confirm fan status and filter condition; check the differential across the tubes." },
      { symptom: "Panel shows alarm where design says supervisory (or vice versa)", likelyCause: "Programming doesn't match the sequence of operations", check: "Compare against the approved sequence/matrix and correct the panel program." },
    ],
    codeReference:
      "NFPA 72 covers duct detector testing including verification of smoke entry into the sensing chamber; associated HVAC shutdown functions must also be verified. Details: " + VERIFY + ".",
  },

  waterflow: {
    id: "waterflow",
    name: "Waterflow switch",
    kind: "alarm",
    icon: "flow",
    howItWorks:
      "A vane-type waterflow switch has a flexible paddle inserted into the sprinkler pipe. When a sprinkler head opens and water moves, the flow deflects the paddle, which drives a switch through a mechanical retard (delay) mechanism. The retard — typically adjustable — exists so momentary pressure surges don't cause false alarms; sustained flow, meaning a real discharge, does. Waterflow is always an ALARM signal: water moving means a head has operated.",
    preTest: [
      "Coordinate with the monitoring company AND building occupants — this test produces a genuine alarm signal.",
      "Locate the inspector's test connection (usually at the hydraulically most remote point) and know where the test water drains.",
      "Have a watch/timer ready to measure signal delay.",
    ],
    testProcedure: [
      { instruction: "Open the inspector's test valve fully (it simulates the flow of one sprinkler head through an orifice).", expected: "Water flows to drain." },
      { instruction: "Time from valve-open to alarm at the panel.", expected: "Alarm annunciates within the retard window. NFPA 72 caps the maximum delay for waterflow alarm initiation — the placeholder here is your programmed/observed value: [verify max delay, commonly 90 seconds or less, against the current edition].", caution: "If the signal takes longer than the permitted maximum, the retard is set too long or the mechanism is sticking — that's a failed test." },
      { instruction: "Confirm the panel identifies the correct riser/zone and that notification appliances operate.", expected: "Correct identification; horns/strobes on." },
      { instruction: "Close the test valve, allow flow to stop, reset the panel.", expected: "Switch restores as the paddle relaxes; panel resets clean." },
    ],
    expectedResult:
      "Sustained test flow produces an alarm within the permitted delay, correctly identified at the panel, restoring cleanly when flow stops.",
    commonFaults: [
      { symptom: "No signal on test flow", likelyCause: "Paddle broken or missing (common after pipe work), switch failed, or retard jammed", check: "Drain and open the fitting to inspect the paddle; replace damaged parts and retest." },
      { symptom: "Signal far too slow", likelyCause: "Retard set near maximum or mechanism gummed up", check: "Adjust retard down per manufacturer and retest with a timer." },
      { symptom: "Intermittent false waterflow alarms", likelyCause: "Retard set too short for the system's pressure surges, or air trapped in the pipe", check: "Review surge sources (pump starts, main fluctuations); adjust retard within listed limits." },
    ],
    codeReference:
      "NFPA 72 covers waterflow alarm testing and the maximum permitted initiation delay; NFPA 25 governs the sprinkler-system side of the same test. Values: " + VERIFY + ".",
  },

  tamper: {
    id: "tamper",
    name: "Valve tamper / supervisory switch",
    kind: "supervisory",
    icon: "tamper",
    howItWorks:
      "A tamper switch monitors the position of a sprinkler control valve. If someone closes the valve — cutting off water to the sprinklers — the switch operates within the first turns of the handwheel and sends a SUPERVISORY signal to the panel. Supervisory is deliberately distinct from alarm: nothing is burning, but the protection system has been impaired and someone must respond. This distinction (alarm vs supervisory vs trouble) is one of the most important concepts on any panel.",
    preTest: [
      "Confirm system on test with monitoring — closing valves generates real off-normal signals.",
      "Get authorization before operating any sprinkler control valve, and plan to fully reopen and re-verify every valve you touch.",
    ],
    testProcedure: [
      { instruction: "Begin closing the monitored valve slowly, counting handwheel revolutions.", expected: "Supervisory signal at the panel within the first two revolutions of the handwheel, or before the valve is one-fifth closed — [verify exact criterion in the current NFPA 72 edition].", caution: "Never leave a control valve closed. Re-open fully and confirm the supervisory restores." },
      { instruction: "Confirm the panel shows SUPERVISORY — not alarm, not trouble — with correct valve identification.", expected: "Yellow/amber supervisory annunciation identifying this valve." },
      { instruction: "Reopen the valve fully (back-off a quarter turn from hard-open per common practice).", expected: "Supervisory restores at the panel automatically or after acknowledge, per panel type." },
    ],
    expectedResult:
      "Supervisory (not alarm) within the first turns of valve closure, correct identification, clean restoration when reopened.",
    commonFaults: [
      { symptom: "Signal comes in as ALARM instead of supervisory", likelyCause: "Switch wired to an alarm zone/point or mis-programmed point type", check: "Correct the point type / circuit assignment — supervisory devices must annunciate as supervisory." },
      { symptom: "Valve nearly fully closed before any signal", likelyCause: "Switch arm out of adjustment on the valve stem", check: "Readjust the switch per manufacturer so it operates within the required early travel." },
      { symptom: "Supervisory won't restore after reopening", likelyCause: "Switch stuck or valve not truly full-open", check: "Verify valve position visually (rise of stem on OS&Y valves), exercise and readjust the switch." },
    ],
    codeReference:
      "NFPA 72 covers supervisory signal-initiating device testing, including how early in valve travel the signal must occur. Criterion: " + VERIFY + ".",
  },

  nac: {
    id: "nac",
    name: "Notification appliances (horn / strobe)",
    kind: "notification",
    icon: "horn",
    howItWorks:
      "Horns, strobes and speaker-strobes live on Notification Appliance Circuits (NACs) driven by the panel or by booster power supplies. Horns produce the evacuation audible (commonly the standardized three-pulse temporal pattern for evacuation); strobes produce synchronized high-intensity flashes rated in candela for occupants who can't hear the audible. The panel supervises NAC wiring for opens and grounds via an end-of-line resistor (Class B) or a return loop (Class A), and reverses circuit polarity to activate the appliances.",
    preTest: [
      "Notify EVERYONE affected — horn/strobe testing is loud and disruptive; coordinate timing with building management.",
      "Confirm system on test with monitoring.",
      "Have the drawings showing appliance locations and candela ratings.",
    ],
    testProcedure: [
      { instruction: "Activate the notification circuits via the panel's drill/test function (or by an initiating device test).", expected: "All appliances on the circuit operate together." },
      { instruction: "Walk the coverage area: verify every appliance operates, strobes flash in sync, and the audible pattern is correct.", expected: "No dead appliances; synchronized strobes; correct evacuation pattern." },
      { instruction: "Verify audibility where required (sound level meter) against the design criteria.", expected: "Sound levels meet the design values — [verify required dBA above ambient for this occupancy against the current NFPA 72 edition]." },
      { instruction: "Silence from the panel and confirm all appliances stop; check the Silenced indication.", expected: "Appliances stop; panel shows signals silenced; alarm LED remains until reset." },
    ],
    expectedResult:
      "Every appliance on the circuit operates with correct pattern, sync and coverage, silences from the panel, and the circuit shows no troubles afterward.",
    commonFaults: [
      { symptom: "Whole NAC dead", likelyCause: "Blown NAC fuse/output, open near the panel, or booster supply failure", check: "Check panel/booster status LEDs and the circuit's supervision trouble; measure voltage at the panel terminals during alarm." },
      { symptom: "Appliances beyond a point don't operate (Class B)", likelyCause: "Open circuit mid-run — supervision current still flows to the break in some fault cases, or a bad splice", check: "Use the trouble indication plus a meter to find the open; the diagram view in this app shows why downstream devices drop." },
      { symptom: "Strobes flashing out of sync", likelyCause: "Missing/incompatible sync module or mixed appliance protocols", check: "Verify sync protocol compatibility across all appliances and boosters on the circuit." },
    ],
    codeReference:
      "NFPA 72 covers notification appliance testing including audibility/visibility verification. Sound level criteria and intervals: " + VERIFY + ".",
  },

  beam: {
    id: "beam",
    name: "Projected beam detector",
    kind: "alarm",
    icon: "beam",
    howItWorks:
      "A beam detector protects large open spaces (atriums, warehouses) by projecting an infrared beam from a transmitter to a receiver (or to a reflector and back). Smoke crossing anywhere along the beam obscures a percentage of the light; when obscuration crosses the alarm threshold the detector alarms. Gradual signal loss (dust on lenses) is compensated automatically up to a limit, then reported as trouble; sudden total blockage is reported as trouble, not alarm — a forklift isn't a fire.",
    preTest: [
      "Bring the manufacturer's calibrated test filter — that's how beam response is verified.",
      "Plan safe access to the units, which are typically mounted high.",
    ],
    testProcedure: [
      { instruction: "Insert the listed test filter into the beam path per the manufacturer's procedure.", expected: "Detector alarms at the calibrated obscuration level." },
      { instruction: "Confirm correct identification at the panel.", expected: "Panel in alarm identifying this beam detector." },
      { instruction: "Fully block the beam and observe the response.", expected: "TROUBLE, not alarm — total blockage is treated as a fault condition." },
      { instruction: "Remove filter/blockage and reset.", expected: "Detector restores; panel resets clean." },
    ],
    expectedResult:
      "Alarm at the calibrated filter value, trouble on full blockage, correct identification, clean restore.",
    commonFaults: [
      { symptom: "Recurring trouble signals", likelyCause: "Building movement or vibration shifting alignment, or dirty lenses at the compensation limit", check: "Check alignment readout / signal strength; clean lenses; re-aim per manufacturer." },
      { symptom: "Nuisance alarms in sunlight", likelyCause: "Sunlight or reflections interfering at certain times of day", check: "Review orientation vs. glazing; add shrouds or relocate per manufacturer guidance." },
    ],
    codeReference:
      "NFPA 72 covers projected beam smoke detector testing using the manufacturer's filter method. Frequency: " + VERIFY + ".",
  },

  aspirating: {
    id: "aspirating",
    name: "Aspirating smoke detection (air-sampling)",
    kind: "alarm",
    icon: "asd",
    howItWorks:
      "An aspirating system continuously draws air through a network of small-bore sampling pipes with drilled holes, into a central detector with a high-sensitivity sensing chamber (often laser-based). Because it actively samples and detects at very low obscuration levels, it provides very early warning — common in data centers, cold storage and heritage spaces. The unit supervises its own airflow: a blocked pipe or failed fan raises an airflow fault (trouble), and multiple alarm thresholds (alert / action / fire) can be mapped to panel signals.",
    preTest: [
      "Get the system's commissioning data: pipe layout, transport times, threshold settings.",
      "Confirm which threshold maps to the panel alarm you're testing.",
    ],
    testProcedure: [
      { instruction: "Introduce test smoke at the most remote sampling hole on the pipe run.", expected: "Detector responds within the commissioned maximum transport time — [verify the permitted transport time for this class of system]." },
      { instruction: "Confirm the mapped signal at the fire alarm panel.", expected: "Panel annunciates the programmed signal for this detector/threshold." },
      { instruction: "Verify the airflow supervision: partially block a sampling point or use the unit's test function.", expected: "Airflow fault (trouble) reported after the unit's delay — restores when cleared." },
      { instruction: "Purge/clear, confirm the unit returns to normal, reset the panel.", expected: "Clean restore at unit and panel." },
    ],
    expectedResult:
      "Response from the most remote hole within transport time, correct mapped signal at the panel, working airflow supervision, clean restore.",
    commonFaults: [
      { symptom: "Airflow fault", likelyCause: "Blocked sampling holes or pipe, dirty filter, failed aspirator fan", check: "Check the unit's airflow readout per pipe; clean/blow out the pipe network per manufacturer; replace filter." },
      { symptom: "Slow response from far end of pipe", likelyCause: "Transport time out of spec — pipe network modified since commissioning", check: "Re-verify transport time against commissioning data; recalculate the pipe design if it was altered." },
    ],
    codeReference:
      "NFPA 72 covers air-sampling detector testing including transport-time verification from the most remote port. Values: " + VERIFY + ".",
  },
};

/* ---------- System-level topics ---------- */

const TOPICS = {
  onTest: {
    id: "onTest",
    name: "Placing the system on test / notifying monitoring",
    howItWorks:
      "Before you activate anything, the outside world must know. A monitored system reports alarms to a central station that will dispatch the fire department. Calling the monitoring company and placing the account 'on test' for a stated window means signals are logged but not dispatched. Just as important: the people in the building. Horns and strobes going off unannounced cause evacuations, panic, and work stoppages — and a building that learns to ignore its alarm system is a building in danger.",
    preTest: [],
    testProcedure: [
      { instruction: "Call the monitoring company with the account number; place the system on test for a defined window with your name and callback number.", expected: "Central station confirms on-test status and the end time." },
      { instruction: "Notify building management/occupants of the test window and what they'll hear; account for anyone alarms could endanger or disrupt (patients, shift workers, sensitive processes).", expected: "Affected people informed; any required accommodations arranged." },
      { instruction: "Notify the AHJ / fire department if local procedure requires it for this occupancy.", expected: "Notification made where required." },
      { instruction: "At the end of testing: take the system OFF test, confirm with the central station that expected signals were received, and verify the panel is normal.", expected: "Central station confirms signals received and account restored to full service; panel shows System Normal.", caution: "Never leave a site with the account still on test or the panel off-normal — the building would be unprotected." },
    ],
    expectedResult: "Every signal you generate is expected, logged, and dispatched to no one; the system returns to full service when you leave.",
    commonFaults: [
      { symptom: "Central station reports no signal received for a device that alarmed locally", likelyCause: "Communicator trouble, path failure, or the point isn't mapped for transmission", check: "Check communicator status at the panel; verify both transmission paths where dual-path is used." },
    ],
    codeReference: "NFPA 72 addresses supervising station communications and requires ITM to be coordinated to avoid unwanted alarms. Details: " + VERIFY + ".",
  },

  ackSilenceReset: {
    id: "ackSilenceReset",
    name: "Acknowledge — Silence — Reset sequence",
    howItWorks:
      "The three-button ritual of every panel. ACKNOWLEDGE tells the panel a human has seen the event: it quiets the panel's internal buzzer and steadies the flashing LED, but changes nothing in the field. SILENCE turns off the notification appliances (horns/strobes) while leaving the alarm condition latched — the alarm LED stays on and the display still shows the event. RESET attempts to return the system to normal — and it only succeeds if the initiating condition is actually gone. A smoke detector still full of smoke, or a pull station still latched, immediately re-alarms the panel. This is by design: a panel must never be able to hide an active alarm.",
    preTest: [],
    testProcedure: [
      { instruction: "With an alarm active, press ACKNOWLEDGE.", expected: "Internal buzzer stops; alarm LED goes from flashing to steady; event remains displayed. Nothing changes in the building." },
      { instruction: "Press SILENCE (ALARM SILENCE).", expected: "Horns/strobes stop (strobes may continue on some systems by design); SILENCED indicator lights; alarm LED remains on." },
      { instruction: "Press RESET while the initiating device is still active.", expected: "Panel attempts reset, then RE-ALARMS — it re-annunciates the device that's still off-normal.", caution: "If a panel resets clean while a device is still latched in alarm, that's a serious finding — investigate immediately." },
      { instruction: "Restore the initiating device (clear smoke / re-arm the pull station), then press RESET.", expected: "Panel returns to System Normal." },
    ],
    expectedResult: "Acknowledge quiets the panel, silence quiets the building, reset succeeds only on a truly restored system.",
    commonFaults: [
      { symptom: "Horns restart after being silenced", likelyCause: "A NEW alarm event occurred — resound on subsequent alarm is required behavior", check: "Read the display/history: a second device alarmed after silence. That's the system working correctly." },
    ],
    codeReference: "NFPA 72 defines alarm signal deactivation and re-sound behavior. Details: " + VERIFY + ".",
  },

  walkTest: {
    id: "walkTest",
    name: "Walk test / one-person test mode",
    howItWorks:
      "Walk test is a panel mode built for a lone technician. With walk test enabled (usually per loop or zone), activating a device produces a brief, local confirmation — a short chirp of the NACs, a momentary annunciation, or a silent log entry — and the panel automatically restores instead of latching into full alarm. Every activation is written to the event history, so at the end you read the log and verify every device you exercised actually reported. Silent walk test does the same with no NAC activation at all — essential in occupied buildings.",
    preTest: [],
    testProcedure: [
      { instruction: "Place the panel in walk test (audible or silent) for the loop/zone under test — monitoring is still notified first.", expected: "Panel indicates test mode active; a trouble/test indication is normal while enabled." },
      { instruction: "Activate devices one by one through the area.", expected: "Each activation gives a brief local indication and auto-restores; each is logged with its address/zone." },
      { instruction: "Return to the panel, exit walk test, and read the event history.", expected: "One log entry per device tested — any device you activated that ISN'T in the log failed the test.", caution: "Walk test modes time out and exit automatically on many panels; know your panel's timeout so you don't lose test mode mid-building." },
    ],
    expectedResult: "Every activated device appears in the log; the system never entered full alarm; panel restored to normal service afterward.",
    commonFaults: [
      { symptom: "A tested device is missing from the log", likelyCause: "Device failed, wrong address, or it's on a loop not included in the walk test group", check: "Retest that device with a partner watching the panel live." },
    ],
    codeReference: "Walk/one-person test features are manufacturer-specific; NFPA 72 permits testing methods that verify each device's function. Panel specifics: " + VERIFY + ".",
  },

  troubleSupervisory: {
    id: "troubleSupervisory",
    name: "Trouble & supervisory conditions",
    howItWorks:
      "Panels annunciate three distinct off-normal categories, and mixing them up is the classic newcomer mistake. ALARM (red) = fire signal: evacuate/dispatch. SUPERVISORY (yellow, distinct tone) = a protection system is impaired but nothing is burning: a closed sprinkler valve, a duct detector (in some designs), low air pressure on a dry system. TROUBLE (yellow/amber) = the fire alarm system itself has a fault: open circuit, ground fault, low battery, communicator failure. Trouble means the system may not be able to do its job; supervisory means a system it monitors can't do its job. Both demand investigation, neither is 'just ignore it'.",
    preTest: [],
    testProcedure: [
      { instruction: "Create an open circuit (lift a wire at a device or EOL under supervision — on a test system only).", expected: "TROUBLE at the panel: amber LED, buzzer, display shows the circuit/point. Devices beyond the open on a Class B circuit are out of service." },
      { instruction: "Create a ground fault (short one leg to ground on a test rig).", expected: "Ground fault TROUBLE annunciates; on most panels a single ground does not disable the circuit — but a second fault could, which is why grounds get fixed immediately." },
      { instruction: "Operate a supervisory device (valve tamper).", expected: "SUPERVISORY annunciation — visually and audibly distinct from both alarm and trouble." },
      { instruction: "Restore each condition and confirm the panel returns to normal.", expected: "Troubles auto-restore when the fault clears (after acknowledge on some panels); supervisory restores when the device restores." },
    ],
    expectedResult: "Each category annunciates distinctly, identifies its source, and restores when the condition clears.",
    commonFaults: [
      { symptom: "Chronic trouble that comes and goes with weather", likelyCause: "Moisture intrusion causing intermittent ground fault", check: "Meg the circuits; inspect exterior devices, junction boxes and conduit for water." },
      { symptom: "Trouble LED on but display shows nothing obvious", likelyCause: "Event scrolled off or is in a queue — panels queue multiple events by priority", check: "Scroll the display / read the history; alarms display before supervisories before troubles." },
    ],
    codeReference: "NFPA 72 defines alarm, supervisory and trouble signals and requires they be distinctly different. Details: " + VERIFY + ".",
  },

  wiringClasses: {
    id: "wiringClasses",
    name: "Class A vs Class B vs Class X supervision",
    howItWorks:
      "Circuit class describes what happens when the wiring itself fails. CLASS B is a single path from the panel out to an end-of-line (EOL) device; the panel supervises by watching current through the EOL. An open anywhere means everything past the break stops working — the panel knows (trouble) but can't fix it. CLASS A routes the circuit back to the panel on a separate return path: on an open, the panel feeds the circuit from BOTH ends, so every device keeps operating through a single open. CLASS X (addressable loops) adds short-circuit isolator modules around the loop: a wire-to-wire short — which would take down an entire Class A loop — is confined to the segment between the two nearest isolators. More letters, more copper, more resilience.",
    preTest: [],
    testProcedure: [
      { instruction: "On the diagram view of this app, inject an OPEN on a Class B circuit.", expected: "Trouble at the panel; devices downstream of the break drop out." },
      { instruction: "Inject an OPEN on a Class A loop.", expected: "Trouble at the panel; ZERO devices lost — the loop feeds from both ends." },
      { instruction: "Inject a SHORT on a Class A loop, then on a Class X loop.", expected: "Class A: the whole loop is disabled. Class X: only devices between the two isolators flanking the short are lost." },
    ],
    expectedResult: "You can predict, for any class and any single fault, exactly which devices survive.",
    commonFaults: [
      { symptom: "Class A loop wired out and back in the same cable/conduit", likelyCause: "Installation error — a single physical event can sever both paths, defeating Class A", check: "Verify outgoing and return paths are physically separated per the design and code." },
      { symptom: "EOL resistor found at the panel instead of the last device (Class B)", likelyCause: "Shortcut install — the field wiring is now unsupervised", check: "The EOL must be at the electrical end of the circuit; relocate it and verify supervision by lifting a wire at the far end." },
    ],
    codeReference: "NFPA 72 defines circuit classes (Class A, B, N, X) and their performance under fault conditions. Definitions: " + VERIFY + ".",
  },
};

/* ---------- configurator option lists ---------- */

const DEVICE_OPTIONS = [
  { id: "photoSmoke", label: "Smoke detectors (photoelectric)" },
  { id: "heat", label: "Heat detectors (fixed / rate-of-rise)" },
  { id: "pull", label: "Manual pull stations" },
  { id: "duct", label: "Duct smoke detectors" },
  { id: "waterflow", label: "Waterflow switches" },
  { id: "tamper", label: "Tamper / supervisory switches" },
  { id: "nac", label: "Notification appliances (horn/strobe)" },
  { id: "beam", label: "Beam detectors" },
  { id: "aspirating", label: "Aspirating / air-sampling (VESDA-type)" },
];

const BUILDING_TYPES = ["Office", "Healthcare", "Residential / multi-family", "Warehouse", "School"];

const DEFAULT_CONFIG = {
  family: "fireAlarm",
  panelType: "addressable",
  wiringClass: "B",
  devices: ["photoSmoke", "pull", "waterflow", "tamper", "nac"],
  monitoring: "central",
  buildingType: "Office",
  zones: 4,
  complete: false,
};

/* =====================================================================
   STYLES — industrial spec-sheet look, custom CSS (no framework deps)
   ===================================================================== */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

:root{
  --paper:#f1efe9; --card:#ffffff; --ink:#1c1e22; --ink2:#4c525b;
  --line:#d8d4c9; --line2:#b9b4a6;
  --red:#c8102e; --red-dk:#9d0b23; --amber:#b97e0a; --amber-bg:#fdf3dd;
  --yellow:#e8b90f; --green:#1e7a3c; --steel:#33566b; --steel-lt:#e3ebf0;
  --panel-face:#d9d2bf; --panel-edge:#b7ae95; --bezel:#2a2c30;
  --lcd-bg:#3a3f1e; --lcd-tx:#ffce54;
}
*{box-sizing:border-box; margin:0; padding:0;}
.fat-app{min-height:100vh; background:var(--paper); color:var(--ink);
  font-family:'IBM Plex Sans',system-ui,sans-serif; font-size:15px; line-height:1.55;
  background-image:linear-gradient(0deg, rgba(28,30,34,0.025) 1px, transparent 1px);
  background-size:100% 28px;}
.fat-app h1,.fat-app h2,.fat-app h3,.fat-app h4{font-family:'Barlow Condensed',sans-serif; letter-spacing:.02em;}
.mono{font-family:'IBM Plex Mono',monospace;}

/* top chrome */
.masthead{background:var(--ink); color:#f3f1ea; border-bottom:4px solid var(--red);}
.masthead-in{max-width:1180px; margin:0 auto; padding:14px 20px 10px; display:flex; flex-wrap:wrap; align-items:baseline; gap:8px 18px;}
.masthead h1{font-size:26px; font-weight:700; text-transform:uppercase; letter-spacing:.06em;}
.masthead h1 .red{color:#ff5a5a;}
.masthead .sub{font-size:12px; color:#b8bcc4; text-transform:uppercase; letter-spacing:.14em;}
.cfg-chip{margin-left:auto; font-size:12px; background:#2c2f35; border:1px solid #4a4e57; border-radius:3px; padding:4px 10px; color:#d8dbe1;}
.cfg-chip b{color:#ffd479;}

.nav{background:#26282d; position:sticky; top:0; z-index:40; border-bottom:1px solid #000;}
.nav-in{max-width:1180px; margin:0 auto; padding:0 12px; display:flex; overflow-x:auto;}
.nav button{appearance:none; background:none; border:none; cursor:pointer; color:#b7bbc3;
  font-family:'Barlow Condensed',sans-serif; font-size:16px; font-weight:600; text-transform:uppercase;
  letter-spacing:.09em; padding:13px 18px 11px; border-bottom:3px solid transparent; white-space:nowrap;}
.nav button:hover{color:#fff;}
.nav button.on{color:#fff; border-bottom-color:var(--red);}
.nav button:focus-visible{outline:2px solid #ffd479; outline-offset:-2px;}
.nav .step-arrow{color:#5a5e66; align-self:center; font-size:12px; padding:0 2px;}

.wrap{max-width:1180px; margin:0 auto; padding:26px 20px 80px;}

.disclaimer{background:var(--amber-bg); border:1px solid #e5c874; border-left:5px solid var(--amber);
  padding:10px 14px; font-size:13px; color:#5b4708; margin-bottom:24px; border-radius:2px;}
.disclaimer b{text-transform:uppercase; letter-spacing:.05em;}

.eyebrow{font-family:'Barlow Condensed',sans-serif; text-transform:uppercase; letter-spacing:.16em;
  font-size:13px; font-weight:600; color:var(--red); margin-bottom:4px;}
.page-title{font-size:34px; font-weight:700; text-transform:uppercase; margin-bottom:6px;}
.page-lede{color:var(--ink2); max-width:70ch; margin-bottom:22px;}

.card{background:var(--card); border:1px solid var(--line); border-radius:4px; padding:18px 20px; box-shadow:0 1px 0 rgba(28,30,34,.05);}
.grid2{display:grid; grid-template-columns:1fr 1fr; gap:18px;}
@media(max-width:860px){.grid2{grid-template-columns:1fr;}}

.btn{appearance:none; cursor:pointer; font-family:'Barlow Condensed',sans-serif; font-weight:600;
  text-transform:uppercase; letter-spacing:.08em; font-size:15px; border-radius:3px;
  padding:10px 20px; border:1px solid var(--ink); background:var(--ink); color:#fff; transition:background .12s;}
.btn:hover{background:#33363c;}
.btn.red{background:var(--red); border-color:var(--red-dk);}
.btn.red:hover{background:var(--red-dk);}
.btn.ghost{background:transparent; color:var(--ink);}
.btn.ghost:hover{background:rgba(28,30,34,.06);}
.btn:disabled{opacity:.4; cursor:not-allowed;}
.btn:focus-visible{outline:2px solid var(--steel); outline-offset:2px;}

/* quick start */
.quickstart{background:var(--card); border:2px solid var(--green); border-radius:5px; padding:18px 20px; box-shadow:0 2px 0 rgba(30,122,60,.25);}
.qs-head{display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:6px;}
.qs-flag{font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:12px; text-transform:uppercase; letter-spacing:.12em; background:var(--green); color:#fff; padding:4px 10px; border-radius:2px;}
.qs-head h3{font-size:21px; text-transform:uppercase; letter-spacing:.02em;}
.qs-desc{font-size:14px; color:var(--ink2); max-width:72ch;}
.qs-actions{display:flex; gap:10px; flex-wrap:wrap;}
.or-rule{display:flex; align-items:center; gap:14px; margin:26px 0 16px; color:var(--ink2);}
.or-rule:before,.or-rule:after{content:""; flex:1; height:1px; background:var(--line2);}
.or-rule span{font-family:'Barlow Condensed',sans-serif; font-weight:600; font-size:14px; text-transform:uppercase; letter-spacing:.12em;}

/* configurator */
.wizard{max-width:760px;}
.wiz-steps{display:flex; gap:0; margin-bottom:18px; border:1px solid var(--line); border-radius:3px; overflow:hidden; background:var(--card);}
.wiz-steps div{flex:1; text-align:center; font-family:'Barlow Condensed',sans-serif; font-size:13px; font-weight:600;
  text-transform:uppercase; letter-spacing:.06em; padding:8px 4px; color:#9aa0a9; border-right:1px solid var(--line);}
.wiz-steps div:last-child{border-right:none;}
.wiz-steps div.done{color:var(--green);}
.wiz-steps div.now{background:var(--ink); color:#fff;}
.choice-row{display:grid; gap:10px; margin:14px 0;}
.choice{display:flex; gap:12px; align-items:flex-start; text-align:left; cursor:pointer; background:var(--card);
  border:2px solid var(--line); border-radius:4px; padding:13px 15px; font:inherit; width:100%;}
.choice:hover{border-color:var(--line2);}
.choice.on{border-color:var(--red); background:#fff8f6; box-shadow:inset 0 0 0 1px var(--red);}
.choice .tick{flex:0 0 20px; height:20px; border:2px solid var(--line2); border-radius:50%; margin-top:2px; position:relative;}
.choice.multi .tick{border-radius:3px;}
.choice.on .tick{border-color:var(--red); background:var(--red);}
.choice.on .tick:after{content:""; position:absolute; inset:3px; background:#fff; border-radius:inherit; clip-path:polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);}
.choice b{display:block; font-size:15px;}
.choice span{display:block; font-size:13px; color:var(--ink2); margin-top:2px;}
.field label{display:block; font-family:'Barlow Condensed',sans-serif; font-weight:600; text-transform:uppercase; letter-spacing:.07em; font-size:14px; margin:14px 0 6px;}
.field select,.field input{font:inherit; padding:9px 12px; border:1px solid var(--line2); border-radius:3px; background:#fff; width:100%; max-width:340px;}
.wiz-foot{display:flex; gap:10px; margin-top:22px; align-items:center;}
.wiz-foot .spacer{flex:1;}

/* summary strip */
.sumstrip{display:flex; flex-wrap:wrap; gap:8px; margin:10px 0 22px;}
.sumstrip span{font-size:12px; font-family:'IBM Plex Mono',monospace; background:var(--steel-lt); color:var(--steel);
  border:1px solid #c3d2db; padding:3px 9px; border-radius:2px;}

/* learn cards */
.topic-card{background:var(--card); border:1px solid var(--line); border-radius:4px; margin-bottom:16px; overflow:hidden;}
.topic-head{width:100%; text-align:left; background:none; border:none; cursor:pointer; display:flex; align-items:center; gap:14px; padding:15px 18px; font:inherit;}
.topic-head:hover{background:#faf9f5;}
.topic-head .tname{font-family:'Barlow Condensed',sans-serif; font-size:20px; font-weight:600; text-transform:uppercase; letter-spacing:.03em;}
.topic-head .tkind{margin-left:auto; font-size:11px; text-transform:uppercase; letter-spacing:.1em; padding:3px 8px; border-radius:2px; border:1px solid;}
.tkind.alarm{color:var(--red); border-color:#e8b3bc; background:#fdf1f3;}
.tkind.supervisory{color:var(--amber); border-color:#ecd08e; background:var(--amber-bg);}
.tkind.notification{color:var(--steel); border-color:#bccfda; background:var(--steel-lt);}
.tkind.system{color:#3a3f47; border-color:#c9ccd2; background:#eef0f2;}
.topic-body{padding:2px 20px 18px; border-top:1px solid var(--line);}
.topic-body h4{font-size:14px; text-transform:uppercase; letter-spacing:.1em; color:var(--red); margin:16px 0 6px;}
.topic-body p{max-width:78ch;}
.steps li{margin:8px 0 8px 18px; max-width:75ch;}
.steps .exp{display:block; font-size:13.5px; color:var(--green); margin-top:2px;}
.steps .exp b{text-transform:uppercase; letter-spacing:.06em; font-size:11px;}
.steps .cau{display:block; font-size:13.5px; color:#8a6206; background:var(--amber-bg); border-left:3px solid var(--amber); padding:5px 9px; margin-top:5px; border-radius:2px;}
.faults{width:100%; border-collapse:collapse; font-size:13.5px; margin-top:4px;}
.faults th{font-family:'Barlow Condensed',sans-serif; text-transform:uppercase; letter-spacing:.07em; font-size:12.5px; text-align:left; color:var(--ink2); border-bottom:2px solid var(--ink); padding:6px 10px 6px 0;}
.faults td{border-bottom:1px solid var(--line); padding:8px 10px 8px 0; vertical-align:top;}
.coderef{font-size:13px; background:var(--steel-lt); border:1px solid #c3d2db; border-radius:3px; padding:9px 12px; color:var(--steel); margin-top:14px; max-width:80ch;}

/* checklist */
.pretest-banner{background:var(--red); color:#fff; border-radius:4px; padding:14px 18px; margin-bottom:18px;}
.pretest-banner h3{font-size:19px; text-transform:uppercase; letter-spacing:.06em; margin-bottom:4px;}
.pretest-banner p{font-size:13.5px; color:#ffd9de; max-width:90ch;}
.prog{position:sticky; top:47px; z-index:30; background:var(--card); border:1px solid var(--line); border-radius:4px; padding:10px 16px; display:flex; align-items:center; gap:14px; margin-bottom:18px; box-shadow:0 2px 6px rgba(28,30,34,.08);}
.prog .bar{flex:1; height:10px; background:#e6e3d9; border-radius:5px; overflow:hidden;}
.prog .fill{height:100%; background:var(--green); transition:width .25s;}
.prog .num{font-family:'IBM Plex Mono',monospace; font-size:13px; white-space:nowrap;}
.ck-group{margin-bottom:22px;}
.ck-group h3{font-size:21px; text-transform:uppercase; letter-spacing:.03em; margin-bottom:8px; border-bottom:2px solid var(--ink); padding-bottom:4px;}
.ck-item{display:flex; gap:12px; background:var(--card); border:1px solid var(--line); border-radius:4px; padding:12px 14px; margin-bottom:8px; cursor:pointer;}
.ck-item:hover{border-color:var(--line2);}
.ck-item.done{background:#f2f7f1; border-color:#bcd6bd;}
.ck-item.done .ins{text-decoration:line-through; color:#6d7a6d;}
.ck-box{flex:0 0 22px; height:22px; border:2px solid var(--line2); border-radius:3px; margin-top:1px; position:relative; background:#fff;}
.ck-item.done .ck-box{background:var(--green); border-color:var(--green);}
.ck-item.done .ck-box:after{content:""; position:absolute; inset:4px; background:#fff; clip-path:polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);}

/* simulator */
.sim-layout{display:grid; grid-template-columns:minmax(0,1.35fr) minmax(0,1fr); gap:20px; align-items:start;}
@media(max-width:980px){.sim-layout{grid-template-columns:1fr;}}
.facp{background:linear-gradient(175deg,#e2dccb, var(--panel-face) 30%, #cfc7b0); border:1px solid var(--panel-edge);
  border-radius:8px; padding:16px; box-shadow:0 3px 0 #a79d82, 0 10px 24px rgba(28,30,34,.22); user-select:none;}
.facp-title{display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;}
.facp-title .nm{font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:17px; letter-spacing:.14em; text-transform:uppercase; color:#5a533f;}
.facp-title .mdl{font-family:'IBM Plex Mono',monospace; font-size:11px; color:#867d63;}
.facp-main{display:grid; grid-template-columns:1fr 118px; gap:14px;}
@media(max-width:480px){.facp-main{grid-template-columns:1fr;}}
.lcd-bezel{background:var(--bezel); border-radius:5px; padding:10px 12px; box-shadow:inset 0 2px 6px rgba(0,0,0,.6);}
.lcd{background:var(--lcd-bg); border-radius:3px; padding:10px 12px; box-shadow:inset 0 0 14px rgba(0,0,0,.55);}
.lcd pre{font-family:'IBM Plex Mono',monospace; font-size:14px; line-height:1.5; color:var(--lcd-tx);
  text-shadow:0 0 6px rgba(255,206,84,.55); white-space:pre; overflow-x:auto; margin:0;}
.piezo{margin-top:8px; display:flex; align-items:center; gap:8px; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#9a9077;}
.piezo .dot{width:10px; height:10px; border-radius:50%; background:#7d7458;}
.piezo.on .dot{background:#ff4444; animation:blink .5s steps(1) infinite;}
.piezo.on{color:#8a2d2d;}
.leds{background:#cbc2a9; border:1px solid var(--panel-edge); border-radius:5px; padding:10px 10px; display:flex; flex-direction:column; gap:9px;}
.led-row{display:flex; align-items:center; gap:8px;}
.led{width:13px; height:13px; border-radius:50%; background:#6e6852; box-shadow:inset 0 1px 2px rgba(0,0,0,.5); flex:0 0 13px;}
.led.on.red{background:#ff2020; box-shadow:0 0 8px 2px rgba(255,40,40,.7);}
.led.on.amber{background:#ffb020; box-shadow:0 0 8px 2px rgba(255,180,40,.7);}
.led.on.green{background:#37e05a; box-shadow:0 0 8px 2px rgba(60,230,100,.65);}
.led.flash{animation:blink .6s steps(1) infinite;}
@keyframes blink{50%{filter:brightness(.25); box-shadow:none;}}
.led-row span{font-family:'Barlow Condensed',sans-serif; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:.05em; color:#4d4733;}
.facp-keys{margin-top:14px; display:grid; grid-template-columns:repeat(3,1fr); gap:8px;}
@media(min-width:560px){.facp-keys{grid-template-columns:repeat(6,1fr);}}
.fkey{appearance:none; cursor:pointer; border:1px solid #8f8669; border-bottom-width:3px; border-radius:4px;
  background:linear-gradient(#fbf8ef,#e8e2cf); color:#3c3826; font-family:'Barlow Condensed',sans-serif;
  font-weight:600; font-size:13px; text-transform:uppercase; letter-spacing:.04em; padding:11px 4px 9px;}
.fkey:active{transform:translateY(1px); border-bottom-width:2px;}
.fkey.armed{background:linear-gradient(#ffe3e3,#f6bcbc); border-color:#a55; color:#7a1420;}
.fkey:focus-visible{outline:2px solid var(--steel); outline-offset:2px;}
.fkey:disabled{opacity:.45; cursor:not-allowed;}
.walk-tag{margin-top:10px; font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:#5c5540; display:flex; gap:10px; flex-wrap:wrap;}
.walk-tag .on{color:#146428; font-weight:600;}

.sim-side .card{margin-bottom:16px;}
.sim-side h3{font-size:18px; text-transform:uppercase; letter-spacing:.04em; margin-bottom:8px;}
.scn{display:flex; flex-wrap:wrap; gap:8px;}
.scn button{appearance:none; cursor:pointer; font:inherit; font-size:13px; background:#fff; border:1px solid var(--line2); border-radius:3px; padding:7px 11px;}
.scn button:hover{border-color:var(--ink); background:#faf9f5;}
.scn button.danger{border-color:#e0a4ae; color:var(--red);}
.scn button.danger:hover{border-color:var(--red); background:#fdf1f3;}
.dev-act{display:grid; grid-template-columns:1fr auto; gap:6px 10px; align-items:center; font-size:13.5px;}
.dev-act .st{font-family:'IBM Plex Mono',monospace; font-size:11px;}
.dev-act .st.active{color:var(--red); font-weight:600;}
.elog{max-height:300px; overflow-y:auto; background:#17181b; border-radius:4px; padding:10px 12px;}
.elog div{font-family:'IBM Plex Mono',monospace; font-size:12px; line-height:1.7; color:#b9bec7; white-space:pre-wrap;}
.elog .A{color:#ff7b7b;} .elog .T{color:#ffce54;} .elog .S{color:#ffe08a;} .elog .W{color:#8fd6ff;} .elog .N{color:#8fe3a1;}
.teach{background:var(--steel-lt); border-left:4px solid var(--steel); border-radius:2px; padding:10px 13px; font-size:13.5px; color:#25404f; margin-top:12px;}
.teach b{text-transform:uppercase; letter-spacing:.06em; font-size:12px;}

/* field device wall */
.dev-wall{margin-top:16px; background:var(--card); border:1px solid var(--line); border-radius:4px; padding:14px 16px;}
.dev-wall h3{font-size:18px; text-transform:uppercase; letter-spacing:.04em; margin-bottom:2px; font-family:'Barlow Condensed',sans-serif;}
.dw-hint{font-size:12.5px; color:var(--ink2); margin-bottom:12px;}
.dw-grid{display:grid; grid-template-columns:repeat(auto-fill,minmax(102px,1fr)); gap:10px;}
.dev-tile{appearance:none; font:inherit; background:#faf9f5; border:1px solid var(--line); border-radius:6px;
  padding:10px 4px 8px; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:5px;
  transition:border-color .12s, box-shadow .12s, background .12s;}
.dev-tile:hover{border-color:var(--ink); background:#fff;}
.dev-tile:focus-visible{outline:2px solid var(--steel); outline-offset:2px;}
.dev-tile.active{border-color:var(--red); background:#fdf1f3; box-shadow:0 0 0 1px var(--red);}
.dev-tile.supv.active{border-color:var(--amber); background:var(--amber-bg); box-shadow:0 0 0 1px var(--amber);}
.dev-tile.latched{border-color:#d9ab10; background:#fdf8e3;}
.dev-tile.ping{border-color:var(--green); box-shadow:0 0 0 2px rgba(30,122,60,.45); background:#f2f7f1;}
.dev-tile.output{cursor:default;}
.dev-tile.output:hover{border-color:var(--line); background:#faf9f5;}
.dev-tile.output.active:hover{border-color:var(--red); background:#fdf1f3;}
.dev-tile .nm{font-family:'Barlow Condensed',sans-serif; font-weight:600; font-size:12px; text-transform:uppercase;
  letter-spacing:.04em; text-align:center; line-height:1.15; color:var(--ink);}
.dev-tile .stt{font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.02em; color:#9aa0a9; text-align:center;}
.stt.red{color:var(--red); font-weight:600;} .stt.amb{color:var(--amber); font-weight:600;} .stt.grn{color:var(--green); font-weight:600;}
@keyframes strobeflash{0%,82%{opacity:.18;} 84%,100%{opacity:1;}}
.strobe-on{animation:strobeflash .75s linear infinite;}
@keyframes hornwave{0%{opacity:0;} 30%{opacity:1;} 100%{opacity:0;}}
.horn-wave{animation:hornwave .75s linear infinite;}
@media (prefers-reduced-motion: reduce){.strobe-on,.horn-wave{animation:none; opacity:1;}}

/* diagram */
.dia-tools{display:flex; flex-wrap:wrap; gap:10px 18px; align-items:center; margin-bottom:14px;}
.dia-tools .lbl{font-family:'Barlow Condensed',sans-serif; font-weight:600; text-transform:uppercase; letter-spacing:.07em; font-size:13px; color:var(--ink2);}
.seg-btns{display:flex; gap:6px; flex-wrap:wrap;}
.seg-btns button{appearance:none; cursor:pointer; font:inherit; font-size:13px; padding:6px 12px; border:1px solid var(--line2); background:#fff; border-radius:3px;}
.seg-btns button.on{background:var(--ink); color:#fff; border-color:var(--ink);}
.dia-svg{width:100%; height:auto; background:var(--card); border:1px solid var(--line); border-radius:4px;}
.dia-note{margin-top:12px;}
.dev-node{cursor:pointer;}
.dev-node:hover .dev-body{stroke:var(--ink); stroke-width:2.5;}
.modal-scrim{position:fixed; inset:0; background:rgba(20,21,24,.55); z-index:60; display:flex; align-items:flex-start; justify-content:center; padding:40px 16px; overflow-y:auto;}
.modal{background:var(--paper); border-radius:6px; max-width:820px; width:100%; padding:22px 24px; box-shadow:0 20px 50px rgba(0,0,0,.4);}
.modal-x{float:right; appearance:none; border:1px solid var(--line2); background:#fff; border-radius:3px; cursor:pointer; font-size:14px; padding:4px 12px;}

/* reference */
.ref-search{width:100%; max-width:460px; font:inherit; font-size:15px; padding:11px 14px; border:1px solid var(--line2); border-radius:3px; margin-bottom:6px;}
.ref-filters{display:flex; gap:8px; flex-wrap:wrap; margin:10px 0 18px;}
.ref-filters button{appearance:none; cursor:pointer; font:inherit; font-size:13px; padding:6px 13px; border-radius:20px; border:1px solid var(--line2); background:#fff;}
.ref-filters button.on{background:var(--ink); color:#fff; border-color:var(--ink);}
.empty{color:var(--ink2); font-style:italic; padding:20px 0;}

@media (prefers-reduced-motion: reduce){
  .led.flash,.piezo.on .dot{animation:none;}
  *{transition:none !important;}
}
`;

/* =====================================================================
   SMALL SHARED PIECES
   ===================================================================== */

const KIND_LABEL = {
  alarm: "Initiating · Alarm",
  supervisory: "Initiating · Supervisory",
  supervisoryOrAlarm: "Alarm or Supervisory (per design)",
  notification: "Notification",
  system: "System topic",
};
const KIND_CLASS = { alarm: "alarm", supervisory: "supervisory", supervisoryOrAlarm: "supervisory", notification: "notification", system: "system" };

function Steps({ steps }) {
  return (
    <ol className="steps">
      {steps.map((s, i) => (
        <li key={i}>
          {s.instruction}
          <span className="exp"><b>Expected:</b> {s.expected}</span>
          {s.caution && <span className="cau">⚠ {s.caution}</span>}
        </li>
      ))}
    </ol>
  );
}

function FaultTable({ faults }) {
  return (
    <table className="faults">
      <thead><tr><th style={{width:"30%"}}>Symptom</th><th style={{width:"32%"}}>Likely cause</th><th>What to check</th></tr></thead>
      <tbody>
        {faults.map((f, i) => (
          <tr key={i}><td>{f.symptom}</td><td>{f.likelyCause}</td><td>{f.check}</td></tr>
        ))}
      </tbody>
    </table>
  );
}

function TopicBody({ item }) {
  return (
    <div className="topic-body">
      <h4>How it works</h4>
      <p>{item.howItWorks}</p>
      {item.preTest && item.preTest.length > 0 && (
        <>
          <h4>Before you test</h4>
          <ol className="steps">{item.preTest.map((p, i) => <li key={i}>{p}</li>)}</ol>
        </>
      )}
      {item.testProcedure && item.testProcedure.length > 0 && (
        <>
          <h4>Test procedure</h4>
          <Steps steps={item.testProcedure} />
        </>
      )}
      {item.expectedResult && (
        <>
          <h4>A passing test looks like</h4>
          <p>{item.expectedResult}</p>
        </>
      )}
      {item.commonFaults && item.commonFaults.length > 0 && (
        <>
          <h4>Common faults</h4>
          <FaultTable faults={item.commonFaults} />
        </>
      )}
      <div className="coderef"><b>Standard:</b> {item.codeReference}</div>
    </div>
  );
}

function TopicCard({ item, kind, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const k = kind || item.kind || "system";
  return (
    <div className="topic-card">
      <button className="topic-head" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span className="tname">{item.name}</span>
        <span className={"tkind " + KIND_CLASS[k]}>{KIND_LABEL[k]}</span>
        <span aria-hidden="true" style={{ color: "#9aa0a9", fontSize: 18, marginLeft: 6 }}>{open ? "−" : "+"}</span>
      </button>
      {open && <TopicBody item={item} />}
    </div>
  );
}

function configSummary(cfg) {
  const bits = [
    cfg.panelType === "addressable" ? "Addressable" : "Conventional",
    "Class " + cfg.wiringClass,
    cfg.devices.length + " device types",
    cfg.monitoring === "central" ? "Central-station monitored" : "Local only",
    cfg.buildingType,
    cfg.zones + (cfg.panelType === "addressable" ? " loop(s)" : " zone(s)"),
  ];
  return bits;
}

/* =====================================================================
   CONFIGURATOR
   ===================================================================== */

function Configurator({ cfg, setCfg, onDone, onQuickStart }) {
  const [step, setStep] = useState(0);
  const steps = ["Panel", "Wiring class", "Devices", "Monitoring", "Building"];

  const set = (patch) => setCfg(c => ({ ...c, ...patch }));
  const toggleDevice = (id) =>
    set({ devices: cfg.devices.includes(id) ? cfg.devices.filter(d => d !== id) : [...cfg.devices, id] });

  const canNext =
    step === 2 ? cfg.devices.length > 0 : true;

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else { set({ complete: true }); onDone(); }
  };

  return (
    <div className="wizard">
      <div className="eyebrow">Get started</div>
      <h2 className="page-title">Pick a system</h2>
      <p className="page-lede">
        Jump straight in with a ready-made example system, or answer five quick questions below to
        tailor everything — lessons, checklist, panel simulator and wiring diagram — to the exact
        system in front of you.
      </p>

      <div className="quickstart">
        <div className="qs-head">
          <span className="qs-flag">Ready to use</span>
          <h3>Example system — typical monitored office building</h3>
        </div>
        <p className="qs-desc">
          A common commercial setup, pre-loaded and ready: work the panel, run the checklist, break
          the circuit on the diagram. You can customize any of it later.
        </p>
        <div className="sumstrip" style={{ margin: "10px 0 14px" }}>
          {configSummary(DEFAULT_CONFIG).map(b => <span key={b}>{b}</span>)}
        </div>
        <div className="qs-actions">
          <button className="btn red" onClick={() => onQuickStart("Simulate")}>Start on the panel simulator →</button>
          <button className="btn ghost" onClick={() => onQuickStart("Learn")}>Start with the lessons</button>
        </div>
      </div>

      <div className="or-rule" role="separator" aria-label="Or customize your own system">
        <span>Or customize — describe your system</span>
      </div>

      <div className="wiz-steps">
        {steps.map((s, i) => (
          <div key={s} className={i === step ? "now" : i < step ? "done" : ""}>{i < step ? "✓ " : ""}{s}</div>
        ))}
      </div>

      <div className="card">
        {step === 0 && (
          <>
            <h3 style={{ fontSize: 20, marginBottom: 4 }}>What kind of panel is it?</h3>
            <div className="choice-row">
              <button className={"choice" + (cfg.panelType === "addressable" ? " on" : "")}
                onClick={() => set({ panelType: "addressable" })}>
                <span className="tick" /><span><b>Addressable</b>
                <span>Each device has a unique address on a signaling line circuit (SLC loop). The panel names the exact device in alarm — "SMOKE DETECTOR L1:D042, RM 214". Standard for modern commercial systems.</span></span>
              </button>
              <button className={"choice" + (cfg.panelType === "conventional" ? " on" : "")}
                onClick={() => set({ panelType: "conventional", wiringClass: cfg.wiringClass === "X" ? "B" : cfg.wiringClass })}>
                <span className="tick" /><span><b>Conventional</b>
                <span>Devices are grouped on zone circuits. The panel knows a zone is in alarm — "ZONE 3 — SECOND FLOOR" — and you walk the zone to find the device. Common in older and smaller buildings.</span></span>
              </button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h3 style={{ fontSize: 20, marginBottom: 4 }}>How are the circuits wired?</h3>
            <p style={{ color: "var(--ink2)", fontSize: 13.5 }}>Circuit class determines what a single wiring fault costs you. If you're not sure, Class B is the most common baseline.</p>
            <div className="choice-row">
              <button className={"choice" + (cfg.wiringClass === "B" ? " on" : "")} onClick={() => set({ wiringClass: "B" })}>
                <span className="tick" /><span><b>Class B</b><span>Single path out to an end-of-line device. An open circuit drops every device past the break.</span></span>
              </button>
              <button className={"choice" + (cfg.wiringClass === "A" ? " on" : "")} onClick={() => set({ wiringClass: "A" })}>
                <span className="tick" /><span><b>Class A</b><span>The circuit loops back to the panel. On a single open, the panel feeds both ends and no device is lost.</span></span>
              </button>
              {cfg.panelType === "addressable" && (
                <button className={"choice" + (cfg.wiringClass === "X" ? " on" : "")} onClick={() => set({ wiringClass: "X" })}>
                  <span className="tick" /><span><b>Class X</b><span>A Class A loop with short-circuit isolators — a wire-to-wire short only takes out the segment between the nearest two isolators. Addressable systems only.</span></span>
                </button>
              )}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h3 style={{ fontSize: 20, marginBottom: 4 }}>What's on the system? <span style={{ fontWeight: 400, fontSize: 14, color: "var(--ink2)" }}>(select all that apply)</span></h3>
            <div className="choice-row" style={{ gridTemplateColumns: "1fr 1fr", display: "grid" }}>
              {DEVICE_OPTIONS.map(d => (
                <button key={d.id} className={"choice multi" + (cfg.devices.includes(d.id) ? " on" : "")}
                  onClick={() => toggleDevice(d.id)}>
                  <span className="tick" /><span><b>{d.label}</b></span>
                </button>
              ))}
            </div>
            {cfg.devices.length === 0 && <p style={{ color: "var(--red)", fontSize: 13.5 }}>Select at least one device type to continue.</p>}
          </>
        )}

        {step === 3 && (
          <>
            <h3 style={{ fontSize: 20, marginBottom: 4 }}>Is the system monitored?</h3>
            <div className="choice-row">
              <button className={"choice" + (cfg.monitoring === "central" ? " on" : "")} onClick={() => set({ monitoring: "central" })}>
                <span className="tick" /><span><b>Central-station monitored</b><span>Signals transmit to a supervising station that dispatches the fire department. Testing requires placing the account on test first — every time.</span></span>
              </button>
              <button className={"choice" + (cfg.monitoring === "local" ? " on" : "")} onClick={() => set({ monitoring: "local" })}>
                <span className="tick" /><span><b>Local only</b><span>The system alarms in the building only. You still coordinate with occupants and the AHJ before testing.</span></span>
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h3 style={{ fontSize: 20, marginBottom: 4 }}>Optional context</h3>
            <div className="field">
              <label htmlFor="btype">Building type</label>
              <select id="btype" value={cfg.buildingType} onChange={e => set({ buildingType: e.target.value })}>
                {BUILDING_TYPES.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="zones">{cfg.panelType === "addressable" ? "Number of SLC loops" : "Number of zones"}</label>
              <input id="zones" type="number" min="1" max="99" value={cfg.zones}
                onChange={e => set({ zones: Math.max(1, Math.min(99, parseInt(e.target.value || "1", 10))) })} />
            </div>
          </>
        )}

        <div className="wiz-foot">
          {step > 0 && <button className="btn ghost" onClick={() => setStep(step - 1)}>← Back</button>}
          <span className="spacer" />
          <button className="btn red" disabled={!canNext} onClick={next}>
            {step === steps.length - 1 ? "Build my walkthrough →" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   LEARN PAGE
   ===================================================================== */

function LearnPage({ cfg }) {
  const deviceItems = cfg.devices.map(id => DEVICES[id]).filter(Boolean);
  const topicIds = ["onTest", "ackSilenceReset", "walkTest", "troubleSupervisory", "wiringClasses"];
  return (
    <div>
      <div className="eyebrow">Tailored to your configuration</div>
      <h2 className="page-title">How your system works</h2>
      <div className="sumstrip">{configSummary(cfg).map(b => <span key={b}>{b}</span>)}</div>
      <p className="page-lede">
        Start with the system-level concepts — they apply to every test you'll ever run — then work
        through each device type on your system. Tap any card to expand it.
      </p>

      <h3 style={{ fontSize: 22, textTransform: "uppercase", margin: "18px 0 10px" }}>System fundamentals</h3>
      {topicIds.map((id, i) => <TopicCard key={id} item={TOPICS[id]} kind="system" defaultOpen={i === 0} />)}

      <h3 style={{ fontSize: 22, textTransform: "uppercase", margin: "26px 0 10px" }}>Your devices ({deviceItems.length})</h3>
      {deviceItems.length === 0 && <p className="empty">No devices selected — go back to Configure.</p>}
      {deviceItems.map(d => <TopicCard key={d.id} item={d} />)}
    </div>
  );
}

/* =====================================================================
   TEST CHECKLIST PAGE
   ===================================================================== */

function buildChecklist(cfg) {
  const groups = [];
  groups.push({
    id: "pre",
    title: "Pre-test coordination (always first)",
    items: TOPICS.onTest.testProcedure.slice(0, 3).map((s, i) => ({ id: "pre-" + i, ...s })),
  });
  cfg.devices.forEach(devId => {
    const d = DEVICES[devId];
    if (!d) return;
    groups.push({
      id: devId,
      title: d.name,
      items: d.testProcedure.map((s, i) => ({ id: devId + "-" + i, ...s })),
    });
  });
  groups.push({
    id: "post",
    title: "Wrap-up — return to service",
    items: [TOPICS.onTest.testProcedure[3]].map((s, i) => ({ id: "post-" + i, ...s })),
  });
  return groups;
}

function ChecklistPage({ cfg }) {
  const groups = useMemo(() => buildChecklist(cfg), [cfg]);
  const [done, setDone] = useState({});
  const all = groups.flatMap(g => g.items);
  const doneCount = all.filter(i => done[i.id]).length;
  const pct = all.length ? Math.round((doneCount / all.length) * 100) : 0;

  return (
    <div>
      <div className="eyebrow">Assembled for your configuration</div>
      <h2 className="page-title">Guided test checklist</h2>
      <div className="sumstrip">{configSummary(cfg).map(b => <span key={b}>{b}</span>)}</div>

      <div className="pretest-banner" role="alert">
        <h3>Before you activate anything</h3>
        <p>
          {cfg.monitoring === "central"
            ? "Notify the monitoring company and place the account ON TEST. "
            : "This system is local-only, but you still coordinate: "}
          Notify the AHJ where required, and account for every person the alarms could affect —
          occupants, patients, shift workers, sensitive operations. No device gets activated until
          the outside world knows a test is happening.
        </p>
      </div>

      <div className="prog">
        <span className="num">{doneCount} / {all.length} complete</span>
        <div className="bar"><div className="fill" style={{ width: pct + "%" }} /></div>
        <button className="btn ghost" style={{ padding: "6px 12px", fontSize: 13 }} onClick={() => setDone({})}>Reset</button>
      </div>

      {groups.map(g => (
        <div className="ck-group" key={g.id}>
          <h3>{g.title}</h3>
          {g.items.map(item => (
            <div key={item.id} className={"ck-item" + (done[item.id] ? " done" : "")}
              onClick={() => setDone(d => ({ ...d, [item.id]: !d[item.id] }))}
              role="checkbox" aria-checked={!!done[item.id]} tabIndex={0}
              onKeyDown={e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setDone(d => ({ ...d, [item.id]: !d[item.id] })); } }}>
              <span className="ck-box" />
              <span>
                <span className="ins">{item.instruction}</span>
                <span className="exp" style={{ display: "block", fontSize: 13.5, color: "var(--green)", marginTop: 2 }}>
                  <b style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em" }}>Expected:</b> {item.expected}
                </span>
                {item.caution && <span className="cau" style={{ display: "block", fontSize: 13.5, marginTop: 5 }}>⚠ {item.caution}</span>}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* =====================================================================
   VIRTUAL FACP SIMULATOR — operable state machine
   ===================================================================== */

let _uid = 0;
const uid = () => ++_uid;

function deviceLabel(cfg, dev, n) {
  const short = {
    photoSmoke: "SMOKE DETECTOR", heat: "HEAT DETECTOR", pull: "PULL STATION",
    duct: "DUCT DETECTOR", waterflow: "WATERFLOW SW", tamper: "VALVE TAMPER",
    nac: "NAC CIRCUIT", beam: "BEAM DETECTOR", aspirating: "AIR SAMPLING",
  }[dev] || "DEVICE";
  if (cfg.panelType === "addressable") {
    const loop = 1 + (n % Math.max(1, cfg.zones));
    return short + " L" + loop + ":D" + String(20 + n * 7).padStart(3, "0");
  }
  return short + "  ZONE " + (1 + (n % Math.max(1, cfg.zones)));
}

const DEV_SIGNAL = {
  photoSmoke: "ALARM", heat: "ALARM", pull: "ALARM", waterflow: "ALARM",
  beam: "ALARM", aspirating: "ALARM", duct: "SUPERVISORY", tamper: "SUPERVISORY", nac: null,
};


/* ---- field device icons (simple generic glyphs, stateful) ---- */
function DevIcon({ dev, st, nacOn }) {
  const on = st === "active";
  const latched = st === "latched";
  const sup = dev === "tamper" || dev === "duct";
  const led = on ? (sup ? "#ffb020" : "#ff2020") : latched ? "#ffb020" : "#b7b2a4";
  const glow = on ? { filter: "drop-shadow(0 0 3px " + (sup ? "rgba(255,176,32,.9)" : "rgba(255,40,40,.9)") + ")" } : {};
  const P = { width: 62, height: 62, viewBox: "0 0 72 72", "aria-hidden": true };
  switch (dev) {
    case "photoSmoke":
      return (<svg {...P}>
        <circle cx="36" cy="33" r="25" fill="#fdfcf8" stroke="#8f8669" strokeWidth="2" />
        <circle cx="36" cy="33" r="16" fill="none" stroke="#c9c4b6" strokeWidth="3" strokeDasharray="5 4" />
        <circle cx="36" cy="33" r="7" fill="#ece8db" stroke="#b7b2a4" />
        <circle cx="50" cy="48" r="4" fill={led} style={glow} />
      </svg>);
    case "heat":
      return (<svg {...P}>
        <circle cx="36" cy="34" r="24" fill="#fdfcf8" stroke="#8f8669" strokeWidth="2" />
        <rect x="33" y="19" width="6" height="21" rx="3" fill="#c8102e" opacity={on ? 1 : 0.45} />
        <circle cx="36" cy="45" r="6" fill="#c8102e" opacity={on ? 1 : 0.45} />
        <circle cx="53" cy="50" r="4" fill={led} style={glow} />
      </svg>);
    case "pull":
      return (<svg {...P}>
        <rect x="18" y="7" width="36" height="56" rx="4" fill="#c8102e" stroke="#7a1420" strokeWidth="2" />
        <text x="36" y="20" textAnchor="middle" fontSize="9.5" fill="#fff" fontWeight="bold" fontFamily="Barlow Condensed, sans-serif" letterSpacing="1.5">FIRE</text>
        <rect x="24" y={on || latched ? 45 : 27} width="24" height="10" rx="2" fill="#fff" stroke="#7a1420" />
        {!(on || latched) && <text x="36" y="52" textAnchor="middle" fontSize="7.5" fill="#ffd9de" fontFamily="Barlow Condensed, sans-serif" letterSpacing="1">PULL</text>}
      </svg>);
    case "duct":
      return (<svg {...P}>
        <rect x="4" y="36" width="64" height="20" fill="#e3e6ea" stroke="#9aa0a9" />
        <rect x="22" y="12" width="28" height="21" rx="2" fill="#fdfcf8" stroke="#8f8669" strokeWidth="2" />
        <line x1="30" y1="33" x2="30" y2="53" stroke="#8f8669" strokeWidth="3" />
        <line x1="42" y1="33" x2="42" y2="47" stroke="#8f8669" strokeWidth="3" />
        <circle cx="44" cy="20" r="3.5" fill={led} style={glow} />
      </svg>);
    case "waterflow":
      return (<svg {...P}>
        <rect x="4" y="43" width="64" height="13" rx="2" fill="#cdd4da" stroke="#9aa0a9" />
        <rect x="32" y="36" width="8" height="8" fill="#9aa0a9" />
        <rect x="24" y="13" width="24" height="24" rx="3" fill="#fdfcf8" stroke="#8f8669" strokeWidth="2" />
        <rect x="34" y="45" width="4" height="9" fill="#8f8669" />
        <circle cx="42" cy="20" r="3.5" fill={led} style={glow} />
      </svg>);
    case "tamper":
      return (<svg {...P}>
        <rect x="29" y="42" width="14" height="20" fill="#cdd4da" stroke="#9aa0a9" />
        <line x1="36" y1="42" x2="36" y2="28" stroke="#8f8669" strokeWidth="4" />
        <g transform={on ? "rotate(28 36 21)" : ""}>
          <circle cx="36" cy="21" r="13" fill="none" stroke={on ? "#b97e0a" : "#8f8669"} strokeWidth="3" />
          <line x1="36" y1="9" x2="36" y2="33" stroke={on ? "#b97e0a" : "#8f8669"} strokeWidth="2.5" />
          <line x1="24" y1="21" x2="48" y2="21" stroke={on ? "#b97e0a" : "#8f8669"} strokeWidth="2.5" />
        </g>
        <circle cx="56" cy="54" r="4" fill={led} style={glow} />
      </svg>);
    case "beam":
      return (<svg {...P}>
        <rect x="4" y="26" width="14" height="20" rx="2" fill="#fdfcf8" stroke="#8f8669" strokeWidth="2" />
        <rect x="54" y="26" width="14" height="20" rx="2" fill="#fdfcf8" stroke="#8f8669" strokeWidth="2" />
        <line x1="18" y1="36" x2="54" y2="36" stroke={on ? "#c8102e" : "#8fb2c9"} strokeWidth="2.5" strokeDasharray="6 4" />
        <circle cx="11" cy="52" r="4" fill={led} style={glow} />
      </svg>);
    case "aspirating":
      return (<svg {...P}>
        <rect x="18" y="9" width="36" height="29" rx="3" fill="#fdfcf8" stroke="#8f8669" strokeWidth="2" />
        <circle cx="36" cy="23" r="8" fill="none" stroke="#9aa0a9" strokeWidth="2" />
        <line x1="30" y1="17" x2="42" y2="29" stroke="#9aa0a9" strokeWidth="2" />
        <line x1="42" y1="17" x2="30" y2="29" stroke="#9aa0a9" strokeWidth="2" />
        <line x1="36" y1="38" x2="36" y2="52" stroke="#9aa0a9" strokeWidth="4" />
        <line x1="8" y1="52" x2="64" y2="52" stroke="#9aa0a9" strokeWidth="4" />
        {[14, 24, 48, 58].map(x => <circle key={x} cx={x} cy="52" r="1.8" fill="#5b6570" />)}
        <circle cx="48" cy="16" r="3.5" fill={led} style={glow} />
      </svg>);
    case "nac":
      return (<svg {...P}>
        <rect x="20" y="6" width="32" height="60" rx="3" fill="#fdfcf8" stroke="#8f8669" strokeWidth="2" />
        <rect x="15" y="16" width="42" height="15" rx="4" fill={nacOn ? "#fffdf2" : "#e8e4d6"} stroke="#9aa0a9" className={nacOn ? "strobe-on" : ""} style={nacOn ? { filter: "drop-shadow(0 0 6px rgba(255,255,240,.95))" } : {}} />
        <text x="36" y="43" textAnchor="middle" fontSize="8.5" fill="#c8102e" fontWeight="bold" fontFamily="Barlow Condensed, sans-serif" letterSpacing="2">FIRE</text>
        {[48, 53, 58].map(y => <line key={y} x1="27" y1={y} x2="45" y2={y} stroke="#9aa0a9" strokeWidth="2.5" />)}
        {nacOn && <g className="horn-wave" stroke="#c8102e" strokeWidth="2" fill="none">
          <path d="M 56 44 q 6 9 0 18" /><path d="M 61 40 q 9 13 0 26" />
          <path d="M 16 44 q -6 9 0 18" /><path d="M 11 40 q -9 13 0 26" />
        </g>}
      </svg>);
    default:
      return (<svg {...P}><circle cx="36" cy="36" r="22" fill="#fdfcf8" stroke="#8f8669" strokeWidth="2" /><circle cx="36" cy="36" r="4" fill={led} /></svg>);
  }
}

function FieldDeviceWall({ cfg, conds, nacOn, silenced, hasAlarm, walk, walkPing, onTap }) {
  const devs = cfg.devices.length ? cfg.devices : DEFAULT_CONFIG.devices;
  return (
    <div className="dev-wall">
      <h3>Field devices — tap to operate</h3>
      <p className="dw-hint">
        {walk
          ? "Walk test is ON: tapping a device logs a test pass and auto-restores — no full alarm."
          : "Tap an initiating device to send its signal to the panel; tap it again to restore it. The horn/strobe is an OUTPUT — it follows the panel, you don't tap it."}
      </p>
      <div className="dw-grid">
        {devs.map(dev => {
          if (dev === "nac") {
            const stt = nacOn ? "SOUNDING" : silenced && hasAlarm ? "SILENCED" : "STANDBY";
            return (
              <div key={dev} className={"dev-tile output" + (nacOn ? " active" : "")}
                role="img" aria-label={"Horn strobe output: " + stt}>
                <DevIcon dev="nac" nacOn={nacOn} />
                <span className="nm">Horn / strobe</span>
                <span className={"stt" + (nacOn ? " red" : "")}>{stt} · OUTPUT</span>
              </div>
            );
          }
          const active = conds.find(c => c.dev === dev && c.deviceActive);
          const latched = !active && conds.some(c => c.dev === dev && c.cat === "ALARM" && !c.deviceActive);
          const supv = DEV_SIGNAL[dev] === "SUPERVISORY";
          const ping = walkPing === dev;
          const st = active ? "active" : latched ? "latched" : "normal";
          const stt = ping ? "TEST OK ✓" : active ? (supv ? "OFF-NORMAL" : "IN ALARM") : latched ? "AWAITING RESET" : "NORMAL";
          return (
            <button key={dev}
              className={"dev-tile" + (supv ? " supv" : "") + (active ? " active" : "") + (latched ? " latched" : "") + (ping ? " ping" : "")}
              onClick={() => onTap(dev, active)} aria-pressed={!!active}
              aria-label={(DEVICES[dev] ? DEVICES[dev].name : dev) + ": " + stt + (active ? ". Tap to restore." : ". Tap to activate.")}>
              <DevIcon dev={dev} st={st} />
              <span className="nm">{(DEVICES[dev] ? DEVICES[dev].name : dev).split(" (")[0]}</span>
              <span className={"stt" + (ping ? " grn" : active ? (supv ? " amb" : " red") : latched ? " amb" : "")}>{stt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Simulator({ cfg }) {
  const [conds, setConds] = useState([]);      // {id, cat, label, deviceActive, acked, isDevice}
  const [log, setLog] = useState([]);          // {id, ts, cat, text} newest first
  const [silenced, setSilenced] = useState(false);
  const [walk, setWalk] = useState(false);
  const [drill, setDrill] = useState(false);
  const [lamp, setLamp] = useState(false);
  const [teach, setTeach] = useState(null);
  const [lcdFlash, setLcdFlash] = useState(null); // transient walk-test line
  const [walkPing, setWalkPing] = useState(null);   // device tile flash during walk test
  const nRef = useRef(0);

  const now = () => new Date().toLocaleTimeString([], { hour12: false });
  const addLog = (cat, text) =>
    setLog(l => [{ id: uid(), ts: now(), cat, text }, ...l].slice(0, 120));

  const alarms = conds.filter(c => c.cat === "ALARM");
  const troubles = conds.filter(c => c.cat === "TROUBLE");
  const supvs = conds.filter(c => c.cat === "SUPERVISORY");
  const unacked = conds.some(c => !c.acked);
  const nacOn = drill || (alarms.length > 0 && !silenced);

  /* ---- device activation ---- */
  function activateDevice(devId) {
    const n = nRef.current++;
    const label = deviceLabel(cfg, devId, n);
    const sig = DEV_SIGNAL[devId];
    if (devId === "nac") { setDrill(true); addLog("N", "NAC CIRCUIT ACTIVATED (MANUAL)"); return; }
    if (walk && sig === "ALARM") {
      addLog("W", "WALK TEST PASS  " + label);
      setLcdFlash("TEST OK  " + label);
      setWalkPing(devId);
      setTimeout(() => setLcdFlash(null), 2200);
      setTimeout(() => setWalkPing(null), 1800);
      setTeach({ t: "Walk test", m: "The device operated, gave a brief local indication, auto-restored, and was written to the log — no full alarm, no dispatch. At the end of the walk, the log is your proof of which devices actually reported." });
      return;
    }
    if (sig === "ALARM") {
      setConds(cs => [...cs, { id: uid(), cat: "ALARM", label, deviceActive: true, acked: false, dev: devId }]);
      setSilenced(false); // resound on subsequent alarm
      addLog("A", "ALARM  " + label);
      setTeach({ t: "Alarm sequence", m: "The panel buzzer and flashing ALARM LED mean an unacknowledged event. Work the sequence: ACKNOWLEDGE to quiet the panel, SILENCE to quiet the building, RESET only after the device is restored." });
    } else if (sig === "SUPERVISORY") {
      setConds(cs => [...cs, { id: uid(), cat: "SUPERVISORY", label, deviceActive: true, acked: false, dev: devId }]);
      addLog("S", "SUPERVISORY  " + label);
      setTeach({ t: "Supervisory ≠ alarm", m: "Nothing is burning, but a protection system is impaired (or a duct detector operated, per design). It annunciates distinctly from alarm and restores when the device restores — no panel reset needed on most systems." });
    }
  }

  function restoreDevice(id) {
    setConds(cs => cs.flatMap(c => {
      if (c.id !== id) return [c];
      if (c.cat === "ALARM") {
        addLog("N", "DEVICE RESTORED  " + c.label);
        return [{ ...c, deviceActive: false }]; // alarm stays latched until RESET
      }
      addLog("N", "RESTORED  " + c.label);
      return []; // supervisory / trouble clears with its cause
    }));
  }

  /* ---- fault scenarios ---- */
  function injectFault(kind) {
    const label = kind === "ground"
      ? "GROUND FAULT  SLC/IDC CIRCUIT 1"
      : "OPEN CIRCUIT  " + (cfg.panelType === "addressable" ? "SLC LOOP 1" : "ZONE 1 IDC");
    setConds(cs => [...cs, { id: uid(), cat: "TROUBLE", label, deviceActive: true, acked: false }]);
    addLog("T", "TROUBLE  " + label);
    setTeach(kind === "ground"
      ? { t: "Ground fault", m: "One conductor is touching ground. A single ground usually doesn't disable the circuit — but it defeats half the supervision, and a second fault could. Grounds get found and fixed, not acknowledged and forgotten." }
      : { t: "Open circuit", m: "Supervision current stopped flowing. On a Class B circuit, everything past the break is out of service right now — see the Diagram tab to watch exactly which devices drop." });
  }

  /* ---- panel keys ---- */
  function keyAck() {
    if (!conds.length) return;
    setConds(cs => cs.map(c => ({ ...c, acked: true })));
    addLog("N", "OPERATOR: ACKNOWLEDGE");
    setTeach({ t: "Acknowledge", m: "You've told the panel a human saw the event. The internal buzzer stops and the LED goes steady — but nothing changed in the building. Horns keep sounding until you press Silence." });
  }
  function keySilence() {
    if (!alarms.length && !drill) return;
    setSilenced(true); setDrill(false);
    addLog("N", "OPERATOR: ALARM SILENCE");
    setTeach({ t: "Silence", m: "Notification appliances stop, the SILENCED LED lights, and the ALARM LED stays on — the alarm is still latched. A NEW alarm event will resound the appliances automatically." });
  }
  function keyReset() {
    addLog("N", "OPERATOR: SYSTEM RESET");
    const stuck = alarms.filter(c => c.deviceActive);
    if (stuck.length) {
      setConds(cs => cs.map(c =>
        c.cat === "ALARM" && c.deviceActive ? { ...c, acked: false } : c
      ).filter(c => !(c.cat === "ALARM" && !c.deviceActive)));
      setSilenced(false);
      stuck.forEach(c => addLog("A", "RE-ALARM  " + c.label + "  (DEVICE STILL ACTIVE)"));
      setTeach({ t: "Reset failed — on purpose", m: "The initiating device is still off-normal (smoke in the chamber, pull station still latched), so the panel immediately re-alarms. A panel must never be able to hide an active alarm. Restore the device, then reset." });
      return;
    }
    if (alarms.length) {
      setConds(cs => cs.filter(c => c.cat !== "ALARM"));
      setSilenced(false);
      addLog("N", "ALARMS CLEARED — RESET COMPLETE");
      setTeach({ t: "Clean reset", m: "All initiating devices were restored, so the reset succeeded. Troubles and supervisories are not cleared by reset — they clear when their cause clears." });
    } else {
      setSilenced(false);
      addLog("N", conds.length ? "RESET — OFF-NORMAL CONDITIONS REMAIN" : "RESET — SYSTEM NORMAL");
    }
  }
  function keyDrill() {
    setDrill(d => { addLog("N", d ? "DRILL ENDED" : "DRILL — NACS ACTIVATED"); return !d; });
    setTeach({ t: "Drill / Test", m: "Drill drives the notification circuits without an alarm condition — used for evacuation drills and NAC testing. Silence or press Drill again to stop." });
  }
  function keyLamp() {
    setLamp(true); addLog("N", "LAMP TEST");
    setTimeout(() => setLamp(false), 1800);
  }
  function keyWalk() {
    setWalk(w => {
      addLog(w ? "N" : "W", w ? "WALK TEST DISABLED — NORMAL SERVICE" : "WALK TEST ENABLED  LOOP 1");
      return !w;
    });
    setTeach({ t: "Walk test mode", m: "One-person testing: device activations give a brief local indication and a log entry instead of a full alarm. The panel shows an off-normal (trouble) while test mode is active — and remember, real panels time out of walk test automatically." });
  }

  /* ---- LCD ---- */
  const pad = s => (s || "").padEnd(40).slice(0, 40);
  let line1, line2;
  if (lamp) { line1 = "LAMP TEST"; line2 = "ALL INDICATORS ON"; }
  else if (lcdFlash) { line1 = walk ? "** WALK TEST ACTIVE **" : "TEST"; line2 = lcdFlash; }
  else if (conds.length === 0) {
    line1 = "SYSTEM NORMAL" + (walk ? "  *WALK TEST*" : "");
    line2 = new Date().toLocaleDateString() + "  " + now();
  } else {
    line1 = alarms.length + " ALRM  " + supvs.length + " SUPV  " + troubles.length + " TRBL" + (silenced ? "  SIL" : "") + (walk ? " WT" : "");
    const top = alarms[0] || supvs[0] || troubles[0];
    line2 = top.cat.slice(0, 4) + ": " + top.label;
  }


  return (
    <div>
      <div className="eyebrow">Interactive — operate it like the real thing</div>
      <h2 className="page-title">Virtual control panel</h2>
      <div className="sumstrip">{configSummary(cfg).map(b => <span key={b}>{b}</span>)}</div>
      <p className="page-lede">
        A generic commercial-style {cfg.panelType} panel. Tap the field devices below it to put them
        into alarm, then work the Acknowledge → Silence → Reset sequence up top. Watch the
        horn/strobe — it's an output, driven entirely by the panel's state. Nothing here is a real
        product; the behavior is what matters.
      </p>

      <div className="sim-layout">
        <div>
          <div className="facp" aria-label="Fire alarm control panel simulator">
            <div className="facp-title">
              <span className="nm">Fire Alarm Control Panel</span>
              <span className="mdl">{cfg.panelType === "addressable" ? "ADDRESSABLE · SLC ×" + cfg.zones : "CONVENTIONAL · " + cfg.zones + " ZONE"} · CLASS {cfg.wiringClass}</span>
            </div>
            <div className="facp-main">
              <div>
                <div className="lcd-bezel">
                  <div className="lcd" role="status" aria-live="polite">
                    <pre>{pad(line1) + "\n" + pad(line2)}</pre>
                  </div>
                  <div className={"piezo" + (unacked && conds.length ? " on" : "")}>
                    <span className="dot" /> PIEZO {unacked && conds.length ? "SOUNDING — PRESS ACK" : "QUIET"}
                    <span style={{ marginLeft: "auto" }}>NACS {nacOn ? "◉ SOUNDING" : silenced && alarms.length ? "◌ SILENCED" : "◌ OFF"}</span>
                  </div>
                </div>
                <div className="facp-keys">
                  <button className="fkey" onClick={keyAck}>Acknowledge</button>
                  <button className="fkey" onClick={keySilence}>Silence</button>
                  <button className="fkey" onClick={keyReset}>Reset</button>
                  <button className={"fkey" + (drill ? " armed" : "")} onClick={keyDrill}>Drill / Test</button>
                  <button className="fkey" onClick={keyLamp}>Lamp Test</button>
                  <button className={"fkey" + (walk ? " armed" : "")} onClick={keyWalk}>Walk Test</button>
                </div>
                <div className="walk-tag">
                  <span className={walk ? "on" : ""}>WALK TEST: {walk ? "ENABLED — LOOP 1" : "OFF"}</span>
                  <span>MODE: {cfg.monitoring === "central" ? "MONITORED (put ON TEST first!)" : "LOCAL"}</span>
                </div>
              </div>
              <div className="leds" aria-label="Panel status LEDs">
                {[
                  ["AC Power", "green", true, false],
                  ["Alarm", "red", lamp || alarms.length > 0, alarms.some(c => !c.acked)],
                  ["Supervisory", "amber", lamp || supvs.length > 0, supvs.some(c => !c.acked)],
                  ["Trouble", "amber", lamp || troubles.length > 0 || walk, troubles.some(c => !c.acked)],
                  ["Silenced", "amber", lamp || (silenced && alarms.length > 0), false],
                ].map(([nm, col, on, flash]) => (
                  <div className="led-row" key={nm}>
                    <span className={"led " + col + (on ? " on" : "") + (flash ? " flash" : "")} />
                    <span>{nm}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <FieldDeviceWall cfg={cfg} conds={conds} nacOn={nacOn} silenced={silenced}
            hasAlarm={alarms.length > 0} walk={walk} walkPing={walkPing}
            onTap={(dev, active) => active ? restoreDevice(active.id) : activateDevice(dev)} />

          {teach && (
            <div className="teach"><b>{teach.t}:</b> {teach.m}</div>
          )}

          <div className="card" style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 18, textTransform: "uppercase", marginBottom: 6 }}>Event history</h3>
            <div className="elog" aria-live="polite">
              {log.length === 0 && <div>-- no events logged --</div>}
              {log.map(e => <div key={e.id} className={e.cat}>{e.ts}  {e.text}</div>)}
            </div>
          </div>
        </div>

        <div className="sim-side">
          <div className="card">
            <h3>Practice scenarios</h3>
            <div className="scn">
              <button className="danger" onClick={() => activateDevice("pull")}>Pull-station activation</button>
              <button className="danger" onClick={() => activateDevice("photoSmoke")}>Smoke detector alarm</button>
              <button onClick={() => injectFault("ground")}>Simulate ground fault</button>
              <button onClick={() => injectFault("open")}>Simulate open circuit</button>
              <button onClick={() => activateDevice("tamper")}>Valve tamper (supervisory)</button>
              <button className="danger" onClick={() => { activateDevice("photoSmoke"); setTeach({ t: "Now try it", m: "A detector is in alarm and still active. Press RESET before restoring it and watch the panel refuse to stay normal — then restore the device below and reset again." }); }}>
                Reset with device still active
              </button>
            </div>
          </div>

          <div className="card">
            <h3>Off-normal conditions</h3>
            {conds.length === 0 && <p style={{ fontSize: 13.5, color: "var(--ink2)" }}>None — system normal.</p>}
            <div className="dev-act">
              {conds.map(c => (
                <React.Fragment key={c.id}>
                  <span>
                    <span className={"st " + (c.deviceActive ? "active" : "")}>{c.cat}{c.acked ? " · ACK" : ""}{c.cat === "ALARM" && !c.deviceActive ? " · DEVICE RESTORED" : ""}</span><br />
                    <span style={{ fontSize: 12.5 }} className="mono">{c.label}</span>
                  </span>
                  {c.deviceActive
                    ? <button className="btn ghost" style={{ padding: "5px 12px", fontSize: 13 }} onClick={() => restoreDevice(c.id)}>
                        {c.cat === "TROUBLE" ? "Clear fault" : "Restore"}
                      </button>
                    : <span style={{ fontSize: 12, color: "var(--ink2)" }}>awaiting reset</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   INTERACTIVE WIRING / RISER DIAGRAM
   ===================================================================== */

const DEV_GLYPH = {
  photoSmoke: "S", heat: "H", pull: "P", duct: "D", waterflow: "WF",
  tamper: "TS", nac: "HS", beam: "B", aspirating: "AS",
};

function DiagramPage({ cfg }) {
  const devs = (cfg.devices.length ? cfg.devices : DEFAULT_CONFIG.devices).slice(0, 8);
  const N = devs.length;
  const [fault, setFault] = useState(null); // {kind:'open'|'short'|'ground', seg}
  const [detail, setDetail] = useState(null);

  const W = 940, H = cfg.wiringClass === "B" ? 300 : 360;
  const y = 130, yr = 265;
  const x0 = 150;                       // panel right edge
  const span = (W - x0 - 90) / Math.max(1, N);
  const xd = i => x0 + span * (i + 0.5); // device centers
  const segCount = N + (cfg.wiringClass === "B" ? 1 : 0); // B has final run to EOL
  const segX = i => {                    // segment i feeds device i (or EOL if i===N)
    const a = i === 0 ? x0 : xd(i - 1);
    const b = i === N ? W - 60 : xd(i);
    return [a, b];
  };

  // which devices are lost for the current fault?
  const affected = useMemo(() => {
    if (!fault) return new Set();
    const s = new Set();
    if (fault.kind === "ground") return s;
    if (fault.kind === "open") {
      if (cfg.wiringClass === "B") for (let j = fault.seg; j < N; j++) s.add(j);
      return s; // A and X: none lost on a single open
    }
    // short
    if (cfg.wiringClass === "X") {
      const zone = Math.floor(fault.seg / 2) * 2; // isolators every 2 devices
      for (let j = zone; j < Math.min(N, zone + 2); j++) s.add(j);
    } else {
      for (let j = 0; j < N; j++) s.add(j);
    }
    return s;
  }, [fault, cfg.wiringClass, N]);

  const faultNote = useMemo(() => {
    if (!fault) return null;
    const cls = cfg.wiringClass;
    if (fault.kind === "ground")
      return { t: "Ground fault — Class " + cls, m: "The panel annunciates a GROUND FAULT trouble. A single ground doesn't take any device out of service — but it defeats part of the circuit's supervision, so a second fault could go undetected or disable the circuit. Grounds get located (megger, halving the circuit) and repaired promptly." };
    if (fault.kind === "open") {
      if (cls === "B") return { t: "Open circuit — Class B", m: "Supervision current through the end-of-line device stops, so the panel shows TROUBLE. Every device past the break (highlighted red) is out of service until the open is repaired — the panel knows something is wrong but cannot reach them." };
      return { t: "Open circuit — Class " + cls, m: "The panel shows TROUBLE, but because the circuit returns to the panel, it now feeds the loop from BOTH ends. Zero devices are lost — that's the entire point of paying for the return conductors. The trouble still gets repaired immediately; the loop is one fault away from degradation." };
    }
    // short
    if (cls === "X") return { t: "Wire-to-wire short — Class X", m: "The short-circuit isolators on either side of the fault open automatically, confining the dead segment. Only the devices between the two nearest isolators (highlighted) drop off; the rest of the loop keeps operating. This is what Class X buys over Class A." };
    if (cls === "A") return { t: "Wire-to-wire short — Class A", m: "Class A survives an open, but a direct short collapses the whole loop — there are no isolators to confine it. Every device is affected until the short is cleared. (This is exactly the gap Class X closes.)" };
    return { t: "Wire-to-wire short — Class B", m: cfg.panelType === "conventional"
      ? "On a conventional initiating circuit, a short looks electrically identical to a device in alarm — the panel goes into FALSE ALARM. That's why shorts on conventional IDCs are so disruptive. (On the NAC side, a short reads as trouble.)"
      : "On an addressable loop, a short drags the line voltage down and the panel loses communication with the circuit — trouble, all devices affected until cleared." };
  }, [fault, cfg.wiringClass, cfg.panelType]);

  const wireStroke = "#33566b";
  const lost = i => affected.has(i);

  return (
    <div>
      <div className="eyebrow">Interactive — click devices, break wires</div>
      <h2 className="page-title">Wiring diagram — Class {cfg.wiringClass}</h2>
      <div className="sumstrip">{configSummary(cfg).map(b => <span key={b}>{b}</span>)}</div>
      <p className="page-lede">
        Your configured circuit, drawn as installed. Click any device for its full lesson. Then
        inject a fault on a wire segment and watch which devices survive — this is the fastest way
        to really understand circuit classes.
      </p>

      <div className="dia-tools">
        <span className="lbl">Inject fault:</span>
        <div className="seg-btns">
          {["open", "short", "ground"].map(k => (
            <button key={k} className={fault && fault.kind === k ? "on" : ""}
              onClick={() => setFault(f => f && f.kind === k ? null : { kind: k, seg: f ? f.seg : Math.min(1, segCount - 1) })}>
              {k === "open" ? "Open circuit" : k === "short" ? "Wire-to-wire short" : "Ground fault"}
            </button>
          ))}
          {fault && <button onClick={() => setFault(null)}>✕ Clear fault</button>}
        </div>
        {fault && fault.kind !== "ground" && (
          <>
            <span className="lbl">On segment:</span>
            <div className="seg-btns">
              {Array.from({ length: segCount }, (_, i) => (
                <button key={i} className={fault.seg === i ? "on" : ""} onClick={() => setFault({ ...fault, seg: i })}>
                  {i === 0 ? "Panel→1" : i === N ? N + "→EOL" : i + "→" + (i + 1)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <svg className="dia-svg" viewBox={"0 0 " + W + " " + H} role="img"
        aria-label={"Class " + cfg.wiringClass + " circuit diagram with " + N + " devices"}>
        {/* panel */}
        <rect x="24" y={y - 62} width={x0 - 24} height="124" rx="6" fill="#d9d2bf" stroke="#8f8669" strokeWidth="2" />
        <rect x="40" y={y - 46} width={x0 - 56} height="26" rx="3" fill="#3a3f1e" />
        <text x={(24 + x0) / 2} y={y - 28} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="11" fill="#ffce54">{fault ? (fault.kind === "ground" ? "GND FLT" : fault.kind === "open" ? "TROUBLE" : cfg.wiringClass === "B" && cfg.panelType === "conventional" ? "ALARM!" : "TROUBLE") : "NORMAL"}</text>
        <text x={(24 + x0) / 2} y={y + 2} textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight="700" fontSize="15" fill="#4d4733">FACP</text>
        <text x={(24 + x0) / 2} y={y + 20} textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontSize="11" fill="#867d63">{cfg.panelType.toUpperCase()}</text>
        <circle cx="44" cy={y + 42} r="5" fill={fault ? "#ffb020" : "#37e05a"} />
        <text x="56" y={y + 46} fontFamily="Barlow Condensed, sans-serif" fontSize="11" fill="#4d4733">{fault ? "TROUBLE" : "NORMAL"}</text>

        {/* outgoing wire segments */}
        {Array.from({ length: segCount }, (_, i) => {
          const [a, b] = segX(i);
          const isFault = fault && fault.kind !== "ground" && fault.seg === i;
          const dead = fault && fault.kind === "open" && cfg.wiringClass === "B" && i >= fault.seg;
          return (
            <g key={"seg" + i}>
              <line x1={a} y1={y} x2={b} y2={y}
                stroke={isFault ? "#c8102e" : dead ? "#c9c4b6" : wireStroke}
                strokeWidth={isFault ? 4 : 3}
                strokeDasharray={dead && !isFault ? "6 6" : "none"} />
              {isFault && fault.kind === "open" && (
                <g>
                  <rect x={(a + b) / 2 - 9} y={y - 9} width="18" height="18" fill="var(--paper)" />
                  <text x={(a + b) / 2} y={y + 6} textAnchor="middle" fontSize="17" fill="#c8102e" fontWeight="bold">✂</text>
                </g>
              )}
              {isFault && fault.kind === "short" && (
                <g>
                  <circle cx={(a + b) / 2} cy={y} r="9" fill="#c8102e" />
                  <text x={(a + b) / 2} y={y + 4.5} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold">⚡</text>
                </g>
              )}
            </g>
          );
        })}

        {/* ground fault marker */}
        {fault && fault.kind === "ground" && (
          <g>
            <line x1={xd(0) + span / 2} y1={y} x2={xd(0) + span / 2} y2={y + 34} stroke="#c8102e" strokeWidth="3" />
            {[16, 10, 5].map((w, i) => (
              <line key={i} x1={xd(0) + span / 2 - w / 2} y1={y + 34 + i * 5} x2={xd(0) + span / 2 + w / 2} y2={y + 34 + i * 5} stroke="#c8102e" strokeWidth="3" />
            ))}
            <text x={xd(0) + span / 2 + 8} y={y + 44} fontSize="11" fill="#c8102e" fontFamily="IBM Plex Mono, monospace">GND</text>
          </g>
        )}

        {/* Class A / X return path */}
        {cfg.wiringClass !== "B" && (
          <g>
            <path d={"M " + (W - 60) + " " + y + " L " + (W - 60) + " " + yr + " L " + 90 + " " + yr + " L 90 " + (y + 62)}
              fill="none" stroke={fault && fault.kind === "short" && cfg.wiringClass === "A" ? "#c9c4b6" : wireStroke}
              strokeWidth="3" strokeDasharray={fault && fault.kind === "short" && cfg.wiringClass === "A" ? "6 6" : "none"} />
            <text x={W / 2} y={yr + 20} textAnchor="middle" fontSize="12" fill="#6b7683" fontFamily="Barlow Condensed, sans-serif" letterSpacing="1">RETURN PATH TO PANEL — CLASS {cfg.wiringClass}</text>
            {fault && fault.kind === "open" && (
              <g>
                {(() => { const [a, b] = segX(fault.seg); const mx = (a + b) / 2; return (
                  <>
                    <path d={"M " + x0 + " " + (y - 26) + " Q " + ((x0 + mx) / 2) + " " + (y - 60) + " " + (mx - 20) + " " + (y - 14)} fill="none" stroke="#1e7a3c" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arr)" />
                    <path d={"M " + (W - 62) + " " + (y - 26) + " Q " + ((W + mx) / 2 - 30) + " " + (y - 60) + " " + (mx + 20) + " " + (y - 14)} fill="none" stroke="#1e7a3c" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arr)" />
                    <text x={mx} y={y - 64} textAnchor="middle" fontSize="12" fill="#1e7a3c" fontFamily="Barlow Condensed, sans-serif">FED FROM BOTH ENDS — NO DEVICES LOST</text>
                  </>
                ); })()}
              </g>
            )}
          </g>
        )}

        {/* Class X isolators */}
        {cfg.wiringClass === "X" && Array.from({ length: segCount }, (_, i) => {
          if (i === 0 || i % 2 !== 0) return null;
          const [a] = segX(i);
          const m = a + 18;
          return (
            <g key={"iso" + i}>
              <rect x={m - 8} y={y - 8} width="16" height="16" transform={"rotate(45 " + m + " " + y + ")"} fill="#fff" stroke={wireStroke} strokeWidth="2" />
              <text x={m} y={y - 16} textAnchor="middle" fontSize="10" fill="#33566b" fontFamily="IBM Plex Mono, monospace">ISO</text>
            </g>
          );
        })}

        {/* EOL for class B */}
        {cfg.wiringClass === "B" && (
          <g>
            <rect x={W - 60} y={y - 14} width="34" height="28" rx="3" fill="#fff" stroke={fault && fault.kind === "open" ? "#c8102e" : wireStroke} strokeWidth="2" />
            <text x={W - 43} y={y + 4} textAnchor="middle" fontSize="10" fontFamily="IBM Plex Mono, monospace" fill="#33566b">EOL</text>
            <text x={W - 43} y={y + 34} textAnchor="middle" fontSize="10.5" fill="#6b7683" fontFamily="Barlow Condensed, sans-serif">END-OF-LINE</text>
          </g>
        )}

        <defs>
          <marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="#1e7a3c" />
          </marker>
        </defs>

        {/* devices */}
        {devs.map((d, i) => {
          const cx = xd(i);
          const dead = lost(i);
          return (
            <g key={d + i} className="dev-node" onClick={() => setDetail(d)} tabIndex={0} role="button"
              aria-label={(DEVICES[d] ? DEVICES[d].name : d) + (dead ? " — out of service under this fault" : "")}
              onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setDetail(d); } }}>
              <circle className="dev-body" cx={cx} cy={y} r="24"
                fill={dead ? "#fdf1f3" : "#fff"} stroke={dead ? "#c8102e" : wireStroke}
                strokeWidth="2" strokeDasharray={dead ? "4 4" : "none"} opacity={dead ? 0.9 : 1} />
              <text x={cx} y={y + 5} textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight="700" fontSize="14" fill={dead ? "#c8102e" : "#1c1e22"}>{DEV_GLYPH[d] || "?"}</text>
              <text x={cx} y={y + 46} textAnchor="middle" fontSize="10.5" fill={dead ? "#c8102e" : "#4c525b"} fontFamily="Barlow Condensed, sans-serif" letterSpacing=".5">
                {(DEVICES[d] ? DEVICES[d].name.split(" (")[0] : d).toUpperCase().slice(0, 22)}
              </text>
              {dead && <text x={cx} y={y - 34} textAnchor="middle" fontSize="10" fill="#c8102e" fontFamily="IBM Plex Mono, monospace">OUT OF SVC</text>}
            </g>
          );
        })}
      </svg>

      {faultNote
        ? <div className="teach dia-note"><b>{faultNote.t}:</b> {faultNote.m}</div>
        : <div className="teach dia-note"><b>Try it:</b> inject an open on this Class {cfg.wiringClass} circuit, then flip to the other classes in the configurator and compare which devices survive the same fault.</div>}

      {detail && DEVICES[detail] && (
        <div className="modal-scrim" onClick={() => setDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={DEVICES[detail].name}>
            <button className="modal-x" onClick={() => setDetail(null)}>✕ Close</button>
            <h3 style={{ fontSize: 24, textTransform: "uppercase", marginBottom: 2 }}>{DEVICES[detail].name}</h3>
            <TopicBody item={DEVICES[detail]} />
          </div>
        </div>
      )}
    </div>
  );
}

/* =====================================================================
   REFERENCE LIBRARY
   ===================================================================== */

function ReferencePage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const all = [
    ...Object.values(DEVICES).map(d => ({ ...d, group: "device" })),
    ...Object.values(TOPICS).map(t => ({ ...t, group: "topic", kind: "system" })),
  ];
  const ql = q.trim().toLowerCase();
  const shown = all.filter(item => {
    if (filter === "devices" && item.group !== "device") return false;
    if (filter === "topics" && item.group !== "topic") return false;
    if (!ql) return true;
    const hay = [item.name, item.howItWorks, item.expectedResult || "",
      ...(item.commonFaults || []).map(f => f.symptom + " " + f.likelyCause),
      ...(item.testProcedure || []).map(s => s.instruction)].join(" ").toLowerCase();
    return hay.includes(ql);
  });

  return (
    <div>
      <div className="eyebrow">The full curated library</div>
      <h2 className="page-title">Reference</h2>
      <p className="page-lede">
        Every device and system topic in the trainer, searchable — explanations, procedures,
        expected results, common faults, and the standard that governs each.
      </p>
      <input className="ref-search" type="search" placeholder="Search — try 'retard', 'ground fault', 'sensitivity'…"
        value={q} onChange={e => setQ(e.target.value)} aria-label="Search reference library" />
      <div className="ref-filters">
        {[["all", "All"], ["devices", "Devices"], ["topics", "System topics"]].map(([k, lbl]) => (
          <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{lbl}</button>
        ))}
      </div>
      {shown.length === 0 && <p className="empty">Nothing matches "{q}" — try a symptom ("no response"), a part ("EOL"), or a concept ("supervisory").</p>}
      {shown.map(item => <TopicCard key={item.group + item.id} item={item} kind={item.kind} defaultOpen={shown.length === 1} />)}
    </div>
  );
}

/* =====================================================================
   APP SHELL
   ===================================================================== */

const TABS = ["Configure", "Learn", "Test", "Simulate", "Reference"];

export default function FireAlarmTrainer() {
  const [cfg, setCfg] = useState(DEFAULT_CONFIG);
  const [tab, setTab] = useState("Configure");

  return (
    <div className="fat-app">
      <style>{CSS}</style>
      <header className="masthead">
        <div className="masthead-in">
          <h1>Fire Alarm <span className="red">Test</span> Trainer</h1>
          <span className="sub">Panel operation · Device testing · Circuit supervision</span>
          <span className="cfg-chip">
            {cfg.complete
              ? <><b>{cfg.panelType === "addressable" ? "ADDRESSABLE" : "CONVENTIONAL"}</b> · CLASS {cfg.wiringClass} · {cfg.devices.length} DEVICE TYPES</>
              : <>System: <b>example config</b> — run Configure to tailor it</>}
          </span>
        </div>
      </header>

      <nav className="nav" aria-label="Main">
        <div className="nav-in">
          {TABS.map((t, i) => (
            <React.Fragment key={t}>
              {i > 0 && <span className="step-arrow" aria-hidden="true">▸</span>}
              <button className={tab === t ? "on" : ""} onClick={() => setTab(t)} aria-current={tab === t ? "page" : undefined}>{t}</button>
            </React.Fragment>
          ))}
        </div>
      </nav>

      <main className="wrap">
        <div className="disclaimer" role="note">
          <b>Training &amp; familiarization tool only.</b> Always follow the equipment manufacturer's
          published instructions, the current adopted edition of NFPA 72, and the requirements of the
          Authority Having Jurisdiction. Procedures and testing frequencies vary by equipment,
          occupancy, and jurisdiction. Never test a live system without first coordinating with the
          monitoring company and building occupants.
        </div>

        {tab === "Configure" && <Configurator cfg={cfg} setCfg={setCfg} onDone={() => setTab("Learn")}
          onQuickStart={(dest) => { setCfg(c => ({ ...DEFAULT_CONFIG, complete: true })); setTab(dest); }} />}
        {tab === "Learn" && <LearnPage cfg={cfg} />}
        {tab === "Test" && <ChecklistPage cfg={cfg} />}
        {tab === "Simulate" && <Simulator cfg={cfg} />}
        {tab === "Reference" && <ReferencePage />}
      </main>
    </div>
  );
}
