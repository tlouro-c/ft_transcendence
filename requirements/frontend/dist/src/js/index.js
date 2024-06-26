import { setupEventListeners } from './events.js';
import { TokenVerification } from './jwt.js';
import { handleNavigation, initializeRouter } from './utils.js';


export async function initialize() {

	initializeRouter();
    
	

	setupEventListeners();
	if (await TokenVerification()) {
   		handleNavigation("#home");

		   document.querySelectorAll('a .my-link').forEach(anchor => {
			anchor.addEventListener('click', event => {
				event.preventDefault();
				const path = anchor.getAttribute('href');
				handleNavigation(path);
			});
		});
	}
}

window.onload = initialize;

