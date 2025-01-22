import * as THREE from 'three'

export function debug_vector(start_vec: THREE.Vector3, end_vec: THREE.Vector3, color: string = "magenta", scene: THREE.Scene) {
    const geometry = new THREE.BufferGeometry().setFromPoints([ start_vec, end_vec ]);
    const material = new THREE.LineBasicMaterial( { color: color } );
    const line = new THREE.Line( geometry, material );
    scene.add( line );
}

export function range(start: number, end: number): number[] {
    return Array.from({length: end - start}, (v, k) => k + start)
}
