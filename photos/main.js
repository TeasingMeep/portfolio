"use strict";

var s1 = window.pageYOffset,
	s2,
	scrollTimeout,
	windowHeight = window.innerHeight,
	gridItems,
	headerHeight,
	scrollElements = document.querySelectorAll(".scroll-element");

var documentReady = function () {
	scrollElements = document.querySelectorAll(".scroll-element");
	const siteHeader = document.getElementById("site-header");
	const mainContainer = document.querySelector("main");
	throttledScrollEvents();

	photoAnimation(document.body);
	document.body.classList.add("initiated");
};

function photoAnimation(newcontainer) {
	const landing = newcontainer.querySelector("#landing");
	const triptic = newcontainer.querySelector("#triptic");
	const finish = newcontainer.querySelector("#finish");
	const h1 = newcontainer.querySelector("h1");

	if (!landing || !triptic || !finish) {
		document.body.classList.add("no-animation");
		return console.warn("missing something", { landing }, { triptic }, { finish });
	}
	gsap.registerPlugin(ScrollTrigger, SplitText);

	const h1InnerContainer = h1.querySelector(".h1-inner-container");
	let h1Height = 0;
	if (!h1) console.warn("no h1");
	else {
		h1Height = h1.offsetHeight;
		ScrollTrigger.create({
			trigger: h1,
			end: `+=${newcontainer.scrollHeight}`,
			pin: true,
			pinSpacing: false,
			markers: false,
		});
	}

	const landingFioure = landing.querySelector("figure");
	const tripticInner = triptic.querySelector(".triptic-inner-container");
	const animationContainer = newcontainer.querySelector("#animation-container");
	const finishText = newcontainer.querySelectorAll("#finish p");
	if (!animationContainer) console.warn("no animation container");
	else {
		function tripticTrickel(container) {
			const trickelAnimation = gsap.timeline();
			const figures = container.querySelectorAll("figure");

			figures.forEach((figure) => {
				gsap.set(figure, { opacity: 0, scale: 0.88 });
				trickelAnimation.to(figure, { opacity: 1, scale: 1 }, "<.15");
			});

			return trickelAnimation;
		}
		let animationTimeline = gsap.timeline();

		// Triptic trickle in -> use nested tl
		animationTimeline.to(landingFioure, { opacity: 1, ease: "none" });
		animationTimeline.to(tripticInner, { opacity: 1, ease: "none" });
		animationTimeline.to(landingFioure, { opacity: 0, ease: "none" }, "<");
		animationTimeline.add(tripticTrickel(tripticInner), "<");
		animationTimeline.to(tripticInner, { opacity: 0, ease: "none" });
		animationTimeline.to(h1InnerContainer, { y: windowHeight / 2 - h1Height - 2, ease: "none" }, ">-.22");
		animationTimeline.to(finishText, { opacity: 1, ease: "none" }, "<+=.2");

		ScrollTrigger.create({
			trigger: animationContainer,
			animation: animationTimeline,
			start: "top center",
			end: `+=${animationContainer.offsetHeight - h1Height / 2}`,
			// end: `bottom bottom`,
			pin: false,
			scrub: true,
			markers: false,
		});
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
