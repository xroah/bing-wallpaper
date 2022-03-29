import {defineEl} from "../../utils"
import {Card} from "../card"
import {Pagination} from "../pagination"
import template from "./index.html"

class Main extends HTMLElement {
    private _listEl: HTMLElement
    private _pageEl: Pagination

    constructor() {
        super()

        const shadow = this.attachShadow({mode: "open"})
        shadow.innerHTML = template
        this._listEl = shadow.querySelector(".image-list")!
        this._pageEl = shadow.querySelector(".pagination")!
    }

    connectedCallback() {
        console.log(this._listEl)
        this.fetchImages()
    }

    fetchImages() {
        fetch("/api/images")
            .then(res => {
                return res.json()
            })
            .then(json => {
                const {list, total} = json.data
                const frag = document.createDocumentFragment()

                list.forEach((item: any) => {
                    const card = <Card>document.createElement("card-comp")

                    card.highResolutionSrc = item.imagePath
                    card.img = item.thumbnailPath
                    card.date = item.date
                    card.headline = item.headline
                    card.info = item.title

                    card.classList.add("img-card")
                    frag.append(card)
                })

                this._listEl.append(frag)
                this._pageEl.total = total
                console.log(total)
            })
    }
}

defineEl("home-comp", Main)