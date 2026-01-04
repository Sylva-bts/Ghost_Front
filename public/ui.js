// Initialiser l'interface utilisateur
function initializeUI() {
    // Initialiser les multiplicateurs
    initializeMultipliers();
    
    // Initialiser les statistiques du joueur
    updatePlayerStats();
    
    // Mettre à jour le gain potentiel initial
    updatePotentialWin();
    
    // Ajouter le CSS pour les notifications
    addNotificationStyles();
}

// Mettre à jour les statistiques du joueur
function updatePlayerStats() {
    const stats = JSON.parse(localStorage.getItem(PLAYER_STATS_KEY)) || {
        totalGames: 0,
        totalWins: 0,
        totalLosses: 0,
        totalCashouts: 0,
        totalWon: 0,
        totalBet: 0,
        bestWin: 0,
        maxLevel: 0
    };
    
    // Calculer le taux de victoire
    const winRate = stats.totalGames > 0 ? 
        Math.round(((stats.totalWins + stats.totalCashouts) / stats.totalGames) * 100) : 0;
    
    // Mettre à jour l'interface
    document.getElementById('best-win').textContent = `$${stats.bestWin.toFixed(2)}`;
    document.getElementById('win-rate').textContent = `${winRate}%`;
    document.getElementById('max-level').textContent = stats.maxLevel > 0 ? stats.maxLevel : '-';
}

// Ajouter les styles pour les notifications
function addNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification.success {
            background: linear-gradient(135deg, rgba(78, 205, 196, 0.9), rgba(0, 184, 148, 0.9));
            border-left: 4px solid #4ecdc4;
        }
        
        .notification.error {
            background: linear-gradient(135deg, rgba(255, 107, 107, 0.9), rgba(255, 71, 87, 0.9));
            border-left: 4px solid #ff6b6b;
        }
        
        .notification.info {
            background: linear-gradient(135deg, rgba(17, 138, 178, 0.9), rgba(9, 109, 140, 0.9));
            border-left: 4px solid #118ab2;
        }
    `;
    document.head.appendChild(style);
}

// Animation pour l'apparition de la nourriture (fonction supplémentaire)
function animateFoodAppearance() {
    const foodElements = document.querySelectorAll('.food-type');
    
    foodElements.forEach(food => {
        food.style.animation = 'none';
        setTimeout(() => {
            food.style.animation = 'pulse 0.5s ease';
        }, 10);
    });
}