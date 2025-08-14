// Import the necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, query, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { loader } from './loader.js';

const firebaseConfig = {
    apiKey: "AIzaSyC7eaM6HrHalV-wcG-I9_RZJRwDNhin2R0",
    authDomain: "project-gaia1.firebaseapp.com",
    projectId: "project-gaia1",
    storageBucket: "project-gaia1.appspot.com",
    messagingSenderId: "832122601643",
    appId: "1:832122601643:web:1ab91b347704174f52b7ee",
    measurementId: "G-DX2L33NH4H"
};

console.log("Initializing Firebase...");
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
let currentListingSellerId = null; // Store sellerId for use in form submission

console.log("Extracting listingId from URL...");
const urlParams = new URLSearchParams(window.location.search);
const listingId = urlParams.get('listingId');
console.log("listingId:", listingId);

if (!listingId) {
  alert('No listing ID provided. Redirecting to listings page.');
  window.location.href = 'buyer-login.html';
}

// Ensure user session is retained and redirect if not logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('[Auth] User is logged in:', user.uid);
    // Enable rent button if present
    const rentButton = document.getElementById('rent-button');
    if (rentButton) {
      rentButton.disabled = false;
      rentButton.classList.remove('bg-gray-400', 'cursor-not-allowed', 'opacity-50');
      rentButton.classList.add('bg-blue-500', 'hover:bg-blue-600', 'cursor-pointer');
      rentButton.removeAttribute('title');
    }
  } else {
    console.log('[Auth] No user is logged in. Redirecting to login.');
    // Grey out rent button if present and add hover message
    const rentButton = document.getElementById('rent-button');
    if (rentButton) {
      rentButton.disabled = true;
      rentButton.classList.remove('bg-blue-500', 'hover:bg-blue-600', 'cursor-pointer');
      rentButton.classList.add('bg-gray-400', 'cursor-not-allowed', 'opacity-50');
      rentButton.setAttribute('title', 'Please log in to rent this item.');
    }
  }
});

// Function to fetch the shop address
async function getShopAddress(sellerId) {
  let shopAddress = 'Not available';
  console.log("Fetching shop address for sellerId:", sellerId);

  if (sellerId) {
    const sellerDocRef = doc(db, 'user-seller', sellerId);
    const sellerDocSnap = await getDoc(sellerDocRef);

    if (sellerDocSnap.exists()) {
      const sellerData = sellerDocSnap.data();
      shopAddress = sellerData.shopaddress || 'Not available';
      console.log("Shop address found:", shopAddress);
    } else {
      console.warn('Seller document not found for ID:', sellerId);
    }
  }

  return shopAddress;
}

