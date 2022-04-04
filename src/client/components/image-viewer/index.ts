import {defineEl, executeAfterTransition, TIMEOUT} from "../../utils"
import template from "./index.html"

export class ImageViewer extends HTMLElement {
    private _images: string[] = []
    private _src: string = ""
    private _prevImgEl: HTMLImageElement
    private _nextImgEl: HTMLImageElement
    private _currentImgEl: HTMLImageElement
    private _closeEl: HTMLElement
    private _index = -1

    constructor() {
        super()

        const shadow = this.attachShadow({mode: "open"})
        shadow.innerHTML = template
        this._prevImgEl = shadow.querySelector(".prev img")!
        this._nextImgEl = shadow.querySelector(".next img")!
        this._currentImgEl = shadow.querySelector(".current img")!
        this._closeEl = shadow.querySelector(".close")!
    }

    connectedCallback() {
        this._closeEl.addEventListener("click", this.close)
    }

    disconnectedCallback() {
        this._closeEl.addEventListener("click", this.close)
    }

    private getIndex() {
        const {_images, _src} = this
        let index = 0

        for (let i = 0, l = _images.length; i < l; i++) {
            if (_images[i] === _src) {
                index = i

                break
            }
        }

        return index
    }

    private update() {
        const {_index, _images} = this
        const l = _images.length

        if (_index > 0) {
            this._prevImgEl.src = _images[_index - 1]!
        } else if (_index < l - 1) {
            this._nextImgEl.src = _images[l - 1]!
        }

        this._currentImgEl.src = this._src
    }

    set src(v: string) {
        if (v === this._src) {
            return
        }

        this._src = v
        this._index = this.getIndex()

        this.update()
    }

    set images(v: string[]) {
        if (this._images = v) {
            return
        }

        this._images = v
        this._index = this.getIndex()

        this.update()
    }

    show() {
        this.offsetHeight
        
        this.classList.add("show")
        executeAfterTransition(
            this,
            TIMEOUT,
            () => this.dispatchEvent(new CustomEvent("shown"))
        )
    }

    hide() {
        this.classList.remove("show")

        executeAfterTransition(
            this,
            TIMEOUT,
            () => this.dispatchEvent(new CustomEvent("hidden"))
        )
    }

    close = () => {
        this.dispatchEvent(new CustomEvent("close"))
    }
}

let viewer: ImageViewer | null = null

export function viewImage(
    src: string,
    images: string[],
    x: number,
    y: number
) {
    if (viewer) {
        return
    }
    
    viewer = new ImageViewer()
    viewer.src = src
    viewer.images = images
    viewer.style.transformOrigin = `${x}px ${y}px`

    document.body.append(viewer)
    viewer.show()
    viewer.addEventListener(
        "close",
        removeViewer,
        {once: true}
    )
}

export function removeViewer() {
    if (!viewer) {
        return
    }

    viewer.hide()
    viewer.addEventListener(
        "hidden",
        () => {
            viewer?.remove()

            viewer = null
        },
        {once: true}
    )
}

defineEl("image-viewer", ImageViewer)