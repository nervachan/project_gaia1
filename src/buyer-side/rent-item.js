// Import the necessary Firebase functions
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC7eaM6HrHalV-wcG-I9_RZJRwDNhin2R0",
    authDomain: "project-gaia1.firebaseapp.com",
    projectId: "project-gaia1",
    storageBucket: "project-gaia1.appspot.com",
    messagingSenderId: "832122601643",
    appId: "1:832122601643:web:1ab91b347704174f52b7ee",
    measurementId: "G-DX2L33NH4H"
};

// Initialize Firebase only if no apps are already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

// Fetch and display listings
document.addEventListener('DOMContentLoaded', async () => {
    const listingsContainer = document.getElementById('listings-container');
    if (!listingsContainer) {
        console.error('Listings container with id "listings-container" not found.');
        return;
    }

    try {
        const querySnapshot = await getDocs(collection(db, 'listed_items'));

        // Loop through the documents and add them to the page
        querySnapshot.forEach((doc) => {
            const listing = doc.data();
            const listingId = doc.id; // Get the unique ID of the listing
            const listingElement = document.createElement('div');
            listingElement.classList.add('bg-white', 'p-4', 'rounded-lg', 'shadow-lg');

            // Check if the "images" field exists and is an array
            let image = '';
            if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
                image = `<img src="${listing.images[0]}" alt="${listing.productName}" class="w-full h-48 object-cover rounded-md">`;
            } else {
                image = `<div class="w-full h-48 bg-gray-200 flex items-center justify-center rounded-md">
                            <p class="text-gray-500">No image available</p>
                         </div>`;
            }

            listingElement.innerHTML = `
                ${image}
                <h3 class="text-xl font-semibold text-gray-900 mt-4">${listing.productName}</h3>
                <p class="text-gray-700 mt-2">Category: ${listing.category || 'N/A'}</p>
                ${listing.rentPrice ? `<p class="text-gray-700 mt-2">Rent Price: ${listing.rentPrice}/day</p>` : ''}
                <button id="rent-button" data-listing-id="${listingId}" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Rent</button>
            `;

            listingsContainer.appendChild(listingElement);
        });
    } catch (error) {
        console.error('Error fetching listings:', error);
    }
});

// Add event listener for the Rent button
document.addEventListener('click', async (event) => {
    if (event.target && event.target.id === 'rent-button') {
        const rentModal = document.getElementById('rentModal');
        const listingModal = document.getElementById('listing-modal');

        // Get the listing name from the "View Details" modal
        const listingNameElement = document.getElementById('modal-title');
        if (!listingNameElement) {
            console.error('Listing name element with id "modal-title" not found.');
            return;
        }

        const listingName = listingNameElement.innerText.trim();
        if (!listingName) {
            console.error('Listing name not found in the modal.');
            return;
        }

        try {
            // Query the "listed_items" collection for the document with the matching productName
            const q = query(collection(db, 'listed_items'), where('productName', '==', listingName));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const listingData = querySnapshot.docs[0].data();
                const rentPrice = listingData.rentPrice;

                if (rentPrice) {
                    console.log(`Rent Price for listing "${listingName}": ${rentPrice}/day`);
                    const rentPriceInput = document.getElementById('rentalPrice');
                    if (rentPriceInput) {
                        rentPriceInput.value = `${rentPrice}/day`;
                    }

                    // Initialize Flatpickr for start and end dates
                    const rentalStartDate = document.getElementById('rentalStartDate');
                    const rentalEndDate = document.getElementById('rentalEndDate');
                    const totalPriceElement = document.getElementById('totalPrice');

                    let startDate = null;
                    let endDate = null;

                    flatpickr(rentalStartDate, {
                        dateFormat: "Y-m-d",
                        onChange: (selectedDates) => {
                            startDate = selectedDates[0];
                            calculateTotalPrice();
                        },
                    });

                    flatpickr(rentalEndDate, {
                        dateFormat: "Y-m-d",
                        onChange: (selectedDates) => {
                            endDate = selectedDates[0];
                            calculateTotalPrice();
                        },
                    });

                    function calculateTotalPrice() {
                        if (startDate && endDate) {
                            const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                            if (days > 0) {
                                const totalPrice = days * rentPrice;
                                totalPriceElement.innerText = `₱${totalPrice.toFixed(2)}`;
                            } else {
                                totalPriceElement.innerText = "₱0.00";
                            }
                        }
                    }
                } else {
                    console.error(`Rent price not found for listing "${listingName}".`);
                }
            } else {
                console.error(`No listing found with the name "${listingName}".`);
            }
        } catch (error) {
            console.error('Error fetching listing data:', error);
        }

        if (rentModal) {
            rentModal.classList.remove('hidden'); // Show the rent modal
        }

        if (listingModal) {
            listingModal.classList.add('hidden'); // Close the listing modal
        }
    }
});

