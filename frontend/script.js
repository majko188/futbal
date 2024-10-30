async function fetchPollResults() {
    const response = await fetch('/poll');
    const data = await response.json();
    document.getElementById('poll-results').textContent = JSON.stringify(data);
}
fetchPollResults();