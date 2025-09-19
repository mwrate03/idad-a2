document.addEventListener("DOMContentLoaded", () => {
  // elements from the HTML
  const overlay = document.getElementById("start-overlay"); // the "click to start" screen
  const potions = document.querySelectorAll(".potion"); // all potion bottles
  const cauldron = document.getElementById("cauldron"); // the cauldron in the middle

  // Tone.js Synths
  const synths = {
    bass: new Tone.MembraneSynth().toDestination(),
    pad: new Tone.PolySynth(Tone.Synth).toDestination(),
    pluck: new Tone.PluckSynth().toDestination(),
    bell: new Tone.MetalSynth().toDestination(),
  };

  // default melody setup 
  // will play these notes in order (default melody)
  let melody = ["C4", "Eb4", "F4", "G4"];

  // keep track of which synths are active (chosen by dropping potions)
  let activeSynths = [];

  // a loop that plays the melody (will start when cauldron is clicked)
  let melodyLoop = null;

  // enabling audio 
  // browsers need a click to allow sound to be played
  overlay.addEventListener("click", async () => {
    await Tone.start(); // start Tone.js
    overlay.style.display = "none"; // hide overlay
  });

  // --- drag potions onto the cauldron function ---
  potions.forEach((potion) => {
    // when dragging starts, remember which potion type it is
    potion.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", potion.dataset.sound);
    });
  });

  // allow potions to be dropped onto cauldron
  cauldron.addEventListener("dragover", (event) => event.preventDefault());

  cauldron.addEventListener("drop", (event) => {
    event.preventDefault();
    const potionType = event.dataTransfer.getData("text/plain");
    addPotion(potionType);
  });

  // clicking the cauldron to play / stop melody
  cauldron.addEventListener("click", () => {
    if (melodyLoop) {
      // if it’s already playing, stop everything
      melodyLoop.stop();
      Tone.Transport.stop();
      melodyLoop = null;
    } else {
      // otherwise start playing melody
      playMelody();
    }
  });

  // --- Add potion effect ---
  function addPotion(type) {
    if (type === "random") {
      // this potion randomises the melody
      melody = generateRandomMelody();
    } else if (type === "reset") {
      // this potion resets everything
      resetCauldron();
    } else {
      // otherwise, add the synth sound if not added yet
      if (!activeSynths.includes(type)) {
        activeSynths.push(type);
      }
    }
  }

  // --- play the melody ---
  function playMelody() {
    let index = 0; // which note to play first

    // loop plays notes one by one every quarter note ("4n")
    melodyLoop = new Tone.Loop((time) => {
      const note = melody[index % melody.length]; // pick note in sequence

      // play that note on every active synth
      activeSynths.forEach((type) => {
        const synth = synths[type];
        if (synth) {
          synth.triggerAttackRelease(note, "8n", time);
        }
      });

      index++; // move to next note
    }, "4n");

    // start the loop and the transport for sound
    melodyLoop.start(0);
    Tone.Transport.start();
  }

  // random melody generator
  function generateRandomMelody() {
    const newMelody = [];
    const octaves = [3, 4, 5]; // low, middle, high range
    const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    // pick 8 random notes
    for (let i = 0; i < 5; i++) {
      const note = noteNames[Math.floor(Math.random() * noteNames.length)];
      const octave = octaves[Math.floor(Math.random() * octaves.length)];
      newMelody.push(note + octave); // combine e.g. "C" + 4 → "C4"
    }

    return newMelody;
  }

  // reset cauldron function
  function resetCauldron() {
    // stop melody if it’s playing
    if (melodyLoop) {
      melodyLoop.stop();
      Tone.Transport.stop();
      melodyLoop = null;
    }

    // clear everything back to default
    activeSynths = [];
    melody = ["C4", "Eb4", "F4", "G4"];
  }
});
