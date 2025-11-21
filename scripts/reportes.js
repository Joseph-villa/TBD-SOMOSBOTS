(function () {
  'use strict';

  // Esperar a que Chart.js esté disponible
  function waitForChartJS(callback) {
    if (typeof Chart !== 'undefined') {
      callback();
    } else {
      setTimeout(() => waitForChartJS(callback), 100);
    }
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    waitForChartJS(() => {
      // Tu código que usa Chart.js aquí
      console.log('Chart.js está listo para usar');
      generatePanel();
    });
  }

  // Exponer funciones globalmente si es necesario
  /* window.miGraficador = {
      crearGrafico: function(canvasId, config) {
          const canvas = document.getElementById(canvasId);
          return new Chart(canvas, config);
      }
  }; */
})();

// ------------- Seccion de eventos para actualizacion de reportes ------------
let reportUpdateInterval = null;
const REPORT_UPDATE_DELAY = 30000;

document.addEventListener('DOMContentLoaded', function () {
  startReportListener();
});

function startReportListener() {
  document.querySelectorAll('.menu-item').forEach(boton => {
    boton.addEventListener('click', function () {
      const tabId = this.getAttribute('data-tab') + '-tab';

      if (tabId === 'reports-tab') {
        // Reports tab clicked - start updates
        console.log("Empezar acualización de reportes...");
        startReportUpdates();
      } else {
        // Other tab clicked - stop updates  
        console.log("Detener acualización de reportes...");
        stopReportUpdates();
      }
    });
  });
}

function startReportUpdates() {
  stopReportUpdates();

  // Update immediately
  updateReports();

  // Set up periodic updates
  reportUpdateInterval = setInterval(updateReports, REPORT_UPDATE_DELAY);
}

function stopReportUpdates() {
  if (reportUpdateInterval) {
    clearInterval(reportUpdateInterval);
    reportUpdateInterval = null;
  }
}

// -------- Seccion de Actualizacion de Reportes - Consultas a Supabase --------
let reportData = null;

async function updateReports() {
  console.log("Updating Reports...");
  reportData = await getAllSupabaseData();
  console.log(reportData);
}

async function getAllSupabaseData() {
  try {
    const [
      registrosSemanales,
      registrosMensuales,
      registrosAnuales,
    ] = await Promise.all([
      getRegistrosSemanales(),
      getRegistrosMensuales(),
      getRegistrosAnuales(),
    ]);

    return {
      users: {
        weekely: registrosSemanales,
        monthly: registrosMensuales,
        yearly: registrosAnuales
      },
      eco: mockEco,
    };

  } catch (error) {
    console.error('Error cargando datos:', error);
  }
  console.log(reportData);
  // Retornar datos mock en caso de error
  return { users: mockUsers, eco: mockEco };
}

// Registros semanales (últimos 7 días) - Solo días con datos
async function getRegistrosSemanales() {
  // Calcular fecha de hace 7 días
  const fechaInicio = new Date();
  fechaInicio.setDate(fechaInicio.getDate() - 7);

  const { data, error } = await supabase
    .from('usuario')
    .select('fecha_creacion')
    .gte('fecha_creacion', fechaInicio.toISOString())
    .order('fecha_creacion', { ascending: true });

  if (error) throw error;

  // Procesar datos por día - SOLO días con registros
  const dailyCounts = {};

  // Contar registros por día
  data.forEach(user => {
    // Parsear la fecha de creación (formato: 2025-11-21 21:11:38.79002)
    const fechaCreacion = new Date(user.fecha_creacion);
    const dia = fechaCreacion.getDate().toString();
    dailyCounts[dia] = (dailyCounts[dia] || 0) + 1;
  });

  // Ordenar los días cronológicamente y filtrar solo los que tienen datos
  const diasConDatos = Object.keys(dailyCounts)
    .map(dia => parseInt(dia)) // Convertir a número para ordenar
    .sort((a, b) => a - b)     // Ordenar numéricamente
    .map(dia => dia.toString()); // Volver a string

  // Preparar arrays finales solo con días que tienen datos
  const labels = [];
  const counts = [];

  diasConDatos.forEach(dia => {
    labels.push(dia);
    counts.push(dailyCounts[dia]);
  });

  return {
    labels: labels,
    data: counts,
    title: 'Registro de usuarios semanal'
  };
}

