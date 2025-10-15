const { Client } = require('pg');

// Obtén estos datos de la sección de "Config" en tu proyecto de Supabase
const supabaseUrl = 'https://dzatmxvwmpczteaqpmmm.supabase.co'; // Ejemplo: https://xyzcompany.supabase.co
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6YXRteHZ3bXBjenRlYXFwbW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjY3OTAsImV4cCI6MjA3NjEwMjc5MH0.8Xf6Mx6DzJ4tGSO-VlisiBlUpgC4XxmAdNRf6j3afAs'; // Tu clave de API secreta
const databaseUrl = 'postgresql://postgres:451099KEYYS@db.dzatmxvwmpczteaqpmmm.supabase.co:5432/postgres'; // URL de la base de datos de Supabase

const client = new Client({
connectionString: databaseUrl,
ssl: {
    rejectUnauthorized: false }
});

client.connect()
.then(() => console.log('Conectado a la base de datos Supabase'))
.catch(err => console.error('Error de conexión', err));

client.query('SELECT NOW()', (err, res) => {
if (err) {
    console.error('Error al realizar la consulta', err);
} else {
    console.log('Consulta exitosa', res.rows);
}
client.end();
});
