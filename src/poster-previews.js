
const posterImages = require.context('./sui19posters', true)

console.log(posterImages)

export class PosterPreviews {
    constructor() {
        this.rootEl = document.createElement('a-entity')
        this.rootEl.id = 'ieeevr-posters'

        const posterKeys = posterImages.keys()
        const pLength = posterKeys.length
        const radius = pLength * 1.5
        let pIndex = 0
        for (const key of posterKeys) {
            pIndex++
            const posterSrc = posterImages(key)
            const poster = document.createElement('a-entity')
            poster.id = key
            // poster.setAttribute('media-image', {src:posterSrc})
            poster.setAttribute("networked", {
                template: "#static-controlled-media",
                owner: "scene",
                persistent: true,
                networkId: posterSrc
            })
            poster.setAttribute("media-loader", {
                src: posterSrc
            })
			const angle = pIndex / pLength * Math.PI
            poster.setAttribute("position", {
                x: Math.cos(angle) * radius,
                y: 4.5,
                z: Math.sin(angle) * radius
            })
            this.rootEl.appendChild(poster)
        }
    }
}