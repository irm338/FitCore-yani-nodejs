import database from '../config/database.js';

const editableFields = ['nombre', 'apellido', 'correo'];

// Owns client persistence and returns the related rows needed by history exports.
class ClientRepository {
  async create(client) {
    const result = await database.execute(
      'INSERT INTO clientes (dpi, nombre, apellido, correo) VALUES (?, ?, ?, ?)',
      [client.dpi, client.nombre, client.apellido, client.correo]
    );

    return { success: true, id: result.insertId };
  }

  async findAll() {
    return database.execute(
      'SELECT id, dpi, nombre, apellido, correo, telefono, fechaRegistro FROM clientes ORDER BY id'
    );
  }

  async update(id, updates) {
    const entries = Object.entries(updates);
    if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
      throw new TypeError('El identificador del cliente no es válido.');
    }
    if (entries.length === 0 || entries.some(([field]) => !editableFields.includes(field))) {
      throw new TypeError('La actualización contiene campos no permitidos.');
    }

    // Only allowlisted column names are interpolated; every user value stays parameterized.
    const setClause = entries.map(([field]) => `${field} = ?`).join(', ');
    const values = entries.map(([, value]) => value);
    const result = await database.execute(
      `UPDATE clientes SET ${setClause} WHERE id = ?`,
      [...values, Number(id)]
    );

    return result.affectedRows > 0;
  }

  async delete(id) {
    const result = await database.execute('DELETE FROM clientes WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  async findHistory(id) {
    // Keep the export aligned with the related tables defined in database/database.sql.
    const [clients, goals, measurements, nutritionPlans, contracts] = await Promise.all([
      database.execute(
        'SELECT id, dpi, nombre, apellido, correo, telefono, fechaRegistro FROM clientes WHERE id = ?',
        [id]
      ),
      database.execute('SELECT * FROM metas_fisicas WHERE idCliente = ? ORDER BY id', [id]),
      database.execute('SELECT * FROM seguimiento_fisico WHERE idCliente = ? ORDER BY fechaRegistro', [id]),
      database.execute('SELECT * FROM nutricion WHERE idCliente = ? ORDER BY id', [id]),
      database.execute(
        `SELECT c.id, c.idCliente, c.idPlan, c.costoTotal, c.metodoPago, c.fechaInicio,
                p.nombre AS nombrePlan, p.nivel, p.duracion, p.precioBase
         FROM contratos AS c
         INNER JOIN planes AS p ON p.id = c.idPlan
         WHERE c.idCliente = ?
         ORDER BY c.fechaInicio, c.id`,
        [id]
      )
    ]);

    if (clients.length === 0) {
      return null;
    }

    return {
      cliente: clients[0],
      metasFisicas: goals,
      seguimientoFisico: measurements,
      nutricion: nutritionPlans,
      contratos: contracts
    };
  }
}

export default new ClientRepository();
