// Variables du jeu
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const GRID_SIZE = 20;
const GRID_WIDTH = canvas.width / GRID_SIZE;
const GRID_HEIGHT = canvas.height / GRID_SIZE;

let snake = [];
let food = [];
let direction = 'right';
let nextDirection = 'right';
let gameLoop = null;
let speed = 150; // ms entre chaque mouvement

// Initialiser le jeu
function initGame() {
    // Réinitialiser le serpent
    snake = [
        { x: Math.floor(GRID_WIDTH / 2), y: Math.floor(GRID_HEIGHT / 2) },
        { x: Math.floor(GRID_WIDTH / 2) - 1, y: Math.floor(GRID_HEIGHT / 2) },
        { x: Math.floor(GRID_WIDTH / 2) - 2, y: Math.floor(GRID_HEIGHT / 2) }
    ];
    
    // Réinitialiser la direction
    direction = 'right';
    nextDirection = 'right';
    
    // Générer la première paire de nourriture
    generateFoodPair();
    
    // Lancer la boucle de jeu
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(updateGame, speed);
    
    // Dessiner le jeu initial
    drawGame();
}

// Générer une paire de nourriture
function generateFoodPair() {
    food = [];
    
    // Générer deux positions aléatoires non occupées par le serpent
    for (let i = 0; i < 2; i++) {
        let newFood;
        let attempts = 0;
        
        do {
            newFood = {
                x: Math.floor(Math.random() * GRID_WIDTH),
                y: Math.floor(Math.random() * GRID_HEIGHT),
                isGood: false
            };
            attempts++;
        } while (isPositionOccupied(newFood.x, newFood.y) && attempts < 100);
        
        food.push(newFood);
    }
    
    // Choisir aléatoirement quelle nourriture est bonne
    const goodFoodIndex = Math.random() < getLevelProbability(window.currentLevel) ? 0 : 1;
    food[goodFoodIndex].isGood = true;
    
    // Animer l'apparition de la nourriture
    animateFoodAppearance();
}

// Vérifier si une position est occupée
function isPositionOccupied(x, y) {
    // Vérifier le serpent
    for (const segment of snake) {
        if (segment.x === x && segment.y === y) {
            return true;
        }
    }
    
    // Vérifier les autres nourritures
    for (const f of food) {
        if (f.x === x && f.y === y) {
            return true;
        }
    }
    
    return false;
}

// Obtenir la probabilité selon le niveau
function getLevelProbability(level) {
    const probabilities = {
        0: 0.70, // Niveau 1 (×2)
        1: 0.55, // Niveau 2 (×3.5)
        2: 0.40, // Niveau 3 (×5.1)
        3: 0.25, // Niveau 4 (×8.5)
        4: 0.15, // Niveau 5 (×13)
        5: 0.08  // Niveau 6 (×19)
    };
    return probabilities[level] || 0.08;
}

// Mettre à jour le jeu
function updateGame() {
    if (!window.gameActive || window.gamePaused) return;
    
    // Mettre à jour la direction
    direction = nextDirection;
    
    // Calculer la nouvelle tête du serpent
    const head = { ...snake[0] };
    
    switch(direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }
    
    // Vérifier les collisions avec les bords (téléportation)
    if (head.x < 0) head.x = GRID_WIDTH - 1;
    if (head.x >= GRID_WIDTH) head.x = 0;
    if (head.y < 0) head.y = GRID_HEIGHT - 1;
    if (head.y >= GRID_HEIGHT) head.y = 0;
    
    // Vérifier les collisions avec le serpent lui-même
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            // Collision avec soi-même - traiter comme une mauvaise nourriture
            handleBadFood();
            return;
        }
    }
    
    // Ajouter la nouvelle tête
    snake.unshift(head);
    
    // Vérifier les collisions avec la nourriture
    let foodEaten = false;
    let foodIndex = -1;
    
    for (let i = 0; i < food.length; i++) {
        if (head.x === food[i].x && head.y === food[i].y) {
            foodEaten = true;
            foodIndex = i;
            break;
        }
    }
    
    if (foodEaten) {
        // Jouer le son de manger
        document.getElementById('eat-sound').currentTime = 0;
        document.getElementById('eat-sound').play().catch(e => console.log("Son désactivé"));
        
        if (food[foodIndex].isGood) {
            handleGoodFood();
        } else {
            handleBadFood();
        }
    } else {
        // Si aucune nourriture mangée, retirer la queue
        snake.pop();
    }
    
    // Mettre à jour l'affichage
    drawGame();
}

