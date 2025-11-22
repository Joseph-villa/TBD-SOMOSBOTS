// ------------------------ Variables Globales -------------------------------
let reportData = null;
let chartInstance = null;
let secondaryChartInstance = null;
let selectedReportType = "users"; // users, eco
let selectedReportTime = "weekly"; // weekly, monthly, yearly
let selectedEcoType = "all"; // all, co2, water, energy
let co2Saved = 0;
let energySaved = 0;
let waterSaved = 0;

let reportUpdateInterval = null;
const REPORT_UPDATE_DELAY = 30000;

// ------------------------ Datos para pruebas -------------------------------
const mockUsers = {
  weekly: {
    labels: ['13', '14', '15', '16', '17', '18', '19'],
    data: [2, 5, 12, 8, 25, 18, 15],
    title: 'Registro de usuarios semanal'
  },
  monthly: {
    labels: ['Aug', 'Sep', 'Oct', 'Nov'],
    data: [45, 78, 92, 65],
    title: 'Registro de usuarios mensual'
  },
  yearly: {
    labels: ["2024", '2025'],
    data: [200, 550],
    title: 'Registro de usuarios anual'
  }
};

const mockEco = {
  weekly: {
    labels: ['Ropa', 'Electrónicos', 'Servicios', 'Otros'],
    data: [150, 100, 200, 100],
    colors: [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)'
    ],
    borders: [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)'
    ],
    title: 'Weekly CO2 Savings'
  },
  monthly: {
    labels: ['Ropa', 'Electrónicos', 'Servicios', 'Otros'],
    data: [500, 300, 700, 200],
    colors: [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)'
    ],
    borders: [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)'
    ],
    title: 'Monthly CO2 Savings'
  },
  yearly: {
    labels: ['Ropa', 'Electrónicos', 'Servicios', 'Otros'],
    data: [1500, 800, 1200, 500],
    colors: [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)'
    ],
    borders: [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)'
    ],
    title: 'Yearly CO2 Savings'
  }
};

const mockEcoLine = {
  weekly: {
    co2: {
      labels: ['18', '19', '20', '21', '22', '23', '24'],
      data: [120, 150, 180, 210, 190, 220, 250]
    },
    energy: {
      labels: ['18', '19', '20', '21', '22', '23', '24'],
      data: [45, 52, 48, 60, 55, 65, 70]
    },
    water: {
      labels: ['18', '19', '20', '21', '22', '23', '24'],
      data: [800, 950, 1100, 1250, 1150, 1300, 1400]
    }
  },
  monthly: {
    co2: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [650, 720, 810, 780, 850, 920]
    },
    energy: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [240, 260, 280, 270, 290, 310]
    },
    water: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [5200, 5800, 6400, 6100, 6700, 7200]
    }
  },
  yearly: {
    co2: {
      labels: ['2020', '2021', '2022', '2023', '2024'],
      data: [2800, 3500, 4200, 5100, 6500]
    },
    energy: {
      labels: ['2020', '2021', '2022', '2023', '2024'],
      data: [980, 1200, 1450, 1750, 2100]
    },
    water: {
      labels: ['2020', '2021', '2022', '2023', '2024'],
      data: [18500, 22000, 26000, 31000, 38000]
    }
  }
};

