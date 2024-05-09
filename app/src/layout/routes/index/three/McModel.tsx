import { modelConfig } from "@/layout/routes/index/Main";
import { ModelContainer, ModelLoader } from "@/layout/routes/index/three/Containters";
import { loadGLTFModel } from "@/layout/routes/index/three/model";
import config from "@/utils/config";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

function easeOutCirc(x: number) {
    return Math.sqrt(1 - (x - 1) ** 4);
}

export default function McModel() {
    const refContainer = useRef<HTMLDivElement>();
    const [loading, setLoading] = useState(true);
    const refRenderer = useRef<any>();
    const urlDogGLB = config.dashUrl + "/" + modelConfig.model;

    const handleWindowResize = useCallback(() => {
        const { current: renderer } = refRenderer;
        const { current: container } = refContainer;
        if (container && renderer) {
            const scW = container.clientWidth;
            const scH = container.clientHeight;

            renderer.setSize(scW, scH);
        }
    }, []);

    useEffect(() => {
        const { current: container } = refContainer;
        if (container) {
            const scW = container.clientWidth;
            const scH = container.clientHeight;

            const renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true
            });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(scW, scH);
            // renderer.outputEncoding = THREE.sRGBEncoding;
            container.appendChild(renderer.domElement);
            refRenderer.current = renderer;
            const scene = new THREE.Scene();

            const target = new THREE.Vector3(8, 1.2, 0);
            const initialCameraPosition = new THREE.Vector3(
                -40 * Math.sin(0.2 * Math.PI),
                10,
                -20 * Math.cos(0.2 * Math.PI)
            );

            // 640 -> 240
            // 8   -> 6
            const scale = scH * 0.03 + 4.8;
            const camera = new THREE.OrthographicCamera(
                -scale,
                scale,
                scale,
                -scale,
                0.001,
                500000
            );
            camera.position.copy(initialCameraPosition);
            camera.lookAt(target);

            const ambientLight = new THREE.AmbientLight(0xcccccc, Math.PI);
            scene.add(ambientLight);

            // add a green light from the camera
            // const directionalLight = new THREE.DirectionalLight(0xfff, 1);
            // directionalLight.position.set(-40, 10, 0);
            // scene.add(directionalLight);

            const controls = new OrbitControls(camera, renderer.domElement);
            controls.autoRotate = true;
            controls.target = target;

            loadGLTFModel(scene, urlDogGLB, {
                receiveShadow: false,
                castShadow: false
            }).then(() => {
                animate();
                setLoading(false);
            });

            let req: any = null;
            let frame = 0;

            function animate() {
                req = requestAnimationFrame(animate);

                frame = frame <= 100 ? frame + 1 : frame;

                if (frame <= 100) {
                    const p = initialCameraPosition;
                    const rotSpeed = -easeOutCirc(frame / 120) * Math.PI * 20;

                    camera.position.y = 10;
                    camera.position.x = p.x * Math.cos(rotSpeed) + p.z * Math.sin(rotSpeed);
                    camera.position.z = p.z * Math.cos(rotSpeed) - p.x * Math.sin(rotSpeed);
                    camera.lookAt(target);

                    // update light position
                    // directionalLight.position.x = 20 * Math.sin(rotSpeed);
                    // directionalLight.position.z = 20 * Math.cos(rotSpeed);
                } else {
                    controls.update();
                }

                renderer.render(scene, camera);
            }

            return () => {
                cancelAnimationFrame(req);
                renderer.domElement.remove();
                renderer.dispose();
            };
        }
    }, [urlDogGLB]);

    useEffect(() => {
        window.addEventListener("resize", handleWindowResize, false);
        return () => {
            window.removeEventListener("resize", handleWindowResize, false);
        };
    }, [handleWindowResize]);

    return <ModelContainer ref={refContainer}>{loading && <ModelLoader />}</ModelContainer>;
}
