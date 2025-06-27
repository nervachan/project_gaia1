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
console.log('[Firebase] Initialized app:', app.name || app.options.projectId);
const db = getFirestore(app);
const auth = getAuth(app);

// Utility to get listing data by listingId
async function getListingById(listingId) {
    const docRef = doc(db, 'listed_items', listingId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { doc: docSnap.ref, data: docSnap.data(), id: docSnap.id };
    }
    return null;
}

// Only run rental form logic if the form exists
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Event] DOMContentLoaded');
    // Scope: Only rental form
    const rentalFormSection = document.getElementById('rental-form-section');
    const rentalForm = document.getElementById('rental-form');
    if (!rentalFormSection || !rentalForm) return;

    const rentalPriceInput = document.getElementById('rental-price');
    const rentalStartDate = document.getElementById('rental-start-date');
    const rentalEndDate = document.getElementById('rental-end-date');
    const totalPriceElement = document.getElementById('rental-total');
    const userNameInput = document.getElementById('rental-name');

    // Get listingId from URL
    const urlParams = new URLSearchParams(window.location.search);
    const listingId = urlParams.get('listingId');
    let rentPrice = 0;
    let startDate = null;
    let endDate = null;

    // Fetch and display rent price using listingId
    async function fetchAndDisplayRentPrice() {
        if (!listingId) return;
        console.log('[Event] Fetching rent price for listingId:', listingId);
        const listing = await getListingById(listingId);
        if (listing && listing.data.rentPrice) {
            rentPrice = listing.data.rentPrice;
            if (rentalPriceInput) rentalPriceInput.value = `${rentPrice}/day`;
            console.log('[Event] Rent price fetched:', rentPrice);
        }
    }

    // Helper: Get all reserved dates for this listing
    async function getReservedDates(listingId) {
        console.log('[Event] Fetching reserved dates for listingId:', listingId);
        const reservedDates = [];
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
                if (typeof start === 'object' && start.seconds) start = new Date(start.seconds * 1000);
                else start = new Date(start);
                if (typeof end === 'object' && end.seconds) end = new Date(end.seconds * 1000);
                else end = new Date(end);
                let d = new Date(start);
                while (d <= end) {
                    reservedDates.push(d.toISOString().split('T')[0]);
                    d.setDate(d.getDate() + 1);
                }
            }
        });
        return reservedDates;
    }

    // Flatpickr initialization and total price calculation
    async function setupDatePickers() {
        if (!rentalStartDate || !rentalEndDate) return;
        const reservedDates = await getReservedDates(listingId);

        // Only initialize if not already initialized
        if (!rentalStartDate._flatpickr) {
            flatpickr(rentalStartDate, {
                dateFormat: "Y-m-d",
                disable: reservedDates,
                onChange: (selectedDates) => {
                    startDate = selectedDates[0];
                    calculateTotalPrice();
                    console.log('[Event] Start date selected:', startDate);
                }
            });
            console.log('[Event] rentalStartDate flatpickr initialized');
        }
        if (!rentalEndDate._flatpickr) {
            flatpickr(rentalEndDate, {
                dateFormat: "Y-m-d",
                disable: reservedDates,
                onChange: (selectedDates) => {
                    endDate = selectedDates[0];
                    calculateTotalPrice();
                    console.log('[Event] End date selected:', endDate);
                }
            });
            console.log('[Event] rentalEndDate flatpickr initialized');
        }
    }

    function calculateTotalPrice() {
        if (startDate && endDate && rentPrice) {
            const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            const total = days > 0 ? days * rentPrice : 0;
            if (totalPriceElement) totalPriceElement.value = `₱${total.toFixed(2)}`;
        } else if (totalPriceElement) {
            totalPriceElement.value = "₱0.00";
        }
    }

    // Rental button toggle functionality (handled in main page, but safe to keep)
    const rentButton = document.getElementById('rent-button');
    if (rentButton) {
        rentButton.addEventListener('click', () => {
            if (rentalFormSection) {
                rentalFormSection.classList.toggle('hidden');
                console.log('[Event] Rent button clicked. Form section toggled.');
            }
        });
    }

    // Rental form submission
    rentalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('[Event] Rental form submitted');

        // Validate required fields
        const userName = userNameInput ? userNameInput.value.trim() : '';
        const start = rentalStartDate ? rentalStartDate.value.trim() : '';
        const end = rentalEndDate ? rentalEndDate.value.trim() : '';
        const priceStr = rentalPriceInput ? rentalPriceInput.value.trim() : '';
        const totalStr = totalPriceElement ? totalPriceElement.value.trim() : '';

        if (!userName || !start || !end || !priceStr || !totalStr || !listingId) {
            alert('Please fill in all required fields.');
            console.log('[Error] Rental form validation failed');
            return;
        }

        // Get numeric values
        const rentPriceNum = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
        const totalPriceNum = parseFloat(totalStr.replace(/[^0-9.]/g, ''));

        // Get listing data by listingId
        const listing = await getListingById(listingId);
        if (!listing) {
            alert('Listing not found.');
            console.log('[Error] Listing not found for listingId:', listingId);
            return;
        }

        // Get image and sellerId
        const image = listing.data.images && listing.data.images.length > 0 ? listing.data.images[0] : '';
        const sellerId = listing.data.sellerId || '';
        if (!image || !sellerId) {
            alert('Listing data incomplete.');
            console.log('[Error] Listing data incomplete');
            return;
        }

        // Get logged-in user
        const user = auth.currentUser;
        if (!user) {
            alert('You must be logged in to rent an item.');
            console.log('[Error] User not logged in');
            return;
        }
        const userId = user.uid;

        // Prepare rental data
        const rentalData = {
            name: userName,
            startDate: start,
            endDate: end,
            finalPrice: totalPriceNum,
            rentPrice: rentPriceNum,
            image: image,
            status: 'for preparation',
            listingName: listing.data.productName || '',
            sellerId: sellerId,
            buyerId: userId,
            listingId: listing.id,
            createdAt: new Date()
        };

        try {
            // Add rental to Firestore
            await addDoc(collection(db, 'rentals'), rentalData);
            // Set listing as inactive
            await updateDoc(listing.doc, { isActive: false });
            alert('Rental submitted successfully!');
            console.log('[Success] Rental submitted:', rentalData);
            rentalForm.reset();
            if (totalPriceElement) totalPriceElement.value = "₱0.00";
        } catch (error) {
            console.error('Error submitting rental:', error);
            alert('Failed to submit rental.');
            console.log('[Error] Rental submission failed');
        }
    });

    // Initialize
    fetchAndDisplayRentPrice();
    setupDatePickers();
    console.log('[Event] Rent form logic initialized');
});

// Ensure the user is authenticated
onAuthStateChanged(auth, (user) => {
    if (!user) {
        console.warn('No user is logged in.');
        console.log('[Auth] No user logged in');
    } else {
        console.log('[Auth] User logged in:', user.uid);
    }
});
