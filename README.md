# Windows Activator

A simple Electron application that executes Windows activation commands using KMS.

## Disclaimer

This tool is for educational purposes only. Make sure you have the right to activate your copy of Windows. Using KMS activation on systems you don't own may violate licensing agreements.

## Features

- Automatic detection of Windows version (10 or 11)
- Simple graphical interface for Windows activation
- Supports all Windows 10/11 editions
- Executes activation commands with administrative privileges
- Built with Electron for cross-platform compatibility

## Requirements

- Windows OS (required for activation commands)
- Node.js and npm installed

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```
   npm install
   ```

## Usage

1. Run the application:
   ```
   npm start
   ```

2. The application will automatically detect your Windows version
3. Select your Windows edition from the dropdown
4. Optionally change the KMS server (default is kms.msguides.com)
5. Click "Activate Windows"
6. Grant administrative privileges when prompted
7. Check your Windows activation status

## How It Works

The application executes these commands in sequence:

1. Installs the KMS client key for your Windows edition:
   ```
   slmgr /ipk YOUR_LICENSE_KEY
   ```

2. Sets the KMS server address:
   ```
   slmgr /skms kms.msguides.com
   ```

3. Activates Windows:
   ```
   slmgr /ato
   ```

## Supported Windows Editions

Both Windows 10 and Windows 11 editions:
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

## Troubleshooting

For Windows 10:
- If you encounter error 0xC004F074:
  - Ensure you have a stable internet connection
  - Try again later (the KMS server might be busy)
  - Verify you've selected the correct Windows edition

For Windows 11:
- If you encounter error 0x80070005:
  - The server is busy, try the command again until you succeed
  - Verify you've selected the correct Windows edition

## License

MIT License