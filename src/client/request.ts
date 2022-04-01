export default function request(url: string, init: RequestInit = {}) {
    const showError = (msg: string) => {
        window.message.error(msg)
    }

    return new Promise((resolve, reject) => {
        fetch(
            url,
            init
        ).then(res => {
            if (!res.ok) {
                showError(res.statusText)
                reject(res.statusText)

                return
            }

            res.json().then(ret => {
                if (ret.code !== 0) {
                    showError(ret.msg)
                    reject(ret.msg)
                } else {
                    resolve(ret.data)
                }
            }).catch(err => {
                showError(err.message || "数据解析失败")
            })
        }).catch(err => {
            reject(err)
            showError(err.message || "请求失败!")
        })
    })
}

function factory(method: string) {
    return function (url: string, init?: RequestInit) {
        return request(
            url,
            {
                ...init,
                method
            }
        )
    }
}

export const get = factory("get")
export const post = factory("post")