// Registros mensuales (últimos 6 meses) - Solo meses con datos
async function getRegistrosMensuales() {
  // Calcular fecha de hace 6 meses
  const fechaInicio = new Date();
  fechaInicio.setMonth(fechaInicio.getMonth() - 6);

  const { data, error } = await supabase
    .from('usuario')
    .select('fecha_creacion')
    .gte('fecha_creacion', fechaInicio.toISOString())
    .order('fecha_creacion', { ascending: true });

  if (error) throw error;

  // Procesar datos por mes - SOLO meses con registros
  const registrosPorMes = {};

  data.forEach(user => {
    const fechaCreacion = new Date(user.fecha_creacion);
    const mes = fechaCreacion.toLocaleDateString('es-ES', {
      month: 'short',
      year: 'numeric'
    }); // Ej: "nov 2024"

    if (!registrosPorMes[mes]) {
      registrosPorMes[mes] = {
        count: 0,
        fecha: fechaCreacion,
        mesNumero: fechaCreacion.getMonth(),
        año: fechaCreacion.getFullYear()
      };
    }
    registrosPorMes[mes].count++;
  });

  // Ordenar por fecha (más antiguo primero)
  const mesesOrdenados = Object.values(registrosPorMes)
    .sort((a, b) => a.fecha - b.fecha);

  // Preparar arrays finales solo con meses que tienen datos
  const labels = mesesOrdenados.map(mes =>
    mes.fecha.toLocaleDateString('es-ES', { month: 'short' })
  );
  const counts = mesesOrdenados.map(mes => mes.count);

  return {
    labels: labels,
    data: counts,
    title: 'Registro de usuarios mensual'
  };
}

// Registros anuales - Solo años con datos
async function getRegistrosAnuales() {
  const { data, error } = await supabase
    .from('usuario')
    .select('fecha_creacion')
    .order('fecha_creacion', { ascending: true });

  if (error) throw error;

  // Procesar datos por año - SOLO años con registros
  const registrosPorAño = {};

  data.forEach(user => {
    const fechaCreacion = new Date(user.fecha_creacion);
    const año = fechaCreacion.getFullYear().toString();

    if (!registrosPorAño[año]) {
      registrosPorAño[año] = {
        count: 0,
        año: año,
        fecha: fechaCreacion
      };
    }
    registrosPorAño[año].count++;
  });

  // Ordenar por año (más antiguo primero)
  const añosOrdenados = Object.values(registrosPorAño)
    .sort((a, b) => a.año - b.año);

  // Preparar arrays finales solo con años que tienen datos
  const labels = añosOrdenados.map(año => año.año);
  const counts = añosOrdenados.map(año => año.count);

  return {
    labels: labels,
    data: counts,
    title: 'Registro de usuarios Anual'
  };
}


////////////////////////////////////////////////////////////////////////// CO2
// CO2 por categoría - Semanal
async function getCO2PorCategoriaSemanal() {
  const { data, error } = await supabase
    .from('reportes_impacto')
    .select(`
      co2_ahorrado,
      publicaciones (
        categorias (
          nombre
        )
      )
    `)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  if (error) throw error;

  const categorias = {
    'Ropa': 0,
    'Tecnología': 0,
    'Servicios': 0,
    'Otros': 0
  };

  data.forEach(reporte => {
    const categoria = reporte.publicaciones?.categorias?.nombre || 'Otros';
    categorias[categoria] = (categorias[categoria] || 0) + parseFloat(reporte.co2_ahorrado);
  });

  return {
    labels: Object.keys(categorias),
    data: Object.values(categorias),
    colores: [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)'
    ],
    bordes: [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)'
    ]
  };
}

