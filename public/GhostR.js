let Img = document.querySelector('.img');
let soldeSpan = document.querySelector('#Solde span');
let coteSpan = document.querySelector('#cote span');

let Stick = document.getElementById('stick0');
let Stick1 = document.getElementById('stick1');
let Ghost = document.getElementById('Ghost');
let miseEl = document.getElementById('Mise');

let coteIni = 1.0;
let vitesse = 1000;
let vitesseMin = 80;
let acceleration = 25;
let jeuEnCours = false;

let pouuf; // sera tiré aléatoirement dans GameOn()
let mise = 0;
let gameInterval;
let ghostPos = 0;

Ghost.style.display = "none";
Stick.style.display = "none";
Stick1.style.display = "block";

function Miser() {
  mise = Number(miseEl.value);
  let solde = Number(soldeSpan.textContent);

  if (mise < 2) {
    alert("Trop petit ! 🤷");
  } else if (mise > solde) {
    alert("Solde insuffisant 💰❓");
  } else {
    let newBalance = solde - mise;
    soldeSpan.textContent = newBalance.toFixed(2);
    GameOn();
  }
}

function GameOn() {
  alert("Tu as misé !!");

  coteIni = 1.0;
  vitesse = 1000;
  jeuEnCours = true;

  pouuf = tirerCote(); // génère la cote perdante selon probabilité
  console.log("Perd à la cote : ×" + pouuf.toFixed(2));

  updateCote(coteIni);
  start();            // démarre animation Ghost vs Stickman
  augmenterCote();    // démarre la montée de cote
}

function start() {
  Stick.style.display = "block";
  Ghost.style.display = "block";
  Stick1.style.display = "none";

  ghostPos = 0;
  Ghost.style.position = "absolute";
  Ghost.style.right = ghostPos + "px";

  gameInterval = setInterval(() => {
    ghostPos += 0.01;
    Ghost.style.right = ghostPos + "px";

    if (coteIni >= pouuf) {
      clearInterval(gameInterval);
      ghostPos = 10;
      Ghost.style.right = ghostPos + "px";      
      alert("💀 Ghost a rattrapé le Stickman à ×" + coteIni.toFixed(2));
      jeuEnCours = false;
      Ghost.style.display = "none";
      Stick.style.display = "none";
      Stick1.style.display = "block";
    }
    animeBack();
  }, 10);
}

function augmenterCote() {
  if (!jeuEnCours) return;

  coteIni += 0.01;
  updateCote(coteIni);

  if (coteIni >= pouuf) {
    jeuEnCours = false;
    return;
  }

  vitesse = Math.max(vitesseMin, vitesse - acceleration);
  setTimeout(augmenterCote, vitesse);
}

function updateCote(valeur) {
  coteSpan.textContent = valeur.toFixed(2);
}

function retrait() {
  if (!jeuEnCours) return;

  jeuEnCours = false;
  clearInterval(gameInterval);
  Ghost.style.display = "none";
  Stick.style.display = "none";
  Stick1.style.display = "block";

  alert("Tu as sauté à ×" + coteIni.toFixed(2));

  let gain = mise * coteIni;
  let solde = Number(soldeSpan.textContent);
  solde += gain;
  soldeSpan.textContent = solde.toFixed(2);
}

function tirerCote() {
  const rand = Math.random() * 100;

  if (rand < 50) {
    return (Math.random() * 1) + 1; // [1.0, 2.0]
  } else if (rand < 80) {
    return (Math.random() * 2) + 2; // [2.0, 4.0]
  } else if (rand < 90) {
    return (Math.random() * 6) + 4; // [4.0, 10.0]
  } else {
    return (Math.random() * 20) + 10; // [10.0, 30.0]
  }
}

function animeBack() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes MoveEcran {
      from {
        background-position: 0 0;
      }
      to {
        background-position: 40px 40px;
      }
    }
    
    .img {
      animation: MoveEcran 0.5s linear infinite;
    }
  `;
  document.head.appendChild(style);
}
