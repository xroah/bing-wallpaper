import {defineEl} from "../../utils"
import template from "./index.html"

export class Card extends HTMLElement {
    private _img: HTMLImageElement
    private _headline: HTMLElement
    private _date: HTMLElement
    private _info: HTMLElement
    private _download: HTMLAnchorElement
    private _highResolutionSrc: string = ""

    constructor() {
        super()

        const shadow = this.attachShadow({mode: "open"})
        shadow.innerHTML = template
        this._img = shadow.querySelector("img")!
        this._headline = shadow.querySelector(".headline")!
        this._date = shadow.querySelector(".date")!
        this._info = shadow.querySelector(".info")!
        this._download = shadow.querySelector(".download-img")!
    }

    connectedCallback() {
        this._download.addEventListener("click", this.handleDownload)
    }

    disconnectedCallback() {
        this._download.removeEventListener("click", this.handleDownload)
    }

    handleDownload = (evt: MouseEvent) => {
        evt.preventDefault()
        console.log("download")
    }

    set img(v: string) {
        this._img.src = v
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

    get hightResolutionSrc() {
        return this._highResolutionSrc
    }
}

defineEl("card-comp", Card)