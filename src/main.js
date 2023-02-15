import "./sass/main.scss";
import { gsap } from "gsap";

import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    Mesh,
    Clock,
    Color,
    MeshToonMaterial,
    TorusKnotGeometry,
    DirectionalLight,
    TextureLoader,
    NearestFilter,
    TorusGeometry,
    ConeGeometry,
    Group,
    Points,
    BufferGeometry,
    BufferAttribute,
    PointsMaterial,
} from "three";

// Core Elements Of ThreeJS
const scene = new Scene();
const camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new WebGLRenderer({
    canvas: document.querySelector("canvas#webgl"),
    alpha: true
});
const clock = new Clock();
let mouseXY = {
    x: 0,
    y: 0
}

// Configuration
let activeSection = 0;
let scrollY = window.scrollY;
camera.position.set(0, 0, 7);
renderer.setSize(window.innerWidth, window.innerHeight)

// Groups
const parallaxGroup = new Group();
parallaxGroup.add(camera);
scene.add(parallaxGroup)

// Loaders
const textureLoader = new TextureLoader();

// Textures
const gradientTexture = textureLoader.load("./assets/textures/3.jpg");
gradientTexture.magFilter = NearestFilter;

// 3D Objects
const objectDistance = 10;

const material = new MeshToonMaterial({
    gradientMap: gradientTexture
})

const torusMesh = new Mesh(
    new TorusGeometry(1, 0.5, 32, 32),
    material
)

const coneMesh = new Mesh(
    new ConeGeometry(1, 2, 32, 32),
    material
)

const torusKnotMesh = new Mesh(
    new TorusKnotGeometry(1, 0.4, 32, 32),
    material
)

torusMesh.position.set(-3, -objectDistance * 0, 0);
coneMesh.position.set(3, -objectDistance * 1, 0);
torusKnotMesh.position.set(-3, -objectDistance * 2, 0);

const meshesArray = [torusMesh, coneMesh, torusKnotMesh];

scene.add(torusMesh, coneMesh, torusKnotMesh);

// Lights
const directionalLight = new DirectionalLight(0xFFFFFF, 1);
directionalLight.position.set(1, 1, 0)

scene.add(directionalLight)

// Particles
const particlesCount = 20000;
const particlePositions = new Float32Array(particlesCount * 3)
const particleColors = new Float32Array(particlesCount * 3).map(_ => 1);

for (let i = 0; i < particlePositions.length; i++) {
    const i3 = i * 3;
    particlePositions[i3] = (Math.random() - 0.5) * 50;
    particlePositions[i3 + 1] = (objectDistance + 1) - (Math.random() * objectDistance * (meshesArray.length + 2));
    particlePositions[i3 + 2] = (Math.random() - 1) * 30;
}

const particleGeometry = new BufferGeometry();
const particleMaterial = new PointsMaterial({
    size: 0.001,
    sizeAttenuation: true,
    vertexColors: true
});

particleGeometry.setAttribute("position", new BufferAttribute(particlePositions, 3));
particleGeometry.setAttribute("color", new BufferAttribute(particleColors, 3));

const particles = new Points(particleGeometry, particleMaterial);

scene.add(particles);

// Raycast

// Events
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
})

window.addEventListener("scroll", () => {
    scrollY = window.scrollY;

    const sectionNumber = Number((scrollY / window.innerHeight).toFixed(0));

    if (activeSection != sectionNumber) {
        activeSection = sectionNumber;

        gsap.to(meshesArray[activeSection].rotation, {
            x: "+=3",
            y: "+=6",
            duration: 2
        })
    }


})

window.addEventListener("mousemove", event => {
    mouseXY = {
        x: event.clientX / window.innerWidth - 0.5,
        y: event.clientY / window.innerHeight - 0.5
    }
})

let prevTime = 0;
let randoms = [...Array(particlesCount)].map(_ => Number(((Math.random() * 0.5) + 1).toFixed(1)));

function render() {

    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - prevTime;
    prevTime = elapsedTime;

    renderer.render(scene, camera);

    camera.position.y = -(scrollY / window.innerHeight) * objectDistance;

    const parallaxX = -mouseXY.x * 0.5;
    const parallaxY = mouseXY.y * 0.5;

    for (let i = 0; i < particleGeometry.attributes.position.array.length; i++) {
        const i3 = i * 3;

        particleGeometry.attributes.color.array[i3] = Math.min(Math.sin(Math.max(elapsedTime, 0.3) * randoms[i3] - 0.05) ** 2, 0.5);
        particleGeometry.attributes.color.array[i3 + 1] = Math.min(Math.sin(Math.max(elapsedTime, 0.3) * randoms[i3] - 0.07) ** 2, 0.5);
        particleGeometry.attributes.color.array[i3 + 2] = Math.min(Math.sin(Math.max(elapsedTime, 0.3) * randoms[i3] - 0.1) ** 2, 0.5);
    }

    particleGeometry.attributes.color.needsUpdate = true;

    parallaxGroup.position.x += (parallaxX - parallaxGroup.position.x) * 5 * deltaTime;
    parallaxGroup.position.y += (parallaxY - parallaxGroup.position.y) * 5 * deltaTime;

    for (const mesh of meshesArray) {
        mesh.rotation.x += deltaTime * 0.3;
        mesh.rotation.y += deltaTime * 0.5;
    }

    requestAnimationFrame(render);
}

render();