// --------------------- Asegurar Chart.js disponible ------------------------
(function () {
  'use strict';

  function waitForChartJS(callback) {
    if (typeof Chart !== 'undefined') {
      callback();
    } else {
      setTimeout(() => waitForChartJS(callback), 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    waitForChartJS(() => {
      generatePanel();
    });
  }
})();

// --------------- Actualizacion para eventos de consulta --------------------
document.addEventListener('DOMContentLoaded', function () {
  startReportListener();
});

function startReportListener() {
  document.querySelectorAll('.menu-item').forEach(button => {
    button.addEventListener('click', function () {
      const tabId = this.getAttribute('data-tab') + '-tab';

      if (tabId === 'reports-tab') {
        startReportUpdates();
      } else {
        stopReportUpdates();
      }
    });
  });
}

function startReportUpdates() {
  stopReportUpdates();
  updateReports();
  reportUpdateInterval = setInterval(updateReports, REPORT_UPDATE_DELAY);
}

function stopReportUpdates() {
  if (reportUpdateInterval) {
    clearInterval(reportUpdateInterval);
    reportUpdateInterval = null;
  }
}

// ------------ Actualizacion de reportes y consultas a Supabase ------------
async function updateReports() {
  console.log("Actualizando reportes...");
  reportData = await getAllSupabaseData();
  generateReport();
}

// Funcion para obtener todos los datos de supabase
async function getAllSupabaseData() {
  try {
    const [userData, impactData] = await Promise.all([
      getUnifiedUserData(),
      getUnifiedImpactData()
    ]);

    return {
      users: userData,
      eco: impactData
    };

  } catch (error) {
    console.error('Error loading data:', error);
    return { users: mockUsers, eco: mockEco };
  }
}

// Obtener registros de usuarios
async function getUnifiedUserData() {
  const { data, error } = await supabase
    .from('usuario')
    .select('fecha_creacion')
    .order('fecha_creacion', { ascending: true });

  if (error) throw error;

  if (!data || data.length === 0) {
    return {
      weekly: mockUsers.weekly,
      monthly: mockUsers.monthly,
      yearly: mockUsers.yearly
    };
  }

  // Obtener los distintos periodos
  return {
    weekly: processUsersByPeriod(data, 'weekly'),
    monthly: processUsersByPeriod(data, 'monthly'),
    yearly: processUsersByPeriod(data, 'yearly')
  };
}

function processUsersByPeriod(data, period) {
  let cutoffDate = new Date();

  switch (period) {
    case 'weekly':
      cutoffDate.setDate(cutoffDate.getDate() - 7);
      break;
    case 'monthly':
      cutoffDate.setMonth(cutoffDate.getMonth() - 6);
      break;
    case 'yearly':
      cutoffDate = new Date(0);
      break;
  }

  const filteredData = data.filter(user =>
    new Date(user.fecha_creacion) >= cutoffDate
  );

  const grouped = {};
  const titles = {
    weekly: 'Registros semanales',
    monthly: 'Registros mensuales',
    yearly: 'Registros anuales'
  };

  filteredData.forEach(user => {
    const date = new Date(user.fecha_creacion);
    let key;

    switch (period) {
      case 'weekly':
        key = date.getDate().toString();
        break;
      case 'monthly':
        key = date.toLocaleDateString('es-ES', { month: 'short' });
        break;
      case 'yearly':
        key = date.getFullYear().toString();
        break;
    }

    grouped[key] = (grouped[key] || 0) + 1;
  });

  const labels = Object.keys(grouped);
  const values = Object.values(grouped);

  return {
    labels: labels,
    data: values,
    title: titles[period]
  };
}

// Consulta para Reportes_Impacto
async function getUnifiedImpactData() {
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1); // Ultimo año

  const { data, error } = await supabase
    .from('Reportes_Impacto')
    .select(`
      co2,
      energia_ahorrada,
      agua_preservada,
      fecha_registro,
      Publicacion (
        categoria (
          nombre
        )
      )
    `)
    .gte('fecha_registro', startDate.toISOString())
    .order('fecha_registro', { ascending: true });

  if (error) throw error;

  if (!data || data.length === 0) {
    return {
      weekly: mockEco.weekly,
      monthly: mockEco.monthly,
      yearly: mockEco.yearly,
      line: mockEcoLine
    }
  }

  // Obtener los datos para los graficos de linea y torta
  return {
    weekly: processImpactForDonut(data, 'weekly'),
    monthly: processImpactForDonut(data, 'monthly'),
    yearly: processImpactForDonut(data, 'yearly'),
    // Data for line chart
    line: processImpactForLine(data)
  };
}

function processImpactForDonut(data, period) {
  const cutoffDate = new Date();

  switch (period) {
    case 'weekly':
      cutoffDate.setDate(cutoffDate.getDate() - 7);
      break;
    case 'monthly':
      cutoffDate.setMonth(cutoffDate.getMonth() - 1);
      break;
    case 'yearly':
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
      break;
  }

  const filteredData = data.filter(item =>
    new Date(item.fecha_registro) >= cutoffDate
  );

  const impactByCategory = {
    'Ropa': 0,
    'Electrónicos': 0,
    'Servicios': 0,
    'Otros': 0
  };

  filteredData.forEach(report => {
    // CORRECTION: Use correct relationship name
    const category = report.Publicacion?.categoria?.nombre || 'Otros';
    // Map Spanish category names to English
    const englishCategory = mapCategory(category);
    impactByCategory[englishCategory] += parseFloat(report.co2) || 0;
  });

  // Filter categories with data
  const categoriesWithData = Object.entries(impactByCategory)
    .filter(([_, value]) => value > 0);

  const labels = categoriesWithData.map(([category]) => category);
  const values = categoriesWithData.map(([_, value]) => value);

  const titles = {
    weekly: 'Ahorro de CO2 semanal',
    monthly: 'Ahorro de CO2 mensual',
    yearly: 'Ahorro de CO2 anual'
  };

  return {
    labels: labels,
    data: values,
    colors: [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)'
    ],
    borders: [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)'
    ],
    title: titles[period]
  };
}

