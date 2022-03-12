function textHandler(code) {
	console.log(`Keypress: ${code}`)
	if(code >= 65 && code < 90) {		
		if(textData.curcol >= textData.lines[textData.lineno].length) {
			if(keyboardStatus.shiftKey)
				textData.lines[ textData.lineno ] += String.fromCharCode(code)
			
			else
				textData.lines[ textData.lineno ] += String.fromCharCode(code + 32)
		}
	}
	
	else if(code >= 48 && code <= 57) {
		if(textData.curcol >= textData.lines[textData.lineno].length) {
			if(keyboardStatus.shiftKey) {
				let symbols_enUS = ")!@#$%^&*(".split('')
				textData.lines[ textData.lineno ] += symbols_enUS[code - 48]
			}
			
			else
				textData.lines[ textData.lineno ] += String.fromCharCode(code)
		}
	}
	
	else {
		specialChar(code)
	}
	
	textData.curcol += 1
	textRender()
}

function textRender() {
	let linesCopy = JSON.parse( JSON.stringify(textData.lines) )
	//console.log(`JSON.stringify(textData.lines): ${JSON.stringify(textData.lines)}`)
	
	if(textData.curcol >= linesCopy[textData.lineno].length) {
		linesCopy[textData.lineno] += '_'
	}
	
	for(i = 0; i < linesCopy.length; i++) {
		linesCopy[i] = linesCopy[i].replaceAll('&', '&#38;')
		linesCopy[i] = linesCopy[i].replaceAll(' ', '&nbsp;')
		linesCopy[i] = linesCopy[i].replaceAll('<', '&lt;')
		linesCopy[i] = linesCopy[i].replaceAll('>', '&gt;')
	}
	mainbox.innerHTML = linesCopy.join('<br/>')
}

function getIndent(lastChar) {
	let indentLevel = ''
	while(textData.lines[ textData.lineno ][indentLevel.length] == ' ')
		indentLevel += ' '
	
	if(lastChar == '{')
		indentLevel += '    '
		
	console.log(`Indentation: ${indentLevel.length}\nlastChar: ${lastChar}`)	
	return indentLevel
}

function specialChar(code) {
	switch(code) {
		case 13: // newline
			let lineLength = textData.lines[textData.lineno].length
			let lastChar = textData.lines[textData.lineno][lineLength - 1]
			console.log(`curcol: ${textData.curcol}\nlineLength: ${lineLength}`)
			if(textData.curcol != lineLength)
				lastChar = null
			let indentLevel = getIndent(lastChar)
			
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
				textData.curcol -= 2;
				let chars = textData.lines[ textData.lineno ].split("")
				chars.pop()
				textData.lines[ textData.lineno ] = chars.join('')
			}
			else if(textData.lines.length > 1) {
				textData.lines.pop()
				textData.lineno--
				textData.curcol = textData.lines[ textData.lineno ].length - 1
			}
			else textData.curcol = -1
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
		
		case 221: // close square bracket
			if(keyboardStatus.shiftKey) {
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
			textData.curcol--
	}
}

function isClosing(clist) {
	if(clist.length % 4 != 0 || clist.length == 0) 
			return false
	
	let allSpaces = true
	clist.forEach( c => {
		if(c != ' ')
			allSpaces = false
	})
	
	return allSpaces
}
