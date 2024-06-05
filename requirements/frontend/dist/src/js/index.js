import { loadPage, elements, getUserObj } from './utils.js'
import { setupEventListeners } from './events.js';
import { TokenVerification } from './jwt.js';
import { loadGamePage } from './game-page.js';
import { loadProfilePage } from './profile.js';
import { loadHomePage } from './home.js';


async function initialize() {
	setupEventListeners();
	await TokenVerification();
	loadHomePage();
}

window.onload = initialize;

