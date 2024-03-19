import { useEffect, useRef } from "react";
import * as THREE from "three";

function ThreeScene() {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(90, 1 / 1, 0, 1000);
		const renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		containerRef.current.appendChild(renderer.domElement);

		const geometry = new THREE.BoxGeometry();
		const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
		const cube = new THREE.Mesh(geometry, material);
		scene.add(cube);

		camera.position.z = 5;

		const animate = () => {
			requestAnimationFrame(animate);

			// cube.rotation.x += 0.005;
			// cube.rotation.y += 0.01;

			renderer.render(scene, camera);
		};

		animate();

		return () => {
			containerRef.current?.removeChild(renderer.domElement);
		};
	}, []);

	return <div ref={containerRef} />;
}
