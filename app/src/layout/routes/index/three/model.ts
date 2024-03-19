import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const draco = new DRACOLoader();
draco.setDecoderConfig({ type: "js" });
draco.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");

export function loadGLTFModel(scene: any, glbPath: any, options = { receiveShadow: true, castShadow: true }) {
	const { receiveShadow, castShadow } = options;

	return new Promise((resolve, reject) => {
		const loader = new GLTFLoader();
		loader.setDRACOLoader(draco);

		loader.load(
			glbPath,
			(gltf) => {
				const obj = gltf.scene;
				obj.name = "model";
				obj.position.y = 0;
				obj.position.x = 0;
				obj.receiveShadow = receiveShadow;
				obj.castShadow = castShadow;
				scene.add(obj);

				obj.traverse(function (child) {
					if (child.isObject3D) {
						child.castShadow = castShadow;
						child.receiveShadow = receiveShadow;
					}
				});
				resolve(obj);
			},
			undefined,
			function (error) {
				reject(error);
			}
		);
	});
}
