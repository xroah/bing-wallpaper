import {createIcon} from "./svg"

const icons = new Map([
    [
        "download-icon",
        `
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        `
    ],
    [
        "chevron-right-icon",
        `<polyline points="9 18 15 12 9 6" />`
    ],
    [
        "chevron-left-icon",
        `<polyline points="15 18 9 12 15 6" />`
    ],
    [
        "chevron-up-icon",
        `<polyline points="18 15 12 9 6 15" />`
    ],
    [
        "github-icon",
        `<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />`
    ],
    [
        "x-icon",
        `
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        `
    ]
])

icons.forEach((v, k) => createIcon(k, v))