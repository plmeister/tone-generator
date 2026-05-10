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

  const links = {
    freq: document.getElementById("linkFreq"),
    vol: document.getElementById("linkVol"),
    rate: document.getElementById("linkRate"),
    depth: document.getElementById("linkDepth"),
  };

  const powerBtn = document.getElementById("power");
  const saveBtn = document.getElementById("saveBtn");
  const loadBtn = document.getElementById("loadBtn");
  const deleteBtn = document.getElementById("deleteBtn");
  const presetList = document.getElementById("presetList");
  const presetNameInput = document.getElementById("presetName");

  let isSyncing = false;

  function syncIfLocked(channel, param, value) {
    if (!links[param].getValue() || isSyncing) return;
    isSyncing = true;
    channel[param].setValue(value);
    isSyncing = false;
  }

  const freqHandlers = bindLink(
    "freq",
    L.freq,
    R.freq,
    (value) => audio.setFreq("L", value),
    (value) => audio.setFreq("R", value),
  );
  const volHandlers = bindLink(
    "vol",
    L.vol,
    R.vol,
    (value) => audio.setVolume("L", value),
    (value) => audio.setVolume("R", value),
  );
  const rateHandlers = bindLink(
    "rate",
    L.rate,
    R.rate,
    (value) => audio.setLfoRate("L", value),
    (value) => audio.setLfoRate("R", value),
  );
  const depthHandlers = bindLink(
    "depth",
    L.depth,
    R.depth,
    (value) => audio.setLfoDepth("L", value),
    (value) => audio.setLfoDepth("R", value),
  );

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
    L.freq.addEventListener("change", (e) =>
      freqHandlers.syncFromLeft(e.detail),
    );
    R.freq.addEventListener("change", (e) =>
      freqHandlers.syncFromRight(e.detail),
    );

    L.vol.addEventListener("change", (e) => volHandlers.syncFromLeft(e.detail));
    R.vol.addEventListener("change", (e) =>
      volHandlers.syncFromRight(e.detail),
    );

    L.rate.addEventListener("change", (e) =>
      rateHandlers.syncFromLeft(e.detail),
    );
    R.rate.addEventListener("change", (e) =>
      rateHandlers.syncFromRight(e.detail),
    );

    L.depth.addEventListener("change", (e) =>
      depthHandlers.syncFromLeft(e.detail),
    );
    R.depth.addEventListener("change", (e) =>
      depthHandlers.syncFromRight(e.detail),
    );

    refreshPresetList();

    saveBtn.addEventListener("click", () => {
      const name = presetNameInput.value.trim();
      if (!name) {
        alert("Enter a preset name");
        return;
      }

      savePreset(name, getPreset());
      refreshPresetList();
      presetList.value = name;
    });

    loadBtn.addEventListener("click", () => {
      const name = presetList.value;
      if (!name) return;
      const preset = loadPreset(name);
      if (preset) {
        applyPreset(preset);
        presetNameInput.value = name;
      }
    });

    deleteBtn.addEventListener("click", () => {
      const name = presetList.value;
      if (!name) return;
      const ok = confirm(`Delete preset "${name}"?`);
      if (!ok) return;
      deletePreset(name);
      refreshPresetList();
      const remaining = presetList.options[0];
      if (remaining) {
        presetList.value = remaining.value;
      } else {
        presetList.innerHTML = "";
      }
    });
  }

  function refreshPresetList() {
    const presets = JSON.parse(localStorage.getItem("tone-presets") || "{}");

    presetList.innerHTML = "";
    Object.keys(presets).forEach((name) => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      presetList.appendChild(opt);
    });
  }

  function getPreset() {
    return {
      freq: {
        L: L.freq.getValue(),
        R: R.freq.getValue(),
      },
      vol: {
        L: L.vol.getValue(),
        R: R.vol.getValue(),
      },
      rate: {
        L: L.rate.getValue(),
        R: R.rate.getValue(),
      },
      depth: {
        L: L.depth.getValue(),
        R: R.depth.getValue(),
      },
    };
  }

  function applyPreset(preset) {
    L.freq.setValue(preset.freq.L);
    R.freq.setValue(preset.freq.R);

    L.vol.setValue(preset.vol.L);
    R.vol.setValue(preset.vol.R);

    L.rate.setValue(preset.rate.L);
    R.rate.setValue(preset.rate.R);

    L.depth.setValue(preset.depth.L);
    R.depth.setValue(preset.depth.R);

    // Audio state
    audio.setFreq("L", preset.freq.L);
    audio.setFreq("R", preset.freq.R);

    audio.setVolume("L", preset.vol.L);
    audio.setVolume("R", preset.vol.R);

    audio.setLfoRate("L", preset.rate.L);
    audio.setLfoRate("R", preset.rate.R);

    audio.setLfoDepth("L", preset.depth.L);
    audio.setLfoDepth("R", preset.depth.R);
  }

  function savePreset(name) {
    const presets = JSON.parse(localStorage.getItem("tone-presets") || "{}");
    presets[name] = getPreset();
    localStorage.setItem("tone-presets", JSON.stringify(presets));
  }

  function loadPreset(name) {
    const presets = JSON.parse(localStorage.getItem("tone-presets") || "{}");
    return presets[name];
  }

  function deletePreset(name) {
    const presets = JSON.parse(localStorage.getItem("tone-presets") || "{}");
    if (!presets[name]) return;
    delete presets[name];
    localStorage.setItem("tone-presets", JSON.stringify(presets));
  }

  function bindLink(rowKey, Lctrl, Rctrl, audioSetterL, audioSetterR) {
    function syncFromLeft(value) {
      audioSetterL(value);
      if (!links[rowKey].getValue()) return;
      Rctrl.setValue(value);
      audioSetterR(value);
    }

    function syncFromRight(value) {
      audioSetterR(value);
      if (!links[rowKey].getValue()) return;
      Lctrl.setValue(value);
      audioSetterL(value);
    }

    return { syncFromLeft, syncFromRight };
  }

  return {
    init,
    getPreset,
    applyPreset,
    savePreset,
    loadPreset,
    deletePreset,
  };
}
