import {defineEl} from "../../utils"
import template from "./index.html"

export class ImageItem extends HTMLElement {
    private _img: HTMLImageElement
    private _loading: HTMLElement
    private _loaded = false
    private _src = ""

    constructor() {
        super()

        const shadow = this.attachShadow({mode: "open"})
        shadow.innerHTML = template
        this._img = shadow.querySelector("img")!
        this._loading = shadow.querySelector("loading-comp")!
    }

    set src(v: string) {
        this._src = v
    }

    loadImg() {
        if (this._loaded) {
            return
        }

        this._img.src = this._src
        this._loading.style.display = "flex"

        this._img.onload = () => {
            this._loading.style.display = "none"
            this._loaded = true
            
            this._img.classList.remove("not-loaded")
        }
    }
}

defineEl("image-item", ImageItem)