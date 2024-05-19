import { TokenVerification } from "./jwt.js";
import { API, getTokensObj, getUserObj } from "./utils.js"
import { loadProfilePage } from "./profile.js";

async function friendFunction(userId, action) {

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
			loadProfilePage(getUserObj().id);
		}
	}
	catch (error) {
		alert("Error: " + error);
	}
}

export async function sendFriendRequest(userId) {
	await friendFunction(userId, 'send_friend_request');
}

export async function acceptFriendRequest(userId) {
	await friendFunction(userId, 'accept_friend_request');
}

export async function rejctFriendRequest(userId) {
	await friendFunction(userId, 'reject_friend_request');
}

export async function removeFriend(userId) {
	await friendFunction(userId, 'friend_remove');
}


