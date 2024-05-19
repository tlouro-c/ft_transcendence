import { logoutUser } from "./auth.js";
import { acceptFriendRequest, rejctFriendRequest, removeFriend } from "./friends.js";
import { TokenVerification } from "./jwt.js";
import { capitalizeFirstLetter, elements, getTokensObj, getUserObj, loadPage, API } from "./utils.js";


export async function loadProfilePage(userId) {

	const privateUtils = document.querySelectorAll(".private-profile");
	if (userId != getUserObj().id) {
		privateUtils.forEach((element) => { element.classList.add('d-none') })
	} else {
		privateUtils.forEach((element) => { element.classList.remove('d-none') })
	}

	const userInfo = await fetchUser(userId);
	console.log(userInfo)
	await loadPage(elements.profilePage);

	const url = API + userInfo.avatar;
	document.getElementById("user-avatar").setAttribute('src', url);
	document.getElementById("profileOnlineStatus").classList.add("d-none");
	document.getElementById("profileOfflineStatus").classList.add("d-none");
	if (userInfo.online_status == "online") {
		document.getElementById("profileOnlineStatus").classList.remove("d-none");
	} else {
		document.getElementById("profileOfflineStatus").classList.remove("d-none");
	}
	document.getElementById("profile-username").textContent = userInfo.username;

	const friendsList = document.getElementById("friends-list");
	const pendingFriendsList = document.getElementById("pending-friends-list");
	const friendTemplate = document.getElementById("friend-template");
	const pendingFriendTemplate = document.getElementById("pending-friend-template");

	document.querySelectorAll(".tmp-friend").forEach((element) => element.remove());

	document.getElementById("friends-counter").textContent = userInfo.friends.length;
	userInfo.friends.forEach((element) => {
		const friend = friendTemplate.cloneNode(true);
		friend.removeAttribute("id");
		friend.classList.remove("d-none");
		friend.classList.add("tmp-friend");
		friend.querySelector(".friend-avatar").setAttribute('src', API + element.avatar);
		friend.querySelector(".friend-username").textContent = element.username;
		friend.querySelector(".friend-link").addEventListener("click", () => {
			loadProfilePage(element.id);
		});
		friend.querySelector(".btn-remove").addEventListener("click", () => {
			removeFriend(element.id);
		});
		friendsList.appendChild(friend);
	});
	
	document.getElementById("pending-friends-counter").textContent = userInfo.pending_friends.length;
	userInfo.pending_friends.forEach((element) => {
		const pendingFriend = pendingFriendTemplate.cloneNode(true);
		pendingFriend.removeAttribute("id");
		pendingFriend.classList.remove("d-none");
		pendingFriend.classList.add("tmp-friend");
		pendingFriend.querySelector(".friend-avatar").setAttribute('src', API + element.avatar);
		pendingFriend.querySelector(".friend-username").textContent = element.username;
		pendingFriend.querySelector(".friend-link").addEventListener("click", () => {
			loadProfilePage(element.id);
		});
		pendingFriend.querySelector(".btn-reject").addEventListener("click", () => {
			rejctFriendRequest(element.id);
		});
		pendingFriend.querySelector(".btn-accept").addEventListener("click", () => {
			acceptFriendRequest(element.id);
		});
		pendingFriendsList.appendChild(pendingFriend);
	});
}


export async function fetchUser(userId) {

	try {
		await TokenVerification();
		const response = await fetch(`${API}/user_management/user/${userId}/`, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Authorization': `Bearer ${getTokensObj().access}`
			},
		});
		if (response.status >= 400) {
			logoutUser();
		}
		const user = await response.json();
		return user;
	}
	catch {
		logoutUser();
	}
}


export async function updateUser(form) {

	const formData = new FormData(form);

	const username = formData.get('new_username')
	const password = formData.get('new_password');
	const confirmPassword = formData.get('new_password_confirm');
	if (!password && username.trim().length == 0) {
		alert("Invalid username");
		return;
	} else if (password != confirmPassword) {
		alert("The passwords don't match");
		return;
	}

	let formJson;
	if (password) {
		formJson = {'password': password};
	} else {
		formJson = {'username': username};
	}

	try {
		await TokenVerification();
		const response = await fetch(`${API}/user_management/user/${getUserObj().id}/`, {
			method: 'PATCH',
			credentials: 'include',
			headers: {
				'Authorization': `Bearer ${getTokensObj().access}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(formJson)
		});
		const json = await response.json();
		if (response.status >= 400 && (json.username || json.password)) {
			alert(capitalizeFirstLetter(json.username ? json.username[0] : json.password[0]));
			return;
		} else {
			const modalElement = document.getElementById(password ? 'change-password': 'change-username');
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal.hide();
			loadProfilePage(getUserObj().id);
		}
	}
	catch (error) {
		alert("Error: " + error);
	}
}


export async function updateUserAvatar() {
	
	const formData = new FormData(document.getElementById('change-avatar-form'));

	try {
		await TokenVerification();
		const response = fetch(`${API}/user_management/user/${getUserObj().id}/`, {
			method: 'PATCH',
			credentials: 'include',
			headers: {
				'Authorization': `Bearer ${getTokensObj().access}`,
			},
			body: formData
		});
		if (response.status >= 400) {
			alert(response.status);
		} else {
			const modalElement = document.getElementById('change-avatar');
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal.hide();
			loadProfilePage(getUserObj().id);
		}
	}
	catch {
		alert("Error changing avatar");
	}
}

export async function fetchUserAvatar(url) {

	try {
		await TokenVerification();
		const response = await fetch(url, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Authorization': `Bearer ${getTokensObj().access}`,
			},
		});
		if (response.status >= 400) {
			return ('Not Found 404');
		}
		const img = await response.blob();
		return URL.createObjectURL(img);
	}
	catch {
		return ('Not Found 404')
	}
}
