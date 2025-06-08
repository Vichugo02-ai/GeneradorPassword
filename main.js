
        // Variables globales
        let passwordHistory = [];
        let passwordChart = null;
        
        // Elementos del DOM
        const passwordForm = document.getElementById('passwordForm');
        const passwordOutput = document.getElementById('passwordOutput');
        const passwordDisplay = document.getElementById('passwordDisplay');
        const passwordHistoryList = document.getElementById('passwordHistory');
        const generateBtn = document.getElementById('generateBtn');
        const copyBtn = document.getElementById('copyBtn');
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        const savePasswordBtn = document.getElementById('savePasswordBtn');
        const strengthMeter = document.getElementById('strengthMeter');
        const strengthText = document.getElementById('strengthText');
        
        // Elementos de estadísticas
        const lengthStat = document.getElementById('lengthStat');
        const upperStat = document.getElementById('upperStat');
        const lowerStat = document.getElementById('lowerStat');
        const numberStat = document.getElementById('numberStat');
        const symbolStat = document.getElementById('symbolStat');
        const entropyStat = document.getElementById('entropyStat');
        
        // Inicialización
        document.addEventListener('DOMContentLoaded', function() {
            loadPasswordHistory();
            generatePassword();
            
            // Event listeners
            generateBtn.addEventListener('click', generatePassword);
            copyBtn.addEventListener('click', copyPassword);
            clearHistoryBtn.addEventListener('click', clearPasswordHistory);
            savePasswordBtn.addEventListener('click', savePassword);
            
            // Validación del formulario
            passwordForm.addEventListener('submit', function(e) {
                e.preventDefault();
                generatePassword();
            });
        });
        
        // Función para generar contraseña
        function generatePassword() {
            const length = parseInt(document.getElementById('passwordLength').value) || 12;
            const useUppercase = document.getElementById('uppercase').checked;
            const useLowercase = document.getElementById('lowercase').checked;
            const useNumbers = document.getElementById('numbers').checked;
            const useSymbols = document.getElementById('symbols').checked;
            const excludeChars = document.getElementById('excludeChars').value;
            
            // Validar que al menos un tipo de carácter esté seleccionado
            if (!useUppercase && !useLowercase && !useNumbers && !useSymbols) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Selecciona al menos un tipo de carácter.'
                });
                return;
            }
            
            // Definir conjuntos de caracteres
            const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const lowercase = 'abcdefghijklmnopqrstuvwxyz';
            const numbers = '0123456789';
            const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            
            // Crear conjunto de caracteres según selección
            let charSet = '';
            if (useUppercase) charSet += uppercase;
            if (useLowercase) charSet += lowercase;
            if (useNumbers) charSet += numbers;
            if (useSymbols) charSet += symbols;
            
            // Eliminar caracteres excluidos
            if (excludeChars) {
                const excludeArray = excludeChars.split('');
                charSet = charSet.split('').filter(char => !excludeArray.includes(char)).join('');
            }
            
            // Verificar si hay caracteres disponibles
            if (charSet.length === 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No hay caracteres disponibles con la configuración actual.'
                });
                return;
            }
            
            // Generar contraseña
            let password = '';
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * charSet.length);
                password += charSet[randomIndex];
            }
            
            // Mostrar contraseña
            passwordOutput.textContent = password;
            passwordDisplay.classList.add('password-animation');
            setTimeout(() => {
                passwordDisplay.classList.remove('password-animation');
            }, 500);
            
            // Analizar contraseña
            analyzePassword(password);
            
            // Actualizar gráfico
            updatePasswordChart(password);
            
            // Actualizar estadísticas
            updateStats(password);
        }
        
        // Función para analizar la contraseña
        function analyzePassword(password) {
            // Contar tipos de caracteres
            const upperCount = (password.match(/[A-Z]/g) || []).length;
            const lowerCount = (password.match(/[a-z]/g) || []).length;
            const numberCount = (password.match(/[0-9]/g) || []).length;
            const symbolCount = (password.match(/[^A-Za-z0-9]/g) || []).length;
            
            // Calcular fortaleza
            let strength = 0;
            let strengthPercent = 0;
            let strengthLabel = '';
            
            // Basado en longitud
            if (password.length >= 8) strength += 1;
            if (password.length >= 12) strength += 1;
            if (password.length >= 16) strength += 1;
            if (password.length >= 20) strength += 1;
            
            // Basado en diversidad
            if (upperCount > 0) strength += 1;
            if (lowerCount > 0) strength += 1;
            if (numberCount > 0) strength += 1;
            if (symbolCount > 0) strength += 1;
            
            // Convertir a porcentaje
            strengthPercent = Math.min(100, (strength / 8) * 100);
            
            // Asignar etiqueta
            if (strengthPercent < 40) {
                strengthLabel = 'Débil';
                strengthMeter.style.backgroundColor = '#e74c3c';
            } else if (strengthPercent < 70) {
                strengthLabel = 'Moderada';
                strengthMeter.style.backgroundColor = '#f39c12';
            } else if (strengthPercent < 90) {
                strengthLabel = 'Fuerte';
                strengthMeter.style.backgroundColor = '#2ecc71';
            } else {
                strengthLabel = 'Muy Fuerte';
                strengthMeter.style.backgroundColor = '#27ae60';
            }
            
            // Actualizar UI
            strengthMeter.style.width = `${strengthPercent}%`;
            strengthText.textContent = `Seguridad: ${strengthLabel} (${Math.round(strengthPercent)}%)`;
            
            // Calcular entropía
            const charSetSize = 
                (upperCount > 0 ? 26 : 0) +
                (lowerCount > 0 ? 26 : 0) +
                (numberCount > 0 ? 10 : 0) +
                (symbolCount > 0 ? 32 : 0);
                
            const entropy = password.length * Math.log2(charSetSize);
            entropyStat.textContent = entropy.toFixed(1);
        }
        
        // Función para actualizar el gráfico
        function updatePasswordChart(password) {
            const ctx = document.getElementById('passwordChart').getContext('2d');
            
            // Contar tipos de caracteres
            const upperCount = (password.match(/[A-Z]/g) || []).length;
            const lowerCount = (password.match(/[a-z]/g) || []).length;
            const numberCount = (password.match(/[0-9]/g) || []).length;
            const symbolCount = (password.match(/[^A-Za-z0-9]/g) || []).length;
            
            // Destruir gráfico anterior si existe
            if (passwordChart) {
                passwordChart.destroy();
            }
            
            // Crear nuevo gráfico
            passwordChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Mayúsculas', 'Minúsculas', 'Números', 'Símbolos'],
                    datasets: [{
                        data: [upperCount, lowerCount, numberCount, symbolCount],
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(255, 206, 86, 0.8)',
                            'rgba(255, 99, 132, 0.8)'
                        ],
                        borderColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(255, 99, 132, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: 'white',
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Función para actualizar estadísticas
        function updateStats(password) {
            const upperCount = (password.match(/[A-Z]/g) || []).length;
            const lowerCount = (password.match(/[a-z]/g) || []).length;
            const numberCount = (password.match(/[0-9]/g) || []).length;
            const symbolCount = (password.match(/[^A-Za-z0-9]/g) || []).length;
            
            lengthStat.textContent = password.length;
            upperStat.textContent = upperCount;
            lowerStat.textContent = lowerCount;
            numberStat.textContent = numberCount;
            symbolStat.textContent = symbolCount;
        }
        
        // Función para copiar contraseña al portapapeles
        function copyPassword() {
            const password = passwordOutput.textContent;
            
            if (!password || password === "Haga clic en \"Generar Contraseña\"") {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No hay contraseña para copiar'
                });
                return;
            }
            
            navigator.clipboard.writeText(password).then(() => {
                // Cambiar icono temporalmente
                const icon = copyBtn.querySelector('i');
                icon.classList.remove('fa-copy');
                icon.classList.add('fa-check');
                
                Swal.fire({
                    icon: 'success',
                    title: 'Copiado',
                    text: 'La contraseña se ha copiado al portapapeles',
                    timer: 1500,
                    showConfirmButton: false
                });
                
                setTimeout(() => {
                    icon.classList.remove('fa-check');
                    icon.classList.add('fa-copy');
                }, 2000);
            });
        }
        
        // Función para guardar contraseña en el historial
        function savePassword() {
            const password = passwordOutput.textContent;
            
            if (!password || password === "Haga clic en \"Generar Contraseña\"") {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No hay contraseña para guardar'
                });
                return;
            }
            
            // Agregar al historial
            passwordHistory.unshift({
                password: password,
                timestamp: new Date().toLocaleString()
            });
            
            // Limitar historial a 10 elementos
            if (passwordHistory.length > 10) {
                passwordHistory.pop();
            }
            
            // Actualizar UI
            updatePasswordHistory();
            
            // Guardar en localStorage
            localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
            
            // Mostrar notificación
            Swal.fire({
                icon: 'success',
                title: 'Guardado',
                text: 'La contraseña se ha guardado en el historial',
                timer: 1500,
                showConfirmButton: false
            });
        }
        
        // Función para actualizar el historial de contraseñas en la UI
        function updatePasswordHistory() {
            passwordHistoryList.innerHTML = '';
            
            if (passwordHistory.length === 0) {
                passwordHistoryList.innerHTML = '<li>No hay contraseñas guardadas</li>';
                return;
            }
            
            passwordHistory.forEach((item, index) => {
                const li = document.createElement('li');
                li.textContent = item.password;
                li.setAttribute('title', `Generada el: ${item.timestamp}`);
                li.classList.add('fade-in');
                passwordHistoryList.appendChild(li);
            });
        }
        
        // Función para cargar el historial de contraseñas desde localStorage
        function loadPasswordHistory() {
            const savedHistory = localStorage.getItem('passwordHistory');
            if (savedHistory) {
                passwordHistory = JSON.parse(savedHistory);
                updatePasswordHistory();
            }
        }
        
        // Función para limpiar el historial de contraseñas
        function clearPasswordHistory() {
            if (passwordHistory.length === 0) {
                Swal.fire({
                    icon: 'info',
                    title: 'Historial Vacío',
                    text: 'No hay contraseñas para eliminar'
                });
                return;
            }
            
            Swal.fire({
                title: '¿Estás seguro?',
                text: "Se eliminarán todas las contraseñas guardadas",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, borrar todo',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    passwordHistory = [];
                    localStorage.removeItem('passwordHistory');
                    updatePasswordHistory();
                    
                    Swal.fire(
                        '¡Eliminado!',
                        'El historial ha sido borrado.',
                        'success'
                    );
                }
            });
        }
