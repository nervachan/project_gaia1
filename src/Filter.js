// Function to filter listings based on category
function filterListings(category) {
    const listings = document.querySelectorAll('#listing-container > div');

    listings.forEach(listing => {
        if (category === 'all' || listing.getAttribute('data-category') === category) {
            listing.style.display = 'block'; // Show listing
        } else {
            listing.style.display = 'none'; // Hide listing
        }
    });
}

// Event listeners for filter buttons
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', function() {
        const category = this.getAttribute('data-filter');
        filterListings(category);
    });
});















// document.addEventListener("DOMContentLoaded", () => {
//     const filterButtons = document.querySelectorAll(".filter-btn");
//     const items = document.querySelectorAll("#listing-container > div");

//     filterButtons.forEach((button) => {
//         button.addEventListener("click", () => {
//             const filter = button.getAttribute("data-filter");

//             items.forEach((item) => {
//                 const category = item.getAttribute("data-category");
//                 if (filter === "all" || category === filter) {
//                     item.style.display = "block";
//                 } else {
//                     item.style.display = "none";
//                 }
//             });
//         });
//     });
// });
