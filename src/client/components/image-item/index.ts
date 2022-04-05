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

    setLoadingVisible(v: boolean) {
        this._loading.style.display = v ? "block" : "none"
    }

    loadImg() {
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
            this.setLoadingVisible(false)
            window.message.error("图片加载失败!")
        }

        this.setLoadingVisible(true)
    }
}

defineEl("image-item", ImageItem)