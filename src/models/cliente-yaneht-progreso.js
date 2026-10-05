
import { MongoClient, ObjectId } from 'mongodb';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';
import path from 'path';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = 'FitCore_db';


yargs(hideBin(process.argv))
  .command(
    'exportar:cliente',
    'Exporta el progreso físico y nutricional de un cliente a un archivo JSON',
    (yargs) => {
      return yargs
        .option('id', {
          alias: 'i',
          type: 'string',
          description: 'ID de MongoDB del cliente',
        })
        .option('nombre', {
          alias: 'n',
          type: 'string',
          description: 'Nombre del cliente (búsqueda parcial o exacta)',
        });
    },
    async (argv) => {
      const clientInputId = argv.id;
      const clientInputName = argv.nombre;

      if (!clientInputId && !clientInputName) {
        console.error(' Error: Debe proporcionar el ID (--id) o el Nombre (--nombre) del cliente.');
        process.exit(1);
      }

      const mongoClient = new MongoClient(MONGO_URI);

      try {
        console.log(' Conectando a la base de datos...');
        await mongoClient.connect();
        const db = mongoClient.db(DB_NAME);

        const clientsCollection = db.collection('clients');
        const progressCollection = db.collection('progress_records');
        const mealPlansCollection = db.collection('meal_plans');
        const workoutPlansCollection = db.collection('workout_plans');

        // 1. Validar existencia del cliente
        let query = {};
        if (clientInputId) {
          if (!ObjectId.isValid(clientInputId)) {
            console.error(' Error: El ID proporcionado no es un ObjectId válido de MongoDB.');
            process.exit(1);
          }
          query._id = new ObjectId(clientInputId);
        } else {
          query.name = { $regex: clientInputName,$options: 'i' };
        }

        const client = await clientsCollection.findOne(query);

        if (!client) {
          console.error(` Error: No se encontró ningún cliente con los datos proporcionados.`);
          process.exit(1);
        }

        console.log(` Cliente encontrado: ${client.name} (ID: ${client._id})`);

        // 2. Recopilar información relacionada de forma concurrente
        const clientId = client._id;

        const [progressRecords, mealPlans, workoutPlans] = await Promise.all([
          progressCollection.find({ clientId }).sort({ date: -1 }).toArray(),
          mealPlansCollection.find({ clientId }).toArray(),
          workoutPlansCollection.find({ clientId }).toArray(),
        ]);

        // 3. Construir el objeto JSON jerárquico y consistente
        const exportData = {
          metadata: {
            exportedAt: new Date().toISOString(),
            version: '1.0.0',
            system: 'FitnessBackupCLI'
          },
          client: {
            id: client._id,
            name: client.name,
            email: client.email || null,
            phone: client.phone || null,
            createdAt: client.createdAt || null,
            basicData: client.basicData || {}
          },
          progressRecords: progressRecords.map(record => ({
            date: record.date,
            weightKg: record.weight,
            bodyFatPercentage: record.fat,
            measurements: record.measurements || {},
            comments: record.comments || '',
            photoReferences: record.photoReferences || []
          })),
          nutrition: {
            mealPlans: mealPlans.map(plan => ({
              planName: plan.planName,
              startDate: plan.startDate,
              endDate: plan.endDate,
              status: plan.status,
              days: plan.days || [] // Contiene alimentos por día y calorías estimadas
            }))
          },
          workouts: {
            plans: workoutPlans.map(wPlan => ({
              planName: wPlan.planName,
              status: wPlan.status, // activos o pasados
              startDate: wPlan.startDate,
              endDate: wPlan.endDate,
              referenceId: wPlan._id
            }))
          }
        };

        
        const exportsDir = path.resolve(process.cwd(), 'exports');
        if (!fs.existsSync(exportsDir)) {
          fs.mkdirSync(exportsDir, { recursive: true });
          console.log(' Carpeta /exports creada exitosamente.');
        }

        
        const safeClientName = client.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .replace(/_+/g, '_');
        
        const fileName = `cliente_${safeClientName}_progreso.json`;
        const filePath = path.join(exportsDir, fileName);

    
        fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2), 'utf-8');

        console.log(` ¡Éxito! Archivo generado correctamente en: ${filePath}`);

      } catch (error) {
        console.error(' Error crítico durante la exportación:', error.message);
        process.exit(1);
      } finally {
        await mongoClient.close();
      }
    }
  )
  .demandCommand(1, 'Debes especificar un comando válido.')
  .help()
  .parse();
  
 
  


  
