// Définition des multiplicateurs
const MULTIPLIERS = [
    { level: 1, value: 2.0, canRetire: true, probability: 0.70 },
    { level: 2, value: 3.5, canRetire: true, probability: 0.55 },
    { level: 3, value: 5.1, canRetire: true, probability: 0.40 },
    { level: 4, value: 8.5, canRetire: true, probability: 0.25 },
    { level: 5, value: 13.0, canRetire: true, probability: 0.15 },
    { level: 6, value: 19.0, canRetire: true, isFinal: true, probability: 0.08 }
];

// Initialiser l'affichage des multiplicateurs
function initializeMultipliers() {
    const tableBody = document.getElementById('multiplier-table-body');
    const levelsContainer = document.getElementById('levels-container');
    
    // Vider les conteneurs
    tableBody.innerHTML = '';
    levelsContainer.innerHTML = '';
    
    // Remplir le tableau
    MULTIPLIERS.forEach(multiplier => {
        const row = document.createElement('tr');
        
        // Style pour la ligne actuelle
        if (multiplier.level === window.currentLevel + 1) {
            row.classList.add('current-level');
        }
        
        row.innerHTML = `
            <td>
                <span class="level">${multiplier.level}</span>
            </td>
            <td class="multiplier">${multiplier.value.toFixed(1)}×</td>
            <td>
                ${multiplier.canRetire ? 
                    '<i class="fas fa-check-circle" style="color: #4ecdc4;"></i>' : 
                    '<i class="fas fa-times-circle" style="color: #ff6b6b;"></i>'}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Remplir les indicateurs de niveau
    MULTIPLIERS.forEach(multiplier => {
        const levelElement = document.createElement('div');
        levelElement.className = 'level';
        levelElement.dataset.level = multiplier.level;
        
        if (multiplier.level === window.currentLevel + 1) {
            levelElement.classList.add('active');
        }
        
        levelElement.innerHTML = `
            <div class="level-number">Niveau ${multiplier.level}</div>
            <div class="level-multiplier">${multiplier.value.toFixed(1)}×</div>
        `;
        
        levelsContainer.appendChild(levelElement);
    });
}

// Mettre à jour les indicateurs de niveau
function updateLevelIndicators() {
    const levels = document.querySelectorAll('.level');
    const tableRows = document.querySelectorAll('#multiplier-table-body tr');
    
    // Réinitialiser tous les niveaux
    levels.forEach(level => {
        level.classList.remove('active', 'completed');
    });
    
    tableRows.forEach(row => {
        row.classList.remove('current-level');
    });
    
    // Marquer les niveaux complétés
    for (let i = 0; i < window.currentLevel; i++) {
        const levelElement = document.querySelector(`.level[data-level="${i + 1}"]`);
        const tableRow = tableRows[i];
        
        if (levelElement) {
            levelElement.classList.add('completed');
        }
        
        if (tableRow) {
            tableRow.classList.add('current-level');
        }
    }
    
    // Marquer le niveau actif
    if (window.currentLevel >= 0 && window.currentLevel < MULTIPLIERS.length) {
        const currentLevelElement = document.querySelector(`.level[data-level="${window.currentLevel + 1}"]`);
        const currentTableRow = tableRows[window.currentLevel];
        
        if (currentLevelElement) {
            currentLevelElement.classList.add('active');
        }
        
        if (currentTableRow) {
            currentTableRow.classList.add('current-level');
        }
    }
    
    // Mettre à jour le multiplicateur actuel
    if (window.currentLevel >= 0 && window.currentLevel < MULTIPLIERS.length) {
        window.currentMultiplier = MULTIPLIERS[window.currentLevel].value;
        document.getElementById('current-multiplier').textContent = `${window.currentMultiplier.toFixed(1)}×`;
    }
    
    // Mettre à jour le bouton retirer
    if (window.currentLevel >= 1 && window.gameActive) {
        document.getElementById('cashout-btn').classList.add('active');
        document.getElementById('cashout-btn').disabled = false;
        document.getElementById('cashout-multiplier').textContent = `×${window.currentMultiplier.toFixed(1)}`;
        window.cashoutAvailable = true;
    }
}