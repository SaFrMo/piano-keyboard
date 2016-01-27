var piano = Synth.createInstrument('piano');
// This puts middle C in the center of a five-octave keyboard
var permanentOctaveOffset = 0;

var currentOctave = 3;
var octaveOffset = 0;

var visualKeyboard;
var root = 0;
var notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
var middleC;

var chordTypes = [];

/* CHORD VOICING FORMAT IN JSON: Intervals
 * Chords are stored in the voicings dictionary as intervals - for example, a root position C6 chord 
 * can be [0, 6, 10, 12], which in C is (C, A, E, G).
 * These need to be parsed to the format below, which is an array of half-steps from the root note.
 */
 
function parseIntervals(intervals) {
	var toReturn = [];
	
	intervals.forEach(function(i) {
		alert(i);
	});
}

/* CHORD VOICING FORMAT IN JS: Half-Steps
 * The root and octave will be provided by the user, and numbers indicate half-steps up from that root.
 *
 * EXAMPLE: C3-A3-E4-G4
 * Root C3
 * [0, 9, 16, 19]
 */
 
function Chord(notes) {
	this.notes = notes;
}

var majorSix = new Chord([0, 9, 16, 19]);

$(document).ready(function() {
	visualKeyboard = document.querySelector('openmusic-piano-keyboard');
	// Key number 48 on this keyboard is middle C
	middleC = $("#48");
	playChord(majorSix);
	var keyboardCenter = $("#visualKeyboard").width() / 2;
	var middleCCenter = middleC.width() / 2;
	var middleCLeft = middleC.offset().left;
	$("#visualKeyboard").scrollLeft(middleCLeft - keyboardCenter + middleCCenter);
	
	var i = 0;
	for (var key in voicings) {
		if (voicings.hasOwnProperty(key)) {
			chordTypes.push(new ChordType(voicings[key], key));
		}
	}
	
	console.log(chordTypes);
});

function playChord(chord) {
	if (Array.isArray(chord))
		chord.forEach(function(note) { playNote(note); });
	else {
		chord.notes.forEach(function(note) {
			playNote(note);
		});
	}
}

function playNote(index) {
	index += root;
	var note = notes[index % notes.length];
	visualKeyboard.dispatchNoteOn(visualKeyboard, (index + ((currentOctave - permanentOctaveOffset - octaveOffset) * 12)));
	//setTimeout(function() { releaseNote(index); }, 1000);
	piano.play(note, currentOctave, 1);
}

function releaseNote(index) {
	visualKeyboard.dispatchNoteOff(visualKeyboard, index);
}

// Voicing category object
function ChordType(jsonEntry, chordType) {
	this.chords = [];
	this.chordType = chordType;
	
	for (var entry in jsonEntry) {
		if (jsonEntry.hasOwnProperty(entry))
			this.chords.push(jsonEntry[entry]);
	}
}

// Chord voicing object
function Voicing(jsonEntry) {
	this.intervals = jsonEntry["intervals"];
	this.remarks = jsonEntry["remarks"];
}