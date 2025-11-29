// ------------------------ Variables Globales -------------------------------
let reportData = null;
let chartInstance = null;
let secondaryChartInstance = null;
let selectedReportType = "users"; // users, eco, earnings, engagement, growth
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

const mockMoneyGains = {
  weekly: {
    labels: ['15', '16', '17', '18', '19', '20', '21'],
    data: [50, 75, 120, 90, 150, 200, 180]
  },
  monthly: {
    labels: ['Mar', 'Apr', 'May', 'Jun'],
    data: [800, 1200, 950, 1100]
  },
  yearly: {
    labels: ['2020', '2021', '2022', '2023', '2024'],
    data: [6000, 5900, 6100, 6200, 6300]
  }
};

const mockCreditsGenerated = {
  weekly: {
    labels: ['15', '16', '17', '18', '19', '20', '21'],
    data: [500, 750, 1200, 900, 1500, 2000, 1800]
  },
  monthly: {
    labels: ['Mar', 'Apr', 'May', 'Jun'],
    data: [8000, 12000, 9500, 11000]
  },
  yearly: {
    labels: ['2020', '2021', '2022', '2023', '2024'],
    data: [60000, 59000, 61000, 62000, 63000]
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
    const [userData, impactData, gainsData, exchangeData, publicationData, userStatusData] = await Promise.all([
      getUnifiedUserData(),
      getUnifiedImpactData(),
      getUnifiedPackageData(),
      getUnifiedExchangeData(),
      getUnifiedPublicationData(),
      getUnifiedUserStatusData()
    ]);

    return {
      users: userData,
      eco: impactData,
      gains: gainsData,
      exchanges: exchangeData,
      publications: publicationData,
      userStatus: userStatusData
    };

  } catch (error) {
    console.error('Error loading data:', error);
    return {
      users: mockUsers, 
      eco: mockEco, 
      gains: {
        cost: mockMoneyGains,
        points: mockCreditsGenerated
      },
      exchanges: { weekly: {}, monthly: {}, yearly: {} },
      publications: { weekly: {}, monthly: {}, yearly: {} },
      userStatus: { weekly: {}, monthly: {}, yearly: {} }
    };
  }
}

// Consulta para registros de usuarios
async function getUnifiedUserData() {
  const { data, error } = await supabase
    .from('usuario')
    .select('fecha_creacion, rol')
    .neq('rol', 'Administrador')
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

  const sep = {
    users: {},
    emprs: {},
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

    if( user.rol === "Usuario" ){
      sep.users[key] = (sep.users[key] || 0) + 1;
    }
    if( user.rol === "Emprendedor" ){
      sep.emprs[key] = (sep.emprs[key] || 0) + 1;
    }
  });

  const labels = Object.keys(grouped);
  const values = Object.values(grouped);

  return {
    labels: labels,
    data: values,
    title: titles[period],
    sep
  };
}