// CO2 por categoría - Mensual
async function getCO2PorCategoriaMensual() {
  const { data, error } = await supabase
    .from('reportes_impacto')
    .select(`
      co2_ahorrado,
      publicaciones (
        categorias (
          nombre
        )
      )
    `)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  if (error) throw error;

  const categorias = {
    'Ropa': 0,
    'Tecnología': 0,
    'Servicios': 0,
    'Otros': 0
  };

  data.forEach(reporte => {
    const categoria = reporte.publicaciones?.categorias?.nombre || 'Otros';
    categorias[categoria] = (categorias[categoria] || 0) + parseFloat(reporte.co2_ahorrado);
  });

  return {
    labels: Object.keys(categorias),
    data: Object.values(categorias),
    colores: [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)'
    ],
    bordes: [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)'
    ]
  };
}

// CO2 por categoría - Anual
async function getCO2PorCategoriaAnual() {
  const { data, error } = await supabase
    .from('reportes_impacto')
    .select(`
      co2_ahorrado,
      publicaciones (
        categorias (
          nombre
        )
      )
    `)
    .gte('created_at', new Date(new Date().getFullYear(), 0, 1).toISOString());

  if (error) throw error;

  const categorias = {
    'Ropa': 0,
    'Tecnología': 0,
    'Servicios': 0,
    'Otros': 0
  };

  data.forEach(reporte => {
    const categoria = reporte.publicaciones?.categorias?.nombre || 'Otros';
    categorias[categoria] = (categorias[categoria] || 0) + parseFloat(reporte.co2_ahorrado);
  });

  return {
    labels: Object.keys(categorias),
    data: Object.values(categorias),
    colores: [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)'
    ],
    bordes: [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)'
    ]
  };
}
//////////////////////////////////////////////////////////////////////////

// -------------------- Seccion de datos de prueba --------------------------

const mockUsers = {
  weekely: {
    labels: ['13', '14', '15', '16', '17', '18', '19'],
    data: [2, 5, 12, 8, 25, 18, 15],
    title: 'Registro de usuarios semanal'
  },
  monthly: {
    labels: ['Ag', 'Sept', 'Oct', 'Nov'],
    data: [45, 78, 92, 65],
    title: 'Registro de usuarios mensual'
  },
  yearly: {
    labels: ["2024", '2025'],
    data: [200, 550],
    title: 'Registro de usuarios Anual'
  }
};

const mockEco = {
  weekely: {
    labels: ['Ropa', 'Tecnología', 'Servicios', 'Otros'],
    data: [150, 100, 200, 100], // kg de CO2 ahorrado
    colores: [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)'
    ],
    bordes: [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)'
    ]
  },
  monthly: {
    labels: ['Ropa', 'Tecnología', 'Servicios', 'Otros'],
    data: [500, 300, 700, 200], // kg de CO2 ahorrado
    colores: [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)'
    ],
    bordes: [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)'
    ]
  },
  yearly: {
    labels: ['Ropa', 'Tecnología', 'Servicios', 'Otros'],
    data: [1500, 800, 1200, 500], // kg de CO2 ahorrado
    colores: [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)'
    ],
    bordes: [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)'
    ]
  },
};

// ---------------------- Borrar Despues ------------------------------------
// Datos de supabase
async function cargarDatosGraficos() {
  try {
    const [
      registrosSemanales,
      registrosMensuales,
      registrosAnuales,
      co2Semanal,
      co2Mensual,
      co2Anual
    ] = await Promise.all([
      getRegistrosSemanales(),
      getRegistrosMensuales(),
      getRegistrosAnuales(),
      getCO2PorCategoriaSemanal(),
      getCO2PorCategoriaMensual(),
      getCO2PorCategoriaAnual()
    ]);

    return {
      mockSub: {
        weekely: registrosSemanales,
        monthly: registrosMensuales,
        yearly: registrosAnuales
      },
      mockCateg: {
        weekely: co2Semanal,
        monthly: co2Mensual,
        yearly: co2Anual
      }
    };

  } catch (error) {
    console.error('Error cargando datos:', error);
    // Retornar datos mock en caso de error
    return { mockSub, mockCateg };
  }
}

