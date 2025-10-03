const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const sudo = require('sudo-prompt');

// Removemos la verificación de electron-squirrel-startup que no es necesaria

const createWindow = () => {
  // Create the browser window with 16:9 aspect ratio
  const mainWindow = new BrowserWindow({
    width: 960,
    height: 540, // 16:9 aspect ratio
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    frame: false, // Remove default window frame
    titleBarStyle: 'hidden', // Hide title bar
    backgroundColor: '#0d0d1a', // Match background color
    resizable: false, // Fixed size for consistent design
    fullscreenable: false // Disable fullscreen
  });

  // Set window title
  mainWindow.setTitle('ACTIVADOR WIN 10/11 by Prahzera');

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for window controls
ipcMain.handle('minimize-window', async (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window.minimize();
});

ipcMain.handle('maximize-window', async (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window.isMaximized()) {
    window.unmaximize();
  } else {
    window.maximize();
  }
});

ipcMain.handle('close-window', async (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window.close();
});

// IPC handler to detect Windows version and edition
ipcMain.handle('detect-windows-info', async () => {
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

      let version = 'Unknown';
      let edition = 'Unknown';

      if (captionLine) {
        const caption = captionLine.replace('Caption=', '').trim();
        
        // Detect versión
        if (caption.includes('Windows 11')) {
          version = 'Windows 11';
        } else if (caption.includes('Windows 10')) {
          version = 'Windows 10';
        }

        // Detect edición (Pro, Home, Enterprise, etc.)
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
          // Intentar obtener la edición con otro comando
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
});

// Función auxiliar para obtener la edición desde el registro
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
    
    callback(null, 'Unknown');
  });
}

// IPC handlers for Windows activation
ipcMain.handle('get-windows-editions', async () => {
  // Windows 10 and 11 editions are the same for activation
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
});

ipcMain.handle('activate-windows', async (event, { editionKey, kmsServer }) => {
  try {
    // Step 1: Install activation client key
    const keyCommand = `slmgr /ipk ${editionKey}`;
    
    // Step 2: Set activation server address
    const kmsCommand = `slmgr /skms ${kmsServer}`;
    
    // Step 3: Activate Windows
    const activateCommand = 'slmgr /ato';
    
    // Execute commands with admin privileges
    const options = {
      name: 'Windows Activator'
      // Removemos la propiedad icns que causaba el error
    };
    
    // Return a promise that resolves when all commands are executed
    return new Promise((resolve, reject) => {
      // Execute the commands sequentially
      executeCommandWithAdminPrivileges(keyCommand, options)
        .then(() => executeCommandWithAdminPrivileges(kmsCommand, options))
        .then(() => executeCommandWithAdminPrivileges(activateCommand, options))
        .then(() => resolve({ success: true, message: 'Windows activation commands executed successfully' }))
        .catch(error => reject({ success: false, error: error.message }));
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Helper function to execute commands with admin privileges
function executeCommandWithAdminPrivileges(command, options) {
  return new Promise((resolve, reject) => {
    sudo.exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}