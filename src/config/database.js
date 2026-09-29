


// Importamos dotenv por si acaso y mysql2
import mysql from 'mysql2/promise';
import 'dotenv/config'; // Asegura que se lean las variables del .env

class BaseDeDatos {
  constructor() {
    // Creamos el pool de conexiones usando las variables del archivo .env
    this.poolConexion = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  // Definimos ambos nombres (connect y conectar) para evitar errores
  async conectar() {
    return await this.connect();
  }

  async connect() {
    try {
      // Probamos obtener una conexión para verificar que todo funcione
      const conexion = await this.poolConexion.getConnection();
      console.log("¡Conectado exitosamente a la base de datos MySQL!");
      conexion.release(); // Devolvemos la conexión al pool
      return this.poolConexion;
    } catch (error) {
      console.error("Error al conectar a la base de datos MySQL:", error.message);
      throw error;
    }
  }

  async desconectar() {
    try {
      await this.poolConexion.end();
      console.log("Conexión a MySQL cerrada correctamente.");
    } catch (error) {
      console.error("Error al cerrar la conexión:", error.message);
    }
  }
}

// Exportamos una única instancia lista para usar en todo el proyecto
export default new BaseDeDatos();