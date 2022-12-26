import { Track } from "./noneuclidean/noneuclidean.mjs";
import {
  octaMesh,
  ballMesh,
  cubeMesh,
  hitIndex,
  isDragging,
  octaLight,
  ballLight,
  cubeLight,
} from "./mousepick.js";

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();

var iosSleepPreventInterval = null;

///////////////  Chaos lookup to replace Math.random()
const chaosValues = [
  0.36, 0.921, 0.289, 0.823, 0.584, 0.972, 0.109, 0.39, 0.951, 0.185, 0.603,
  0.957, 0.163, 0.546, 0.034, 0.132, 0.459, 0.027, 0.104, 0.374, 0.936, 0.238,
  0.725, 0.797, 0.648, 0.912, 0.32, 0.87, 0.452, 0.037, 0.144, 0.493, 0.02,
  0.078, 0.289, 0.822, 0.584, 0.971, 0.111, 0.394, 0.955, 0.171, 0.568, 0.981,
  0.073, 0.272, 0.792, 0.66, 0.898, 0.368, 0.93, 0.26, 0.77, 0.708, 0.828,
  0.571, 0.98, 0.079, 0.289, 0.822, 0.584, 0.972, 0.11, 0.392, 0.953, 0.177,
  0.584, 0.972, 0.109, 0.39, 0.951, 0.185, 0.602, 0.958, 0.161, 0.54, 0.026,
  0.1, 0.361, 0.922, 0.287, 0.818, 0.596, 0.963, 0.143, 0.49, 0.03, 0.118,
  0.415, 0.971, 0.112, 0.397, 0.957, 0.163, 0.547, 0.035, 0.134, 0.465, 0.019,
  0.076, 0.281, 0.808, 0.619, 0.943, 0.215, 0.675, 0.877, 0.43, 0.98, 0.077,
  0.284, 0.814, 0.606, 0.955, 0.171, 0.568, 0.981, 0.074, 0.273, 0.793, 0.656,
  0.902, 0.352, 0.913, 0.318, 0.868, 0.458, 0.028, 0.11, 0.391, 0.952, 0.183,
  0.598, 0.962, 0.148, 0.503, 0.037, 0.142, 0.487, 0.012, 0.047, 0.178, 0.585,
  0.971, 0.112, 0.398, 0.958, 0.161, 0.541, 0.027, 0.106, 0.378, 0.94, 0.225,
  0.697, 0.845, 0.523, 0.035, 0.135, 0.468, 0.016, 0.064, 0.239, 0.728, 0.791,
  0.66, 0.897, 0.369, 0.931, 0.256, 0.761, 0.727, 0.794, 0.654, 0.905, 0.345,
  0.904, 0.348, 0.907, 0.338, 0.895, 0.377, 0.94, 0.227, 0.702, 0.837, 0.546,
  0.034, 0.13, 0.451, 0.039, 0.148, 0.505, 0.014, 0.054, 0.206, 0.654, 0.905,
  0.342, 0.9, 0.359, 0.92, 0.294, 0.83, 0.565, 0.983, 0.066, 0.246, 0.743,
  0.764, 0.721, 0.805, 0.628, 0.935, 0.243, 0.737, 0.776, 0.696, 0.847, 0.52,
  0.026, 0.101, 0.363, 0.924, 0.28, 0.806, 0.626, 0.936, 0.239, 0.727, 0.793,
  0.657, 0.902, 0.355, 0.916, 0.309, 0.854, 0.497, 0.032, 0.124, 0.435, 0.983,
  0.067, 0.249, 0.748, 0.754, 0.742, 0.766, 0.717, 0.812, 0.612, 0.95, 0.19,
  0.614, 0.948, 0.199, 0.637, 0.925, 0.279, 0.804, 0.63, 0.932, 0.253, 0.755,
  0.739, 0.771, 0.706, 0.831, 0.562, 0.985, 0.061, 0.229, 0.706, 0.83, 0.565,
  0.983, 0.066, 0.247, 0.744, 0.763, 0.724, 0.8, 0.641, 0.92, 0.293, 0.829,
  0.567, 0.982, 0.07, 0.261, 0.771, 0.706, 0.83, 0.564, 0.983, 0.065, 0.243,
  0.735, 0.779, 0.69, 0.856, 0.493, 0.02, 0.077, 0.284, 0.813, 0.609, 0.952,
  0.182, 0.595, 0.963, 0.141, 0.484, 0.019, 0.074, 0.274, 0.795, 0.652, 0.908,
  0.334, 0.89, 0.391, 0.952, 0.183, 0.598, 0.962, 0.147, 0.502, 0.031, 0.121,
  0.425, 0.977, 0.089, 0.324, 0.876, 0.434, 0.983, 0.068, 0.254, 0.759, 0.732,
  0.784, 0.678, 0.874, 0.442, 0.986, 0.054, 0.203, 0.647, 0.914, 0.316, 0.864,
  0.47, 0.015, 0.059, 0.223, 0.692, 0.852, 0.504, 0.01, 0.041, 0.157, 0.529,
  0.014, 0.055, 0.21, 0.663, 0.894, 0.379, 0.941, 0.221, 0.688, 0.858, 0.487,
  0.012, 0.047, 0.177, 0.584, 0.972, 0.11, 0.39, 0.952, 0.183, 0.599, 0.961,
  0.151, 0.513, 0.013, 0.051, 0.194, 0.626, 0.937, 0.237, 0.723, 0.8, 0.639,
  0.923, 0.285, 0.816, 0.601, 0.959, 0.157, 0.53, 0.015, 0.058, 0.22, 0.686,
  0.862, 0.475, 0.01, 0.04, 0.153, 0.519, 0.024, 0.095, 0.345, 0.904, 0.347,
  0.907, 0.338, 0.895, 0.377, 0.939, 0.229, 0.706, 0.83, 0.565, 0.983, 0.067,
  0.251, 0.753, 0.744, 0.761, 0.728, 0.793, 0.657, 0.901, 0.355, 0.916, 0.308,
  0.852, 0.504, 0.011, 0.044, 0.168, 0.56, 0.986, 0.057, 0.215, 0.674, 0.879,
  0.426, 0.978, 0.086, 0.316, 0.864, 0.47, 0.015, 0.058, 0.218, 0.683, 0.867,
  0.462, 0.023, 0.09, 0.329, 0.883, 0.413, 0.969, 0.119, 0.419, 0.973, 0.104,
  0.371, 0.934, 0.247, 0.745, 0.76, 0.729, 0.79, 0.664, 0.893, 0.383, 0.945,
  0.206, 0.655, 0.904, 0.348, 0.908, 0.336, 0.892, 0.386, 0.948, 0.199, 0.637,
  0.924, 0.279, 0.805, 0.627, 0.936, 0.241, 0.732, 0.786, 0.674, 0.879, 0.425,
  0.978, 0.087, 0.319, 0.868, 0.457, 0.029, 0.113, 0.401, 0.961, 0.15, 0.509,
  0.027, 0.107, 0.381, 0.943, 0.213, 0.671, 0.883, 0.414, 0.97, 0.115, 0.406,
  0.964, 0.137, 0.473, 0.012, 0.048, 0.183, 0.597, 0.962, 0.146, 0.499, 0.026,
  0.103, 0.37, 0.932, 0.253, 0.756, 0.739, 0.772, 0.703, 0.834, 0.553, 0.989,
  0.044, 0.169, 0.561, 0.985, 0.058, 0.219, 0.684, 0.864, 0.471, 0.014, 0.056,
  0.21, 0.664, 0.892, 0.386, 0.948, 0.198, 0.635, 0.927, 0.271, 0.79, 0.664,
  0.892, 0.385, 0.947, 0.201, 0.643, 0.919, 0.299, 0.839, 0.541, 0.027, 0.104,
  0.371, 0.934, 0.247, 0.745, 0.761, 0.728, 0.791, 0.66, 0.897, 0.37, 0.932,
  0.253, 0.756, 0.738, 0.773, 0.701, 0.838, 0.542, 0.028, 0.109, 0.389, 0.951,
  0.187, 0.608, 0.953, 0.18, 0.59, 0.968, 0.125, 0.437, 0.984, 0.063, 0.237,
  0.723, 0.801, 0.638, 0.924, 0.281, 0.808, 0.621, 0.942, 0.22, 0.686, 0.861,
  0.479, 0.03, 0.116, 0.411, 0.968, 0.124, 0.435, 0.983, 0.067, 0.252, 0.753,
  0.744, 0.762, 0.725, 0.797, 0.647, 0.913, 0.317, 0.866, 0.463, 0.022, 0.087,
  0.317, 0.867, 0.463, 0.023, 0.089, 0.324, 0.876, 0.435, 0.983, 0.067, 0.248,
  0.747, 0.757, 0.736, 0.776, 0.695, 0.848, 0.515, 0.016, 0.063, 0.237, 0.724,
  0.799, 0.643, 0.918, 0.3, 0.839, 0.54, 0.026, 0.1, 0.361, 0.923, 0.286, 0.816,
  0.6, 0.96, 0.153, 0.519, 0.024, 0.095, 0.345, 0.904, 0.346, 0.905, 0.345,
  0.903, 0.349, 0.909, 0.33, 0.885, 0.407, 0.966, 0.133, 0.461, 0.024, 0.096,
  0.346, 0.905, 0.345, 0.904, 0.349, 0.908, 0.334, 0.889, 0.393, 0.954, 0.174,
  0.574, 0.978, 0.087, 0.316, 0.865, 0.467, 0.018, 0.069, 0.257, 0.763, 0.722,
  0.802, 0.635, 0.927, 0.27, 0.788, 0.667, 0.888, 0.397, 0.957, 0.164, 0.547,
  0.036, 0.137, 0.474, 0.011, 0.044, 0.17, 0.563, 0.984, 0.063, 0.238, 0.725,
  0.798, 0.645, 0.916, 0.308, 0.853, 0.502, 0.029, 0.112, 0.399, 0.959, 0.157,
  0.528, 0.013, 0.051, 0.195, 0.628, 0.934, 0.247, 0.743, 0.764, 0.721, 0.804,
  0.63, 0.932, 0.252, 0.754, 0.742, 0.766, 0.717, 0.812, 0.611, 0.951, 0.188,
  0.61, 0.951, 0.185, 0.604, 0.956, 0.166, 0.555, 0.988, 0.048, 0.183, 0.599,
  0.961, 0.15, 0.51, 0.03, 0.118, 0.416, 0.972, 0.11, 0.391, 0.952, 0.181,
  0.593, 0.965, 0.134, 0.465, 0.02, 0.079, 0.291, 0.825, 0.579, 0.975, 0.097,
  0.35, 0.91, 0.328, 0.882, 0.417, 0.973, 0.107, 0.381, 0.944, 0.212, 0.669,
  0.885, 0.406, 0.964, 0.137, 0.474, 0.011, 0.045, 0.17, 0.566, 0.983, 0.068,
  0.254, 0.758, 0.734, 0.781, 0.684, 0.864, 0.469, 0.015, 0.061, 0.229, 0.706,
  0.831, 0.562, 0.985, 0.061, 0.229, 0.705, 0.831, 0.561, 0.985, 0.06, 0.225,
  0.697, 0.845, 0.524, 0.039, 0.152, 0.515, 0.015, 0.059, 0.222, 0.691, 0.853,
  0.501, 0.026, 0.1, 0.361, 0.922, 0.286, 0.817, 0.597, 0.962, 0.145, 0.495,
  0.013, 0.05, 0.191, 0.619, 0.944, 0.213, 0.67, 0.885, 0.408, 0.966, 0.13,
  0.453, 0.036, 0.139, 0.478, 0.032, 0.125, 0.437, 0.984, 0.064, 0.238, 0.726,
  0.796, 0.65, 0.91, 0.327, 0.88, 0.423, 0.976, 0.093, 0.339, 0.896, 0.372,
  0.935, 0.245, 0.739, 0.772, 0.705, 0.833, 0.557, 0.987, 0.052, 0.198, 0.636,
  0.926, 0.275, 0.798, 0.644, 0.917, 0.306, 0.849, 0.514, 0.014, 0.053, 0.202,
  0.646, 0.915, 0.311, 0.857, 0.49, 0.032, 0.123, 0.431, 0.981, 0.076, 0.281,
  0.808, 0.62, 0.942, 0.219, 0.684, 0.864, 0.47, 0.015, 0.058, 0.219, 0.685,
  0.863, 0.472, 0.013, 0.052, 0.198, 0.636, 0.926, 0.274, 0.795, 0.651, 0.909,
  0.332, 0.887, 0.401, 0.961, 0.151, 0.513, 0.012, 0.048, 0.183, 0.599, 0.961,
  0.151, 0.512, 0.011, 0.042, 0.161, 0.541, 0.027, 0.106, 0.381, 0.943, 0.215,
  0.676, 0.876, 0.435, 0.983, 0.068, 0.252, 0.753, 0.743, 0.764,
];
const chaosCounters = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
];
// Keep independent chaos array index for each paramenter
// one array per instrument, one array element per instrument choice

