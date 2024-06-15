import { TokenVerification } from "./jwt.js";
import { API, getTokensObj } from "./utils.js"
import { loadProfilePage } from "./profile.js";
import { getUserIdFromToken } from "./utils.js";


async function friendFunction(userId, action, successFunction = () => {}) {

	try {
		await TokenVerification();
		const response = await fetch(`${API}/user_management/${action}/${userId}/`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Authorization': `Bearer ${getTokensObj().access}`
			},
		});
		if (response.status >= 400) {
			alert(response.status);
		}
		else {
			successFunction();
		}
	}
	catch (error) {
		alert("Error: " + error);
	}
}

export async function sendFriendRequest(userId) {
	await friendFunction(userId, 'send_friend_request');
}

export async function acceptFriendRequest(userId, successFunction = () => loadProfilePage(getUserIdFromToken())) {
	await friendFunction(userId, 'accept_friend_request', successFunction);
}

export async function rejctFriendRequest(userId) {
	await friendFunction(userId, 'reject_friend_request', () => loadProfilePage(getUserIdFromToken()));
}

export async function removeFriend(userId) {
	await friendFunction(userId, 'friend_remove', () => loadProfilePage(getUserIdFromToken()));
}

export async function blockUser(userID) {
	await friendFunction(userID, 'block_user');
}

export async function unblockUser(userId) {
	await friendFunction(userId, 'unblock_user');
}
