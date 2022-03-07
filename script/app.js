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
    source.noteOn(0);

  }, false);
  var rate, metronome;
  var rateTrigger = $("#rate");
  var meterTrigger = $("#meter");
  console.log(rateTrigger, meterTrigger);
  metronome = new Metronome(rateTrigger, meterTrigger, 0);
  metronome2 = new Metronome(rateTrigger, meterTrigger, 1);
  metronome3 = new Metronome(rateTrigger, meterTrigger, 2);

  $("#start").click(function (){
    if ($("#rate").val()) {
      metronome.start();
      metronome2.start();
      metronome3.start();
      return false;
    }
  });
  $("#stop").click(function (){
    metronome.stop();
    metronome2.stop();
    metronome3.stop();
    return false;
  });
;})
