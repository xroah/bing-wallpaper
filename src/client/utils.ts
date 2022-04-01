export function defineEl(name: string, ctor: new () => HTMLElement) {
    if (!customElements.get(name)) {
        customElements.define(name, ctor)
    }
}

export function executeAfterTransition(
    el: HTMLElement,
    timeout: number,
    callback: () => void
) {
    let called = false
    let timer: number = -1
    const PADDING = 50
    const cb = (evt?: TransitionEvent) => {
        if (
            called ||
            (evt && evt.target !== el)
        ) {
            return
        }

        called = true

        if (evt && timer !== -1) {
            clearTimeout(timer)
        }

        timer = -1

        callback()
        el.removeEventListener("transitionend", cb)
    }

    timer = window.setTimeout(cb, timeout + PADDING)

    el.addEventListener("transitionend", cb, {once: true})
}