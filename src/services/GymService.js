import ClientModel from '../models/client.js';
import ContractModel from '../models/contract.js';
import PlanModel from '../models/plan.js';
import clientRepository from '../repositories/clientRepository.js';
import contractRepository from '../repositories/contractRepository.js';
import planRepository from '../repositories/planRepository.js';

// Coordinates input validation and repository calls for the CLI layer.
class GymService {
  // Models validate new records before repositories persist them.
  async registrarCliente(data) {
    return clientRepository.create(new ClientModel(data).toDBModel());
  }

  async obtenerClientes() {
    return clientRepository.findAll();
  }

  async actualizarCliente(id, updates) {
    const normalizedUpdates = ClientModel.validateUpdates(updates);
    return clientRepository.update(Number(id), normalizedUpdates);
  }

  async eliminarCliente(id) {
    return clientRepository.delete(Number(id));
  }

  async registrarPlan(data) {
    return planRepository.create(new PlanModel(data).toDBModel());
  }

  async obtenerPlanes() {
    return planRepository.findAll();
  }

  async actualizarPlan(id, updates) {
    const normalizedUpdates = PlanModel.validateUpdates(updates);
    return planRepository.update(Number(id), normalizedUpdates);
  }

  async eliminarPlan(id) {
    return planRepository.delete(Number(id));
  }

  async registrarContrato(data) {
    return contractRepository.create(new ContractModel(data).toDBModel());
  }

  async obtenerContratos() {
    return contractRepository.findAll();
  }

  async obtenerHistorialCliente(id) {
    const clientId = Number(id);
    if (!Number.isSafeInteger(clientId) || clientId <= 0) {
      throw new Error('El identificador del cliente debe ser un entero positivo.');
    }
    return clientRepository.findHistory(clientId);
  }
}

export default new GymService();
