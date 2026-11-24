import ValidationError from './validationError.js';

function validateId(value, field) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ValidationError(`Selecciona un ${field} válido.`);
  }
  return id;
}

function validateCost(value) {
  const cost = Number(value);
  if (
    !Number.isFinite(cost)
    || cost <= 0
    || cost > 99999999.99
    || Math.abs(cost * 100 - Math.round(cost * 100)) > 1e-8
  ) {
    throw new ValidationError('El costo debe ser mayor que 0 y tener como máximo dos decimales.');
  }
  return cost;
}

// Keeps contract fields aligned with contratos and rejects invalid foreign-key IDs.
class ContractModel {
  constructor({ idCliente, idPlan, costoTotal, metodoPago }) {
    if (typeof metodoPago !== 'string' || !metodoPago.trim()) {
      throw new ValidationError('El método de pago es obligatorio.');
    }
    if (metodoPago.trim().length > 50) {
      throw new ValidationError('El método de pago no puede superar 50 caracteres.');
    }

    this.idCliente = validateId(idCliente, 'cliente');
    this.idPlan = validateId(idPlan, 'plan');
    this.costoTotal = validateCost(costoTotal);
    this.metodoPago = metodoPago.trim();

    // Use local calendar fields so the start date does not shift with UTC offsets.
    const today = new Date();
    this.fechaInicio = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0')
    ].join('-');
  }

  toDBModel() {
    return {
      idCliente: this.idCliente,
      idPlan: this.idPlan,
      costoTotal: this.costoTotal,
      metodoPago: this.metodoPago,
      fechaInicio: this.fechaInicio
    };
  }
}

export default ContractModel;
