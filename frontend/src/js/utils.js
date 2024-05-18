import { logoutUser, refreshAccessToken } from "./auth.js";

export const elements = {
	loginPage : document.getElementById("login-page"),
	registerPage : document.getElementById("register-page"),
	homePage : document.getElementById("home-page"),
	dynamicPages : document.querySelectorAll(".dynamic-page"),
}


export function clearMain() {
	elements.dynamicPages.forEach(function(element) {
		element.classList.add("d-none");
	});
}

export function loadPage(page) {
	const temporaryMessages = document.querySelectorAll('.temporary-message');
	temporaryMessages.forEach((element) => element.remove());
	clearMain();
	if (page != elements.loginPage && page != elements.registerPage) {
		const navbar = document.querySelectorAll(".user-navbar");
		navbar.forEach((element) => element.classList.remove("d-none"));
		if (isTokenAccessExpired() && !refreshAccessToken()) {
			logoutUser();
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


export function isTokenAccessExpired() {
	try {
		const accessToken = getTokensObj().access;
		const decodedToken = parseJwt(accessToken);
		if (!accessToken || !decodedToken || !decodedToken.exp) {
			return true;
		}
		const currentTime = Math.floor(Date.now() / 1000);
		return currentTime > decodedToken.exp;
	}
	catch {
		return true;
	}
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
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

export function getUserObj() {
	try {
		const user = JSON.parse(localStorage.getItem('user'));
		return user ? user : {};
	}
	catch {
		return {};
	}
}