// Consulta para Usuarios Activos e Inactivos
async function getUnifiedUserStatusData() {
  try {
    // Obtener todos los usuarios con su última sesión
    const { data: users, error: usersError } = await supabase
      .from('usuario')
      .select('auth_id, nombre_completo, fecha_creacion')
      .order('fecha_creacion', { ascending: true });

    if (usersError) throw usersError;

    console.log(`📊 Total de usuarios obtenidos: ${users ? users.length : 0}`);

    if (!users || users.length === 0) {
      console.warn('⚠️ Sin usuarios registrados');
      return {
        weekly: { 
          labels: ['Activos', 'Inactivos'], 
          data: [0, 0], 
          title: 'Usuarios por Estado Semanal',
          colors: ['rgba(76, 175, 80, 0.8)', 'rgba(244, 67, 54, 0.8)'],
          borders: ['rgba(76, 175, 80, 1)', 'rgba(244, 67, 54, 1)']
        },
        monthly: { 
          labels: ['Activos', 'Inactivos'], 
          data: [0, 0], 
          title: 'Usuarios por Estado Mensual',
          colors: ['rgba(76, 175, 80, 0.8)', 'rgba(244, 67, 54, 0.8)'],
          borders: ['rgba(76, 175, 80, 1)', 'rgba(244, 67, 54, 1)']
        },
        yearly: { 
          labels: ['Activos', 'Inactivos'], 
          data: [0, 0], 
          title: 'Usuarios por Estado Anual',
          colors: ['rgba(76, 175, 80, 0.8)', 'rgba(244, 67, 54, 0.8)'],
          borders: ['rgba(76, 175, 80, 1)', 'rgba(244, 67, 54, 1)']
        }
      };
    }

    // Obtener últimas sesiones
    const { data: sesiones, error: sesionesError } = await supabase
      .from('registro_sesiones')
      .select('auth_id, fecha_ultima_conec')
      .order('fecha_ultima_conec', { ascending: false });

    if (sesionesError) throw sesionesError;

    // Crear mapa de últimas sesiones
    const ultimasSesiones = {};
    if (sesiones) {
      sesiones.forEach(sesion => {
        if (!ultimasSesiones[sesion.auth_id]) {
          ultimasSesiones[sesion.auth_id] = sesion.fecha_ultima_conec;
        }
      });
    }

    // Clasificar usuarios como activos (últimos 30 días) e inactivos
    const clasificarUsuario = (userId) => {
      const lastLogin = ultimasSesiones[userId];
      if (!lastLogin) return 'inactivo';
      
      const lastDate = new Date(lastLogin);
      const now = new Date();
      const diffDays = (now - lastDate) / (1000 * 60 * 60 * 24);
      
      return diffDays <= 30 ? 'activo' : 'inactivo';
    };

    // Procesar datos por período
    return {
      weekly: processUserStatusByPeriod(users, 'weekly', clasificarUsuario),
      monthly: processUserStatusByPeriod(users, 'monthly', clasificarUsuario),
      yearly: processUserStatusByPeriod(users, 'yearly', clasificarUsuario)
    };

  } catch (error) {
    console.error('❌ Error obteniendo datos de estado de usuarios:', error);
    return {
      weekly: { 
        labels: ['Error'], 
        data: [0], 
        title: 'Usuarios por Estado Semanal',
        colors: ['rgba(158, 158, 158, 0.8)'],
        borders: ['rgba(158, 158, 158, 1)']
      },
      monthly: { 
        labels: ['Error'], 
        data: [0], 
        title: 'Usuarios por Estado Mensual',
        colors: ['rgba(158, 158, 158, 0.8)'],
        borders: ['rgba(158, 158, 158, 1)']
      },
      yearly: { 
        labels: ['Error'], 
        data: [0], 
        title: 'Usuarios por Estado Anual',
        colors: ['rgba(158, 158, 158, 0.8)'],
        borders: ['rgba(158, 158, 158, 1)']
      }
    };
  }
}

function processUserStatusByPeriod(data, period, clasificarUsuario) {
  let cutoffDate = new Date();

  switch (period) {
    case 'weekly':
      cutoffDate.setDate(cutoffDate.getDate() - 7);
      break;
    case 'monthly':
      cutoffDate.setMonth(cutoffDate.getMonth() - 1);
      break;
    case 'yearly':
      cutoffDate = new Date(0);
      break;
  }

  const filteredData = data.filter(user =>
    new Date(user.fecha_creacion) >= cutoffDate
  );

  let activos = 0;
  let inactivos = 0;

  filteredData.forEach(user => {
    const estado = clasificarUsuario(user.auth_id);
    if (estado === 'activo') {
      activos++;
    } else {
      inactivos++;
    }
  });

  const titles = {
    weekly: 'Usuarios por Estado Semanal',
    monthly: 'Usuarios por Estado Mensual',
    yearly: 'Usuarios por Estado Anual'
  };

  console.log(`📊 [${period}] Usuarios filtrados: ${filteredData.length}, Activos: ${activos}, Inactivos: ${inactivos}`);

  return {
    labels: ['Activos', 'Inactivos'],
    data: [activos, inactivos],
    title: titles[period],
    colors: ['rgba(76, 175, 80, 0.8)', 'rgba(244, 67, 54, 0.8)'],
    borders: ['rgba(76, 175, 80, 1)', 'rgba(244, 67, 54, 1)']
  };
}

