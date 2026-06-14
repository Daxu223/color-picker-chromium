/*
* content.js
* Runs before the page is loaded and reads colors and applies the color map.
*/

const getPageColors = () => {
    const pageElements = document.getElementsByTagName("*");
    const uniqueColors = new Set();

    for (let element of pageElements) {
        const elementStyles = window.getComputedStyle(element);
        const elementColor = elementStyles.backgroundColor;

        if (elementColor) uniqueColors.add(elementColor);
    }

    return [...uniqueColors];
};

const hexToRgb = (hex) => {
    if (hex.startsWith("#")) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${r}, ${g}, ${b})`;
    }

    return hex;
};

const applyColorsToElements = (map, elements) => {
    for (let element of elements) {
        const elementStyles = window.getComputedStyle(element);
        const elementOriginalColor = elementStyles.backgroundColor;

        if (map[elementOriginalColor] && map[elementOriginalColor] !== elementOriginalColor) {
            element.style.backgroundColor = map[elementOriginalColor];
        }
    }
};

const getSiteKey = () => `colorMap_${window.location.href}`;

const saveColorMap = (siteKey, mappedSiteColors, callback) => {
    chrome.storage.local.set({ [siteKey]: mappedSiteColors }, callback);
};

const initializeColorMap = (siteKey, callback) => {
    const originalColors = getPageColors();
    const mappedSiteColors = {};

    for (let color of originalColors) {
        mappedSiteColors[color] = color;
    }

    saveColorMap(siteKey, mappedSiteColors, () => {
        if (typeof callback === "function") {
            callback(mappedSiteColors, originalColors);
        }
    });
};

const observeDomChanges = (mappedSiteColors) => {
    const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                applyColorsToElements(mappedSiteColors, document.getElementsByTagName("*"));
            }
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
    });

    setTimeout(() => observer.disconnect(), 5000);
};

const populateColorMap = () => {
    const siteKey = getSiteKey();

    chrome.storage.local.get([siteKey], (result) => {
        const mappedSiteColors = result[siteKey] || {};
        const isEmptyMap = Object.keys(mappedSiteColors).length === 0;

        if (isEmptyMap) {
            initializeColorMap(siteKey, (map) => {
                applyColorsToElements(map, document.getElementsByTagName("*"));
                observeDomChanges(map);
            });
        } else {
            applyColorsToElements(mappedSiteColors, document.getElementsByTagName("*"));
            observeDomChanges(mappedSiteColors);
        }
    });
};

populateColorMap();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const siteKey = getSiteKey();

    if (request.action === "getColors") {
        chrome.storage.local.get([siteKey], (result) => {
            const mappedSiteColors = result[siteKey] || {};
            const isEmptyMap = Object.keys(mappedSiteColors).length === 0;

            if (isEmptyMap) {
                initializeColorMap(siteKey, (_, originalColors) => sendResponse({ colors: originalColors }));
            } else {
                const uniqueCurrentColors = new Set(Object.values(mappedSiteColors));
                sendResponse({ colors: [...uniqueCurrentColors] });
            }
        });

        return true;
    }

    if (request.action === "swapColor") {
        const rgbOldColor = hexToRgb(request.oldColor);
        const rgbNewColor = hexToRgb(request.newColor);

        chrome.storage.local.get([siteKey], (result) => {
            const map = result[siteKey] || {};

            for (let originalKey in map) {
                if (map[originalKey] === rgbOldColor) {
                    console.log("Match found for key:", originalKey);
                    map[originalKey] = rgbNewColor;
                }
            }

            saveColorMap(siteKey, map, () => {
                const elements = document.getElementsByTagName("*");
                for (let element of elements) {
                    const elementStyles = window.getComputedStyle(element);

                    if (elementStyles.backgroundColor === rgbOldColor) {
                        element.style.backgroundColor = rgbNewColor;
                    }
                }
                sendResponse({ status: "swap_success" });
            });
        });

        return true;
    }

    if (request.action === "resetColors") {
        chrome.storage.local.remove([siteKey], () => {
            const elements = document.getElementsByTagName("*");
            for (let element of elements) {
                element.style.removeProperty("background-color");
            }
            sendResponse({ status: "reset_success" });
        });

        return true;
    }
});