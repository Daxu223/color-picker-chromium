// Because the website elements are isolated, they have to be read in a separate content.js script.
const getPageColors = () => {
    const elements = document.getElementsByTagName("*");
    const uniqueColors = new Set();

    for (let element of elements) {
        const elementStyles = window.getComputedStyle(element);
        const color = elementStyles.backgroundColor;

        if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
            continue;
        }

        uniqueColors.add(color);

    }

    console.log("Found colors:", [...uniqueColors]); 
    return [...uniqueColors];
};

// Values are stored in hex, so we have to convert them back to rgb
const hexToRgb = (hex) => {
    if (!hex.startsWith('#')) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
};

const applyMapToElements = (map, elements) => {
    for (let element of elements) {
        const elementStyles = window.getComputedStyle(element);
        const elementOriginalColor = elementStyles.backgroundColor;
        if (map[elementOriginalColor] && map[elementOriginalColor] !== elementOriginalColor) {
            element.style.backgroundColor = map[elementOriginalColor];
        }
    }
};

// Creates a unique storage key for EVERY specific website (e.g., "colorMap_google.com")
const getSiteKey = () => "colorMap_" + window.location.hostname;

// Uses the chrome.storage API to save the colors to permanent storage (colors stay after refresh)
const populateColorMap = () => {
    const siteKey = getSiteKey();

    chrome.storage.local.get([siteKey], (result) => {
        if (!result[siteKey]) {
            const originalColors = getPageColors();
            let initialMap = {};
            for (let color of originalColors) {
                initialMap[color] = color;
            }
            chrome.storage.local.set({ [siteKey]: initialMap });
        // Because I was running into issues with the extension not applying the colors, 
        // we try to use a mutation observer to listen for changes on dynamically loaded pages
        } else {
            const map = result[siteKey];
            applyMapToElements(map, document.getElementsByTagName('*'));

            const observer = new MutationObserver((mutations) => {
                for (let mutation of mutations) {
                    if (mutation.addedNodes.length > 0) {
                        applyMapToElements(map, document.getElementsByTagName('*'));
                    }
                }
            });
            
            observer.observe(document.documentElement, {
                childList: true,  // watch for added/removed elements
                subtree: true     // watch the entire page, not just top level
            });

            // Stop observing after 5 seconds.
            setTimeout(() => observer.disconnect(), 5000);

        }
    });
};

// Run this when the page is loaded.
populateColorMap();

// Register a listener event, so that we can get colors when run.
// The problem is that this content.js file runs before everything else and I cannot inject the colors to a container defined in view.html
// This gets called in the popup.js file, which gets called in view.html

// Also read this horrible piece https://developer.chrome.com/docs/extensions/develop/concepts/messaging

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const siteKey = getSiteKey();

    // User gets the colors using the extension. Instead of using getPageColors, use the populated map.
    if (request.action === "getColors") {
        chrome.storage.local.get([siteKey], (result) => {
            
            // GET VALUES FROM THE MAP
            if (result[siteKey]) {
                const uniqueCurrentColors = new Set(Object.values(result[siteKey]));
                sendResponse({ colors: [...uniqueCurrentColors] });
            }

            // RESET TO DEFAULTS, reload colors
            else {
                const originalColors = getPageColors();
                let initialMap = {};

                for (let color of originalColors) {
                    initialMap[color] = color;
                }

                chrome.storage.local.set({ [siteKey]: initialMap }, () => {
                    sendResponse({ colors: originalColors });
                });
            }
        });

        return true;
    }

    // User wants to change the color using the extension. Save the swapped color to the local storage's color map.
    if (request.action === "swapColor") {
        const rgbOldColor = hexToRgb(request.oldColor);
        const rgbNewColor = hexToRgb(request.newColor); // Convert to rgb so that the colors can load again gracefully

        chrome.storage.local.get([siteKey], (result) => {
            let map = result[siteKey];

            // Updates the UI by replacing the old color with the new one, when action swapColor is called.
            for (let originalKey in map) {
                if (map[originalKey] === rgbOldColor) {
                    console.log("Match found for key:", originalKey);
                    map[originalKey] = rgbNewColor;
                }
            }

            chrome.storage.local.set({ [siteKey]: map }, () => {
                const elements = document.getElementsByTagName("*")
                for (let element of elements) {
                    const elementsStyles = window.getComputedStyle(element)
                    
                    // This is where the actual change happens. The only line that makes this from being an useless thing vs useful.
                    if (elementsStyles.backgroundColor === rgbOldColor) {
                        element.style.backgroundColor = rgbNewColor;
                    }
                }
                sendResponse({ status: "swap_success" });
            });
        });

        return true;
    }

    // Reset to defaults
    if (request.action === "resetColors") {
        chrome.storage.local.remove([siteKey], () => {
            const elements = document.getElementsByTagName("*");
            for (let element of elements) {
                element.style.removeProperty('background-color');
            }
            sendResponse({ status: "reset_success" });
        });
        return true;
    }
});