// Gérer la bonne nourriture
function handleGoodFood() {
    window.currentLevel++;
    const multiplier = MULTIPLIERS[window.currentLevel];
    
    // Mettre à jour l'affichage
    document.getElementById('current-multiplier').textContent = `${multiplier.value.toFixed(1)}×`;
    document.getElementById('current-level').textContent = window.currentLevel + 1;
    
    // Mettre à jour la progression des niveaux
    updateLevelIndicators();
    
    // Activer le bouton retirer si nécessaire
    if (window.currentLevel >= 1 && !window.cashoutAvailable) {
        window.cashoutAvailable = true;
        document.getElementById('cashout-btn').classList.add('active');
        document.getElementById('cashout-btn').disabled = false;
    }
    
    // Mettre à jour le gain potentiel
    updatePotentialWin();
    
    // Vérifier si c'est le niveau final
    if (multiplier.isFinal) {
        winGame();
        return;
    }
    
    // Générer une nouvelle paire de nourriture
    setTimeout(() => {
        generateFoodPair();
        drawGame();
    }, 300);
}

// Gérer la mauvaise nourriture
function handleBadFood() {
    // Jouer le son de crash
    document.getElementById('crash-sound').currentTime = 0;
    document.getElementById('crash-sound').play().catch(e => console.log("Son désactivé"));
    
    loseGame();
}

// Changer la direction du serpent
function changeDirection(newDirection) {
    // Empêcher les virages à 180°
    if (
        (newDirection === 'up' && direction !== 'down') ||
        (newDirection === 'down' && direction !== 'up') ||
        (newDirection === 'left' && direction !== 'right') ||
        (newDirection === 'right' && direction !== 'left')
    ) {
        nextDirection = newDirection;
    }
}

// Mettre en pause/reprendre le jeu
function togglePause() {
    if (!window.gameActive) return;
    
    window.gamePaused = !window.gamePaused;
    
    if (window.gamePaused) {
        clearInterval(gameLoop);
        showGameOverlay('Jeu en Pause', 'Appuyez sur ESPACE pour continuer', 'CONTINUER');
    } else {
        gameLoop = setInterval(updateGame, speed);
        hideGameOverlay();
    }
}

// Dessiner le jeu
function drawGame() {
    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dessiner la grille
    drawGrid();
    
    // Dessiner le serpent
    drawSnake();
    
    // Dessiner la nourriture
    drawFood();
    
    // Dessiner les effets
    drawEffects();
}

// Dessiner la grille
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    // Lignes verticales
    for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Lignes horizontales
    for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Dessiner le serpent
