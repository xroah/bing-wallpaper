import {defineEl, executeAfterTransition, TIMEOUT} from "../../utils"
import {ImageItem} from "../image-item"
import template from "./index.html"

export class ImageViewer extends HTMLElement {
    private _images: string[] = []
    private _src: string = ""
    private _el: HTMLElement
    private _nextEl: HTMLButtonElement
    private _prevEl: HTMLButtonElement
    private _bodyEl: HTMLElement
    private _index = -1

    static viewer: ImageViewer

    constructor() {
        super()

        const shadow = this.attachShadow({mode: "open"})
        shadow.innerHTML = template
        this._el = shadow.querySelector(".wrapper")!
        this._nextEl = shadow.querySelector(".next")!
        this._prevEl = shadow.querySelector(".prev")!
        this._bodyEl = shadow.querySelector(".body")!
    }

    private handleClick = (evt: MouseEvent) => {
        const t = evt.target as HTMLElement

        switch (t.localName) {
            // close
            case "x-icon":
                this.close()
                break
            // download
            case "download-icon":
                this.download()
                break
            case "chevron-right-icon":
                this.next()
                break
            case "chevron-left-icon":
                this.prev()
                break
            default:
            // do nothing
        }
    }

    private close() {
        this.dispatchEvent(new CustomEvent("close"))
        // this._bodyEl.style.overflow = "hidden"
    }

    private download() {
        const name = this._src.split("/").pop()
        const a = document.createElement("a")
        a.href = this._src
        a.download = <string>name

        a.click()
    }

    private next() {
        if (this._index < this._images.length - 1) {
            this.to(this._index + 1)
        }
    }

    private prev() {
        if (this._index > 0) {
            this.to(this._index - 1)
        }
    }

    private to(index: number) {
        this.update(index)
    }

    connectedCallback() {
        this._el.addEventListener("click", this.handleClick)
    }

    disconnectedCallback() {
        this._el.addEventListener("click", this.handleClick)
    }

    private update(newIndex?: number) {
        const {
            _images,
            _src,
            shadowRoot,
            _bodyEl,
            _prevEl,
            _nextEl
        } = this
        const indexEl = <HTMLElement>shadowRoot!.querySelector(".index")
        const l = _images.length
        let index = 0

        if (newIndex === undefined) {
            for (let i = 0; i < l; i++) {
                if (_images[i] === _src) {
                    index = i

                    break
                }
            }
        } else {
            index = newIndex
        }

        if (index === this._index) {
            return
        }

        const nextImg = <ImageItem>_bodyEl.children[index]
        const active = _bodyEl.querySelector(".active")
        this._index = index
        _prevEl.disabled = index === 0
        _nextEl.disabled = index === l - 1
        indexEl.innerHTML = `${index + 1}/${l}`
        _bodyEl.style.transform = `translateX(${-index * 100}%)`

        if (active) {
            active.classList.remove("active")
        }

        nextImg.classList.add("active")
        nextImg.loadImg()
    }

    set src(v: string) {
        if (v === this._src) {
            return
        }

        this._src = v
    }

    set images(v: string[]) {
        const {_images, _bodyEl} = this

        if (_images === v && _images.length === v.length) {
            return
        }

        const frag = document.createDocumentFragment()
        this._images = v

        v.forEach(item => {
            const imageItem = new ImageItem()
            imageItem.src = item
        
            frag.append(imageItem)
        })
        
        _bodyEl.append(frag)
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
}

let viewer: ImageViewer | null = null

function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth    
}

export function viewImage(
    src: string,
    images: string[],
    x: number,
    y: number
) {
    if (viewer) {
        return
    }

    const {body} = document
    viewer = new ImageViewer()
    viewer.src = src
    viewer.images = images
    viewer.style.transformOrigin = `${x}px ${y}px`
    const sw = getScrollbarWidth()

    if (sw > 0) {
        body.style.paddingRight = `${sw}px`
        body.style.overflow = "hidden"
    }

    body.append(viewer)
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

            document.body.style.overflow = ""
            document.body.style.paddingRight = ""
            viewer = null
        },
        {once: true}
    )
}

defineEl("image-viewer", ImageViewer)