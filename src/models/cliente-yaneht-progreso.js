#!/usr/bin/env node
import { Command } from 'commander';
import mysql from 'mysql2';
import fs from 'fs';
import path from 'path';

const program = new Command();

// Configuración de tu base de datos MySQL
const dbConfig = {
  host: 'campus2023',
  user: 'campus2023',
  password: '',
  database: 'fitcore_db'
};

program
  .requiredOption('-c, --client <identifier>', 'Nombre o ID del cliente')
  .action(async (options) => {
    const identifier = options.client;
    const connection = await mysql.createConnection(dbConfig);

    try {
      // 1. Buscar al cliente por ID o Nombre
      const isId = !isNaN(identifier);
      const sqlClient = isId 
        ? 'SELECT * FROM clients WHERE id = ?' 
        : 'SELECT * FROM clients WHERE name LIKE ?';
      const params = isId ? [identifier] : [`%${identifier}%`];

      const [rows] = await connection.execute(sqlClient, params);
      const client = rows[0];

      if (!client) {
        console.log(` No se encontró ningún cliente con: "${identifier}"`);
        process.exit(1);
      }

      console.log(` Cliente encontrado: ${client.name}`);

      // 2. Consultar datos relacionados
      const [progress] = await connection.execute('SELECT * FROM progress_records WHERE client_id = ?', [client.id]);
      const [mealPlans] = await connection.execute('SELECT * FROM meal_plans WHERE client_id = ?', [client.id]);
      const [trainingPlans] = await connection.execute('SELECT id, plan_name, status FROM training_plans WHERE client_id = ?', [client.id]);

      // 3. Estructurar el JSON final
      const exportData = {
        exportDate: new Date().toISOString(),
        client: {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone
        },
        progressRecords: progress.map(p => ({
          date: p.date,
          weight: p.weight,
          bodyFat: p.body_fat,
          measurements: JSON.parse(p.measurements || '{}'),
          comments: p.comments,
          photos: JSON.parse(p.photo_references || '[]')
        })),
        nutrition: {
          mealPlans: mealPlans.map(mp => ({
            planName: mp.plan_name,
            status: mp.status,
            dailyMeals: JSON.parse(mp.daily_meals || '[]')
          }))
        },
        training: {
          plans: trainingPlans.map(tp => ({
            id: tp.id,
            planName: tp.plan_name,
            status: tp.status
          }))
        }
      };

      // 4. Crear carpeta /exports si no existe
      const exportsDir = path.join(process.cwd(), 'exports');
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      // 5. Guardar el archivo JSON
      const safeName = client.name.toLowerCase().replace(/\s+/g, '_');
      const filePath = path.join(exportsDir, `cliente_${safeName}_progreso.json`);
      
      fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2), 'utf-8');
      console.log(` Éxito: Archivo guardado en ${filePath}`);

    } catch (error) {
      console.error(' Error de ejecución:', error.message);
    } finally {
      await connection.end();
    }
  });

program.parse(process.argv);