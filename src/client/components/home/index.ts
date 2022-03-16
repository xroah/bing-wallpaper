import {defineEl} from "../../utils"
import template from "./index.html"

class Main extends HTMLElement {
    constructor() {
        super()

        const shadow = this.attachShadow({mode: "open"})
        shadow.innerHTML = template
    }
}

defineEl("main-comp", Main)