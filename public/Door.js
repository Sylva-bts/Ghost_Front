const Mise = document.getElementById('Mise');
const Mess = document.getElementById('message');
const Mess2 = document.getElementById('message2');
const portes = document.querySelectorAll('.door');

function Jouer() {
    const solde = document.getElementById('Solde');
    const soldeValue = parseFloat(solde.textContent);
    const miseValue = parseFloat(Mise.value);

    if (soldeValue >= miseValue && miseValue > 0) {
        Mess.textContent = "Vous avez placé un pari 👍";
        Mess.style.color = "green";
        alert("Vous avez entré " + miseValue + " €");

        // Déduire la mise
        const newSolde = soldeValue - miseValue;
        solde.textContent = newSolde.toFixed(2);

        Mess2.textContent = "Choisissez la bonne porte pour vous évader 🫵";
        Mess2.style.color = "green";

        // 📌 Cacher toutes les images des portes dès qu'on clique sur mise
        portes.forEach(porte => {
            const img = porte.querySelector('img');
            img.style.display = "none";
        });

        // Position du fantôme (1 à 4)
        const PosiGhost = Math.floor(Math.random() * 4) + 1;

        // Ajout du clic sur chaque porte
        portes.forEach(porte => {
            porte.onclick = () => {
                const numero = porte.getAttribute('data-door');       

                const DoorGhost = document.querySelector(`.door[data-door="${PosiGhost}"] img`);
                if (DoorGhost) { 
                    DoorGhost.src = "ima/Fa2.jpg";
                    DoorGhost.style.display = "block";
                }

                if (numero == PosiGhost.toString()) {
                    Mess2.textContent = "👻 Oups ! Le fantôme était là. Vous avez perdu.";
                    Mess2.style.color = "red";
                } else {
                    const gain = miseValue * 1.25;
                    const nouveauSolde = parseFloat(solde.textContent) + gain;
                    solde.textContent = nouveauSolde.toFixed(2);
                    Mess2.textContent = "👏 Bien joué ! Vous avez évité le fantôme.";
                    Mess2.style.color = "green";
                }

                // Bloquer tous les autres clics
                portes.forEach(p => p.onclick = null);
            };
        });

        console.log(`Le fantôme est derrière la porte ${PosiGhost}`);
    } else {
        Mess.textContent = "Votre solde est insuffisant. Veuillez effectuer un dépôt.";
        Mess.style.color = "red";
    }
}