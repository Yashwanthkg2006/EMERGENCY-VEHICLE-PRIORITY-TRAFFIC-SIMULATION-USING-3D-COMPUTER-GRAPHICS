EMERGENCY VEHICLE PRIORITY TRAFFIC SIMULATION — PRO EDITION
==========================================================

CONTENTS
- index.html: Existing browser-based dashboard and simulation controls.
- simulation.js: Three.js city scene, vehicles, cameras, traffic controller and analytics.

REQUIREMENTS
- Windows 10/11, macOS or Linux
- VS Code (recommended)
- Internet connection (Three.js is loaded from jsDelivr CDN)
- A modern browser with WebGL enabled (Chrome or Edge recommended)
- A dedicated graphics card is NOT required; integrated graphics should work.

HOW TO RUN AFTER EXTRACTING
1. Extract Emergency_Traffic_Priority_Pro.zip.
2. Open the extracted Emergency_Traffic_Priority_Pro folder in VS Code.
3. Install the VS Code extension "Live Server" (Ritwick Dey), if not already installed.
4. Right-click index.html and choose "Open with Live Server".
5. Your browser should open a local address similar to http://127.0.0.1:5500.
6. Click "Start simulation" to run the demo.

ALTERNATIVE
If Python is installed, open a terminal in the extracted folder and run:
    python -m http.server 8000
Then open:
    http://localhost:8000

CONTROLS
- Start simulation: begins traffic motion and emergency detection.
- Pause: pauses/resumes the simulation.
- Reset: resets the ambulance, timers and traffic signal mode.
- Step: advances a short simulation step.
- Vehicle selection + Add selected vehicle: adds a selected vehicle to the scene.
- Simulation speed, traffic density and detection distance sliders are adjustable.
- Toggle priority route, detection radius, vehicle markers and day/night mode.
- Enable or mute the optional siren; it never starts automatically.
- Camera buttons: Main, Top, Side and Follow emergency.
- Export simulation report: downloads a CSV summary.

FEATURES IN THIS ACADEMIC PROTOTYPE
3D intersection with lane markings, zebra crossings, named city landmarks, trees,
streetlights and signals; ambulance/police/fire truck/car/bus/truck models; four
lane-following approaches; collision-aware movement and vehicle respawning; simulated
ambulance detection and signal priority; four camera views; user-controlled siren;
speed, density and detection controls; day/night mode; live waiting-time analytics,
activity log, traffic-flow graph and CSV report.

IMPORTANT TECHNICAL LIMITATIONS
This is a browser-based 3D computer-graphics simulation. It uses a software-defined
ambulance position and threshold to demonstrate emergency detection. It does NOT use
real cameras, GPS, machine learning, physical traffic sensors or actual traffic lights.
The displayed speeds, distances and waiting times are simulated values. It must never
be connected to or used to control public-road infrastructure.

TROUBLESHOOTING
- Blank 3D area: check that WebGL is enabled and update your browser.
- Three.js import error: check internet connection; the library loads from jsDelivr.
- Avoid opening index.html directly with file://; use Live Server or python http.server.
- If animation is slow, lower browser window size and close other heavy applications.
