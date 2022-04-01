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

interface Window {
    showAlert: (msg: string) => ReturnVoid
    message: Message
}