function drawSnake() {
    // Dessiner chaque segment du serpent
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        
        // Effet de gradient pour le serpent
        const gradient = ctx.createLinearGradient(
            segment.x * GRID_SIZE,
            segment.y * GRID_SIZE,
            (segment.x + 1) * GRID_SIZE,
            (segment.y + 1) * GRID_SIZE
        );
        
        if (i === 0) { // Tête
            gradient.addColorStop(0, '#00d4aa');
            gradient.addColorStop(1, '#00b894');
        } else { // Corps
            const alpha = 1 - (i / snake.length) * 0.7;
            gradient.addColorStop(0, `rgba(0, 212, 170, ${alpha})`);
            gradient.addColorStop(1, `rgba(0, 184, 148, ${alpha})`);
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
            segment.x * GRID_SIZE + 1,
            segment.y * GRID_SIZE + 1,
            GRID_SIZE - 2,
            GRID_SIZE - 2
        );
        
        // Contour du segment
        ctx.strokeStyle = i === 0 ? '#ffffff' : 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = i === 0 ? 2 : 1;
        ctx.strokeRect(
            segment.x * GRID_SIZE + 1,
            segment.y * GRID_SIZE + 1,
            GRID_SIZE - 2,
            GRID_SIZE - 2
        );
        
        // Yeux sur la tête
        if (i === 0) {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            
            // Position des yeux selon la direction
            let eye1X, eye1Y, eye2X, eye2Y;
            switch(direction) {
                case 'right':
                    eye1X = (segment.x + 0.7) * GRID_SIZE;
                    eye1Y = (segment.y + 0.3) * GRID_SIZE;
                    eye2X = (segment.x + 0.7) * GRID_SIZE;
                    eye2Y = (segment.y + 0.7) * GRID_SIZE;
                    break;
                case 'left':
                    eye1X = (segment.x + 0.3) * GRID_SIZE;
                    eye1Y = (segment.y + 0.3) * GRID_SIZE;
                    eye2X = (segment.x + 0.3) * GRID_SIZE;
                    eye2Y = (segment.y + 0.7) * GRID_SIZE;
                    break;
                case 'up':
                    eye1X = (segment.x + 0.3) * GRID_SIZE;
                    eye1Y = (segment.y + 0.3) * GRID_SIZE;
                    eye2X = (segment.x + 0.7) * GRID_SIZE;
                    eye2Y = (segment.y + 0.3) * GRID_SIZE;
                    break;
                case 'down':
                    eye1X = (segment.x + 0.3) * GRID_SIZE;
                    eye1Y = (segment.y + 0.7) * GRID_SIZE;
                    eye2X = (segment.x + 0.7) * GRID_SIZE;
                    eye2Y = (segment.y + 0.7) * GRID_SIZE;
                    break;
            }
            
            // Dessiner les yeux
            ctx.arc(eye1X, eye1Y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(eye2X, eye2Y, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Pupilles
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(eye1X, eye1Y, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(eye2X, eye2Y, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Dessiner la nourriture
function drawFood() {
    for (const f of food) {
        // Animation de pulsation
        const pulse = Math.sin(Date.now() / 300) * 2 + 3;
        const size = GRID_SIZE - 4 - pulse;
        const x = f.x * GRID_SIZE + 2 + pulse/2;
        const y = f.y * GRID_SIZE + 2 + pulse/2;
        
        // Créer un gradient radial
        const gradient = ctx.createRadialGradient(
            x + size/2, y + size/2, 0,
            x + size/2, y + size/2, size
        );
        
        if (f.isGood) {
            gradient.addColorStop(0, '#4ecdc4');
            gradient.addColorStop(0.7, '#00b894');
            gradient.addColorStop(1, '#00d4aa');
        } else {
             gradient.addColorStop(0, '#4ecdc4');
            gradient.addColorStop(0.7, '#00b894');
            gradient.addColorStop(1, '#00d4aa');
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Effet de brillance
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(x + size/3, y + size/3, size/6, 0, Math.PI * 2);
        ctx.fill();
        
        // Icône dans la nourriture
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(f.isGood ? '✓' : '✓', x + size/2, y + size/2);
    }
}

// Dessiner les effets
function drawEffects() {
    // Afficher le multiplicateur actuel sur le canvas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.font = 'bold 24px Orbitron';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`${window.currentMultiplier.toFixed(1)}×`, canvas.width - 20, 20);
}

// Animer l'apparition de la nourriture
function animateFoodAppearance() {
    // Cette fonction pourrait être étendue pour des animations plus complexes
    console.log('Nouvelle nourriture générée !');
}

// Démarrer le jeu
function startGame(betAmount) {
    window.gameActive = true;
    window.currentBet = betAmount;
    window.currentLevel = 0;
    window.currentMultiplier = 1;
    window.startTime = Date.now();
    
    // Mettre à jour l'UI
    document.getElementById('current-multiplier').textContent = '1.0×';
    document.getElementById('current-level').textContent = '1';
    document.getElementById('game-timer').textContent = '00:00';
    document.getElementById('cashout-btn').classList.remove('active');
    document.getElementById('cashout-btn').disabled = true;
    window.cashoutAvailable = false;
    
    // Mettre à jour les niveaux
    updateLevelIndicators();
    
    // Cacher l'overlay
    hideGameOverlay();
    
    // Démarrer le timer
    if (window.gameTimer) clearInterval(window.gameTimer);
    window.gameTimer = setInterval(updateTimer, 1000);
    
    // Initialiser le jeu
    initGame();
    
    // Montrer une notification
    showNotification(`Jeu démarré avec une mise de $${betAmount}`, 'success');
}

// Mettre à jour le timer
function updateTimer() {
    if (!window.startTime) return;
    
    const elapsed = Math.floor((Date.now() - window.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    
    document.getElementById('game-timer').textContent = `${minutes}:${seconds}`;
}

// Terminer le jeu avec victoire
function winGame() {
    if (!window.gameActive) return;
    
    window.gameActive = false;
    clearInterval(gameLoop);
    clearInterval(window.gameTimer);
    
    const winnings = window.currentBet * 19;
    
    // Jouer le son de victoire
    document.getElementById('cashout-sound').currentTime = 0;
    document.getElementById('cashout-sound').play().catch(e => console.log("Son désactivé"));
    
    // Sauvegarder le résultat
    saveGameResult('won', winnings);
    
    // Afficher l'overlay de victoire
    showGameOverlay(
        '🎉 JACKPOT ! 🎉',
        `Vous avez atteint le multiplicateur ×19 et gagné $${winnings.toFixed(2)} !`,
        'NOUVELLE PARTIE'
    );
    
    // Mettre à jour les statistiques
    updatePlayerStats();
    
    // Animation de confettis (simplifiée)
    createConfetti();
}

// Terminer le jeu avec défaite
function loseGame() {
    if (!window.gameActive) return;
    
    window.gameActive = false;
    clearInterval(gameLoop);
    clearInterval(window.gameTimer);
    
    // Sauvegarder le résultat
    saveGameResult('lost', 0);
    
    // Afficher l'overlay de défaite
    showGameOverlay(
        '💥 PERDU !',
        `Vous avez touché la mauvaise nourriture et perdu $${window.currentBet.toFixed(2)}`,
        'REESSAYER'
    );
    
    // Mettre à jour les statistiques
    updatePlayerStats();
}

// Retirer les gains
function cashOut() {
    if (!window.gameActive || !window.cashoutAvailable) return;
    
    window.gameActive = false;
    clearInterval(gameLoop);
    clearInterval(window.gameTimer);
    
    const winnings = window.currentBet * window.currentMultiplier;
    
    // Jouer le son de retrait
    document.getElementById('cashout-sound').currentTime = 0;
    document.getElementById('cashout-sound').play().catch(e => console.log("Son désactivé"));
    
    // Sauvegarder le résultat
    saveGameResult('cashed', winnings);
    
    // Afficher l'overlay de retrait
    showGameOverlay(
        '💰 RETRAIT !',
        `Vous avez retiré $${winnings.toFixed(2)} au multiplicateur ×${window.currentMultiplier.toFixed(1)}`,
        'NOUVELLE PARTIE'
    );
    
    // Mettre à jour les statistiques
    updatePlayerStats();
}

// Afficher l'overlay du jeu
function showGameOverlay(title, message, buttonText) {
    const overlay = document.getElementById('game-overlay');
    const overlayTitle = document.getElementById('overlay-title');
    const overlayMessage = document.getElementById('overlay-message');
    const overlayButton = document.getElementById('overlay-button');
    
    overlayTitle.textContent = title;
    overlayMessage.textContent = message;
    overlayButton.textContent = buttonText;
    
    overlay.style.display = 'flex';
    
    // Réassigner l'événement du bouton
    overlayButton.onclick = () => {
        hideGameOverlay();
        if (buttonText === 'NOUVELLE PARTIE' || buttonText === 'REESSAYER') {
            document.getElementById('play-btn').click();
        }
    };
}

// Cacher l'overlay du jeu
function hideGameOverlay() {
    document.getElementById('game-overlay').style.display = 'none';
}

// Créer un effet de confettis (simplifié)
function createConfetti() {
    const canvas = document.getElementById('game-canvas');
    const confettiCount = 100;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            background: hsl(${Math.random() * 360}, 100%, 50%);
            top: ${canvas.offsetTop}px;
            left: ${canvas.offsetLeft + Math.random() * canvas.width}px;
            border-radius: 2px;
            transform: rotate(${Math.random() * 360}deg);
            pointer-events: none;
            z-index: 1000;
        `;
        
        document.body.appendChild(confetti);
        
        // Animation
        const animation = confetti.animate([
            { 
                transform: `translateY(0px) rotate(0deg)`,
                opacity: 1 
            },
            { 
                transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 720}deg)`,
                opacity: 0 
            }
        ], {
            duration: 2000 + Math.random() * 2000,
            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
        });
        
        animation.onfinish = () => confetti.remove();
    }
}