const API_BASE_URL =
  "https://api-voyage-adam-ajdthba4evb9gqgb.francecentral-01.azurewebsites.net";

const searchInput = document.getElementById("searchInput");
const cardsContainer = document.getElementById("cardsContainer");
const contactForm = document.querySelector(".contact-form");

let destinationsData = [];

// 🔥 FETCH DES DONNÉES
async function fetchDestinations() {
  try {
    const res = await fetch(`${API_BASE_URL}/destinations`);
    const data = await res.json();

    destinationsData = data;
    displayDestinations(data);
  } catch (error) {
    console.error("Erreur API :", error);
    cardsContainer.innerHTML =
      "<p>Erreur lors du chargement des destinations.</p>";
  }
}

// 🔥 AFFICHAGE DES CARTES
function displayDestinations(destinations) {
  cardsContainer.innerHTML = "";

  destinations.forEach((dest) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.name = dest.name;

    card.innerHTML = `
      <img src="${dest.image_url}" alt="${dest.name}">
      <div class="card-content">
        <h3>${dest.name}</h3>
        <p>${dest.description}</p>
        <span class="price">À partir de ${dest.price}€</span>
      </div>
    `;

    cardsContainer.appendChild(card);
  });
}

// 🔎 RECHERCHE
searchInput.addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();

  const filtered = destinationsData.filter((dest) =>
    dest.name.toLowerCase().includes(value),
  );

  displayDestinations(filtered);
});

// 📩 FORMULAIRE
contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Message envoyé avec succès !");
  contactForm.reset();
});

// 🚀 INIT
fetchDestinations();
