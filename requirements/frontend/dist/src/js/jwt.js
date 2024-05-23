import { getTokensObj, API } from "./utils.js";
import { logoutUser } from "./auth.js";

export function isTokenAccessExpired() {
	try {
		const accessToken = getTokensObj().access;
		const decodedToken = parseJwt(accessToken);

		if (!accessToken || !decodedToken || !decodedToken.exp) {
			return true;
		}
		const currentTime = Math.floor(Date.now() / 1000);
		const tokenExpiryTime = decodedToken.exp;
		const bufferTime = 60;

		return (tokenExpiryTime - currentTime) <= bufferTime;
	}
	catch {
		return true;
	}
}


function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}


export async function refreshAccessToken() {

	const refreshToken = getTokensObj().refresh;

	const refreshKeyPair = { 'refresh': refreshToken };

	try {
		const response = await fetch(`${API}/user_management/refresh_token/`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(refreshKeyPair),
		});
		if (response.status >= 400) {
			logoutUser();
		} else {
			const json = await response.json();

			const tokens = { 'refresh': refreshToken, 'access': json.access };
			localStorage.setItem('tokens', JSON.stringify(tokens));
			return true;
		}
	}
	catch (error) {
		logoutUser();
	}
}

export async function TokenVerification() {
	if (isTokenAccessExpired()) {
		await refreshAccessToken();
	}
}
