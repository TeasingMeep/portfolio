"use strict";

var s1 = window.pageYOffset,
	s2,
	scrollTimeout,
	windowHeight = window.innerHeight,
	windowWidth = window.innerWidth;

var documentReady = function () {
	const mainContainer = document.querySelector("main");
	const filterContainer = mainContainer.querySelector(".filter-container");
	populate(mainContainer);
	document.body.classList.add("initiated");

	const overlayClose = document.body.querySelector(".overlay-close");
	if (overlayClose) overlayClose.addEventListener("click", closeOverlay);
};

function closeOverlay() {
	const overlayInnerContainer = document.body.querySelector(".overlay-inner-container");
	document.body.classList.add("remove-overlay");
	setTimeout(() => {
		document.body.classList.remove("remove-overlay");
		document.body.classList.remove("reveal-overlay");
		overlayInnerContainer.remove();
	}, 1000);
}

async function populatePlaces(places = null, placesList = null) {
	if (places === null || placesList === null) return "no content or missing html element";
	const types = {};

	function typeFormatter(type) {
		/**
		 * Check and format the type variable. lowercase, hyphinated, no unique characters
		 */
		let formattedType = "";
		if (typeof type === "object") {
			type.forEach((option) => {
				let formattedOption = option.toLowerCase().trim().replace(" ", "-");
				if (!types.hasOwnProperty(formattedOption)) {
					types[formattedOption] = option;
				}
				formattedType += `${formattedOption} `;
			});
		} else {
			formattedType = type.toLowerCase().trim().replace(" ", "-");
		}
		return formattedType;
	}

	// Create place element
	function createHTMLElemnt(place, type) {
		const revealOverlay = (event) => {
			let target = event.target,
				overlayContainer = document.querySelector("#place-overlay"),
				overlayInnerContainer = document.createElement("div");
			overlayInnerContainer.className = "overlay-inner-container";

			const targetDescription = target.getAttribute("data-description");
			const targetAddress = target.getAttribute("data-address");
			const targetName = `${typeFormatter(target.getAttribute("data-name"))}`;

			let paraElement = document.createElement("p"),
				titleElement = document.createElement("h2"),
				overlayPrimaryContentContainer = document.createElement("div"),
				addressElement = document.createElement("address");
			overlayPrimaryContentContainer.className = "primary-content-container";
			titleElement.innerText = target.innerText;
			paraElement.innerText = targetDescription;
			addressElement.innerText = targetAddress;

			overlayPrimaryContentContainer.appendChild(titleElement);
			overlayPrimaryContentContainer.appendChild(paraElement);
			overlayInnerContainer.appendChild(overlayPrimaryContentContainer);
			overlayInnerContainer.appendChild(addressElement);

			overlayContainer.prepend(overlayInnerContainer);
			document.body.classList.add("reveal-overlay");
		};

		const li = document.createElement("li");
		const button = document.createElement("button");

		button.innerText = place.name;
		button.setAttribute("data-description", place.description);
		button.setAttribute("data-name", typeFormatter(place.name));
		if (place.address) button.setAttribute("data-address", place.address);
		button.setAttribute("data-type", type);
		button.setAttribute("aria-pressed", "false");

		button.addEventListener("click", revealOverlay);

		li.appendChild(button);
		return li;
	}

	let index = 0;
	for (const place of places) {
		const placeType = typeFormatter(place.type);
		const placeItem = createHTMLElemnt(place, placeType);
		placesList.appendChild(placeItem);
	}

	return types;
}

function initFilter(types, filterOptions, currentFilter, placesList) {
	function clearFilter() {
		const activePlaces = placesList.querySelectorAll(".active");
		if (activePlaces.length) {
			activePlaces.forEach((place) => place.classList.remove("active"));
		}
		currentFilter.innerText = "";
		placesList.removeAttribute("filter");
		placesList.closest("section").classList.remove("filtered");
	}

	let updateFilter = (event) => {
		function filterPlaces(type, placesToFilter) {
			const activePlaces = placesList.querySelectorAll(".active");
			if (activePlaces.length) {
				activePlaces.forEach((place) => place.classList.remove("active"));
			}

			let filteredPlaces = placesToFilter.filter((place) => place.getAttribute("data-type").indexOf(type) >= 0);
			for (let index = 0; index < filteredPlaces.length; index++) {
				const elementToFilter = filteredPlaces[index];
				const elementParent = elementToFilter.parentElement;
				elementParent.classList.add("active");
			}
			placesList.setAttribute("filter", "filtered");

			if (filteredPlaces.length > 20) {
				placesList.setAttribute("filter-style", "three-columns");
			} else if (filteredPlaces.length > 30) {
				placesList.setAttribute("filter-style", "two-columns");
			} else {
				placesList.removeAttribute("filter-style");
			}
		}

		const target = event.target;
		const dataType = target.getAttribute("data-type");
		const placesElementArray = Array.from(placesList.querySelectorAll("button"));
		filterPlaces(dataType, placesElementArray);
		placesList.closest("main").classList.add("filtered");
		currentFilter.innerText = target.innerText;
	};

	for (const type in types) {
		// Create filter element
		const li = document.createElement("li");
		const button = document.createElement("button");
		button.innerText = types[type];
		button.setAttribute("data-type", type);
		// Add function
		button.addEventListener("click", updateFilter);
		// Add to filter bar
		li.appendChild(button);
		filterOptions.appendChild(li);
	}
	const clearFilterElement = document.body.querySelector("#clear-filter");

	if (clearFilterElement) clearFilterElement.addEventListener("click", clearFilter);
}

async function populate(main) {
	const requestURL = `https://nicholasraymondbalch.com/philly-places/places.json`;
	const request = new Request(requestURL);

	const response = await fetch(request);
	const places = await response.json();

	main.querySelector("h1 span").innerText = places.location; // Populate header

	const filterOptions = main.querySelector("#filter-options");
	const currentFilter = main.querySelector("#current-filter");
	const placesList = main.querySelector("#places-list");
	const types = await populatePlaces(places.places, placesList);
	initFilter(types, filterOptions, currentFilter, placesList);
}

window.addEventListener("resize", function () {
	// Checks to see if the window width has changed before updating --vh
	if (window.innerWidth !== windowWidth || windowWidth > 400) {
		windowWidth = window.innerWidth;
	}
	windowHeight = window.innerHeight;
});

// Document Ready Listener
if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
	documentReady();
} else {
	document.addEventListener("DOMContentLoaded", documentReady);
}
