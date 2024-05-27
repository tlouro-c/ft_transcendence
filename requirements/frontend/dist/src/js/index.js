import { loadPage, elements, getUserObj } from './utils.js'
import { setupEventListeners } from './events.js';
import { TokenVerification } from './jwt.js';
import { loadGamePage } from './game-page.js';
import { loadProfilePage } from './profile.js';


function initialize() {
	setupEventListeners();
	TokenVerification();
	loadProfilePage(getUserObj().id)
	//loadPage(elements.homePage);
}

window.onload = initialize;

