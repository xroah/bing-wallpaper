import {get} from "../../request"
import {defineEl} from "../../utils"
import {Card} from "../card"
import {viewImage} from "../image-viewer"
import {Pagination, PAGE_CHANGE_EVENT} from "../pagination"
import template from "./index.html"

class Main extends HTMLElement {
    private _listEl: HTMLElement
    private _pageEl: Pagination
    private _page = 1
    private _images: string[] = []
    private _cancel: (() => void) | null = null

    constructor() {
        super()

        const shadow = this.attachShadow({mode: "open"})
        shadow.innerHTML = template
        this._listEl = shadow.querySelector(".image-list")!
        this._pageEl = shadow.querySelector(".pagination")!
    }

    connectedCallback() {
        if (!this.handleHashChange()) {
            this.fetchImages()
        }

        this._pageEl.addEventListener(
            PAGE_CHANGE_EVENT,
            this.handlePageChange as any
        )
        this._listEl.addEventListener("click", this.handleClickCard)
        window.addEventListener("hashchange", this.handleHashChange)
    }

    disconnectedCallback() {
        this._pageEl.removeEventListener(
            PAGE_CHANGE_EVENT,
            this.handlePageChange as any
        )
        window.removeEventListener("hashchange", this.handleHashChange)
    }

    parseHash() {
        const {hash} = location
        const [key, val] = hash.substring(1).split("=")
        let page = -1

        if (key === "page") {
            page = Number.parseInt(val || "-1")
        }

        return page
    }

    handleClickCard = (evt: MouseEvent) => {
        const t = evt.target as Card

        if (t.localName === "card-comp") {
            viewImage(
                t.highResolutionSrc,
                this._images,
                evt.clientX,
                evt.clientY
            )
        }
    }

    handlePageChange = (evt: CustomEvent) => {
        const {page} = evt.detail

        if (this._page === page) {
            return
        }

        this._page = page
        location.hash = `page=${page}`
    }

    handleHashChange = () => {
        const page = this.parseHash()
        const {totalPages, current} = this._pageEl

        if (page > 0) {
            // last page
            if (
                totalPages > 0 &&
                totalPages === current &&
                page > current
            ) {
                return false
            }

            this._page = page

            this.fetchImages()

            return true
        }

        return false
    }

    cancel() {
        if (this._cancel) {
            this._cancel()
        }

        this._cancel = null
    }

    fetchImages() {
        this.cancel()

        const controller = new AbortController()
        this._cancel = () => controller.abort()

        window.loading.show()
        get(
            `/api/images?page=${this._page}`,
            {
                signal: controller.signal
            }
        )
            .then((data: any) => {
                const {list, total} = data
                const {_listEl, _pageEl} = this
                const frag = document.createDocumentFragment()
                _listEl.textContent = ""

                this._images = list.map((item: any) => {
                    const card = <Card>document.createElement("card-comp")

                    card.highResolutionSrc = item.imagePath
                    card.img = item.thumbnailPath
                    card.date = item.date
                    card.headline = item.headline
                    card.info = item.title

                    card.classList.add("img-card")
                    frag.append(card)

                    return item.imagePath
                })

                _listEl.append(frag)
                _pageEl.total = total
                _pageEl.current = this._page
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    this._cancel = null
                }

                window.loading.hide()
            })
    }
}

defineEl("home-comp", Main)