declare module "*.html" {
    const content: string

    export default content
}

interface Window {
    showAlert: (msg: string) => () => void
}