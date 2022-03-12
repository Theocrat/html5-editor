function resize() {
	/*
	Automagically resizes the writing area so it fits the screen.
	*/
	let inHeight = window.innerHeight
	
	mainbox.style.height = `${window.innerHeight - 64}px`
	console.log(mainbox)
}

function mklisteners() {	
	/*
	Adds event listeners to the document so it can implement respond
	to key presses and releases. It acknowdges pressing and releasing
	the Shift key and invokes a handler method for other keys.
	*/
	document.addEventListener('keydown', function(e) {
		if(e.keyCode == 16)
			keyboardStatus.shiftKey = true
		
		else
			textHandler(e.keyCode)
	})
	
	document.addEventListener('keyup', function(e) {
		if(e.keyCode == 16)
			keyboardStatus.shiftKey = false
	})
}

function init() {	
	/*
	Initializes the global variable mainbox to the element on the 
	screen which provides a writing area. It then invokes methods
	to resize that element to fit the screen, render the initial blank
	with a cursor on it, and add listeners to the document to respond
	to keypresses.
	 */
	mainbox = document.getElementById('textarea')
	
	resize()
	textRender()
	mklisteners()
}
