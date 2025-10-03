// Esperamos a que el DOM se cargue completamente
document.addEventListener('DOMContentLoaded', async () => {
    const editionSelect = document.getElementById('edition');
    const activateBtn = document.getElementById('activate-btn');
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');
    const detectedSystem = document.getElementById('detected-system');
    
    // Manejamos los controles de la barra de título personalizada
    const minimizeBtn = document.getElementById('minimize-btn');
    const maximizeBtn = document.getElementById('maximize-btn');
    const closeBtn = document.getElementById('close-btn');
    
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => {
            window.electronAPI.minimizeWindow();
        });
    }
    
    if (maximizeBtn) {
        maximizeBtn.addEventListener('click', () => {
            window.electronAPI.maximizeWindow();
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            window.electronAPI.closeWindow();
        });
    }
    
    // Cargamos las ediciones de Windows
    try {
        // Detectamos la versión y edición de Windows
        const windowsInfo = await window.electronAPI.detectWindowsInfo();
        console.log('Información de Windows:', windowsInfo);
        
        // Mostramos la información de Windows
        detectedSystem.textContent = `${windowsInfo.version} ${windowsInfo.edition}`;
        
        const { editions } = await window.electronAPI.getWindowsEditions();
        
        // Limpiamos la opción de carga
        editionSelect.innerHTML = '';
        
        // Poblamos el menú desplegable
        editions.forEach(edition => {
            const option = document.createElement('option');
            option.value = edition.key;
            option.textContent = `${edition.name}`;
            editionSelect.appendChild(option);
        });
        
        // Intentamos seleccionar automáticamente la edición basada en la información detectada
        if (windowsInfo.edition !== 'Unknown') {
            // Mapeamos la edición detectada a nuestra lista
            const editionMap = {
                'Professional': 'Professional',
                'Pro': 'Professional',
                'Home': 'Home',
                'Enterprise': 'Enterprise',
                'Education': 'Education'
            };
            
            const mappedEdition = editionMap[windowsInfo.edition];
            if (mappedEdition) {
                // Encontramos la opción correspondiente y la seleccionamos
                for (let i = 0; i < editionSelect.options.length; i++) {
                    if (editionSelect.options[i].text.includes(mappedEdition)) {
                        editionSelect.selectedIndex = i;
                        break;
                    }
                }
            }
        }
    } catch (error) {
        detectedSystem.textContent = 'Error al detectar el sistema';
        showResult('Error al cargar la información de Windows: ' + error.message, 'error');
        
        // Cargamos las ediciones de todos modos
        try {
            const { editions } = await window.electronAPI.getWindowsEditions();
            editionSelect.innerHTML = '';
            editions.forEach(edition => {
                const option = document.createElement('option');
                option.value = edition.key;
                option.textContent = `${edition.name}`;
                editionSelect.appendChild(option);
            });
        } catch (editionError) {
            showResult('Error al cargar las ediciones de Windows: ' + editionError.message, 'error');
        }
    }
    
    // Manejamos el clic del botón de activación
    activateBtn.addEventListener('click', async () => {
        const selectedKey = editionSelect.value;
        const kmsServer = 'kms.msguides.com'; // Servidor codificado
        
        // Validamos las entradas
        if (!selectedKey) {
            showResult('Por favor selecciona una edición de Windows', 'error');
            return;
        }
        
        // Deshabilitamos el botón y mostramos la carga
        activateBtn.disabled = true;
        loadingDiv.style.display = 'block';
        resultDiv.style.display = 'none';
        
        try {
            // Llamamos a la función de activación
            const result = await window.electronAPI.activateWindows({
                editionKey: selectedKey,
                kmsServer: kmsServer
            });
            
            if (result.success) {
                showResult('¡Activación exitosa! Verifica el estado de activación de Windows.', 'success');
            } else {
                showResult(`Activación fallida: ${result.error}`, 'error');
            }
        } catch (error) {
            showResult(`Activación fallida: ${error.message}`, 'error');
        } finally {
            // Rehabilitamos el botón y ocultamos la carga
            activateBtn.disabled = false;
            loadingDiv.style.display = 'none';
        }
    });
    
    // Función auxiliar para mostrar resultados
    function showResult(message, type) {
        resultDiv.innerHTML = `
            <div class="status-indicator ${type === 'success' ? 'status-active' : 'status-inactive'}"></div>
            ${message}
        `;
        resultDiv.className = `result ${type}`;
        resultDiv.style.display = 'block';
        
        // Desplazamos al resultado
        resultDiv.scrollIntoView({ behavior: 'smooth' });
    }
});