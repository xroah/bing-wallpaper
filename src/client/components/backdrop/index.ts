import {defineEl} from "../../utils"
import template from "./index.html"

export class Backdrop extends HTMLElement {
    private _el: HTMLElement

    constructor() {
        super()

        const shadow = this.attachShadow({mode: "open"})
        shadow.innerHTML = template
        this._el = this.shadowRoot!.querySelector(".backdrop")!
    }

    show() {
        const {_el: el} = this

        el.offsetHeight
        el.classList.add("show")
    }
    
    hide() {
        this._el.classList.remove("show")
    }
}

defineEl("backdrop-comp", Backdrop)