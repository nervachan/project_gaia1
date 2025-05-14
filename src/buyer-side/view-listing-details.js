// Import the necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC7eaM6HrHalV-wcG-I9_RZJRwDNhin2R0",
    authDomain: "project-gaia1.firebaseapp.com",
    projectId: "project-gaia1",
    storageBucket: "project-gaia1.firebasestorage.app",
    messagingSenderId: "832122601643",
    appId: "1:832122601643:web:1ab91b347704174f52b7ee",
    measurementId: "G-DX2L33NH4H"
};

// Initialize Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Extract listingId from URL query parameters
const urlParams = new URLSearchParams(window.location.search);
const listingId = urlParams.get('listingId');

if (!listingId) {
  alert('No listing ID provided. Redirecting to listings page.');
  window.location.href = 'buyer-login.html';
}

// Function to fetch the shop address
async function getShopAddress(sellerId) {
  let shopAddress = 'Not available';

  if (sellerId) {
    const sellerDocRef = doc(db, 'user-seller', sellerId);
    const sellerDocSnap = await getDoc(sellerDocRef);

    if (sellerDocSnap.exists()) {
      const sellerData = sellerDocSnap.data();
      shopAddress = sellerData.shopaddress || 'Not available';
    } else {
      console.warn('Seller document not found for ID:', sellerId);
    }
  }

  return shopAddress;
}

// Updated the fetchListingDetails function to include a carousel for multiple images
async function fetchListingDetails() {
  try {
    const docRef = doc(db, 'listed_items', listingId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const listing = docSnap.data();

      // Fetch shop address using sellerId
      const shopAddress = await getShopAddress(listing.sellerId);

      document.getElementById('listing-title').innerText = listing.productName || 'No title available';

      const imageContainer = document.getElementById('listing-image');
      if (listing.images && listing.images.length > 0) {
        if (listing.images.length === 1) {
          // Display a single image with uniform size
          imageContainer.innerHTML = `<img src="${listing.images[0]}" alt="${listing.productName}" class="w-full h-full object-cover rounded-md">`;
        } else {
          // Create a carousel for multiple images with uniform size
          let carouselHTML = '<div id="image-carousel" class="relative">';
          listing.images.forEach((image, index) => {
            carouselHTML += `
              <div class="carousel-item ${index === 0 ? 'block' : 'hidden'}">
                <img src="${image}" alt="${listing.productName}" class="w-full h-full object-cover rounded-md">
              </div>`;
          });
          carouselHTML += `
            <button class="carousel-control-prev absolute left-2 top-1/2 transform -translate-y-1/2 text-4xl text-white bg-gray-800 rounded-full p-3 hover:bg-gray-700 z-10">&#10094;</button>
            <button class="carousel-control-next absolute right-2 top-1/2 transform -translate-y-1/2 text-4xl text-white bg-gray-800 rounded-full p-3 hover:bg-gray-700 z-10">&#10095;</button>
          </div>`;
          imageContainer.innerHTML = carouselHTML;

          // Add carousel functionality
          addCarouselFunctionality();
        }
      } else {
        imageContainer.innerHTML = '<p class="text-gray-500">No image available</p>';
      }

      document.getElementById('listing-description').innerText = listing.productDescription || 'No description available';
      document.getElementById('listing-category').innerText = `Category: ${listing.category || 'N/A'}`;
      document.getElementById('listing-rent-price').innerText = listing.rentPrice ? `Rent Price: ${listing.rentPrice}/day` : 'No rent price available';

      document.getElementById('listing-shop-address').innerHTML = `
        Shop Address: ${shopAddress}
        <button 
          class="ml-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" 
          onclick="window.open('https://www.google.com/maps?q=${encodeURIComponent(shopAddress)}', '_blank')">
          View on Google Maps
        </button>`;
    } else {
      alert('Listing not found. Redirecting to listings page.');
      window.location.href = 'buyer-login.html';
    }
  } catch (error) {
    console.error('Error fetching listing details:', error);
    alert('Failed to load listing details. Please try again later.');
  }
}

