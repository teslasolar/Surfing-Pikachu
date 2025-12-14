// 3D Models - Procedural Pikachu and Surfboard
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// Color palette
const Colors = {
    pikachuYellow: 0xffd700,
    pikachuCheeks: 0xff6b6b,
    pikachuDark: 0x2a2a2a,
    pikachuNose: 0x1a1a1a,
    surfboard: 0x8b4513,
    surfboardStripe: 0xffd700,
    eyeWhite: 0xffffff
};

// Create Pikachu mesh
function createPikachu() {
    const group = new THREE.Group();

    // Materials
    const yellowMat = new THREE.MeshToonMaterial({ color: Colors.pikachuYellow });
    const darkMat = new THREE.MeshToonMaterial({ color: Colors.pikachuDark });
    const cheekMat = new THREE.MeshToonMaterial({ color: Colors.pikachuCheeks });
    const whiteMat = new THREE.MeshToonMaterial({ color: Colors.eyeWhite });

    // Body
    const bodyGeo = new THREE.SphereGeometry(1.2, 16, 12);
    bodyGeo.scale(1, 1.2, 0.9);
    const body = new THREE.Mesh(bodyGeo, yellowMat);
    body.position.y = 1.5;
    group.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(1, 16, 12);
    headGeo.scale(1.1, 0.9, 0.95);
    const head = new THREE.Mesh(headGeo, yellowMat);
    head.position.y = 3.2;
    group.add(head);

    // Ears
    const earGeo = new THREE.ConeGeometry(0.35, 1.4, 8);
    [-1, 1].forEach(side => {
        const ear = new THREE.Mesh(earGeo, yellowMat);
        ear.position.set(side * 0.6, 4.3, 0);
        ear.rotation.z = side * -0.4;
        group.add(ear);

        // Ear tip (black)
        const tipGeo = new THREE.ConeGeometry(0.2, 0.5, 8);
        const tip = new THREE.Mesh(tipGeo, darkMat);
        tip.position.set(side * 0.75, 4.9, 0);
        tip.rotation.z = side * -0.4;
        group.add(tip);
    });

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.22, 12, 8);
    const pupilGeo = new THREE.SphereGeometry(0.15, 10, 8);
    const shineGeo = new THREE.SphereGeometry(0.06, 8, 6);

    [-1, 1].forEach(side => {
        // Eye white
        const eye = new THREE.Mesh(eyeGeo, whiteMat);
        eye.position.set(side * 0.4, 3.35, 0.8);
        group.add(eye);

        // Pupil
        const pupil = new THREE.Mesh(pupilGeo, darkMat);
        pupil.position.set(side * 0.4, 3.35, 0.95);
        group.add(pupil);

        // Shine
        const shine = new THREE.Mesh(shineGeo, whiteMat);
        shine.position.set(side * 0.35, 3.4, 1.02);
        group.add(shine);
    });

    // Nose
    const noseGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const nose = new THREE.Mesh(noseGeo, darkMat);
    nose.position.set(0, 3.1, 0.95);
    group.add(nose);

    // Mouth (curved line using tube)
    const mouthCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.25, 2.9, 0.9),
        new THREE.Vector3(0, 2.75, 0.95),
        new THREE.Vector3(0.25, 2.9, 0.9)
    );
    const mouthGeo = new THREE.TubeGeometry(mouthCurve, 8, 0.03, 6, false);
    const mouth = new THREE.Mesh(mouthGeo, darkMat);
    group.add(mouth);

    // Cheeks
    const cheekGeo = new THREE.SphereGeometry(0.25, 10, 8);
    [-1, 1].forEach(side => {
        const cheek = new THREE.Mesh(cheekGeo, cheekMat);
        cheek.position.set(side * 0.85, 3.0, 0.6);
        cheek.scale.set(1, 0.8, 0.5);
        group.add(cheek);
    });

    // Tail (lightning bolt shape)
    const tailGroup = new THREE.Group();

    // Build lightning bolt from segments
    const tailMat = new THREE.MeshToonMaterial({ color: Colors.pikachuYellow });
    const tailBaseMat = new THREE.MeshToonMaterial({ color: 0xdaa520 });

    // Tail base
    const tailBaseGeo = new THREE.BoxGeometry(0.3, 0.8, 0.15);
    const tailBase = new THREE.Mesh(tailBaseGeo, tailBaseMat);
    tailBase.position.set(0, 0.4, 0);
    tailBase.rotation.z = 0.3;
    tailGroup.add(tailBase);

    // Lightning segments
    const seg1 = new THREE.BoxGeometry(0.8, 0.25, 0.12);
    const s1 = new THREE.Mesh(seg1, tailMat);
    s1.position.set(0.3, 0.8, 0);
    s1.rotation.z = -0.2;
    tailGroup.add(s1);

    const seg2 = new THREE.BoxGeometry(0.6, 0.25, 0.12);
    const s2 = new THREE.Mesh(seg2, tailMat);
    s2.position.set(0.5, 1.1, 0);
    s2.rotation.z = 0.8;
    tailGroup.add(s2);

    const seg3 = new THREE.BoxGeometry(0.7, 0.25, 0.12);
    const s3 = new THREE.Mesh(seg3, tailMat);
    s3.position.set(0.3, 1.5, 0);
    s3.rotation.z = -0.3;
    tailGroup.add(s3);

    // Tail tip
    const tipShape = new THREE.Shape();
    tipShape.moveTo(0, 0);
    tipShape.lineTo(0.5, 0.15);
    tipShape.lineTo(0.15, 0.4);
    tipShape.lineTo(0, 0);

    const tipExtrudeSettings = { depth: 0.1, bevelEnabled: false };
    const tailTipGeo = new THREE.ExtrudeGeometry(tipShape, tipExtrudeSettings);
    const tailTip = new THREE.Mesh(tailTipGeo, tailMat);
    tailTip.position.set(0.5, 1.6, -0.05);
    tailTip.rotation.z = -0.5;
    tailGroup.add(tailTip);

    tailGroup.position.set(-0.5, 1.0, -0.8);
    tailGroup.rotation.y = Math.PI;
    tailGroup.rotation.x = 0.2;
    group.add(tailGroup);

    // Arms (simple)
    const armGeo = new THREE.CapsuleGeometry(0.2, 0.6, 4, 8);
    [-1, 1].forEach(side => {
        const arm = new THREE.Mesh(armGeo, yellowMat);
        arm.position.set(side * 1.1, 1.8, 0.3);
        arm.rotation.z = side * 0.8;
        arm.rotation.x = -0.3;
        group.add(arm);
    });

    // Feet
    const footGeo = new THREE.SphereGeometry(0.35, 10, 8);
    footGeo.scale(1.2, 0.6, 1.4);
    [-1, 1].forEach(side => {
        const foot = new THREE.Mesh(footGeo, yellowMat);
        foot.position.set(side * 0.5, 0.3, 0.4);
        group.add(foot);
    });

    // Scale and position
    group.scale.set(0.4, 0.4, 0.4);

    return group;
}

