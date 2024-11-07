document.addEventListener('DOMContentLoaded', function () {
    const votingData = [
        {
            id: 1,
            title: "Artiste Of The Year",
            imageUrl: "/assets/img/award.png",
            voteCost: "₵1 PER VOTE",
            nomineeCount: 25,
            link: "/competitions/ema-awards/artiste-of-the-year/"
        },
        {
            id: 2,
            title: "Best New Artiste",
            imageUrl: "/assets/img/award.png",
            voteCost: "₵2 PER VOTE",
            nomineeCount: 30,
            link: "/competitions/ema-awards/best-new-artiste/"
        },
        {
            id: 2,
            title: "Best New Artiste",
            imageUrl: "/assets/img/award.png",
            voteCost: "₵2 PER VOTE",
            nomineeCount: 30,
            link: "/competitions/ema-awards/best-new-artiste/"
        },
        {
            id: 1,
            title: "Artiste Of The Year",
            imageUrl: "/assets/img/award.png",
            voteCost: "₵1 PER VOTE",
            nomineeCount: 25,
            link: "/competitions/ema-awards/artiste-of-the-year/"
        },
        {
            id: 2,
            title: "Best New Artiste",
            imageUrl: "/assets/img/award.png",
            voteCost: "₵2 PER VOTE",
            nomineeCount: 30,
            link: "/competitions/ema-awards/best-new-artiste/"
        },
        {
            id: 2,
            title: "Best New Artiste",
            imageUrl: "/assets/img/award.png",
            voteCost: "₵2 PER VOTE",
            nomineeCount: 30,
            link: "/competitions/ema-awards/best-new-artiste/"
        },
        // You can add more competition items here
    ];

    const votingGrid = document.getElementById('voting-grid');

    votingData.forEach(item => {
        // Create voting card elements
        const colDiv = document.createElement('div');
        colDiv.className = "col-xl-3 col-lg-3 col-md-5";

        colDiv.innerHTML = `
            <div class="votingGrid shadow-sm">
                <div class="votingThumb">
                    <img src="${item.imageUrl}" class="img-fluid" alt="${item.title}" />
                </div>
                <div class="votingDetail">
                    <div class="detailHead">
                        <h4 class="votingTitle">${item.title}</h4>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <h4 style="width: fit-content; font-size: 12px; background-color: #6864ED; color: white; padding: 10px; border-radius: 10px;">
                            ${item.voteCost}
                        </h4>
                        <h4 style="width: fit-content; font-size: 12px; background-color: #212529; color: white; padding: 10px; border-radius: 10px;">
                            ${item.nomineeCount} NOMINEES
                        </h4>
                    </div>
                    <div class="votingButton">
                        <a href="${item.link}" class="btn voting-btn">View Nominees</a>
                    </div>
                </div>
            </div>
        `;

        votingGrid.appendChild(colDiv);
    });
});
