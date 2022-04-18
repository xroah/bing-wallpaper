import {defineEl} from "../../utils"
import template from "./index.html"

export class Button extends HTMLElement {
    private _size = ""
    private _btn: HTMLButtonElement

    constructor() {
        super()

        const shadow = this.attachShadow({mode: "open"})
        shadow.innerHTML = template
        this._btn = this.shadowRoot!.querySelector(".btn")!
    }

    connectedCallback() {
        this.size = this.getAttribute("size") || ""
    }

    set size(v: string) {
        if (v !== this._size) {
            const prev = `btn-${this._size}`

            if (prev) {
                this._btn.classList.remove(prev)
            }

            this._size = v

            this._btn.classList.add(`btn-${v}`)
        }
    }

    get size() {
        return this._size
    }
}

defineEl("btn-comp", Button)