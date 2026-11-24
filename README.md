# FitCore-yani-nodejs

FitCore es una aplicación de consola (CLI) para administrar clientes, planes de entrenamiento y contratos de un gimnasio. Está desarrollada con Node.js, usa MySQL para guardar la información y permite exportar el historial de un cliente a JSON.

## Requisitos

- Node.js 20.17 o superior dentro de la rama 20.x, 22.13 o superior dentro de 22.x, o 23.5+.
- MySQL 8 o compatible.

## Instalación y configuración

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` a `.env` y configura las credenciales de MySQL:

   ```dotenv
   DB_HOST=localhost
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_NAME=fitcore
   ```

3. En una base de datos nueva, ejecuta `database/database.sql` en MySQL. El script crea y selecciona `fitcore`; usa el mismo nombre en `DB_NAME`. `CREATE TABLE IF NOT EXISTS` no migra tablas antiguas: respalda y actualiza esos esquemas por separado antes de usar esta versión.

4. Inicia el menú interactivo:

   ```bash
   npm start
   ```

5. Ejecuta las pruebas automatizadas:

   ```bash
   npm test
   ```

La aplicación necesita una conexión activa a MySQL para iniciarse. Los archivos JSON generados al exportar historiales se guardan en `exports/`, que está excluido del control de versiones.

## Estructura

```text
database/
  database.sql                 # Esquema MySQL y relaciones
docs/
  base-datos.png               # Diagrama de la base de datos
  planeación-scrum-yani (1).pdf
src/
  commands/
    menu.js                    # Menús e interacción de la CLI
  config/
    database.js               # Pool de conexiones MySQL
  models/
    client.js                 # Validación y representación de clientes
    contract.js               # Validación y representación de contratos
    plan.js                   # Validación y representación de planes
    validationError.js        # Error de validación visible para el usuario
  repositories/
    clientRepository.js       # Consultas de clientes e historial
    contractRepository.js     # Consultas de contratos
    planRepository.js         # Consultas de planes
  services/
    GymService.js             # Reglas de negocio y coordinación de repositorios
    clientExportService.js    # Generación de exportaciones JSON
  index.js                    # Inicio y cierre de la aplicación
test/
  models.test.js              # Pruebas de validación de modelos
  repositories.test.js        # Pruebas de consultas y parámetros
```

La CLI delega las reglas de negocio al servicio, y el servicio usa modelos para validar entradas y repositorios para ejecutar consultas parametrizadas. El esquema también define tablas para metas, mediciones, nutrición y transacciones; el menú actual exporta y consulta el historial formado por metas, mediciones, nutrición y contratos.

## Seguridad y datos

- No compartas ni subas `.env`; usa `.env.example` como plantilla.
- Las consultas usan parámetros para separar los valores de las instrucciones SQL.
- Los campos dinámicos de actualización se limitan a una lista permitida.
- El borrado de clientes o planes elimina también los registros relacionados indicados por las claves foráneas `ON DELETE CASCADE`. La CLI muestra una confirmación antes de hacerlo.
- Los errores de conexión y persistencia se muestran sin incluir mensajes internos de MySQL ni credenciales.

## Material adicional

- [Diagrama de la base de datos](docs/base-datos.png)
- [Planeación Scrum](<docs/planeación-scrum-yani (1).pdf>)
- [Video de presentación](https://www.loom.com/share/3fa3ae27ed424ae7bdf3ceb615ee8a13)

## Equipo

- Product Owner: Irma Yaneht Arias García
- Scrum Master: Irma Yaneht Arias García
- Developers: Irma Yaneht Arias García

Este proyecto se distribuye bajo la licencia MIT. Consulta [LICENSE](LICENSE).