// Add event listener for the Close button in the Rent modal
document.addEventListener('DOMContentLoaded', () => {
    const closeRentButton = document.getElementById('close-rent');
    if (closeRentButton) {
        closeRentButton.addEventListener('click', () => {
            const rentModal = document.getElementById('rentModal');
            if (rentModal) {
                rentModal.classList.add('hidden'); // Hide the rent modal
            }
        });
    } else {
        console.error('Close button with id "close-rent" not found.');
    }

    // Add event listener for the "Submit Rental" button
    const submitRentalButton = document.getElementById('rent-item-btn');
    if (submitRentalButton) {
        submitRentalButton.addEventListener('click', async (event) => {
            event.preventDefault(); // Prevent form submission

            // Get the required input values
            const userName = document.getElementById('userName').value.trim();
            const rentalStartDate = document.getElementById('rentalStartDate').value.trim();
            const rentalEndDate = document.getElementById('rentalEndDate').value.trim();
            const rentPriceInput = document.getElementById('rentalPrice').value.trim();
            const totalPriceElement = document.getElementById('totalPrice').innerText.trim();

            if (!userName || !rentalStartDate || !rentalEndDate || !rentPriceInput || !totalPriceElement) {
                alert('Please fill in all required fields.');
                return;
            }

            // Extract the numeric value from the rent price
            const rentPrice = parseFloat(rentPriceInput.replace(/[^0-9.]/g, ''));
            const totalPrice = parseFloat(totalPriceElement.replace(/[^0-9.]/g, ''));

            // Get the listing name from the "View Details" modal
            const listingNameElement = document.getElementById('modal-title');
            if (!listingNameElement) {
                console.error('Listing name element with id "modal-title" not found.');
                return;
            }

            const listingName = listingNameElement.innerText.trim();
            if (!listingName) {
                console.error('Listing name not found in the modal.');
                return;
            }

            try {
                // Query the "listed_items" collection for the document with the matching productName
                const q = query(collection(db, 'listed_items'), where('productName', '==', listingName));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const listingDoc = querySnapshot.docs[0];
                    const listingData = listingDoc.data();

                    // Get the first image from the listing
                    const image = listingData.images && listingData.images.length > 0 ? listingData.images[0] : null;

                    if (!image) {
                        console.error('No image found for the listing.');
                        return;
                    }

                    // Get the sellerId from the listing
                    const sellerId = listingData.sellerId;
                    if (!sellerId) {
                        console.error('Seller ID not found for the listing.');
                        return;
                    }

                    // Get the logged-in user's UID
                    const user = auth.currentUser;
                    if (!user) {
                        alert('You must be logged in to rent an item.');
                        return;
                    }
                    const userId = user.uid;

                    const rentalData = {
                        name: userName,
                        startDate: rentalStartDate,
                        endDate: rentalEndDate,
                        finalPrice: totalPrice,
                        rentPrice: rentPrice,
                        image: image,
                        status: 'for preparation',
                        listingName: listingName,
                        sellerId: sellerId,
                        buyerId: userId,
                        listingId: listingDoc.id,
                        createdAt: new Date() 
                    };

                    // Push the rental data to the "rentals" collection
                    await addDoc(collection(db, 'rentals'), rentalData);

                    // Update the "isActive" field of the listing to false
                    const listingDocRef = listingDoc.ref; // Reference to the listing document
                    await updateDoc(listingDocRef, { isActive: false });

                    alert('Rental submitted successfully!');
                    
                    const rentModal = document.getElementById('rentModal');
                    if (rentModal) {
                        rentModal.classList.add('hidden'); // Hide the rent modal
                    }
                } else {
                    console.error(`No listing found with the name "${listingName}".`);
                }
            } catch (error) {
                console.error('Error submitting rental:', error);
            }
        });
    } else {
        console.error('Submit Rental button with id "rent-item-btn" not found.');
    }
});

// Ensure the user is authenticated
onAuthStateChanged(auth, (user) => {
    if (!user) {
        console.warn('No user is logged in.');
    }
});
