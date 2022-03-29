import {defineEl} from "../../utils"
import template from "./index.html"

class Backdrop extends HTMLElement {
    constructor() {
        super()

        const shadow = this.attachShadow({mode: "open"})
        shadow.innerHTML = template
    }
    
    connectedCallback() {
        const el = <HTMLElement>this.shadowRoot!.querySelector(".backdrop")!;
        
        el.offsetHeight
        el.classList.add("show")
    }
}

defineEl("backdrop-comp", Backdrop)