// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    const editionSelect = document.getElementById('edition');
    const activateBtn = document.getElementById('activate-btn');
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');
    const detectedSystem = document.getElementById('detected-system');
    
    // Handle custom title bar controls
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
    
    // Load Windows editions
    try {
        // Detect Windows version and edition
        const windowsInfo = await window.electronAPI.detectWindowsInfo();
        console.log('Windows Info:', windowsInfo);
        
        // Display Windows information
        detectedSystem.textContent = `${windowsInfo.version} ${windowsInfo.edition}`;
        
        const { editions } = await window.electronAPI.getWindowsEditions();
        
        // Clear loading option
        editionSelect.innerHTML = '';
        
        // Populate the select dropdown
        editions.forEach(edition => {
            const option = document.createElement('option');
            option.value = edition.key;
            option.textContent = `${edition.name}`;
            editionSelect.appendChild(option);
        });
        
        // Try to auto-select edition based on detected info
        if (windowsInfo.edition !== 'Unknown') {
            // Map detected edition to our list
            const editionMap = {
                'Professional': 'Professional',
                'Pro': 'Professional',
                'Home': 'Home',
                'Enterprise': 'Enterprise',
                'Education': 'Education'
            };
            
            const mappedEdition = editionMap[windowsInfo.edition];
            if (mappedEdition) {
                // Find the corresponding option and select it
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
        showResult('Failed to load Windows information: ' + error.message, 'error');
        
        // Load editions anyway
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
            showResult('Failed to load Windows editions: ' + editionError.message, 'error');
        }
    }
    
    // Handle activation button click
    activateBtn.addEventListener('click', async () => {
        const selectedKey = editionSelect.value;
        const kmsServer = 'kms.msguides.com'; // Hardcoded server
        
        // Validate inputs
        if (!selectedKey) {
            showResult('Por favor selecciona una edición de Windows', 'error');
            return;
        }
        
        // Disable button and show loading
        activateBtn.disabled = true;
        loadingDiv.style.display = 'block';
        resultDiv.style.display = 'none';
        
        try {
            // Call the activation function
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
            // Re-enable button and hide loading
            activateBtn.disabled = false;
            loadingDiv.style.display = 'none';
        }
    });
    
    // Helper function to show results
    function showResult(message, type) {
        resultDiv.innerHTML = `
            <div class="status-indicator ${type === 'success' ? 'status-active' : 'status-inactive'}"></div>
            ${message}
        `;
        resultDiv.className = `result ${type}`;
        resultDiv.style.display = 'block';
        
        // Scroll to result
        resultDiv.scrollIntoView({ behavior: 'smooth' });
    }
});