async function fetchCategories(eventId) {
    try {
        const response = await fetch(`http://localhost:7000/api/categories?eventId=${eventId}`); // Update API URL as needed
        const categories = await response.json();
        
        // Get the container for the category list
        const categoriesList = document.getElementById('categories-list');
        
        // Clear the container before inserting
        categoriesList.innerHTML = '';
        
        // Display the event name in the title
        const eventTitle = document.getElementById('event-title');
        eventTitle.textContent = `Categories for Event ID: ${eventId}`; // You might want to fetch the event name too

        // Loop through categories and create HTML for each one
        categories.forEach(category => {
            const categoryHTML = `
                <div class="col-xl-4 col-lg-4 col-md-6">
                    <div class="votingGrid shadow-sm">
                        <div class="votingThumb">
                            <img src="${category.image_url}" class="img-fluid" alt="${category.name}">
                        </div>
                        <div class="votingDetail">
                            <div class="detailHead">
                                <h4 class="votingTitle">${category.name}</h4>
                            </div>
                            <div class="votingButton">
                                <a href="/competitions/nominees.html?id=${category.id}" class="btn voting-btn">View Nominees</a>
                            </div>
                        </div>
                    </div>
                </div>`;
            
            // Append each category to the categories list
            categoriesList.insertAdjacentHTML('beforeend', categoryHTML);
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

// Function to get the URL parameters
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        id: params.get('id')
    };
}

// Call fetchCategories when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const { id } = getQueryParams();
    if (id) {
        fetchCategories(id);
    } else {
        console.error('No event ID found in the URL');
    }
});
