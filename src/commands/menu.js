import chalk from 'chalk';
import inquirer from 'inquirer';
import ValidationError from '../models/validationError.js';
import gymService from '../services/GymService.js';
import clientExportService from '../services/clientExportService.js';

async function runSafely(action, failureMessage) {
  try {
    await action();
  } catch (error) {
    if (error?.name === 'ExitPromptError') {
      throw error;
    }

    // Keep database-driver details out of the interactive console.
    if (error instanceof ValidationError) {
      console.log(chalk.yellow(error.message));
    } else if (error?.code === 'ER_DUP_ENTRY') {
      console.log(chalk.red('Ya existe un registro con ese DPI.'));
    } else if (error?.code === 'ER_ROW_IS_REFERENCED_2') {
      console.log(chalk.red('No se puede eliminar porque existen registros relacionados.'));
    } else {
      console.log(chalk.red(failureMessage));
    }
  }
}

async function elegirRegistro(message, records, format) {
  const { selectedId } = await inquirer.prompt([{
    type: 'rawlist',
    name: 'selectedId',
    message,
    choices: records.map((record) => ({ name: format(record), value: record.id }))
  }]);

  return selectedId;
}

async function gestionarClientes() {
  const { action } = await inquirer.prompt([{
    type: 'rawlist',
    name: 'action',
    message: chalk.magenta('Gestión de clientes'),
    choices: [
      { name: 'Registrar cliente', value: 'create' },
      { name: 'Ver clientes', value: 'list' },
      { name: 'Actualizar cliente', value: 'update' },
      { name: 'Eliminar cliente', value: 'delete' },
      { name: 'Volver', value: 'back' }
    ]
  }]);

  if (action === 'create') {
    const data = await inquirer.prompt([
      { type: 'input', name: 'dpi', message: 'DPI:' },
      { type: 'input', name: 'nombre', message: 'Nombre:' },
      { type: 'input', name: 'apellido', message: 'Apellido:' },
      { type: 'input', name: 'correo', message: 'Correo electrónico:' }
    ]);

    await runSafely(async () => {
      await gymService.registrarCliente(data);
      console.log(chalk.green('Cliente registrado correctamente.'));
    }, 'No se pudo registrar el cliente. Verifica los datos y la conexión a la base de datos.');
    return;
  }

  if (action === 'list') {
    await runSafely(async () => {
      const clients = await gymService.obtenerClientes();
      if (clients.length === 0) {
        console.log('No hay clientes registrados.');
      } else {
        console.table(clients);
      }
    }, 'No se pudieron consultar los clientes.');
    return;
  }

  if (action === 'update' || action === 'delete') {
    await runSafely(async () => {
      const clients = await gymService.obtenerClientes();
      if (clients.length === 0) {
        console.log('No hay clientes registrados.');
        return;
      }

      const clientId = await elegirRegistro(
        'Selecciona un cliente:',
        clients,
        (client) => `${client.nombre} ${client.apellido} (${client.dpi})`
      );

      if (action === 'update') {
        const values = await inquirer.prompt([
          { type: 'input', name: 'nombre', message: 'Nuevo nombre (en blanco para conservar):' },
          { type: 'input', name: 'apellido', message: 'Nuevo apellido (en blanco para conservar):' },
          { type: 'input', name: 'correo', message: 'Nuevo correo (en blanco para conservar):' }
        ]);
        const updates = Object.fromEntries(
          Object.entries(values).filter(([, value]) => value.trim() !== '')
        );

        if (Object.keys(updates).length === 0) {
          console.log('No se ingresaron cambios.');
          return;
        }

        const updated = await gymService.actualizarCliente(clientId, updates);
        console.log(updated ? chalk.green('Cliente actualizado.') : 'No se encontró el cliente.');
        return;
      }

      const { confirm } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        default: false,
        message: 'Eliminar el cliente también borrará sus metas, mediciones, nutrición y contratos. ¿Continuar?'
      }]);

      if (!confirm) {
        console.log('Operación cancelada.');
        return;
      }

      const deleted = await gymService.eliminarCliente(clientId);
      console.log(deleted ? chalk.green('Cliente eliminado.') : 'No se encontró el cliente.');
    }, 'No se pudo completar la operación de cliente.');
  }
}