function lesChaos(i, j) {
  let chaosValue = chaosValues[chaosCounters[i][j]];
  chaosCounters[i][j] = (chaosCounters[i][j] + 1) % 1000;
  return chaosValue;
}

/* Each ball has two states, called Presets. A preset is an array of 4 elements:
rhythmic probabilities array, sample name, gain array, and pitch array.
Depending on ball's location, the algorithm morphs between the two versions
of the element.

For example, if a ball is to the far left, it will use the sample from
the first preset. If it's to the far right, it will use the sample 
from the second preset (presets index offset by 10). In the middle,
it "flips a coin"

Mappings
X
pan <--- x
sample <--- this.flatMorphOffset = 2z + x

Y
rhythm array <--- preset || preset + morphOffset
scale array <--- preset || preset + morphOffset
gain array <--- this.flatMorphOffset  = 2z + x . // for now, only one element in array

Z
sample <--- this.flatMorphOffset = 2z + x

*/

class Preset {
  constructor(
    beatProb = [0.33, 0.33, 0.33],
    soundFilename = "low",
    gain = [1],
    scale = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24]
  ) {
    this.beatProb = beatProb;
    this.soundFilename = soundFilename;
    this.gain = gain;
    this.scale = scale;
    this.track = new Track(beatProb, 1); // 1 as 2nd argument uses chaosValues instead of Math.random() to choose rhythmic steps
  }
}

