import * as THREE from "three";
import { Cubie } from "./cubie";
import { range } from "./utils";

export class Cube {
    size: THREE.Vector3
    cubies: Array<Cubie>
    face_turns: { [id: string]: THREE.Vector3 } = {
        "R": new THREE.Vector3(1, 0, 0),
        "U": new THREE.Vector3(0, 1, 0),
        "F": new THREE.Vector3(0, 0, 1),
        "L": new THREE.Vector3(-1, 0, 0),
        "D": new THREE.Vector3(0, -1, 0),
        "B": new THREE.Vector3(0, 0, -1)
    }
    notation_map3x3: { [id: string]: string } = { "M": "NL", "E": "ND", "S": "NF", "X": "CR", "Y": "CU", "Z": "CF" }
    notation_map2x2: { [id: string]: string } = { "X": "CR", "Y": "CU", "Z": "CF" }

    constructor(size: THREE.Vector3) {
        this.size = size;
        this.cubies = [];

        const default_orientation = new THREE.Quaternion(0, 0, 0, 1);

        function is_inside(index: number, size: number): boolean {
            return (index > 0 && index < (size - 1))
        }

        for (let i = 0; i < size.x; i++) {
            for (let j = 0; j < size.y; j++) {
                for (let k = 0; k < size.z; k++) {
                    if (is_inside(i, size.x) && is_inside(j, size.y) && is_inside(k, size.z)) continue;
                    const position = new THREE.Vector3(i - (size.x - 1) / 2, j - (size.y - 1) / 2, k - (size.z - 1) / 2);
                    const cubie = new Cubie(position, default_orientation, this.size);
                    this.cubies.push(cubie);
                }
            }
        }
    }

    add_to_scene(scene: THREE.Scene) {
        this.cubies.forEach((cubie) => { scene.add(cubie.visual) })
    }

    rotate_layer(axis: THREE.Vector3, layer_index: number, angle: number) {
        // layer_index: starts from 1 to n from the direction of axis
        axis.normalize();

        const dist = (Math.abs(this.size.dot(axis)) - 1) / 2;

        for (let index = 0; index < this.cubies.length; index++) {
            const element = this.cubies[index];
            if (Math.abs((dist - element.visual.position.dot(axis) + 1) - layer_index) < 1e-6) {
                element.visual.rotateOnWorldAxis(axis, angle)
                element.visual.position.applyAxisAngle(axis, angle)
            }
        }
    }

    rotate(move: string, angle: number) {
        // @move: should only be standard notation of face turns

        let multiplier = -1;
        if (move.slice(move.length - 1) == "'") {
            multiplier = 1;
            move = move.slice(0, move.length - 1)
        } else if (move.slice(move.length - 1) == "2") {
            multiplier = 2;
            move = move.slice(0, move.length - 1)
        }
        const axis = this.face_turns[move.slice(move.length - 1)]
        move = move.slice(0, move.length - 1)

        const layers: number[] = []
        if (move.length == 0) {
            // face rotation only
            layers.push(1)
        } else if (move[0] == "C") {
            // cube rotation
            layers.push(...range(1, Math.abs(this.size.dot(axis)) + 1))
        } else if (move[0] == "T") {
            // tier rotation
            layers.push(1)
            move = move.slice(1, move.length)
            if (move.length == 0) {
                layers.push(2)
            } else {
                layers.concat(range(2, Number(move) + 1))
            }
        } else if (move[0] == "N") {
            // numbered rotations
            move = move.slice(1, move.length)
            if (move.length == 0) {
                layers.push(2)
            } else if (!move.includes("-")) {
                layers.push(Number(move))
            } else {
                const splits = move.split("-")
                layers.concat(range(Number(splits[0]), Number(splits[1]) + 1))
            }
        }

        layers.forEach((l) => this.rotate_layer(axis, l, angle * multiplier))
    }

    rotateNxN(move: string, angle: number) {
        let mapped_move: string;
        if (this.notation_map2x2[move[0]] !== undefined) {
            mapped_move = this.notation_map2x2[move[0]] + move.slice(1, move.length)
        } else {
            mapped_move = move
        }
        this.rotate(mapped_move, angle)
    }

    rotate3x3(move: string, angle: number) {
        let mapped_move: string;
        if (this.face_turns[move[0]] !== undefined) {
            mapped_move = move
        } else if (this.face_turns[move[0].toUpperCase()] !== undefined) {
            mapped_move = "T" + move[0].toUpperCase() + move.slice(1, move.length)
        } else if (this.notation_map3x3[move[0]] !== undefined) {
            mapped_move = this.notation_map3x3[move[0]] + move.slice(1, move.length)
        } else {
            throw new Error("Invalid rotation input")
        }
        this.rotate(mapped_move, angle)
    }

    rotate2x2(move: string, angle: number) {
        let mapped_move: string;
        if (this.face_turns[move[0]] !== undefined) {
            mapped_move = move
        } else if (this.notation_map2x2[move[0]] !== undefined) {
            mapped_move = this.notation_map2x2[move[0]] + move.slice(1, move.length)
        } else {
            throw new Error("Invalid rotation input")
        }
        this.rotate(mapped_move, angle)
    }

    rotate1x1(move: string, angle: number) {
        let mapped_move: string;
        if (this.notation_map2x2[move[0]] !== undefined) {
            mapped_move = this.notation_map2x2[move[0]] + move.slice(1, move.length)
        } else {
            throw new Error("Invalid rotation input")
        }
        this.rotate(mapped_move, angle)
    }
}
