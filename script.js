const API_URL =
  "https://api-voyage-adam-ajdthba4evb9gqgb.francecentral-01.azurewebsites.net";
const CORS_PROXY = "https://api.allorigins.win/raw?url=";

let allDestinations = [];
let filteredDestinations = [];
let isLoading = false;

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  const cardsContainer = document.getElementById("cardsContainer");
  const loadingDiv = document.getElementById("loadingDestinations");
  const detailsModal = document.getElementById("detailsModal");
  const closeBtn = document.querySelector(".close");
  const modalBody = document.getElementById("modalBody");
  const contactForm = document.querySelector(".contact-form");

  async function loadDestinations() {
    if (isLoading) {
      console.log("Déjà en cours de chargement, abandon...");
      return;
    }

    try {
      isLoading = true;
      console.log("🔄 Chargement depuis:", API_URL + "/destinations");
      loadingDiv.style.display = "block";

      let response = await fetch(API_URL + "/destinations", {
        headers: { Accept: "application/json" },
      }).catch((err) => {
        console.log("⚠️ Erreur directe:", err.message);
        console.log("↪️ Essai avec proxy...");
        return fetch(
          CORS_PROXY + encodeURIComponent(API_URL + "/destinations"),
        );
      });

      console.log("📊 Response status:", response.status, response.statusText);

      if (!response.ok) {
        throw new Error("HTTP " + response.status + " " + response.statusText);
      }

      const text = await response.text();
      console.log(
        "📥 Réponse brute (premiers 500 chars):",
        text.substring(0, 500),
      );

      allDestinations = JSON.parse(text);
      console.log(
        "✅ JSON parsé, type:",
        Array.isArray(allDestinations) ? "Array" : "Object",
      );

      if (!Array.isArray(allDestinations)) {
        console.log("🔄 Conversion objet en tableau...");
        allDestinations = Object.values(allDestinations);
      }

      console.log("✅ Destinations chargées:", allDestinations.length, "items");
      filteredDestinations = allDestinations;
      renderDestinations();
      loadingDiv.style.display = "none";
    } catch (error) {
      console.error("❌ Erreur complète:", error);
      loadingDiv.innerHTML =
        '<p style="color: red;">❌ Erreur: ' + error.message + "</p>";
    } finally {
      isLoading = false;
    }
  }

  function renderDestinations() {
    cardsContainer.innerHTML = "";

    if (filteredDestinations.length === 0) {
      cardsContainer.innerHTML = "<p>Aucune destination trouvée.</p>";
      return;
    }

    filteredDestinations.forEach((destination) => {
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.id = destination.id;
      card.dataset.name = destination.name;

      const imageUrl =
        destination.image_url || getDefaultImage(destination.name);

      card.innerHTML =
        '<img src="' +
        imageUrl +
        '" alt="' +
        destination.name +
        '" />' +
        '<div class="card-content">' +
        "<h3>" +
        destination.name +
        "</h3>" +
        "<p>" +
        (destination.description || "Découvrez cette destination.") +
        "</p>" +
        '<span class="price">' +
        (destination.price
          ? "À partir de " + destination.price + "€"
          : "Prix sur demande") +
        "</span></div>";

      card.addEventListener("click", () =>
        showDestinationDetails(destination.id),
      );
      cardsContainer.appendChild(card);
    });
  }

  function getDefaultImage(destinationName) {
    const images = {
      Bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
      Tokyo:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
      Rome: "https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=1200&q=80",
      "New York":
        "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1200&q=80",
      Paris:
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
      Santorin:
        "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
      Marrakech:
        "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=1200&q=80",
    };
    return (
      images[destinationName] ||
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
    );
  }

  async function showDestinationDetails(destinationId) {
    try {
      console.log("Détails ID:", destinationId);
      const response = await fetch(
        CORS_PROXY +
          encodeURIComponent(API_URL + "/destinations/" + destinationId),
      );

      if (!response.ok) throw new Error("HTTP " + response.status);

      const destination = await response.json();
      const imageUrl =
        destination.image_url || getDefaultImage(destination.name);

      modalBody.innerHTML =
        '<img src="' +
        imageUrl +
        '" alt="' +
        destination.name +
        '" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;" />' +
        "<h2>" +
        destination.name +
        "</h2>" +
        "<p><strong>Description:</strong> " +
        (destination.description || "N/A") +
        "</p>" +
        "<p><strong>Prix:</strong> " +
        (destination.price ? destination.price + "€" : "Sur demande") +
        "</p>" +
        "<p><strong>Pays:</strong> " +
        (destination.country || "N/A") +
        "</p>" +
        "<button class=\"btn\" onclick=\"document.getElementById('detailsModal').style.display='none'\">Fermer</button>";

      detailsModal.style.display = "block";
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur: " + error.message);
    }
  }

  searchInput.addEventListener("input", function (e) {
    const value = e.target.value.toLowerCase();
    filteredDestinations = allDestinations.filter(
      (dest) =>
        dest.name.toLowerCase().includes(value) ||
        (dest.description && dest.description.toLowerCase().includes(value)),
    );
    renderDestinations();
  });

  closeBtn.addEventListener("click", () => {
    detailsModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === detailsModal) detailsModal.style.display = "none";
  });

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Message envoyé !");
    contactForm.reset();
  });

  loadDestinations();
});
const API_URL =
  "https://api-voyage-adam-ajdthba4evb9gqgb.francecentral-01.azurewebsites.net";
