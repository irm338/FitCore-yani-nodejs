import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import gymService from './GymService.js';

// Builds a portable JSON snapshot from the normalized client history tables.
class ClientExportService {
  async exportarHistorialCliente(id) {
    const historial = await gymService.obtenerHistorialCliente(id);
    if (!historial) {
      return null;
    }

    const exportData = {
      ...historial,
      fechaExportacion: new Date().toISOString()
    };
    // Generated reports live outside source control and are ignored by .gitignore.
    const exportDirectory = path.resolve(process.cwd(), 'exports');
    const filePath = path.join(exportDirectory, `cliente_${Number(id)}_historial.json`);

    await mkdir(exportDirectory, { recursive: true });
    await writeFile(filePath, JSON.stringify(exportData, null, 2), 'utf8');

    return filePath;
  }
}

export default new ClientExportService();
