// Wait for the DOM content to load before executing the script
document.addEventListener('DOMContentLoaded', function() {
    // Get references to HTML elements
    var wrapper = document.getElementById('wrapper');
    var apiKeyInput = document.getElementById('apiKey');
    var optionsButton = document.getElementById('options');
    var toggleVisibilityButton = document.getElementById('toggle_visibility');
    var setupGuideButton = document.getElementById('setup_guide');
    var userGuideButton = document.getElementById('user_guide');
    var donateButton = document.getElementById('donate');
    var sampleText = document.getElementById('sampleText');
    // Retrieve the API key from local storage and set the value of the input field if it exists
    chrome.storage.local.get('apiKey', function(data) {
        if (data.apiKey) {
            apiKeyInput.value = data.apiKey;
        }
    });
    // Toggle the display of the wrapper element and the "active" class of the options button on click
	optionsButton.addEventListener('click', function() {
        wrapper.style.display = wrapper.style.display === 'block' ? 'none' : 'block';
        optionsButton.classList.toggle('active');
        setupGuideButton.classList.remove('active');
        userGuideButton.classList.remove('active');
        donateButton.classList.remove('active');
        sampleText.style.display = 'none';
    });
    // Toggle the display of the sample text element and the "active" class of the setup guide button on click
    setupGuideButton.addEventListener('click', function() {
		sampleText.innerHTML = "Step 1: Go to the OpenAI website and sign in or create an account if you don't have one.<br><br>Step 2: Navigate to the API Keys section in your OpenAI account settings.<br><br>Step 3: Generate a new API key by clicking on the \"Generate New Key\" button.<br><br>Step 4: Copy the generated API key to your clipboard.<br><br>Step 5: Open the browser extension options page for this extension.<br><br>Step 6: Locate the input field for the API key and paste the copied key into the field.<br><br>Step 7: Click the \"Save\" button to save the API key.<br><br>Step 8: The API key will now be stored in the browser extension's storage and used for making API requests.";
        sampleText.style.display = sampleText.style.display === 'block' ? 'none' : 'block';
        setupGuideButton.classList.toggle('active');
        userGuideButton.classList.remove('active');
        donateButton.classList.remove('active');
        optionsButton.classList.remove('active');
        wrapper.style.display = 'none';
    });
    // Toggle the display of the sample text element and the "active" class of the user guide button on click
    userGuideButton.addEventListener('click', function() {
		sampleText.innerHTML = "Step 1: Open any given Azure Sentinel Alert. <br><br> Step 2: In several seconds the AIDR Playbook will autogenerate to the left of the log analytics form. <br><br> Note: The data model utilized is small and several years old as of the creation of this extension. This problem should resolve itself as Chat GPT is updated";
        sampleText.style.display = sampleText.style.display === 'block' ? 'none' : 'block';
        userGuideButton.classList.toggle('active');
        setupGuideButton.classList.remove('active');
        donateButton.classList.remove('active');
        optionsButton.classList.remove('active');
        wrapper.style.display = 'none';
    });
    // Toggle the display of the sample text element and the "active" class of the donate button on click
    donateButton.addEventListener('click', function() {
        sampleText.innerHTML = 'Donation Links: <a href="https://www.buymeacoffee.com/johndufty1997" target="_blank" style="color: black;">Buy me a coffee</a> <br><br>Bitcoin: 12cQfKXZr3SWFbR1PeAqBH682EpHUMR7ft<br><br>This extension was made for free and open source to help Security Professionals expediently triage with OSINT tools. Any donations are appreciated but not essential.';
        sampleText.style.display = sampleText.style.display === 'block' ? 'none' : 'block';
        donateButton.classList.toggle('active');
        setupGuideButton.classList.remove('active');
        userGuideButton.classList.remove('active');
        optionsButton.classList.remove('active');
        wrapper.style.display = 'none';
    });
    // Save the API key to local storage and hide the wrapper element and options button on click
    document.getElementById('submit').addEventListener('click', function(event) {
        event.preventDefault();
    chrome.storage.local.set({ 'apiKey': apiKeyInput.value }, function() {
        wrapper.style.display = 'none';
        optionsButton.classList.remove('active');
    });
});
    // Toggle the visibility of the API key input field and the "active" class of the toggle visibility button on click
toggleVisibilityButton.addEventListener('click', function() {
    apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
    toggleVisibilityButton.classList.toggle('active');
});
});


