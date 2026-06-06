// Get colors on the current active tab
// DOCS: https://developer.chrome.com/docs/extensions/reference/api/tabs

// Create the list by creating divs for each found color and color picker
container = document.getElementById('color-container');

// This exists just so the colors are not defaulted to black.
function rgbToHex(rgbString) {
    // Extracts the numbers from "rgb(255, 0, 0)" or "rgba(255, 0, 0, 1)"
    const rgbValues = rgbString.match(/\d+/g);
    
    if (!rgbValues || rgbValues.length < 3) return "#000000"; 

    const r = parseInt(rgbValues[0]).toString(16).padStart(2, '0');
    const g = parseInt(rgbValues[1]).toString(16).padStart(2, '0');
    const b = parseInt(rgbValues[2]).toString(16).padStart(2, '0');

    return `#${r}${g}${b}`;
}
async function getColors() {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { action: "getColors" });

    response.colors.forEach((color) => {
        const baseDiv = document.createElement('div');
        baseDiv.className = 'color-pair';

        // Found color
        const foundColorDiv = document.createElement('div');
        foundColorDiv.className = 'found-color';
        foundColorDiv.style.backgroundColor = color;
        foundColorDiv.style.border = "2px solid #000000";

        
        // Color picker
        const colorPickerElement = document.createElement('input');
        colorPickerElement.className = 'color-picker';
        colorPickerElement.type = 'color';
        colorPickerElement.value = rgbToHex(color);
        
        // Add elements to base div
        baseDiv.appendChild(foundColorDiv);
        baseDiv.appendChild(colorPickerElement);

        let currentColor = color; // rgb, as returned from the map
        
        // Add an event listener to the view.html and change the contents of the page in the content.js file.
        // This color has to be saved, too.
        colorPickerElement.addEventListener('change', async (event) => {
            const newColor = event.target.value;
            await chrome.tabs.sendMessage(tab.id, {
                action: "swapColor",
                oldColor: rgbToHex(currentColor),
                newColor: newColor
            });
            currentColor = newColor;
            foundColorDiv.style.backgroundColor = newColor;
        });

        container.appendChild(baseDiv);
    });
};

getColors();

document.getElementById('reset-btn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab) {
        // We now wait for the content script to confirm it finished
        const response = await chrome.tabs.sendMessage(tab.id, { action: "resetColors" });
        
        if (response && response.status === "reset_success") {
            const container = document.getElementById('color-container');
            if (container) container.innerHTML = ''; 
            
            // Now that storage is wiped, this will trigger the "else" block 
            // in your getColors listener, which builds the fresh map!
            getColors(); 
        }
    }
});