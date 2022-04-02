import {get} from "../../request"
import {defineEl} from "../../utils"
import {Card} from "../card"
import {Pagination, PAGE_CHANGE_EVENT} from "../pagination"
import template from "./index.html"

class Main extends HTMLElement {
    private _listEl: HTMLElement
    private _pageEl: Pagination
    private _page = 1

    constructor() {
        super()

        const shadow = this.attachShadow({mode: "open"})
        shadow.innerHTML = template
        this._listEl = shadow.querySelector(".image-list")!
        this._pageEl = shadow.querySelector(".pagination")!
    }

    connectedCallback() {
        const {hash} = location
        const [key, val] = hash.substring(1).split("=")

        if (key === "page") {
            this._page = Number.parseInt(val || "1") || 1
            this._pageEl.current = this._page
        }

        this.fetchImages(this._page)
        this._pageEl.addEventListener(
            PAGE_CHANGE_EVENT,
            this.handlePageChange as any
        )
    }

    disconnectedCallback() {
        this._pageEl.removeEventListener(
            PAGE_CHANGE_EVENT,
            this.handlePageChange as any
        )
    }

    handlePageChange = (evt: CustomEvent) => {
        const {page} = evt.detail
        
        this._page = page
        location.hash = `page=${page}`

        this.fetchImages()
    }

    fetchImages(page?: number) {
        window.loading.show()

        get(`/api/images?page=${this._page}`)
            .then((data: any) => {
                const {list, total} = data
                const  {_listEl, _pageEl} = this
                const frag = document.createDocumentFragment()
                _listEl.textContent = ""

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

                _listEl.append(frag)
                _pageEl.total = total
                
                if (page) {
                    _pageEl.current = page
                }
            })
            .finally(window.loading.hide)
    }
}

defineEl("home-comp", Main)