function mapCategory(spanishCategory) {
  const categoryMap = {
    'Ropa': 'Ropa',
    'Electrónicos': 'Electrónicos',
    'Servicios': 'Servicios',
    'Otros': 'Otros'
  };
  return categoryMap[spanishCategory] || 'Otros';
}

function processImpactForLine(data) {
  const grouped = {
    weekly: { co2: {}, energy: {}, water: {} },
    monthly: { co2: {}, energy: {}, water: {} },
    yearly: { co2: {}, energy: {}, water: {} }
  };

  data.forEach(item => {
    const date = new Date(item.fecha_registro);

    // Group by day (weekly)
    const day = date.getDate().toString();
    groupData(grouped.weekly, day, item);

    // Group by month (monthly)  
    const month = date.toLocaleDateString('es-ES', { month: 'short' });
    groupData(grouped.monthly, month, item);

    // Group by year (yearly)
    const year = date.getFullYear().toString();
    groupData(grouped.yearly, year, item);
  });

  // Convert to chart format
  return {
    weekly: convertForLine(grouped.weekly),
    monthly: convertForLine(grouped.monthly),
    yearly: convertForLine(grouped.yearly)
  };
}

function groupData(grouped, key, item) {
  if (!grouped.co2[key]) grouped.co2[key] = 0;
  if (!grouped.energy[key]) grouped.energy[key] = 0;
  if (!grouped.water[key]) grouped.water[key] = 0;

  grouped.co2[key] += parseFloat(item.co2) || 0;
  grouped.energy[key] += parseFloat(item.energia_ahorrada) || 0;
  grouped.water[key] += parseFloat(item.agua_preservada) || 0;
}

function convertForLine(grouped) {
  // Use CO2 keys as reference (should be the same for all)
  const labels = Object.keys(grouped.co2);

  return {
    co2: {
      labels: labels,
      data: labels.map(key => grouped.co2[key])
    },
    energy: {
      labels: labels,
      data: labels.map(key => grouped.energy[key])
    },
    water: {
      labels: labels,
      data: labels.map(key => grouped.water[key])
    }
  };
}



// ----------------------- Report Control -------------------------------
function changeReportType(type) {
  selectedReportType = type;
  generateReport();
}

function changeReportTime(time) {
  selectedReportTime = time;
  generateReport();
}

function changeEcoType(type) {
  selectedEcoType = type;
  generateReport();
}

// Prepare Graphics Area
function prepareGraphicsArea() {
  const graphicsArea = document.getElementById("graphics-area-container");
  if (!graphicsArea) return;

  if (selectedReportType === "users" && graphicsArea.childElementCount !== 1) {
    graphicsArea.firstChild.style.flex = "1 1 100%";
    if (graphicsArea.lastChild !== graphicsArea.firstChild) {
      graphicsArea.removeChild(graphicsArea.lastChild);
    }
  }

  if (selectedReportType === "eco" && graphicsArea.childElementCount !== 2) {
    graphicsArea.firstChild.style.flex = "1 1 48%";
    const canvasContainerTwo = document.createElement("div");
    canvasContainerTwo.style.flex = "1 1 48%";
    canvasContainerTwo.style.minHeight = "350px";
    canvasContainerTwo.style.position = "relative";

    const canvasTwo = document.createElement("canvas");
    canvasTwo.id = "canvas-chart-display-two";

    canvasContainerTwo.appendChild(canvasTwo);
    graphicsArea.appendChild(canvasContainerTwo);
  }
}

// Generate current report
function generateReport() {
  prepareGraphicsArea();

  if (selectedReportType === "users") {
    generateSubscriptionReports();
  }

  if (selectedReportType === "eco") {
    generateEcoDonut();
    generateEcoLine();
  }
}

// Reporte de registros de usuario
function generateSubscriptionReports() {
  const ctx = document.getElementById('canvas-chart-display-one').getContext('2d');

  // Destroy previous chart if exists
  if (chartInstance) {
    chartInstance.destroy();
  }

  const data = reportData.users[selectedReportTime];

  // Chart configuration
  const config = {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Numbero de Registros',
        data: data.data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: data.title,
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: 20
        },
        legend: {
          display: true,
          position: 'top',
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          cornerRadius: 4
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          title: {
            display: true,
            text: 'Numbero de Registros'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
      }
    }
  };

  // Create new chart
  chartInstance = new Chart(ctx, config);
}

