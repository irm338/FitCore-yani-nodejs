

import database from './config/database.js'; // Ajusta la ruta si es necesario (ej: './config/database.js')
import { mostrarMenu } from './comands/menu.js';

async function iniciarApp() {
  try {
    console.log("Conectando a la base de datos MySQL...");
    
    // Conectamos a la base de datos usando el método que definiste en tu config
    await database.conectar();
    console.log("¡Conexión exitosa a la base de datos!");
    
    // Iniciamos el menú principal de la CLI
    mostrarMenu();
    
  } catch (error) {
    console.error(" Error crítico al iniciar la aplicación:", error.message);
    process.exit(1); // Finaliza el proceso si no hay conexión a la BD
  }
}

iniciarApp();