// Create Surfboard mesh
function createSurfboard() {
    const group = new THREE.Group();

    // Main board
    const boardGeo = new THREE.CapsuleGeometry(0.3, 2.5, 8, 16);
    boardGeo.rotateZ(Math.PI / 2);
    boardGeo.scale(1, 0.15, 0.6);

    const boardMat = new THREE.MeshToonMaterial({ color: Colors.surfboard });
    const board = new THREE.Mesh(boardGeo, boardMat);
    group.add(board);

    // Stripe
    const stripeGeo = new THREE.BoxGeometry(2.0, 0.08, 0.35);
    const stripeMat = new THREE.MeshToonMaterial({ color: Colors.surfboardStripe });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.y = 0.05;
    group.add(stripe);

    // Fins
    const finGeo = new THREE.BoxGeometry(0.15, 0.2, 0.1);
    const finMat = new THREE.MeshToonMaterial({ color: 0x5d3a1a });

    [-0.5, 0, 0.5].forEach(x => {
        const fin = new THREE.Mesh(finGeo, finMat);
        fin.position.set(x, -0.12, -0.15);
        group.add(fin);
    });

    return group;
}

// Combined Pikachu on Surfboard
function createSurfingPikachu() {
    const group = new THREE.Group();

    const surfboard = createSurfboard();
    surfboard.position.y = 0;
    group.add(surfboard);

    const pikachu = createPikachu();
    pikachu.position.y = 0.15;
    pikachu.position.z = 0.1;
    group.add(pikachu);

    // Add userData for animation access
    group.userData.pikachu = pikachu;
    group.userData.surfboard = surfboard;

    return group;
}

// Splash particle system
function createSplashParticles(count = 50) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const lifetimes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        positions[i * 3] = 0;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = 0;
        lifetimes[i] = 0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));

    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.3,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    particles.userData.active = false;

    return particles;
}

export { createPikachu, createSurfboard, createSurfingPikachu, createSplashParticles, Colors };
