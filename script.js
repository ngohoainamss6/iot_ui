const API_BASE = "https://iot-server-3v9j.onrender.com"; // ⚙️ URL server Render

const elBoxes = document.getElementById("sensor-boxes");
const elMode = document.getElementById("toggleMode");
const elPump = document.getElementById("togglePump");

let systemStatus = {};

function renderSensor(data) {
  elBoxes.innerHTML = "";
  const latest = data[0] || {};
  const sensors = [
    { name: "🌿 Độ ẩm đất", key: "soil", unit: "%", color: "bg-green-200" },
    { name: "🌤 Nhiệt độ", key: "temp", unit: "°C", color: "bg-orange-200" },
    { name: "💧 Độ ẩm KK", key: "hum", unit: "%", color: "bg-blue-200" },
    { name: "🚿 Dòng chảy", key: "flow", unit: "", color: "bg-purple-200" }
  ];

  sensors.forEach(s => {
    const val = latest[s.key] ?? "-";
    elBoxes.insertAdjacentHTML(
      "beforeend",
      `<div class="p-4 rounded-xl shadow text-center ${s.color}">
        <div class="text-gray-600 text-sm">${s.name}</div>
        <div class="text-3xl font-bold">${val}</div>
        <div class="text-gray-500 text-sm">${s.unit}</div>
      </div>`
    );
  });
}

async function fetchSensorData() {
  const res = await fetch(`${API_BASE}/api/data`);
  const data = await res.json();
  if (Array.isArray(data)) renderSensor(data);
}

async function fetchStatus() {
  const res = await fetch(`${API_BASE}/api/status`);
  systemStatus = await res.json();
  updateButtons();
}

async function sendControl(action, value) {
  await fetch(`${API_BASE}/api/control`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, value })
  });
  await fetchStatus();
}

function updateButtons() {
  elMode.textContent = systemStatus.mode || "AUTO";
  elMode.className = "px-4 py-2 rounded font-semibold " +
    (systemStatus.mode === "AUTO"
      ? "bg-blue-500 text-white"
      : "bg-gray-400 text-black");

  elPump.textContent = systemStatus.pump ? "ON" : "OFF";
  elPump.className = "px-4 py-2 rounded font-semibold " +
    (systemStatus.pump ? "bg-green-500 text-white" : "bg-red-400 text-black");
}

elMode.addEventListener("click", () => {
  const newMode = systemStatus.mode === "AUTO" ? "MANUAL" : "AUTO";
  sendControl("MODE", newMode);
});

elPump.addEventListener("click", () => {
  const newPump = systemStatus.pump ? "OFF" : "ON";
  sendControl("PUMP", newPump);
});

fetchSensorData();
fetchStatus();
setInterval(fetchSensorData, 5000);
setInterval(fetchStatus, 5000);
