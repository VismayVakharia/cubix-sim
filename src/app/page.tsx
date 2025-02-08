'use client'

import { useRef, useEffect } from 'react'
// import Image from "next/image";

import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { Cube } from "@/components/cube";
import { BLACK_MATERIAL, STICKER_MATERIALS } from "@/components/constants";
// import { debug_vector } from '../components/utils'

import 'keyboard-css'

function Controls() {
  return (
    <div className="controls">
      <h2 className="text-xl font-bold mb-2">Moves</h2>
      <div className="face">
        <h3>Face Rotations</h3>
        <div className="face-buttons">
          <button className="kbc-button kbc-button-secondary" data-keyboard-key="SHIFT">CCW</button>
          <button className="kbc-button kbc-button-secondary" data-keyboard-key="2">2</button>

          <button className="kbc-button no-container" data-keyboard-key="F">F</button>
          <button className="kbc-button no-container" data-keyboard-key="R">R</button>
          <button className="kbc-button no-container" data-keyboard-key="U">U</button>
          <button className="kbc-button no-container" data-keyboard-key="L">L</button>
          <button className="kbc-button no-container" data-keyboard-key="B">B</button>
          <button className="kbc-button no-container" data-keyboard-key="D">D</button>
        </div>
      </div>
      <div style={{ display: 'inline-flex' }}>
        <div className="slice" style={{ width: '200px' }}>
          <h3>Slice Rotations</h3>
          <div className="slice-buttons">
            <button className="kbc-button no-container" data-keyboard-key="M">M</button>
            <button className="kbc-button no-container" data-keyboard-key="E">E</button>
            <button className="kbc-button no-container" data-keyboard-key="S">S</button>
          </div>
        </div>
        <div className="whole">
          <h3>Whole cube reorientation</h3>
          <div className="whole-buttons">
            <button className="kbc-button no-container" data-keyboard-key="X">X</button>
            <button className="kbc-button no-container" data-keyboard-key="Y">Y</button>
            <button className="kbc-button no-container" data-keyboard-key="Z">Z</button>
          </div>
        </div>
      </div>
    </div>
  )
}


export default function ThreeJSScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xc0c0c0)

    // Camera
    const camera = new THREE.PerspectiveCamera(
      30,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.x = 8;
    camera.position.y = 9;
    camera.position.z = 11;
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = false;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0xffffff, 1)
    pointLight.position.set(5, 5, 5)
    scene.add(pointLight)

    // Cube
    const size = new THREE.Vector3(3, 3, 3)
    const cube = new Cube(size);
    cube.add_to_scene(scene);

    // Debug Axis
    // debug_vector(new THREE.Vector3(), new THREE.Vector3(size.x, 0, 0), "red", scene);
    // debug_vector(new THREE.Vector3(), new THREE.Vector3(0, size.y, 0), "green", scene);
    // debug_vector(new THREE.Vector3(), new THREE.Vector3(0, 0, size.z), "blue", scene);

    // Animation
    // const clock = new THREE.Clock()
    const angle_step = Math.PI / 60;
    let current_state = 0.0
    const commands: string[] = []
    let current_command: [string, number] = ["", 0.0];

    function update() {
      if (current_command[0] == "") {
        const command = commands.pop()
        if (command !== undefined) {
          current_command = [command, Math.PI / 2]
        }
      } else {
        const move = current_command[0]
        const angle = current_command[1]
        const diff = angle - current_state;
        if (diff > angle_step) {
          cube.rotate3x3(move, angle_step)
          current_state += angle_step
        } else if (diff > 0) {
          cube.rotate3x3(move, diff)
          current_state += diff
        } else {
          current_command = ["", 0]
          current_state = 0
        }
      }
    }

    // Keyboard & Mouse
    let _shiftStatus: boolean = false;
    let _2Status: boolean = false;

    function downEventHandler(element: Element) {
      element.classList.add('active');
      const move = element.getAttribute("data-keyboard-key") as string;

      if ("RUFLDBMESXYZ".includes(move)) {
        if (_shiftStatus) {
          commands.push(move + "'")
        } else if (_2Status) {
          commands.push(move + "2")
        } else {
          commands.push(move)
        }
      }
    }

    function upEventHandler(element: Element) {
      const key = element.getAttribute("data-keyboard-key") as string;
      if (key === "SHIFT") {
        if (_shiftStatus) element.classList.remove('active');
        _shiftStatus = !_shiftStatus;
      } else if (key === "2") {
        if (_2Status) element.classList.remove('active');
        _2Status = !_2Status;
      } else {
        element.classList.remove('active');
      }
    }

    function mouseDownHandler(event: MouseEvent) {
      if (event.button !== 0) return
      const elements = document.querySelectorAll("[data-keyboard-key]");
      for (let index = 0; index < elements.length; index++) {
        const element = elements[index];
        if (element.contains(event.target as Node)) {
          downEventHandler(element);
        };
      }
    }

    function mouseUpHandler(event: MouseEvent) {
      if (event.button !== 0) return
      const elements = document.querySelectorAll("[data-keyboard-key]");
      for (let index = 0; index < elements.length; index++) {
        const element = elements[index];
        if (element.contains(event.target as Node)) {
          upEventHandler(element);
        };
      }
    }

    function keyDownHandler(e: KeyboardEvent) {
      const element = document.querySelector(
        '[data-keyboard-key="' + e.key.toUpperCase() + '"]'
      );
      if (element !== null) downEventHandler(element);
    }

    function keyUpHandler(e: KeyboardEvent) {
      const key = e.key;
      const element = document.querySelector(
        '[data-keyboard-key="' + key.toUpperCase() + '"]'
      );
      if (element !== null) upEventHandler(element);
    }

    document.addEventListener("mousedown", mouseDownHandler);
    document.addEventListener("mouseup", mouseUpHandler);
    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);

    function animate() {
      // const elapsedTime = clock.getElapsedTime()

      // Update controls
      controls.update()

      update()

      // Render
      renderer.render(scene, camera)

      // Continue animation
      requestAnimationFrame(animate)
    }

    // Handle window resize
    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }

    window.addEventListener('resize', handleResize)

    // Start animation
    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      controls.dispose()
      cube.cubies.forEach(cubie => cubie.geometries.forEach(goemetry => goemetry.dispose()))
      STICKER_MATERIALS.forEach(material => material.dispose())
      BLACK_MATERIAL.dispose()
      document.removeEventListener("mousedown", mouseDownHandler)
      document.removeEventListener("mouseup", mouseUpHandler)
      document.removeEventListener("keydown", keyDownHandler)
      document.removeEventListener("keyup", keyUpHandler)
    }
  }, [])

  return (
    <div className="w-full h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
      <div className="absolute top-4 left-4 text-white bg-black/50 p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Rubik's Cube Simulator</h2>
      </div>
      <div className='absolute bottom-4 left-4 text-white bg-black/50 p-4 rounded'>
        <Controls />
      </div>
    </div>
  )
}
