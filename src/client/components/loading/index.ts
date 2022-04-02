import {defineEl} from "../../utils"
import template from "./index.html"

defineEl(
    "loading-comp",
    class extends HTMLElement {
        constructor() {
            super()

            const shadow = this.attachShadow({mode: "open"})
            shadow.innerHTML = template
        }
    }
)

let current: HTMLElement | null = null

const loading = {
    show() {
        if (current) {
            return
        }

        current = document.createElement("loading-comp")

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

window.loading = loading