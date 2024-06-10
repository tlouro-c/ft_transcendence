import { fetchGameHistory } from "./game-page.js"
import { fetchAllUsers } from "./search.js"
import { ClearBackgroundResources, elements, loadPage } from "./utils.js";
import { API } from "./utils.js";


export function loadHomePage() {
	ClearBackgroundResources()
	document.querySelectorAll(".tmp-dashboard-entry").forEach((element) => element.remove())
	loadPage(elements.homePage)
	loadDashboard()
}


export async function loadDashboard() {


	const allUsers = await fetchAllUsers()
	const dashboard = document.getElementById("dashboard");

	let dashboardEntries = []

	for (const user of allUsers) {
		dashboardEntries.push(await loadDashboardEntry(user))
    }

	dashboardEntries.sort((a, b) => {
		return b.querySelector(".user-wins").textContent - a.querySelector(".user-wins").textContent
	})

	let index = 0;
	dashboardEntries.forEach((entry) => {
		if (index == 0) {
			entry.style.backgroundColor = "rgba(40, 167, 69, 0.1)"
		} else if (index == 1) {
			entry.style.backgroundColor = "rgba(255, 193, 7, 0.1)"
		} else if (index == 2) {
			entry.style.backgroundColor = "rgba(220, 53, 69, 0.1)"
		}
		entry.set
		index++;
		dashboard.appendChild(entry)
	})

}



async function loadDashboardEntry(user) {

	const dashboardEntryTemplate = document.getElementById("dashboard-entry-template");
	const newEntry = dashboardEntryTemplate.cloneNode(true)
	newEntry.removeAttribute("id")
	newEntry.classList.remove("d-none")
	newEntry.classList.add("tmp-dashboard-entry")

	const userMatchHistory = await fetchGameHistory(user.id)
	let wins = 0;
	userMatchHistory.forEach((game) => {
		if (game.winner == user.id) {
			wins++;
		}
	})
	newEntry.querySelector(".friend-avatar").setAttribute('src', API + user.avatar)
	newEntry.querySelector(".username").textContent = user.username
	newEntry.querySelector(".user-wins").textContent = wins
	return newEntry;
}