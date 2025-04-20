// Import the necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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

// Function to show the modal with listing details
async function showListingDetails(listingId) {
    const modal = document.getElementById('listing-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');

    try {
        // Fetch the document from Firestore
        const listingDoc = doc(db, 'listed_items', listingId);
        const listingSnapshot = await getDoc(listingDoc);

        if (listingSnapshot.exists()) {
            const listing = listingSnapshot.data();
            modalTitle.innerText = listing.productName;

            // Handle images
            let imagesHtml = '';
            if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
                if (listing.images.length === 1) {
                    // Single image
                    imagesHtml = `
                        <div class="w-full h-64 overflow-hidden rounded-md">
                            <img src="${listing.images[0]}" alt="${listing.productName}" class="w-full h-full object-contain">
                        </div>
                    `;
                } else {
                    // Carousel for multiple images
                    imagesHtml = `
                        <div class="relative w-full h-64 overflow-hidden rounded-md">
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
                // Fallback if no images are available
                imagesHtml = `
                    <div class="w-full h-64 bg-gray-200 flex items-center justify-center rounded-md">
                        <p class="text-gray-500">No image available</p>
                    </div>
                `;
            }

            // Fetch the shop address using the sellerId
            let shopAddressHtml = '';
            if (listing.sellerId) {
                const sellerDoc = doc(db, 'user_seller', listing.sellerId);
                const sellerSnapshot = await getDoc(sellerDoc);

                if (sellerSnapshot.exists()) {
                    const sellerData = sellerSnapshot.data();
                    const shopAddress = sellerData.shopaddress || 'No shop address available';

                    shopAddressHtml = `
                        <p><strong>Shop Address:</strong> ${shopAddress}</p>
                        <button class="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600" onclick="redirectToGoogleMaps('${shopAddress}')">
                            View on Google Maps
                        </button>
                    `;
                } else {
                    shopAddressHtml = '<p class="text-red-500">Shop address not found.</p>';
                }
            }

            // Populate modal content
            modalContent.innerHTML = `
                ${imagesHtml}
                <p class="mt-4">${listing.productDescription || 'No description available.'}</p>
                <p><strong>Category:</strong> ${listing.category || 'N/A'}</p>
                <p><strong>Condition:</strong> ${listing.condition || 'N/A'}</p>
                ${listing.rentPrice ? `<p><strong>Rent Price:</strong> $${listing.rentPrice}</p>` : ''}
                ${listing.sellPrice ? `<p><strong>Selling Price:</strong> $${listing.sellPrice}</p>` : ''}
                ${shopAddressHtml}
            `;

            // Initialize carousel functionality if there are multiple images
            if (listing.images && listing.images.length > 1) {
                const carousel = document.getElementById('carousel-images');
                const items = carousel.querySelectorAll('.carousel-item');
                let currentIndex = 0;

                document.getElementById('next-image').addEventListener('click', () => {
                    items[currentIndex].classList.add('hidden');
                    currentIndex = (currentIndex + 1) % items.length;
                    items[currentIndex].classList.remove('hidden');
                });

                document.getElementById('prev-image').addEventListener('click', () => {
                    items[currentIndex].classList.add('hidden');
                    currentIndex = (currentIndex - 1 + items.length) % items.length;
                    items[currentIndex].classList.remove('hidden');
                });
            }

            modal.classList.remove('hidden'); // Show the modal
        } else {
            console.error("No listing found with the provided ID.");
        }
    } catch (error) {
        console.error("Error fetching listing details: ", error);
    }
}

// Function to redirect to Google Maps with the shop address
function redirectToGoogleMaps(shopAddress) {
    const encodedAddress = encodeURIComponent(shopAddress);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(googleMapsUrl, '_blank');
}

// Add event listeners to all view details buttons
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('view-details')) {
        const listingId = event.target.getAttribute('data-id');
        showListingDetails(listingId); // Show the modal with listing details
    }
});

// Close modal functionality
document.getElementById('close-modal').addEventListener('click', () => {
    const modal = document.getElementById('listing-modal');
    modal.classList.add('hidden'); // Hide the modal
});