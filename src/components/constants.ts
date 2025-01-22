import * as THREE from 'three'

export const CUBIE_DIM = 1;
export const STICKER_PADDING = 0.05;
export const STICKER_THICKNESS = 0.02;  // max value: 1
export const STICKER_MATERIALS = [
    new THREE.MeshBasicMaterial({ color: "red" }),             // +X face
    new THREE.MeshBasicMaterial({ color: 0xff8c00 }),          // -X face
    new THREE.MeshBasicMaterial({ color: 0xffff33 }),          // +Y face
    new THREE.MeshBasicMaterial({ color: "white" }),           // -Y face
    new THREE.MeshBasicMaterial({ color: "blue" }),            // +Z face
    new THREE.MeshBasicMaterial({ color: "green" })            // -Z face
];
export const BLACK_MATERIAL = new THREE.MeshBasicMaterial({ color: "black" });
