import {defineEl} from "../../utils"
import template from "./index.html"

export class Backdrop extends HTMLElement {
    public el: HTMLElement

    constructor() {
        super()

        const shadow = this.attachShadow({mode: "open"})
        shadow.innerHTML = template
        this.el = this.shadowRoot!.querySelector(".backdrop")!
    }

    connectedCallback() { }

    show() {
        const {el} = this

        el.offsetHeight
        el.classList.add("show")
    }
    
    hide() {
        this.el.classList.remove("show")
    }
}

defineEl("backdrop-comp", Backdrop)