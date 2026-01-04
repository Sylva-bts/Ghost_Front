// Fichier principal qui initialise le jeu
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 The Snake of Fortune - Chargement...');
    
    // Initialiser les modules
    initializeGame();
    initializeUI();
    initializeStorage();
    loadHistory();
    
    // Mettre à jour les statistiques du joueur
    updatePlayerStats();
    
    console.log('✅ Jeu prêt à jouer !');
});

// Initialisation des écouteurs d'événements globaux
function initializeGame() {
    // Écouteur pour le bouton Jouer
    document.getElementById('play-btn').addEventListener('click', () => {
        const betInput = document.getElementById('bet-input');
        const betAmount = parseFloat(betInput.value);
        
        if (betAmount < 10 || betAmount > 1000) {
            showNotification('La mise doit être entre $10 et $1000', 'error');
            return;
        }
        
        if (betAmount > parseFloat(document.getElementById('bankroll').textContent.replace(/,/g, ''))) {
            showNotification('Fonds insuffisants', 'error');
            return;
        }
        
        startGame(betAmount);
    });
    
    // Écouteur pour le bouton Retirer
    document.getElementById('cashout-btn').addEventListener('click', cashOut);
    
    // Écouteurs pour les mises rapides
    document.querySelectorAll('.quick-bet').forEach(button => {
        button.addEventListener('click', (e) => {
            const amount = parseFloat(e.target.dataset.amount);
            document.getElementById('bet-input').value = amount;
            updatePotentialWin();
        });
    });
    
    // Écouteur pour l'input de mise
    document.getElementById('bet-input').addEventListener('input', updatePotentialWin);
    
    // Écouteur pour effacer l'historique
    document.getElementById('clear-history').addEventListener('click', clearHistory);
    
    // Écouteur pour le bouton de l'overlay
    document.getElementById('overlay-button').addEventListener('click', () => {
        const betInput = document.getElementById('bet-input');
        const betAmount = parseFloat(betInput.value);
        
        if (betAmount >= 10) {
            startGame(betAmount);
        } else {
            document.getElementById('overlay-title').textContent = 'Mise minimale : $10';
            document.getElementById('overlay-message').textContent = 'Augmentez votre mise pour jouer';
        }
    });
    
    // Écouteurs pour les touches du clavier
    document.addEventListener('keydown', handleKeyPress);
}

// Mettre à jour le gain potentiel en temps réel
function updatePotentialWin() {
    const betAmount = parseFloat(document.getElementById('bet-input').value) || 0;
    const currentMultiplier = parseFloat(document.getElementById('current-multiplier').textContent.replace('×', '')) || 1;
    
    const potentialWin = betAmount * currentMultiplier;
    document.getElementById('potential-win').textContent = `$${potentialWin.toFixed(2)}`;
}

// Afficher une notification
function showNotification(message, type = 'info') {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Ajouter au DOM
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Gestion des touches du clavier
function handleKeyPress(e) {
    if (!window.gameActive) return;
    
    switch(e.key) {
        case 'ArrowUp':
            changeDirection('up');
            break;
        case 'ArrowDown':
            changeDirection('down');
            break;
        case 'ArrowLeft':
            changeDirection('left');
            break;
        case 'ArrowRight':
            changeDirection('right');
            break;
        case ' ':
            togglePause();
            break;
        case 'Escape':
            if (window.cashoutAvailable) cashOut();
            break;
    }
}

// Variables globales du jeu
window.gameActive = false;
window.gamePaused = false;
window.cashoutAvailable = false;
window.currentLevel = 0;
window.currentMultiplier = 1;
window.currentBet = 0;
window.gameTimer = null;
window.startTime = null;