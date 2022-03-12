/*
Global variables for common coupling, because
it makes life easier
*/

// For storing the element in the screen which 
// contains the writing area
var mainbox = null

// For handling the current state of the written area
// It is basically what is rendered to the writing area
// on the screen
var textData = {
	"lines":  [''],
	"lineno": 0,
	"curcol": 0
}

// Stores the information of whether the Shift,
// Ctrl and Alt keys are pressed or not
// (currently just Shift, but more will come later)
// Useful for keybindings, and essential for case
// sensitivity, since Javascript event listeners do
// not return different ASCII codes depending on whether
// I feed an uppercase letter or a lowercase letter.
var keyboardStatus = {
	"shiftKey": false
}
