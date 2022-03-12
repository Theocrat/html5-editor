function resize() {
	let inHeight = window.innerHeight
	
	mainbox.style.height = `${window.innerHeight - 64}px`
	console.log(mainbox)
}

function mklisteners() {	
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
	mainbox = document.getElementById('textarea')
	
	resize()
	textRender()
	mklisteners()
}
