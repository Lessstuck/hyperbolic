import {Track} from "./noneuclidean/noneuclidean.mjs";
import {octaMesh, ballMesh, cubeMesh, hitIndex, isDragging } from "./mousepick.js";

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

var iosSleepPreventInterval = null;


///////////////  Chaos lookup to replace Math.random()
const chaosValues = [0.360 , 0.921 , 0.289 , 0.823 , 0.584 , 0.972 , 0.109 , 0.390 , 0.951 , 0.185 , 0.603 , 0.957 , 0.163 , 0.546 , 0.034 , 0.132 , 0.459 , 0.027 , 0.104 , 0.374 , 0.936 , 0.238 , 0.725 , 0.797 , 0.648 , 0.912 , 0.320 , 0.870 , 0.452 , 0.037 , 0.144 , 0.493 , 0.020 , 0.078 , 0.289 , 0.822 , 0.584 , 0.971 , 0.111 , 0.394 , 0.955 , 0.171 , 0.568 , 0.981 , 0.073 , 0.272 , 0.792 , 0.660 , 0.898 , 0.368 , 0.930 , 0.260 , 0.770 , 0.708 , 0.828 , 0.571 , 0.980 , 0.079 , 0.289 , 0.822 , 0.584 , 0.972 , 0.110 , 0.392 , 0.953 , 0.177 , 0.584 , 0.972 , 0.109 , 0.390 , 0.951 , 0.185 , 0.602 , 0.958 , 0.161 , 0.540 , 0.026 , 0.100 , 0.361 , 0.922 , 0.287 , 0.818 , 0.596 , 0.963 , 0.143 , 0.490 , 0.030 , 0.118 , 0.415 , 0.971 , 0.112 , 0.397 , 0.957 , 0.163 , 0.547 , 0.035 , 0.134 , 0.465 , 0.019 , 0.076 , 0.281 , 0.808 , 0.619 , 0.943 , 0.215 , 0.675 , 0.877 , 0.430 , 0.980 , 0.077 , 0.284 , 0.814 , 0.606 , 0.955 , 0.171 , 0.568 , 0.981 , 0.074 , 0.273 , 0.793 , 0.656 , 0.902 , 0.352 , 0.913 , 0.318 , 0.868 , 0.458 , 0.028 , 0.110 , 0.391 , 0.952 , 0.183 , 0.598 , 0.962 , 0.148 , 0.503 , 0.037 , 0.142 , 0.487 , 0.012 , 0.047 , 0.178 , 0.585 , 0.971 , 0.112 , 0.398 , 0.958 , 0.161 , 0.541 , 0.027 , 0.106 , 0.378 , 0.940 , 0.225 , 0.697 , 0.845 , 0.523 , 0.035 , 0.135 , 0.468 , 0.016 , 0.064 , 0.239 , 0.728 , 0.791 , 0.660 , 0.897 , 0.369 , 0.931 , 0.256 , 0.761 , 0.727 , 0.794 , 0.654 , 0.905 , 0.345 , 0.904 , 0.348 , 0.907 , 0.338 , 0.895 , 0.377 , 0.940 , 0.227 , 0.702 , 0.837 , 0.546 , 0.034 , 0.130 , 0.451 , 0.039 , 0.148 , 0.505 , 0.014 , 0.054 , 0.206 , 0.654 , 0.905 , 0.342 , 0.900 , 0.359 , 0.920 , 0.294 , 0.830 , 0.565 , 0.983 , 0.066 , 0.246 , 0.743 , 0.764 , 0.721 , 0.805 , 0.628 , 0.935 , 0.243 , 0.737 , 0.776 , 0.696 , 0.847 , 0.520 , 0.026 , 0.101 , 0.363 , 0.924 , 0.280 , 0.806 , 0.626 , 0.936 , 0.239 , 0.727 , 0.793 , 0.657 , 0.902 , 0.355 , 0.916 , 0.309 , 0.854 , 0.497 , 0.032 , 0.124 , 0.435 , 0.983 , 0.067 , 0.249 , 0.748 , 0.754 , 0.742 , 0.766 , 0.717 , 0.812 , 0.612 , 0.950 , 0.190 , 0.614 , 0.948 , 0.199 , 0.637 , 0.925 , 0.279 , 0.804 , 0.630 , 0.932 , 0.253 , 0.755 , 0.739 , 0.771 , 0.706 , 0.831 , 0.562 , 0.985 , 0.061 , 0.229 , 0.706 , 0.830 , 0.565 , 0.983 , 0.066 , 0.247 , 0.744 , 0.763 , 0.724 , 0.800 , 0.641 , 0.920 , 0.293 , 0.829 , 0.567 , 0.982 , 0.070 , 0.261 , 0.771 , 0.706 , 0.830 , 0.564 , 0.983 , 0.065 , 0.243 , 0.735 , 0.779 , 0.690 , 0.856 , 0.493 , 0.020 , 0.077 , 0.284 , 0.813 , 0.609 , 0.952 , 0.182 , 0.595 , 0.963 , 0.141 , 0.484 , 0.019 , 0.074 , 0.274 , 0.795 , 0.652 , 0.908 , 0.334 , 0.890 , 0.391 , 0.952 , 0.183 , 0.598 , 0.962 , 0.147 , 0.502 , 0.031 , 0.121 , 0.425 , 0.977 , 0.089 , 0.324 , 0.876 , 0.434 , 0.983 , 0.068 , 0.254 , 0.759 , 0.732 , 0.784 , 0.678 , 0.874 , 0.442 , 0.986 , 0.054 , 0.203 , 0.647 , 0.914 , 0.316 , 0.864 , 0.470 , 0.015 , 0.059 , 0.223 , 0.692 , 0.852 , 0.504 , 0.010 , 0.041 , 0.157 , 0.529 , 0.014 , 0.055 , 0.210 , 0.663 , 0.894 , 0.379 , 0.941 , 0.221 , 0.688 , 0.858 , 0.487 , 0.012 , 0.047 , 0.177 , 0.584 , 0.972 , 0.110 , 0.390 , 0.952 , 0.183 , 0.599 , 0.961 , 0.151 , 0.513 , 0.013 , 0.051 , 0.194 , 0.626 , 0.937 , 0.237 , 0.723 , 0.800 , 0.639 , 0.923 , 0.285 , 0.816 , 0.601 , 0.959 , 0.157 , 0.530 , 0.015 , 0.058 , 0.220 , 0.686 , 0.862 , 0.475 , 0.010 , 0.040 , 0.153 , 0.519 , 0.024 , 0.095 , 0.345 , 0.904 , 0.347 , 0.907 , 0.338 , 0.895 , 0.377 , 0.939 , 0.229 , 0.706 , 0.830 , 0.565 , 0.983 , 0.067 , 0.251 , 0.753 , 0.744 , 0.761 , 0.728 , 0.793 , 0.657 , 0.901 , 0.355 , 0.916 , 0.308 , 0.852 , 0.504 , 0.011 , 0.044 , 0.168 , 0.560 , 0.986 , 0.057 , 0.215 , 0.674 , 0.879 , 0.426 , 0.978 , 0.086 , 0.316 , 0.864 , 0.470 , 0.015 , 0.058 , 0.218 , 0.683 , 0.867 , 0.462 , 0.023 , 0.090 , 0.329 , 0.883 , 0.413 , 0.969 , 0.119 , 0.419 , 0.973 , 0.104 , 0.371 , 0.934 , 0.247 , 0.745 , 0.760 , 0.729 , 0.790 , 0.664 , 0.893 , 0.383 , 0.945 , 0.206 , 0.655 , 0.904 , 0.348 , 0.908 , 0.336 , 0.892 , 0.386 , 0.948 , 0.199 , 0.637 , 0.924 , 0.279 , 0.805 , 0.627 , 0.936 , 0.241 , 0.732 , 0.786 , 0.674 , 0.879 , 0.425 , 0.978 , 0.087 , 0.319 , 0.868 , 0.457 , 0.029 , 0.113 , 0.401 , 0.961 , 0.150 , 0.509 , 0.027 , 0.107 , 0.381 , 0.943 , 0.213 , 0.671 , 0.883 , 0.414 , 0.970 , 0.115 , 0.406 , 0.964 , 0.137 , 0.473 , 0.012 , 0.048 , 0.183 , 0.597 , 0.962 , 0.146 , 0.499 , 0.026 , 0.103 , 0.370 , 0.932 , 0.253 , 0.756 , 0.739 , 0.772 , 0.703 , 0.834 , 0.553 , 0.989 , 0.044 , 0.169 , 0.561 , 0.985 , 0.058 , 0.219 , 0.684 , 0.864 , 0.471 , 0.014 , 0.056 , 0.210 , 0.664 , 0.892 , 0.386 , 0.948 , 0.198 , 0.635 , 0.927 , 0.271 , 0.790 , 0.664 , 0.892 , 0.385 , 0.947 , 0.201 , 0.643 , 0.919 , 0.299 , 0.839 , 0.541 , 0.027 , 0.104 , 0.371 , 0.934 , 0.247 , 0.745 , 0.761 , 0.728 , 0.791 , 0.660 , 0.897 , 0.370 , 0.932 , 0.253 , 0.756 , 0.738 , 0.773 , 0.701 , 0.838 , 0.542 , 0.028 , 0.109 , 0.389 , 0.951 , 0.187 , 0.608 , 0.953 , 0.180 , 0.590 , 0.968 , 0.125 , 0.437 , 0.984 , 0.063 , 0.237 , 0.723 , 0.801 , 0.638 , 0.924 , 0.281 , 0.808 , 0.621 , 0.942 , 0.220 , 0.686 , 0.861 , 0.479 , 0.030 , 0.116 , 0.411 , 0.968 , 0.124 , 0.435 , 0.983 , 0.067 , 0.252 , 0.753 , 0.744 , 0.762 , 0.725 , 0.797 , 0.647 , 0.913 , 0.317 , 0.866 , 0.463 , 0.022 , 0.087 , 0.317 , 0.867 , 0.463 , 0.023 , 0.089 , 0.324 , 0.876 , 0.435 , 0.983 , 0.067 , 0.248 , 0.747 , 0.757 , 0.736 , 0.776 , 0.695 , 0.848 , 0.515 , 0.016 , 0.063 , 0.237 , 0.724 , 0.799 , 0.643 , 0.918 , 0.300 , 0.839 , 0.540 , 0.026 , 0.100 , 0.361 , 0.923 , 0.286 , 0.816 , 0.600 , 0.960 , 0.153 , 0.519 , 0.024 , 0.095 , 0.345 , 0.904 , 0.346 , 0.905 , 0.345 , 0.903 , 0.349 , 0.909 , 0.330 , 0.885 , 0.407 , 0.966 , 0.133 , 0.461 , 0.024 , 0.096 , 0.346 , 0.905 , 0.345 , 0.904 , 0.349 , 0.908 , 0.334 , 0.889 , 0.393 , 0.954 , 0.174 , 0.574 , 0.978 , 0.087 , 0.316 , 0.865 , 0.467 , 0.018 , 0.069 , 0.257 , 0.763 , 0.722 , 0.802 , 0.635 , 0.927 , 0.270 , 0.788 , 0.667 , 0.888 , 0.397 , 0.957 , 0.164 , 0.547 , 0.036 , 0.137 , 0.474 , 0.011 , 0.044 , 0.170 , 0.563 , 0.984 , 0.063 , 0.238 , 0.725 , 0.798 , 0.645 , 0.916 , 0.308 , 0.853 , 0.502 , 0.029 , 0.112 , 0.399 , 0.959 , 0.157 , 0.528 , 0.013 , 0.051 , 0.195 , 0.628 , 0.934 , 0.247 , 0.743 , 0.764 , 0.721 , 0.804 , 0.630 , 0.932 , 0.252 , 0.754 , 0.742 , 0.766 , 0.717 , 0.812 , 0.611 , 0.951 , 0.188 , 0.610 , 0.951 , 0.185 , 0.604 , 0.956 , 0.166 , 0.555 , 0.988 , 0.048 , 0.183 , 0.599 , 0.961 , 0.150 , 0.510 , 0.030 , 0.118 , 0.416 , 0.972 , 0.110 , 0.391 , 0.952 , 0.181 , 0.593 , 0.965 , 0.134 , 0.465 , 0.020 , 0.079 , 0.291 , 0.825 , 0.579 , 0.975 , 0.097 , 0.350 , 0.910 , 0.328 , 0.882 , 0.417 , 0.973 , 0.107 , 0.381 , 0.944 , 0.212 , 0.669 , 0.885 , 0.406 , 0.964 , 0.137 , 0.474 , 0.011 , 0.045 , 0.170 , 0.566 , 0.983 , 0.068 , 0.254 , 0.758 , 0.734 , 0.781 , 0.684 , 0.864 , 0.469 , 0.015 , 0.061 , 0.229 , 0.706 , 0.831 , 0.562 , 0.985 , 0.061 , 0.229 , 0.705 , 0.831 , 0.561 , 0.985 , 0.060 , 0.225 , 0.697 , 0.845 , 0.524 , 0.039 , 0.152 , 0.515 , 0.015 , 0.059 , 0.222 , 0.691 , 0.853 , 0.501 , 0.026 , 0.100 , 0.361 , 0.922 , 0.286 , 0.817 , 0.597 , 0.962 , 0.145 , 0.495 , 0.013 , 0.050 , 0.191 , 0.619 , 0.944 , 0.213 , 0.670 , 0.885 , 0.408 , 0.966 , 0.130 , 0.453 , 0.036 , 0.139 , 0.478 , 0.032 , 0.125 , 0.437 , 0.984 , 0.064 , 0.238 , 0.726 , 0.796 , 0.650 , 0.910 , 0.327 , 0.880 , 0.423 , 0.976 , 0.093 , 0.339 , 0.896 , 0.372 , 0.935 , 0.245 , 0.739 , 0.772 , 0.705 , 0.833 , 0.557 , 0.987 , 0.052 , 0.198 , 0.636 , 0.926 , 0.275 , 0.798 , 0.644 , 0.917 , 0.306 , 0.849 , 0.514 , 0.014 , 0.053 , 0.202 , 0.646 , 0.915 , 0.311 , 0.857 , 0.490 , 0.032 , 0.123 , 0.431 , 0.981 , 0.076 , 0.281 , 0.808 , 0.620 , 0.942 , 0.219 , 0.684 , 0.864 , 0.470 , 0.015 , 0.058 , 0.219 , 0.685 , 0.863 , 0.472 , 0.013 , 0.052 , 0.198 , 0.636 , 0.926 , 0.274 , 0.795 , 0.651 , 0.909 , 0.332 , 0.887 , 0.401 , 0.961 , 0.151 , 0.513 , 0.012 , 0.048 , 0.183 , 0.599 , 0.961 , 0.151 , 0.512 , 0.011 , 0.042 , 0.161 , 0.541 , 0.027 , 0.106 , 0.381 , 0.943 , 0.215 , 0.676 , 0.876 , 0.435 , 0.983 , 0.068 , 0.252 , 0.753 , 0.743 , 0.764 , ]
const chaosCounters = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];  // one array per instrument, one array element per instrument choice

