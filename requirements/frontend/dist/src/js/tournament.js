import { logoutUser } from "./auth.js"
import { API, elements, getTokensObj, loadPage, sockets, closeSocket, gameDictRemote } from "./utils.js"
import { monitorGame } from "./game-page.js"
import { fetchAllUsers } from "./search.js"
import { getUserIdFromToken } from "./utils.js";


export async function monitorTournament() {

	const allUsers = await fetchAllUsers()
	const encodedToken = encodeURIComponent(getTokensObj().access)
	sockets.tournamentSocket = new WebSocket(`wss://localhost:5544/ws/tournament/1/?token=${encodedToken}`)

	sockets.tournamentSocket.onmessage = function(message) {
		const messageObj = JSON.parse(message.data)

		if (messageObj) {
			switch (messageObj.type) {

				case "info":
					if (messageObj.info.startsWith("The tournament has ended")) {
						sockets.tournamentSocket.close()
						sockets.tournamentSocket = null

						const winner = allUsers.find(user => user.id == messageObj.winner)
						const winnerText = "The winner is " + winner.username + "!"
						loadPage(elements.waitingPageTournament)
						const dynamicText = elements.waitingPageTournament.querySelector(".dynamic-text")
						dynamicText.textContent = messageObj.info + " " + winnerText
					} else if (messageObj.info.startsWith("Wait, the tournament has already started") || messageObj.info.startsWith("You")) {
						sockets.tournamentSocket.close()
						sockets.tournamentSocket = null
						loadPage(elements.waitingPageTournament)
						const dynamicText = elements.waitingPageTournament.querySelector(".dynamic-text")
						dynamicText.textContent = messageObj.info
					} else if (messageObj.info.startsWith("Wait")) {
						loadPage(elements.waitingPageTournament)						
						const dynamicText = elements.waitingPageTournament.querySelector(".dynamic-text")
						dynamicText.textContent = messageObj.info
					} else {
						const stage = messageObj.info
						const userId = getUserIdFromToken()
						if (userId == messageObj.game_1_user_1 || userId == messageObj.game_1_user_2) {
							//* Connect to room with the id of the user 1 of game 1
							if (userId == messageObj.game_1_user_2) {
								setTimeout(function() {
									monitorGame(messageObj.game_1_user_1, "", "", stage);
								}, 500);
							} else {
								monitorGame(messageObj.game_1_user_1, "", "", stage)
							}
						} else {
							//* Connect to room with the id of the user 1 of game 2
							if (userId == messageObj.game_2_user_2) {
								setTimeout(function() {
									monitorGame(messageObj.game_2_user_1, "", "", stage);
								}, 500);
							} else {
								monitorGame(messageObj.game_2_user_1, "", "", stage);
							}
						}
					}
					break
			}
		}
	}
}
