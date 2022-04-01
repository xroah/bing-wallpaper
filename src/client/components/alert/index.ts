import {
    defineEl,
    TIMEOUT,
    executeAfterTransition
} from "../../utils"
import {Backdrop} from "../backdrop"
import template from "./index.html"

export class Modal extends HTMLElement {
    private _ok: HTMLButtonElement
    private _body: HTMLElement
    private _msg: string = ""
    private _el: HTMLElement

    constructor() {
        super()

        const shadow = this.attachShadow({mode: "open"})
        shadow.innerHTML = template
        this._ok = shadow.querySelector(".ok")!
        this._body = shadow.querySelector(".modal-body")!
        this._el = shadow.querySelector(".modal")!
    }

    connectedCallback() {
        const msg = this.getAttribute("msg") || ""

        if (msg) {
            this.msg = msg
        }

        this._ok.addEventListener("click", this.handleOk)
    }

    disconnectedCallback() {
        this._ok.removeEventListener("click", this.handleOk)
    }

    handleOk = () => {
        this.dispatchEvent(new CustomEvent("ok"))
    }

    handleKeydown = (evt: KeyboardEvent) => {
        if (/^esc/.test(evt.key.toLowerCase())) {
            this.hide()
        }
    }

    show() {
        const {_el: el} = this

        el.style.display = "block"
        el.offsetHeight
        el.classList.add("show")
        el.addEventListener("keydown", this.handleKeydown)

        executeAfterTransition(
            el,
            TIMEOUT,
            () => {
                this.dispatchEvent(new CustomEvent("modalshown"))
                el.focus()
            }
        )
    }

    hide() {
        const {_el: el} = this

        el.classList.remove("show")
        el.removeEventListener("keydown", this.handleKeydown)
        executeAfterTransition(
            el,
            TIMEOUT,
            () => {
                this.dispatchEvent(new CustomEvent("modalhidden"))
            }
        )
    }

    set msg(v: string) {
        this._msg = v
        this._body.innerHTML = v
    }

    get msg() {
        return this._msg
    }
}

export function alert(msg: string) {
    const modal = <Modal>document.createElement("modal-comp")
    const backdrop = <Backdrop>document.createElement("backdrop-comp")
    const close = () => {
        modal.hide()
        backdrop.hide()
    }
    const onHidden = () => {
        backdrop.remove()
        modal.remove()
    }
    const once = true
    modal.msg = msg

    document.body.append(backdrop)
    document.body.append(modal)
    backdrop.show()
    modal.show()

    modal.addEventListener("ok", close, {once})
    backdrop.addEventListener("click", close, {once})
    modal.addEventListener("modalhidden", onHidden, {once})

    return close
}

defineEl("modal-comp", Modal)

window.showAlert = alert