function lesChaos(i, j)  {
  let chaosValue = chaosValues[chaosCounters[i][j]]
  chaosCounters[i][j] = (chaosCounters[i][j] + 1) % 1000;
  return chaosValue;
}

/* Each ball has two states, called Presets. A preset is an array of 4 elements:
rhythmic probabilities array, sample name, volume, and pitch set.
Depending on ball's location, the algorithm morphs between the two versions
of the element.

For example, if a ball is to the far left, it will use the sample from
the first preset. If it's to the far right, it will use the sample 
from the second preset (presets index offset by 10). In the middle,
it "flips a coin"

*/

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

//
// this.flatMorphOffset is a multiple of 10 added to presets index, to choose from 
// several versions of the same instrument
// 
let presets = [];
// near 

// okta
presets[0]  = new Preset ([0, 1, 1], 'ad4_bikebell_ding_muted_07', [.25], [7, 9, 12, 14]);
// sphere
presets[1]  = new Preset ([1, .25], 'REACH_JUPE_tonal_one_shot_reverb_pluck_dry_C', [.5], [0])// [-12, -9, -5, 0]);
// cube
presets[2]  = new Preset ([0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0], 'Low_Tumba_Bass', [.75], [-5, -12]);


presets[10]  = new Preset ([1], 'ad4_bikebell_ding_v02_04', [.25], [16]);
presets[11]  = new Preset ([0, 0, 0, 1], 'REACH_JUPE_tonal_one_shot_very_clean_pluck_02_C', [.025], [0])// [12, 14, 16, 19, 21, 24]);
presets[12]  = new Preset ([1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 'Hi_Tumba_Tip', [.5], [ 18, 24, 30, 36]);

// far

presets[20]  = new Preset ([0, 1, 1], 'ad4_bikebell_ding_muted_07', [.25], [7, 9, 12, 14]);
presets[21]  = new Preset ([1, .25], 'REACH_JUPE_tonal_one_shot_reverb__pluck_wet_C', [1], [0])// [-12, -9, -5, 0]);
presets[22]  = new Preset ([0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0], 'Low_Tumba_Bass', [.75], [-5, -12]);


presets[30]  = new Preset ([1], 'ad4_bikebell_ding_v02_04', [.25], [16]);
presets[31]  = new Preset ([0, 0, 0, 1], 'REACH_JUPE_tonal_one_shot_very_clean_pluck_02_C_verb', [.025], [0])// [12, 14, 16, 19, 21, 24]);
presets[32]  = new Preset ([1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 'Hi_Tumba_Tip', [.5], [ 18, 24, 30, 36]);



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
  var url = 'audio/' + fileName + ".mp3";
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
  this.morph[this.trackNumber][1] = this.morphWrapper(this.trackNumber, 1);     // y
  this.morph[this.trackNumber][2] = this.morphWrapper(this.trackNumber, 2);     // z
  this.pan = 0;
  this.stopped      = true;
  this.justStarted  = true;
  this.listenEvents();
  this.sound = {};
  this.morphOffset = [0, 0, 0];
  
  // create 2 sounds per instrument for morphing between
  createNewSound(presets[trackNumber].soundFilename, this); 
  createNewSound(presets[trackNumber + 10].soundFilename, this); 
  createNewSound(presets[trackNumber + 20].soundFilename, this); 
  createNewSound(presets[trackNumber + 30].soundFilename, this); 
  // this.track = presets[this.trackNumber].track;
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
          instrument.pulse(i);    // pulse is 16th note beats. see definition directly below
        },i*instrument.temp()/instrument.meter('value'))
      })(i);
    }
  }
};

