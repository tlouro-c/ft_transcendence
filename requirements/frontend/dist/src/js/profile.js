import { logoutUser } from "./auth.js"
import { acceptFriendRequest, rejctFriendRequest, removeFriend } from "./friends.js"
import { fetchGameHistory } from "./game-page.js"
import { TokenVerification } from "./jwt.js"
import { fetchAllUsers } from "./search.js"
import { elements, getTokensObj, loadPage, API, handleNavigation, ClearBackgroundResources } from "./utils.js"
import { getUserIdFromToken } from "./utils.js";

export async function loadProfilePage(userId) {

	const privateUtils = document.querySelectorAll(".private-profile")
	if (userId != getUserIdFromToken()) {
		privateUtils.forEach((element) => { element.classList.add('d-none') })
	} else {
		privateUtils.forEach((element) => { element.classList.remove('d-none') })
	}

	const allUsers = await fetchAllUsers()
	const userInfo = allUsers.find(user => user.id == userId)
	const matchHistory = (await fetchGameHistory(userId)).sort((a, b) => new Date(b.finish_time) - new Date(a.finish_time))
	await loadPage(elements.profilePage)

	const url = API + userInfo.avatar
	document.getElementById("user-avatar").setAttribute('src', url)
	document.getElementById("profileOnlineStatus").classList.add("d-none")
	document.getElementById("profileOfflineStatus").classList.add("d-none")
	if (userInfo.online_status == "online") {
		document.getElementById("profileOnlineStatus").classList.remove("d-none")
	} else {
		document.getElementById("profileOfflineStatus").classList.remove("d-none")
	}
	document.getElementById("profile-username").textContent = userInfo.username

	const friendsList = document.getElementById("friends-list")
	const pendingFriendsList = document.getElementById("pending-friends-list")
	const matchHistoryList = document.getElementById("match-history")
	const friendTemplate = document.getElementById("friend-template")
	const pendingFriendTemplate = document.getElementById("pending-friend-template")
	const gameTemplate = document.getElementById("game-template")

	document.querySelectorAll(".tmp-friend").forEach((element) => element.remove())
	document.querySelectorAll(".tmp-game").forEach((element) => element.remove())

	document.getElementById("friends-counter").textContent = userInfo.friends.length
	userInfo.friends.forEach((element) => {
		const friend = friendTemplate.cloneNode(true)
		friend.removeAttribute("id")
		friend.classList.remove("d-none")
		friend.classList.add("tmp-friend")
		friend.querySelector(".friend-avatar").setAttribute('src', API + element.avatar)
		friend.querySelector(".friend-username").textContent = element.username
		friend.querySelector(".friend-link").addEventListener("click", () => {
			ClearBackgroundResources()
			loadProfilePage(element.id)
		})
		friend.querySelector(".btn-remove").addEventListener("click", () => {
			removeFriend(element.id)
		})
		friendsList.appendChild(friend)
	})
	
	let pending_friends_counter = 0
	userInfo.pending_friends.forEach((element) => {
		const isBlocked = userInfo.blocked.find(u => u == element.username)
		if (!isBlocked) {
			pending_friends_counter++
			const pendingFriend = pendingFriendTemplate.cloneNode(true)
			pendingFriend.removeAttribute("id")
			pendingFriend.classList.remove("d-none")
			pendingFriend.classList.add("tmp-friend")
			pendingFriend.querySelector(".friend-avatar").setAttribute('src', API + element.avatar)
			pendingFriend.querySelector(".friend-username").textContent = element.username
			pendingFriend.querySelector(".friend-link").addEventListener("click", () => {
				loadProfilePage(element.id)
			})
			pendingFriend.querySelector(".btn-reject").addEventListener("click", () => {
				rejctFriendRequest(element.id)
			})
			pendingFriend.querySelector(".btn-accept").addEventListener("click", () => {
				acceptFriendRequest(element.id)
			})
			pendingFriendsList.appendChild(pendingFriend)
		}
	})
	document.getElementById("pending-friends-counter").textContent = pending_friends_counter

	let winCount = 0
	let lossCount = 0

	matchHistory.forEach(match => {

		const user1 = allUsers.find(user => user.id == match.user1)
		const user2 = allUsers.find(user => user.id == match.user2)

		const matchElement = gameTemplate.cloneNode(true)

		matchElement.classList.remove('d-none')
		matchElement.classList.add('tmp-game')
		matchElement.querySelector('.game-date').textContent = new Date(match.finish_time).toLocaleString().split(',')[0]
		matchElement.querySelector('.user-1-username').textContent = user1.username
		matchElement.querySelector('.user-2-username').textContent = user2.username
		matchElement.querySelector('.user-1-score').textContent = match.user1_score
		matchElement.querySelector('.user-2-score').textContent = match.user2_score
		matchElement.querySelector(".user-1-avatar").setAttribute('src', API + user1.avatar)
		matchElement.querySelector(".user-2-avatar").setAttribute('src', API + user2.avatar)
		if (match.winner == userId) {
			winCount++
			matchElement.querySelector('.match-background').classList.add('bg-info')
		} else {
			lossCount++
			matchElement.querySelector('.match-background').classList.add('bg-danger')
		}
		matchHistoryList.appendChild(matchElement)
	})
	document.getElementById("win-count").textContent = winCount
	document.getElementById("loss-count").textContent = lossCount
}


