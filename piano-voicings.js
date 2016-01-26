var piano = Synth.createInstrument('piano');



var currentOctave = 2;
var notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

var visualKeyboard;

window.onload = function() {
	visualKeyboard = document.querySelector('openmusic-piano-keyboard');
	playNote(0);
	playNote(12);
	
	//piano.play('C', 4, 2); // plays C4 for 2s using the 'piano' sound profile
	//piano.play('E', 4, 2); // plays C4 for 2s using the 'piano' sound profile
	//piano.play('G', 4, 2); // plays C4 for 2s using the 'piano' sound profile
}

function playNote(index) {
	var note = notes[index % notes.length];
	var octave = currentOctave + (Math.floor(index / 12));
	visualKeyboard.dispatchNoteOn(visualKeyboard, index);
	setTimeout(function() { releaseNote(index); }, 1000);
	piano.play(note, octave, 1);
}

function releaseNote(index) {
	visualKeyboard.dispatchNoteOff(visualKeyboard, index);
}