import { elements, loadPage, closeAllSockets, gameDict, ClearBackgroundResources} from './utils.js'
import { loginUser, logoutUser, registerUser } from './auth.js'
import { loadProfilePage, updateUser, updateUserAvatar } from './profile.js';
import { loadSearchResults } from './search.js';
import { startGame } from './single-player-game/gameDouble.js';
import { monitorTournament } from './tournament.js';
import { startLocalTournament } from './single-player-game/localTournament.js';
import { getUserIdFromToken } from "./utils.js";


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
		() => {loadPage(elements.loginPage)});
	document.getElementById("create-account-link").addEventListener("click", 
		() => {loadPage(elements.registerPage)});
	document.getElementById("sign-out-link").addEventListener("click", 
		() => {ClearBackgroundResources(); logoutUser()});
	document.getElementById("profile-link").addEventListener("click",
		() => {ClearBackgroundResources(); loadProfilePage(getUserIdFromToken())});
	
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
		closeAllSockets()
		loadSearchResults(this);
	});


	document.getElementById("play-against-ai-btn").addEventListener("click", function(event) {
		event.preventDefault();
		document.querySelectorAll(".local-play-avatar").forEach(element => element.classList.add('d-none'))
		document.getElementById('game-column').classList.add('d-none');
		document.getElementById('game-menu-column').classList.remove('d-none');
		document.getElementById('menu').style.display ="block";
		loadPage(elements.localPlayPage);
	});

	document.getElementById("play-tournament-btn").addEventListener("click", function(event) {
		event.preventDefault()
		monitorTournament()
	});

	document.getElementById("start-game-btn").addEventListener("click", (event) => {
		event.preventDefault();
		
		gameDict.instance = startGame()
	});

	document.getElementById("play-local-tournament").addEventListener("click", (event) => {
		event.preventDefault();

		document.querySelectorAll(".local-play-avatar").forEach(element => element.classList.add('d-none'))
		document.getElementById('game-column').classList.add('d-none');
		loadPage(elements.localPlayPage);
		startLocalTournament()
	});



}
