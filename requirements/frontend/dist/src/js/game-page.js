import { logoutUser } from "./auth.js"
import { TokenVerification } from "./jwt.js"
import { fetchAllUsers } from "./search.js"
import { startRemoteGame } from "./single-player-game/game-remote.js"
import { API, elements, getTokensObj, loadPage, sockets, closeSocket, gameDictRemote } from "./utils.js"
import { getUserObj } from "./utils.js"
// import { update_game_data } from "./single-player-game/game-remote.js"


export async function loadGamePage() {

	const invitesList = document.getElementById("invitesList")
	const oneVsOneList = document.getElementById("oneVsOneList")
	const roomsList = document.getElementById("roomsList")
	const friendTemplate = oneVsOneList.querySelector("#game-friend-template")
	const inviteTemplate = invitesList.querySelector("#invite-template")
	const allUsers = await fetchAllUsers()
	const userInfo = allUsers.find(user => user.id == getUserObj().id)


	const pendingInvites = await fetchPendingInvites()

	loadPage(elements.gamePage)

	elements.gamePage.querySelectorAll(".tmp").forEach(element => element.remove())
	let invites = []

	pendingInvites.forEach(invite => {
		invites.push(invite.invited_by)
		const invited_by = allUsers.find(user => user.id == invite.invited_by)
		const inviteElement = inviteTemplate.cloneNode(true)
		inviteElement.classList.remove("d-none")
		inviteElement.classList.add("tmp")
		inviteElement.querySelector(".friend-username").textContent = invited_by.username
		inviteElement.querySelector(".friend-avatar").setAttribute('src', API + invited_by.avatar)
		inviteElement.querySelector("button").addEventListener("click", event => {
			event.preventDefault()
			monitorGame(userInfo.id + invited_by.id)
		});
		invitesList.appendChild(inviteElement)
	})

	userInfo.friends.forEach((friend) => {

		if (invites.includes(String(friend.id)) == false) {
			const friendElement = friendTemplate.cloneNode(true)
			friendElement.classList.remove("d-none")
			friendElement.classList.add("tmp")
			friendElement.querySelector(".friend-username").textContent = friend.username
			friendElement.querySelector(".friend-avatar").setAttribute('src', API + friend.avatar)
			friendElement.querySelector("form").addEventListener("submit", function(event) {
				event.preventDefault()

				const formData = new FormData(this)
				
				const mode3D = formData.get('mode3D') == ''
				const modeHazard = formData.get('modeHazard') == ''
				
				monitorGame(userInfo.id + friend.id, mode3D, modeHazard)
			})
			oneVsOneList.appendChild(friendElement)
		}
		
	})

}


async function fetchPendingInvites() {

	try {
		TokenVerification()
		const response = await fetch(`http://localhost:8001/game/pending/${getUserObj().id}/`, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Authorization': `Bearer ${getTokensObj().access}`
			},
		})
		const json = await response.json()
		return json
	}
	catch(e) {
		console.log(e)
		return {}
	}
}

export async function fetchGameHistory(userId) {

	try {
		TokenVerification()
		const response = await fetch(`http://localhost:8001/game/history/${userId}/`, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Authorization': `Bearer ${getTokensObj().access}`
			},
		})
		const json = await response.json()
		return json
	}
	catch(e) {
		console.log(e)
		return {}
	}
}

//! Problems
async function loadRealTimeGame(opponentId, ballOwner) {

	const allUsers = await fetchAllUsers()
	const userInfo = allUsers.find(user => user.id == getUserObj().id)
	const opponentInfo = allUsers.find(user => user.id == opponentId)

	loadPage(elements.remotePlayPage);
	elements.remotePlayPage.querySelector('.user-avatar').setAttribute('src', API + userInfo.avatar)
	elements.remotePlayPage.querySelector('.user-name').textContent = userInfo.username
	elements.remotePlayPage.querySelector('.opponent-avatar').setAttribute('src', API + opponentInfo.avatar)
	elements.remotePlayPage.querySelector('.opponent-name').textContent = opponentInfo.username
	document.getElementById("scoreRightRemote").textContent = '0'
	document.getElementById("scoreLeftRemote").textContent = '0'
	document.getElementById("winnerBoardRemote").textContent = "First to 7 wins!"
	gameDictRemote.instance = startRemoteGame(ballOwner)
}


function monitorGame(roomId, mode3D, modeHazard) {

	const encodedToken = encodeURIComponent(getTokensObj().access)
	sockets.gameSocket = new WebSocket(`ws://localhost:8001/ws/game/${roomId}/?token=${encodedToken}&mode_3d=${mode3D}&mode_hazard=${modeHazard}`)

	document.getElementById("testPoint").addEventListener("click", (event) => {
		event.preventDefault();
		
		const toSend = {
			"type": "point",
			"point_winner": getUserObj().id
		}
		sockets.gameSocket.send(JSON.stringify(toSend));
	});

	sockets.gameSocket.onmessage = function(message) {
		const messageObj = JSON.parse(message.data)

		const waitingMessage = elements.waitingPage.querySelector("h1")
		const counterElements = elements.waitingPage.querySelectorAll(".counter")

		if(messageObj){
			switch (messageObj.type) {
				case 'info':
					if (messageObj.info == "Wait") {
						loadPage(elements.waitingPage)
						waitingMessage.classList.remove('d-none')
					} else {
						const ballOwner = messageObj.ball_owner
						loadPage(elements.waitingPage)
						waitingMessage.classList.add('d-none')
						counterElements.forEach((element, index) => {
							setTimeout(() => {
								if (index > 0) {
									counterElements[index - 1].classList.add('d-none');
								}
								element.classList.remove('d-none');
							}, index * 1000);
						})
						setTimeout(() => {
							loadRealTimeGame(roomId - getUserObj().id, ballOwner)
						}, 3000);
					}
					break
				case 'point':
					const pointWinner = messageObj.point_winner
					if (pointWinner == getUserObj().id) {
						const current_score = parseInt(document.getElementById("scoreLeftRemote").textContent, 10)
						document.getElementById("scoreLeftRemote").textContent = current_score + 1
					} else {
						const current_score = parseInt(document.getElementById("scoreRightRemote").textContent, 10)
						document.getElementById("scoreRightRemote").textContent = current_score + 1
					}
					break
				case 'win':
					const matchWinner = messageObj.winner
					if (matchWinner == getUserObj().id) {
						document.getElementById("winnerBoardRemote").textContent = "You won"
					} else {
						document.getElementById("winnerBoardRemote").textContent = "You lost"
					}
					gameDictRemote.instance.running = false;
					closeSocket(sockets.gameSocket)
					break
				case "ball_updates":
				case "player_input":
					// console.log(gameDictRemote.instance.running)
					gameDictRemote.instance.update_game_data(messageObj['data']);

			}
		}
	}
	sockets.gameSocket.onerror = function(err) {
		console.log("WebSocket encountered an error: " + err.message);
		console.log("Closing the socket.");
		game_socket.close();
	}
}
