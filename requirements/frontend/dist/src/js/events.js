import { elements, getUserObj, loadPage } from './utils.js'
import { loginUser, logoutUser, registerUser } from './auth.js'
import { loadProfilePage, updateUser, updateUserAvatar } from './profile.js';
import { loadSearchResults } from './search.js';
import { loadChatPage } from './chat.js';
import { loadGamePage } from './game-page.js';


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
		() => loadGamePage());
	document.getElementById("navbar-chat-link").addEventListener("click",
		() => loadChatPage());
	document.getElementById("home-page-chat-link").addEventListener("click",
		() => loadChatPage());
	document.getElementById("home-page-play-link").addEventListener("click",
		() => loadGamePage());
	
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
		document.getElementById('game-column').classList.add('d-none');
		document.getElementById('game-menu-column').classList.remove('d-none');
		document.getElementById('menu').style.display ="block";
		console.log(document.getElementById('game-menu-column').classList)
		loadPage(elements.localPlayPage);
	});

	document.getElementById("start-game-btn").addEventListener("click", (event) => {
		event.preventDefault();
		startGame()
	});

}