let presets = [];

////////////////////////////////////////////////////////////////////////// near

//////////////////////  left

// octa
presets[0] = new Preset(
  [1, 0, 1],
  "00.c_pizz_fo_c2",
  [0.4],
  // [0, 4, 7, 9],
  [12, 14, 15, 19]
);
// sphere
presets[1] = new Preset(
  [1, 0.25],
  "REACH_JUPE_tonal_one_shot_reverb_pluck_dry_C",
  [0.1],
  [0, 4, 7]
);
// cube
presets[2] = new Preset([1, 0.5, 0.5], "Low_Tumba_Bass", [1], [-5, -12]);

////////////////////// right
// octa
presets[10] = new Preset(
  [1, 0, 1],
  "00.c_pizz_fo_c2",
  [0.4],
  // [12, 14, 15, 19]
  [24, 26, 27, 31]
);
// sphere
presets[11] = new Preset(
  [0, 0, 0, 1],
  "REACH_JUPE_tonal_one_shot_very_clean_pluck_02_C",
  [0.1],
  [4, 7]
); // [12, 14, 16, 19, 21, 24]);
//cube
presets[12] = new Preset([1, 0, 1], "Hi_Tumba_Tip", [1], [-5, 0, 9, 18]);

////////////////////////////////////////////////////////////////////////// far

