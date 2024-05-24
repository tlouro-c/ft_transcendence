import { elements, getUserObj, loadPage } from './utils.js'
import { loginUser, logoutUser, registerUser } from './auth.js'
import { loadProfilePage, updateUser, updateUserAvatar } from './profile.js';
import { loadSearchResults } from './search.js';
import { sendFriendRequest } from './friends.js';
import { loadChatPage } from './chat.js';


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
	document.getElementById("navbar-play-link").addEventListener("click",
		() => loadPage(elements.gamePage));
	document.getElementById("navbar-chat-link").addEventListener("click",
		() => loadChatPage());
	document.getElementById("home-page-chat-link").addEventListener("click",
		() => loadChatPage());
	document.getElementById("home-page-play-link").addEventListener("click",
		() => loadPage(elements.gamePage));
	
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

	document.getElementById("search-form").addEventListener("submit", function(event) {
		event.preventDefault();
		loadSearchResults(this);
	});


	document.getElementById("play-against-ai-btn").addEventListener("click", function(event) {
		event.preventDefault();
		loadPage(elements.localPlayPage);
	});
}
