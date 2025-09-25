document.querySelectorAll('.filter-btn').forEach(button => {
  button.addEventListener('click', () => {
    const category = button.getAttribute('data-category');
    const listingsContainer = document.getElementById('listing-container');
    const allCards = listingsContainer.querySelectorAll('div.bg-white');

    let found = false;

    // Expanded mapping for gender and children filters
    const genderMap = {
      'male': ['for men', 'for male'],
      'female': ['for women', 'for female'],
      'children-male': ['children (male)', 'for boys', 'boys', 'child male', 'children male'],
      'children-female': ['children (female)', 'for girls', 'girls', 'child female', 'children female']
    };

    allCards.forEach(card => {
      // Find the category text in the card
      let categoryElem = card.querySelector('p.text-gray-600.mb-1');
      if (!categoryElem) {
        categoryElem = card.querySelector('p.text-gray-700.mt-2');
      }
      const categoryText = categoryElem ? categoryElem.textContent.toLowerCase() : '';

      let show = false;
      if (category === 'all') {
        show = true;
      } else if (genderMap[category]) {
        // If filtering by gender/children, match any mapped keyword
        show = genderMap[category].some(keyword => categoryText.includes(keyword));
      } else {
        // Otherwise, match the category directly
        show = categoryText.includes(category.toLowerCase());
      }

      if (show) {
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