//////////////////////  left
//  octa
presets[20] = new Preset(
  [0, 0.5, 1],
  "00.c_pizz_fo_c2_verb",
  [0.3],
  // [-5, -4, 0]
  [12, 14, 15, 19]
);
// sphere
presets[21] = new Preset(
  [1, 0.25],
  "REACH_JUPE_tonal_one_shot_reverb__pluck_wet_C",
  [0.2],
  [0]
); // [-12, -9, -5, 0]);
// cube
presets[22] = new Preset([1, 0.5, 0.5], "Low_Tumba_Bass", [1], [-5, -12]);

////////////////////// right
// octa
presets[30] = new Preset(
  [1],
  "00.c_pizz_fo_c2_verb",
  [0.3],
  // [-7, 0]
  [24, 26, 27, 31]
);
// sphere
presets[31] = new Preset(
  [0, 0.5, 1],
  "REACH_JUPE_tonal_one_shot_very_clean_pluck_02_C_verb",
  [0.5],
  [0]
); // [12, 14, 16, 19, 21, 24]);
// cube
presets[32] = new Preset([1, 0, 1], "Hi_Tumba_Tip", [1], [0, 6, 18, 24]);

const Sequencer = {
  timeout: function (callback, length) {
    if (length <= 0) {
      length = 1;
    }
    var source = audioCtx.createBufferSource();
    source.buffer = audioCtx.createBuffer(1, 32000 * (length / 1000), 32000);
    source.connect(audioCtx.destination);
    source.onended = callback;
    if (!source.stop) {
      source.stop = source.noteOff;
    }
    if (!source.start) {
      source.start = source.start;
    }
    source.start(0);
    return source;
  },
  clearTimeout: function (timeout) {
    timeout.stop(0);
  },
};

