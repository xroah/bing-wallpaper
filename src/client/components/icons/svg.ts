import {defineEl} from "../../utils"

export default class SVG extends HTMLElement {
    svg: SVGElement

    constructor() {
        super()

        const shadow = this.attachShadow({mode: "open"})
        shadow.innerHTML = `
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                fill="none" 
                strokeWidth="2" 
                strokeLinecap="round"
                strokeLinejoin="round">
            </svg>
        `
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