import { isTokenAccessExpired, refreshAccessToken } from "./jwt.js"

export const API = 'https://localhost:443/';

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

export function getUserObj() {
	try {
		const user = JSON.parse(localStorage.getItem('user'));
		return user ? user : {};
	}
	catch {
		return {};
	}
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
}


export function ClearBackgroundResources() {
	closeAllSockets()

	if (gameDict.instance != null) {
		gameDict.instance.Stop()
		delete gameDict.instance
		gameDict.instance = null
	}
}
