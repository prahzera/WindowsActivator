const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sudo = require('sudo-prompt');
const { detectWindowsInfo, getWindowsEditions } = require('../utils/windows-utils');

// Eliminamos la verificación de electron-squirrel-startup que no es necesaria

const createWindow = () => {
  // Creamos la ventana del navegador con proporción de aspecto 16:9
  const mainWindow = new BrowserWindow({
    width: 960,
    height: 540, // Proporción de aspecto 16:9
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    frame: false, // Eliminamos el marco predeterminado de la ventana
    titleBarStyle: 'hidden', // Ocultamos la barra de título
    backgroundColor: '#0d0d1a', // Coincidimos con el color de fondo
    resizable: false, // Tamaño fijo para diseño consistente
    fullscreenable: false // Deshabilitamos pantalla completa
  });

  // Establecemos el título de la ventana
  mainWindow.setTitle('ACTIVADOR WIN 10/11 by Prahzera');

  // Cargamos el archivo index.html de la aplicación
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
};

// Este método se llamará cuando Electron haya terminado
// la inicialización y esté listo para crear ventanas del navegador.
// Algunas APIs solo pueden usarse después de que ocurra este evento.
app.on('ready', createWindow);

// Salimos cuando se cierren todas las ventanas, excepto en macOS. Allí, es común
// que las aplicaciones y su barra de menú permanezcan activas hasta que el usuario salga
// explícitamente con Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // En OS X es común volver a crear una ventana en la aplicación cuando el
  // ícono del dock se hace clic y no hay otras ventanas abiertas.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Manejadores IPC para controles de ventana
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

// Manejador IPC para detectar la versión y edición de Windows
ipcMain.handle('detect-windows-info', async () => {
  return await detectWindowsInfo();
});

// Manejadores IPC para la activación de Windows
ipcMain.handle('get-windows-editions', async () => {
  return getWindowsEditions();
});

ipcMain.handle('activate-windows', async (event, { editionKey, kmsServer }) => {
  try {
    // Paso 1: Instalar la clave de cliente de activación
    const keyCommand = `slmgr /ipk ${editionKey}`;
    
    // Paso 2: Establecer la dirección del servidor de activación
    const kmsCommand = `slmgr /skms ${kmsServer}`;
    
    // Paso 3: Activar Windows
    const activateCommand = 'slmgr /ato';
    
    // Ejecutamos los comandos con privilegios de administrador
    const options = {
      name: 'Windows Activator'
      // Eliminamos la propiedad icns que causaba el error
    };
    
    // Retornamos una promesa que se resuelve cuando se ejecutan todos los comandos
    return new Promise((resolve, reject) => {
      // Ejecutamos los comandos secuencialmente
      executeCommandWithAdminPrivileges(keyCommand, options)
        .then(() => executeCommandWithAdminPrivileges(kmsCommand, options))
        .then(() => executeCommandWithAdminPrivileges(activateCommand, options))
        .then(() => resolve({ success: true, message: 'Comandos de activación de Windows ejecutados exitosamente' }))
        .catch(error => reject({ success: false, error: error.message }));
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Función auxiliar para ejecutar comandos con privilegios de administrador
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