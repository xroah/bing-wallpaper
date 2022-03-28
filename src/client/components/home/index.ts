import {defineEl} from "../../utils"
import {Card} from "../card"
import template from "./index.html"

class Main extends HTMLElement {
    private _listEl: HTMLElement

    constructor() {
        super()

        const shadow = this.attachShadow({mode: "open"})
        shadow.innerHTML = template
        this._listEl = shadow.querySelector(".image-list")!
    }

    connectedCallback() {
        console.log(this._listEl)
        this.fetchImages()
    }

    fetchImages() {
        fetch("http://localhost:3000/api/images")
            .then(res => {
                return res.json()
            })
            .then(json => {
                const list = json.data.list
                const frag = document.createDocumentFragment()
                
                list.forEach((item: any) => {
                    const card = <Card>document.createElement("card-comp")

                    card.highResolutionSrc = `http://localhost:3000${item.imagePath}`
                    card.img = `http://localhost:3000${item.imagePath}`
                    card.date = item.date
                    card.headline = item.headline
                    card.info = item.title
                    
                    frag.append(card)
                })

                this._listEl.append(frag)
                console.log(list)
            })
    }
}

defineEl("home-comp", Main)