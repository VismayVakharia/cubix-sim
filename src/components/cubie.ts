import * as THREE from 'three';
import * as Constants from './constants';


export class Cubie{
    cube_size: THREE.Vector3
    colors: Array<boolean>
    visual: THREE.Object3D
    geometries: Array<THREE.BufferGeometry>

    constructor(position: THREE.Vector3, orientation: THREE.Quaternion, cube_size: THREE.Vector3) {
        this.cube_size = cube_size;
        this.colors = [false, false, false, false, false, false];
        this.calculate_colors(position);

        this.visual = new THREE.Object3D();
        this.visual.position.set(position.x, position.y, position.z);
        this.visual.quaternion.set(orientation.x, orientation.y, orientation.z, orientation.w);

        const size = Constants.CUBIE_DIM - Constants.STICKER_PADDING * 2;
        const sticker_geometry = new THREE.BoxGeometry(size, size, Constants.STICKER_THICKNESS);

        // add black background cubie
        const base_geometry = new THREE.BoxGeometry(1, 1, 1);
        const base_cubie = new THREE.Mesh(base_geometry, Constants.BLACK_MATERIAL);
        // base_cubie.position.set(0, 0, 0);
        this.visual.add(base_cubie);
        const axes = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
        for (let index = 0; index < axes.length; index++) {
            const element = axes[index];
            if (!this.colors[index]) continue;
            const sticker_material = Constants.STICKER_MATERIALS[index];
            sticker_material.side = THREE.FrontSide;
            const sticker = new THREE.Mesh(sticker_geometry, sticker_material);
            sticker.lookAt(new THREE.Vector3(...element));
            sticker.position.set(element[0], element[1], element[2]).multiplyScalar(Constants.CUBIE_DIM / 2 + Constants.STICKER_THICKNESS / 2);
            this.visual.add(sticker);
        }

        this.geometries = [base_geometry, sticker_geometry];
    }

    calculate_colors(solvedPosition: THREE.Vector3) {
        for (let index = 0; index < 3; index++) {
            if (Math.abs(solvedPosition.getComponent(index) - ((this.cube_size.getComponent(index) - 1) / 2)) < 1e-3) {
                this.colors[index * 2] = true;
            }
            if (Math.abs(solvedPosition.getComponent(index) + ((this.cube_size.getComponent(index) - 1) / 2)) < 1e-3) {
                this.colors[index * 2 + 1] = true;
            }
        }
    }
}
