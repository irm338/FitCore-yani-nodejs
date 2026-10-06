

// Importamos las herramientas necesarias para la consola y la base de datos
import inquirer from "inquirer";
import chalk from "chalk";
import database from '../config/database.js';
import clientRepository from '../repositories/clienteRepository.js';
import ClientModel from '../models/client.js';
import planRepository from '../repositories/planRepository.js';
import PlanModel from '../models/plan.js';
import contractRepository from '../repositories/contractRepository.js';
import ContractModel from '../models/contract.js';
import { exportarHistorialCliente } from '../repositories/clienteRepository.js';

// Función principal que muestra el menú en la consola
export async function mostrarMenu() {
    try{
        // Nos aseguramos de que la base de datos esté conectada
        await database.connect();

        let continuar = true;
        
        while (continuar) {
            // Mostramos las opciones principales al usuario
            const respuesta = await inquirer.prompt([
                {
                    type: 'rawlist', // Cambiado a 'rawlist' para evitar el error de registro
                    name: 'opcion',
                    message: chalk.cyan('--- MENU PRINCIPAL FITCORE --- ¿Qué deseas hacer?'),
                    choices: [
                        { name: '1. Gestionar Clientes (CRUD)', value: 'CLIENTES' },
                        { name: '2. Gestionar Planes de Entrenamiento (CRUD)', value: 'PLANES' },
                        { name: '3. Gestionar Contratos (Asignar Plan)', value: 'CONTRATOS' },
                        { name: '4. Exportar Historial de Cliente a JSON', value: 'EXPORTAR' },
                        { name: '5. Salir', value: 'SALIR' }
                    ]
                }
            ]);

            // Submenú para Contratos
            if (respuesta.opcion === 'CONTRATOS') {
                const subMenuContratos = await inquirer.prompt([
                    {
                        type: 'rawlist',
                        name: 'accion',
                        message: chalk.magenta('--- GESTIÓN DE CONTRATOS --- Selecciona una opción:'),
                        choices: [
                            { name: '1. Asignar plan a cliente (Nuevo Contrato)', value: 'CREAR' },
                            { name: '2. Ver lista de contratos', value: 'VER' },
                            { name: '3. Volver al menú principal', value: 'VOLVER' }
                        ]
                    }
                ]);
            
                if (subMenuContratos.accion === 'CREAR') {
                    console.log(chalk.yellow('\n--- Creación de Nuevo Contrato ---'));
            
                    const clientes = await clientRepository.findAll();
                    const planes = await planRepository.findAll();
            
                    if (clientes.length === 0 || planes.length === 0) {
                        console.log(chalk.red(' Debes tener al menos un cliente y un plan registrados para hacer un contrato.\n'));
                        continue;
                    }
            
                    const choicesClientes = clientes.map(c => ({ name: `${c.nombre} ${c.apellido} (DPI: ${c.dpi})`, value: c.id }));
                    const choicesPlanes = planes.map(p => ({ name: `${p.nombre} - Nivel: ${p.nivel}`, value: p.id }));
            
                    const datosContrato = await inquirer.prompt([
                        { type: 'rawlist', name: 'idCliente', message: 'Selecciona al cliente:', choices: choicesClientes },
                        { type: 'rawlist', name: 'idPlan', message: 'Selecciona el plan de entrenamiento:', choices: choicesPlanes },
                        { type: 'input', name: 'costoTotal', message: 'Costo total del contrato (Q):' },
                        { type: 'input', name: 'metodoPago', message: 'Método de pago (ej. Efectivo, Tarjeta):' }
                    ]);

                    try {
                        const nuevoContrato = {
                            idCliente: datosContrato.idCliente,
                            idPlan: datosContrato.idPlan,
                            costoTotal: Number(datosContrato.costoTotal),
                            metodoPago: datosContrato.metodoPago,
                            fechaInicio: new Date().toISOString().split('T')[0]
                        };
                 
                        await contractRepository.create(nuevoContrato);
                        console.log(chalk.green('\n ¡Contrato generado con éxito!\n'));

                    } catch (error) {
                        console.log(chalk.red(`\n Error al crear contrato: ${error.message}\n`));
                    }
            
                } else if (subMenuContratos.accion === 'VER') {
                    console.log(chalk.yellow('\n--- Lista de Contratos Activos ---'));
                    const contratos = await contractRepository.findAll();
                    if (contratos.length === 0) {
                        console.log(chalk.gray('No hay contratos registrados todavía.\n'));
                    } else {
                        console.table(contratos);
                        console.log('\n');
                    }
                }
            // Submenú para Clientes
            } else if (respuesta.opcion === 'CLIENTES') {
                const subMenuClientes = await inquirer.prompt([
                    {
                        type: 'rawlist',
                        name: 'accion',
                        message: chalk.magenta('--- GESTIÓN DE CLIENTES --- Selecciona una opción:'),
                        choices: [
                            { name: '1. Registrar nuevo cliente', value: 'REGISTRAR' },
                            { name: '2. Ver lista de clientes', value: 'VER' },
                            { name: '3. Actualizar cliente', value: 'ACTUALIZAR' },
                            { name: '4. Eliminar cliente', value: 'ELIMINAR' },
                            { name: '5. Volver al menú principal', value: 'VOLVER' }
                        ]
                    }
                ]);

                if (subMenuClientes.accion === 'REGISTRAR') {
                    console.log(chalk.yellow('\n--- Registro de Nuevo Cliente ---'));
                    const datosNuevos = await inquirer.prompt([
                        { type: 'input', name: 'dpi', message: 'DPI del cliente:' },
                        { type: 'input', name: 'nombre', message: 'Nombre del cliente:' },
                        { type: 'input', name: 'apellido', message: 'Apellido del cliente:' },
                        { type: 'input', name: 'correo', message: 'Correo electrónico:' }
                    ]);

                    try {
                        const nuevoCliente = new ClientModel(datosNuevos);
                        await clientRepository.create(nuevoCliente.toDBModel());
                        console.log(chalk.green('\n ¡Cliente registrado con éxito!\n'));
                    } catch (error) {
                        console.log(chalk.red(`\n Error al registrar: ${error.message}\n`));
                    }

                } else if (subMenuClientes.accion === 'VER') {
                    console.log(chalk.yellow('\n--- Lista de Clientes Registrados ---'));
                    const clientes = await clientRepository.findAll();
                    if (clientes.length === 0) {
                        console.log(chalk.gray('No hay clientes registrados todavía.\n'));
                    } else {
                        console.table(clientes);
                        console.log('\n');
                    }

                } else if (subMenuClientes.accion === 'ACTUALIZAR') {
                    console.log(chalk.yellow('\n--- Actualizar Cliente ---'));
                    const clientes = await clientRepository.findAll();
                    if (clientes.length === 0) {
                        console.log(chalk.gray('No hay clientes para actualizar.\n'));
                        continue;
                    }

                    const choices = clientes.map(c => ({ name: `${c.nombre} ${c.apellido} (${c.correo})`, value: c.id }));
                    const { idSeleccionado } = await inquirer.prompt([
                        { type: 'rawlist', name: 'idSeleccionado', message: 'Selecciona el cliente a actualizar:', choices }
                    ]);

                    const datosActualizados = await inquirer.prompt([
                        { type: 'input', name: 'nombre', message: 'Nuevo nombre (deja en blanco para no cambiar):' },
                        { type: 'input', name: 'apellido', message: 'Nuevo apellido (deja en blanco para no cambiar):' },
                        { type: 'input', name: 'correo', message: 'Nuevo correo (deja en blanco para no cambiar):' }
                    ]);

                    const camposModificados = {};
                    if (datosActualizados.nombre) camposModificados.nombre = datosActualizados.nombre;
                    if (datosActualizados.apellido) camposModificados.apellido = datosActualizados.apellido;
                    if (datosActualizados.correo) camposModificados.correo = datosActualizados.correo;

                    if (Object.keys(camposModificados).length === 0) {
                        console.log(chalk.yellow(' No se ingresaron cambios.\n'));
                    } else {
                        await clientRepository.update(idSeleccionado, camposModificados);
                        console.log(chalk.green('\n ¡Cliente actualizado correctamente!\n'));
                    }

                } else if (subMenuClientes.accion === 'ELIMINAR') {
                    console.log(chalk.yellow('\n--- Eliminar Cliente ---'));
                    const clientes = await clientRepository.findAll();
                    if (clientes.length === 0) {
                        console.log(chalk.gray('No hay clientes para eliminar.\n'));
                        continue;
                    }

                    const choices = clientes.map(c => ({ name: `${c.nombre} ${c.apellido} (${c.correo})`, value: c.id }));
                    const { idEliminar } = await inquirer.prompt([
                        { type: 'rawlist', name: 'idEliminar', message: 'Selecciona el cliente a eliminar:', choices }
                    ]);

                    const { confirmar } = await inquirer.prompt([
                        { type: 'confirm', name: 'confirmar', message: chalk.red('¿Estás segura de eliminar este cliente?'), default: false }
                    ]);

                    if (confirmar) {
                        await clientRepository.delete(idEliminar);
                        console.log(chalk.green('\n ¡Cliente eliminado con éxito!\n'));
                    } else {
                        console.log(chalk.blue(' ℹ Operación cancelada.\n'));
                    }
                }
                } else if (respuesta.opcion === 'EXPORTAR_JSON') {
                    const { idCliente } = await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'idCliente',
                            message: chalk.cyan('Ingrese el ID del cliente a exportar:')
                        }
                    ]);
        
                    console.log(chalk.yellow('\n⏳ Generando archivo JSON desde MySQL...'));
                    const resultado = await exportarHistorialCliente(idCliente);
        
                    if (resultado.exito) {
                        console.log(chalk.green(`\n✔ ¡Éxito! ${resultado.mensaje}`));
                    } else {
                        console.log(chalk.red(`\n✖ Error: ${resultado.mensaje}`));
                    }   

            // Submenú para Planes de Entrenamiento
            } else if (respuesta.opcion === 'PLANES') {
                const subMenuPlanes = await inquirer.prompt([
                    {
                        type: 'rawlist',
                        name: 'accion',
                        message: chalk.magenta('--- GESTIÓN DE PLANES --- Selecciona una opción:'),
                        choices: [
                            { name: '1. Registrar nuevo plan de entrenamiento', value: 'REGISTRAR' },
                            { name: '2. Ver lista de planes', value: 'VER' },
                            { name: '3. Actualizar plan', value: 'ACTUALIZAR' },
                            { name: '4. Eliminar plan', value: 'ELIMINAR' },
                            { name: '5. Volver al menú principal', value: 'VOLVER' }
                        ]
                    }
                ]);

                if (subMenuPlanes.accion === 'REGISTRAR') {
                    console.log(chalk.yellow('\n--- Registro de Nuevo Plan de Entrenamiento ---'));
                    const datosPlan = await inquirer.prompt([
                        { type: 'input', name: 'nombre', message: 'Nombre del plan (ej: Volumen extremo):' },
                        { type: 'input', name: 'duracion', message: 'Duración en semanas (ej: 4):' },
                        { type: 'input', name: 'metasFisicas', message: 'Metas físicas (ej: Ganar masa muscular):' },
                        { type: 'input', name: 'nivel', message: 'Nivel (principiante, intermedio, avanzado):' }
                    ]);

                    try {
                        const nuevoPlan = new PlanModel(datosPlan);
                        await planRepository.create(nuevoPlan.toDBModel());
                        console.log(chalk.green('\n ¡Plan de entrenamiento registrado con éxito!\n'));
                    } catch (error) {
                        console.log(chalk.red(`\n Error al registrar plan: ${error.message}\n`));
                    }

                } else if (subMenuPlanes.accion === 'VER') {
                    console.log(chalk.yellow('\n--- Lista de Planes Registrados ---'));
                    const planes = await planRepository.findAll();
                    if (planes.length === 0) {
                        console.log(chalk.gray('No hay planes registrados todavía.\n'));
                    } else {
                        console.table(planes);
                        console.log('\n');
                    }

                } else if (subMenuPlanes.accion === 'ACTUALIZAR') {
                    console.log(chalk.yellow('\n--- Actualizar Plan ---'));
                    const planes = await planRepository.findAll();
                    if (planes.length === 0) {
                        console.log(chalk.gray('No hay planes para actualizar.\n'));
                        continue;
                    }

                    const choices = planes.map(p => ({ name: `${p.nombre} (${p.nivel} - ${p.duracion} semanas)`, value: p.id }));
                    const { idPlan } = await inquirer.prompt([
                        { type: 'rawlist', name: 'idPlan', message: 'Selecciona el plan a actualizar:', choices }
                    ]);

                    const datosNuevos = await inquirer.prompt([
                        { type: 'input', name: 'nombre', message: 'Nuevo nombre (deja en blanco):' },
                        { type: 'input', name: 'duracion', message: 'Nueva duración (deja en blanco):' },
                        { type: 'input', name: 'metasFisicas', message: 'Nuevas metas (deja en blanco):' },
                        { type: 'input', name: 'nivel', message: 'Nuevo nivel (principiante/intermedio/avanzado - deja en blanco):' }
                    ]);

                    const modificaciones = {};
                    if (datosNuevos.nombre) modificaciones.nombre = datosNuevos.nombre;
                    if (datosNuevos.duracion) modificaciones.duracion = Number(datosNuevos.duracion);
                    if (datosNuevos.metasFisicas) modificaciones.metasFisicas = datosNuevos.metasFisicas;
                    if (datosNuevos.nivel) modificaciones.nivel = datosNuevos.nivel.toLowerCase().trim();

                    if (Object.keys(modificaciones).length === 0) {
                        console.log(chalk.yellow(' No se ingresaron cambios.\n'));
                    } else {
                        await planRepository.update(idPlan, modificaciones);
                        console.log(chalk.green('\n ¡Plan actualizado correctamente!\n'));
                    }

                } else if (subMenuPlanes.accion === 'ELIMINAR') {
                    console.log(chalk.yellow('\n--- Eliminar Plan ---'));
                    const planes = await planRepository.findAll();
                    if (planes.length === 0) {
                        console.log(chalk.gray('No hay planes para eliminar.\n'));
                        continue;
                    }

                    const choices = planes.map(p => ({ name: `${p.nombre} (${p.nivel})`, value: p.id }));
                    const { idEliminar } = await inquirer.prompt([
                        { type: 'rawlist', name: 'idEliminar', message: 'Selecciona el plan a eliminar:', choices }
                    ]);

                    const { confirmar } = await inquirer.prompt([
                        { type: 'confirm', name: 'confirmar', message: chalk.red('¿Estás segura de eliminar este plan?'), default: false }
                    ]);

                    if (confirmar) {
                        await planRepository.delete(idEliminar);
                        console.log(chalk.green('\n ¡Plan eliminado con éxito!\n'));
                    } else {
                        console.log(chalk.blue(' ℹ Operación cancelada.\n'));
                    }

                }

            } else if (respuesta.opcion === 'SALIR') {
                console.log(chalk.blue('\n¡Gracias por usar FitCore! Hasta luego.\n'));
                continuar = false;
                process.exit(0);
            }
        }

    } catch (error){
        console.error(chalk.red('Ocurrió un error general en la aplicación:', error));
    }
}

