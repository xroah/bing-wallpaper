import {defineEl} from "../../utils"
import template from "./index.html"

class Pagination extends HTMLElement {
    private _el: HTMLUListElement
    private _total = 0
    private  _current = 1
    private _size = 10
    private _prev = this.getItem("上一页", false)
    private _next = this.getItem("下一页", false)

    constructor() {
        super()

        const shadow = this.attachShadow({mode: "open"})
        shadow.innerHTML = template
        this._el = shadow.querySelector(".pagination")!
    }

    connectedCallback() {
        const total = parseInt(this.getAttribute("total") || "0")

        if (total) {
            this.total = total
        }
    }

    setAttribute(qualifiedName: string, value: string): void {
        super.setAttribute(qualifiedName, value)

        console.log(qualifiedName, value)
    }

    get total() {
        return this._total
    }

    set total(v: number) {
        this._total = v
    }

    getItem(text: string, isNumber = true) {
        const item = document.createElement("li")
        const link = document.createElement("a")
        link.innerHTML = text

        item.classList.add("page-item")
        link.classList.add("page-link")
        item.append(link)

        if (isNumber) {
            link.dataset["page"] = text
        }

        return item
    }
}

defineEl("pagination-comp", Pagination)