// Donut chart for environmental impact
function generateEcoDonut() {
  const ctx = document.getElementById('canvas-chart-display-one').getContext('2d');

  if (chartInstance) {
    chartInstance.destroy();
  }

  const data = reportData.eco[selectedReportTime];

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.data,
        backgroundColor: data.colors,
        borderColor: data.borders,
        borderWidth: 2,
        hoverOffset: 15
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${formatNumber(value)} (${percentage}%)`;
            }
          }
        }
      },
      animation: {
        animateScale: true,
        animateRotate: true
      }
    }
  });
}

// Line chart for environmental impact
function generateEcoLine() {
  const ctx = document.getElementById("canvas-chart-display-two").getContext('2d');

  if (secondaryChartInstance) {
    secondaryChartInstance.destroy();
  }

  const data = getCurrentEcoData();
  const config = getCurrentEcoConfig();

  // Create new chart
  secondaryChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: config.datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: config.title,
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: 20
        },
        legend: {
          display: config.showLegend,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: config.primaryColor,
          borderWidth: 1,
          cornerRadius: 6,
          callbacks: {
            label: function (context) {
              const dataset = context.dataset;
              const value = context.parsed.y;
              const unit = dataset.unit || '';
              return `${dataset.label}: ${value} ${unit}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          title: {
            display: true,
            text: config.yUnit,
            font: {
              weight: 'bold'
            }
          },
          ticks: {
            callback: function (value) {
              return value + ' ' + config.shortUnit;
            }
          }
        },
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          title: {
            display: true,
            text: config.xTitle,
            font: {
              weight: 'bold'
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      animation: {
        duration: 800,
        easing: 'easeOutQuart'
      },
      elements: {
        line: {
          borderJoinStyle: 'round'
        }
      }
    }
  });
}

// ------------------ Auxiliares para grafico de Linea Chart -----------------
function getCurrentEcoData() {
  if (!reportData || !reportData.eco || !reportData.eco.line) {
    // Fallback to mock data if no real data
    if (selectedEcoType === 'all') {
      return getCombinedEcoData();
    } else {
      return mockEcoLine[selectedReportTime][selectedEcoType];
    }
  }

  // Use real data from Supabase
  const realData = reportData.eco.line[selectedReportTime];

  if (selectedEcoType === 'all') {
    return {
      labels: realData.co2.labels,
      datasets: [
        {
          label: 'CO2 ahorrado',
          data: realData.co2.data,
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 3,
          tension: 0.4,
          fill: false,
          pointBackgroundColor: 'rgba(75, 192, 192, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          unit: 'kg'
        },
        {
          label: 'Energía ahorrada',
          data: realData.energy.data,
          backgroundColor: 'rgba(255, 159, 64, 0.1)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 3,
          tension: 0.4,
          fill: false,
          pointBackgroundColor: 'rgba(255, 159, 64, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          unit: 'kWh'
        },
        {
          label: 'Agua preservada',
          data: realData.water.data,
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 3,
          tension: 0.4,
          fill: false,
          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          unit: 'L'
        }
      ]
    };
  } else {
    return realData[selectedEcoType];
  }
}

function getCombinedEcoData() {
  const co2Data = mockEcoLine[selectedReportTime].co2;
  const energyData = mockEcoLine[selectedReportTime].energy;
  const waterData = mockEcoLine[selectedReportTime].water;

  // Use CO2 labels as reference (should be the same for all)
  return {
    labels: co2Data.labels,
    datasets: [
      {
        label: 'CO2 ahorrado',
        data: co2Data.data,
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 3,
        tension: 0.4,
        fill: false,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        unit: 'kg'
      },
      {
        label: 'Energía ahorrada',
        data: energyData.data,
        backgroundColor: 'rgba(255, 159, 64, 0.1)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 3,
        tension: 0.4,
        fill: false,
        pointBackgroundColor: 'rgba(255, 159, 64, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        unit: 'kWh'
      },
      {
        label: 'Agua preservada',
        data: waterData.data,
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 3,
        tension: 0.4,
        fill: false,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        unit: 'L'
      }
    ]
  };
}

