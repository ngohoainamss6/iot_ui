// ⚠️ Đổi link API này sang link Render backend của bạn
const apiUrl = "https://iot-server-3v9j.onrender.com/api/data";
let chartTemp, chartSoil;

async function fetchData() {
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return;

    const sorted = [...data].reverse();
    const tbody = document.querySelector("#dataTable tbody");
    tbody.innerHTML = "";

    sorted.forEach(item => {
      const row = `
        <tr>
          <td>${new Date(item.time).toLocaleString("vi-VN")}</td>
          <td>${item.soil}</td>
          <td>${item.temp}</td>
          <td>${item.hum}</td>
          <td>${item.flow}</td>
          <td>${item.mode}</td>
        </tr>`;
      tbody.insertAdjacentHTML("beforeend", row);
    });

    const labels = sorted.map(d => new Date(d.time).toLocaleTimeString("vi-VN"));
    const temps = sorted.map(d => d.temp);
    const soils = sorted.map(d => d.soil);

    if (!chartTemp) {
      chartTemp = new Chart(document.getElementById("chartTemp"), {
        type: "line",
        data: {
          labels,
          datasets: [{ label: "Nhiệt độ (°C)", data: temps, borderColor: "red", tension: 0.3 }]
        }
      });
    } else {
      chartTemp.data.labels = labels;
      chartTemp.data.datasets[0].data = temps;
      chartTemp.update();
    }

    if (!chartSoil) {
      chartSoil = new Chart(document.getElementById("chartSoil"), {
        type: "line",
        data: {
          labels,
          datasets: [{ label: "Độ ẩm đất (%)", data: soils, borderColor: "green", tension: 0.3 }]
        }
      });
    } else {
      chartSoil.data.labels = labels;
      chartSoil.data.datasets[0].data = soils;
      chartSoil.update();
    }

  } catch (err) {
    console.error("Fetch error:", err);
  }
}

fetchData();
setInterval(fetchData, 5000);
