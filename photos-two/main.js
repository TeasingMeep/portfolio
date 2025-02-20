"use strict";

var s1 = window.pageYOffset,
	s2,
	scrollTimeout,
	windowHeight = window.innerHeight,
	gridItems,
	headerHeight,
	scrollElements = document.querySelectorAll(".scroll-element");

var documentReady = function () {
	let isHome = document.body.classList.contains("home");

	scrollElements = document.querySelectorAll(".scroll-element");
	const siteHeader = document.getElementById("site-header");
	const mainContainer = document.querySelector("main");
	heartSliderEvents(mainContainer);
	throttledScrollEvents();
	document.body.classList.add("initiated");
	// headerEventListener(siteHeader);
};

function heartSliderEvents(mainContainer) {
	const heartSlideshowElement = mainContainer.querySelector('.heart-slideshow')
	if(!heartSlideshowElement) return console.log('no element');

	console.log(heartSlideshowElement);
	
	const heartSlider = new HeartSlider({
		slideshow: heartSlideshowElement,
		transition: 2250,
		manualTransition: 200,
		delay: 500,
		loop: true,
		randomize: false,
		paused: false,
		effect: "fadeOut",
		buttons: false,
		swipe: true,
		clickToAdvance: false,
		pauseOnInactiveWindow: false,

	});
}

function headerEventListener(siteHeader) {
	if (!siteHeader && document.body.classList.contains("home")) return;
	headerHeight = siteHeader.offsetHeight;

	// Header load animation
	let headerTimeout = 350;
	const headerH1Spans = siteHeader.querySelectorAll("h1 span");
	for (let i = 0; i < headerH1Spans.length; i++) {
		const span = headerH1Spans[i];
		setTimeout(() => {
			span.style.opacity = 1;
		}, headerTimeout);

		if (i === headerH1Spans.length - 2) {
			setTimeout(() => {
				document.body.classList.add("initiated");
			}, headerTimeout);
		}
		headerTimeout += 350;
	}
}

/**
 *
 * STANDARD FUNCTIONS =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 *
 * */
function throttledScrollEvents() {
	s1 = window.pageYOffset; // current scroll position
	s1 && s2 && s1 > 0 && s1 > s2 ? document.body.classList.add("scrolling-down") : document.body.classList.remove("scrolling-down");

	if (s2 && s2 > 100) {
		document.body.classList.add("scrolled");
		document.body.classList.add("page-scrolled");
	} else {
		document.body.classList.remove("scrolled");
	}

	s1 + s2 / 2 >= document.body.scrollHeight - 100 ? document.body.classList.add("scrolled-to-bottom") : document.body.classList.remove("scrolled-to-bottom");

	if (typeof scrollElements !== "undefined" && scrollElements !== null) {
		Array.prototype.forEach.call(scrollElements, function (elem) {
			if (isScrolledIntoView(elem) === true) {
				elem.classList.add("in-view");
			} else {
				elem.classList.remove("in-view");
			}
		});
	}

	s2 = window.pageYOffset; // new scroll position
}

function isScrolledIntoView(elem) {
	var docViewTop = s1;
	var docViewBottom = docViewTop + windowHeight;
	var threshold = windowHeight * 0.1;

	var elemTop = elem.offsetTop;
	var elemBottom = elemTop + elem.offsetHeight;

	/* one-way fade (elements are revealed upon scroll, but never hidden) */
	return elemTop <= docViewBottom;

	/* two-way fade (elements are revealed on scroll, and are hidden when out of view) */
	return elemTop <= docViewBottom + threshold && elemBottom >= docViewTop + threshold;
}

// Put all scroll events in throttledScrollEvents()
window.addEventListener("scroll", function (e) {
	if (!scrollTimeout) {
		scrollTimeout = setTimeout(function () {
			throttledScrollEvents();
			scrollTimeout = null;
		}, 200);
	}
});

window.addEventListener("resize", function () {
	windowHeight = window.innerHeight;
});

// Set true browser height
var vh = window.innerHeight * 0.01,
	windowWidth = window.innerWidth;
function setTrueBrowserHeight() {
	// First we get the viewport height and we multiple it by 1% to get a value for a vh unit
	var vh = window.innerHeight * 0.01;
	// Then we set the value in the --vh custom property to the root of the document
	document.documentElement.style.setProperty("--vh", vh + "px");
}
setTrueBrowserHeight();

window.addEventListener("resize", function () {
	// Checks to see if the window width has changed before updating --vh
	if (window.innerWidth !== windowWidth || windowWidth > 400) {
		windowWidth = window.innerWidth;
		setTrueBrowserHeight();
	}
});

// Document Ready Listener
if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
	documentReady();
} else {
	document.addEventListener("DOMContentLoaded", documentReady);
}
