import { Instrument } from "./click.js";
import { dragPositions } from "./mousepick.js";
import { startImpulse, stopReset } from "./mousepick.js";

/// maps dragPositions (-5 to +5) to morph values (0 to 100)
/// i = body index, j = axis index
let dragPositionClipped;
function morphTrigger(i, j) {
  dragPositionClipped = (dragPositions[i][j] + 5) * 10;
  if (dragPositionClipped < 40) {
    dragPositionClipped = 0;
  } else if (dragPositionClipped > 60) {
    dragPositionClipped = 100;
  }
  dragPositionClipped = Math.round(dragPositionClipped);
  return dragPositionClipped;
}

$(document).ready(function () {
  document.getElementById("webgl").addEventListener(
    "touchmove",
    function (e) {
      e.stopPropagation();
    },
    { passive: false }
  );

  const context = new AudioContext();
  window.addEventListener(
    "touchstart",
    function () {
      var buffer = context.createBuffer(1, 1, 22050);
      var source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.start(0);
    },
    false
  );
  var rateTrigger = $("#rate");
  var meterTrigger = $("#meter");
  let instruments = [];

  instruments[0] = new Instrument(rateTrigger, meterTrigger, morphTrigger, 0);
  instruments[1] = new Instrument(rateTrigger, meterTrigger, morphTrigger, 1);
  instruments[2] = new Instrument(rateTrigger, meterTrigger, morphTrigger, 2);

  $("#start").click(function () {
    if ($("#rate").val()) {
      instruments.forEach(function (instrument) {
        instrument.start();
      });
    }
    startImpulse();
    return false;
  });

  $("#stop").click(function () {
    instruments.forEach(function (instrument) {
      instrument.stop();
    });
    stopReset();
    return false;
  });
});
