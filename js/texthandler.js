function textHandler(code) {
	/*
	Main text handling function, which calls all the other functions.
	It is invoked whenever a key other than Shift, Ctrl and Alt is pressed.
	Its job is to respond to the key presses, changing the `textData` object 
	(which is a global defined in global.js) according to electric effects.
	It reads the (also global) `keyboardStatus` object to determine how
	to react to each key.

	Note that Javascript keyboard event listeners are case insensitive - the 
	'A' key will always yield a key code of 65, regardless of the state of caps
	lock and whether or not the shift key is pressed.

	The numeric keys will always yield a number ASCII code, even if the user tried
	to type in a symbol using the shiftkey + number. Typing '@' simply returns 50,
	the ASCII code for 2 (since '@', at least in my keyboard, is <Shift + 2>)

	Finally, this method, as of now, assumes an en_US keyboard layout (English, US)
	with a QWERTY keyboard array. That's what's on my machine, so its the best I can do.
	*/
	console.log(`Keypress: ${code}`)
	if(code >= 65 && code < 90) { // user typed a letter
		if(textData.curcol >= textData.lines[textData.lineno].length) {
			if(keyboardStatus.shiftKey)
				textData.lines[ textData.lineno ] += String.fromCharCode(code)
			
			else
				textData.lines[ textData.lineno ] += String.fromCharCode(code + 32)
		}
	}
	
	else if(code >= 48 && code <= 57) { // user typed a digit (maybe with shift to enter a symbol)
		if(textData.curcol >= textData.lines[textData.lineno].length) {
			if(keyboardStatus.shiftKey) {
				let symbols_enUS = ")!@#$%^&*(".split('')
				textData.lines[ textData.lineno ] += symbols_enUS[code - 48]
			}
			
			else
				textData.lines[ textData.lineno ] += String.fromCharCode(code)
		}
	}
	
	else { // user entered a comma, slash, or some such
		specialChar(code)
	}
	
	textData.curcol++
	textRender()
}

function textRender() {
	/*
	We store text data in the `textData` object as an array of lines,
	which are strings, and we use the `lineno` (line number, i.e., row)
	and `curcol` (cursor column, i.e., column) fields to track the position
	of the cursor.

	The final rendering which goes into the screen, of course, will have to be
	an HTML code. As of now, there is no syntax highlighting, but once that comes
	round, we will need to make way for that as well. Also, HTML treats some characters
	as special characters (God help us if someone typed </div> into the text 
	and we didn't prepare our renderer to handle it!), so we need to make several
	replacements to the text data before it is in a proper condition for rendering.
	*/
	let linesCopy = JSON.parse( JSON.stringify(textData.lines) )
	//console.log(`JSON.stringify(textData.lines): ${JSON.stringify(textData.lines)}`)

	// put cursor at the cursor place
	if(textData.curcol >= linesCopy[textData.lineno].length) {
		linesCopy[textData.lineno] += '_'
	}
	
	// Make the replacements
	for(i = 0; i < linesCopy.length; i++) {
		linesCopy[i] = linesCopy[i].replaceAll('&', '&amp;')
		linesCopy[i] = linesCopy[i].replaceAll(' ', '&nbsp;')
		linesCopy[i] = linesCopy[i].replaceAll('<', '&lt;')
		linesCopy[i] = linesCopy[i].replaceAll('>', '&gt;')
		linesCopy[i] = linesCopy[i].replaceAll('"', '&quot;')
		linesCopy[i] = linesCopy[i].replaceAll("'", '&apos;')
	}

	mainbox.innerHTML = linesCopy.join('<br/>')
}

function getIndent(lastChar) {
	/*
	Counts the number of spaces in the indentation of the current line. This is needed
	for auto-indentation and other electric effects related to indentation.
	*/
	let indentLevel = ''
	while(textData.lines[ textData.lineno ][indentLevel.length] == ' ')
		indentLevel += ' '
	
	if(lastChar == '{')
		indentLevel += '    '
		
	console.log(`Indentation: ${indentLevel.length}\nlastChar: ${lastChar}`)	
	return indentLevel
}