// Consulta para Reportes_Impacto
async function getUnifiedImpactData() {
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 3); // Ultimo año

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

// Datos para Dona de Impacto Ambiental

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
  /* const categoriesWithData = Object.entries(impactByCategory)
    .filter(([_, value]) => value > 0); */
  const categoriesWithData = Object.entries(impactByCategory);

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

  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dayKey = date.getDate().toString();
    grouped.weekly.co2[dayKey] = 0;
    grouped.weekly.energy[dayKey] = 0;
    grouped.weekly.water[dayKey] = 0;
  }

  data.forEach(item => {
    const date = new Date(item.fecha_registro);

    // Group by day (weekly)
    const day = date.getDate().toString();
    if (grouped.weekly.co2.hasOwnProperty(day)) {
      groupData(grouped.weekly, day, item);
    }

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

const CURRENT_DATE = new Date(); // Debe estar en las variables globales

const MOCK_DATA = {
    cost: mockMoneyGains, // Usa tu mock de ingresos (costo)
    points: mockCreditsGenerated // Usa tu mock de créditos (puntos)
};
// Consulta para Ganancias - ¡USANDO LAS RPC DE SUPABASE!
async function getUnifiedPackageData() {
    try {
        // Llamadas Semanales
        const [w_ingresos, w_creditos] = await Promise.all([
            supabase.rpc('get_ingresos_bs_semanal'),
            supabase.rpc('get_creditos_vendidos_semanal')
        ]);

        // Llamadas Mensuales
        const [m_ingresos, m_creditos] = await Promise.all([
            supabase.rpc('get_ingresos_bs_mensual'),
            supabase.rpc('get_creditos_vendidos_mensual')
        ]);
        
        // Llamadas Anuales
        const [y_ingresos, y_creditos] = await Promise.all([
            supabase.rpc('get_ingresos_bs_anual'),
            supabase.rpc('get_creditos_vendidos_anual')
        ]);

        // Procesar y unir los resultados
        const costData = {
            weekly: processRpcData(w_ingresos.data, 'total_bs', 'Ingresos por Paquetes (Bs)', 'weekly'),
            monthly: processRpcData(m_ingresos.data, 'total_bs', 'Ingresos por Paquetes (Bs)', 'monthly'),
            yearly: processRpcData(y_ingresos.data, 'total_bs', 'Ingresos por Paquetes (Bs)', 'yearly')
        };
        
        const pointsData = {
            weekly: processRpcData(w_creditos.data, 'total_creditos', 'Créditos verdes vendidos', 'weekly'),
            monthly: processRpcData(m_creditos.data, 'total_creditos', 'Créditos verdes vendidos', 'monthly'),
            yearly: processRpcData(y_creditos.data, 'total_creditos', 'Créditos verdes vendidos', 'yearly')
        };

        return {
            cost: costData,
            points: pointsData
        };

    } catch (error) {
        console.error('Error obteniendo datos de monetización (RPC):', error);
        return {
            cost: mockMoneyGains, 
            points: mockCreditsGenerated
        };
    }
}

// Consulta para Intercambios
async function getUnifiedExchangeData() {
    try {
        const { data, error } = await supabase
            .from('Intercambio')
            .select('fecha_creacion, creditos_verdes, estado')
            .order('fecha_creacion', { ascending: true });

        if (error) throw error;

        console.log('🔄 Datos de Intercambios obtenidos:', data?.length || 0, 'registros');

        if (!data || data.length === 0) {
            console.warn('⚠️ Sin datos de intercambios, devolviendo datos vacíos con estructura');
            return {
                weekly: { labels: ['Sin datos'], data: [0], title: 'Intercambios Semanales' },
                monthly: { labels: ['Sin datos'], data: [0], title: 'Intercambios Mensuales' },
                yearly: { labels: ['Sin datos'], data: [0], title: 'Intercambios Anuales' }
            };
        }

        const result = {
            weekly: processExchangesByPeriod(data, 'weekly'),
            monthly: processExchangesByPeriod(data, 'monthly'),
            yearly: processExchangesByPeriod(data, 'yearly')
        };

        console.log('✅ Intercambios procesados:', result);
        return result;
    } catch (error) {
        console.error('❌ Error obteniendo datos de intercambios:', error);
        return {
            weekly: { labels: ['Error'], data: [0], title: 'Intercambios Semanales' },
            monthly: { labels: ['Error'], data: [0], title: 'Intercambios Mensuales' },
            yearly: { labels: ['Error'], data: [0], title: 'Intercambios Anuales' }
        };
    }
}

function processExchangesByPeriod(data, period) {
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

    const filteredData = data.filter(exchange =>
        new Date(exchange.fecha_creacion) >= cutoffDate
    );

    const grouped = {};
    const titles = {
        weekly: 'Intercambios Semanales',
        monthly: 'Intercambios Mensuales',
        yearly: 'Intercambios Anuales'
    };

    filteredData.forEach(exchange => {
        const date = new Date(exchange.fecha_creacion);
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

// Consulta para Publicaciones
async function getUnifiedPublicationData() {
    try {
        const { data, error } = await supabase
            .from('Publicacion')
            .select('fecha_publicacion, precio, estado')
            .order('fecha_publicacion', { ascending: true });

        if (error) throw error;

        console.log('📊 Datos de Publicaciones obtenidos:', data?.length || 0, 'registros');

        if (!data || data.length === 0) {
            console.warn('⚠️ Sin datos de publicaciones, devolviendo datos vacíos con estructura');
            return {
                weekly: { labels: ['Sin datos'], data: [0], title: 'Publicaciones Semanales' },
                monthly: { labels: ['Sin datos'], data: [0], title: 'Publicaciones Mensuales' },
                yearly: { labels: ['Sin datos'], data: [0], title: 'Publicaciones Anuales' }
            };
        }

        const result = {
            weekly: processPublicationsByPeriod(data, 'weekly'),
            monthly: processPublicationsByPeriod(data, 'monthly'),
            yearly: processPublicationsByPeriod(data, 'yearly')
        };

        console.log('✅ Publicaciones procesadas:', result);
        return result;
    } catch (error) {
        console.error('❌ Error obteniendo datos de publicaciones:', error);
        return {
            weekly: { labels: ['Error'], data: [0], title: 'Publicaciones Semanales' },
            monthly: { labels: ['Error'], data: [0], title: 'Publicaciones Mensuales' },
            yearly: { labels: ['Error'], data: [0], title: 'Publicaciones Anuales' }
        };
    }
}

function processPublicationsByPeriod(data, period) {
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

    const filteredData = data.filter(publication =>
        new Date(publication.fecha_publicacion) >= cutoffDate
    );

    const grouped = {};
    const titles = {
        weekly: 'Publicaciones Semanales',
        monthly: 'Publicaciones Mensuales',
        yearly: 'Publicaciones Anuales'
    };

    filteredData.forEach(publication => {
        const date = new Date(publication.fecha_publicacion);
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

// NUEVA FUNCIÓN AUXILIAR: Mapea y rellena la respuesta de la RPC
function processRpcData(data, valueKey, title, period) {
    if (!reportData) {
        const mockType = valueKey === 'total_bs' ? 'cost' : 'points';
        return MOCK_DATA[mockType][period]; 
        // Esta línea asume que MOCK_DATA[type][period] existe y está bien formateado.
    }
    
    // 1. Crear una estructura base para todo el rango (con valor 0)
    const baseRange = generateDateRange(period, CURRENT_DATE);

    // 2. Llenar la estructura base con los datos reales de la RPC
    const groupedData = data.reduce((acc, item) => {
        let rpcKey = item[Object.keys(item).find(k => k !== valueKey)]; // Obtiene la clave del período (semana, mes, anio)

        // Formatear la clave de la RPC para que coincida con la clave del rango base
        const formattedKey = formatKey(rpcKey, period); 

        const value = parseFloat(item[valueKey] || 0);

        // Si la clave existe en el rango base, le sumamos el valor
        if (acc.hasOwnProperty(formattedKey)) {
            acc[formattedKey] += value;
        }

        return acc;
    }, baseRange); // Inicia el acumulador con el rango base

    // 3. Devolver los datos listos para Chart.js
    return {
        labels: Object.keys(groupedData),
        data: Object.values(groupedData),
        title: title
    };
}


// NUEVA FUNCIÓN AUXILIAR: Genera un objeto con todas las etiquetas del rango y valor cero.
function generateDateRange(period, today) {
    const range = {};
    let count;

    if( period === 'daily' ){
      count = 7; // Últimos 6 dias
        for (let i = count - 1; i >= 0; i--) {
            const tempDate = new Date();
            tempDate.setDate(today.getDate() - i); // Retroceder dias

            const key = tempDate.getDate();
            
            if (!range.hasOwnProperty(key)) {
              range[key] = 0;
            }
        }
    } else if (period === 'weekly') {
        count = 6; // Últimas 6 semanas
        for (let i = count - 1; i >= 0; i--) {
            const tempDate = new Date();
            tempDate.setDate(today.getDate() - (i * 7)); // Retroceder semanas

            // Asumimos que la RPC nos da la semana actual (48) y las anteriores (47, 46, etc.)
            const weekNumber = getWeekNumber(tempDate);
            const key = `${weekNumber}`; // Solo el número de semana (ej: '47')
            
            if (!range.hasOwnProperty(key)) {
              range[key] = 0;
            }
        }
    } else if (period === 'monthly') {
        count = 6; // Últimos 6 meses (para coincidir con tus mocks)
        for (let i = count - 1; i >= 0; i--) {
            const tempDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
            // Usamos formato simple: 'Nov'
            const key = tempDate.toLocaleDateString('es-ES', { month: 'short' }); 
            range[key] = 0;
        }
    } else if (period === 'yearly') {
        count = 5; // Últimos 5 años (para coincidir con tus mocks)
        for (let i = count - 1; i >= 0; i--) {
            const year = today.getFullYear() - i;
            const key = year.toString(); // Ejemplo: '2025'
            range[key] = 0;
        }
    }
    
    return range;
}

// Función auxiliar para obtener el número de semana (necesario para el relleno de datos)
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo.toString();
}

// NUEVA FUNCIÓN AUXILIAR: Estandariza el formato de la clave (key)
function formatKey(rpcKey, period) {
    if (period === 'weekly') {
        // '2025-47' -> '47'
        return rpcKey.split('-')[1]; 
    } else if (period === 'monthly') {
        // '2025-11' -> 'Nov'
        const [year, month] = rpcKey.split('-');
        const monthName = new Date(year, month - 1, 1).toLocaleDateString('es-ES', { month: 'short' });
        return monthName;
    } else { 
        // '2025' -> '2025'
        return rpcKey;
    }
}

// ----------------------- Report Control -------------------------------
function changeReportType(type, event) {
  selectedReportType = type;

  document.querySelectorAll('.type-ctl-btn').forEach(btn => {
    btn.classList.remove("active");
  });

  event.target.classList.add("active");

  generateReport();
}

function changeReportTime(time, event) {
  selectedReportTime = time;

  document.querySelectorAll('.period-ctl-btn').forEach(btn => {
    btn.classList.remove("active");
  });

  event.target.classList.add("active");

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

  if (["users",].includes(selectedReportType) && 
    graphicsArea.childElementCount !== 1) {
    graphicsArea.firstChild.style.flex = "1 1 100%";
    if (graphicsArea.lastChild !== graphicsArea.firstChild) {
      graphicsArea.removeChild(graphicsArea.lastChild);
    }
  }

  if (["eco", "earnings", "engagement", "growth"].includes(selectedReportType) &&
    graphicsArea.childElementCount !== 2) {

    graphicsArea.firstChild.style.flex = "1 1 48%";
    const canvasContainerTwo = document.createElement("div");
    canvasContainerTwo.style.flex = "1 1 48%";
    canvasContainerTwo.style.minHeight = "350px";
    canvasContainerTwo.style.minWidth = "200px";
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

  if (selectedReportType === "earnings") {
    generateCreditsBought();
    generateMoneyGains();
  }

  if( selectedReportType === "engagement"){
    generateExchangesChart();
    generatePublicationsChart();
  }

  if (selectedReportType === "growth") {
    generateUserStatusChart();
    const data = prepareGrowthData(reportData.users[selectedReportTime].sep);
    renderGrowthChart(data);
  }
}

function prepareGrowthData(data) {
  const fixTime = selectedReportTime === "weekly" ? "daily" : selectedReportTime;

  const staticData = {
    users: generateDateRange(fixTime, new Date()),
    emprs: generateDateRange(fixTime, new Date()),
  }

  const staticUKeys = Object.keys(staticData.users);
  const staticEKeys = Object.keys(staticData.emprs);

  const usrKeys = Object.keys(data.users);
  const empKeys = Object.keys(data.emprs);

  usrKeys.forEach(u => {
    if(staticUKeys.includes(u))
      staticData.users[u] = data.users[u] || 0;
  });

  empKeys.forEach(e =>{
    if(staticEKeys.includes(e))
      staticData.emprs[e] = data.emprs[e] || 0;
  });

  const renderData = {
    usrs: calculateGrowth(staticData.users),
    emprs: calculateGrowth(staticData.emprs)
  };

  return renderData;
}

// Auxiliar para calcular el crecimiento
function calculateGrowth(data) {
  const fechas = Object.keys(data);
  const labels = [];
  const valores = [];

  for (let i = 1; i < fechas.length; i++) {
    const fechaAnterior = fechas[i - 1];
    const fechaActual = fechas[i];

    const valorPrevio = data[fechaAnterior];
    const valorActual = data[fechaActual];

    const crecimientoAbsoluto = valorActual - valorPrevio;

    /* const crecimientoPorcentual =
      valorPrevio === 0
        ? valorActual * 100
        : ((crecimientoAbsoluto / valorPrevio) * 100); */
    
    const crecimientoPorcentual = valorActual;

    labels.push(fechaActual);
    valores.push(Number(crecimientoPorcentual.toFixed(2)));
  }

  return {
    labels,
    data: valores
  };
}

// Reporte de registros de usuario
function generateSubscriptionReports() {
  const ctx = document.getElementById('canvas-chart-display-one').getContext('2d');

  // Destroy previous chart if exists
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
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
    chartInstance = null;
  }

  const data = reportData.eco[selectedReportTime];

  console.log(data);

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
    secondaryChartInstance = null;
  }

  const data = getCurrentEcoData();
  const config = getCurrentEcoConfig();

  // Create new chart
  secondaryChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: data.datasets
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

// Linea para creditos comprados
function generateCreditsBought() {
  const ctx = document.getElementById('canvas-chart-display-one').getContext('2d');

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const data = reportData.gains.cost[selectedReportTime];
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Ingresos por compra de Paquetes',
        data: data.data,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true
      }]
    },
    options: getPackageChartOptions('Ingresos por Paquetes (BOB)')
  });
}

// Linea para dinero ganado
function generateMoneyGains() {
  const ctx = document.getElementById("canvas-chart-display-two").getContext('2d');

  if (secondaryChartInstance) {
    secondaryChartInstance.destroy();
    secondaryChartInstance = null;
  }

  const data = reportData.gains.points[selectedReportTime];

  secondaryChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Creditos verdes vendidos',
        data: data.data,
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true
      }]
    },
    options: getPackageChartOptions('Creditos verdes vendidos')
  });
}

