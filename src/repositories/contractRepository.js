import database from '../config/database.js';

// Persist contracts without adding application-only fields to the SQL schema.
class ContractRepository {
  async create(contract) {
    const result = await database.execute(
      `INSERT INTO contratos (idCliente, idPlan, costoTotal, metodoPago, fechaInicio)
       VALUES (?, ?, ?, ?, ?)`,
      [
        contract.idCliente,
        contract.idPlan,
        contract.costoTotal,
        contract.metodoPago,
        contract.fechaInicio
      ]
    );

    return { success: true, id: result.insertId };
  }

  async findAll() {
    return database.execute(
      `SELECT c.id, c.idCliente, c.idPlan, c.costoTotal, c.metodoPago, c.fechaInicio,
              cl.nombre AS nombreCliente, cl.apellido AS apellidoCliente,
              p.nombre AS nombrePlan
       FROM contratos AS c
       INNER JOIN clientes AS cl ON cl.id = c.idCliente
       INNER JOIN planes AS p ON p.id = c.idPlan
       ORDER BY c.fechaInicio DESC, c.id DESC`
    );
  }
}

export default new ContractRepository();