// Updated the fetchListingDetails function to include a carousel for multiple images
async function fetchListingDetails() {
  try {
    console.log("Fetching listing details for listingId:", listingId);
    const docRef = doc(db, 'listed_items', listingId);
    const docSnap = await loader.withLoader(
      async () => await getDoc(docRef),
      "Loading listing details..."
    );

    if (docSnap.exists()) {
      const listing = docSnap.data();
      console.log("Listing data:", listing);

      // Fetch shop address using sellerId
      const shopAddress = await getShopAddress(listing.sellerId);

      document.getElementById('listing-title').innerText = listing.productName || 'No title available';

      const imageContainer = document.getElementById('listing-image');
      if (listing.images && listing.images.length > 0) {
        if (listing.images.length === 1) {
          // Display a single image with uniform size
          imageContainer.innerHTML = `<img src="${listing.images[0]}" alt="${listing.productName}" class="w-full h-96 object-contain rounded-md">`;
          console.log("Displayed single image.");
        } else {
          // Create a carousel for multiple images with uniform size
          let carouselHTML = '<div id="image-carousel" class="relative">';
          listing.images.forEach((image, index) => {
            carouselHTML += `
              <div class="carousel-item ${index === 0 ? 'block' : 'hidden'}">
                <img src="${image}" alt="${listing.productName}" class="w-full h-96 object-contain rounded-md">
              </div>`;
          });
          carouselHTML += `
            <button class="carousel-control-prev absolute left-2 top-1/2 transform -translate-y-1/2 text-4xl text-white bg-gray-800 rounded-full p-3 hover:bg-gray-700 z-10">&#10094;</button>
            <button class="carousel-control-next absolute right-2 top-1/2 transform -translate-y-1/2 text-4xl text-white bg-gray-800 rounded-full p-3 hover:bg-gray-700 z-10">&#10095;</button>
          </div>`;
          imageContainer.innerHTML = carouselHTML;

          // Add carousel functionality
          addCarouselFunctionality();
          console.log("Displayed image carousel.");
        }
      } else {
        imageContainer.innerHTML = '<p class="text-gray-500">No image available</p>';
        console.log("No images found for listing.");
      }

      document.getElementById('listing-description').innerText = listing.productDescription || 'No description available';
      document.getElementById('listing-category').innerText = `Category: ${listing.category || 'N/A'}`;
      document.getElementById('listing-garment-size').innerText = `Size: ${listing.garmentSize || 'N/A'}`;
      document.getElementById('listing-bust-chest').innerText = listing.bustChest ? `Bust/Chest: ${listing.bustChest} cm` : 'Bust/Chest: N/A';
      document.getElementById('listing-height').innerText = listing.height ? `Height: ${listing.height} cm` : 'Height: N/A';
      document.getElementById('listing-waist').innerText = listing.waist ? `Waist: ${listing.waist} cm` : 'Waist: N/A';
      document.getElementById('listing-rent-price').innerText = listing.rentPrice ? `Rent Price: ${listing.rentPrice}/day` : 'No rent price available';

      document.getElementById('listing-shop-address').innerHTML = `
        Shop Address: ${shopAddress}
        <button 
          class="ml-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" 
          onclick="window.open('https://www.google.com/maps?q=${encodeURIComponent(shopAddress)}', '_blank')">
          View on Google Maps
        </button>`;
      console.log("Listing details rendered.");

      // Inject rentalPrice into id="rental-price"
      const rentalPriceInput = document.getElementById('rental-price');
      if (rentalPriceInput && listing.rentPrice) {
        rentalPriceInput.value = `${listing.rentPrice}/day`;
        console.log('[Event] rentalPrice injected:', rentalPriceInput.value);
      }

      currentListingSellerId = listing.sellerId; // Store sellerId
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
    console.log("Carousel: moved to previous image, index:", currentIndex);
  }

  // Define the nextSlide function
  function nextSlide() {
    items[currentIndex].style.display = 'none';
    currentIndex = (currentIndex + 1) % items.length;
    items[currentIndex].style.display = 'block';
    console.log("Carousel: moved to next image, index:", currentIndex);
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
  console.log("Carousel functionality initialized.");
}

// Function to highlight dates with pending rentals
async function highlightPendingRentalDates(listingId) {
  try {
    console.log("Highlighting pending rental dates for listingId:", listingId);
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
    console.log("Pending rental dates highlighted.");
  } catch (error) {
    console.error('Error fetching pending rentals:', error);
  }
}

// Function to highlight pending dates in Flatpickr calendars
async function highlightPendingDates(selectedDates, dateStr, instance) {
  try {
    console.log("Highlighting pending dates in Flatpickr for listingId:", listingId);
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
    console.log("Flatpickr pending dates disabled:", pendingDates);
  } catch (error) {
    console.error('Error fetching pending rentals:', error);
  }
}

// Back button functionality: redirect based on authentication state
document.getElementById('back-button').addEventListener('click', () => {
  console.log("Back button clicked.");
  if (!auth.currentUser) {
    console.log("No user logged in. Redirecting to index.html");
    window.location.href = 'index.html';
  } else {
    console.log("User is logged in. Redirecting to buyer-login.html");
    window.location.href = 'buyer-login.html';
  }
});

//Open rent form when rent button is clicked
const rentButton = document.getElementById('rent-button');
const rentalFormSection = document.getElementById('rental-form-section');
if (rentButton && rentalFormSection) {
  rentButton.addEventListener('click', () => {
    rentalFormSection.classList.remove('hidden');
    console.log('[Event] Rent button clicked. Rental form section opened.');
  });
}

// Initialize flatpickr for rental start and end date inputs
document.addEventListener('DOMContentLoaded', async () => {
  const rentalStartDate = document.getElementById('rental-start-date');
  const rentalEndDate = document.getElementById('rental-end-date');
  const rentalPriceInput = document.getElementById('rental-price');
  const totalPriceElement = document.getElementById('rental-total');

  let startDateValue = null;
  let endDateValue = null;
  let rentPriceValue = 0;

  // Helper to extract numeric rent price
  function getRentPrice() {
    if (rentalPriceInput && rentalPriceInput.value) {
      const match = rentalPriceInput.value.match(/([\d.]+)/);
      return match ? parseFloat(match[1]) : 0;
    }
    return 0;
  }

  // Calculate and inject total price
  function calculateTotalPrice() {
    if (startDateValue && endDateValue) {
      const diffTime = endDateValue.getTime() - startDateValue.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      const days = diffDays >= 0 ? diffDays + 1 : 0;
      rentPriceValue = getRentPrice();
      const total = days > 0 ? days * rentPriceValue : 0;
      if (totalPriceElement) totalPriceElement.value = `₱${total.toFixed(2)}`;
    } else if (totalPriceElement) {
      totalPriceElement.value = "₱0.00";
    }
  }

  // Fetch reserved (pending) dates for this listing
  async function getPendingDates() {
    const pendingDates = [];
    try {
      const rentalsQuery = query(
        collection(db, 'rentals'),
        where('listingId', '==', listingId)
      );
      const querySnapshot = await getDocs(rentalsQuery);
      querySnapshot.forEach(docSnap => {
        const rental = docSnap.data();
        let start = rental.startDate;
        let end = rental.endDate;
        if (start && end) {
          let startStr, endStr;
          if (typeof start === 'string') {
              startStr = start;
          } else { // Old format: Firestore Timestamp
              startStr = flatpickr.formatDate(start.toDate(), "Y-m-d");
          }
          if (typeof end === 'string') {
              endStr = end;
          } else { // Old format: Firestore Timestamp
              endStr = flatpickr.formatDate(end.toDate(), "Y-m-d");
          }
          let currentDate = flatpickr.parseDate(startStr, "Y-m-d");
          const lastDate = flatpickr.parseDate(endStr, "Y-m-d");
          if (currentDate && lastDate) {
              while (currentDate <= lastDate) {
                  pendingDates.push(flatpickr.formatDate(currentDate, "Y-m-d"));
                  currentDate.setDate(currentDate.getDate() +1 );
              }
          }
        }
      });
    } catch (err) {
      console.error('[Flatpickr] Error fetching pending dates:', err);
    }
    return pendingDates;
  }

  if (window.flatpickr && rentalStartDate && rentalEndDate) {
    const pendingDates = await getPendingDates();

    flatpickr(rentalStartDate, {
      dateFormat: "Y-m-d",
      // Do not use disable, just color the days
      onDayCreate: function(dObj, dStr, fp, dayElem) {
        const dateStr = flatpickr.formatDate(dayElem.dateObj, "Y-m-d");
        if (pendingDates.includes(dateStr)) {
          dayElem.classList.add('bg-red-500', 'text-white');
          dayElem.style.pointerEvents = 'none'; // Prevent selection
        }
      },
      onChange: function(selectedDates, dateStr, instance) {
        startDateValue = selectedDates[0];
        calculateTotalPrice();
        console.log('[Flatpickr] Start date selected:', dateStr);
      }
    });
    flatpickr(rentalEndDate, {
      dateFormat: "Y-m-d",
     
      onDayCreate: function(dObj, dStr, fp, dayElem) {
        const dateStr = flatpickr.formatDate(dayElem.dateObj, "Y-m-d");
        if (pendingDates.includes(dateStr)) {
          dayElem.classList.add('bg-red-500', 'text-white');
          dayElem.style.pointerEvents = 'none'; // Prevent selection
        }
      },
      onChange: function(selectedDates, dateStr, instance) {
        endDateValue = selectedDates[0];
        calculateTotalPrice();
        console.log('[Flatpickr] End date selected:', dateStr);
      }
    });
    console.log('[Flatpickr] Initialized on rental-start-date and rental-end-date with pending dates:', pendingDates);
  }

  // Rental form submission
  const rentalForm = document.getElementById('rental-form');
  if (rentalForm) {
    rentalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      await loader.withLoader(async () => {
        try {
          const user = auth.currentUser;
          if (!user) {
            alert('Please log in to submit a rental request.');
            window.location.href = 'buyer-login.html';
            return;
          }

          const rentalName = document.getElementById('rental-name').value;
          const rentalStartDate = document.getElementById('rental-start-date').value;
          const rentalEndDate = document.getElementById('rental-end-date').value;
          const totalPrice = document.getElementById('rental-total').value;

          if (!rentalName || !rentalStartDate || !rentalEndDate) {
            alert('Please fill in all required fields.');
            return;
          }

          // Create rental data with listingId
          const rentalData = {
            listingId: listingId,
            renterId: user.uid,
            renterName: rentalName,
            startDate: flatpickr.formatDate(new Date(rentalStartDate), "Y-m-d"),
            endDate: flatpickr.formatDate(new Date(rentalEndDate), "Y-m-d"),
            totalPrice: totalPrice,
            status: 'pending',
            createdAt: new Date()
          };

          console.log('[Rental] Submitting rental data:', rentalData);

          // Add rental to Firestore
          await addDoc(collection(db, 'rentals'), rentalData);
          
          alert('Rental submitted successfully!');
          console.log('[Rental] Rental submitted successfully:', rentalData);
          
          // Reset form and hide rental section
          window.location.href = 'buyer-login.html';
          document.getElementById('rental-form-section').classList.add('hidden');
          
          // Refresh pending dates
          highlightPendingRentalDates(listingId);
          
        } catch (error) {
          console.error('[Rental] Error submitting rental:', error);
          alert('Failed to submit rental. Please try again.');
        }
      }, "Processing rental request...");
    });
  }
});