//////////////////////////////////////////////////////////////
// play notes
//////////////////////////////////////////////////////////////

// Each beat (each pulse call & track), flip a coin to decide morphOffset, which is added to preset number
// to select one of the two presets per track
Instrument.prototype.pulse = function (i) {
  let parameter = 0; // each chaotically chosen paramenter needs a number   << SHOULD THIS GET RESET EVERY BEAT?
  let coinToss = Math.floor(lesChaos(this.trackNumber, parameter) * 100);
  for (let j = 0; j < this.morph.length; j++) {   // for x, y, and z positions
    if (coinToss > this.morph[this.trackNumber][j]) {   //  <---- morphOffet for each dimension based on position --------<<<
      this.morphOffset[j] = 0;
    } else  {
      this.morphOffset[j] = 10;
    };
  }
  let chosenTrack = presets[this.trackNumber + this.morphOffset[1]].track; //  {<---- choose rhythm array (.track) --------<<<
  
  // get track playState from noneuclidean.js
  // If there's a note to play here, then get xyz position of ball & flash it
  let playState = chosenTrack.play();
  let soloState;
  if (isDragging) {
    soloState = hitIndex;
  } else  {
    soloState = -1;
  };
  console.log(`soloState  ${soloState}`)

  if (playState && ((soloState == -1) || (soloState == this.trackNumber))) {                            // solo function
    this.morph[this.trackNumber][0] = this.morphWrapper(this.trackNumber, 0); // x
    this.morph[this.trackNumber][1] = this.morphWrapper(this.trackNumber, 1); // y
    this.morph[this.trackNumber][2] = this.morphWrapper(this.trackNumber, 2); // z
    // Make objects flash when they play 
    switch (this.trackNumber)  {
      case 0:
        octaMesh.material.emissive.set(0x222222)
      case 1:
        ballMesh.material.emissive.set(0x222222)
      case 2:
        cubeMesh.material.emissive.set(0x222222)
    }   
    // Sample choice determnined by x & z value  (was y)
    // console.log(`this.morphOffset[0] ${this.morphOffset[0]} --- this.morphOffset[2] + ${this.morphOffset[0]}`);
    this.flatMorphOffset = (2 * (10 - this.morphOffset[2])) + this.morphOffset[0];   // 2y + x

    if (this.trackNumber == 1)
  {
    console.log(`chosen preset ${this.trackNumber + this.flatMorphOffset}`)
  }

    this.playSound(presets[this.trackNumber + this.flatMorphOffset].soundFilename);  //  <---- choose sound from preset --------<<<
  } else {
    switch (this.trackNumber)   {
    case 0:
      octaMesh.material.emissive.set(0x000000)
    case 1:
      ballMesh.material.emissive.set(0x000000)
    case 2:
      cubeMesh.material.emissive.set(0x000000)
    }
  };
};

