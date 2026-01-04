// Clé pour le localStorage
const STORAGE_KEY = 'snake_fortune_history';
const PLAYER_STATS_KEY = 'snake_fortune_stats';

// Sauvegarder un résultat de partie
function saveGameResult(status, winnings) {
    // Charger l'historique existant
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    // Créer l'objet résultat
    const result = {
        id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        bet: window.currentBet,
        multiplier: window.currentMultiplier,
        winnings: winnings,
        status: status,
        duration: Math.floor((Date.now() - window.startTime) / 1000),
        levelReached: window.currentLevel + 1
    };
    
    // Ajouter au début de l'historique
    history.unshift(result);
    
    // Limiter à 50 parties maximum
    if (history.length > 50) {
        history.pop();
    }
    
    // Sauvegarder
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    
    // Mettre à jour les statistiques du joueur
    updatePlayerStatistics(result);
    
    // Mettre à jour la bankroll
    updateBankroll(winnings, status === 'lost' ? 0 : window.currentBet);
    
    // Recharger l'historique
    loadHistory();
}

// Mettre à jour les statistiques du joueur
function updatePlayerStatistics(result) {
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
    
    // Mettre à jour les compteurs
    stats.totalGames++;
    stats.totalBet += result.bet;
    
    if (result.status === 'won') {
        stats.totalWins++;
        stats.totalWon += result.winnings;
    } else if (result.status === 'lost') {
        stats.totalLosses++;
    } else if (result.status === 'cashed') {
        stats.totalCashouts++;
        stats.totalWon += result.winnings;
    }
    
    // Mettre à jour le meilleur gain
    if (result.winnings > stats.bestWin) {
        stats.bestWin = result.winnings;
    }
    
    // Mettre à jour le niveau maximum atteint
    if (result.levelReached > stats.maxLevel) {
        stats.maxLevel = result.levelReached;
    }
    
    // Sauvegarder
    localStorage.setItem(PLAYER_STATS_KEY, JSON.stringify(stats));
}

// Mettre à jour la bankroll
function updateBankroll(winnings, bet) {
    let bankroll = parseFloat(localStorage.getItem('bankroll')) || 1000;
    
    if (winnings > 0) {
        bankroll += winnings;
    } else {
        bankroll -= bet;
    }
    
    localStorage.setItem('bankroll', bankroll.toFixed(2));
    document.getElementById('bankroll').textContent = bankroll.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Charger l'historique
function loadHistory() {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const historyList = document.getElementById('history-list');
    
    // Vider la liste
    historyList.innerHTML = '';
    
    // Afficher chaque partie
    history.forEach(game => {
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${game.status}`;
        
        const date = new Date(game.date);
        const formattedDate = date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const winClass = game.winnings > 0 ? 'positive' : 'negative';
        const winText = game.winnings > 0 ? `+$${game.winnings.toFixed(2)}` : `-$${game.bet.toFixed(2)}`;
        
        historyItem.innerHTML = `
            <div class="history-date">${formattedDate}</div>
            <div class="history-details">
                <div class="history-bet">$${game.bet.toFixed(2)}</div>
                <div class="history-multiplier">${game.multiplier.toFixed(1)}×</div>
                <div class="history-win ${winClass}">${winText}</div>
            </div>
        `;
        
        historyList.appendChild(historyItem);
    });
    
    // Mettre à jour le compteur de parties
    document.getElementById('total-games').textContent = history.length;
}

// Effacer l'historique
function clearHistory() {
    if (confirm('Êtes-vous sûr de vouloir effacer tout l\'historique ?')) {
        localStorage.removeItem(STORAGE_KEY);
        loadHistory();
        showNotification('Historique effacé', 'success');
    }
}

// Initialiser le stockage
function initializeStorage() {
    // Initialiser la bankroll si elle n'existe pas
    if (!localStorage.getItem('bankroll')) {
        localStorage.setItem('bankroll', '1000.00');
    }
    
    // Mettre à jour l'affichage de la bankroll
    const bankroll = parseFloat(localStorage.getItem('bankroll'));
    document.getElementById('bankroll').textContent = bankroll.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    // Charger l'historique
    loadHistory();
}