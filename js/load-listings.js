// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js";
import {
    getFirestore, collection, query, where, getDocs, getDoc, doc, addDoc
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import {
    getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC7eaM6HrHalV-wcG-I9_RZJRwDNhin2R0",
    authDomain: "project-gaia1.firebaseapp.com",
    projectId: "project-gaia1",
    storageBucket: "project-gaia1.firebasestorage.app",
    messagingSenderId: "832122601643",
    appId: "1:832122601643:web:1ab91b347704174f52b7ee",
    measurementId: "G-DX2L33NH4H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth();

// Function to fetch the shop address
async function getShopAddress(listing) {
    let shopAddress = 'Not available';
  
    if (listing.sellerId) {
      const sellerDocRef = doc(db, 'user-seller', listing.sellerId);
      const sellerDocSnap = await getDoc(sellerDocRef);
  
      if (sellerDocSnap.exists()) {
        const sellerData = sellerDocSnap.data();
        shopAddress = sellerData.shopaddress || 'Not available';
      } else {
        console.warn('Seller document not found for ID:', listing.sellerId);
      }
    }
  
    return shopAddress;
  }
  
  // Function to load and display listings from Firestore
async function loadListings() {
  const listingsContainer = document.getElementById('listing-container');

  // Clear the container before adding new listings
  listingsContainer.innerHTML = '<p class="text-gray-500 text-center">Loading listings...</p>';

  try {
    // Query the "listed_items" collection where "isActive" is true
    const listingsQuery = query(collection(db, 'listed_items'), where("isActive", "==", true));
    const querySnapshot = await getDocs(listingsQuery);

    // Clear the loading message
    listingsContainer.innerHTML = '';

    if (querySnapshot.empty) {
      // Show a message if no active listings are found
      listingsContainer.innerHTML = `
        <p class="text-gray-500 text-center">No active listings available at the moment.</p>
      `;
      return;
    }

    // Loop through the documents and add them to the page
    querySnapshot.forEach(async (doc) => {
      const listing = doc.data();
      const listingId = doc.id; // Get listingId (doc ID)

      const listingElement = document.createElement('div');
      listingElement.classList.add('bg-white', 'p-4', 'rounded-lg', 'shadow-lg');

      // Fetch shop address using sellerId
      const shopAddress = await getShopAddress(listing);

      // Check if the "images" field exists and is an array
      let image = '';
      if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
        // Use the first image from the array
        image = `<img src="${listing.images[0]}" alt="${listing.productName}" class="w-full h-100 object-cover rounded-md">`;
      } else {
        // Fallback if no images are available
        image = `<div class="w-full h-full bg-gray-200 flex items-center justify-center rounded-md">
                    <p class="text-gray-500">No image available</p>
                 </div>`;
      }

      listingElement.innerHTML = `
        ${image}
        <h3 class="text-xl font-semibold text-gray-900 mt-4">${listing.productName}</h3>
        <p class="text-gray-700 mt-2">Category: ${listing.category || 'N/A'}</p>
        <p class="text-gray-700 mt-2">Size: ${listing.garmentSize || 'N/A'}</p>
        ${listing.rentPrice ? `<p class="text-gray-700 mt-2">Rent Price: ${listing.rentPrice}/day</p>` : ''}
        ${listing.sellPrice ? `<p class="text-gray-700 mt-2">Selling Price: ${listing.sellPrice}</p>` : ''}
        <p class="text-gray-700 mt-2">Shop Address: ${shopAddress}</p>
        <button class="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 view-details-btn" data-listing-id="${listingId}">
          View Details
        </button>
      `;

      listingsContainer.appendChild(listingElement);

      // Add event listener for 'View Details' button
      const viewDetailsButton = listingElement.querySelector('.view-details-btn');
      viewDetailsButton.addEventListener('click', () => {
        const listingId = viewDetailsButton.getAttribute('data-listing-id'); // Get listingId from button
        // Redirect to another window with the listing ID
        window.location.href = `view-listing-details.html?listingId=${listingId}`;
      });
    });
  } catch (error) {
    console.error('Error loading listings:', error);
    listingsContainer.innerHTML = `
      <p class="text-red-500 text-center">Failed to load listings. Please try again later.</p>
    `;
  }
}
  
// Function to show listing details in a modal
async function showListingDetails(listing, listingId) {
  console.log('Showing details for listingId:', listingId); // Debugging to ensure listingId is passed

  const modal = document.getElementById('listing-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalImageContainer = document.getElementById('modal-image-container');
  const modalDescription = document.getElementById('modal-description');
  const modalCategory = document.getElementById('modal-category');
  const modalRentPrice = document.getElementById('modal-rent-price');
  const modalSellPrice = document.getElementById('modal-sell-price');
  const modalFooter = document.getElementById('modal-footer');
  const modalShopAddress = document.getElementById('modal-shop-address');

  // Reset modal content before showing new details
  modalTitle.innerText = '';
  modalImageContainer.innerHTML = '';
  modalDescription.innerText = '';
  modalCategory.innerText = '';
  modalRentPrice.innerText = '';
  modalSellPrice.innerText = '';
  modalFooter.innerHTML = '';
  modalShopAddress.innerHTML = '';

  if (!modalShopAddress) {
      console.error("modal-shop-address element not found.");
      return;
  }

  const shopAddress = await getShopAddress(listing);

  modalTitle.innerText = listing.productName;

  // Handle images
  if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
      if (listing.images.length === 1) {
          modalImageContainer.innerHTML = `
              <div class="w-full h-full overflow-hidden rounded-md">
                  <img src="${listing.images[0]}" alt="${listing.productName}" class="w-full h-full object-contain">
              </div>
          `;
      } else {
          modalImageContainer.innerHTML = `
              <div class="relative w-full h-full overflow-hidden rounded-md">
                  <div id="carousel-images" class="flex transition-transform duration-300 ease-in-out">
                      ${listing.images.map((img, index) => `
                          <div class="carousel-item w-full ${index === 0 ? 'block' : 'hidden'}">
                              <img src="${img}" alt="${listing.productName}" class="w-full h-full object-contain">
                          </div>
                      `).join('')}
                  </div>
                  <button id="prev-image" class="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full">&lt;</button>
                  <button id="next-image" class="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full">&gt;</button>
              </div>
          `;
      }
  } else {
      modalImageContainer.innerHTML = `
          <div class="w-full h-auto bg-gray-200 flex items-center justify-center rounded-md">
              <p class="text-gray-500">No image available</p>
          </div>
      `;
  }

  modalDescription.innerText = listing.productDescription || 'No description available.';
  modalCategory.innerText = `Category: ${listing.category || 'N/A'}, Size: ${listing.garmentSize || 'N/A'}`;
  modalRentPrice.innerText = listing.rentPrice ? `Rent Price: ${listing.rentPrice}/day` : '';
  modalSellPrice.innerText = listing.sellPrice ? `Selling Price: ${listing.sellPrice}` : '';

  // Modal footer buttons (with listingId attached)
  modalFooter.innerHTML = `
      <div class="flex justify-between w-full">
          <button id="view-reviews-button" 
                  class="px-8 py-4 bg-blue-500 text-white text-lg font-semibold rounded-md hover:bg-blue-600"
                  data-listing-id="${listingId}">
              View Reviews
          </button>
          <button id="rent-button" class="px-8 py-4 bg-green-500 text-white text-lg font-semibold rounded-md hover:bg-green-600">
              Rent
          </button>
      </div>
  `;

  // Add event listener for 'View Reviews' button in the modal footer
  const viewReviewsButton = document.getElementById('view-reviews-button');
  viewReviewsButton.addEventListener('click', () => {
      const listingId = viewReviewsButton.getAttribute('data-listing-id'); // Get the listingId from the button
      console.log('View Reviews clicked for listingId:', listingId); // Debugging to check the value
      // Handle the View Reviews logic here, using the listingId
      viewReviews(listingId); // Call the function to show reviews or handle the review logic
  });

  // Shop address and Google Maps link
  modalShopAddress.innerHTML = `
      <p class="text-gray-700 mt-2">Shop Address: ${shopAddress}</p>
      <button 
          id="view-google-maps" 
          class="mt-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          onclick="openGoogleMaps('${shopAddress}')"
      >
          View on Google Maps
      </button>
  `;

  // Show the modal
  modal.classList.remove('hidden');
}

async function viewReviews(listingId) {
  console.log('Fetching reviews for listingId:', listingId);

  let reviewsContainer = document.getElementById('reviews-container');

  if (!reviewsContainer) {
    // Create the overlay
    reviewsContainer = document.createElement('div');
    reviewsContainer.id = 'reviews-container';
    reviewsContainer.classList.add(
      'fixed', 'top-0', 'left-0', 'w-full', 'h-full',
      'bg-gray-800', 'bg-opacity-50',
      'flex', 'items-center', 'justify-center',
      'z-50'
    );

    // Click-outside-to-close
    reviewsContainer.addEventListener('click', (e) => {
      if (e.target === reviewsContainer) {
        reviewsContainer.style.display = 'none';
      }
    });

    // Create modal content box
    const modalContent = document.createElement('div');
    modalContent.id = 'reviews-modal-content';
    modalContent.classList.add(
      'bg-white', 'p-6', 'rounded-lg',
      'w-4/5', 'max-w-3xl', 'max-h-[80vh]',
      'overflow-y-auto', 'relative',
      'shadow-xl'
    );

    // Close button
    const closeButton = document.createElement('button');
    closeButton.classList.add(
      'absolute', 'top-4', 'right-4',
      'bg-red-500', 'text-white', 'px-3', 'py-1',
      'rounded-full', 'hover:bg-red-600', 'text-sm'
    );
    closeButton.innerText = '×';
    closeButton.title = 'Close';

    closeButton.addEventListener('click', () => {
      reviewsContainer.style.display = 'none';
    });

    modalContent.appendChild(closeButton);

    // Container for reviews
    const reviewsList = document.createElement('div');
    reviewsList.id = 'reviews-list';
    modalContent.appendChild(reviewsList);

    reviewsContainer.appendChild(modalContent);
    document.body.appendChild(reviewsContainer);
  }

  const reviewsList = document.getElementById('reviews-list');
  reviewsList.innerHTML = '<p class="text-gray-500 text-center">Loading reviews...</p>';

  try {
    const reviewsQuery = query(collection(db, 'reviews'), where('listingId', '==', listingId));
    const querySnapshot = await getDocs(reviewsQuery);

    reviewsList.innerHTML = '';

    if (querySnapshot.empty) {
      reviewsList.innerHTML = `
        <p class="text-gray-500 text-center">No reviews available for this listing yet.</p>
      `;
    } else {
      querySnapshot.forEach(doc => {
        const review = doc.data();
        const reviewElement = document.createElement('div');
        reviewElement.classList.add('bg-gray-100', 'p-4', 'rounded-md', 'shadow', 'mb-4');
        reviewElement.innerHTML = `
          <h4 class="font-semibold text-lg">${review.name}</h4>
          <p class="text-gray-700">${review.reviewText}</p>
          <p class="text-gray-400 text-sm">Reviewed on: ${new Date(review.timestamp.seconds * 1000).toLocaleDateString()}</p>
        `;
        reviewsList.appendChild(reviewElement);
      });
    }

    reviewsContainer.style.display = 'flex';

  } catch (error) {
    console.error('Error fetching reviews:', error);
    reviewsList.innerHTML = `
      <p class="text-red-500 text-center">Failed to load reviews. Please try again later.</p>
    `;
    reviewsContainer.style.display = 'flex';
  }
}



  
  window.openGoogleMaps = function(address) {
    const googleMapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}`;
    window.open(googleMapsUrl, '_blank');
  };

  // Load listings when the page is loaded
  window.onload = loadListings;

  
  // CATEGORY FILTER BUTTONS HANDLER
// Refactored to query Firestore based on category

// CATEGORY FILTER BUTTONS HANDLER
// Refactored to filter already loaded listing cards for faster performance

document.querySelectorAll('.filter-btn').forEach(button => {
  button.addEventListener('click', () => {
    const category = button.getAttribute('data-category');
    const listingsContainer = document.getElementById('listing-container');
    const allCards = listingsContainer.querySelectorAll('div.bg-white');

    let found = false;

    allCards.forEach(card => {
      const categoryText = card.querySelector('p.text-gray-700.mt-2');
      if (category === 'all' || (categoryText && categoryText.textContent.includes(category))) {
        card.style.display = '';
        found = true;
      } else {
        card.style.display = 'none';
      }
    });

    // Show message if no cards match (except for 'all')
    let noResultsMsg = listingsContainer.querySelector('.no-results-message');
    if (!found && category !== 'all') {
      if (!noResultsMsg) {
        noResultsMsg = document.createElement('p');
        noResultsMsg.className = 'no-results-message text-gray-500 text-center';
        noResultsMsg.textContent = 'No listings available for the selected category.';
        listingsContainer.appendChild(noResultsMsg);
      }
    } else if (noResultsMsg) {
      noResultsMsg.remove();
    }
  });
});

