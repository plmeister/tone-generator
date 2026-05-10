class ToneDial extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.min = 0;
    this.max = 1;
    this.value = 0.5;
    this.log = false;
    this.sensitivity = 1;
    this.formatter = null;

    this._activePointer = null;
    this._startY = 0;
    this._startValue = 0;

    this.shadowRoot.innerHTML = `
      <style>
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          font-family: sans-serif;
          user-select: none;
        }

        .dial {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          border: 2px solid #444;
          background: #151518;

          position: relative;

          touch-action: none;
        }

        /* ONLY THIS ROTATES */
        .knob {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          position: relative;
          transform: rotate(-135deg);
        }

        .indicator {
          position: absolute;
          width: 2px;
          height: 18px;
          background: #ddd;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          border-radius: 1px;
        }

        .value {
          font-size: 11px;
          color: #666;
        }

        .label {
          font-size: 12px;
          color: #aaa;
        }
      </style>

      <div class="container">
        <div class="dial">
          <div class="knob">
            <div class="indicator"></div>
          </div>
        </div>

        <div class="value"></div>
        <div class="label"></div>
      </div>
    `;

    this._dial = this.shadowRoot.querySelector(".dial");
    this._knob = this.shadowRoot.querySelector(".knob");
    this._value = this.shadowRoot.querySelector(".value");
    this._label = this.shadowRoot.querySelector(".label");

    this._onDown = this._onDown.bind(this);
    this._onMove = this._onMove.bind(this);
    this._onUp = this._onUp.bind(this);
  }

  setFormatter(fn) {
    this.formatter = fn;
    this._render();
  }

  connectedCallback() {
    this.min = parseFloat(this.getAttribute("min") ?? 0);
    this.max = parseFloat(this.getAttribute("max") ?? 1);
    this.value = parseFloat(this.getAttribute("value") ?? 0.5);
    this.log = this.hasAttribute("log");
    this.sensitivity = parseFloat(this.getAttribute("sensitivity") ?? 1);

    this._label.textContent = this.getAttribute("label") ?? "";

    this._dial.addEventListener("pointerdown", this._onDown);
    window.addEventListener("pointermove", this._onMove);
    window.addEventListener("pointerup", this._onUp);

    this._value.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("labelclick", {
          detail: this.value,
        }),
      );
    });
    this._render();
  }

  disconnectedCallback() {
    this._dial.removeEventListener("pointerdown", this._onDown);
    window.removeEventListener("pointermove", this._onMove);
    window.removeEventListener("pointerup", this._onUp);
  }

  _clamp(v) {
    return Math.max(this.min, Math.min(this.max, v));
  }

  _toNorm(v) {
    if (!this.log) return (v - this.min) / (this.max - this.min);
    return Math.log(v / this.min) / Math.log(this.max / this.min);
  }

  _fromNorm(t) {
    if (!this.log) return this.min + (this.max - this.min) * t;
    return this.min * Math.pow(this.max / this.min, t);
  }

  _emit(v) {
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: v,
      }),
    );
  }

  _setValue(v, emit = true) {
    this.value = this._clamp(v);
    this._render();

    if (emit) {
      this._emit(this.value);
    }
  }

  _render() {
    const t = this._toNorm(this.value);
    const angle = t * 270 - 135;

    // ONLY rotate knob, not whole component
    this._knob.style.transform = `rotate(${angle}deg)`;

    if (this.formatter) {
      this._value.textContent = this.formatter(this.value);
    } else {
      this._value.textContent = this.value.toFixed(2);
    }
  }

  _onDown(e) {
    this._activePointer = e.pointerId;
    this._dial.setPointerCapture(e.pointerId);

    this._startY = e.clientY;
    this._startValue = this.value;

    e.preventDefault();
  }

  _onMove(e) {
    if (this._activePointer !== e.pointerId) return;

    const deltaY = this._startY - e.clientY;

    const normStart = this._toNorm(this._startValue);
    const normDelta = (deltaY / 200) * this.sensitivity;

    const norm = Math.max(0, Math.min(1, normStart + normDelta));

    this._setValue(this._fromNorm(norm), true);
    e.preventDefault();
  }

  _onUp(e) {
    if (this._activePointer !== e.pointerId) return;

    this._dial.releasePointerCapture(e.pointerId);
    this._activePointer = null;
  }

  setValue(v) {
    this._setValue(v, false);
  }

  getValue() {
    return this.value;
  }
}

customElements.define("tone-dial", ToneDial);
