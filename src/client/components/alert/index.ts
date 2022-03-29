import {defineEl} from "../../utils"
import template from "./index.html"

export class Modal extends HTMLElement {
    private _ok: HTMLButtonElement
    private _body: HTMLElement
    private _msg: string = ""
    public el: HTMLElement

    constructor() {
        super()

        const shadow = this.attachShadow({mode: "open"})
        shadow.innerHTML = template
        this._ok = shadow.querySelector(".ok")!
        this._body = shadow.querySelector(".modal-body")!
        this.el = shadow.querySelector(".modal")!
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
    const backdrop = document.createElement("backdrop-comp")
    const {el} = modal
    const close = () => {
        modal.remove()
        backdrop.remove()
    }
    modal.msg = msg

    document.body.append(backdrop)
    document.body.append(modal)
    el.style.display = "block"
    el.offsetHeight
    el.classList.add("show")
    
    modal.addEventListener("ok", close, {once: true})
    backdrop.addEventListener("click", close, {once: true})
}

defineEl("modal-comp", Modal)