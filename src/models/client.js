import ValidationError from './validationError.js';

const clientFields = {
  dpi: { label: 'DPI', maxLength: 20 },
  nombre: { label: 'nombre', maxLength: 50 },
  apellido: { label: 'apellido', maxLength: 50 },
  correo: { label: 'correo', maxLength: 100 }
};

function validateText(value, field) {
  if (typeof value !== 'string') {
    throw new ValidationError(`El campo ${field.label} debe ser texto.`);
  }

  const normalizedValue = value.trim();
  if (!normalizedValue) {
    throw new ValidationError(`El campo ${field.label} es obligatorio.`);
  }
  if (normalizedValue.length > field.maxLength) {
    throw new ValidationError(`El campo ${field.label} no puede superar ${field.maxLength} caracteres.`);
  }

  return normalizedValue;
}

function validateEmail(email) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError('Ingresa un correo electrónico válido.');
  }
}

// Normalizes and validates client input against the clientes table limits.
class ClientModel {
  constructor({ dpi, nombre, apellido, correo }) {
    this.dpi = validateText(dpi, clientFields.dpi);
    this.nombre = validateText(nombre, clientFields.nombre);
    this.apellido = validateText(apellido, clientFields.apellido);
    this.correo = validateText(correo, clientFields.correo);
    validateEmail(this.correo);
  }

  static validateUpdates(updates) {
    const allowedFields = ['nombre', 'apellido', 'correo'];
    const entries = Object.entries(updates);

    if (entries.length === 0 || entries.some(([field]) => !allowedFields.includes(field))) {
      throw new ValidationError('Selecciona al menos un campo válido para actualizar.');
    }

    const normalizedUpdates = {};
    for (const [field, value] of entries) {
      normalizedUpdates[field] = validateText(value, clientFields[field]);
    }

    if (normalizedUpdates.correo) {
      validateEmail(normalizedUpdates.correo);
    }

    return normalizedUpdates;
  }

  toDBModel() {
    return {
      dpi: this.dpi,
      nombre: this.nombre,
      apellido: this.apellido,
      correo: this.correo
    };
  }
}

export default ClientModel;
