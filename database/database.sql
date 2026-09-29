

-- 1. Crear la base de datos (coincide con tu archivo .env: DB_NAME=fitcore)
CREATE DATABASE IF NOT EXISTS fitcore;
USE fitcore;

-- 2. Tabla de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dpi VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    correo VARCHAR(100) NOT NULL
);

-- 3. Tabla de Planes de Entrenamiento
CREATE TABLE IF NOT EXISTS planes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    duracion INT NOT NULL,               -- Duración expresada en semanas
    metasFisicas TEXT NOT NULL,
    nivel VARCHAR(50) NOT NULL,
    fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP          -- Principiante, intermedio, avanzado
);

-- 4. Tabla de Contratos (con llaves foráneas hacia clientes y planes)
CREATE TABLE IF NOT EXISTS contratos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idCliente INT NOT NULL,
    idPlan INT NOT NULL,
    costoTotal DECIMAL(10, 2) NOT NULL,
    metodoPago VARCHAR(50) NOT NULL,
    fechaInicio DATE NOT NULL,
    CONSTRAINT fk_contrato_cliente FOREIGN KEY (idCliente) REFERENCES clientes(id) ON DELETE CASCADE,
    CONSTRAINT fk_contrato_plan FOREIGN KEY (idPlan) REFERENCES planes(id) ON DELETE CASCADE
);