export async function fetchUser(userId) {

	try {
		await TokenVerification()
		const response = await fetch(`${API}/user_management/user/${userId}/`, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Authorization': `Bearer ${getTokensObj().access}`
			},
		})
		if (response.status >= 400) {
			logoutUser()
		}
		const user = await response.json()
		return user
	}
	catch {
		logoutUser()
	}
}

export async function updateUser(form) {

	const formData = new FormData(form)
	let formJson = {}

	const username = formData.get('new_username')
	const password = formData.get('new_password')
	const confirmPassword = formData.get('new_password_confirm')

	form.querySelectorAll(".clear").forEach(element => {
		element.value = ""
	})

	const modalElement = document.getElementById(password ? 'change-password': 'change-username')
    const modal = bootstrap.Modal.getInstance(modalElement)

	if (username) {
		if (username.trim().length == 0) {
			alert("Invalid username")
			modal.hide()
			handleNavigation("#profile")
		}
		formJson.username = username
	}
	if (password) {
		if (password != confirmPassword) {
			alert("The passwords don't match")
			modal.hide()
			handleNavigation("#profile")
			return
		}
		formJson.password = password
	}

	try {
		await TokenVerification()
		const response = await fetch(`${API}/user_management/user/${getUserIdFromToken()}/`, {
			method: 'PATCH',
			credentials: 'include',
			headers: {
				'Authorization': `Bearer ${getTokensObj().access}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(formJson)
		})
		const json = await response.json()
		if (response.status >= 400) {
			const firstErrorKey = Object.keys(json)[0]
			const firstError = json[firstErrorKey][0]
			throw firstError
		}
        modal.hide()
		handleNavigation("#profile")
	}
	catch (error) {
		alert("Error: " + error)
		modal.hide()
		handleNavigation("#profile")
	}
}


export async function updateUserAvatar() {
	
	const formData = new FormData(document.getElementById('change-avatar-form'))
	const modalElement = document.getElementById('change-avatar')
    const modal = bootstrap.Modal.getInstance(modalElement)

	try {
		await TokenVerification()
		const response = await fetch(`${API}/user_management/user/${getUserIdFromToken()}/`, {
			method: 'PATCH',
			credentials: 'include',
			headers: {
				'Authorization': `Bearer ${getTokensObj().access}`,
			},
			body: formData
		})
		if (response.status >= 400) {
			if (response.status == 413) {
				alert ("The image must be less than 1 Mb")
			} else {
				alert(response.status)
			}
		}
    	modal.hide()
		handleNavigation("#profile")
	}
	catch (error) {
		alert(error)
	}
}

export async function fetchUserAvatar(url) {

	try {
		await TokenVerification()
		const response = await fetch(url, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Authorization': `Bearer ${getTokensObj().access}`,
			},
		})
		if (response.status >= 400) {
			return ('Not Found 404')
		}
		const img = await response.blob()
		return URL.createObjectURL(img)
	}
	catch {
		return ('Not Found 404')
	}
}
