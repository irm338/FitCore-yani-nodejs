
import database from '../config/database.js';

class ContractRepository {
  constructor() {
    // Nombre de la tabla de contratos en tu base de datos MySQL
    this.tabla = 'contratos';
  }

  // Método privado o auxiliar para obtener la conexión a la base de datos
  async obtenerConexion() {
    return await database.conectar();
  }

  // Inserta un contrato nuevo guardando todos los campos enviados por el modelo
  async create(datosContrato) {
    try {
      const conexion = await this.obtenerConexion();
      
      // Obtenemos dinámicamente las columnas y los valores asegurando que se guarden
      // costoTotal, metodoPago, fechaInicio, estado, idCliente e idPlan
      const columnas = Object.keys(datosContrato).join(', ');
      const valores = Object.values(datosContrato);
      const interrogaciones = valores.map(() => '?').join(', ');

      const query = `INSERT INTO ${this.tabla} (${columnas}) VALUES (${interrogaciones})`;
      
      const [resultado] = await conexion.execute(query, valores);
      
      return { success: true, id: resultado.insertId };
    } catch (error) {
      console.error("Error al registrar el contrato:", error.message);
      throw error;
    }
  }

  // Trae todos los contratos existentes en la tabla
  async findAll() {
    try {
      const conexion = await this.obtenerConexion();
      const [filas] = await conexion.execute(`SELECT * FROM ${this.tabla}`);
      return filas;
    } catch (error) {
      console.error("Error al obtener los contratos:", error.message);
      throw error;
    }
  }
}

export default new ContractRepository();