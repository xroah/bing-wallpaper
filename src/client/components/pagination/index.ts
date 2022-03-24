import {defineEl} from "../../utils"
import template from "./index.html"

const VISIBLE_PAGES = 7
const ACTIVE_CLASS = "active"
const DISABLE_CLASS = "disabled"
const PAGE_CHANGE_EVENT = "pagechange"

class Pagination extends HTMLElement {
    private _nav: HTMLElement
    private _el: HTMLUListElement | null = null
    private _total = 0
    private _totalPages = 0
    private _current = 1
    private _size = 10
    private _connected = false
    private _prev = this.getItem("上一页", "prev", false)
    private _next = this.getItem("下一页", "next", false)
    private _ellipsis = this.getItem("...", "ellipsis", false)

    constructor() {
        super()

        const shadow = this.attachShadow({mode: "open"})
        shadow.innerHTML = template
        this._nav = shadow.querySelector("nav")!
        this._ellipsis.classList.add(DISABLE_CLASS)
    }

    connectedCallback() {
        const total = Number.parseInt(this.getAttribute("total") || "")
        const size = Number.parseInt(this.getAttribute("size") || "")
        const current = Number.parseInt(this.getAttribute("current") || "")

        if (total) {
            this.total = total
        }

        if (size) {
            this.size = size
        }

        if (current) {
            this.current = current
        }

        this._connected = true

        this._nav.addEventListener("click", this.handleClick)
        this.render()
    }

    disconnectedCallback() {
        this._connected = false

        this._nav.removeEventListener("click", this.handleClick)
    }

    setAttribute(qualifiedName: string, value: string): void {
        super.setAttribute(qualifiedName, value)

        console.log(qualifiedName, value)
    }

    updateTotalPages() {
        this._totalPages = Math.ceil(this.total / this._size)
        
        if (this.current > this._totalPages) {
            this.current = this._totalPages

            this.emit()
        }

        this.render()
    }

    handleClick = (evt: MouseEvent) => {
        const t = evt.target as HTMLElement
        const {classList: cl} = t

        evt.preventDefault()

        if (cl.contains(ACTIVE_CLASS) || cl.contains(DISABLE_CLASS)) {
            return
        }

        if (cl.contains("page")) {
            this.to(Number.parseInt(t.dataset["page"]!))
        } else if (cl.contains("prev")) {
            this.goPrev()
        } else if (cl.contains("next")) {
            this.goNext()
        }

        this.emit()
    }

    emit() {
        this.dispatchEvent(
            new CustomEvent(
                PAGE_CHANGE_EVENT,
                {
                    detail: {
                        page: this.current
                    }
                }
            )
        )
    }

    goPrev() {
        this.to(this.current - 1)
    }

    goNext() {
        this.to(this.current + 1)
    }

    to(page: number) {
        this.current = page
    }

    get totalPages() {
        return this._totalPages
    }

    get total() {
        return this._total
    }

    set total(v: number) {
        if (this._total !== v) {
            this._total = v

            this.updateTotalPages()
        }
    }

    get current() {
        return this._current
    }

    set current(v: number) {
        if (this._current === v) {
            return
        }

        if (v < 1) {
            this._current = 1
        } else if (v >= this.totalPages) {
            this._current = this.totalPages
        } else {
            this._current = v
        }

        this.render()
    }

    get size() {
        return this._size
    }

    set size(v: number) {
        if (this._size !== v) {
            this._size = v

            this.updateTotalPages()
        }
    }

    getItem(text: string, className = "", isNumber = true) {
        const item = document.createElement("li")
        const link = document.createElement("a")
        link.innerHTML = text
        link.href = "#"

        item.classList.add("page-item")
        link.classList.add("page-link")
        item.append(link)

        if (isNumber && +text === this.current) {
            item.classList.add(ACTIVE_CLASS)
        }

        if (className) {
            link.classList.add(className)
        }

        if (isNumber) {
            link.dataset["page"] = text
        }

        return item
    }

    render() {
        if (!this._connected) {
            return
        }

        const frag = document.createDocumentFragment()
        const prev = this._prev.cloneNode(true) as HTMLElement
        const next = this._next.cloneNode(true) as HTMLElement
        let items: Node[] = [prev]
        const getItem = (i: number) => this.getItem(`${i}`, "page")
        const loop = (start: number, end: number) => {
            const ret: Node[] = []

            for (let i = start; i <= end; i++) {
                ret.push(getItem(i))
            }

            return ret
        }

        if (this.current === 1) {
            prev.classList.add("disabled")
        }

        if (this.current === this.totalPages) {
            next.classList.add("disabled")
        }

        if (this._el) {
            this._el.remove()
        }

        this._el = document.createElement("ul")

        this._el.classList.add("pagination")

        if (this.totalPages <= VISIBLE_PAGES) {
            items = [...items, ...loop(1, this.totalPages)]
        } else {
            let page
            const first = getItem(1)
            const last = getItem(this.totalPages)
            const prevItems = [first, this._ellipsis.cloneNode(true)]
            const nextItems = [this._ellipsis.cloneNode(true), last]

            if (this.current < (page = VISIBLE_PAGES - 1)) {
                // right ellipsis is visible
                items = [
                    ...items,
                    ...loop(1, page),
                    ...nextItems
                ]
            } else if (
                this.current > (page = this.totalPages - VISIBLE_PAGES + 2)
            ) {
                // left ellipsis is visible
                items = [
                    ...items,
                    ...prevItems,
                    ...loop(page, this.totalPages)
                ]
            } else {
                let start = this.current - 2
                let end = this.current + 2

                items = [
                    ...items,
                    ...prevItems,
                    ...loop(start, end),
                    ...nextItems
                ]
            }
        }

        frag.append(...items, next)
        this._el.append(frag)
        this._nav.append(this._el)
    }
}

defineEl("pagination-comp", Pagination)