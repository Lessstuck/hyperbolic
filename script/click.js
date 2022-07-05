import {Track} from "./noneuclidean/noneuclidean.mjs";
import {browserFormat} from "./app.js";

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

var iosSleepPreventInterval = null;

class Preset {
  constructor (beatProb = [0.33, 0.33, 0.33],
    soundFilename     = 'low',
    level = [1],
    scale = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24] 
  )
  {
      this.beatProb = beatProb;
      this.soundFilename = soundFilename;
      this.level = level;
      this.scale = scale;
      this.track = new Track(beatProb);
  }
}

// let presets = [];
// presets[0]  = new Preset ([0, 0, 0, 1, 0, 1], 'REACH_JUPE_tonal_one_shot_reverb__pluck_wet_C', [.67], [0, 4, 7, 9, 12]);
// presets[1]  = new Preset ([1, 1, 0, 0], 'REACH_JUPE_tonal_one_shot_reverb__pluck_wet_C', [.67], [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24]);
// presets[2]  = new Preset ([], 'SOPHIE_snap_01', [0.5], [ 12]);
// presets[3]  = new Preset ([0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 'RU_SPM_perc_gravelbell', [.67], [12]);
// presets[10]  = new Preset ([1, 0, 0, 0], 'low', [.67], [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24]);
// presets[11]  = new Preset ([1, 1, 0, 0], 'low', [.67], [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24]);
// presets[12]  = new Preset ([], 'med', [0.5], [ 12]);
// presets[13]  = new Preset ([0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 'high', [.67], [12]);
let presets = [];
presets[0]  = new Preset ([0, 0, 0, 1, 0, 1], 'REACH_JUPE_tonal_one_shot_reverb__pluck_wet_C', [.67], [0, 4, 7, 9, 12]);
presets[1]  = new Preset ([1, 1, 0, 0], 'REACH_JUPE_tonal_one_shot_reverb__pluck_wet_C', [0], [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24]);
presets[2]  = new Preset ([], 'SOPHIE_snap_01', [0], [ 12]);
presets[3]  = new Preset ([0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 'RU_SPM_perc_gravelbell', [0], [12]);
presets[10]  = new Preset ([1, 0, 0, 0], 'low', [.67], [12, 14, 16, 19, 21, 24]);
presets[11]  = new Preset ([1, 1, 0, 0], 'low', [.0], [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24]);
presets[12]  = new Preset ([], 'med', [0], [ 12]);
presets[13]  = new Preset ([0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 'high', [0], [12]);


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
      source.start = source.start;
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


function Instrument (rateWrapper, meterWrapper, morphWrapper, trackNumber) {
  this.rate         = rateWrapper;
  this.meterOptions = meterWrapper;
  this.morphWrapper = morphWrapper;
  this.trackNumber = trackNumber;
  this.morph = [[50, 50, 50], [50, 50, 50], [50, 50, 50]];
  this.morph[this.trackNumber][0] = this.morphWrapper(this.trackNumber, 0);     ////// updated x position, mapped 0 - 100
  this.morph[this.trackNumber][1] = this.morphWrapper(this.trackNumber, 1);
  this.morph[this.trackNumber][2] = this.morphWrapper(this.trackNumber, 2);
  this.pan = 0;
  this.stopped      = true;
  this.justStarted  = true;
  this.listenEvents();
  this.sound = {};
  this.morphOffset = [0, 0, 0];
  
  // create 2 sounds per instrument for morphing between
  createNewSound(presets[trackNumber].soundFilename, this); 
  createNewSound(presets[trackNumber + 10].soundFilename, this); 
  this.trackNumber  = trackNumber;
  this.track = presets[trackNumber].track;
  return this; 
};
Instrument.prototype = {
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
    var instrument = this;
    this.timeout = Sequencer.timeout(function () {
      instrument.runMainLoop();
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
    var instrument = this;
    instrument.barNotes = [];
    for (var i = 0; i < instrument.meter('beat'); i++) {
      (function (i) {
        instrument.barNotes[i] = Sequencer.timeout(function () {
          instrument.playNote(i);    // playnote is 16th note pulse. see definition directly below
        },i*instrument.temp()/instrument.meter('value'))
      })(i);
    }
  }
};

//////////////////////////////////////////////////////////////
// play notes
//////////////////////////////////////////////////////////////


Instrument.prototype.playNote = function (i) {
  let playState = this.track.play();       // get track playState from noneuclidean.js
  if (playState) {
    this.morph[this.trackNumber][0] = this.morphWrapper(this.trackNumber, 0);
    this.morph[this.trackNumber][1] = this.morphWrapper(this.trackNumber, 1); 
    this.morph[this.trackNumber][2] = this.morphWrapper(this.trackNumber, 2);
  let coinToss = Math.floor(Math.random() * 100);
  for (let j = 0; j < this.morph.length; j++) {
    if (coinToss > this.morph[this.trackNumber][j]) {
      this.morphOffset[j] = 0;
    } else  {
      this.morphOffset[j] = 10;
    };
  }
  this.playSound(presets[this.trackNumber + this.morphOffset[1]].soundFilename);
  };
};

// pick notes at random from scale, then play
Instrument.prototype.playSound = function (buffer) {
  this.gainNode = context.createGain();
  this.panner = context.createStereoPanner();
  this.source = context.createBufferSource();
  this.source.buffer = this.sound[buffer];
  this.source.connect(this.gainNode);
  this.gainNode.connect(this.panner);
  this.panner.connect(context.destination);
  
  let linearGain = (Math.random() * .5 + .5) * presets[this.trackNumber + this.morphOffset[1]].level;
  this.gainNode.gain.value = linearGain * linearGain;   // easy hack to make volume a bit more logarithmic
  this.panner.pan.value = (this.morph[this.trackNumber][0] * .02) - 1; // convert 0-100 to -1 to +1 for webaudio panner
  let scale = presets[this.trackNumber + this.morphOffset[1]].scale;
  this.source.detune.value = (scale[Math.floor(Math.random() * scale.length)] - 12) * 100;
  this.source.start(0);
}

Instrument.prototype.barInterval = function () {
  if (this.justStarted) {
    this.justStarted = false;
    return 0;
  } else {
    return this.meter('beat')*1/this.meter('value')*this.temp();  // ms per bar
  }
};

//////////////////////////////////// meter select ///// UI disabled

Instrument.prototype.meter = function (option) {
  // this[option] = this[option] || parseInt(this.meterOptions.find('#note_' + option + ' option:selected').text());
  this[option] = 16;
  return this[option];
};
Instrument.prototype.temp = function () {
  this.bpm = this.bpm || parseInt(this.rate.val());
  this.tempValue = 60/this.bpm*1000*4;
  return this.tempValue;
};



Instrument.prototype.stopBar = function () {
  for (var i = 0; i < this.barNotes.length; i++) 
    Sequencer.clearTimeout(this.barNotes[i]);
};
Instrument.prototype.listenEvents = function () {
  var instrument = this;

//////////////////////////////////// value select
instrument.meterOptions.find('select').change(function () {
    var optionName = $(this).attr('id').split("note_")[1];
    var optionValue = 16;
    // var optionValue = parseInt($(this).find('option:selected').text());
    instrument[optionName] = optionValue;
  });
  instrument.rate.bind('keyup change input', function () {
    instrument.bpm = parseInt(this.value);
  });
};

export {Instrument};