const CORS_PROXY = "https://api.allorigins.win/raw?url=";

let allDestinations = [];
let filteredDestinations = [];
let isLoading = false;

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  const cardsContainer = document.getElementById("cardsContainer");
  const loadingDiv = document.getElementById("loadingDestinations");
  const detailsModal = document.getElementById("detailsModal");
  const closeBtn = document.querySelector(".close");
  const modalBody = document.getElementById("modalBody");
  const contactForm = document.querySelector(".contact-form");

  async function loadDestinations() {
    if (isLoading) {
      console.log("Déjà en cours de chargement, abandon...");
      return;
    }

    try {
      isLoading = true;
      console.log("🔄 Chargement depuis:", API_URL + "/destinations");
      loadingDiv.style.display = "block";

      let response = await fetch(API_URL + "/destinations", {
        headers: { Accept: "application/json" },
      }).catch((err) => {
        console.log("⚠️ Erreur directe:", err.message);
        console.log("↪️ Essai avec proxy...");
        return fetch(
          CORS_PROXY + encodeURIComponent(API_URL + "/destinations"),
        );
      });

      console.log("📊 Response status:", response.status, response.statusText);

      if (!response.ok) {
        throw new Error("HTTP " + response.status + " " + response.statusText);
      }

      const text = await response.text();
      console.log(
        "📥 Réponse brute (premiers 500 chars):",
        text.substring(0, 500),
      );

      allDestinations = JSON.parse(text);
      console.log(
        "✅ JSON parsé, type:",
        Array.isArray(allDestinations) ? "Array" : "Object",
      );

      if (!Array.isArray(allDestinations)) {
        console.log("🔄 Conversion objet en tableau...");
        allDestinations = Object.values(allDestinations);
      }

      console.log("✅ Destinations chargées:", allDestinations.length, "items");
      filteredDestinations = allDestinations;
      renderDestinations();
      loadingDiv.style.display = "none";
    } catch (error) {
      console.error("❌ Erreur complète:", error);
      loadingDiv.innerHTML =
        '<p style="color: red;">❌ Erreur: ' + error.message + "</p>";
    } finally {
      isLoading = false;
    }
  }

  function renderDestinations() {
    cardsContainer.innerHTML = "";

    if (filteredDestinations.length === 0) {
      cardsContainer.innerHTML = "<p>Aucune destination trouvée.</p>";
      return;
    }

    filteredDestinations.forEach((destination) => {
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.id = destination.id;
      card.dataset.name = destination.name;

      const imageUrl =
        destination.image_url || getDefaultImage(destination.name);

      card.innerHTML =
        '<img src="' +
        imageUrl +
        '" alt="' +
        destination.name +
        '" />' +
        '<div class="card-content">' +
        "<h3>" +
        destination.name +
        "</h3>" +
        "<p>" +
        (destination.description || "Découvrez cette destination.") +
        "</p>" +
        '<span class="price">' +
        (destination.price
          ? "À partir de " + destination.price + "€"
          : "Prix sur demande") +
        "</span></div>";

      card.addEventListener("click", () =>
        showDestinationDetails(destination.id),
      );
      cardsContainer.appendChild(card);
    });
  }

  function getDefaultImage(destinationName) {
    const images = {
      Bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
      Tokyo:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
      Rome: "https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=1200&q=80",
      "New York":
        "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1200&q=80",
      Paris:
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
      Santorin:
        "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
      Marrakech:
        "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=1200&q=80",
    };
    return (
      images[destinationName] ||
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
    );
  }

  async function showDestinationDetails(destinationId) {
    try {
      console.log("Détails ID:", destinationId);
      const response = await fetch(
        CORS_PROXY +
          encodeURIComponent(API_URL + "/destinations/" + destinationId),
      );

      if (!response.ok) throw new Error("HTTP " + response.status);

      const destination = await response.json();
      const imageUrl =
        destination.image_url || getDefaultImage(destination.name);

      modalBody.innerHTML =
        '<img src="' +
        imageUrl +
        '" alt="' +
        destination.name +
        '" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;" />' +
        "<h2>" +
        destination.name +
        "</h2>" +
        "<p><strong>Description:</strong> " +
        (destination.description || "N/A") +
        "</p>" +
        "<p><strong>Prix:</strong> " +
        (destination.price ? destination.price + "€" : "Sur demande") +
        "</p>" +
        "<p><strong>Pays:</strong> " +
        (destination.country || "N/A") +
        "</p>" +
        "<button class=\"btn\" onclick=\"document.getElementById('detailsModal').style.display='none'\">Fermer</button>";

      detailsModal.style.display = "block";
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur: " + error.message);
    }
  }

  searchInput.addEventListener("input", function (e) {
    const value = e.target.value.toLowerCase();
    filteredDestinations = allDestinations.filter(
      (dest) =>
        dest.name.toLowerCase().includes(value) ||
        (dest.description && dest.description.toLowerCase().includes(value)),
    );
    renderDestinations();
  });

  closeBtn.addEventListener("click", () => {
    detailsModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === detailsModal) detailsModal.style.display = "none";
  });

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Message envoyé !");
    contactForm.reset();
  });

  loadDestinations();
});
