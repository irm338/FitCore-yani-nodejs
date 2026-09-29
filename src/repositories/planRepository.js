

// Importamos la conexión a la base de datos
import database from '../config/database.js';

/**
 * Clase PlanRepository
 * Se encarga de manejar todas las operaciones con la tabla de planes en MySQL.
 */
class PlanRepository {
  constructor() {
    this.tabla = 'planes';
  }

  // Método auxiliar para obtener la conexión
  async _obtenerConexion() {
    return await database.conectar();
  }

  // Registrar un nuevo plan
  async create(planData) {
    try {
      const conexion = await this._obtenerConexion();
      
      const columnas = Object.keys(planData).join(', ');
      const valores = Object.values(planData);
      const interrogaciones = valores.map(() => '?').join(', ');

      const query = `INSERT INTO ${this.tabla} (${columnas}) VALUES (${interrogaciones})`;
      const [resultado] = await conexion.execute(query, valores);
      
      return { success: true, id: resultado.insertId };
    } catch (error) {
      console.error("Error al registrar el plan:", error.message);
      throw error;
    }
  }

  // Obtener todos los planes
  async findAll() {
    try {
      const conexion = await this._obtenerConexion();
      const query = `SELECT * FROM ${this.tabla}`;
      const [filas] = await conexion.execute(query);
      return filas;
    } catch (error) {
      console.error("Error al obtener los planes:", error.message);
      throw error;
    }
  }

  // Actualizar un plan por su ID
  async update(id, updateData) {
    try {
      const conexion = await this._obtenerConexion();
      
      const campos = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const valores = Object.values(updateData);

      const query = `UPDATE ${this.tabla} SET ${campos} WHERE id = ?`;
      const [resultado] = await conexion.execute(query, [...valores, id]);
      
      return resultado.affectedRows > 0;
    } catch (error) {
      console.error("Error al actualizar el plan:", error.message);
      throw error;
    }
  }

  // Eliminar un plan por su ID
  async delete(id) {
    try {
      const conexion = await this._obtenerConexion();
      const query = `DELETE FROM ${this.tabla} WHERE id = ?`;
      const [resultado] = await conexion.execute(query, [id]);
      
      return resultado.affectedRows > 0;
    } catch (error) {
      console.error("Error al eliminar el plan:", error.message);
      throw error;
    }
  }
}

export default new PlanRepository();