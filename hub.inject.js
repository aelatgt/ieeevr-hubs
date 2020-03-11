
import {Clock} from './src/clock'
import {PosterPreviews} from './src/poster-previews'

AFRAME.registerSystem('scene-inject', {
	init() {
		const sceneEl = this.el

		// e.g., add content to known group in environment scene
		sceneEl.addEventListener('environment-scene-loaded', () => {
			const environmentScene = document.querySelector("#environment-scene");
			// environmentScene.object3D.findObjectByName()
		}) 

		// add content directly to root scene
		sceneEl.object3D.add( new Clock().root );
		sceneEl.appendChild( new PosterPreviews().rootEl );
	}
})

export class GLTFComponentMappingDelegate {
    static shouldMediaBeInspectable(el) { return false }
}