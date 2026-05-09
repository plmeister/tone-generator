import './dial-component.js';
import { createAudioEngine } from './audio.js';
import { bindUI } from './ui.js';

const audio = createAudioEngine();
const ui = bindUI(audio);

ui.init();
