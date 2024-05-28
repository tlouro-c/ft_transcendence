import { isTokenAccessExpired, refreshAccessToken } from "./jwt.js"

export const API = 'http://localhost:8000';

export const elements = {
	loginPage : document.getElementById("login-page"),
	registerPage : document.getElementById("register-page"),
	homePage : document.getElementById("home-page"),
	profilePage: document.getElementById("profile-page"),
	searchPage: document.getElementById("search-page"),
	chatPage: document.getElementById("chat-page"),
	gamePage: document.getElementById("game-page"),
	waitingPage: document.getElementById("waiting-page"),
	localPlayPage: document.getElementById("local-play-page"),
	remotePlayPage: document.getElementById("remote-play-page"),
	dynamicPages : document.querySelectorAll(".dynamic-page"),
}

export const sockets = {
	chatSocket: -1,
	gameSocket: -1
}

export const gameDict = {
	instance: -1
}

export const gameDictRemote = {
	instance: -1
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
	if (socket != -1) {
		socket.close()
		socket = -1
	}
}

export function closeAllSockets() {
	closeSocket(sockets.gameSocket)
	closeSocket(sockets.chatSocket)
}


export function ClearBackgroundResources() {
	closeAllSockets()

	if (gameDict.instance != -1) {
		gameDict.instance.Stop()
		delete gameDict.instance
		gameDict.instance = -1
	}
}
