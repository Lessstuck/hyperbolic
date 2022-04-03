import {Track} from "./noneuclidean/noneuclidean.mjs";
import {browserFormat} from "./app.js";

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

var iosSleepPreventInterval = null;

class Player {
  constructor (beatProb = [0.33, 0.33, 0.33],
    soundFilename     = 'low',
    dynaProb = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    scale = [0, 2, 5, 8, 10, 12] 
  )
  {
      this.beatProb = beatProb;
      this.soundFilename = soundFilename;
      this.dynaProb = dynaProb;
      this.scale = scale;
      this.track = new Track(beatProb);
  }
}

let players = [];

players[0]  = new Player ([0, 1, 0, 0], 'low', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1] );
players[1]  = new Player ([0,  1, 1], 'med', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1] );
players[2]  = new Player ([1, 1, 1, 1], 'high', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1] );

const Sequencer = {
  timeout: function(callback, length) {
    if (length <= 0) {
      length = 1;
    }
    var source = context.createBufferSource();
    source.buffer = context.createBuffer(1, 32000 * (length / 1000), 32000);
    source.connect(context.destination);
    source.onended = callback;
    if (!source.stop) {
      source.stop = source.noteOff;
    }
    if (!source.start) {
      source.start = source.noteOn;
    }
    source.start(0)
    return source;
  },
  clearTimeout: function(timeout){
    timeout.stop(0);
  }
};

function createNewSound(fileName, parent) {
  var url = 'audio/' + fileName + browserFormat();
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  function onError (event) {
    console.log(event);
  }

  request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
      parent.sound[fileName] = buffer;
    }, onError);
  }
  request.send();
};


function Metronome (rateWrapper, meterWrapper, trackNumber) {
  this.rate         = rateWrapper;
  this.meterOptions = meterWrapper;
  this.stopped      = true;
  this.justStarted  = true;
  this.listenEvents();
  this.sound = {};
  createNewSound(players[0].soundFilename, this);   // inefficient to create all buffers for each instance but works for now   O(mn)
  createNewSound(players[1].soundFilename, this);
  createNewSound(players[2].soundFilename, this);
  this.trackNumber  = trackNumber;
  this.track = players[trackNumber].track;
  return this; 
};
Metronome.prototype = {
  start: function () {
    iosSleepPreventInterval = setInterval(function () {
      window.location.href = "/new/page";
      window.setTimeout(function () {
          window.stop()
      }, 0);
    }, 30000);
    if (this.stopped == true) {
      this.stopped = false;
      return this.mainLoop();
    }
  },
  stop: function () {
    clearInterval(iosSleepPreventInterval);
    this.stopped = true;
    this.justStarted = true;
    Sequencer.clearTimeout(this.timeout);
    this.stopBar();
  },
  mainLoop: function () {
    var metronome = this;
    this.timeout = Sequencer.timeout(function () {
      metronome.runMainLoop();
    }, this.barInterval());  
    return this;
  },
  runMainLoop: function () {
    if (this.stopped) return;
    if (!this.justStarted && this.barNotes)
      this.stopBar();
    this.innerLoop();
    return this.mainLoop();
  },
  innerLoop: function () {
    var metronome = this;
    metronome.barNotes = [];
    for (var i = 0; i < metronome.meter('beat'); i++) {
      (function (i) {
        metronome.barNotes[i] = Sequencer.timeout(function () {
          metronome.playNote(i);
        },i*metronome.temp()/metronome.meter('value'))
      })(i);
    }
  }
};

Metronome.prototype.playNote = function (index) {
    let playState = this.track.play();
    if (playState) {
      this.playSound(players[this.trackNumber].soundFilename);
    };
};
Metronome.prototype.playSound = function (buffer) {
  var source = context.createBufferSource();
  source.buffer = this.sound[buffer];
  source.connect(context.destination);
  if (!source.start) {
    source.start = source.noteOn;
  }
  source.start(0);
}

Metronome.prototype.barInterval = function () {
  if (this.justStarted) {
    this.justStarted = false;
    return 0;
  } else {
    return this.meter('beat')*1/this.meter('value')*this.temp();  // ms per bar
  }
};
Metronome.prototype.meter = function (option) {
  this[option] = this[option] || parseInt(this.meterOptions.find('#note_' + option + ' option:selected').text());
  return this[option];
};
Metronome.prototype.temp = function () {
  this.bpm = this.bpm || parseInt(this.rate.val());
  this.tempValue = 60/this.bpm*1000*4;
  return this.tempValue;
};
Metronome.prototype.stopBar = function () {
  for (var i = 0; i < this.barNotes.length; i++) 
    Sequencer.clearTimeout(this.barNotes[i]);
};
Metronome.prototype.listenEvents = function () {
  var metronome = this;
  metronome.meterOptions.find('select').change(function () {
    var optionName = $(this).attr('id').split("note_")[1];
    var optionValue = parseInt($(this).find('option:selected').text());
    metronome[optionName] = optionValue;
  });
  metronome.rate.bind('keyup change input', function () {
    metronome.bpm = parseInt(this.value);
  });
};

export {Metronome};
