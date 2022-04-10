import {Metronome} from "./click.js";

function browserFormat () {
  // if (navigator.userAgent.safari) {
    return ".mp3";
  // } else {
  //   return ".ogg";
  // };
};



$(document).ready(function () {
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
  metronomes[0] = new Metronome(rateTrigger, meterTrigger, 0);
  metronomes[1] = new Metronome(rateTrigger, meterTrigger, 1);
  metronomes[2] = new Metronome(rateTrigger, meterTrigger, 2);
  // metronomes[3] = new Metronome(rateTrigger, meterTrigger, 3);

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
;})

export {browserFormat};
