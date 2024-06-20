import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

let camera, scene, renderer, controls;
let geometry, material, mesh;
let BLOOM_LAYER = 1;
const particles = [];
const originalPositions = [];
const originalMaterials = [];

init();
animate();
const sphereGeometry = new THREE.SphereGeometry(0.003, 16, 16);
function init() {
    const container = document.querySelector('#container');

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 50000);
    camera.position.set(0, 0, 20);

    scene = new THREE.Scene();
    scene.background = new THREE.Color('black');
    scene.fog = new THREE.FogExp2(0x000104, 0.0000675);

    camera.lookAt(scene.position);

    new GLTFLoader()
        .setPath('./models/')
        .load('v2_rocket.glb', function (gltf) {
            const model = gltf.scene;
            model.position.set(0, 0, 0);
            model.scale.set(0.2, 0.2, 0.2);

            // scene.add(model);
            if (model) {
                model.traverse((child) => {
                if (child.isMesh) {
                    const vertices = child.geometry.attributes.position;
                    for (let i = 0; i < vertices.count; i++) {
                        const x = vertices.getX(i);
                        const y = vertices.getY(i);
                        const z = vertices.getZ(i);
                        const randomX = x + (Math.random() - 0.5) * 0.2;
                        const randomY = y + (Math.random() - 0.5) * 0.1;
                        const randomZ = z + (Math.random() - 0.5) * 0.1;

                        const particle = new THREE.Mesh(sphereGeometry, new THREE.MeshStandardMaterial({color: 'white'}));
                        particle.position.set(randomX, randomY, randomZ);
                        particle.position.copy(child.localToWorld(particle.position));
                        particles.push(particle);
                        originalPositions.push(new THREE.Vector3(randomX, randomY, randomZ));
                        originalMaterials.push(particle.material.clone());
                    }
                }
                });
                scene.add(...particles);
            }
        });
    
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    const environment = new RoomEnvironment( renderer );
    const pmremGenerator = new THREE.PMREMGenerator( renderer );

    scene.environment = pmremGenerator.fromScene( environment ).texture;

    controls = new OrbitControls( camera, renderer.domElement );
    controls.enableDamping = true;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controls.target.set( 0, 0.35, 0 );
    controls.update();
}

function animate() {

    requestAnimationFrame( animate );

    controls.update(); // required if damping enabled

    render();

}

function render() {

    renderer.render( scene, camera );

}