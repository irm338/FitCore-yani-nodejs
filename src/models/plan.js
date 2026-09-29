

/**
 * Clase PlanModel
 * Representa el modelo de datos para un Plan de Entrenamiento.
 * Aplica validaciones por campo para garantizar la integridad de la información.
 */
class PlanModel {
    constructor({ nombre, duracion, metasFisicas, nivel }) {
        this.nombre = this.validarTexto(nombre, 'Nombre del plan');
        this.duracion = this.validarDuracion(duracion);
        this.metasFisicas = this.validarTexto(metasFisicas, 'Metas físicas');
        this.nivel = this.validarNivel(nivel);
        // Formato de fecha legible para MySQL (YYYY-MM-DD)
        this.fechaCreacion = new Date().toISOString().split('T')[0]; 
    }
 
    // Valida que el campo de texto no esté vacío
    validarTexto(valor, campo) {
        if (!valor || typeof valor !== 'string' || valor.trim() === '') {
            throw new Error(`El campo '${campo}' es obligatorio y debe ser un texto válido.`);
        }
        return valor.trim();
    }
 
    // Valida que la duración sea un número positivo (por ejemplo, en semanas)
    validarDuracion(duracion) {
        const num = Number(duracion);
        if (isNaN(num) || num <= 0) {
            throw new Error('La duración debe ser un número mayor a 0.');
        }
        return num;
    }
 
    // Valida que el nivel pertenezca estrictamente a las categorías permitidas
    validarNivel(nivel) {
        const nivelesPermitidos = ['principiante', 'intermedio', 'avanzado'];
        const nivelNormalizado = nivel ? nivel.toLowerCase().trim() : '';
        
        if (!nivelesPermitidos.includes(nivelNormalizado)) {
            throw new Error("El nivel debe ser exactamente: 'principiante', 'intermedio' o 'avanzado'.");
        }
        return nivelNormalizado;
    }
 
    // Transforma el modelo a un objeto plano listo para ser guardado en MySQL
    toDBModel() {
        return {
            nombre: this.nombre,
            duracion: this.duracion,
            metasFisicas: this.metasFisicas,
            nivel: this.nivel,
            fechaCreacion: this.fechaCreacion
        };
    }
}
 
export default PlanModel;