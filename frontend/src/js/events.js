import { elements, loadPage } from './utils.js'
import { loginUser, logoutUser, registerUser } from './auth.js'


export function setupEventListeners() {

	document.getElementById("login-form").addEventListener("submit", function(event) {
		event.preventDefault();
		loginUser();
	});

	document.getElementById("register-form").addEventListener("submit", function(event) {
		event.preventDefault();
		registerUser();
	});

	document.getElementById("i-have-an-account-link").addEventListener("click",
		() => loadPage(elements.loginPage));
	document.getElementById("create-account-link").addEventListener("click", 
		() => loadPage(elements.registerPage));
	document.getElementById("sign-out-link").addEventListener("click", 
		() => logoutUser());

	
}