function getCurrentEcoConfig() {
  const titles = {
    "weekly": "Semanal",
    "monthly": "Mensual",
    "yearly": "Anual"
  }

  const configs = {
    co2: {
      datasets: [{
        label: 'CO2 Saved',
        data: mockEcoLine[selectedReportTime].co2.data,
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        hoverRadius: 8,
        unit: 'kg'
      }],
      title: `CO2 Saved - ${titles[selectedReportTime]}`,
      yUnit: 'CO2 Saved (kg)',
      shortUnit: 'kg',
      xTitle: titles[selectedReportTime],
      primaryColor: 'rgba(75, 192, 192, 1)',
      showLegend: true
    },
    energy: {
      datasets: [{
        label: 'Energy Saved',
        data: mockEcoLine[selectedReportTime].energy.data,
        backgroundColor: 'rgba(255, 159, 64, 0.1)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(255, 159, 64, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        unit: 'kWh'
      }],
      title: `Energy Saved - ${titles[selectedReportTime]}`,
      yUnit: 'Energy Saved (kWh)',
      shortUnit: 'kWh',
      xTitle: titles[selectedReportTime],
      primaryColor: 'rgba(255, 159, 64, 1)',
      showLegend: true
    },
    water: {
      datasets: [{
        label: 'Water Preserved',
        data: mockEcoLine[selectedReportTime].water.data,
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        unit: 'L'
      }],
      title: `Water Preserved - ${titles[selectedReportTime]}`,
      yUnit: 'Water Preserved (L)',
      shortUnit: 'L',
      xTitle: titles[selectedReportTime],
      primaryColor: 'rgba(54, 162, 235, 1)',
      showLegend: true
    },
    all: {
      datasets: getCombinedEcoData().datasets,
      title: `Impacto Ambiental  - ${titles[selectedReportTime]}`,
      yUnit: 'Valor',
      shortUnit: '',
      xTitle: titles[selectedReportTime],
      primaryColor: 'rgba(75, 192, 192, 1)',
      showLegend: true
    }
  };

  return configs[selectedEcoType];
}

// Utility function
function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}

// --------------------- UI de Panel de control ------------------------------
function generatePanel() {
  const reportContainer = document.getElementById("report-seccion-container");
  reportContainer.innerHTML = ''; // Clear container

  // ------------ Report Type Control Section -----------
  const topControls = document.createElement("div");
  topControls.style.width = "100%";
  topControls.style.marginBottom = "20px";
  topControls.style.display = "flex";
  topControls.style.gap = "5px";

  const buttonConfigs = [
    { type: "users", text: "Usuarios Registrados" },
    { type: "eco", text: "Impacto Ambiental" },
  ];

  buttonConfigs.forEach(config => {
    const button = document.createElement('button');
    button.className = 'btn control-button-activity';
    button.textContent = config.text;
    button.addEventListener('click', () => changeReportType(config.type));
    topControls.appendChild(button);
  });

  reportContainer.appendChild(topControls);

  // ----------- Graphics Area -------------------------
  const graphicsArea = document.createElement("div");
  graphicsArea.id = "graphics-area-container";
  graphicsArea.style.width = "100%";
  graphicsArea.style.height = "400px";
  graphicsArea.style.display = "flex";
  graphicsArea.style.flexWrap = "wrap";
  graphicsArea.style.gap = "20px";
  graphicsArea.style.marginBottom = "20px";

  const canvasContainerOne = document.createElement("div");
  canvasContainerOne.style.flex = "1 1 100%";
  canvasContainerOne.style.minHeight = "350px";
  canvasContainerOne.style.position = "relative";

  const canvasOne = document.createElement("canvas");
  canvasOne.id = "canvas-chart-display-one";

  canvasContainerOne.appendChild(canvasOne);
  graphicsArea.appendChild(canvasContainerOne);

  reportContainer.appendChild(graphicsArea);

  // ------------ Control del Periodo -------------------
  const canvasControls = document.createElement("div");
  canvasControls.id = "canvas-display-controls";
  canvasControls.style.display = "flex";
  canvasControls.style.justifyContent = "center";
  canvasControls.style.gap = "10px";

  const buttonTypes = [
    { type: "weekly", text: "Semanal" },
    { type: "monthly", text: "Mensual" },
    { type: "yearly", text: "Anual" },
  ]

  buttonTypes.forEach(e => {
    const button = document.createElement('button');
    button.className = 'btn control-button-activity';
    button.style.color = "black";
    button.style.backgroundColor = "white";
    button.style.borderWidth = "1px";
    button.style.borderColor = "black";
    button.style.boxShadow = "3px 3px 5px rgba(0, 0, 0, 0.5)";
    button.textContent = e.text;
    button.addEventListener('click', () => changeReportTime(e.type));
    canvasControls.appendChild(button);
  })

  reportContainer.appendChild(canvasControls);
}