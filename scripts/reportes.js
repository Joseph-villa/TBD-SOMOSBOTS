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

////////////////////////////////////////////////////////////////////////// Consulta registros
// Registros semanales (últimos 7 días)
async function getRegistrosSemanales() {
  const { data, error } = await supabase
    .from('usuarios')
    .select('created_at')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: true });

  if (error) throw error;

  // Procesar datos por día
  const dailyCounts = {};
  data.forEach(user => {
    const day = new Date(user.created_at).getDate().toString();
    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
  });

  return {
    labels: Object.keys(dailyCounts),
    data: Object.values(dailyCounts),
    title: 'Registro de usuarios semanal'
  };
}

// Registros mensuales (últimos 4 meses)
async function getRegistrosMensuales() {
  const { data, error } = await supabase
    .from('usuarios')
    .select('created_at')
    .gte('created_at', new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: true });

  if (error) throw error;

  const monthlyCounts = {};
  data.forEach(user => {
    const month = new Date(user.created_at).toLocaleDateString('es-ES', { month: 'short' });
    monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
  });

  return {
    labels: Object.keys(monthlyCounts),
    data: Object.values(monthlyCounts),
    title: 'Registro de usuarios mensual'
  };
}

// Registros anuales
async function getRegistrosAnuales() {
  const { data, error } = await supabase
    .from('usuarios')
    .select('created_at')
    .order('created_at', { ascending: true });

  if (error) throw error;

  const yearlyCounts = {};
  data.forEach(user => {
    const year = new Date(user.created_at).getFullYear().toString();
    yearlyCounts[year] = (yearlyCounts[year] || 0) + 1;
  });

  return {
    labels: Object.keys(yearlyCounts),
    data: Object.values(yearlyCounts),
    title: 'Registro de usuarios Anual'
  };
}
////////////////////////////////////////////////////////////////////////// Consulta registros

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


const mockSub = {
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

const mockCateg = {
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

let chartInstance = null;

let co2 = 0;

function generateCategyReport(type) {
  const ctx = document.getElementById('canvas-chart-display').getContext('2d');


  if (chartInstance) {
    chartInstance.destroy();
  }

  const data = mockCateg[type];
  //co2 = data.data.reduce((a, b) => a + b, 0);

  console.log(type, data);

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
          position: 'bottom',
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


function generateSubcriptionReports(time) {
  const ctx = document.getElementById('canvas-chart-display').getContext('2d');

  // Destruir gráfico anterior si existe
  if (chartInstance) {
    chartInstance.destroy();
  }

  const data = mockSub[time];

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

// Crear un reporte de impacto
function generateReport(type) {
  console.log("Will generate", type);

  if (type === "users") {
    const canvasControls = document.getElementById("canvas-display-controls");
    canvasControls.innerHTML = '';

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
      button.addEventListener('click', () => generateSubcriptionReports(e.type));
      canvasControls.appendChild(button);
    })

    generateSubcriptionReports("weekely");
  }

  if (type === "eco") {
    const canvasControls = document.getElementById("canvas-display-controls");
    canvasControls.innerHTML = '';

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
      button.addEventListener('click', () => generateCategyReport(e.type));
      canvasControls.appendChild(button);
    })

    generateCategyReport("weekely");
  }
}

function generatePanel() {
  const reportContainer = document.getElementById("report-seccion-container");
  reportContainer.innerHTML = ''; // Limpiar contenedor

  const buttonConfigs = [
    { type: "users", text: "Usuarios" },
    { type: "eco", text: "Ecológico" },
  ];

  buttonConfigs.forEach(config => {
    const button = document.createElement('button');
    button.className = 'btn control-button-activity';
    button.textContent = config.text;
    button.style.marginLeft = "5px";
    button.addEventListener('click', () => generateReport(config.type));
    reportContainer.appendChild(button);
  });

  const canvasContainer = document.createElement("div");
  canvasContainer.style.width = "100%";
  canvasContainer.style.height = "300px";
  canvasContainer.style.alignContent = "center";

  const canvas = document.createElement("canvas");
  canvas.id = "canvas-chart-display";

  const canvasControls = document.createElement("div");
  canvasControls.id = "canvas-display-controls";
  canvasControls.style.display = "flex";
  canvasControls.style.justifyContent = "center";
  canvasControls.style.gap = "10px";
  canvasControls.style.marginTop = "5px";

  canvasContainer.appendChild(canvas);

  reportContainer.appendChild(canvasContainer);
  reportContainer.appendChild(canvasControls);
}