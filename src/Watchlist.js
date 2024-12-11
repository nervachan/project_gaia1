document.addEventListener("DOMContentLoaded", () => {
    const addToWatchlistButtons = document.querySelectorAll(".add-to-watchlist");

    addToWatchlistButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const item = button.getAttribute("data-item");
            const image = button.getAttribute("data-image");

            // Retrieve existing watchlist from localStorage
            const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

            // Check if the item already exists in the watchlist
            if (!watchlist.some((entry) => entry.name === item)) {
                watchlist.push({ name: item, image: image });
                localStorage.setItem("watchlist", JSON.stringify(watchlist));

                alert(`${item} added to your watchlist!`);
                renderWatchlist(); // Re-render the watchlist to include the new item
            } else {
                alert(`${item} is already in your watchlist!`);
            }
        });
    });

    // Render the watchlist on page load
    renderWatchlist();
});
function renderWatchlist() {
    const watchlistElement = document.getElementById("watchlist");

    if (watchlistElement) {
        const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

        watchlistElement.innerHTML = watchlist
            .map(
                (item, index) => `
                <div class="watchlist-item border p-4 rounded flex flex-col items-center space-y-2">
                    <img src="${item.image}" alt="${item.name}" class="w-32 h-32 object-cover rounded">
                    <p>${item.name}</p>
                    <button 
                        class="remove-from-watchlist bg-red-500 text-white py-1 px-4 rounded hover:bg-red-600"
                        data-index="${index}">
                        Remove
                    </button>
                </div>
            `
            )
            .join("");

        // Add event listeners for the remove buttons
        const removeButtons = document.querySelectorAll(".remove-from-watchlist");
        removeButtons.forEach((button) => {
            button.addEventListener("click", (e) => {
                const index = e.target.getAttribute("data-index");
                removeFromWatchlist(index);
            });
        });
    }
}
function removeFromWatchlist(index) {
    const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

    // Remove the item at the specified index
    watchlist.splice(index, 1);

    // Update localStorage and re-render the watchlist
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    renderWatchlist();
}
