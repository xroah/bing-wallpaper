import {defineEl} from "../../utils"
import template from "./index.html"

export class ImageItem extends HTMLElement {
    private _img: HTMLImageElement
    private _loading: HTMLElement
    private _error: SVGElement
    private _loaded = false
    private _src = ""

    constructor() {
        super()

        const shadow = this.attachShadow({mode: "open"})
        shadow.innerHTML = template
        this._img = shadow.querySelector("img")!
        this._loading = shadow.querySelector("loading-comp")!
        this._error = shadow.querySelector(".error")!
    }

    set src(v: string) {
        this._src = v
    }

    connectedCallback() {
        const src = this.getAttribute("src")

        if (src) {
            this.src = src
        }

        if (this.hasAttribute("load")) {
            this.loadImg()
        }
    }

    setLoadingVisible(v: boolean) {
        this._loading.style.display = v ? "block" : "none"
    }

    loadImg() {
        this._error.style.display = "none"
        this._img.style.display = ""

        if (this._loaded) {
            return
        }

        this._img.src = this._src

        this._img.onload = () => {
            this._loaded = true
            
            this._img.classList.remove("not-loaded")
            this.setLoadingVisible(false)
        }
        this._img.onerror = () => {
            this._img.style.display = "none"
            this._error.style.display = "inline-block"

            this.setLoadingVisible(false)
            window.message.error("图片加载失败!")
        }

        this.setLoadingVisible(true)
    }
}

defineEl("image-item", ImageItem)