// Comunes para linea de ganancias
function getPackageChartOptions(title) {
  const titleES = {
    "weekly": "Semanal",
    "monthly": "Mensual",
    "yearly": "Anual"
  }

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `${title} - ${titleES[selectedReportTime]}`
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
}

// Gráfico de Intercambios
function generateExchangesChart() {
  const ctx = document.getElementById('canvas-chart-display-one').getContext('2d');

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  if (!reportData || !reportData.exchanges) {
    console.error('❌ No hay datos de intercambios disponibles');
    return;
  }

  const data = reportData.exchanges[selectedReportTime];
  
  if (!data || !data.labels || !data.data) {
    console.error('❌ Datos de intercambios inválidos:', data);
    return;
  }

  console.log('📈 Generando gráfico de intercambios con datos:', data);

  const config = {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Número de Intercambios',
        data: data.data,
        backgroundColor: [
          'rgba(76, 175, 80, 0.6)',
          'rgba(76, 175, 80, 0.6)',
          'rgba(76, 175, 80, 0.6)',
          'rgba(76, 175, 80, 0.6)',
          'rgba(76, 175, 80, 0.6)',
          'rgba(76, 175, 80, 0.6)'
        ],
        borderColor: [
          'rgba(76, 175, 80, 1)',
          'rgba(76, 175, 80, 1)',
          'rgba(76, 175, 80, 1)',
          'rgba(76, 175, 80, 1)',
          'rgba(76, 175, 80, 1)',
          'rgba(76, 175, 80, 1)'
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
            text: 'Número de Intercambios'
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

  chartInstance = new Chart(ctx, config);
}

// Gráfico de Publicaciones
function generatePublicationsChart() {
  const ctx = document.getElementById('canvas-chart-display-two').getContext('2d');

  if (secondaryChartInstance) {
    secondaryChartInstance.destroy();
    secondaryChartInstance = null;
  }

  if (!reportData || !reportData.publications) {
    console.error('❌ No hay datos de publicaciones disponibles');
    return;
  }

  const data = reportData.publications[selectedReportTime];
  
  if (!data || !data.labels || !data.data) {
    console.error('❌ Datos de publicaciones inválidos:', data);
    return;
  }

  console.log('📈 Generando gráfico de publicaciones con datos:', data);

  const config = {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Número de Publicaciones',
        data: data.data,
        backgroundColor: [
          'rgba(33, 150, 243, 0.6)',
          'rgba(33, 150, 243, 0.6)',
          'rgba(33, 150, 243, 0.6)',
          'rgba(33, 150, 243, 0.6)',
          'rgba(33, 150, 243, 0.6)',
          'rgba(33, 150, 243, 0.6)'
        ],
        borderColor: [
          'rgba(33, 150, 243, 1)',
          'rgba(33, 150, 243, 1)',
          'rgba(33, 150, 243, 1)',
          'rgba(33, 150, 243, 1)',
          'rgba(33, 150, 243, 1)',
          'rgba(33, 150, 243, 1)'
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
            text: 'Número de Publicaciones'
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

  secondaryChartInstance = new Chart(ctx, config);
}

// Gráfico de usuarios activos e inactivos
function generateUserStatusChart() {
  const ctx = document.getElementById('canvas-chart-display-one').getContext('2d');

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  if (!reportData || !reportData.userStatus) {
    console.error('❌ No hay datos de estado de usuarios disponibles');
    return;
  }

  const data = reportData.userStatus[selectedReportTime];
  
  if (!data || !data.labels || !data.data) {
    console.error('❌ Datos de estado de usuarios inválidos:', data);
    return;
  }

  console.log('📊 Generando gráfico de usuarios activos/inactivos con datos:', data);

  const config = {
    type: 'doughnut',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Usuarios',
        data: data.data,
        backgroundColor: [
          'rgba(76, 175, 80, 0.7)',  // Verde para activos
          'rgba(244, 67, 54, 0.7)'   // Rojo para inactivos
        ],
        borderColor: [
          'rgba(76, 175, 80, 1)',
          'rgba(244, 67, 54, 1)'
        ],
        borderWidth: 2
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
          cornerRadius: 4,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
      }
    }
  };

  chartInstance = new Chart(ctx, config);
}

// Gráfico para crecimiento
function renderGrowthChart(data) {
  const ctx = document.getElementById('canvas-chart-display-two').getContext('2d');
  
  // Destruir instancia anterior si existe
  if (secondaryChartInstance) {
    secondaryChartInstance.destroy();
    secondaryChartInstance = null;
  }

  const title = {
    "weekly": "Semanal",
    "monthly": "Mensual",
    "yearly": "Anual",
  }
  
  secondaryChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.usrs.labels,
      datasets: [
        {
          label: 'Usuarios',
          data: data.usrs.data,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(30, 38, 43, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Emprendedores',
          data: data.emprs.data,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Crecimiento Usuarios vs Emprendedores (${title[selectedReportTime]})`
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Crecimiento (%)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Periodo'
          }
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
  topControls.style.flexWrap = "wrap";
  topControls.style.gap = "5px";

  const buttonConfigs = [
    { type: "users", text: "Usuarios" },
    { type: "eco", text: "Impacto Ambiental" },
    { type: "earnings", text: "Dinero generado" },
    { type: "engagement", text: "Interacción" },
    { type: "growth", text: "Crecimiento" }
  ];

  buttonConfigs.forEach(config => {
    const button = document.createElement('button');
    button.className = `btn control-button-activity type-ctl-btn ${config.type === "users" ? "active" : ""}`;
    button.style.color = "black";
    button.style.backgroundColor = "white";
    button.style.borderWidth = "1px";
    button.style.borderColor = "black";
    button.style.boxShadow = "3px 3px 5px rgba(0, 0, 0, 0.3)";
    button.textContent = config.text;
    button.addEventListener('click', (e) => changeReportType(config.type, e));
    topControls.appendChild(button);
  });

  reportContainer.appendChild(topControls);

  // ----------- Graphics Area -------------------------
  const graphicsArea = document.createElement("div");
  graphicsArea.id = "graphics-area-container";
  graphicsArea.style.width = "100%";
  graphicsArea.style.minHeight = "400px";
  graphicsArea.style.display = "flex";
  graphicsArea.style.flexWrap = "wrap";
  graphicsArea.style.gap = "20px";
  graphicsArea.style.marginBottom = "20px";

  const canvasContainerOne = document.createElement("div");
  canvasContainerOne.style.flex = "1 1 100%";
  canvasContainerOne.style.minHeight = "350px";
  canvasContainerOne.style.minWidth = "200px";
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
    button.className = `btn control-button-activity period-ctl-btn ${e.type === "weekly" ? "active" : ""}`;
    button.style.color = "black";
    button.style.backgroundColor = "white";
    button.style.borderWidth = "1px";
    button.style.borderColor = "black";
    button.style.boxShadow = "3px 3px 5px rgba(0, 0, 0, 0.3)";
    button.textContent = e.text;
    button.addEventListener('click', (ev) => changeReportTime(e.type, ev));
    canvasControls.appendChild(button);
  })

  reportContainer.appendChild(canvasControls);
}