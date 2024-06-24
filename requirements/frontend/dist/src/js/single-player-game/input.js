export class InputHandler {
	constructor() {
		this.keys = [];
		window.addEventListener('keydown', e => {this.keyDown(e)});
		window.addEventListener('keyup', e => {this.keyUp(e)});
		this.key = ['A', 'a', 'd', 'D'];
		this.is3d = false;
		this.shift = false;
		this.up = false;
		this.down = false;
		this.field = 0;
	}

	keyDown(event) {
		const key = event.key || event.keyCode || event.which;
		if (key === 'a' || key === 'A' || key === 141 || key === 101) {
			this.up = true;
		}
		if (key === 'd' || key === 'D' || key === 144 || key === 104) {
			this.down = true;
		}
		else if (key === 'm' || key === 'M' || key === 155 || key === 115){

			this.field++;
			if (this.field > 5)
				this.field = 0;
		}
		else if (key === ' ' || key === 'Spacebar' || key === 32)
			this.is3d = !this.is3d;
	}

	keyUp(event) {
		const key = event.key || event.keyCode || event.which;

		if (key === 'a' || key === 'A' || key === 141 || key === 101) {
			this.up = false;
		}
		if (key === 'd' || key === 'D' || key === 144 || key === 104) {
			this.down = false;
		}
	}
}