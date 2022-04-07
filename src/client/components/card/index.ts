import {defineEl, downloadImage} from "../../utils"
import {ImageItem} from "../image-item"
import template from "./index.html"

export class Card extends HTMLElement {
    private _headline: HTMLElement
    private _date: HTMLElement
    private _info: HTMLElement
    private _download: HTMLAnchorElement
    private _highResolutionSrc: string = ""
    private _imgItem: ImageItem

    constructor() {
        super()

        const shadow = this.attachShadow({mode: "open"})
        shadow.innerHTML = template
        this._headline = shadow.querySelector(".headline")!
        this._date = shadow.querySelector(".date")!
        this._info = shadow.querySelector(".info")!
        this._download = shadow.querySelector(".download-img")!
        this._imgItem = shadow.querySelector("image-item")!
    }

    connectedCallback() {
        this._download.addEventListener("click", this.handleDownload)
    }

    disconnectedCallback() {
        this._download.removeEventListener("click", this.handleDownload)
    }

    handleDownload = (evt: MouseEvent) => {
        evt.preventDefault()
        evt.stopPropagation()
        downloadImage(this.highResolutionSrc)
    }

    set img(v: string) {
        this._imgItem.src = v
    }

    set headline(v: string) {
        this._headline.innerHTML = this._headline.title = v
    }

    set date(v: string) {
        this._date.innerHTML = v
    }

    set info(v: string) {
        this._info.innerHTML = this._info.title = v
    }

    set highResolutionSrc(v: string) {
        this._highResolutionSrc = v
    }

    get highResolutionSrc() {
        return this._highResolutionSrc
    }
}

defineEl("card-comp", Card)