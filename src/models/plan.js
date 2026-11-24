import ValidationError from './validationError.js';

const allowedLevels = ['principiante', 'intermedio', 'avanzado'];

function validateText(value, field, maxLength) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ValidationError(`El campo ${field} es obligatorio.`);
  }

  const normalizedValue = value.trim();
  if (normalizedValue.length > maxLength) {
    throw new ValidationError(`El campo ${field} no puede superar ${maxLength} caracteres.`);
  }

  return normalizedValue;
}

function validateDuration(value) {
  const duration = Number(value);
  if (!Number.isSafeInteger(duration) || duration <= 0) {
    throw new ValidationError('La duración debe ser un número entero de semanas mayor que 0.');
  }
  return duration;
}

// The database stores prices as DECIMAL(10, 2), so reject excess precision here.
function validatePrice(value) {
  const price = Number(value);
  if (
    !Number.isFinite(price)
    || price <= 0
    || price > 99999999.99
    || Math.abs(price * 100 - Math.round(price * 100)) > 1e-8
  ) {
    throw new ValidationError('El precio debe ser mayor que 0 y tener como máximo dos decimales.');
  }
  return price;
}

function validateLevel(value) {
  if (typeof value !== 'string') {
    throw new ValidationError('Selecciona un nivel válido.');
  }

  const level = value.trim().toLowerCase();
  if (!allowedLevels.includes(level)) {
    throw new ValidationError('El nivel debe ser principiante, intermedio o avanzado.');
  }
  return level;
}

// Maps plan input to the columns currently defined by the planes table.
class PlanModel {
  constructor({ nombre, duracion, nivel, precioBase }) {
    this.nombre = validateText(nombre, 'nombre del plan', 100);
    this.duracion = validateDuration(duracion);
    this.nivel = validateLevel(nivel);
    this.precioBase = validatePrice(precioBase);
  }

  static validateUpdates(updates) {
    const allowedFields = ['nombre', 'duracion', 'nivel', 'precioBase'];
    const entries = Object.entries(updates);

    if (entries.length === 0 || entries.some(([field]) => !allowedFields.includes(field))) {
      throw new ValidationError('Selecciona al menos un campo válido para actualizar.');
    }

    const normalizedUpdates = {};
    for (const [field, value] of entries) {
      switch (field) {
        case 'nombre':
          normalizedUpdates.nombre = validateText(value, 'nombre del plan', 100);
          break;
        case 'duracion':
          normalizedUpdates.duracion = validateDuration(value);
          break;
        case 'nivel':
          normalizedUpdates.nivel = validateLevel(value);
          break;
        case 'precioBase':
          normalizedUpdates.precioBase = validatePrice(value);
          break;
        default:
          throw new ValidationError('El campo solicitado no se puede actualizar.');
      }
    }

    return normalizedUpdates;
  }

  toDBModel() {
    return {
      nombre: this.nombre,
      duracion: this.duracion,
      nivel: this.nivel,
      precioBase: this.precioBase
    };
  }
}

export default PlanModel;
