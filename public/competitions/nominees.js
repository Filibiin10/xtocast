// Get the category ID from URL parameters
function getCategoryId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Fetch nominees from the API based on category ID
async function fetchNominees(categoryId) {
    try {
        const response = await fetch(`/api/nominee/${categoryId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json(); // JSON array of nominees
    } catch (error) {
        console.error('Error fetching nominees:', error);
        return [];
    }
}

// Fetch events and category data
async function fetchEvents() {
    try {
        const response = await fetch('/api/events');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json(); // JSON array of events
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
}

async function fetchCategory(categoryId) {
    try {
        const response = await fetch(`/api/categories/${categoryId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json(); // Single category object
    } catch (error) {
        console.error('Error fetching category:', error);
        return null;
    }
}

// Render nominees in the DOM
function renderNominees(nominees, events, category) {
    const nomineesContainer = document.getElementById('nomineesContainer');
    const titleNominee = document.getElementById('titleNominee');
    nomineesContainer.innerHTML = ''; // Clear previous content

    nominees.forEach(nominee => {
        const event = events.find(event => event.id === nominee.event_id); // Match event for nominee
        const nomineeHTML = createNomineeCard(nominee, event);
        nomineesContainer.insertAdjacentHTML('beforeend', nomineeHTML);
    });

    if (category) {
        titleNominee.textContent = `${category.name} - Nominees`; // Update title with category name
    }
}

// Create HTML structure for a nominee card
function createNomineeCard(nominee, event) {
    return `
        <div class="col-xl-3 col-lg-3 col-md-5">
            <div class="votingGrid shadow-sm">
                <div class="votingThumb">
                    <img src="${nominee.image_url}" class="img-fluid" alt="${nominee.name}" />
                </div>
                <div class="votingDetail">
                    <div class="detailHead">
                        <h6 class="votingTitle" style="font-size: 18px; text-align: center;">${nominee.name}</h6>
                    </div>
                    <div style="display: flex; justify-content: center">
                        <h6>${nominee.nominee_code}</h6>
                    </div>
                    <div class="votingButton">
                        <a href="vote.html?nomineeId=${nominee.id}" class="btn voting-btn">Vote</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Filter nominees by search input
function filterNominees(searchTerm, nominees, events, category) {
    const filteredNominees = nominees.filter(nominee =>
        nominee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    renderNominees(filteredNominees, events, category);
}

// Initialize nominees display and search functionality
async function initNominees() {
    const categoryId = getCategoryId();
    const [nominees, events, category] = await Promise.all([
        fetchNominees(categoryId),
        fetchEvents(),
        fetchCategory(categoryId)
    ]);

    renderNominees(nominees, events, category);

    // Set up search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => {
        filterNominees(searchInput.value, nominees, events, category);
    });
}

// Execute when the page loads
document.addEventListener('DOMContentLoaded', initNominees);
