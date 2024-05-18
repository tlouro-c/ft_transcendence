import { elements, capitalizeFirstLetter, loadPage, getTokensObj } from "./utils.js";


async function proccessAuthForm(url, form, type) {

	const formData = new FormData(form);
	const username = formData.get('username').trim();
	const password = formData.get('password');
	const confirmPassword = formData.get('confirm-password');
	if (username.length == 0 || password.length == 0 ||
		(confirmPassword && confirmPassword.length == 0)) {
			alert("Empty field(s).")
			return ;
		}

	let errorText = "";
	if (confirmPassword && confirmPassword != password) {
		errorText = "The passwords don't match";
	}
	formData.delete('confirm-password');
	const formJson = {};
	formData.forEach((value, key) => formJson[key] = value);

	try {
		let json = {};
		let response = {};
		if (!errorText) {
			response = await fetch(url, {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formJson),
			});

			json = await response.json();
		}
		if (errorText || json.detail || (response.status >= 400 && (json.username ||  json.password))) {
			let errorP;
			const passwordBox = document.getElementById(type + '-password-box');
			if (!document.querySelector('#' + type + '-password-box p')) {
				errorP = document.createElement("p");
			} else {
				errorP = document.querySelector('#' + type + '-password-box p');
			}
			errorP.textContent = capitalizeFirstLetter(errorText || json.detail 
				|| (json.username ? json.username[0] : json.password[0]));
			errorP.classList.add("temporary-message");
			errorP.classList.add("p-2");
			errorP.classList.add("m-0");
			passwordBox.appendChild(errorP);
		} else {
			return (json);
		}
	}
	catch (error) {
		alert(error);
	}
}


export async function loginUser(optionalForm) {
	const loginForm = optionalForm ? optionalForm :  document.getElementById('login-form');
	const responseJson = await proccessAuthForm('http://localhost:8000/user_management/login/', loginForm, 'login');
	if (!responseJson) {
		return;
	}
	const tokens = { 'refresh': responseJson.refresh, 'access': responseJson.access };
	window.localStorage.setItem('tokens', JSON.stringify(tokens));
	const user = {'id': responseJson.user_id, 'username': responseJson.username };
	window.localStorage.setItem('user', JSON.stringify(user));
	loadPage(elements.homePage);
}


export async function registerUser() {
	const registerForm = document.getElementById('register-form');
	const responseJson = await proccessAuthForm('http://localhost:8000/user_management/register/', registerForm, 'register');
	if (responseJson) {
		loginUser(registerForm);
	}
}

export async function logoutUser() {
	
	const refreshToken = getTokensObj().refresh;
	localStorage.clear();

	try {
		const response = await fetch("http://localhost:8000/user_management/logout/", {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(refreshToken),
		});
	}
	catch {
		alert("Logout failed, try again later...");
	}
	loadPage(elements.loginPage);
}


export async function refreshAccessToken() {

	const refreshToken = getTokensObj().refresh;

	try {
		const response = await fetch("http://localhost:8000/user_management/refresh_token/", {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(refreshToken),
		});
		if (response.status >= 400) {
			logoutUser();
		} else {
			const json = await response.json();

			const tokens = { 'refresh': refreshToken, 'access': json.access };
			localStorage.setItem('tokens', JSON.stringify(tokens));
			return true;
		}
	}
	catch (error) {
		console.error('Error during token refresh, logging out...', error);
		logoutUser();
	}
}
