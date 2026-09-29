

import database from '../config/database.js';

class ClientRepository {
  constructor() {
    // Nombre de la tabla de clientes en tu base de datos MySQL
    this.tabla = 'clientes';
  }

  // Me conecta a la base de datos para poder hacer consultas
  async _obtenerConexion() {
    return await database.conectar();
  }

  // Inserta un cliente nuevo usando los datos que le pasemos
  async create(clientData) {
    try {
      const conexion = await this._obtenerConexion();
      
      // Obtenemos dinámicamente las columnas y los valores del modelo
      const columnas = Object.keys(clientData).join(', ');
      const valores = Object.values(clientData);
      const interrogaciones = valores.map(() => '?').join(', ');

      // Preparamos la consulta SQL de inserción de forma segura
      const query = `INSERT INTO ${this.tabla} (${columnas}) VALUES (${interrogaciones})`;
      const [resultado] = await conexion.execute(query, valores);
      
      return { success: true, id: resultado.insertId };
    } catch (error) {
      console.log("No se pudo registrar el cliente: " + error.message);
      throw error;
    }
  }

  // Trae todos los clientes que existan en la tabla
  async findAll() {
    try {
      const conexion = await this._obtenerConexion();
      const query = `SELECT * FROM ${this.tabla}`;
      const [filas] = await conexion.execute(query);
      
      return filas;
    } catch (error) {
      console.log("Error al consultar los clientes: " + error.message);
      throw error;
    }
  }

  
  // Actualiza los datos de un cliente existente por su ID
  async update(id, clientData){
    try{
      const conexion = await this._obtenerConexion();

    
      const campos = Object.keys(clientData).map(key => `${key} = ?`).join(', ');
      const valores = [...Object.values(clientData), id];

      const query = `UPDATE ${this.tabla} SET ${campos} WHERE id = ?`;
      const [resultado] = await conexion.execute(query, valores);
      
      return { success: true, affectedRows: resultado.affectedRows };
    } catch (error) {
      console.log("No se pudo actualizar el cliente: " + error.message);
      throw error;
    }
  }
}

export default new ClientRepository();