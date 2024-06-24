import { elements, capitalizeFirstLetter, loadPage, getTokensObj, API, handleNavigation } from "./utils.js";

async function proccessAuthForm(url, form, type) {

	const formData = new FormData(form);
	const username = formData.get('username');
	const password = formData.get('password');
	const confirmPassword = formData.get('confirm-password');
	let errorList = [];

	if (/\s/.test(username)) {
		alert("Username cannot contain spaces.");
		return ;
	}
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
			if (response.status >= 400) {
				Object.keys(json).forEach(key => {
					if (Array.isArray(json[key])) {
						errorList.push(json[key][0]);
					} else {
						errorList.push(json[key]);
					}
				});
			}
		}
		if (errorText || response.status >= 400) {
			let errorP;
			const passwordBox = document.getElementById(type + '-password-box');
			if (!document.querySelector('#' + type + '-password-box p')) {
				errorP = document.createElement("p");
			} else {
				errorP = document.querySelector('#' + type + '-password-box p');
			}
			errorP.textContent = capitalizeFirstLetter(errorText
				|| errorList[0] || "An error occurred.");
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
	const responseJson = await proccessAuthForm(`${API}/user_management/login/`, loginForm, 'login');
	if (!responseJson) {
		return;
	}
	const tokens = { 'refresh': responseJson.refresh, 'access': responseJson.access };
	window.localStorage.setItem('tokens', JSON.stringify(tokens));
	handleNavigation('#home');
	loginForm.querySelectorAll(".clear").forEach(element => {
		element.value = ""
	});
}


export async function registerUser() {
	const registerForm = document.getElementById('register-form');
	const responseJson = await proccessAuthForm(`${API}/user_management/register/`, registerForm, 'register');
	if (responseJson) {
		loginUser(registerForm);
	}
	registerForm.querySelectorAll(".clear").forEach(element => {
		element.value = ""
	});
}

export async function logoutUser() {
	
	const refreshToken = getTokensObj().refresh;
	localStorage.clear();

	try {
		const response = await fetch(`${API}/user_management/logout/`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(refreshToken),
		});
	}
	catch {}
	loadPage(elements.loginPage);
}



