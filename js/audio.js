export function createAudioEngine() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();


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
  }

  async function stop() {
    await ctx.suspend();
    running = false;
  }

  async function toggle() {
    if (!running) {

      await start();
    } else {
      await ctx.suspend();
      running = false;
    }
    return running;
  }

  function makeChannel() {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    osc.type = "sine";
    lfo.type = "sine";

    osc.connect(gain);
    gain.connect(ctx.destination);

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
      startLfo
    };
  }

  const L = makeChannel();
  const R = makeChannel();

  function setFreq(channel, v) {
    const target = channel === "L" ? L : R;
    target.osc.frequency.setTargetAtTime(v, ctx.currentTime, 0.01);
  }

  function setVolume(channel, v) {
    const target = channel === "L" ? L : R;
    target.gain.gain.setTargetAtTime(v, ctx.currentTime, 0.02);
  }

  function setLfoRate(channel, v) {
    const target = channel === "L" ? L : R;
    target.lfo.frequency.setTargetAtTime(v, ctx.currentTime, 0.05);
  }

  function setLfoDepth(channel, v) {
    const target = channel === "L" ? L : R;
    target.lfoGain.gain.setTargetAtTime(v, ctx.currentTime, 0.05);
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
    setLfoDepth
  };
}
