import {defineEl} from "../../utils"
import template from "./index.html"

export class Button extends HTMLElement {
    constructor() {
        super()

        const shadow = this.attachShadow({mode: "open"})
        shadow.innerHTML = template
    }

    connectedCallback() {
        const btn = this.shadowRoot!.querySelector(".btn")!
        const size = this.getAttribute("size")
        
        if (size) {
            btn.classList.add(`btn-${size}`)
        }
    }
}

defineEl("btn-comp", Button)