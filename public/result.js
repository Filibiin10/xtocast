document.addEventListener('DOMContentLoaded', () => {
    const eventSelect = document.getElementById('eventSelect');
    const categorySelect = document.getElementById('categorySelect');
    const resultsTable = document.querySelector('#resultsTable tbody');
    const noCategoriesText = document.getElementById('noCategories');

    let events = [];
    let categories = [];
    let nominees = [];
    let voteData = [];

    categorySelect.style.display = 'none';

    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    }

    async function loadEvents() {
        const data = await fetchData('/api/events');
        if (data) {
            events = data;
            eventSelect.innerHTML = '<option value="">*Select Event*</option>';
            events.forEach(event => {
                eventSelect.innerHTML += `<option value="${event.id}">${event.name}</option>`;
            });
        }
    }

    console.log(events)

    async function loadCategories(eventId) {
        const data = await fetchData(`/api/category/${eventId}/`);
        
        if (data && data.length > 0) {
            categories = data;
            categorySelect.innerHTML = '<option value="">*Select Category*</option>';
            categories.forEach(category => {
                categorySelect.innerHTML += `<option value="${category.id}">${category.name}</option>`;
            });
            categorySelect.style.display = 'block';
            noCategoriesText.style.display = 'none';
        } else {
            categorySelect.style.display = 'none';
            noCategoriesText.style.display = 'block';
        }
    }

    async function loadNominees() {
        const data = await fetchData('/api/nominees');
        if (data) {
            nominees = data;
        }
    }

    async function loadVotes() {
        const data = await fetchData('/api/votes');
        if (data) {
            voteData = data;
        }
    }

    function updateTable() {
        const selectedCategory = parseInt(categorySelect.value, 10);
        const categoryNominees = nominees.filter(nominee => nominee.category_id === selectedCategory);

        // const nomineeVotes = categoryNominees.map(nominee => {
        //     const nomineeVote = voteData.find(vote => vote.nominee_id === nominee.id);
        //     return {
        //         ...nominee,
        //         votes: nomineeVote ? nomineeVote.number_of_votes : 0,
        //     };
        // });
        const nomineeVotes = categoryNominees.map(nominee => {
            // Filter and sum up votes for the nominee
            const nomineeVotesList = voteData.filter(vote => vote.nominee_id === nominee.id);
            const numVotes = nomineeVotesList.reduce((sum, vote) => sum + vote.number_of_votes, 0);
        
            return {
                ...nominee,
                votes: numVotes,
            };
        });
        

        // Sort the nominees based on votes (in descending order)
        nomineeVotes.sort((a, b) => b.votes - a.votes);

        resultsTable.innerHTML = '';

        if (nomineeVotes.length > 0) {
            nomineeVotes.forEach((nominee, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>  <!-- Rank -->
                    <td>${nominee.name}</td>
                    <td>${nominee.votes}</td>
                `;
                resultsTable.appendChild(row);
            });
        }
    }

    eventSelect.addEventListener('change', async () => {
        const selectedEvent = eventSelect.value;
        if (selectedEvent) {
            await loadCategories(selectedEvent);
            await loadNominees();
            categorySelect.value = '';
            resultsTable.innerHTML = '';
        } else {
            categorySelect.style.display = 'none';
            noCategoriesText.style.display = 'none';
        }
    });

    categorySelect.addEventListener('change', async () => {
        const selectedCategory = categorySelect.value;
        if (selectedCategory) {
            await loadVotes();
            updateTable();
        }
    });

    loadEvents();
});