// Load listing details on page load
console.log("Calling fetchListingDetails...");
fetchListingDetails().then(() => {
  console.log("fetchListingDetails complete. Calling highlightPendingRentalDates...");
  highlightPendingRentalDates(listingId);
});

/**
 * Fetch and display reviews for the current listingId.
 */
async function fetchAndDisplayReviews() {
  try {
    const reviewsContainer = document.getElementById('reviews-list');
    if (!reviewsContainer) {
      console.warn('[Reviews] No #reviews-section element found.');
      return;
    }

    // Query reviews where listingId matches
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('listingId', '==', listingId)
    );
    const querySnapshot = await getDocs(reviewsQuery);

    if (querySnapshot.empty) {
      reviewsContainer.innerHTML = '<p class="text-gray-500">No reviews yet for this listing.</p>';
      return;
    }

    let reviewsHTML = '';
    querySnapshot.forEach(docSnap => {
      const review = docSnap.data();
      // Format timestamp as date and time if available
      let formattedTimestamp = '';
      if (review.timestamp) {
        let dateObj;
        if (typeof review.timestamp === 'object' && review.timestamp.seconds) {
          dateObj = new Date(review.timestamp.seconds * 1000);
        } else {
          dateObj = new Date(review.timestamp);
        }
        if (!isNaN(dateObj.getTime())) {
          formattedTimestamp = dateObj.toLocaleString();
        } else {
          formattedTimestamp = review.timestamp;
        }
      }

      reviewsHTML += `
        <div class="mb-4 p-4 border rounded bg-gray-50">
          <div class="text-lg text-gray-700 mt-1 ">${review.reviewText || ''}</div>
          <div class="text-sm text-gray-400 mt-1">${formattedTimestamp}</div>
        </div>
      `;
    });

    // Inject the fetched reviews HTML into the reviews-section div
    reviewsContainer.innerHTML = reviewsHTML;
  } catch (error) {
    console.error('[Reviews] Error fetching reviews:', error);
    const reviewsContainer = document.getElementById('reviews-list');
    if (reviewsContainer) {
      reviewsContainer.innerHTML = '<p class="text-red-500">Failed to load reviews.</p>';
    }
  }
}

// Call fetchAndDisplayReviews on page load
document.addEventListener('DOMContentLoaded', fetchAndDisplayReviews);