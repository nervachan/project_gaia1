// Import the necessary Firebase functions
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { 
    getFirestore, doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc 
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
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

/* -------------------- 📅 DATE HELPERS -------------------- */

// Format JS Date → "MM-DD-YY"
function formatDateMMDDYY(date) {
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    return `${mm}-${dd}-${yy}`;
}

// Parse "MM-DD-YY" → JS Date
function parseDateMMDDYY(dateStr) {
    const [mm, dd, yy] = dateStr.split("-").map(v => parseInt(v, 10));
    return new Date(2000 + yy, mm - 1, dd);
}

/* -------------------- 🔍 FIRESTORE HELPERS -------------------- */

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

// Get reserved dates for flatpickr
async function getReservedDates(listingId) {
    const rentalsQuery = query(
        collection(db, "rentals"),
        where("listingId", "==", listingId)
    );
    const querySnapshot = await loader.withLoader(
        () => getDocs(rentalsQuery),
        "Loading reserved dates..."
    );

    const reservedDates = [];
    querySnapshot.forEach(docSnap => {
        const rental = docSnap.data();
        if (!rental.startDate || !rental.endDate) return;

        const start = parseDateMMDDYY(rental.startDate);
        const end = parseDateMMDDYY(rental.endDate);

        let cur = new Date(start);
        while (cur <= end) {
            reservedDates.push(formatDateMMDDYY(cur));
            cur.setDate(cur.getDate() + 1);
        }
    });

    return reservedDates;
}

/* -------------------- 📑 RENTAL FORM LOGIC -------------------- */

document.addEventListener('DOMContentLoaded', () => {
    console.log('[Event] DOMContentLoaded');
    const rentalFormSection = document.getElementById('rental-form-section');
    const rentalForm = document.getElementById('rental-form');
    if (!rentalFormSection || !rentalForm) return;

    const rentalPriceInput = document.getElementById('rental-price');
    const rentalStartDate = document.getElementById('rental-start-date');
    const rentalEndDate = document.getElementById('rental-end-date');
    const totalPriceElement = document.getElementById('rental-total');
    const userNameInput = document.getElementById('rental-name');
    const rentButton = document.getElementById('rent-button');

    const urlParams = new URLSearchParams(window.location.search);
    const listingId = urlParams.get('listingId');

    let rentPrice = 0;
    let startDate = null;
    let endDate = null;

    // Fetch and display rent price
    async function fetchAndDisplayRentPrice() {
        if (!listingId) return;
        await loader.withLoader(async () => {
            const listing = await getListingById(listingId);
            if (listing && listing.data.rentPrice) {
                rentPrice = listing.data.rentPrice;
                rentalPriceInput.value = `${rentPrice}/day`;
            }
        }, "Loading listing details...");
    }

    // Check if range overlaps reserved
    function rangeHasReserved(start, end, reservedDates) {
        let cur = new Date(start);
        while (cur <= end) {
            const curStr = formatDateMMDDYY(cur);
            if (reservedDates.includes(curStr)) return true;
            cur.setDate(cur.getDate() + 1);
        }
        return false;
    }

    // Setup flatpickr with reserved date blocking
    async function setupDatePickers() {
        const reservedDates = listingId ? await getReservedDates(listingId) : [];

        if (rentalStartDate._flatpickr) rentalStartDate._flatpickr.destroy();
        if (rentalEndDate._flatpickr) rentalEndDate._flatpickr.destroy();

        const disabled = reservedDates.map(d => parseDateMMDDYY(d));

        flatpickr(rentalStartDate, {
            dateFormat: "Y-m-d",
            disable: disabled,
            onChange: (selectedDates) => {
                startDate = selectedDates[0] || null;
                calculateTotalPrice();
            }
        });

        flatpickr(rentalEndDate, {
            dateFormat: "Y-m-d",
            disable: disabled,
            onChange: (selectedDates) => {
                endDate = selectedDates[0] || null;

                if (startDate && endDate) {
                    if (rangeHasReserved(startDate, endDate, reservedDates)) {
                        alert("❌ Selected range includes reserved dates. Please choose another.");
                        endDate = null;
                        rentalEndDate._flatpickr.clear();
                        calculateTotalPrice();
                        return;
                    }
                }
                calculateTotalPrice();
            }
        });
    }

    // Calculate total
    function calculateTotalPrice() {
        if (startDate && endDate && rentPrice) {
            const startOfDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            const endOfDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            const diffTime = endOfDay.getTime() - startOfDay.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            const days = diffDays >= 0 ? diffDays + 1 : 0;
            const total = days > 0 ? days * rentPrice : 0;
            totalPriceElement.value = `₱${total.toFixed(2)}`;
        } else {
            totalPriceElement.value = "₱0.00";
        }
    }

    // Toggle rental form
    if (rentButton) {
        rentButton.addEventListener('click', () => {
            rentalFormSection.classList.toggle('hidden');
        });
    }

    // Handle rental form submission
    rentalForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        await loader.withLoader(async () => {
            const userName = userNameInput.value.trim();
            const priceStr = rentalPriceInput.value.trim();
            const totalStr = totalPriceElement.value.trim();

            if (!userName || !startDate || !endDate || !priceStr || !totalStr || !listingId) {
                alert('⚠️ Please fill in all required fields.');
                return;
            }

            if (startDate > endDate) {
                alert('⚠️ Start date cannot be after end date.');
                return;
            }

            const rentPriceNum = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
            const totalPriceNum = parseFloat(totalStr.replace(/[^0-9.]/g, ''));

            const listing = await getListingById(listingId);
            if (!listing || !listing.data) {
                alert('⚠️ Listing not found.');
                return;
            }
            const image = listing.data.images?.[0] || '';
            const sellerId = listing.data.sellerId || '';

            const user = auth.currentUser;
            if (!user) {
                alert('⚠️ You must be logged in to rent.');
                return;
            }
            const userId = user.uid;

            // Final check for reserved dates
            const reservedDates = await getReservedDates(listingId);
            if (rangeHasReserved(startDate, endDate, reservedDates)) {
                alert("❌ These dates are no longer available. Try another range.");
                return;
            }

            const rentalData = {
                name: userName,
                startDate: formatDateMMDDYY(startDate),
                endDate: formatDateMMDDYY(endDate),
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
                await addDoc(collection(db, 'rentals'), rentalData);
                await updateDoc(listing.doc, { isActive: false });

                alert('✅ Rental submitted successfully!');
                rentalForm.reset();
                totalPriceElement.value = "₱0.00";
            } catch (error) {
                console.error('Error submitting rental:', error);
                alert('❌ Failed to submit rental.');
            }
        }, "Processing rental...");
    });

    // Initialize
    fetchAndDisplayRentPrice();
    setupDatePickers();
});

/* -------------------- 👤 AUTH WATCH -------------------- */

onAuthStateChanged(auth, (user) => {
    if (!user) {
        console.warn('No user is logged in.');
    } else {
        console.log('[Auth] User logged in:', user.uid);
    }
});
