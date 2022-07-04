import {Instrument} from "./click.js";
import {dragPositions} from "./mousepick.js";


/// maps dragPositions (-5 to +5) to morph values (0 to 100)
/// i = body index, j = axis index
function morphTrigger(i, j) {
  let dragPositionClipped = (dragPositions[i][j] + 5) * 10;
  if (dragPositionClipped < 0)  {
    dragPositionClipped = 0;
  } else if (dragPositionClipped > 100) {
    dragPositionClipped = 100;
  }
  dragPositionClipped = Math.round(dragPositionClipped);
  if (i == 0)  {
    console.log(`dragPosition: ${i} ${j} ${dragPositionClipped}`);
  }

  return dragPositionClipped;
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
  let instruments = [];

  instruments[0] = new Instrument(rateTrigger, meterTrigger, morphTrigger, 0);
  instruments[1] = new Instrument(rateTrigger, meterTrigger, morphTrigger, 1);
  instruments[2] = new Instrument(rateTrigger, meterTrigger, morphTrigger, 2);

  $("#start").click(function (){
    if ($("#rate").val()) {
      for (let instrument of instruments){
        instrument.start()
    }
    return false;
    }
  });
  $("#stop").click(function (){
    for (let instrument of instruments){
      instrument.stop()
    }
    return false;
  });
 

})

export {browserFormat};
