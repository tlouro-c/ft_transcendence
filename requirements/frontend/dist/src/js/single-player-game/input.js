export class InputHandler {
	constructor(down, up) {
		this.keys = [];
		window.addEventListener('keydown', e => {this.keyDown(e)});
		window.addEventListener('keyup', e => {this.keyUp(e)});
		this.key = [down, up];
		this.is3d = false;
		this.shift = false;
		this.field = 0;
	}

	keyDown(event) {
		const key = event.key || event.keyCode || event.which;
		if ((this.key.includes(event.key))
			&& this.keys.indexOf(event.key) === -1) {
					this.keys.push(event.key);
			}
		else if (key === 'Shift' || key === 'ShiftLeft' || key === 16){
			if (!this.shift)
			{
				this.shift = true;
				this.field++;
				if (this.field > 5)
					this.field = 0;
			}
		}
		else if (key === ' ' || key === 'Spacebar' || key === 32)
			this.is3d = !this.is3d;
	}

	keyUp(event) {
		const key = event.key || event.keyCode || event.which;
		if ((this.key.includes(event.key))) {
			this.keys.splice(this.keys.indexOf(event.key), 1);
		}
		if (key === 'Shift' || key === 'ShiftLeft' || key === 16)
			this.shift = false;
	}
}