function specialChar(code) {
	/*
	Javascript keyboard event listeners only give us the ASCII code that a key
	would generate if Shift were not pressed. This is okay for letters, since ASCII
	values of upper and lower case letters are just offset from each other by 32.
	It is also somewhat okay-ish for digits, since all it takes is some simple
	substitution of the symbols from a list in case the shift key is pressed.

	But there are two problems with the commas, the braces, the slashes, and the
	entire gamut of them. First, there is no viable relation between the keystroke ASCII
	and the ASCII for the keystroke with Shift held down. This forces me to write a 
	switch case for them.

	Secondly, many of them - newline, backspace, braces etc. are supposed to provide
	electric effects, and the logic for them also needs to go into these functions.

	Lastly, I have sort of messed up by making sure to increment `textData.curcol` after
	EVERY SINGLE keystroke. This is the thing which is supposed to note the horizontal
	position of the cursor. Now, some keys - especially those producing electric effects,
	are supposed to move the cursor in a different way (think backspace). Hence I have to
	account for that forward movement of the cursor position, so backspace has to move it 
	two spaces back (the first space because that's what backspaces do, and the second 
	because otherwise the `textData.curcol++` code in the second-last line of the `textHandler`
	method has to be countered with an extra decrement)

	This is also why, for instance, after a newline is entered, the cursor is set to the 
	column -1 and not 0 - if we had set it to zero, it would be set to +1 by that accursed
	incrementation in `textHandler`!!
	*/
	switch(code) {
		case 13: // newline
			
			// count the amount of indentation needed so we can 
			// auto-indent after newline
			let lineLength = textData.lines[textData.lineno].length
			let lastChar = textData.lines[textData.lineno][lineLength - 1]
			console.log(`curcol: ${textData.curcol}\nlineLength: ${lineLength}`)
			if(textData.curcol != lineLength)
				lastChar = null
			let indentLevel = getIndent(lastChar)
			
			// indentLevel is a string, containing the required number
			// of spaces.
			textData.lines.push(indentLevel)
			textData.lineno += 1
			textData.curcol = indentLevel.length - 1
			break
		
		case 32: // space
			textData.lines[ textData.lineno ] += ' '
			break
		
		case 8: // backspace
			console.log(`curcol: ${textData.curcol}\nlineno: ${textData.lineno}`)
			if(textData.curcol > 0) {
				textData.curcol -= 2; // because of the incrementation in the second-last
				                      // line of the `textHandler` method, we need to 
									  // decrement this value twice
				let chars = textData.lines[ textData.lineno ].split("")
				chars.pop()
				textData.lines[ textData.lineno ] = chars.join('')
			}
			else if(textData.lines.length > 1) { // cursor at the beginning of the line
				textData.lines.pop()
				textData.lineno--
				textData.curcol = textData.lines[ textData.lineno ].length - 1
			}
			else textData.curcol = -1
			// this is when the entire text area is empty. we set the 
			// cursor column to -1, not 0, to account for the blasted
			// incrementation in the `textHandler` method's last line
			break
		
		case 188: // comma
			if(keyboardStatus.shiftKey)
				textData.lines[ textData.lineno ] += '<'
			else
				textData.lines[ textData.lineno ] += ','
			break
		
		case 190: // period
			if(keyboardStatus.shiftKey)
				textData.lines[ textData.lineno ] += '>'
			else
				textData.lines[ textData.lineno ] += '.'
			break
		
		case 59: // semicolon
			if(keyboardStatus.shiftKey)
				textData.lines[ textData.lineno ] += ':'
			else
				textData.lines[ textData.lineno ] += ';'
			break
		
		case 191: //slash
			if(keyboardStatus.shiftKey)
				textData.lines[ textData.lineno ] += '?'
			else
				textData.lines[ textData.lineno ] += '/'
			break
		
		case 219: // open square bracket
			if(keyboardStatus.shiftKey)
				textData.lines[ textData.lineno ] += '{'
			else
				textData.lines[ textData.lineno ] += '['
			break
		
		case 220: // backslash
			if(keyboardStatus.shiftKey)
				textData.lines[ textData.lineno ] += '|'
			else
				textData.lines[ textData.lineno ] += '\\'
			break
		
		case 61: // equals and plus sign
			if(keyboardStatus.shiftKey)
				textData.lines[ textData.lineno ] += '+'
			else
				textData.lines[ textData.lineno ] += '='
			break
	
		case 173: // minus and underscore
			if(keyboardStatus.shiftKey)
				textData.lines[ textData.lineno ] += '_'
			else
				textData.lines[ textData.lineno ] += '-'
			break
		
		case 221: // close square bracket
			if(keyboardStatus.shiftKey) {
				// feed the last char of current line to the `isClosing` method
				// to detect if electric de-indentation is required
				let charList = textData.lines[ textData.lineno ].split('')
				if(isClosing(charList)) {
					[1,2,3,4].forEach( i => charList.pop() )
					charList.push('}')
					textData.lines[ textData.lineno ] = charList.join('')
				}
				else
					textData.lines[ textData.lineno ] += '}'
			}
			else
				textData.lines[ textData.lineno ] += ']'
			break
		
		case 222: // quote mark
			if(keyboardStatus.shiftKey)
				textData.lines[ textData.lineno ] += '"'
			else
				textData.lines[ textData.lineno ] += "'"
			break
			
		default:
			// This means we are not writing anything to the writing area
			// but the incrementation in the second-last line of the 
			// `textHandler method will increment the cursor column
			// nevertheless. We do not want this. Hence the decrement to
			// counter that increment:
			textData.curcol--
	}
}

function isClosing(clist) {
	/*
	Part of an electric effect, which adds a de-indent
	automagically whenever the user types a } (closing brace)
	into a line that is empty save for some indentation.
	*/
	if(clist.length % 4 != 0 || clist.length == 0) 
			return false
	
	let allSpaces = true
	clist.forEach( c => {
		if(c != ' ')
			allSpaces = false
	})
	
	return allSpaces
}