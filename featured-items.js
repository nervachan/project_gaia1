// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js";
import {getFirestore, collection, query, where, getDocs, getDoc, doc, addDoc,limit} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import {getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

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


// Function to load and display up to 4 listings from Firestore
async function loadListings() {
  const listingsContainer = document.getElementById('featured-items');

  // Show loading message
  listingsContainer.innerHTML = '<p class="text-gray-500 text-center">Loading listings...</p>';

  try {
    // Query the first 4 active listings
    const listingsQuery = query(
      collection(db, 'listed_items'),
      
      limit(4) // Limit to 4 results
    );
    const querySnapshot = await getDocs(listingsQuery);

    // Clear the loading message
    listingsContainer.innerHTML = '';

    if (querySnapshot.empty) {
      listingsContainer.innerHTML = `
        <p class="text-gray-500 text-center">No active listings available at the moment.</p>
      `;
      return;
    }

    // Loop through up to 4 documents
    for (const doc of querySnapshot.docs) {
      const listing = doc.data();
      const listingId = doc.id;

      const listingElement = document.createElement('div');
      listingElement.classList.add('bg-white', 'p-4', 'rounded-lg', 'shadow-lg');

    

      // Handle image
      let imageHTML = '';
      if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
        imageHTML = `<img src="${listing.images[0]}" alt="${listing.productName}" class="w-full h-100 object-cover rounded-md">`;
      } else {
        imageHTML = `<div class="w-full h-full bg-gray-200 flex items-center justify-center rounded-md">
                       <p class="text-gray-500">No image available</p>
                     </div>`;
      }

    // Build listing content using the new card design
    listingElement.className = "bg-white rounded-xl shadow-md overflow-hidden flex flex-col";
    listingElement.innerHTML = `
      ${listing.images && Array.isArray(listing.images) && listing.images.length > 0
        ? `<img src="${listing.images[0]}" alt="${listing.productName}" class="w-full h-64 object-cover">`
        : `<div class="w-full h-64 bg-gray-200 flex items-center justify-center">
           <p class="text-gray-500">No image available</p>
         </div>`
      }
      <div class="p-4 flex-1 flex flex-col">
        <h3 class="font-semibold text-lg text-gray-900">${listing.productName || 'Untitled'}</h3>
        <p class="text-xs text-gray-500 mt-1">${(listing.category || 'N/A')}${listing.garmentSize ? `, ${listing.garmentSize}` : ''}</p>
        <div class="mt-2 mb-4">
        ${listing.rentPrice
          ? `<span class="font-bold text-lg text-gray-900">₱${listing.rentPrice}</span>
             <span class="text-xs text-gray-500">/day</span>`
          : `<span class="text-xs text-gray-500">No rent price</span>`
        }
        </div>
        <button class="mt-auto bg-red-600 text-white w-full py-2 rounded-md hover:bg-blue-600 transition view-details-btn" data-listing-id="${listingId}">
        View Details
        </button>
      </div>
    `;

      listingsContainer.appendChild(listingElement);

      // Add click listener for 'View Details'
      const viewDetailsButton = listingElement.querySelector('.view-details-btn');
      viewDetailsButton.addEventListener('click', () => {
        window.location.href = `/src/buyer-side/view-listing-details.html?listingId=${listingId}`;
      });
    }
  } catch (error) {
    console.error('Error loading listings:', error);
    listingsContainer.innerHTML = `
      <p class="text-red-500 text-center">Failed to load listings. Please try again later.</p>
    `;
  }
}
document.addEventListener('DOMContentLoaded', loadListings);