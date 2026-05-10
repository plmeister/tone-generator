class ChannelLink extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.value = this.hasAttribute("linked");

    this.shadowRoot.innerHTML = `
      <style>
        .wrap {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          user-select: none;

          border: 1px solid #333;
          transition: all 0.15s ease;
        }

        .on {
          background: #2ecc71;
          box-shadow: 0 0 6px #2ecc71;
        }

        .off {
          background: #5a1e1e;
          opacity: 0.5;
        }
      </style>

      <div class="wrap off"></div>
    `;

    this.el = this.shadowRoot.querySelector(".wrap");

    this.el.addEventListener("click", () => {
      this.setValue(!this.value);
    });
  }

  connectedCallback() {
    this._render();
  }

  setValue(v) {
    this.value = !!v;
    this._render();

    this.dispatchEvent(new CustomEvent("change", {
      detail: this.value
    }));
  }

  getValue() {
    return this.value;
  }

  _render() {
    this.el.className = "wrap " + (this.value ? "on" : "off");
  }
}

customElements.define("channel-link", ChannelLink);
