import { loadPage, elements } from './utils.js'
import { setupEventListeners } from './events.js';
import { TokenVerification } from './jwt.js';


function initialize() {
	setupEventListeners();
	TokenVerification();
	loadPage(elements.gamePage);
}

window.onload = initialize;

