import template from "./svg.html"
import {defineEl} from "../../utils"

export default class SVG extends HTMLElement {
    svg: SVGElement

    constructor() {
        super()

        const shadow = this.attachShadow({mode: "open"})
        shadow.innerHTML = template
        this.svg = shadow.querySelector("svg")!
    }

    connectedCallback() {
        const size = this.getAttribute("size") || "24"

        this.svg.setAttribute("width", size)
        this.svg.setAttribute("height", size)
    }
}

export function createIcon(name: string, shape: string) {
    defineEl(
        name,
        class extends SVG {
            constructor() {
                super()

                this.svg.innerHTML = shape
            }
        }
    )
}