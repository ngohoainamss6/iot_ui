const API_BASE = "https://iot-server-yc6r.onrender.com"; // URL server

const elBoxes = document.getElementById("sensor-boxes");
const elMode = document.getElementById("toggleMode");
const elPump = document.getElementById("togglePump");

let systemStatus = {};
let latestSensor = {};

// ==== RENDER SENSOR BOXES ====
function renderSensor() {
  elBoxes.innerHTML = "";
  const sensors = [
    { name: "🌿 Độ ẩm đất", key: "soil", unit: "%", color: "bg-green-200" },
    { name: "🌤 Nhiệt độ", key: "temp", unit: "°C", color: "bg-orange-200" },
    { name: "💧 Độ ẩm KK", key: "hum", unit: "%", color: "bg-blue-200" },
    { name: "🚿 Dòng chảy", key: "flow", unit: "", color: "bg-purple-200" },
    { name: "📉 Min Threshold", key: "min_val", unit: "%", color: "bg-yellow-200" },
    { name: "📈 Max Threshold", key: "max_val", unit: "%", color: "bg-red-200" },
    { name: "⏱️ Thời gian tưới tiếp theo", key: "next_time", unit: "phút", color: "bg-gray-200" }
  ];

  sensors.forEach(s => {
    const val = latestSensor[s.key] ?? "-";
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

// ==== FETCH SENSOR DATA ====
async function fetchSensorData() {
  try {
    const res = await fetch(`${API_BASE}/api/data`);
    const data = await res.json();
    latestSensor = data[0] || {};
    renderSensor();
  } catch (err) {
    console.error("Fetch sensor data error:", err);
  }
}

// ==== FETCH SYSTEM STATUS ====
async function fetchStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/status`);
    systemStatus = await res.json();

    // Merge thresholds & next_time từ system_status nếu chưa có
    latestSensor.min_val = systemStatus.min_val ?? latestSensor.min_val;
    latestSensor.max_val = systemStatus.max_val ?? latestSensor.max_val;
    latestSensor.next_time = systemStatus.next_time ?? latestSensor.next_time;

    updateButtons();
    renderSensor();
  } catch (err) {
    console.error("Fetch system status error:", err);
  }
}

// ==== UPDATE BUTTONS ====
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

// ==== SEND CONTROL ====
async function sendControl(type, value) {
  try {
    let body = {};
    if(type === "MODE") body.mode = value;
    if(type === "PUMP") body.pump = value === "ON";

    await fetch(`${API_BASE}/api/control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    await fetchStatus();
  } catch(err) {
    console.error("Send control error:", err);
  }
}

// ==== EVENT LISTENERS ====
elMode.addEventListener("click", () => {
  const newMode = systemStatus.mode === "AUTO" ? "MANUAL" : "AUTO";
  sendControl("MODE", newMode);
});

elPump.addEventListener("click", () => {
  const newPump = systemStatus.pump ? "OFF" : "ON";
  sendControl("PUMP", newPump);
});

// ==== AUTO REFRESH ====
fetchSensorData();
fetchStatus();
setInterval(fetchSensorData, 5000);
setInterval(fetchStatus, 5000);
