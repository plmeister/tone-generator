export function bindUI(audio) {

  const L = {
    freq: document.getElementById("freqL"),
    vol: document.getElementById("volL"),
    rate: document.getElementById("rateL"),
    depth: document.getElementById("depthL"),
  };

  const R = {
    freq: document.getElementById("freqR"),
    vol: document.getElementById("volR"),
    rate: document.getElementById("rateR"),
    depth: document.getElementById("depthR"),
  };


  const powerBtn = document.getElementById("power");

  const lockAll = document.getElementById("lockAll");
  let isSyncing = false;

  function syncIfLocked(channel, param, value) {
    if (!lockAll.checked || isSyncing) return;
    isSyncing = true;
    channel[param].setValue(value);
    isSyncing = false;
  }

  powerBtn.addEventListener("click", async () => {
    const isRunning = await audio.toggle();
    if (isRunning) {
      // 🔥 force sync ALL dial values into audio once
      audio.setFreq("L", L.freq.getValue());
      audio.setFreq("R", R.freq.getValue());

      audio.setVolume("L", L.vol.getValue());
      audio.setVolume("R", R.vol.getValue());

      audio.setLfoRate("L", L.rate.getValue());
      audio.setLfoRate("R", R.rate.getValue());

      audio.setLfoDepth("L", L.depth.getValue());
      audio.setLfoDepth("R", R.depth.getValue());
    }
    powerBtn.textContent = isRunning ? "Stop" : "Start";
    powerBtn.classList.toggle("active", isRunning);
  });

  function init() {



    L.freq.addEventListener("change", e => {
      audio.setFreq("L", e.detail);
      syncIfLocked(R, "freq", e.detail);
    });

    R.freq.addEventListener("change", e => {
      audio.setFreq("R", e.detail);
      syncIfLocked(L, "freq", e.detail);
    });

    L.vol.addEventListener("change", e => {
      audio.setVolume("L", e.detail);
      syncIfLocked(R, "vol", e.detail);
    });

    R.vol.addEventListener("change", e => {
      audio.setVolume("R", e.detail)
      syncIfLocked(L, "vol", e.detail);
    });

    L.rate.addEventListener("change", e => {
      audio.setLfoRate("L", e.detail);
      syncIfLocked(R, "rate", e.detail);
    });
    R.rate.addEventListener("change", e => {
      audio.setLfoRate("R", e.detail);
      syncIfLocked(L, "rate", e.detail);
    });

    L.depth.addEventListener("change", e => {
      audio.setLfoDepth("L", e.detail);
      syncIfLocked(R, "depth", e.detail);
    });
    R.depth.addEventListener("change", e => {
      audio.setLfoDepth("R", e.detail)
      syncIfLocked(L, "depth", e.detail);
    });
  }

  return { init };
}
