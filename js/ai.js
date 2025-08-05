const promptForm = document.querySelector(".prompt-form");
const themeToggle = document.querySelector(".theme-toggle");
const promptBtn = document.querySelector(".prompt-btn");
const promptInput = document.querySelector(".prompt-input");
const generateBtn = document.querySelector(".generate-btn");
const galleryGrid = document.querySelector(".gallery-grid");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");

const BACKEND_URL = "https://ai-backend-server-dp2z.onrender.com/generate-image";


// Example prompts
const examplePrompts = [
   "A sleek black tuxedo with modern silver lapels and a deep blue pocket square for an upscale evening event",
  "A flowing rose gold gown with off-shoulder sleeves and embroidered floral patterns for a spring wedding",
  "An all-white minimalist suit with a slim fit, perfect for a contemporary civil wedding",
  "A royal blue ball gown with crystal embellishments and a dramatic trailing skirt designed for a debutante",
  "A classic three-piece charcoal suit with a maroon tie and leather oxford shoes for a formal business gala",
  "An emerald green satin gown with a plunging neckline and open back, ideal for an awards night",
  "A vintage-inspired tuxedo with velvet fabric and rounded collars, reminiscent of 1950s Hollywood",
  "A champagne-colored halter gown with high slits and shimmering details suited for a red carpet event",
  "A bohemian-style lace gown with bell sleeves and soft beige tones for a garden wedding",
  "A sharp double-breasted navy blue suit with gold buttons and tan loafers for a seaside wedding",
  "A black and gold embroidered sherwani paired with cream trousers for a South Asian wedding ceremony",
  "A high-slit maroon gown with one-shoulder design and gold jewelry accessories for a cocktail event",
  "A crisp beige suit with pastel accents for a summer formal outdoor gathering",
  "An asymmetrical couture gown with metallic fabric and structured shoulder pads for a fashion-forward gala",
  "A traditional Filipiniana-inspired gown with modern embroidery and butterfly sleeves for cultural formal events",
];

// Set theme based on saved preference or system default
(() => {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const isDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
  document.body.classList.toggle("dark-theme", isDarkTheme);
  themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
})();

// Switch between light and dark themes
const toggleTheme = () => {
  const isDarkTheme = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
  themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
};

// Calculate width/height based on chosen ratio
const getImageDimensions = (aspectRatio, baseSize = 512) => {
  const [width, height] = aspectRatio.split("/").map(Number);
  const scaleFactor = baseSize / Math.sqrt(width * height);

  let calculatedWidth = Math.round(width * scaleFactor);
  let calculatedHeight = Math.round(height * scaleFactor);

  // Ensure dimensions are multiples of 16 (AI model requirements)
  calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
  calculatedHeight = Math.floor(calculatedHeight / 16) * 16;

  return { width: calculatedWidth, height: calculatedHeight };
};

// Replace loading spinner with the actual image
const updateImageCard = (cardIndex, imageUrl) => {
  const imgCard = document.getElementById(`img-card-${cardIndex}`);
  imgCard.classList.replace("loading", "generated");
  imgCard.innerHTML = `
    <div>
      <img class="result-img" src="${imageUrl}" />
      <div class="img-overlay">
        <a href="${imageUrl}" class="img-download-btn text-white bg-black bg-opacity-50 rounded-lg px-4 py-2 text-lg font-semibold" title="Download Image" download>
          Download
        </a>
      </div>
    </div>
  `;
};

// Send requests to Hugging Face API to create images
const generateImages = async (selectedModel, imageCount, aspectRatio, promptText) => {
  
  const { width, height } = getImageDimensions(aspectRatio);
  generateBtn.setAttribute("disabled", "true");

  const imagePromises = Array.from({ length: imageCount }, (_, i) => {
    const imgCard = document.getElementById(`img-card-${i}`);
    imgCard.classList.remove("error");
    imgCard.classList.add("loading");
    const statusText = imgCard.querySelector(".status-text");
    if (statusText) {
      statusText.textContent = "Generating...";
    }
    return (async () => {
      try {
        // Send request to the AI model API
        const response = await fetch(BACKEND_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: selectedModel,
    prompt: promptText,
    width,
    height,
  }),
});

        if (!response.ok) throw new Error((await response.json())?.error);

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        updateImageCard(i, imageUrl);

      } catch (error) {
        console.error(error);
        const imgCard = document.getElementById(`img-card-${i}`);
        imgCard.classList.replace("loading", "error");
        imgCard.querySelector(".status-text").textContent = "Generation failed! Check console for more details.";
      }
    })();
  });

  await Promise.allSettled(imagePromises);
  generateBtn.removeAttribute("disabled");
};

// Create placeholder cards with loading spinners
const createImageCards = (selectedModel, imageCount, aspectRatio, promptText) => {
  galleryGrid.innerHTML = "";

  for (let i = 0; i < imageCount; i++) {
    galleryGrid.innerHTML += 
      `<div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${aspectRatio}">
        <div class="status-container">
          <div class="spinner"></div>
          <i class="fa-solid fa-triangle-exclamation"></i>
          <p class="status-text">Generating...</p>
        </div>
      </div>`;
  }

  // Stagger animation
  document.querySelectorAll(".img-card").forEach((card, i) => {
    setTimeout(() => card.classList.add("animate-in"), 100 * i);
  });

  generateImages(selectedModel, imageCount, aspectRatio, promptText); // Generate Images
};

// Handle form submission
const handleFormSubmit = (e) => {
  e.preventDefault();

  // Get form values
  const selectedModel = modelSelect.value;
  const imageCount = parseInt(countSelect.value) || 1;
  const aspectRatio = ratioSelect.value || "1/1";
  const promptText = promptInput.value.trim();

  createImageCards(selectedModel, imageCount, aspectRatio, promptText);
};

// Fill prompt input with random example (typing effect)
promptBtn.addEventListener("click", () => {
  const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];

  let i = 0;
  promptInput.focus();
  promptInput.value = "";

  // Disable the button during typing animation
  promptBtn.disabled = true;
  promptBtn.style.opacity = "0.5";

  // Typing effect
  const typeInterval = setInterval(() => {
    if (i < prompt.length) {
      promptInput.value += prompt.charAt(i);
      i++;
    } else {
      clearInterval(typeInterval);
      promptBtn.disabled = false;
      promptBtn.style.opacity = "0.8";
    }
  }, 10); // Speed of typing
});

// --- Firebase and Modal Logic ---
if (themeToggle) {
  themeToggle.addEventListener("click", toggleTheme);
}
if (promptForm) {
  promptForm.addEventListener("submit", handleFormSubmit);
}