# Activador de Windows

Una aplicación Electron simple que ejecuta comandos de activación de Windows usando KMS.

## Descargo de responsabilidad

Esta herramienta es solo para fines educativos. Asegúrate de tener derecho a activar tu copia de Windows. Usar activación KMS en sistemas que no te pertenecen puede violar acuerdos de licencia.

## Características

- Detección automática de la versión de Windows (10 o 11)
- Interfaz gráfica simple para la activación de Windows
- Soporta todas las ediciones de Windows 10/11
- Ejecuta comandos de activación con privilegios administrativos
- Construido con Electron para compatibilidad multiplataforma

## Requisitos

- Sistema operativo Windows (requerido para los comandos de activación)
- Node.js y npm instalados

## Instalación

1. Clona o descarga este repositorio
2. Instala las dependencias:
   ```
   npm install
   ```

## Uso

1. Ejecuta la aplicación:
   ```
   npm start
   ```

2. La aplicación detectará automáticamente tu versión de Windows
3. Selecciona tu edición de Windows del menú desplegable
4. Opcionalmente cambia el servidor KMS (por defecto es kms.msguides.com)
5. Haz clic en "Activar Windows"
6. Otorga privilegios administrativos cuando se te solicite
7. Verifica el estado de activación de Windows

## Uso de la versión compilada

Si descargas la versión compilada del proyecto en la sección de Releases, simplemente ejecuta el archivo .exe y haz clic en el botón "Activar Windows". La aplicación detectará automáticamente tu versión de Windows y te permitirá seleccionar la edición correspondiente.

## Cómo funciona

La aplicación ejecuta estos comandos en secuencia:

1. Instala la clave de cliente KMS para tu edición de Windows:
   ```
   slmgr /ipk TU_CLAVE_DE_LICENCIA
   ```

2. Establece la dirección del servidor KMS:
   ```
   slmgr /skms kms.msguides.com
   ```

3. Activa Windows:
   ```
   slmgr /ato
   ```

## Ediciones de Windows soportadas

Ediciones para Windows 10 y Windows 11:
- Home: TX9XD-98N7V-6WMQ6-BX7FG-H8Q99
- Home N: 3KHY7-WNT83-DGQKR-F7HPR-844BM
- Home Single Language: 7HNRX-D7KGG-3K4RQ-4WPJ4-YTDFH
- Home Country Specific: PVMJN-6DFY6-9CCP6-7BKTT-D3WVR
- Professional: W269N-WFGWX-YVC9B-4J6C9-T83GX
- Professional N: MH37W-N47XK-V7XM9-C7227-GCQG9
- Education: NW6C2-QMPVW-D7KKK-3GKT6-VCFB2
- Education N: 2WH4N-8QGBV-H22JP-CT43Q-MDWWJ
- Enterprise: NPPR9-FWDCX-D2C8J-H872K-2YT43
- Enterprise N: DPH2V-TTNVB-4X9Q3-TJR4H-KHJW4

## Solución de problemas

Para Windows 10:
- Si encuentras el error 0xC004F074:
  - Asegúrate de tener una conexión a internet estable
  - Inténtalo de nuevo más tarde (el servidor KMS podría estar ocupado)
  - Verifica que hayas seleccionado la edición correcta de Windows

Para Windows 11:
- Si encuentras el error 0x80070005:
  - El servidor está ocupado, intenta el comando de nuevo hasta que tenga éxito
  - Verifica que hayas seleccionado la edición correcta de Windows

## Licencia

Licencia MIT