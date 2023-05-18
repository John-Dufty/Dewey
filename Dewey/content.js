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

  // If bladeTitleText is empty, no element was detected
  if (bladeTitleText === '') {
    console.log("No element detected.");
    return "No element detected"; 
  }

  const prompt = `Only respond with a single complex KQL queries to analyze ${bladeTitleText}. Response must be less than 15 lines long, do not include anything other than a description of the KQL query and the KQL query.`;

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

  overlayContent.innerHTML = '';

  const loadingText = document.createElement('div');
  loadingText.id = 'overlay-loading';
  loadingText.innerText = 'Loading...';
  overlayContent.appendChild(loadingText);

  try {
    // Make the API request to ChatGPT
    getChatGptResponse().then(response => {
      console.log('API response:', response);
      
      // If there's no element detected, just display the message
      if(response === "No element detected") {
          overlayContent.innerHTML = response;
          return;
      }

      const asciiArtDiv = document.createElement('pre');
      asciiArtDiv.style.textAlign = 'center';
      asciiArtDiv.textContent = ASCII_ART;

      const responseDiv = document.createElement('div');
      responseDiv.id = 'response-div';
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

function adjustOverlaySize() {
  if (overlay) {
    const targetElement = document.querySelector('.fxs-blade.msportalfx-shadow-level3.fxs-portal-bg-txt-br.fxs-vivaresize.fxs-contextpane-content.fxs-blade-shows-pending.fxs-bladesize-xlarge');
    if (targetElement) {
      overlay.style.right = targetElement.offsetWidth + 'px';
      overlay.style.width = 'calc(100% - ' + targetElement.offsetWidth + 'px)';
      overlay.style.height = '100%';
    }
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
      right: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 1);
      z-index: 9999;
      overflow: auto;
      padding: 20px;
    }

    #overlay-content {
      max-height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      overflow: auto;
      text-align: center;
      background-color: #fff;
      padding: 20px;
    }

    #overlay-content pre {
      white-space: pre-wrap;
      word-break: break-word;
    }

    #overlay-loading {
      font-size: 24px;
      font-weight: bold;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    #response-div {
      width: 100%;
      overflow: auto;
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
    } else {
      adjustOverlaySize(); // Adjust overlay size if target element still exists
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

checkAndInjectOverlay();

setInterval(checkAndInjectOverlay, 3500);
