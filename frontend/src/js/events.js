import { elements, getUserObj, loadPage } from './utils.js'
import { loginUser, logoutUser, registerUser } from './auth.js'
import { loadProfilePage, updateUser, updateUserAvatar } from './profile.js';


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
	document.getElementById("profile-link").addEventListener("click",
		() => loadProfilePage(getUserObj().id));
	document.getElementById("navbar-home-link").addEventListener("click",
		() => loadPage(elements.homePage));
	
	document.getElementById("change-avatar-form").addEventListener("submit", function(event) {
		event.preventDefault();
		updateUserAvatar(this);
	});

	document.getElementById("change-username-form").addEventListener("submit", function(event) {
		event.preventDefault();
		updateUser(this);
	});

	document.getElementById("change-password-form").addEventListener("submit", function(event) {
		event.preventDefault();
		updateUser(this);
	});
}
