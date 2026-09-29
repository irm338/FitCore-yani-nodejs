

/**
 * Clase ContractModel
 * Representa el modelo de datos para un Contrato en FitCore.
 * Vincula un cliente con un plan de entrenamiento y gestiona fechas y pagos.
 */
class ContractModel {
    constructor({ idCliente, idPlan, costoTotal, metodoPago }) {
        this.idCliente = idCliente; // ID del cliente asociado (coincide con MySQL)
        this.idPlan = idPlan;       // ID del plan de entrenamiento contratado (coincide con MySQL)
        this.costoTotal = this.validarCosto(costoTotal);
        this.metodoPago = this.validarTexto(metodoPago, 'Método de pago');
        // Formato de fecha legible para MySQL (YYYY-MM-DD)
        this.fechaInicio = new Date().toISOString().split('T')[0]; 
        this.estado = 'activo';     // Estado inicial por defecto
    }
 
    // Valida que el costo sea un número positivo
    validarCosto(costo) {
        const num = Number(costo);
        if (isNaN(num) || num <= 0) {
            throw new Error('El costo total del contrato debe ser un número mayor a 0.');
        }
        return num;
    }
 
    // Valida que el texto no esté vacío
    validarTexto(valor, campo) {
        if (!valor || typeof valor !== 'string' || valor.trim() === '') {
            throw new Error(`El campo '${campo}' es obligatorio.`);
        }
        return valor.trim();
    }
 
    // Transforma el modelo a un objeto plano listo para MySQL
    toDBModel() {
        return {
            idCliente: this.idCliente,
            idPlan: this.idPlan,
            costoTotal: this.costoTotal,
            metodoPago: this.metodoPago,
            fechaInicio: this.fechaInicio,
            estado: this.estado
        };
    }
}
 
export default ContractModel;