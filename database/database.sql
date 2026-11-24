-- Crea la base de datos usada por defecto en .env.example y selecciona su esquema.
CREATE DATABASE IF NOT EXISTS fitcore
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE fitcore;

-- Datos de identificación y contacto. El DPI identifica de forma única al cliente.
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dpi VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    fechaRegistro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Catálogo de planes disponibles para asociar a los contratos.
CREATE TABLE IF NOT EXISTS planes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    duracion INT NOT NULL COMMENT 'Duración del plan expresada en semanas',
    nivel VARCHAR(50) NOT NULL COMMENT 'Principiante, intermedio o avanzado',
    precioBase DECIMAL(10, 2) NOT NULL,
    fechaCreacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Metas físicas individuales. Se eliminan junto con el cliente al que pertenecen.
CREATE TABLE IF NOT EXISTS metas_fisicas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idCliente INT NOT NULL,
    pesoObjetivo DECIMAL(5, 2) NOT NULL COMMENT 'Peso objetivo expresado en kilogramos',
    porcentajeGrasaObjetivo DECIMAL(5, 2) COMMENT 'Porcentaje de grasa corporal objetivo',
    objetivoPrincipal VARCHAR(150) NOT NULL,
    fechaInicio DATE NOT NULL,
    fechaMeta DATE NOT NULL,
    CONSTRAINT fk_meta_cliente
        FOREIGN KEY (idCliente) REFERENCES clientes(id) ON DELETE CASCADE
);

-- Mediciones históricas del cliente, ordenables por fechaRegistro.
CREATE TABLE IF NOT EXISTS seguimiento_fisico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idCliente INT NOT NULL,
    fechaRegistro DATE NOT NULL,
    pesoActual DECIMAL(5, 2) NOT NULL COMMENT 'Peso registrado en kilogramos',
    porcentajeGrasa DECIMAL(5, 2),
    masaMuscular DECIMAL(5, 2),
    observaciones TEXT,
    CONSTRAINT fk_seguimiento_cliente
        FOREIGN KEY (idCliente) REFERENCES clientes(id) ON DELETE CASCADE
);

-- Información nutricional asignada a un cliente y exportada en su historial.
CREATE TABLE IF NOT EXISTS nutricion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idCliente INT NOT NULL,
    caloriasDiarias INT NOT NULL,
    proteinas INT NOT NULL COMMENT 'Cantidad diaria en gramos',
    carbohidratos INT NOT NULL COMMENT 'Cantidad diaria en gramos',
    grasas INT NOT NULL COMMENT 'Cantidad diaria en gramos',
    detallesMenu TEXT NOT NULL,
    CONSTRAINT fk_nutricion_cliente
        FOREIGN KEY (idCliente) REFERENCES clientes(id) ON DELETE CASCADE
);

-- Contratos vinculan a un cliente con un plan y registran el precio acordado.
-- El borrado en cascada conserva el comportamiento definido por el esquema actual.
CREATE TABLE IF NOT EXISTS contratos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idCliente INT NOT NULL,
    idPlan INT NOT NULL,
    costoTotal DECIMAL(10, 2) NOT NULL,
    metodoPago VARCHAR(50) NOT NULL,
    fechaInicio DATE NOT NULL,
    CONSTRAINT fk_contrato_cliente
        FOREIGN KEY (idCliente) REFERENCES clientes(id) ON DELETE CASCADE,
    CONSTRAINT fk_contrato_plan
        FOREIGN KEY (idPlan) REFERENCES planes(id) ON DELETE CASCADE
);

-- Registro financiero independiente para ingresos y egresos del gimnasio.
CREATE TABLE IF NOT EXISTS transacciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('INGRESO', 'EGRESO') NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    descripcion TEXT,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
