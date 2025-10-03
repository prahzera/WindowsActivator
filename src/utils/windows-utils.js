const { exec } = require('child_process');

/**
 * Detecta la versión y edición de Windows
 * @returns {Promise<Object>} Información del sistema
 */
function detectWindowsInfo() {
  return new Promise((resolve, reject) => {
    // Comando para obtener información detallada del sistema
    const command = 'wmic os get Caption,Version /value';
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }

      if (stderr) {
        reject(new Error(stderr));
        return;
      }

      const lines = stdout.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      let captionLine = lines.find(l => l.startsWith('Caption='));
      let versionLine = lines.find(l => l.startsWith('Version='));

      let version = 'Desconocida';
      let edition = 'Desconocida';

      if (captionLine) {
        const caption = captionLine.replace('Caption=', '').trim();
        
        // Detectamos la versión
        if (caption.includes('Windows 11')) {
          version = 'Windows 11';
        } else if (caption.includes('Windows 10')) {
          version = 'Windows 10';
        }

        // Detectamos la edición (Pro, Home, Enterprise, etc.)
        if (caption.includes('Pro') && !caption.includes('Professional')) {
          edition = 'Professional';
        } else if (caption.includes('Professional')) {
          edition = 'Professional';
        } else if (caption.includes('Home')) {
          edition = 'Home';
        } else if (caption.includes('Enterprise')) {
          edition = 'Enterprise';
        } else if (caption.includes('Education')) {
          edition = 'Education';
        } else {
          // Intentamos obtener la edición desde el registro
          getEditionFromRegistry((err, regEdition) => {
            if (!err && regEdition) {
              edition = regEdition;
            }
            resolve({ version, edition });
          });
          return;
        }
      }

      resolve({ version, edition });
    });
  });
}

/**
 * Obtiene la edición de Windows desde el registro
 * @param {Function} callback - Función de callback
 */
function getEditionFromRegistry(callback) {
  const regCommand = 'reg query "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion" /v ProductName';
  
  exec(regCommand, (error, stdout, stderr) => {
    if (error || stderr) {
      callback(error || new Error(stderr));
      return;
    }
    
    const lines = stdout.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const productLine = lines.find(l => l.includes('ProductName'));
    
    if (productLine) {
      const parts = productLine.split('REG_SZ');
      if (parts.length > 1) {
        const productName = parts[1].trim();
        
        if (productName.includes('Pro')) {
          callback(null, 'Professional');
        } else if (productName.includes('Home')) {
          callback(null, 'Home');
        } else if (productName.includes('Enterprise')) {
          callback(null, 'Enterprise');
        } else if (productName.includes('Education')) {
          callback(null, 'Education');
        } else {
          callback(null, productName);
        }
        return;
      }
    }
    
    callback(null, 'Desconocida');
  });
}

/**
 * Obtiene las ediciones de Windows disponibles
 * @returns {Object} Lista de ediciones
 */
function getWindowsEditions() {
  // Las ediciones de Windows 10 y 11 son las mismas para activación
  return {
    editions: [
      { name: 'Home', key: 'TX9XD-98N7V-6WMQ6-BX7FG-H8Q99' },
      { name: 'Home N', key: '3KHY7-WNT83-DGQKR-F7HPR-844BM' },
      { name: 'Home Single Language', key: '7HNRX-D7KGG-3K4RQ-4WPJ4-YTDFH' },
      { name: 'Home Country Specific', key: 'PVMJN-6DFY6-9CCP6-7BKTT-D3WVR' },
      { name: 'Professional', key: 'W269N-WFGWX-YVC9B-4J6C9-T83GX' },
      { name: 'Professional N', key: 'MH37W-N47XK-V7XM9-C7227-GCQG9' },
      { name: 'Education', key: 'NW6C2-QMPVW-D7KKK-3GKT6-VCFB2' },
      { name: 'Education N', key: '2WH4N-8QGBV-H22JP-CT43Q-MDWWJ' },
      { name: 'Enterprise', key: 'NPPR9-FWDCX-D2C8J-H872K-2YT43' },
      { name: 'Enterprise N', key: 'DPH2V-TTNVB-4X9Q3-TJR4H-KHJW4' }
    ]
  };
}

module.exports = {
  detectWindowsInfo,
  getEditionFromRegistry,
  getWindowsEditions
};