import { fetchUser } from "./profile.js";
import { API, elements, loadPage } from "./utils.js";
import { getUserObj } from "./utils.js";


export async function loadChatPage() {

	const userInfo = await fetchUser(getUserObj().id);
	const friends = userInfo.friends;
	const blocked = userInfo.blocked;
	await loadPage(elements.chatPage);

	const friendsBox = document.getElementById("chat-friends-box");
	const friendTemplate = friendsBox.querySelector("#chat-friend-template");

	friendsBox.querySelectorAll(".tmp").forEach(element => element.remove())

	friends.forEach((element) => {
		const isBlocked = friends.find(user => user.id == element.id)
		const friend = friendTemplate.cloneNode(true);
		friend.classList.remove('d-none');
		friend.classList.add('tmp');
		friend.querySelector(".chat-user-avatar").setAttribute('src', API + element.avatar);
		friend.querySelector(".username").textContent = element.username;
		friendsBox.appendChild(friend);
	});
}
