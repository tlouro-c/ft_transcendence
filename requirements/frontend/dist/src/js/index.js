import { loadPage, elements } from './utils.js'
import { setupEventListeners } from './events.js';


function initialize() {
	setupEventListeners();
	loadPage(elements.homePage);
}

window.onload = initialize;

