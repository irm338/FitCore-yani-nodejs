import database from '../config/database.js';

const editableFields = ['nombre', 'duracion', 'nivel', 'precioBase'];

// Query columns mirror the planes schema; update keys are checked before interpolation.
class PlanRepository {
  async create(plan) {
    const result = await database.execute(
      'INSERT INTO planes (nombre, duracion, nivel, precioBase) VALUES (?, ?, ?, ?)',
      [plan.nombre, plan.duracion, plan.nivel, plan.precioBase]
    );

    return { success: true, id: result.insertId };
  }

  async findAll() {
    return database.execute(
      'SELECT id, nombre, duracion, nivel, precioBase, fechaCreacion FROM planes ORDER BY id'
    );
  }

  async update(id, updates) {
    const entries = Object.entries(updates);
    if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
      throw new TypeError('El identificador del plan no es válido.');
    }
    if (entries.length === 0 || entries.some(([field]) => !editableFields.includes(field))) {
      throw new TypeError('La actualización contiene campos no permitidos.');
    }

    const setClause = entries.map(([field]) => `${field} = ?`).join(', ');
    const values = entries.map(([, value]) => value);
    const result = await database.execute(
      `UPDATE planes SET ${setClause} WHERE id = ?`,
      [...values, Number(id)]
    );

    return result.affectedRows > 0;
  }

  async delete(id) {
    const result = await database.execute('DELETE FROM planes WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

export default new PlanRepository();
