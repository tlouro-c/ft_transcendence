
import { logoutUser } from "./auth.js";
import { acceptFriendRequest, blockUser, friendFunction, removeFriend, sendFriendRequest, unblockUser } from "./friends.js";
import { TokenVerification } from "./jwt.js";
import { loadProfilePage } from "./profile.js";
import { API, elements, handleNavigation, loadPage } from "./utils.js";
import { getTokensObj } from "./utils.js";
import { getUserIdFromToken } from "./utils.js";


export async function fetchAllUsers() {

	try {
		await TokenVerification();
		const response = await fetch(`https://localhost:5544/user_management/users/`, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Authorization': `Bearer ${getTokensObj().access}`
			},
		});
		if (!response.ok) {
			logoutUser();
		} else {
			const json = response.json()
			return json;
		}
	}
	catch (e) {
		logoutUser();
	}
}


export async function loadSearchResults(form) {

	const resultsList = document.getElementById("search-results-list");
	const userTemplate = document.getElementById("user-search-template");
	const searchData = new FormData(form);
	const inputText = searchData.get('inputText').toLowerCase();
	const users = await fetchAllUsers();
	const currentUser = users.find((user) => user.id == getUserIdFromToken());

	document.querySelectorAll(".tmp-entry").forEach((element) => element.remove());

	loadPage(elements.searchPage);

	users.forEach((user) => {
		const tmpUsername = user.username.toLowerCase();
		if (tmpUsername.startsWith(inputText)) {
			const userEntry = userTemplate.cloneNode(true);
			const imBlocked = currentUser.blocked_by.find((blocker) => blocker == user.username);
			const isBlocked = currentUser.blocked.find((blocker) => blocker == user.username);
			const isFriend = currentUser.friends.find((friend) => friend.id == user.id)
			const isPending = user.pending_friends.find((friend) => friend.id == currentUser.id)

			const addFriendButton = userEntry.querySelector(".add-friend-button");
			const blockButton = userEntry.querySelector(".block-button");
			const unblockButton = userEntry.querySelector(".unblock-button");
			const friendsText = userEntry.querySelector(".friends-text");
			const sentText = userEntry.querySelector(".sent-text");

			addFriendButton.addEventListener("click", () => {
				addFriendButton.classList.add('d-none')
				blockButton.classList.add('d-none')
				if (currentUser.pending_friends.find(u => u.id == user.id)) {
					acceptFriendRequest(user.id, () => {})
					friendsText.classList.remove('d-none')
				} else {
					sendFriendRequest(user.id);
					sentText.classList.remove('d-none');
				}
			});

			sentText.addEventListener("click", () => {
				friendFunction(user.id, 'friend_remove')
				blockButton.classList.remove('d-none');
				addFriendButton.classList.remove('d-none')
				sentText.classList.add('d-none')
			});

			blockButton.addEventListener("click", () => {
				blockUser(user.id);
				blockButton.classList.add('d-none');
				unblockButton.classList.remove('d-none');
				addFriendButton.classList.add('d-none')
			});

			unblockButton.addEventListener("click", () => {
				unblockUser(user.id);
				unblockButton.classList.add('d-none');
				blockButton.classList.remove('d-none');
				addFriendButton.classList.remove('d-none')
			});

			userEntry.removeAttribute("id");
			userEntry.classList.remove("d-none");
			userEntry.classList.add("tmp-entry");
			userEntry.querySelector(".user-search-avatar").setAttribute('src', API + user.avatar);
			userEntry.querySelector(".username").textContent = user.username;
			if (user == currentUser) {
				userEntry.querySelector(".user-link").classList.add("my-link");
			}
			userEntry.querySelector(".user-link").addEventListener("click", () => {
				handleNavigation('#profile', user.id);
			});

			if (user != currentUser && !isFriend && !isPending) {
				if (isBlocked) {
					unblockButton.classList.remove('d-none');
				} else {
					blockButton.classList.remove('d-none');
				}
			}
			if (user != currentUser && !imBlocked && !isBlocked) {
				if (isFriend) {
					friendsText.classList.remove('d-none');
				} else if (user.pending_friends.find((friend) => friend.id == currentUser.id)) {
					sentText.classList.remove('d-none');
				} else {
					addFriendButton.classList.remove('d-none')
				}
			}
			resultsList.appendChild(userEntry);
		}
	});

}
