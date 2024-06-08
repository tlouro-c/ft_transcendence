import { setupEventListeners } from './events.js';
import { TokenVerification } from './jwt.js';
import { loadHomePage } from './home.js';


async function initialize() {
	setupEventListeners();
	if (await TokenVerification()) {
		loadHomePage();
	}
}

window.onload = initialize;

