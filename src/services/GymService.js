
// Importamos los repositorios necesarios para gestionar clientes, contratos y planes
import clienteRepository from '../repositories/clienteRepository.js';
import contractRepository from '../repositories/contractRepository.js';

/**
 * Servicio del Gimnasio (GymService)
 * Controla la lógica de negocio para registrar y consultar clientes, contratos y operaciones del sistema.
 */
class GymService {
  
  // ==========================================
  // GESTIÓN DE CLIENTES
  // ==========================================

  // Registrar un nuevo cliente de forma segura
  async registrarCliente(datosCliente) {
    try {
      const resultadoCliente = await clienteRepository.create(datosCliente);
      console.log("¡Cliente registrado con éxito en la base de datos!");
      return resultadoCliente;
    } catch (error) {
      console.error("Error en el servicio al registrar cliente:", error.message);
      throw error;
    }
  }

  // Obtener la lista de todos los clientes registrados
  async obtenerClientes() {
    try {
      const clientes = await clienteRepository.findAll();
      return clientes;
    } catch (error) {
      console.error("Error en el servicio al obtener clientes:", error.message);
      throw error;
    }
  }

  // ==========================================
  // GESTIÓN DE CONTRATOS
  // ==========================================

  // Registrar un nuevo contrato
  async registrarContrato(datosContrato) {
    try {
      const resultadoContrato = await contractRepository.create(datosContrato);
      console.log("¡Contrato registrado con éxito en la base de datos!");
      return resultadoContrato;
    } catch (error) {
      console.error("Error en el servicio al registrar contrato:", error.message);
      throw error;
    }
  }

  // Obtener la lista de todos los contratos
  async obtenerContratos() {
    try {
      const contratos = await contractRepository.findAll();
      return contratos;
    } catch (error) {
      console.error("Error en el servicio al obtener contratos:", error.message);
      throw error;
    }
  }

}

export default new GymService();
