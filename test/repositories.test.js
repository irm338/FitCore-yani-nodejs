import test, { after, beforeEach, describe } from 'node:test';
import assert from 'node:assert/strict';
import database from '../src/config/database.js';
import clientRepository from '../src/repositories/clientRepository.js';
import contractRepository from '../src/repositories/contractRepository.js';
import planRepository from '../src/repositories/planRepository.js';

const originalExecute = database.execute;
let calls;

describe('repositories', () => {
  beforeEach(() => {
    calls = [];
    database.execute = async (query, parameters = []) => {
      calls.push({ query, parameters });
      if (query.startsWith('INSERT')) {
        return { insertId: 27 };
      }
      if (query.startsWith('SELECT')) {
        return [];
      }
      return { affectedRows: 1 };
    };
  });

  after(() => {
    database.execute = originalExecute;
  });

  test('client repository uses schema columns and bound values when inserting', async () => {
    const result = await clientRepository.create({
      dpi: '1234567890',
      nombre: 'Ana',
      apellido: 'Pérez',
      correo: 'ana@example.com'
    });

    assert.deepEqual(result, { success: true, id: 27 });
    assert.equal(
      calls[0].query,
      'INSERT INTO clientes (dpi, nombre, apellido, correo) VALUES (?, ?, ?, ?)'
    );
    assert.deepEqual(calls[0].parameters, ['1234567890', 'Ana', 'Pérez', 'ana@example.com']);
  });

  test('client repository rejects unapproved update columns before querying', async () => {
    await assert.rejects(
      clientRepository.update(1, { 'correo = ?; DELETE FROM clientes; --': 'x' }),
      /campos no permitidos/
    );
    assert.equal(calls.length, 0);
  });

  test('client repository binds update values and implements deletion', async () => {
    await clientRepository.update(3, { correo: 'ana@example.com' });
    await clientRepository.delete(3);

    assert.equal(calls[0].query, 'UPDATE clientes SET correo = ? WHERE id = ?');
    assert.deepEqual(calls[0].parameters, ['ana@example.com', 3]);
    assert.equal(calls[1].query, 'DELETE FROM clientes WHERE id = ?');
    assert.deepEqual(calls[1].parameters, [3]);
  });

  test('plan repository inserts the required base price column', async () => {
    await planRepository.create({
      nombre: 'Fuerza',
      duracion: 8,
      nivel: 'intermedio',
      precioBase: 250
    });

    assert.equal(
      calls[0].query,
      'INSERT INTO planes (nombre, duracion, nivel, precioBase) VALUES (?, ?, ?, ?)'
    );
    assert.deepEqual(calls[0].parameters, ['Fuerza', 8, 'intermedio', 250]);
  });

  test('contract repository does not insert a nonexistent estado column', async () => {
    await contractRepository.create({
      idCliente: 2,
      idPlan: 5,
      costoTotal: 300,
      metodoPago: 'Efectivo',
      fechaInicio: '2026-11-24'
    });

    assert.match(
      calls[0].query,
      /INSERT INTO contratos \(idCliente, idPlan, costoTotal, metodoPago, fechaInicio\)/
    );
    assert.doesNotMatch(calls[0].query, /estado/);
    assert.deepEqual(calls[0].parameters, [2, 5, 300, 'Efectivo', '2026-11-24']);
  });

  test('client history uses only the normalized tables from the SQL schema', async () => {
    const history = await clientRepository.findHistory(5);

    assert.equal(history, null);
    assert.equal(calls.length, 5);
    assert.match(calls[0].query, /FROM clientes WHERE id = \?/);
    assert.match(calls[1].query, /FROM metas_fisicas WHERE idCliente = \?/);
    assert.match(calls[2].query, /FROM seguimiento_fisico WHERE idCliente = \?/);
    assert.match(calls[3].query, /FROM nutricion WHERE idCliente = \?/);
    assert.match(calls[4].query, /FROM contratos AS c/);
  });
});
