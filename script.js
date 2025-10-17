document.addEventListener("DOMContentLoaded", () => {
  // Day/Night Background
  const body = document.body;
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 18) {
    body.style.backgroundImage = "url('background-day.png')";
  } else {
    body.style.backgroundImage = "url('background-night.png')";
  }

  body.style.backgroundRepeat = "no-repeat";
  body.style.backgroundPosition = "center center";
  body.style.backgroundSize = "cover";

  // Elements from the HTML
  const overlay = document.getElementById("start-overlay");
  const potions = document.querySelectorAll(".potion");
  const cauldron = document.getElementById("cauldron");
  const playButton = document.getElementById("playPauseBtn");
  const icon = document.getElementById("icon");

  // Tone.js Synths
  const synths = {
    bass: new Tone.MembraneSynth().toDestination(),
    pad: new Tone.PolySynth(Tone.Synth).toDestination(),
    pluck: new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sawtooth", count: 3, spread: 30 },
      // Fat oscillator effect instead of the pluck synth as it was too annoying
    }).toDestination(),
    bell: new Tone.PolySynth(Tone.MetalSynth).toDestination(),
    // Realised for MetalSynth I need to put it within a PolySynth,
    // so that the melody doesn't glitch and play one constant note.
  };

  let melody = ["C4", "Eb4", "F4", "G4"];
  let activeSynths = [];
  let melodyLoop = null;
  let isPlaying = false;

  // Enable Audio
  overlay.addEventListener("click", async () => {
    await Tone.start();
    overlay.style.display = "none";
  });

  // Drag & Drop Potions
  potions.forEach((potion) => {
    potion.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", potion.dataset.sound);
    });
  });

  cauldron.addEventListener("dragover", (event) => event.preventDefault());
  cauldron.addEventListener("drop", (event) => {
    event.preventDefault();
    const potionType = event.dataTransfer.getData("text/plain");
    addPotion(potionType);

    // Find the potion element that matches the dropped one
    const draggedPotion = document.querySelector(
      `[data-sound="${potionType}"]`
    );

    // Add pour animation
    if (draggedPotion) {
      draggedPotion.classList.remove("pouring");

      void draggedPotion.offsetWidth;
      draggedPotion.classList.add("pouring");

      // Remove the class after animation ends
      setTimeout(() => draggedPotion.classList.remove("pouring"), 800);
    }

    //  Cauldron reaction animation
    cauldron.classList.remove("cauldron-react");
    void cauldron.offsetWidth;
    cauldron.classList.add("cauldron-react");
    setTimeout(() => cauldron.classList.remove("cauldron-react"), 1000);

    addPotion(potionType);
  });

  // Play/Pause Button
  playButton.addEventListener("click", () => {
    if (isPlaying) {
      stopMelody();
      icon.src = "play-icon.png";
      isPlaying = false;
    } else {
      playMelody();
      icon.src = "pause-icon.png";
      isPlaying = true;
    }
  });

  // Add Potion Effects to Cauldron
  function addPotion(type) {
    if (type === "random") {
      // Randomly choose notes
      melody = [];
      for (let i = 0; i < 5; i++) {
        melody.push(generateRandomNote());
      }
    } else if (type === "reset") {
      resetCauldron();
    } else {
      if (!activeSynths.includes(type)) activeSynths.push(type);
    }
  }

  // Play Melody
  function playMelody() {
    let index = 0;
    melodyLoop = new Tone.Loop((time) => {
      const note = melody[index % melody.length];
      activeSynths.forEach((type) => {
        const synth = synths[type];
        if (synth) synth.triggerAttackRelease(note, "8n", time);
      });
      index++;
    }, "4n");

    melodyLoop.start(0);
    Tone.Transport.start();
  }

  // Stop melody
  function stopMelody() {
    if (melodyLoop) {
      melodyLoop.stop();
      Tone.Transport.stop();
      melodyLoop = null;
    }
  }

  // Random note generator
  function generateRandomNote() {
    const octaves = [4, 5];
    const notes = [
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
      "A",
      "A#",
      "B",
    ]; // Keeping notes within the chromatic scale
    const note = notes[Math.floor(Math.random() * notes.length)];
    const octave = octaves[Math.floor(Math.random() * octaves.length)];
    return note + octave;
  }

  // Reset Cauldron function
  function resetCauldron() {
    stopMelody();
    activeSynths = [];
    melody = ["C4", "Eb4", "F4", "G4"];
    icon.src = "play-icon.png";
    isPlaying = false;
  }
});
