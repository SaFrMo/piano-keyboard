var piano = Synth.createInstrument('piano');
// This puts middle C in the center of a five-octave keyboard
var permanentOctaveOffset = 0;

var currentOctave = 3;
var octaveOffset = 0;

var currentQuality = "";
var currentExtensions = "";

var visualKeyboard;
var root = -1;
var notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
var middleC;

var majorIntervalsToHalfSteps = [0, 0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23, 24, 26, 28, 29, 31, 33, 35, 36];

var chordTypes = [];
var voicingsDictionary = [];
var matchPool = [];
var heldNotes = [];

//
//
//

$(document).ready(function() {
	visualKeyboard = document.querySelector('openmusic-piano-keyboard');
	// Key number 48 on this keyboard is middle C
	middleC = $("#48");
	//playChord(majorSix);
	var keyboardCenter = $("#visualKeyboard").width() / 2;
	var middleCCenter = middleC.width() / 2;
	var middleCLeft = middleC.offset().left;
	$("#visualKeyboard").scrollLeft(middleCLeft - keyboardCenter + middleCCenter);
	
	// Parse JSON data into different chord types (broad categories: maj7, dom7, etc.)
	for (var key in voicings) {
		if (voicings.hasOwnProperty(key)) {
			chordTypes.push(new ChordType(voicings[key], key));
		}
	}
	
	// Go through all the broad categories we've saved...
	var i = 0;
	for (var chordType in chordTypes) {
		if (chordTypes.hasOwnProperty(chordType)) {
			// ...find the individual chords in them...
			var chordList = chordTypes[chordType]["chords"];
			var chordQuality = chordTypes[chordType].chordType;
			for (var i = 0; i < chordList.length; i++) {
				// ...then translate them into Voicing objects and save them to a master dictionary.
				voicingsDictionary.push(new Voicing(chordList[i], chordQuality));
			}
			
		}
	}
	
	// Dropdown menu
	$(".dropdown").on("click", function(e){
		e.preventDefault();
	  
		if($(this).hasClass("open")) {
			$(this).removeClass("open");
			$(this).children("ul").slideUp("fast");
		} else {
			$(this).addClass("open");
			$(this).children("ul").slideDown("fast");
		}
	});
	
	// Key selection
	$(".keySelect").on("click", function(e) {
		// Grab the first note and its accidental, if it has one
		var rootNote = $(this).attr("id").match(/\w#?b?(?=\s)?/)[0];
		// Find the new root
		root = notes.indexOf(rootNote);
		// Label menu with the new root name
		$("#currentKeyLabel").html($(this).attr("id"));
	});
	
	// Quality selection
	$(".qualitySelect").on("click", function(e) {
		var newQuality = $(this).attr("id");
		$("#currentQualityLabel").html(newQuality);
		currentQuality = newQuality;
	});
	
	// Extension selection
	$(".extensionSelect").on("click", function(e) {
		var newExtension = $(this).html();
		$("#currentExtensionLabel").html(newExtension);
	});
	
	$("#findChordsButton").on("click", function(e) {
		populateChordsList();
	});
	
	// Voicing selection from match pool
	$(document).on("click", '.chordSelector', function(e) {
		e.preventDefault();
		
		var index = parseInt($(this).attr("id"));
		matchPool[index].play();
	});

	voicingsDictionary[6].play();
	
});

//
//
//

// Called when user presses "Get Chords" button.
function populateChordsList() {
	var newHtml = "";
	// Clear match pool array
	matchPool = [];
	var matchedChords = 0;
	
	for (var i = 0; i < voicingsDictionary.length; i++) {
		if (voicingsDictionary[i].chordType == currentQuality) {
			var v = voicingsDictionary[i];
			matchPool.push(v);
			newHtml += "<a href='#' class='chordSelector' id='" + (matchedChords++).toString() + "'>" + v.remarks + "</a><br>";
		}
	}
	
	//console.log(chordArray);
	$("#chordOptions").html(newHtml);
}



/* CHORD VOICING FORMAT IN JSON: Intervals
 * Chords are stored in the voicings dictionary as intervals - for example, a root position C6 chord 
 * can be [0, 6, 10, 12], which in C is (C, A, E, G).
 * Flats are notated as `b` and sharps are notated as `#`, dims are `o` and augs are `+`.
 * These need to be parsed to the half-step format below, which is an array of half-steps from the root note.
 */
 
function parseIntervals(intervals) {
	var toReturn = [];
	
	// Parses string into array of intervals (results look like ["0", "3", "b7", "b9", "#12"])
	var individualIntervals = intervals.toString().match(/[b]?[+b#ox]?\d+/g);
	
	for (var x in individualIntervals) {
		
		// Split alterations from scale degree
		var alteration = individualIntervals[x].match(/[b#o+]/g);
		var degreeString = individualIntervals[x].match(/\d+/g)[0];
		var degreeNumber = parseInt(degreeString);
		
		var halfSteps = majorIntervalsToHalfSteps[degreeNumber];
		
		if (alteration != null) {
			
			// Handle 4ths and 5ths (as well as their extensions)
			if (degreeNumber == 4 || degreeNumber == 5 || degreeNumber == 11 || degreeNumber == 12) {
				// Augmented 4th or 5th goes up 1 half step
				if (alteration == "+" || alteration == "#")
					halfSteps += 1;
				// Diminished 4th or 5th goes down 1 half step
				if (alteration == "o" || alteration == "b")
					halfSteps -= 1;
			}
			
			else {
				if (alteration == "o")
					halfSteps -= 2;
				if (alteration == "b")
					halfSteps -= 1;
				if (alteration == "#")
					halfSteps += 1;
				if (alteration == "+")
					halfSteps += 2;
			}
		}
		
		toReturn.push(halfSteps);
	}
	
	return toReturn;
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
	var octaveDisplace = 0;
	// Since we're getting the notes from an array, the index must be a positive number
	while (index < 0) {
		// Get closer to a positive number and record the octave offset
		index += 12;
		octaveDisplace += 1;
	}
	var note = notes[index % notes.length];
	var noteNumber = (index + ((currentOctave - permanentOctaveOffset - octaveOffset - octaveDisplace) * 12));
	visualKeyboard.dispatchNoteOn(visualKeyboard, noteNumber);
	heldNotes.push(noteNumber);
	//setTimeout(function() { releaseNote(index); }, 1000);
	piano.play(note, currentOctave - octaveDisplace, 1);
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

function Voicing(jsonEntry, chordType) {
	this.chordType = chordType;
	this.intervals = jsonEntry["intervals"];
	this.remarks = jsonEntry["remarks"];
	this.voicing = parseIntervals(this.intervals);
	
	this.play = function() {
		// Clear existing notes
		for (var i = 0; i < heldNotes.length; i++) {
			releaseNote(heldNotes[i]);
		}
		heldNotes = [];
		
		playChord(this.voicing);
	}
	
	//console.log(this);
}