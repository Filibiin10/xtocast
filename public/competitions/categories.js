async function fetchCategories(eventId) {
  try {
      // Fetch event details
      const eventResponse = await fetch(`/api/events/${eventId}`);
      const eventData = await eventResponse.json();
      const vote = eventData.vote_cost;
      const name = eventData.name;

      // Fetch categories and nominees
      const categoryResponse = await fetch(`/api/eventid/${eventId}`);
      const categoryData = await categoryResponse.json();
      const catId = categoryData.id;

      const nomineeResponse = await fetch(`/api/nominees`);
      const nomiData = await nomineeResponse.json();

      // Filter categories by event ID
      const response = await fetch(`/api/categories?eventId=${eventId}`);
      const categories = await response.json();
      const filteredCategories = categories.filter(cat => cat.event_id === eventId);

      // Prepare categories with nominee counts
      const categoriesWithTotalNominees = filteredCategories.map(category => {
          const filteredNominees = nomiData.filter(nominee => nominee.category_id === category.id);
          return {
              id: category.id,
              title: category.name,
              nomineeCount: filteredNominees.length,
              image_url: category.image_url,
          };
      });

      displayCategories(categoriesWithTotalNominees, vote, name);
  } catch (error) {
      console.error("Error fetching categories:", error);
  }
}

function displayCategories(categories, vote, eventName) {
  const container = document.getElementById('categoriesContainer');
  const eventname = document.getElementById('eventname');

  eventname.textContent = `${eventName} - Categories`;
  container.innerHTML = ""; // Clear previous content

  categories.forEach(category => {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = "col-xl-3 col-lg-4 col-md-6 mt-4";
      categoryDiv.innerHTML = `
          <div class="votingGrid shadow-sm">
              <div class="votingThumb">
                  <img src="${category.image_url}" class="img-fluid" alt="${category.title}">
              </div>
              <div class="votingDetail">
                  <div class="detailHead">
                      <h6 class="votingTitle" style="font-size: 18px;">${category.title}</h6>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; gap: 8px;">
                      <h4 style="width: fit-content; font-size: 10px; background-color: #6864ED; color: white; padding: 8px 12px; border-radius: 8px;">
                          ₵${vote} PER VOTE
                      </h4>
                      <h4 style="width: fit-content; font-size: 10px; background-color: #212529; color: white; padding: 8px 12px; border-radius: 8px;">
                          ${category.nomineeCount} NOMINEES
                      </h4>
                  </div>
                  <a href="nominees.html?id=${category.id}" class="btn" style="background-color: #01455D; color: white; margin-top: 10px; display: block; text-align: center; width: 100%; padding: 12px; border-radius: 8px;">
                      View Nominees
                  </a>
              </div>
          </div>
      `;
      container.appendChild(categoryDiv);
  });
}

// Search categories by title
function searchCategories(event) {
  const searchTerm = event.target.value.toLowerCase();
  const categories = document.querySelectorAll("#categoriesContainer .col-xl-3");

  categories.forEach(category => {
      const title = category.querySelector(".votingTitle").textContent.toLowerCase();
      category.style.display = title.includes(searchTerm) ? "block" : "none";
  });
}

// Function to get URL parameters
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return { id: params.get("id") };
}

// Initialize and add event listeners
document.addEventListener("DOMContentLoaded", () => {
  const { id } = getQueryParams();
  if (id) {
      fetchCategories(id);
  } else {
      console.error("No event ID found in the URL");
  }

  // Add search event listener
  const searchInput = document.getElementById("categorySearch");
  searchInput.addEventListener("input", searchCategories);
});
