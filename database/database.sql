
-- 1. Crear y usar la base de datos
CREATE DATABASE IF NOT EXISTS fitcore;
USE fitcore;

-- 2. Tabla de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dpi VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    fechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Planes (Membresías o tipos de planes)
CREATE TABLE IF NOT EXISTS planes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,         -- Ej: Musculación, Definición, etc.
    duracion INT NOT NULL,               -- Duración expresada en semanas
    nivel VARCHAR(50) NOT NULL,          -- Principiante, Intermedio, Avanzado
    precioBase DECIMAL(10, 2) NOT NULL,
    fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Metas Físicas del Cliente (Independiente o ligada al cliente)
CREATE TABLE IF NOT EXISTS metas_fisicas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idCliente INT NOT NULL,
    pesoObjetivo DECIMAL(5, 2) NOT NULL, -- En kg
    porcentajeGrasaObjetivo DECIMAL(5, 2), -- En %
    objetivoPrincipal VARCHAR(150) NOT NULL, -- Ej: Ganar masa muscular, perder peso
    fechaInicio DATE NOT NULL,
    fechaMeta DATE NOT NULL,
    CONSTRAINT fk_meta_cliente FOREIGN KEY (idCliente) REFERENCES clientes(id) ON DELETE CASCADE
);

-- 5. Tabla de Seguimiento Físico (Historial de mediciones del cliente)
CREATE TABLE IF NOT EXISTS seguimiento_fisico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idCliente INT NOT NULL,
    fechaRegistro DATE NOT NULL,
    pesoActual DECIMAL(5, 2) NOT NULL,
    porcentajeGrasa DECIMAL(5, 2),
    masaMuscular DECIMAL(5, 2),
    observaciones TEXT,
    CONSTRAINT fk_seguimiento_cliente FOREIGN KEY (idCliente) REFERENCES clientes(id) ON DELETE CASCADE
);

-- 6. Tabla de Planes de Alimentación / Nutrición
CREATE TABLE IF NOT EXISTS nutricion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idCliente INT NOT NULL,
    caloriasDiarias INT NOT NULL,
    proteinas INT NOT NULL,               -- En gramos
    carbohidratos INT NOT NULL,          -- En gramos
    grasas INT NOT NULL,                 -- En gramos
    detallesMenu TEXT NOT NULL,          -- Descripción de las comidas o dieta asignada
    CONSTRAINT fk_nutricion_cliente FOREIGN KEY (idCliente) REFERENCES clientes(id) ON DELETE CASCADE
);

-- 7. Tabla de Contratos (Inscripciones de clientes a planes)
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

-- 8. Tabla de Finanzas (Registro de Ingresos y Egresos del Gimnasio)
CREATE TABLE IF NOT EXISTS transacciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('INGRESO', 'EGRESO') NOT NULL, -- Define si entra o sale dinero
    monto DECIMAL(10, 2) NOT NULL,
    categoria VARCHAR(50) NOT NULL,          -- Ej: Membresía, Equipamiento, Servicios
    descripcion TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);


