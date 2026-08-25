// While developing locally, keep this pointed at your computer.
// We will change this URL string to our Render link in the next step!
//  const SERVER_API = 'https://mini-social-app-8e0f.onrender.com';
const SERVER_API = "https://mini-social-app-8e0f.onrender.com/api/posts";

// 1. FETCH LIVE CHANNELS FROM DATABASE ENGINE
async function fetchMessages() {
  try {
    const response = await fetch(SERVER_API);
    const postsArray = await response.json();

    const displayGrid = document.getElementById("postsDisplayGrid");

    if (postsArray.length === 0) {
      displayGrid.innerHTML = `<p style="color:#71767b; text-align:center; margin-top:20px; font-family: poppins;">The room is completely empty. Be the first to chat!</p>`;
      return;
    }

    displayGrid.innerHTML = postsArray
      .map(
        (post) => `
          <div class="post-card">
            <div class="post-meta">
              <span class="post-author">${escapeText(post.username)}</span>
              <span class="post-time">• live</span>
            </div>
            <div class="post-body">${escapeText(post.post_text)}</div>
          </div>
        `,
      )
      .join("");
  } catch (err) {
    console.error("Could not sync with public timeline API:", err);
  }
}

// 2. TRANSMIT STRINGS TO SECURE SQL PARAMETERS
async function sendPostToBackend() {
  const nameField = document.getElementById("usernameInput");
  const textField = document.getElementById("messageInput");

  if (!nameField.value.trim() || !textField.value.trim()) {
    alert("Fields cannot be submitted empty.");
    return;
  }

  try {
    await fetch(SERVER_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nameField.value.trim(),
        text: textField.value.trim(),
      }),
    });

    // Clear layout components and force real-time sync refresh
    nameField.value = "";
    textField.value = "";
    fetchMessages();
  } catch (err) {
    alert("Network fault: Delivery pipeline dropped data packets.");
  }
}

// Security sanitization layer to block malicious script injections
function escapeText(str) {
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        tag
      ] || tag,
  );
}

// Initial lifecycle pull request hook
fetchMessages();
