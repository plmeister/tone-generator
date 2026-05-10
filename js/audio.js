export function createAudioEngine() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0;
  masterGain.connect(ctx.destination);

  let running = false;

  async function start() {
    if (ctx.state !== "running") {
      await ctx.resume();
    }
    running = true;

    // start oscillators only after user gesture
    L.startOscillator();
    R.startOscillator();
    L.startLfo();
    R.startLfo();

    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.setTargetAtTime(1, ctx.currentTime, 0.03);
  }

  async function stop() {
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.03);
    await new Promise((resolve) => setTimeout(resolve, 80));
    await ctx.suspend();
    running = false;
  }

  async function toggle() {
    if (!running) {
      await start();
    } else {
      await stop();
      running = false;
    }
    return running;
  }

  function makeChannel(ctx, panValue) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const panner = ctx.createStereoPanner();

    osc.type = "sine";
    lfo.type = "sine";

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(masterGain);

    panner.pan.value = panValue;

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    let oscStarted = false;
    let lfoStarted = false;

    function startOscillator() {
      if (!oscStarted) {
        osc.start();
        oscStarted = true;
      }
    }
    function startLfo() {
      if (!lfoStarted) {
        lfo.start();
        lfoStarted = true;
      }
    }

    return {
      osc,
      gain,
      lfo,
      lfoGain,
      startOscillator,
      startLfo,
    };
  }

  const L = makeChannel(ctx, -1);
  const R = makeChannel(ctx, +1);

  function setFreq(channel, v) {
    const target = channel === "L" ? L : R;
    const param = target.osc.frequency;
    param.cancelScheduledValues(ctx.currentTime);
    param.setTargetAtTime(v, ctx.currentTime, 0.02);
  }

  function setVolume(channel, v) {
    const target = channel === "L" ? L : R;
    const param = target.gain.gain;
    param.cancelScheduledValues(ctx.currentTime);
    param.setTargetAtTime(v, ctx.currentTime, 0.05);
  }

  function setLfoRate(channel, v) {
    const target = channel === "L" ? L : R;
    const param = target.lfo.frequency;
    param.cancelScheduledValues(ctx.currentTime);
    param.setTargetAtTime(v, ctx.currentTime, 0.05);
  }

  function setLfoDepth(channel, v) {
    const target = channel === "L" ? L : R;
    const param = target.lfoGain.gain;
    param.cancelScheduledValues(ctx.currentTime);
    param.setTargetAtTime(v, ctx.currentTime, 0.05);
  }

  return {
    start,
    stop,
    toggle,
    get running() {
      return running;
    },
    setFreq,
    setVolume,
    setLfoRate,
    setLfoDepth,
  };
}
