import test from 'node:test';
import assert from 'node:assert/strict';
import ClientModel from '../src/models/client.js';
import ContractModel from '../src/models/contract.js';
import PlanModel from '../src/models/plan.js';
import ValidationError from '../src/models/validationError.js';

test('ClientModel trims input and emits only client table fields', () => {
  const client = new ClientModel({
    dpi: ' 1234567890101 ',
    nombre: ' Ana ',
    apellido: ' Pérez ',
    correo: ' ana@example.com '
  });

  assert.deepEqual(client.toDBModel(), {
    dpi: '1234567890101',
    nombre: 'Ana',
    apellido: 'Pérez',
    correo: 'ana@example.com'
  });
});

test('ClientModel rejects blank values and malformed email addresses', () => {
  assert.throws(
    () => new ClientModel({ dpi: ' ', nombre: 'Ana', apellido: 'Pérez', correo: 'ana@example.com' }),
    ValidationError
  );
  assert.throws(
    () => new ClientModel({ dpi: '123', nombre: 'Ana', apellido: 'Pérez', correo: 'no-es-correo' }),
    /correo electrónico válido/
  );
});

test('ClientModel accepts only editable client fields in updates', () => {
  assert.deepEqual(ClientModel.validateUpdates({ nombre: ' Ana ' }), { nombre: 'Ana' });
  assert.throws(
    () => ClientModel.validateUpdates({ dpi: '123' }),
    /campo válido/
  );
});

test('PlanModel maps to the schema fields and validates money and duration', () => {
  const plan = new PlanModel({
    nombre: ' Fuerza ',
    duracion: '8',
    nivel: 'INTERMEDIO',
    precioBase: '250.50'
  });

  assert.deepEqual(plan.toDBModel(), {
    nombre: 'Fuerza',
    duracion: 8,
    nivel: 'intermedio',
    precioBase: 250.5
  });
  assert.throws(
    () => new PlanModel({ nombre: 'Fuerza', duracion: '1.5', nivel: 'avanzado', precioBase: 250 }),
    /entero de semanas/
  );
  assert.throws(
    () => new PlanModel({ nombre: 'Fuerza', duracion: 8, nivel: 'avanzado', precioBase: 0 }),
    /precio debe ser mayor/
  );
});

test('ContractModel emits only columns defined by contratos', () => {
  const contract = new ContractModel({
    idCliente: '4',
    idPlan: 9,
    costoTotal: '125.75',
    metodoPago: ' Tarjeta '
  });

  assert.deepEqual(Object.keys(contract.toDBModel()), [
    'idCliente',
    'idPlan',
    'costoTotal',
    'metodoPago',
    'fechaInicio'
  ]);
  assert.match(contract.fechaInicio, /^\d{4}-\d{2}-\d{2}$/);
  assert.throws(
    () => new ContractModel({ idCliente: 0, idPlan: 9, costoTotal: 125, metodoPago: 'Efectivo' }),
    /cliente válido/
  );
});
