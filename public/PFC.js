// Récupération des éléments
const rockBtn = document.getElementById("rock");
const paperBtn = document.getElementById("paper");
const scissorsBtn = document.getElementById("scissors");
const historyList = document.getElementById("historyList");


const soldeSpan = document.getElementById("solde");
const miseInput = document.getElementById("mise");
const result = document.getElementById("result");
const ghostImg = document.getElementById("ghostImg");
const ghostG = document.getElementById("ghost_game");

let miseValidee = 0;
let jeuActif = false;

// Validation de la mise
function mise() {
    const solde = parseInt(soldeSpan.innerText);
    const valeurMise = parseInt(miseInput.value);

    // Reset previous error styling
    miseInput.style.borderColor = "rgb(209, 174, 246)";

    if (isNaN(valeurMise) || valeurMise <= 0) {
        result.innerHTML = "❌ Entrez une mise valide (minimum 1€)";
        miseInput.style.borderColor = "#ef4444";
        miseInput.focus();
        return;
    }

    if (valeurMise > solde) {
        result.innerHTML = `❌ Mise supérieure au solde (max ${solde}€)`;
        miseInput.style.borderColor = "#ef4444";
        miseInput.focus();
        return;
    }

    miseValidee = valeurMise;
    jeuActif = true;
    result.innerHTML = "🎰 Mise validée... Faites votre choix";
    miseInput.style.borderColor = "#22c55e"; // Green for success
}

// Événements
rockBtn.addEventListener("click", () => jouer("pierre"));
paperBtn.addEventListener("click", () => jouer("papier"));
scissorsBtn.addEventListener("click", () => jouer("ciseaux"));

function jouer(choixJoueur) {
    if (!jeuActif) {
        result.innerHTML = "⚠️ Validez d'abord votre mise";
        return;
    }

    jeuActif = false;
    let solde = parseInt(soldeSpan.innerText);
    const choix = ["pierre", "papier", "ciseaux"];
    const choixOrdi = choix[Math.floor(Math.random() * 3)];

    // Suspense 👻
    result.innerHTML = "👻 Le ghost réfléchit...";
    ghostImg.style.opacity = 0;
    ghostG.style.opacity = 0;

    setTimeout(() => {

        // Affichage du choix du ghost
        ghostG.src = `ima/${choixOrdi === "papier" ? "feuille" : choixOrdi}.png`;
        ghostG.style.opacity = 1;

        if (choixJoueur === choixOrdi) {
            result.innerHTML = "🤝 Égalité !";
            ghostImg.src = "ima/equaG.png";

        } else if (
            (choixJoueur === "pierre" && choixOrdi === "ciseaux") ||
            (choixJoueur === "papier" && choixOrdi === "pierre") ||
            (choixJoueur === "ciseaux" && choixOrdi === "papier")
        ) {
            result.innerHTML = "🎉 Victoire ! Le ghost recule";
            ghostImg.src = "ima/loseG.png";
            solde += Math.floor(miseValidee * 1.4);

        } else {
            result.innerHTML = "😈 Défaite ! Le ghost vous a eu";
            ghostImg.src = "ima/frimeG.png";
            solde -= miseValidee;
        }

        ghostImg.style.opacity = 1;
        soldeSpan.innerText = Math.max(0, solde);
        miseInput.value = "";

        // Ajouter à l'historique
        let gain = 0;
        if (result.innerHTML.includes("Victoire")) {
            gain = Math.floor(miseValidee * 1.4);
        } else if (result.innerHTML.includes("Défaite")) {
            gain = -miseValidee;
        }
        ajouterHistorique(choixJoueur, choixOrdi, result.innerHTML, gain);

    }, 1200); // temps de suspense
}

function ajouterHistorique(choixJoueur, choixOrdi, resultat, gain) {
    const li = document.createElement("li");

    li.innerHTML = `
        <span>🧍 ${choixJoueur}</span>
        <span>👻 ${choixOrdi}</span>
        <span>${resultat}</span>
        <span>${gain} €</span>
    `;

    // Couleur selon résultat
    if (resultat.includes("Victoire")) li.classList.add("win");
    else if (resultat.includes("Défaite")) li.classList.add("lose");
    else li.classList.add("draw");

    historyList.prepend(li);

    // Limite à 10 parties
    if (historyList.children.length > 10) {
        historyList.removeChild(historyList.lastChild);
    }
}

