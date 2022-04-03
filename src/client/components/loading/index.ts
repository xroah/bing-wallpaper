import {defineEl} from "../../utils"
import template from "./index.html"

export class Loading extends HTMLElement {
    constructor() {
        super()

        const shadow = this.attachShadow({mode: "open"})
        shadow.innerHTML = template
    }
}

let current: HTMLElement | null = null

const loading = {
    show() {
        if (current) {
            return
        }

        current = new Loading()
        document.body.append(current)
    },
    hide() {
        if (!current) {
            return
        }

        current.remove()

        current = null
    }
}

defineEl("loading-comp", Loading)

window.loading = loading