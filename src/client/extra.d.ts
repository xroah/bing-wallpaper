declare module "*.html" {
    const content: string

    export default content
}

interface ReturnVoid {
    (): void
}

interface MessageFunction {
    (msg: string): ReturnVoid
}

interface Message {
    success: MessageFunction
    error: MessageFunction
    info: MessageFunction
    closeAll: ReturnVoid
}

interface Loading {
    show: ReturnVoid
    hide: ReturnVoid
}

interface Window {
    loading: Loading
    message: Message
    showAlert: (msg: string) => ReturnVoid
}