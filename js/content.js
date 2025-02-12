document.addEventListener("DOMContentLoaded", async () => 
{
        // Create search input
    const searchElement = document.querySelector(".content-search");

    const searchInput = document.createElement("input");
    searchInput.setAttribute("type", "text");
    searchInput.setAttribute("placeholder", "Search...");
    searchInput.classList.add("search-box");

    searchElement.appendChild(searchInput);

    // Content
    const pageName = location.pathname.split("/").pop().replace(".html", "") || "index";
    const contentElement = document.querySelector(".content-grid");

    try 
    {
        const response = await fetch(`content/${pageName}/index.json`);
        if (!response.ok) throw new Error("Failed to fetch topic list.");
        const topics = await response.json();

        // Function to convert date string into a sortable format
        function parseDate(dateStr) 
        {
            const [day, month, year] = dateStr.split(" ");
            const monthIndex = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(month);
            return new Date(year, monthIndex, day);
        }

        // Sort topics by date (newest first)
        topics.sort((a, b) => parseDate(b.date) - parseDate(a.date));

        function renderTopics(filter = "") 
        {
            const filteredTopics = topics.filter(topic =>
                topic.title.toLowerCase().includes(filter.toLowerCase()) ||
                topic.category.toLowerCase().includes(filter.toLowerCase())
            );

            const topicList = filteredTopics
            .map(topic => 
            {
                let link;
                if (topic.url) 
                {
                    // If URL exists, link to the external site
                    link = `<a href="${topic.url}" class="content-title" target="_blank" rel="noopener noreferrer">${topic.title} 🔗</a>`;
                } 
                else if(topic.file) 
                {
                    // Otherwise, link to the internal file
                    link = `<a href="content/${pageName}/${topic.file}" class="content-title">${topic.title}</a>`;
                }
                else 
                {
                    link = `<a class="content-title">${topic.title}</a>`;
                }

                return `
                    <div class="content-card">
                        ${link}
                        <p class="content-description">${topic.description}</p>
                        <small class="content-meta">Category: ${topic.category} | Date: ${topic.date}</small>
                    </div>`;
                    
            }).join("");
            contentElement.innerHTML = topicList || "<p>No topics found.</p>";
        }

        searchInput.addEventListener("input", () => {
            renderTopics(searchInput.value);
        });

        renderTopics(); // Initial render
    } catch (error) {
        contentElement.innerHTML = `<p>Error loading topics: ${error.message}</p>`;
    }
});