// Función para formatear números
function formatearNumero(num) {
  return new Intl.NumberFormat('es-ES').format(num);
}

// ----------------------- Control de reportes -------------------------------
let chartInstance = null;
let selectedReportType = "users";
let selectedReportTime = "weekely";
let co2 = 0;
let water = 0;

function changeReportType(type) {
  selectedReportType = type;
  generateReport();
}

function changeReportTime(time) {
  selectedReportTime = time;
  generateReport();
}

// generar el reporte actual
function generateReport() {
  console.log("Will generate", selectedReportType);

  if (selectedReportType === "users") {
    generateSubcriptionReports();
  }

  if (selectedReportType === "eco") {
    generateEcoReport("weekely");
  }
}

// Reporte registro usuarios
function generateSubcriptionReports() {
  const ctx = document.getElementById('canvas-chart-display').getContext('2d');

  // Destruir gráfico anterior si existe
  if (chartInstance) {
    chartInstance.destroy();
  }

  const data = reportData.users[selectedReportTime];

  // Configuración del gráfico
  const config = {
    type: 'bar', // Puedes cambiar a 'line' para gráfico de línea
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Número de Suscripciones',
        data: data.data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
          'rgba(83, 102, 255, 0.6)',
          'rgba(40, 159, 64, 0.6)',
          'rgba(210, 99, 132, 0.6)',
          'rgba(20, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)'
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
            text: 'Número de Registros'
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

  // Crear nuevo gráfico
  chartInstance = new Chart(ctx, config);
}

// Reporte Dona
function generateEcoReport() {
  const ctx = document.getElementById('canvas-chart-display').getContext('2d');

  if (chartInstance) {
    chartInstance.destroy();
  }

  const data = reportData.eco[selectedReportTime];
  //co2 = data.data.reduce((a, b) => a + b, 0);

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.data,
        backgroundColor: data.colores,
        borderColor: data.bordes,
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
              return `${label}: ${formatearNumero(value)} (${percentage}%)`;
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


/* WIP
function updateActiveButton(type, selected) {
  if (type === "users") {
    const buttons = document.querySelectorAll("control-button-activity");
    buttons.forEach(b => {
      if (b.classList.contains(type)) {
        b.classList.remove()
      }
    })
  }

} */

// --------------------- UI del Panel de Control -----------------------------
function generatePanel() {
  const reportContainer = document.getElementById("report-seccion-container");
  reportContainer.innerHTML = ''; // Limpiar contenedor

  //--------------- Control del tipo de Reporte ---------------------------
  const buttonConfigs = [
    { type: "users", text: "Usuarios" },
    { type: "eco", text: "Ecológico" },
  ];

  buttonConfigs.forEach(config => {
    const button = document.createElement('button');
    button.className = 'btn control-button-activity';
    button.textContent = config.text;
    button.style.marginLeft = "5px";
    button.addEventListener('click', () => changeReportType(config.type));
    reportContainer.appendChild(button);
  });

  //---------------- Elemento Grafico del Reporte --------------------------
  const canvasContainer = document.createElement("div");
  canvasContainer.style.width = "100%";
  canvasContainer.style.height = "300px";
  canvasContainer.style.alignContent = "center";

  const canvas = document.createElement("canvas");
  canvas.id = "canvas-chart-display";

  canvasContainer.appendChild(canvas);
  reportContainer.appendChild(canvasContainer);

  //---------------- Elemento de control del tiempo ------------------------
  const canvasControls = document.createElement("div");
  canvasControls.id = "canvas-display-controls";
  canvasControls.style.display = "flex";
  canvasControls.style.justifyContent = "center";
  canvasControls.style.gap = "10px";
  canvasControls.style.marginTop = "5px";

  const buttonTypes = [
    { type: "weekely", text: "Semanal" },
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