import database from './config/database.js';
import { mostrarMenu } from './commands/menu.js';

async function iniciarAplicacion() {
  try {
    await database.connect();
    console.log('Conexión a MySQL establecida.');
    await mostrarMenu();
  } catch (error) {
    if (error?.name === 'ExitPromptError') {
      console.log('\nAplicación cerrada.');
    } else {
      console.error(
        'No se pudo iniciar FitCore. Verifica las variables de entorno y la conexión a MySQL.'
      );
      process.exitCode = 1;
    }
  } finally {
    // Release the pool even when startup or an interactive action fails.
    try {
      await database.close();
    } catch {
      console.error('No se pudo cerrar correctamente la conexión a MySQL.');
      process.exitCode = 1;
    }
  }
}

await iniciarAplicacion();
