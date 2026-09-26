// DOM Element References
const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const resultsContainer = document.getElementById("results");
const resultCountDisplay = document.getElementById("result-count");

// Render function: loop through items and build cards
function render(items, query) {
  // Clear old results
  resultsContainer.innerHTML = "";

  // Custom Enhancement 1: Display result count
  resultCountDisplay.textContent = `Showing ${items.length} results for "${query}"`;

  items.forEach((item) => {
    // Extract image URL and Title from Wikimedia API structure
    const imageInfo = item.imageinfo ? item.imageinfo[0] : null;
    if (!imageInfo) return; // Skip if no image info is present

    const imageUrl = imageInfo.thumburl || imageInfo.url;
    const fullImageUrl = imageInfo.descriptionurl || imageInfo.url;
    // Clean up title by removing "File:" prefix if present
    const titleText = item.title.replace(/^File:/, "");

    // Build DOM elements
    const card = document.createElement("article");
    card.className = "card";

    // Custom Enhancement 2: Make each card a link opening the full image in a new tab
    const cardLink = document.createElement("a");
    cardLink.href = fullImageUrl;
    cardLink.target = "_blank";
    cardLink.rel = "noopener noreferrer";

    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = titleText;
    img.loading = "lazy";

    const caption = document.createElement("p");
    caption.textContent = titleText;

    // Assemble components
    cardLink.appendChild(img);
    cardLink.appendChild(caption);
    card.appendChild(cardLink);
    resultsContainer.appendChild(card);
  });
}

// Main event listener for form submission
form.addEventListener("submit", async (event) => {
  // 1. Prevent default form reload
  event.preventDefault();

  // Read query and remove extra whitespace
  const query = input.value.trim();

  // 4. Ignore empty searches
  if (!query) return;

  // Clear previous count display while fetching
  resultCountDisplay.textContent = "";

  // 2. Build Wikimedia Commons API request URL
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query" +
    "&generator=search" +
    "&gsrsearch=" + encodeURIComponent(query) +
    "&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=300&format=json&origin=*";

  try {
    // Fetch data and handle response
    const response = await fetch(url);

    // Check response.ok
    if (!response.ok) {
      throw new Error(`Server returned status code ${response.status}`);
    }

    const data = await response.json();

    // Check if query pages exist in API response
    if (!data.query || !data.query.pages) {
      resultsContainer.innerHTML = "";
      resultCountDisplay.textContent = `No results found for "${query}"`;
      return;
    }

    // Convert object of pages into an array of page items
    const items = Object.values(data.query.pages);

    // 3. Render items to the DOM
    render(items, query);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});