function createNewSound(fileName, parent) {
  var url = "audio/" + fileName + ".mp3";
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";
  function onError(event) {
    console.log(event);
  }
  request.onload = function () {
    audioCtx.decodeAudioData(
      request.response,
      function (buffer) {
        parent.sound[fileName] = buffer;
      },
      onError
    );
  };
  request.send();
}

function Instrument(rateWrapper, meterWrapper, morphWrapper, trackNumber) {
  this.rate = rateWrapper;
  this.meterOptions = meterWrapper;
  this.morphWrapper = morphWrapper;
  this.trackNumber = trackNumber;
  this.morph = [
    [50, 50, 50],
    [50, 50, 50],
    [50, 50, 50],
  ];
  this.morph[this.trackNumber][0] = this.morphWrapper(this.trackNumber, 0); ////// updated x position, mapped 0 - 100
  this.morph[this.trackNumber][1] = this.morphWrapper(this.trackNumber, 1); // y
  this.morph[this.trackNumber][2] = this.morphWrapper(this.trackNumber, 2); // z

  this.pan = 0;
  this.stopped = true;
  this.justStarted = true;
  this.listenEvents();
  this.sound = {};
  this.morphOffset = [0, 0, 0];

  // create 4 sounds per instrument for morphing between
  createNewSound(presets[trackNumber].soundFilename, this);
  createNewSound(presets[trackNumber + 10].soundFilename, this);
  createNewSound(presets[trackNumber + 20].soundFilename, this);
  createNewSound(presets[trackNumber + 30].soundFilename, this);
  // this.track = presets[this.trackNumber].track;
  return this;
}
Instrument.prototype = {
  start: function () {
    iosSleepPreventInterval = setInterval(function () {
      // window.location.href = "/new/page";
      window.setTimeout(function () {
        window.stop();
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
    if (!this.justStarted && this.barNotes) this.stopBar();
    this.innerLoop();
    return this.mainLoop();
  },
  innerLoop: function () {
    var instrument = this;
    instrument.barNotes = [];
    for (var i = 0; i < instrument.meter("beat"); i++) {
      (function (i) {
        instrument.barNotes[i] = Sequencer.timeout(function () {
          instrument.pulse(i); // pulse is 16th note beats. see definition directly below
        }, (i * instrument.temp()) / instrument.meter("value"));
      })(i);
    }
  },
};

//////////////////////////////////////////////////////////////
// play notes
//////////////////////////////////////////////////////////////

// Each beat (each pulse call & track), flip a coin to decide morphOffset, which is added to preset number
// to select one of the four presets per track
Instrument.prototype.pulse = function (i) {
  let soloState;
  if (isDragging) {
    soloState = hitIndex; // solo this track
  } else {
    soloState = -1; // no solo
  }

  let parameter = 0; // each chaotically chosen paramenter needs a number   << SHOULD THIS GET RESET EVERY BEAT?
  let coinToss = Math.floor(lesChaos(this.trackNumber, parameter) * 100);
  for (let j = 0; j < this.morph.length; j++) {
    // for x, y, and z positions
    if (coinToss > this.morph[this.trackNumber][j]) {
      //  <---- morphOffet for each dimension based on position --------<<<
      this.morphOffset[j] = 0;
    } else {
      this.morphOffset[j] = 10;
    }
  }

  this.morph[this.trackNumber][0] = this.morphWrapper(this.trackNumber, 0); // x
  this.morph[this.trackNumber][1] = this.morphWrapper(this.trackNumber, 1); // y
  this.morph[this.trackNumber][2] = this.morphWrapper(this.trackNumber, 2); // z
  // Sample choice determnined by x & z value
  this.flatMorphOffset = 2 * (10 - this.morphOffset[2]) + this.morphOffset[0]; // 2z + x

  let chosenTrack = presets[this.trackNumber + this.morphOffset[1]].track; //  {<---- choose rhythm array (.track) --------<<<

  // get track playState from noneuclidean.js
  // If there's a note to play here, then get xyz position of ball & flash it
  let playState = chosenTrack.play();

  // if solo is off or if this track is being soloed
  let playNow = playState && (soloState == -1 || soloState == this.trackNumber);

  if (playNow) {
    this.playSound(
      presets[this.trackNumber + this.flatMorphOffset].soundFilename // <---- choose sound from preset --------<<<
    );
  }

  // Make objects flash when they play
  if (playNow) {
    switch (this.trackNumber) {
      case 0:
        octaMesh.material.emissive.set(0xf2b705);
        octaLight.color.setHex(0xf2b705);
        break;
      case 1:
        ballMesh.material.emissive.set(0xbf1304);
        ballLight.color.setHex(0xbf1304);
        break;
      case 2:
        cubeMesh.material.emissive.set(0x048abf);
        cubeLight.color.setHex(0x048abf);
    }
  } else {
    switch (this.trackNumber) {
      case 0:
        octaMesh.material.emissive.set(0x000000);
        octaLight.color.setHex(0x000000);
        break;
      case 1:
        ballMesh.material.emissive.set(0x000000);
        ballLight.color.setHex(0x000000);
        break;
      case 2:
        cubeMesh.material.emissive.set(0x000000);
        cubeLight.color.setHex(0x000000);
    }
  }
};

// Audio output goees to compressor node
const compressor = audioCtx.createDynamicsCompressor();
compressor.threshold.setValueAtTime(-50, audioCtx.currentTime);
compressor.knee.setValueAtTime(10, audioCtx.currentTime);
compressor.ratio.setValueAtTime(9, audioCtx.currentTime);
compressor.attack.setValueAtTime(0.01, audioCtx.currentTime);
compressor.release.setValueAtTime(0.1, audioCtx.currentTime);
const masterGainNode = audioCtx.createGain();
masterGainNode.gain.value = 2;
compressor.connect(masterGainNode);
masterGainNode.connect(audioCtx.destination);

// Use preset parameters and morph value (position) to chose gain, pan, and scale
// Set up webaudio
Instrument.prototype.playSound = function (buffer) {
  this.gainNode = audioCtx.createGain();
  this.panner = audioCtx.createStereoPanner();
  this.source = audioCtx.createBufferSource();
  this.source.buffer = this.sound[buffer];
  this.source.connect(this.gainNode);
  this.gainNode.connect(this.panner);
  this.panner.connect(compressor); // Connect each instrument to compressor for mixing and output

  // Calculate gain using chaos function
  // Note that the lesChaos is reading from an array of baked values, with the lookup index tracked separately for each parameter
  let parameter = 1; // each chaotically chosen paramenter needs a number
  let linearGain =
    (lesChaos(this.trackNumber, parameter) * 0.5 + 0.5) *
    presets[this.trackNumber + this.flatMorphOffset].gain; // <---- choose gain --------<<<
  this.gainNode.gain.value = linearGain * linearGain; // easy hack to make volume a bit more logarithmic

  // Pan determined by x value - not morphed preset
  // convert 0-100 to -1 to +1 for webaudio panner
  this.panner.pan.value = this.morph[this.trackNumber][0] * 0.02 - 1; // <---- choose pan from x position --------<<<

  // Pick scale using y value, choose chaotically chosen note in scale
  let scale = presets[this.trackNumber + this.morphOffset[1]].scale; // <---- choose scale --------<<<
  parameter = 2; // each chaotically chosen paramenter needs a number
  this.source.detune.value =
    (scale[Math.floor(lesChaos(this.trackNumber, parameter) * scale.length)] -
      12) *
    100; // <---- choose pitch from preset scale --------<<<
  this.source.start(0);
};

Instrument.prototype.barInterval = function () {
  if (this.justStarted) {
    this.justStarted = false;
    return 0;
  } else {
    return ((this.meter("beat") * 1) / this.meter("value")) * this.temp(); // ms per bar
  }
};

//////////////////////////////////// meter select ///// UI disabled

Instrument.prototype.meter = function (option) {
  // vestigial code if meter UI is used
  // this[option] = this[option] || parseInt(this.meterOptions.find('#note_' + option + ' option:selected').text());
  this[option] = 16;
  return this[option];
};
Instrument.prototype.temp = function () {
  this.bpm = this.bpm || parseInt(this.rate.val());
  this.tempValue = (60 / this.bpm) * 1000 * 4;
  return this.tempValue;
};

Instrument.prototype.stopBar = function () {
  for (var i = 0; i < this.barNotes.length; i++)
    Sequencer.clearTimeout(this.barNotes[i]);
};
Instrument.prototype.listenEvents = function () {
  var instrument = this;

  //////////////////////////////////// value select
  instrument.meterOptions.find("select").change(function () {
    var optionName = $(this).attr("id").split("note_")[1];
    var optionValue = 16;
    // vestigial code if meter UI is used
    // var optionValue = parseInt($(this).find('option:selected').text());
    instrument[optionName] = optionValue;
  });
  instrument.rate.bind("keyup change input", function () {
    instrument.bpm = parseInt(this.value);
  });
};

export { Instrument };
