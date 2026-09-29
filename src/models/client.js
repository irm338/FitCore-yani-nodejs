

class ClientModel {
    // 1. El constructor recibe los datos del cliente que vienen desde el menú CLI
    constructor({ dpi, nombre, apellido, correo }) {
      this.dpi = dpi;
      this.nombre = nombre;
      this.apellido = apellido;
      this.correo = correo;

    }
  
    // 2. Método de validación: Se encarga de verificar que ningún campo clave esté vacío antes de enviarlo a la BD
    validate() {
      if (!this.dpi || this.dpi.trim() === '') {
        throw new Error("El campo DPI es obligatorio.");
      }
      if (!this.nombre || this.nombre.trim() === '') {
        throw new Error("El campo nombre es obligatorio.");
      }
      if (!this.apellido || this.apellido.trim() === '') {
        throw new Error("El campo apellido es obligatorio.");
      }
      if (!this.correo || this.correo.trim() === '') {
        throw new Error("El campo correo es obligatorio.");
      }
      return true;
    }
  
    // 3. Método para transformar a formato de Base de Datos: Valida y devuelve un objeto limpio listo para MySQL
    toDBModel() {
      this.validate(); // Valida antes de transformar
      return {
        dpi: this.dpi,
        nombre: this.nombre,
        apellido: this.apellido,
        correo: this.correo
      };
    }
  }
  
  export default ClientModel;