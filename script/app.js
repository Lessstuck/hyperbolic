import {Metronome} from "./click.js";
import {dragPositions} from "./mousepick.js";
/// maps dragPositions (-5 to +5) to morph values (0 to 100)
/// i = body index, j = axis index
function morphTrigger(i, j) {
  return (dragPositions[i][j] + 5) * 10;
}

function browserFormat () {
  // if (navigator.userAgent.safari) {
    return ".mp3";
  // } else {
  //   return ".ogg";
  // };
};

$(document).ready(function () {
  const context = new AudioContext;
  window.addEventListener('touchstart', function() {
    var buffer = context.createBuffer(1, 1, 22050);
    var source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);

  }, false);
  var rateTrigger = $("#rate");
  var meterTrigger = $("#meter");
  let metronomes = [];

  metronomes[0] = new Metronome(rateTrigger, meterTrigger, morphTrigger, 0);
  metronomes[1] = new Metronome(rateTrigger, meterTrigger, morphTrigger, 1);
  metronomes[2] = new Metronome(rateTrigger, meterTrigger, morphTrigger, 2);

  $("#start").click(function (){
    if ($("#rate").val()) {
      for (let metronome of metronomes){
        metronome.start()
    }
    return false;
    }
  });
  $("#stop").click(function (){
    for (let metronome of metronomes){
      metronome.stop()
    }
    return false;
  });
 

})

export {browserFormat, morphTrigger};
