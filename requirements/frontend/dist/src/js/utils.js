import { logoutUser } from "./auth.js";
import { loadChatPage } from "./chat.js";
import { loadGamePage } from "./game-page.js";
import { loadHomePage } from "./home.js";
import { isTokenAccessExpired, refreshAccessToken } from "./jwt.js"
import { loadProfilePage } from "./profile.js";
import { loadSearchResults } from "./search.js";

export const API = 'https://localhost:5544/';

export const elements = {
	loginPage : document.getElementById("login-page"),
	registerPage : document.getElementById("register-page"),
	homePage : document.getElementById("home-page"),
	profilePage: document.getElementById("profile-page"),
	searchPage: document.getElementById("search-page"),
	chatPage: document.getElementById("chat-page"),
	gamePage: document.getElementById("game-page"),
	waitingPage: document.getElementById("waiting-page"),
	waitingPageTournament: document.getElementById("waiting-page-tournament"),
	localPlayPage: document.getElementById("local-play-page"),
	remotePlayPage: document.getElementById("remote-play-page"),
	dynamicPages : document.querySelectorAll(".dynamic-page"),
}

export const sockets = {
	chatSocket: null,
	gameSocket: null,
	tournamentSocket: null
}

export const gameDict = {
	instance: null,
}

export const gameDictTournament = {
	instance: null,
}

export const gameDictRemote = {
	instance: null,
}

export function clearMain() {
	elements.dynamicPages.forEach(function(element) {
		element.classList.add("d-none");
	});
}

export async function loadPage(page) {
	const temporaryMessages = document.querySelectorAll('.temporary-message');
	temporaryMessages.forEach((element) => element.remove());
	Array.from(document.getElementById('chat-tmp-header').children).forEach(element => element.classList.add('d-none'));
	clearMain();
	if (page != elements.loginPage && page != elements.registerPage) {
		const navbar = document.querySelectorAll(".user-navbar");
		navbar.forEach((element) => element.classList.remove("d-none"));
		if (isTokenAccessExpired()) {
			await refreshAccessToken();
		}
	} else {
		const navbar = document.querySelectorAll(".user-navbar");
		navbar.forEach((element) => element.classList.add("d-none"));
	}
	page.classList.remove("d-none");
}

export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getTokensObj() {
	try {
		const tokens = JSON.parse(localStorage.getItem('tokens'));
		return tokens ? tokens : {};
	}
	catch {
		return {};
	}
}

export function getUserIdFromToken() {
	const token = getTokensObj().access;
	if (token) {
		const payload = token.split('.')[1];
		const decoded = atob(payload);
		const obj = JSON.parse(decoded);
		return obj.user_id;
	}
	logoutUser();
}

export function closeSocket(socket) {
	if (socket != null) {
		socket.close()
	}
}

export function closeAllSockets() {
	closeSocket(sockets.gameSocket)
	sockets.gameSocket = null
	closeSocket(sockets.chatSocket)
	sockets.chatSocket = null
	closeSocket(sockets.tournamentSocket)
	sockets.tournamentSocket = null
}


export function ClearBackgroundResources() {
	closeAllSockets()
	document.querySelectorAll(".tmp-dashboard-entry").forEach((element) => element.remove())

	if (gameDict.instance != null) {
		gameDict.instance.Stop()
		delete gameDict.instance
		gameDict.instance = null
	}
	if (gameDictTournament.instance != null) {
		gameDictTournament.instance.Stop()
		delete gameDictTournament.instance
		gameDictTournament.instance = null
	}
}

export function initializeRouter() {
    window.addEventListener('popstate', (event) => {
		event.preventDefault();
		const href = window.location.href.substring(window.location.href.indexOf('#')) || '';

        handleNavigation(href, -1, false);
    });
}

export function handleNavigation(path, id = -1, pushState = true) {

	if (path == '#profile' && id == -1) {
		id = getUserIdFromToken();
	} else if (path.substring(0, 9) == '#profile_') {
		id = parseInt(path.split('_')[1]);
		path = '#profile';
	}
	if (pushState) {
		window.history.pushState({}, '', path + (id != -1 ? `_${id}` : ''));
	}

	ClearBackgroundResources();

    switch (path) {
        case '#game':
            loadGamePage();
            break;
		case '#chat':
			loadChatPage();
			break;
		case '#search':
			const emptyForm = document.getElementById("search-form");
			loadSearchResults(emptyForm);
			break;
		case '#profile':
			loadProfilePage(id);
			break;
        default:
			loadHomePage();
			break;
    }
}
