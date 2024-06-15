import { TokenVerification } from "./jwt.js"
import { fetchAllUsers } from "./search.js"
import { startRemoteGame } from "./single-player-game/game-remote.js"
import { API, elements, getTokensObj, loadPage, sockets, closeSocket, gameDictRemote } from "./utils.js"
import { getUserIdFromToken } from "./utils.js";



export async function loadGamePage() {

	const invitesList = document.getElementById("invitesList")
	const oneVsOneList = document.getElementById("oneVsOneList")
	const roomsList = document.getElementById("roomsList")
	const friendTemplate = oneVsOneList.querySelector("#game-friend-template")
	const inviteTemplate = invitesList.querySelector("#invite-template")
	const allUsers = await fetchAllUsers()
	const userInfo = allUsers.find(user => user.id == getUserIdFromToken())


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
			monitorGame(invited_by.id)
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
				
				const modeHazard = formData.get('modeHazard') == ''
				
				monitorGame(userInfo.id, modeHazard, friend.id)
			})
			oneVsOneList.appendChild(friendElement)
		}
		
	})

}


async function fetchPendingInvites() {

	try {
		await TokenVerification();
		const response = await fetch(`https://localhost:5544/game/pending/${getUserIdFromToken()}/`, {
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
		await TokenVerification();
		const response = await fetch(`https://localhost:5544/game/history/${userId}/`, {
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

async function loadRealTimeGame(opponentId, ballOwner) {


	if (!sockets.gameSocket) {
		return	
	}
	
	const allUsers = await fetchAllUsers()
	const userInfo = allUsers.find(user => user.id == getUserIdFromToken())
	const opponentInfo = allUsers.find(user => user.id == opponentId)

	loadPage(elements.remotePlayPage);
	elements.remotePlayPage.querySelector('.user-avatar').setAttribute('src', API + userInfo.avatar)
	elements.remotePlayPage.querySelector('.user-name').textContent = userInfo.username
	elements.remotePlayPage.querySelector('.opponent-avatar').setAttribute('src', API + opponentInfo.avatar)
	elements.remotePlayPage.querySelector('.opponent-name').textContent = opponentInfo.username
	document.getElementById("scoreRightRemote").textContent = '0'
	document.getElementById("scoreLeftRemote").textContent = '0'
	document.getElementById("winnerBoardRemote").textContent = "First to 7 wins!"

	if (gameDictRemote.instance) {
        delete gameDictRemote.instance;
        gameDictRemote.instance = null;
    }

	gameDictRemote.instance = startRemoteGame(ballOwner)
}

// Define the functions outside of the event listeners
function keyDownHandler(e) {
    // Your keydown handler code here
}

function keyUpHandler(e) {
    // Your keyup handler code here
}



export function monitorGame(roomId, modeHazard, invited, tournamentStage='') {

	if (gameDictRemote.instance) {
		delete gameDictRemote.instance.playerInput
		window.removeEventListener('keydown', e => {this.keyDown(e)});
		window.removeEventListener('keyup', e => {this.keyUp(e)});
		delete gameDictRemote.instance
		gameDictRemote.instance = null
	}

	const encodedToken = encodeURIComponent(getTokensObj().access)
	sockets.gameSocket = new WebSocket(`wss://localhost:5544/ws/game/${roomId}/?token=${encodedToken}&mode_hazard=${modeHazard}&invited=${invited}`)

	sockets.gameSocket.onclose = function() {
		if (gameDictRemote.instance) {
			gameDictRemote.instance.running = false
			delete gameDictRemote.instance.playerInput
			window.removeEventListener('keydown', keyDownHandler);
			window.removeEventListener('keyup', keyUpHandler);
			delete gameDictRemote.instance
			gameDictRemote.instance = null
		}
	}

	sockets.gameSocket.onmessage = function(message) {
		const messageObj = JSON.parse(message.data)

		const waitingMessage = elements.waitingPage.querySelector("h1")
		const counterElements = elements.waitingPage.querySelectorAll(".counter")

		if(messageObj){
			switch (messageObj.type) {
				case 'info':
					if (messageObj.info == "Wait") {
						counterElements.forEach(element => element.classList.add('d-none'))
						loadPage(elements.waitingPage)
						waitingMessage.classList.remove('d-none')
					} else {
						const ballOwner = messageObj.ball_owner
						loadPage(elements.waitingPage)
						counterElements.forEach(element => element.classList.add('d-none'))
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
							const opponent = messageObj.user_1 == getUserIdFromToken() ? messageObj.user_2 : messageObj.user_1
							loadRealTimeGame(opponent, ballOwner)
						}, 3000);
					}
					break					
				case 'win':
                    if (sockets.gameSocket) {
							sockets.gameSocket.close();
							sockets.gameSocket = null;
                    }
					const matchWinner = messageObj.winner

					loadPage(elements.waitingPageTournament)
					const dynamicText = elements.waitingPageTournament.querySelector(".dynamic-text")

					dynamicText.textContent = matchWinner == getUserIdFromToken() ? "You won!" : "You lost!"
					if (tournamentStage == '') {
						break
					}
					const toSend  = {
						"type": `${tournamentStage} result`,
						"winner": matchWinner
					}
					sockets.tournamentSocket.send(JSON.stringify(toSend))
					break
				case "ball_updates":
					if (gameDictRemote.instance != undefined) {
						gameDictRemote.instance.update_game_data(messageObj['data']);
					}
					break
			}
		}
	}
	sockets.gameSocket.onerror = function(err) {
		console.log("WebSocket encountered an error: " + err.message);
		console.log("Closing the socket.");
		game_socket.close();
	}
}
