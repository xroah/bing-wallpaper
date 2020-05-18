//images url
const TREE_URL = "https://api.github.com/repos/xroah/bing-pic/git/trees/f4844b89c61b7e04e148850b5472567eb990e456?recursive=1";

let treeMap;

function _fetch(url) {
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: "GET",
            mode: "cors"
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
                map.set(p, item.url)
            }

            map = _map;
        }
    });

    return ret;
}

function createA(text, isFolder) {
    const a = document.createElement("a");
    const dl = document.createElement("dl");
    const dd = document.createElement("dd");

    a.isFolder = isFolder;
    a.href = "javascript: void 0;";
    dd.innerHTML = text;

    a.classList.add("item");
    dd.classList.add("text-white", "text-center");
    dl.appendChild(document.createElement("dt"));
    dl.appendChild(dd);
    a.appendChild(dl);

    return a;
}

function renderFolder(folders) {
    const list = document.querySelector(".item-list");
    const frag = document.createDocumentFragment();

    for (let folder of folders) {
        frag.appendChild(createA(folder, true));
    }

    list.appendChild(frag);
}

function handleHashChange() {
    const hash = location.hash.split("#/")[1];

    if (!hash) {
        return renderFolder(treeMap.keys());
    }
}

function init(data) {
    treeMap = parseData(data);

    handleHashChange();
}

_fetch(TREE_URL).then(init);