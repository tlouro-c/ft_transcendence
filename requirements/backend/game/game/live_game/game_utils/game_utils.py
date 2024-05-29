game_map = {}

def get_player_id(keys, users_in_room, user, data):

	if users_in_room[0] == user:
		return 0
	else:
		return 1

