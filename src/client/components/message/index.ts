import {defineEl, executeAfterTransition, TIMEOUT} from "../../utils"
import template from "./index.html"

const PREFIX = "message"

export class Message extends HTMLElement {
    private _el: HTMLElement
    private _type: string = ""
    private _timer: number = -1

    constructor() {
        super()

        const shadow = this.attachShadow({mode: "open"})
        shadow.innerHTML = template
        this._el = shadow.querySelector(".message")!
    }

    connectedCallback() {
        this._el.addEventListener(
            "mouseenter",
            this.handleMouseEnterOrLeave
        )
        this._el.addEventListener(
            "mouseleave",
            this.handleMouseEnterOrLeave
        )
    }

    disconnectedCallback() {
        this._el.removeEventListener(
            "mouseenter",
            this.handleMouseEnterOrLeave
        )
        this._el.removeEventListener(
            "mouseleave",
            this.handleMouseEnterOrLeave
        )
        this.clearTimer()
    }

    handleMouseEnterOrLeave = (evt: MouseEvent) => {
        const type = evt.type

        if (type === "mouseenter") {
            this.clearTimer()
        } else {
            this.delayHide()
        }
    }

    clearTimer() {
        if (this._timer !== -1) {
            clearTimeout(this._timer)

            this._timer = -1
        }
    }

    delayHide() {
        this.clearTimer()

        this._timer = window.setTimeout(
            () => this.hide(),
            3000
        )
    }

    show() {
        const {_el: el} = this

        el.offsetHeight
        el.classList.add("show")

        executeAfterTransition(
            el,
            TIMEOUT,
            () => {
                this.dispatchEvent(new CustomEvent("messageshown"))
                this.delayHide()
            }
        )
    }

    hide() {
        const {_el: el} = this
        this._timer = -1

        el.classList.remove("show")
        executeAfterTransition(
            el,
            TIMEOUT,
            () => {
                this.dispatchEvent(new CustomEvent("messagehidden"))
            }
        )
    }

    set msg(msg: string) {
        this._el.innerHTML = msg
    }

    set type(type: string) {
        const cls = `${PREFIX}-${this._type}`
        const {classList} = this._el
        this._type = type

        if (classList.contains(cls)) {
            classList.remove(cls)
        }

        classList.add(`${PREFIX}-${type}`)
    }
}

let wrapper: HTMLElement | null = null

type Type = "success" | "danger" | "info"

export function showMessage(msg: string, type: Type) {
    const comp = <Message>document.createElement("message-comp")
    const onHidden = () => {
        comp.remove()

        if (!wrapper?.childElementCount) {
            closeAll()
        }
    }
    comp.msg = msg
    comp.type = type

    if (!wrapper) {
        wrapper = document.createElement("div")

        wrapper.classList.add("message-wrapper")
        document.body.append(wrapper)
    }

    wrapper.append(comp)
    comp.addEventListener("messagehidden", onHidden, {once: true})
    comp.show()

    return () => comp.hide()
}

export function closeAll() {
    if (wrapper) {
        wrapper.remove()

        wrapper = null
    }
}

function factory(type: Type) {
    return function(msg: string) {
        return showMessage(msg, type)
    }
}

export const message = {
    success: factory("success"),
    error: factory("danger"),
    info: factory("info"),
    closeAll
}

window.message = message

defineEl("message-comp", Message)