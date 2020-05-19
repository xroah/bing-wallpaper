//images url
const TREE_URL = "https://api.github.com/repos/xroah/bing-pic/git/trees/f4844b89c61b7e04e148850b5472567eb990e456?recursive=1";

let treeMap;
let loadingEl;

function showLoading() {
    if (loadingEl) return;

    loadingEl = document.createElement("div");

    loadingEl.classList.add("loading");
    document.body.appendChild(loadingEl);
}

function hideLoading() {
    if (!loadingEl) return;

    document.body.removeChild(loadingEl);
    loadingEl = null;
}

function _fetch(url) {

    return new Promise((resolve, reject) => {
        fetch(url, {
            method: "GET",
            mode: "cors",
            headers: {
                Authorization: "token e39be07062043ba845b46c295df08de100162563"
            }
        })
            .then(res => {
                if (res.ok) {
                    resolve(res.json());
                } else {
                    reject();
                    //alert("获取数据失败");
                }
            })
            .catch(err => {
                //alert(err ? err.message : "获取数据失败");
                reject(err);
            });
    });
}

function parseData(data) {
    const tree = data.tree;
    const ret = new Map();

    tree.forEach(item => {
        const pathArr = item.path.split("/");
        let map = ret;

        while (pathArr.length) {
            let p = pathArr.shift();
            let _map = map.get(p);

            if (!_map) {
                _map = new Map();
                map.set(p, _map);
            }

            if (p.endsWith(".json")) {
                map.set(p, item.url);

                if (!map.hasOwnProperty("isFile")) {
                    Object.defineProperty(
                        map,
                        "isFile",
                        { value: true }
                    );
                }
            }

            map = _map;
        }
    });

    return ret;
}

function createA(text, href) {
    const a = document.createElement("a");
    const dl = document.createElement("dl");
    const dd = document.createElement("dd");

    a.href = href;
    dd.innerHTML = text;

    a.classList.add("item");
    dd.classList.add("text-white", "text-center");
    dl.appendChild(document.createElement("dt"));
    dl.appendChild(dd);
    a.appendChild(dl);

    return a;
}

function empty(el) {
    if (el.hasChildNodes()) {
        Array.from(el.childNodes)
            .forEach(c => el.removeChild(c));
    }
}

function renderFolder(folders, prefix) {
    const list = document.querySelector(".item-list");
    const frag = document.createDocumentFragment();

    empty(list);

    for (let folder of folders) {
        frag.appendChild(createA(folder, `#/${prefix || ""}${folder}`));
    }

    list.appendChild(frag);
}

function renderImage(images) {
    let promises = [];
    let render = imgs => {
        const list = document.querySelector(".item-list");
        const frag = document.createDocumentFragment();

        imgs.forEach(img => {
            const a = createA(img.date);
            const imgEl = new Image();

            imgEl.src = img.url;

            a.classList.add("img-item");
            a.setAttribute("data-url", img.url);
            a.querySelector("dt").append(imgEl);
            frag.appendChild(a);
        });
        
        empty(list);
        list.appendChild(frag);
    }

    for (let [key, url] of images) {
        promises.push(_fetch(url));
    }

    showLoading();

    Promise
        .all(promises)
        .then(res => {
            render(
                res.map(
                    item => JSON.parse(Base64.decode(item.content))
                )
            );

            hideLoading();
        });
}

function render404() {
    const div = document.createElement("div");
    const btn = document.createElement("button");
    const list = document.querySelector(".item-list");

    div.innerHTML = "<div>404</div><div>内容不存在。</div>";
    btn.innerHTML = "返回";

    div.classList.add("error-404");
    div.appendChild(btn);
    btn.classList.add("btn", "btn-primary");
    empty(list);
    list.appendChild(div);

    btn.addEventListener("click", () => history.back());
}

function handleHashChange() {
    const hash = location.hash.split("#/")[1];
    const two = num => (100 + num).toString().substring(1);
    const back = document.querySelector(".back-wrapper");

    if (!hash) {
        back.style.display = "none";
        return renderFolder(treeMap.keys());
    }

    const path = hash.split("/");
    let map = treeMap;

    for (let p of path) {
        if (p.length === 1) {
            p = two(+p);
        }

        map = map.get(p);

        if (!map) {
            return render404();
        }
    }
    if (map.isFile) {
        renderImage(map.entries());
    } else {
        renderFolder(map.keys(), `${hash}/`);
    }

    back.style.display = "block";
}

function back() {
    const hash = location.hash.substring("#/").split("/");

    hash.pop();
    location.href = `${location.origin}/${location.pathname}#/${hash.join("/")}`
}

function init(data) {
    treeMap = parseData(data);

    hideLoading();
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    document.querySelector(".back").addEventListener("click", back);
}

showLoading();
_fetch(TREE_URL).then(init);