// Updated the carousel functionality to ensure buttons are scoped to the image section
function addCarouselFunctionality() {
  let currentIndex = 0;
  const carousel = document.getElementById('image-carousel');
  const items = carousel.querySelectorAll('.carousel-item');

  // Ensure only the first item is visible initially
  items.forEach((item, index) => {
    item.style.display = index === 0 ? 'block' : 'none';
  });

  // Define the prevSlide function
  function prevSlide() {
    items[currentIndex].style.display = 'none';
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    items[currentIndex].style.display = 'block';
  }

  // Define the nextSlide function
  function nextSlide() {
    items[currentIndex].style.display = 'none';
    currentIndex = (currentIndex + 1) % items.length;
    items[currentIndex].style.display = 'block';
  }

  // Attach event listeners to the buttons
  const prevButton = carousel.querySelector('.carousel-control-prev');
  const nextButton = carousel.querySelector('.carousel-control-next');

  if (prevButton) {
    prevButton.addEventListener('click', prevSlide);
  }

  if (nextButton) {
    nextButton.addEventListener('click', nextSlide);
  }

  // Apply Tailwind CSS classes to buttons
  prevButton.className = ' top-1/2 transform -translate-y-1/2 text-4xl text-white bg-gray-800 rounded-full p-3 hover:bg-gray-700 z-10';
  prevButton.innerHTML = '&#10094;';

  nextButton.className = ' top-1/2 transform -translate-y-1/2 text-4xl text-white bg-gray-800 rounded-full p-3 hover:bg-gray-700 z-10';
  nextButton.innerHTML = '&#10095;';
}

// Function to highlight dates with pending rentals
async function highlightPendingRentalDates(listingId) {
  try {
    const rentalsQuery = query(
      collection(db, 'rentals'),
      where('listingId', '==', listingId),
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(rentalsQuery);

    const calendarDates = document.querySelectorAll('input[type="date"]');

    querySnapshot.forEach(doc => {
      const rental = doc.data();
      const startDate = new Date(rental.startDate.seconds * 1000);
      const endDate = new Date(rental.endDate.seconds * 1000);

      calendarDates.forEach(dateInput => {
        const dateValue = new Date(dateInput.value);
        if (dateValue >= startDate && dateValue <= endDate) {
          dateInput.classList.add('bg-red-500', 'text-white');
        }
      });
    });
  } catch (error) {
    console.error('Error fetching pending rentals:', error);
  }
}

// Function to highlight pending dates in Flatpickr calendars
async function highlightPendingDates(selectedDates, dateStr, instance) {
  try {
    const rentalsQuery = query(
      collection(db, 'rentals'),
      where('listingId', '==', listingId)
    );
    const querySnapshot = await getDocs(rentalsQuery);

    const pendingDates = [];

    querySnapshot.forEach(doc => {
      const rental = doc.data();
      const startDate = new Date(rental.startDate.seconds * 1000);
      const endDate = new Date(rental.endDate.seconds * 1000);

      let currentDate = startDate;
      while (currentDate <= endDate) {
        pendingDates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    instance.config.disable = pendingDates;
    instance.redraw();
  } catch (error) {
    console.error('Error fetching pending rentals:', error);
  }
}

// Back button functionality
document.getElementById('back-button').addEventListener('click', () => {
  window.location.href = 'buyer-login.html';
});

// Load listing details on page load
fetchListingDetails().then(() => {
  highlightPendingRentalDates(listingId);
});

// Event listener for toggling the rental form
const rentButton = document.getElementById('rent-button');
if (rentButton) {
  rentButton.addEventListener('click', () => {
    const rentalFormSection = document.getElementById('rental-form-section');
    if (rentalFormSection) {
      rentalFormSection.classList.toggle('hidden');
    }
  });
}

// Initialize Flatpickr for start and end date fields
const startDatePicker = flatpickr("#rental-start-date", {
  dateFormat: "Y-m-d",
  onReady: highlightPendingDates,
  onMonthChange: highlightPendingDates
});

const endDatePicker = flatpickr("#rental-end-date", {
  dateFormat: "Y-m-d",
  onReady: highlightPendingDates,
  onMonthChange: highlightPendingDates
});