async function gestionarPlanes() {
  const { action } = await inquirer.prompt([{
    type: 'rawlist',
    name: 'action',
    message: chalk.magenta('Gestión de planes'),
    choices: [
      { name: 'Registrar plan', value: 'create' },
      { name: 'Ver planes', value: 'list' },
      { name: 'Actualizar plan', value: 'update' },
      { name: 'Eliminar plan', value: 'delete' },
      { name: 'Volver', value: 'back' }
    ]
  }]);

  if (action === 'create') {
    const data = await inquirer.prompt([
      { type: 'input', name: 'nombre', message: 'Nombre del plan:' },
      { type: 'input', name: 'duracion', message: 'Duración en semanas:' },
      {
        type: 'rawlist',
        name: 'nivel',
        message: 'Nivel:',
        choices: ['principiante', 'intermedio', 'avanzado']
      },
      { type: 'input', name: 'precioBase', message: 'Precio base (Q):' }
    ]);

    await runSafely(async () => {
      await gymService.registrarPlan(data);
      console.log(chalk.green('Plan registrado correctamente.'));
    }, 'No se pudo registrar el plan. Verifica los datos y la conexión a la base de datos.');
    return;
  }

  if (action === 'list') {
    await runSafely(async () => {
      const plans = await gymService.obtenerPlanes();
      if (plans.length === 0) {
        console.log('No hay planes registrados.');
      } else {
        console.table(plans);
      }
    }, 'No se pudieron consultar los planes.');
    return;
  }

  if (action === 'update' || action === 'delete') {
    await runSafely(async () => {
      const plans = await gymService.obtenerPlanes();
      if (plans.length === 0) {
        console.log('No hay planes registrados.');
        return;
      }

      const planId = await elegirRegistro(
        'Selecciona un plan:',
        plans,
        (plan) => `${plan.nombre} (${plan.nivel}, ${plan.duracion} semanas, Q${plan.precioBase})`
      );

      if (action === 'update') {
        const values = await inquirer.prompt([
          { type: 'input', name: 'nombre', message: 'Nuevo nombre (en blanco para conservar):' },
          { type: 'input', name: 'duracion', message: 'Nueva duración (en blanco para conservar):' },
          {
            type: 'input',
            name: 'nivel',
            message: 'Nuevo nivel (en blanco para conservar):'
          },
          { type: 'input', name: 'precioBase', message: 'Nuevo precio (en blanco para conservar):' }
        ]);
        const updates = Object.fromEntries(
          Object.entries(values).filter(([, value]) => value.trim() !== '')
        );

        if (Object.keys(updates).length === 0) {
          console.log('No se ingresaron cambios.');
          return;
        }

        const updated = await gymService.actualizarPlan(planId, updates);
        console.log(updated ? chalk.green('Plan actualizado.') : 'No se encontró el plan.');
        return;
      }

      const { confirm } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        default: false,
        message: 'Eliminar el plan también borrará los contratos asociados. ¿Continuar?'
      }]);

      if (!confirm) {
        console.log('Operación cancelada.');
        return;
      }

      const deleted = await gymService.eliminarPlan(planId);
      console.log(deleted ? chalk.green('Plan eliminado.') : 'No se encontró el plan.');
    }, 'No se pudo completar la operación de plan.');
  }
}

async function gestionarContratos() {
  const { action } = await inquirer.prompt([{
    type: 'rawlist',
    name: 'action',
    message: chalk.magenta('Gestión de contratos'),
    choices: [
      { name: 'Crear contrato', value: 'create' },
      { name: 'Ver contratos', value: 'list' },
      { name: 'Volver', value: 'back' }
    ]
  }]);

  if (action === 'list') {
    await runSafely(async () => {
      const contracts = await gymService.obtenerContratos();
      if (contracts.length === 0) {
        console.log('No hay contratos registrados.');
      } else {
        console.table(contracts);
      }
    }, 'No se pudieron consultar los contratos.');
    return;
  }

  if (action === 'create') {
    await runSafely(async () => {
      const [clients, plans] = await Promise.all([
        gymService.obtenerClientes(),
        gymService.obtenerPlanes()
      ]);

      if (clients.length === 0 || plans.length === 0) {
        console.log('Registra al menos un cliente y un plan antes de crear un contrato.');
        return;
      }

      const { idCliente } = await inquirer.prompt([{
        type: 'rawlist',
        name: 'idCliente',
        message: 'Selecciona al cliente:',
        choices: clients.map((client) => ({
          name: `${client.nombre} ${client.apellido} (${client.dpi})`,
          value: client.id
        }))
      }]);
      const { idPlan } = await inquirer.prompt([{
        type: 'rawlist',
        name: 'idPlan',
        message: 'Selecciona el plan:',
        choices: plans.map((plan) => ({
          name: `${plan.nombre} (${plan.nivel})`,
          value: plan.id
        }))
      }]);
      const { costoTotal, metodoPago } = await inquirer.prompt([
        { type: 'input', name: 'costoTotal', message: 'Costo total del contrato (Q):' },
        { type: 'input', name: 'metodoPago', message: 'Método de pago:' }
      ]);

      await gymService.registrarContrato({ idCliente, idPlan, costoTotal, metodoPago });
      console.log(chalk.green('Contrato registrado correctamente.'));
    }, 'No se pudo crear el contrato. Verifica los datos y la conexión a la base de datos.');
  }
}

async function exportarHistorial() {
  await runSafely(async () => {
    const { clientId } = await inquirer.prompt([{
      type: 'input',
      name: 'clientId',
      message: 'ID del cliente:',
      validate: (value) => /^\d+$/.test(value) || 'Ingresa un ID numérico.'
    }]);
    const filePath = await clientExportService.exportarHistorialCliente(clientId);

    if (!filePath) {
      console.log(chalk.yellow('No se encontró el cliente.'));
    } else {
      console.log(chalk.green(`Historial exportado en ${filePath}`));
    }
  }, 'No se pudo exportar el historial del cliente.');
}

export async function mostrarMenu() {
  while (true) {
    const { option } = await inquirer.prompt([{
      type: 'rawlist',
      name: 'option',
      message: chalk.cyan('FitCore — menú principal'),
      choices: [
        { name: 'Gestionar clientes', value: 'clients' },
        { name: 'Gestionar planes', value: 'plans' },
        { name: 'Gestionar contratos', value: 'contracts' },
        { name: 'Exportar historial de cliente a JSON', value: 'export' },
        { name: 'Salir', value: 'exit' }
      ]
    }]);

    if (option === 'clients') {
      await gestionarClientes();
    } else if (option === 'plans') {
      await gestionarPlanes();
    } else if (option === 'contracts') {
      await gestionarContratos();
    } else if (option === 'export') {
      await exportarHistorial();
    } else {
      console.log(chalk.blue('Gracias por usar FitCore.'));
      return;
    }
  }
}