// Use preset parameters and morph value (position) to chose gain, pan, and scale
// Set up webaudio
Instrument.prototype.playSound = function (buffer) {
  this.gainNode = context.createGain();
  this.panner = context.createStereoPanner();
  this.source = context.createBufferSource();
  this.source.buffer = this.sound[buffer];
  this.source.connect(this.gainNode);
  this.gainNode.connect(this.panner);
  this.panner.connect(context.destination);
  // Calculate gain using chaos function
  // Note that the lesChaos is reading from an array of baked values, with the lookup index tracked separately for each parameter
  let parameter = 1; // each chaotically chosen paramenter needs a number
  let linearGain = ((lesChaos(this.trackNumber, parameter) * .5 + .5) * presets[this.trackNumber + this.morphOffset[1]].level);  // <---- choose gain --------<<<
  this.gainNode.gain.value = linearGain * linearGain;   // easy hack to make volume a bit more logarithmic
  // Pan determined by x value - not morphed preset
  // convert 0-100 to -1 to +1 for webaudio panner
  this.panner.pan.value = (this.morph[this.trackNumber][0] * .02) - 1; // <---- choose pan from x position --------<<<
  // Pick scale using y value, choose chaotically chosen note in scale
  let scale = presets[this.trackNumber + this.morphOffset[1]].scale;  // <---- choose scale --------<<<
  parameter = 2; // each chaotically chosen paramenter needs a number
  this.source.detune.value = (scale[Math.floor(lesChaos(this.trackNumber, parameter) * scale.length)] - 12) * 100; // <---- choose pitch from preset scale --------<<<
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
  // vestigial code if meter UI is used
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
    // vestigial code if meter UI is used
    // var optionValue = parseInt($(this).find('option:selected').text());
    instrument[optionName] = optionValue;
  });
  instrument.rate.bind('keyup change input', function () {
    instrument.bpm = parseInt(this.value);
  });
};



export {Instrument};
