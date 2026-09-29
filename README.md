# FitCore-yani-node.js - Sistema de Gestión para Gimnasios



Aplicación robusta de línea de comandos (**CLI** - *interfaz basada puramente en texto donde navegas con el teclado*) desarrollada en Node.js bajo los principios de la Programación Orientada a Objetos (**POO**), arquitectura modular, el controlador oficial de **MySQL (`mysql2`)** y patrones de diseño orientados a la mantenibilidad y escalabilidad.

---

## Descripción del Proyecto
FitCore  permite a un entrenador personal o administrador de gimnasio gestionar de forma integral y automatizada a sus clientes, planes de entrenamiento y contratos en una base de datos relacional MySQL mediante una interfaz interactiva en la consola enriquecida con `Inquirer` y `Chalk`.

---

## Tecnologías y Librerías Utilizadas
* **Node.js**: Entorno de ejecución de JavaScript del lado del servidor.
* **MySQL (`mysql2`)**: Persistencia de datos relacional de alto rendimiento mediante consultas y tablas estructuradas.
* **Inquirer**: Librería para crear menús y flujos interactivos dinámicos en la consola mediante flechas y opciones.
* **Chalk**: Librería para dar estilo visual y notificaciones por colores en la terminal.
* **Dotenv**: Herramienta para la gestión segura de variables de entorno (credenciales de la base de datos).

---

## Estructura del Proyecto
El proyecto sigue esta estructura modular por capas:

```text
```text
FitCore-yani/
├── database/
│   └── database.sql        # Script SQL con el esquema de tablas y relaciones
├── src/
│   ├── comands/            # Interfaces de usuario y menús interactivos (CLI)
│   ├── config/             # Configuración y conexión centralizada a MySQL
│   ├── models/             # Clases de los objetos y validaciones de datos
│   ├── repositories/
│   ├── services/           # Lógica de negocio
│   └── index.js            # Punto de entrada principal de la aplicación
├── .env.example            # Archivo secreto con configuraciones privadas (credenciales DB)
├── .gitignore              # Archivos excluidos del control de versiones
├── package.json            # Dependencias y scripts del proyecto
└── README.md               # Documentación técnica oficial

## Instrucciones de Instalación y Uso
Clonar o abrir la carpeta del proyecto en tu terminal.

Instalar las dependencias ejecutando:

Bash
npm install

##Configurar las Variables de Entorno:
Crea un archivo .env en la raíz del proyecto con tus credenciales de MySQL:

Fragmento de código
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=fitcore

##Configurar la Base de Datos:
Ejecuta el script ubicado en database/database.sql en tu gestor de MySQL local para crear las tablas (clientes, planes, contratos).

##Ejecutar la aplicación:

Bash
npm start

##Patrones de Diseño Usados
Patrón Singleton (src/config/database.js):

Propósito: Garantizar una gestión centralizada de la conexión a la base de datos MySQL, optimizando recursos durante el ciclo de vida de la aplicación CLI.

##Patrón Repository (src/repositories/):

Propósito: Separar la lógica de negocio y los modelos de las consultas SQL directas, centralizando las operaciones CRUD para cada entidad (clienteRepository.js, planRepository.js, contractRepository.js).

##Principios SOLID Aplicados
S (Single Responsibility Principle): Cada clase tiene una única responsabilidad bien definida (por ejemplo, los modelos validan la estructura de los datos y los repositorios manejan exclusivamente la persistencia en MySQL).

O (Open/Closed Principle): Las clases están abiertas a extensiones pero cerradas a modificación mediante métodos de mapeo estructurados.

D (Dependency Inversion Principle): Los componentes del menú dependen de abstracciones y servicios desacoplados del motor de base de datos.

## Equipo y Roles (Scrum)
Product Owner - PO: Irma Yaneht Arias García

Scrum Master - SM: Irma Yaneht Arias García

Developers: Irma Yaneht Arias García