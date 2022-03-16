export function defineEl(name: string, ctor: new () => HTMLElement) {
    if (!customElements.get(name)) {
        customElements.define(name, ctor)
    }
}