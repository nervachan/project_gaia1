// Import the necessary Firebase functions
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { loader } from './loader.js';

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
    const docSnap = await loader.withLoader(
        () => getDoc(docRef),
        "Loading listing data..."
    );
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
        await loader.withLoader(async () => {
            const listing = await getListingById(listingId);
            if (listing && listing.data.rentPrice) {
                rentPrice = listing.data.rentPrice;
                if (rentalPriceInput) rentalPriceInput.value = `${rentPrice}/day`;
                console.log('[Event] Rent price fetched:', rentPrice);
            }
        }, "Loading listing details...");
    }

    // Helper: Get all reserved dates for this listing
    async function getReservedDates(listingId) {
        console.log('[Event] Fetching reserved dates for listingId:', listingId);
        const reservedDates = [];
        const rentalsQuery = query(
            collection(db, 'rentals'),
            where('listingId', '==', listingId)
        );
        const querySnapshot = await loader.withLoader(
            () => getDocs(rentalsQuery),
            "Loading reserved dates..."
        );
        querySnapshot.forEach(docSnap => {
            const rental = docSnap.data();
            let start = rental.startDate;
            let end = rental.endDate;
            if (start && end) {
                let startStr, endStr;

                // Handle both new string format and old Timestamp format for backward compatibility.
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
                        reservedDates.push(flatpickr.formatDate(currentDate, "Y-m-d"));
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                }
            }
        });
        return reservedDates;
    }

    // Flatpickr initialization and total price calculation
    async function setupDatePickers() {
        // Fetch reserved dates before initializing pickers
        const reservedDates = listingId ? await getReservedDates(listingId) : [];
        console.log('[Function] setupDatePickers called with reserved dates:', reservedDates);

        // Destroy existing flatpickr instances to ensure a clean refresh
        if (rentalStartDate._flatpickr) {
            rentalStartDate._flatpickr.destroy();
        }
        if (rentalEndDate._flatpickr) {
            rentalEndDate._flatpickr.destroy();
        }

        const options = {
            dateFormat: "Y-m-d",
            disable: reservedDates,
        };

        // Helper to check if any reserved date is within selected range
        function hasReservedInRange(start, end) {
            if (!start || !end) return false;
            const startStr = flatpickr.formatDate(start, "Y-m-d");
            const endStr = flatpickr.formatDate(end, "Y-m-d");
            const startDateObj = flatpickr.parseDate(startStr, "Y-m-d");
            const endDateObj = flatpickr.parseDate(endStr, "Y-m-d");
            for (const reserved of reservedDates) {
                const reservedDateObj = flatpickr.parseDate(reserved, "Y-m-d");
                if (reservedDateObj >= startDateObj && reservedDateObj <= endDateObj) {
                    return true;
                }
            }
            return false;
        }

        flatpickr(rentalStartDate, {
            ...options,
            onChange: (selectedDates) => {
                startDate = selectedDates[0];
                // If both dates selected, validate range
                if (startDate && endDate) {
                    if (hasReservedInRange(startDate, endDate)) {
                        alert('Selected date range includes a reserved date. Please choose another range.');
                        startDate = null;
                        rentalStartDate._flatpickr.clear();
                        calculateTotalPrice();
                        return;
                    }
                }
                calculateTotalPrice();
                console.log('[Event] Start date selected:', startDate);
            }
        });

        flatpickr(rentalEndDate, {
            ...options,
            onChange: (selectedDates) => {
                endDate = selectedDates[0];
                // If both dates selected, validate range
                if (startDate && endDate) {
                    if (hasReservedInRange(startDate, endDate)) {
                        alert('Selected date range includes a reserved date. Please choose another range.');
                        endDate = null;
                        rentalEndDate._flatpickr.clear();
                        calculateTotalPrice();
                        return;
                    }
                }
                calculateTotalPrice();
                console.log('[Event] End date selected:', endDate);
            }
        });

        console.log('[Event] Date pickers re-initialized');
    }

    function calculateTotalPrice() {
        if (startDate && endDate && rentPrice) {
            // Normalize dates to midnight local time to count full days
            const startOfDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            const endOfDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            const diffTime = endOfDay.getTime() - startOfDay.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            const days = diffDays >= 0 ? diffDays + 1 : 0;
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

        await loader.withLoader(async () => {
            // Validate required fields
            const userName = userNameInput ? userNameInput.value.trim() : '';
            const priceStr = rentalPriceInput ? rentalPriceInput.value.trim() : '';
            const totalStr = totalPriceElement ? totalPriceElement.value.trim() : '';

            if (!userName || !startDate || !endDate || !priceStr || !totalStr || !listingId) {
                alert('Please fill in all required fields, including start and end dates.');
                console.log('[Error] Rental form validation failed');
                return;
            }

            // Validate that start date is not after end date
            if (startDate > endDate) {
                alert('Start date cannot be after the end date.');
                console.log('[Error] Start date is after end date');
                return;
            }

            // Get numeric values
            const rentPriceNum = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
            const totalPriceNum = parseFloat(totalStr.replace(/[^0-9.]/g, ''));

            const listing = await getListingById(listingId);
            if (!listing || !listing.data) {
                alert('Listing not found or data is missing.');
                return;
            }
            const image = listing.data.images && listing.data.images.length > 0 ? listing.data.images[0] : '';
            const sellerId = listing.data.sellerId || '';

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
                // Format dates as 'YYYY-MM-DD' strings for timezone-agnostic storage.
                startDate: flatpickr.formatDate(startDate, "Y-m-d"),
                endDate: flatpickr.formatDate(endDate, "Y-m-d"),
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
        }, "Processing rental...");
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
