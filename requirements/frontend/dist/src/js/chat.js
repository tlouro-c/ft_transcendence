import { logoutUser } from "./auth.js";
import { TokenVerification } from "./jwt.js";
import { fetchUser } from "./profile.js";
import { API, elements, getTokensObj, loadPage } from "./utils.js";
import { getUserObj } from "./utils.js";
import { sockets } from "./utils.js";

export async function loadChatPage() {

	document.getElementById("send-msg-form").classList.add('d-none');

	const userInfo = await fetchUser(getUserObj().id);
	const friends = userInfo.friends;
	await loadPage(elements.chatPage);

	const friendsBox = document.getElementById("chat-friends-box");
	const chatBox = document.getElementById("chat-box");
	const friendTemplate = friendsBox.querySelector("#chat-friend-template");


	elements.chatPage.querySelectorAll(".tmp").forEach(element => element.remove())

	friends.forEach((element) => {
		const friend = friendTemplate.cloneNode(true);
		friend.classList.remove('d-none');
		friend.classList.add('tmp');
		friend.querySelector(".chat-user-avatar").setAttribute('src', API + element.avatar);
		friend.querySelector(".username").textContent = element.username;
		friend.addEventListener("click", (e) => {

			const active = friendsBox.querySelector(".active");
			if (active != friend) {
				if (active) {
					active.classList.remove('active');
					sockets.chatSocket.close();
				}
				chatBox.querySelectorAll(".tmp").forEach(element => element.remove());
		
				elements.chatPage.querySelectorAll(".online, .offline").forEach(element => element.classList.add('d-none'));
				if (element.online_status == "online") {
					elements.chatPage.querySelector(".online").classList.remove('d-none');
				} else {
					elements.chatPage.querySelector(".offline").classList.remove('d-none');
				}
				elements.chatPage.querySelector(".header h5").classList.remove('d-none');
				elements.chatPage.querySelector(".header h5").textContent = element.username;
			
				friend.classList.add("active");
				enterChatRoom(userInfo.id + element.id);
			}
		});
		friendsBox.appendChild(friend);
	});
}

async function fetchChatHistory(roomId) {

	try {
		TokenVerification();
		const response = await fetch(`https://localhost:443/chat/history/${roomId}/`, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Authorization': `Bearer ${getTokensObj().access}`
			},
		});
		if (response.status >= 400) {
			logoutUser()
		}

		const history = await response.json()
		return history
	}
	catch {
		logoutUser()
	}
		
}


async function enterChatRoom(roomId) {

	const chatBox = document.getElementById("chat-box");

	document.getElementById("send-msg-form").classList.remove('d-none');

	const chatHistory = await fetchChatHistory(roomId);

	chatHistory.forEach((message) => {
		let messageItem = generateMessage(message.senderId, message.content, message.time);
		chatBox.appendChild(messageItem);
	});

	chatBox.scrollTo(0, chatBox.scrollHeight);

	const encodedToken = encodeURIComponent(getTokensObj().access)
	sockets.chatSocket = new WebSocket(`wss://localhost:443/ws/chat/${roomId}/?token=${encodedToken}`);

	sockets.chatSocket.onmessage = function(message) {
		const messageObj = JSON.parse(message.data);
		let messageItem = generateMessage(messageObj.user, messageObj.message, messageObj.time);
		chatBox.appendChild(messageItem);
		chatBox.scrollTo(0, chatBox.scrollHeight);
	}

	sockets.chatSocket.onclose = function(message) {
	}

	document.getElementById("chatMessageInput").addEventListener("keyup", (e) => {
		if (e.key == 'Enter') {
			e.preventDefault()
			document.getElementById("send-msg-btn").click();
		}
	});

	document.getElementById('send-msg-form').addEventListener("submit", async function(e) {
		e.preventDefault();

		await TokenVerification();
		const formData = new FormData(this);
		const message = formData.get('message');
		if (!message) {
			return ;
		}

		const toSend = {
			'message': message
		};

		sockets.chatSocket.send(JSON.stringify(toSend));
		document.getElementById("chatMessageInput").value = '';
	});
}


function generateMessage(senderId, message, time) {
	let messageTemplate;
	if (senderId == getUserObj().id) {
		messageTemplate = document.getElementById("current-user-message-template");
	} else {
		messageTemplate = document.getElementById("other-user-message-template");
	}
	const newMessage = messageTemplate.cloneNode(true);
	newMessage.classList.remove('d-none');
	newMessage.classList.add('tmp');
	newMessage.querySelector('.message-content').textContent = message;
	newMessage.querySelector('.message-time').textContent = time;
	return newMessage
}
