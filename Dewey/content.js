let overlayInjected = false;
let targetElement;
let overlay;
let overlayContent;
let observer;

const ASCII_ART = `██████╗ ███████╗██╗    ██╗███████╗██╗   ██╗
██╔══██╗██╔════╝██║    ██║██╔════╝╚██╗ ██╔╝
██║  ██║█████╗  ██║ █╗ ██║█████╗   ╚████╔╝ 
██║  ██║██╔══╝  ██║███╗██║██╔══╝    ╚██╔╝  
██████╔╝███████╗╚███╔███╔╝███████╗   ██║   
  ╚═════╝ ╚══════╝ ╚══╝╚══╝ ╚══════╝   ╚═╝     
`;

async function getChatGptResponse() {
  console.log('Sending API request');
  const promptElement = document.querySelector('.fxs-blade-title-titleText.msportalfx-tooltip-overflow');
  const bladeTitleText = promptElement ? promptElement.innerText : '';
  const prompt = `Only respond with a single complex KQL queries to analyze ${bladeTitleText}. Response must be less then 15 lines long, do not include anything other then a description of the KQL query and the KQL query.`;

  let apiKey = ''; // Initialize apiKey

  // Load API key from storage
  await new Promise((resolve) => {
    chrome.storage.sync.get(['apiKey'], function(result) {
      if (result.apiKey) {
        apiKey = result.apiKey; // Assign the stored API key
        resolve(); // Resolve the Promise
      } else {
        console.error('No API key found.');
        resolve(); // Resolve the Promise
      }
    });
  });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey, // Use the loaded API key
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo', // Specify the GPT-3.5 Turbo model
      messages: [{ role: 'system', content: 'You are a Cyber Security Analyst.' }, { role: 'user', content: prompt }]
    })
  });

  console.log('API response:', response);

  const data = await response.json();
  console.log('API data:', data);

  return data.choices[0].message.content; // Get the response message content
}

function generateResponseAndUpdateOverlay() {
  console.log('Generating response');

  const loadingText = document.createElement('div');
  loadingText.id = 'overlay-loading';
  loadingText.innerText = 'Loading...';
  overlayContent.innerHTML = '';
  overlayContent.appendChild(loadingText);

  try {
    // Make the API request to ChatGPT
    getChatGptResponse().then(response => {
      console.log('API response:', response);

const asciiArtDiv = document.createElement('pre');
asciiArtDiv.style.textAlign = 'center';
asciiArtDiv.textContent = ASCII_ART;

      const responseDiv = document.createElement('div');
      responseDiv.style.textAlign = 'left';
      responseDiv.innerHTML = `<pre style="white-space: pre-wrap">${response}</pre>`; 

      overlayContent.innerHTML = '';
      overlayContent.appendChild(asciiArtDiv);
      overlayContent.appendChild(responseDiv);
    }).catch(error => {
      console.error('Error in API request:', error);
      overlayContent.innerHTML = 'Error occurred. Please try again.';
    });
  } catch (error) {
    console.error('Error in API request:', error);
    overlayContent.innerHTML = 'Error occurred. Please try again.';
  }
}

function hideOverlay() {
  if (overlay) {
    overlay.style.display = 'none';
  }
}

function showOverlay() {
  if (overlay) {
    overlay.style.display = 'block';
  }
}

function checkAndInjectOverlay() {
  console.log('Checking for target element');

  if (overlayInjected) {
    console.log('Overlay already injected');

    // Show the overlay if it is hidden
    showOverlay();

    return;
  }

  const targetElementClass = '.fxs-blade.msportalfx-shadow-level3.fxs-portal-bg-txt-br.fxs-vivaresize.fxs-contextpane-content.fxs-blade-shows-pending.fxs-bladesize-xlarge';
  const topbarElementClass = '.fxs-topbar.az-noprint.msportalfx-unselectable.fxs-vivaresize';

  // Search for the target element with the specified classes
  targetElement = document.querySelector(targetElementClass);
  const topbarElement = document.querySelector(topbarElementClass);

  if (!targetElement || !topbarElement) {
    console.log('Target element or topbar element not found');

    // Hide the overlay if it was previously injected
    hideOverlay();

    return;
  }

  console.log('Target element and topbar element found');

  overlayInjected = true;

  const css = `
    /* Overlay CSS styles */

    #overlay-container {
      position: relative;
    }

    #overlay {
      position: fixed;
      top: ${topbarElement.offsetHeight}px;
      right: ${targetElement.offsetWidth}px; // set the overlay to the left of target element
      width: calc(100% - ${targetElement.offsetWidth}px);
      height: calc(100% - ${topbarElement.offsetHeight}px);
      background-color: #fff;
      z-index: 9999;
      overflow: auto;
      padding: 20px;
    }

    #overlay-content {
      width: 100%;
      max-height: 100%;
      display: flex;
      flex-direction: column; // New addition: align children in a column
      align-items: center;
      justify-content: flex-start; // Changed from center to flex-start
      overflow: auto;
      text-align: center; // To center the text
    }

    #overlay-content pre {
      white-space: pre-wrap; // To wrap the text
      word-break: break-word; // To break the words at the end of the line
    }
  `;

  const style = document.createElement('style');
  style.innerHTML = css;
  document.head.appendChild(style);

  const overlayContainer = document.createElement('div');
  overlayContainer.id = 'overlay-container';

  overlay = document.createElement('div');
  overlay.id = 'overlay';
  overlayContent = document.createElement('div');
  overlayContent.id = 'overlay-content';
  overlay.appendChild(overlayContent);

  overlayContainer.appendChild(overlay);
  document.body.appendChild(overlayContainer); // Add overlay to body

  generateResponseAndUpdateOverlay();

  // Add event listener to the target element to detect removal from DOM
  observer = new MutationObserver(() => {
    if (!document.contains(targetElement)) {
      hideOverlay();
      observer.disconnect(); // Disconnect the observer once the target element is removed
      overlayInjected = false; // Reset the overlayInjected flag
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

checkAndInjectOverlay();

setInterval(checkAndInjectOverlay, 3500);
