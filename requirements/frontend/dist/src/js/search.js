
import { logoutUser } from "./auth.js";
import { acceptFriendRequest, blockUser, sendFriendRequest, unblockUser } from "./friends.js";
import { TokenVerification } from "./jwt.js";
import { loadProfilePage } from "./profile.js";
import { API, elements, loadPage } from "./utils.js";
import { getTokensObj, getUserObj } from "./utils.js";


export async function fetchAllUsers() {

	try {
		TokenVerification();
		const response = await fetch(`${API}/user_management/users/`, {
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
	const currentUser = users.find((user) => user.id == getUserObj().id);

	document.querySelectorAll(".tmp-entry").forEach((element) => element.remove());

	loadPage(elements.searchPage);

	users.forEach((user) => {
		const tmpUsername = user.username.toLowerCase();
		if (tmpUsername.startsWith(inputText)) {
			const userEntry = userTemplate.cloneNode(true);
			const imBlocked = currentUser.blocked_by.find((blocker) => blocker == user.username);
			const isBlocked = currentUser.blocked.find((blocker) => blocker == user.username);
			const isFriend = currentUser.friends.find((friend) => friend.id == user.id)

			const addFriendButton = userEntry.querySelector(".add-friend-button");
			const blockButton = userEntry.querySelector(".block-button");
			const unblockButton = userEntry.querySelector(".unblock-button");
			const friendsText = userEntry.querySelector(".friends-text");
			const sentText = userEntry.querySelector(".sent-text");

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
			userEntry.querySelector(".user-link").addEventListener("click", () => {
				loadProfilePage(user.id);
			});

			if (user != currentUser && !isFriend ) {
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
				}
			}
			resultsList.appendChild(userEntry);
		}
	});

}
