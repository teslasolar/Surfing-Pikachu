// 3D Models - Procedural characters and Surfboard
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// Color palette
const Colors = {
    pikachuYellow: 0xffd700,
    pikachuCheeks: 0xff6b6b,
    pikachuDark: 0x2a2a2a,
    pikachuNose: 0x1a1a1a,
    surfboard: 0x8b4513,
    surfboardStripe: 0xffd700,
    eyeWhite: 0xffffff,
    // Squirtle colors
    squirtleBlue: 0x6890f0,
    squirtleBelly: 0xf8f8d8,
    squirtleShell: 0xc4a484,
    squirtleShellInner: 0x8b7355,
    // Charmander colors
    charmanderOrange: 0xff6b35,
    charmanderBelly: 0xfff4b8,
    charmanderFlame: 0xff4500,
    charmanderFlameInner: 0xffff00,
    // Konomimon colors
    konomimonPurple: 0x9b59b6,
    konomimonAccent: 0x00ffff,
    konomimonGlow: 0x00ff88
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

// Create Squirtle mesh
function createSquirtle() {
    const group = new THREE.Group();

    // Materials
    const blueMat = new THREE.MeshToonMaterial({ color: Colors.squirtleBlue });
    const bellyMat = new THREE.MeshToonMaterial({ color: Colors.squirtleBelly });
    const shellMat = new THREE.MeshToonMaterial({ color: Colors.squirtleShell });
    const shellInnerMat = new THREE.MeshToonMaterial({ color: Colors.squirtleShellInner });
    const darkMat = new THREE.MeshToonMaterial({ color: Colors.pikachuDark });
    const whiteMat = new THREE.MeshToonMaterial({ color: Colors.eyeWhite });
    const redMat = new THREE.MeshToonMaterial({ color: 0x8b0000 });

    // Shell (back)
    const shellGeo = new THREE.SphereGeometry(1.3, 16, 12);
    shellGeo.scale(1, 1.1, 0.8);
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.position.set(0, 1.5, -0.3);
    group.add(shell);

    // Shell inner pattern
    const shellInnerGeo = new THREE.SphereGeometry(1.1, 16, 12);
    shellInnerGeo.scale(1, 1, 0.6);
    const shellInner = new THREE.Mesh(shellInnerGeo, shellInnerMat);
    shellInner.position.set(0, 1.5, -0.35);
    group.add(shellInner);

    // Body front
    const bodyGeo = new THREE.SphereGeometry(1, 16, 12);
    bodyGeo.scale(0.9, 1.1, 0.8);
    const body = new THREE.Mesh(bodyGeo, blueMat);
    body.position.y = 1.5;
    group.add(body);

    // Belly
    const bellyGeo = new THREE.SphereGeometry(0.7, 12, 10);
    bellyGeo.scale(1, 1.1, 0.5);
    const belly = new THREE.Mesh(bellyGeo, bellyMat);
    belly.position.set(0, 1.4, 0.5);
    group.add(belly);

    // Head
    const headGeo = new THREE.SphereGeometry(0.9, 16, 12);
    headGeo.scale(1.1, 0.9, 1);
    const head = new THREE.Mesh(headGeo, blueMat);
    head.position.y = 3.0;
    group.add(head);

    // Eyes
    [-1, 1].forEach(side => {
        // Eye white
        const eyeGeo = new THREE.SphereGeometry(0.25, 12, 8);
        const eye = new THREE.Mesh(eyeGeo, whiteMat);
        eye.position.set(side * 0.4, 3.15, 0.7);
        group.add(eye);

        // Pupil (red for Squirtle)
        const pupilGeo = new THREE.SphereGeometry(0.15, 10, 8);
        const pupil = new THREE.Mesh(pupilGeo, redMat);
        pupil.position.set(side * 0.4, 3.15, 0.85);
        group.add(pupil);

        // Shine
        const shineGeo = new THREE.SphereGeometry(0.05, 8, 6);
        const shine = new THREE.Mesh(shineGeo, whiteMat);
        shine.position.set(side * 0.35, 3.2, 0.92);
        group.add(shine);
    });

    // Mouth
    const mouthCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.2, 2.7, 0.85),
        new THREE.Vector3(0, 2.6, 0.9),
        new THREE.Vector3(0.2, 2.7, 0.85)
    );
    const mouthGeo = new THREE.TubeGeometry(mouthCurve, 8, 0.03, 6, false);
    const mouth = new THREE.Mesh(mouthGeo, darkMat);
    group.add(mouth);

    // Tail (curly)
    const tailGeo = new THREE.TorusGeometry(0.4, 0.15, 8, 12, Math.PI * 1.2);
    const tail = new THREE.Mesh(tailGeo, blueMat);
    tail.position.set(0, 1.2, -1.1);
    tail.rotation.x = Math.PI / 2;
    tail.rotation.z = -0.5;
    group.add(tail);

    // Arms
    const armGeo = new THREE.CapsuleGeometry(0.18, 0.5, 4, 8);
    [-1, 1].forEach(side => {
        const arm = new THREE.Mesh(armGeo, blueMat);
        arm.position.set(side * 1.0, 1.8, 0.2);
        arm.rotation.z = side * 0.7;
        arm.rotation.x = -0.2;
        group.add(arm);
    });

    // Feet
    const footGeo = new THREE.SphereGeometry(0.3, 10, 8);
    footGeo.scale(1.3, 0.5, 1.5);
    [-1, 1].forEach(side => {
        const foot = new THREE.Mesh(footGeo, blueMat);
        foot.position.set(side * 0.5, 0.25, 0.3);
        group.add(foot);
    });

    group.scale.set(0.4, 0.4, 0.4);
    return group;
}

// Create Charmander mesh
function createCharmander() {
    const group = new THREE.Group();

    // Materials
    const orangeMat = new THREE.MeshToonMaterial({ color: Colors.charmanderOrange });
    const bellyMat = new THREE.MeshToonMaterial({ color: Colors.charmanderBelly });
    const darkMat = new THREE.MeshToonMaterial({ color: Colors.pikachuDark });
    const whiteMat = new THREE.MeshToonMaterial({ color: Colors.eyeWhite });
    const flameMat = new THREE.MeshToonMaterial({ color: Colors.charmanderFlame });
    const flameInnerMat = new THREE.MeshToonMaterial({ color: Colors.charmanderFlameInner });

    // Body
    const bodyGeo = new THREE.SphereGeometry(1.1, 16, 12);
    bodyGeo.scale(0.9, 1.2, 0.85);
    const body = new THREE.Mesh(bodyGeo, orangeMat);
    body.position.y = 1.5;
    group.add(body);

    // Belly
    const bellyGeo = new THREE.SphereGeometry(0.75, 12, 10);
    bellyGeo.scale(1, 1.1, 0.5);
    const belly = new THREE.Mesh(bellyGeo, bellyMat);
    belly.position.set(0, 1.4, 0.5);
    group.add(belly);

    // Head
    const headGeo = new THREE.SphereGeometry(0.95, 16, 12);
    headGeo.scale(1.1, 0.95, 1);
    const head = new THREE.Mesh(headGeo, orangeMat);
    head.position.y = 3.1;
    group.add(head);

    // Snout
    const snoutGeo = new THREE.SphereGeometry(0.35, 10, 8);
    snoutGeo.scale(1, 0.7, 1.2);
    const snout = new THREE.Mesh(snoutGeo, orangeMat);
    snout.position.set(0, 2.85, 0.75);
    group.add(snout);

    // Eyes
    [-1, 1].forEach(side => {
        const eyeGeo = new THREE.SphereGeometry(0.22, 12, 8);
        const eye = new THREE.Mesh(eyeGeo, whiteMat);
        eye.position.set(side * 0.45, 3.25, 0.65);
        group.add(eye);

        const pupilGeo = new THREE.SphereGeometry(0.14, 10, 8);
        const pupil = new THREE.Mesh(pupilGeo, darkMat);
        pupil.position.set(side * 0.45, 3.25, 0.8);
        group.add(pupil);

        const shineGeo = new THREE.SphereGeometry(0.05, 8, 6);
        const shine = new THREE.Mesh(shineGeo, whiteMat);
        shine.position.set(side * 0.4, 3.3, 0.87);
        group.add(shine);
    });

    // Nostrils
    [-1, 1].forEach(side => {
        const nostrilGeo = new THREE.SphereGeometry(0.05, 6, 6);
        const nostril = new THREE.Mesh(nostrilGeo, darkMat);
        nostril.position.set(side * 0.12, 2.9, 0.95);
        group.add(nostril);
    });

    // Mouth
    const mouthCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.25, 2.65, 0.85),
        new THREE.Vector3(0, 2.55, 0.9),
        new THREE.Vector3(0.25, 2.65, 0.85)
    );
    const mouthGeo = new THREE.TubeGeometry(mouthCurve, 8, 0.03, 6, false);
    const mouth = new THREE.Mesh(mouthGeo, darkMat);
    group.add(mouth);

    // Tail with flame
    const tailGeo = new THREE.ConeGeometry(0.25, 1.2, 8);
    const tail = new THREE.Mesh(tailGeo, orangeMat);
    tail.position.set(0, 1.0, -1.0);
    tail.rotation.x = -0.8;
    group.add(tail);

    // Flame outer
    const flameGeo = new THREE.ConeGeometry(0.25, 0.6, 8);
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(0, 0.8, -1.5);
    flame.rotation.x = -0.3;
    group.add(flame);

    // Flame inner
    const flameInnerGeo = new THREE.ConeGeometry(0.12, 0.4, 8);
    const flameInner = new THREE.Mesh(flameInnerGeo, flameInnerMat);
    flameInner.position.set(0, 0.85, -1.45);
    flameInner.rotation.x = -0.3;
    group.add(flameInner);

    // Arms
    const armGeo = new THREE.CapsuleGeometry(0.18, 0.5, 4, 8);
    [-1, 1].forEach(side => {
        const arm = new THREE.Mesh(armGeo, orangeMat);
        arm.position.set(side * 1.0, 1.8, 0.2);
        arm.rotation.z = side * 0.7;
        arm.rotation.x = -0.2;
        group.add(arm);
    });

    // Feet with claws
    const footGeo = new THREE.SphereGeometry(0.3, 10, 8);
    footGeo.scale(1.2, 0.5, 1.4);
    [-1, 1].forEach(side => {
        const foot = new THREE.Mesh(footGeo, orangeMat);
        foot.position.set(side * 0.5, 0.25, 0.3);
        group.add(foot);
    });

    group.scale.set(0.4, 0.4, 0.4);
    return group;
}

// Create Konomimon mesh (AI/3D printing mascot - futuristic robot creature)
function createKonomimon() {
    const group = new THREE.Group();

    // Materials
    const purpleMat = new THREE.MeshToonMaterial({ color: Colors.konomimonPurple });
    const accentMat = new THREE.MeshToonMaterial({ color: Colors.konomimonAccent });
    const glowMat = new THREE.MeshToonMaterial({
        color: Colors.konomimonGlow,
        emissive: Colors.konomimonGlow,
        emissiveIntensity: 0.3
    });
    const darkMat = new THREE.MeshToonMaterial({ color: Colors.pikachuDark });
    const whiteMat = new THREE.MeshToonMaterial({ color: Colors.eyeWhite });
    const metalMat = new THREE.MeshToonMaterial({ color: 0x888899 });

    // Body (geometric/robotic)
    const bodyGeo = new THREE.CylinderGeometry(0.9, 1.1, 2, 8);
    const body = new THREE.Mesh(bodyGeo, purpleMat);
    body.position.y = 1.5;
    group.add(body);

    // Body ring accent
    const ringGeo = new THREE.TorusGeometry(1.0, 0.08, 8, 16);
    const ring = new THREE.Mesh(ringGeo, accentMat);
    ring.position.y = 1.5;
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    // Chest glow panel
    const panelGeo = new THREE.BoxGeometry(0.6, 0.8, 0.1);
    const panel = new THREE.Mesh(panelGeo, glowMat);
    panel.position.set(0, 1.5, 0.55);
    group.add(panel);

    // Head (rounded cube shape)
    const headGeo = new THREE.BoxGeometry(1.6, 1.4, 1.4);
    headGeo.translate(0, 0, 0);
    const head = new THREE.Mesh(headGeo, purpleMat);
    head.position.y = 3.2;
    group.add(head);

    // Visor (single glowing eye band)
    const visorGeo = new THREE.BoxGeometry(1.4, 0.35, 0.2);
    const visor = new THREE.Mesh(visorGeo, glowMat);
    visor.position.set(0, 3.3, 0.65);
    group.add(visor);

    // Antenna
    const antennaGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8);
    const antenna = new THREE.Mesh(antennaGeo, metalMat);
    antenna.position.set(0, 4.2, 0);
    group.add(antenna);

    // Antenna tip (glowing)
    const antennaTipGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const antennaTip = new THREE.Mesh(antennaTipGeo, glowMat);
    antennaTip.position.set(0, 4.55, 0);
    group.add(antennaTip);

    // Side head fins
    [-1, 1].forEach(side => {
        const finGeo = new THREE.BoxGeometry(0.15, 0.6, 0.4);
        const fin = new THREE.Mesh(finGeo, accentMat);
        fin.position.set(side * 0.9, 3.4, -0.2);
        fin.rotation.z = side * -0.3;
        group.add(fin);
    });

    // Arms (robotic)
    [-1, 1].forEach(side => {
        // Upper arm
        const upperArmGeo = new THREE.CylinderGeometry(0.15, 0.18, 0.6, 8);
        const upperArm = new THREE.Mesh(upperArmGeo, purpleMat);
        upperArm.position.set(side * 1.1, 2.0, 0);
        upperArm.rotation.z = side * 0.5;
        group.add(upperArm);

        // Joint
        const jointGeo = new THREE.SphereGeometry(0.15, 8, 8);
        const joint = new THREE.Mesh(jointGeo, metalMat);
        joint.position.set(side * 1.3, 1.7, 0);
        group.add(joint);

        // Lower arm
        const lowerArmGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.5, 8);
        const lowerArm = new THREE.Mesh(lowerArmGeo, purpleMat);
        lowerArm.position.set(side * 1.4, 1.3, 0.2);
        lowerArm.rotation.z = side * 0.3;
        lowerArm.rotation.x = -0.3;
        group.add(lowerArm);

        // Hand (claw/gripper)
        const handGeo = new THREE.BoxGeometry(0.2, 0.25, 0.15);
        const hand = new THREE.Mesh(handGeo, accentMat);
        hand.position.set(side * 1.45, 1.0, 0.35);
        group.add(hand);
    });

    // Legs/feet (hover pads)
    [-1, 1].forEach(side => {
        const legGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.4, 8);
        const leg = new THREE.Mesh(legGeo, purpleMat);
        leg.position.set(side * 0.5, 0.35, 0);
        group.add(leg);

        // Hover pad (glowing)
        const padGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.1, 12);
        const pad = new THREE.Mesh(padGeo, glowMat);
        pad.position.set(side * 0.5, 0.1, 0);
        group.add(pad);
    });

    // Back thrusters
    const thrusterGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.4, 8);
    [-0.4, 0.4].forEach(x => {
        const thruster = new THREE.Mesh(thrusterGeo, metalMat);
        thruster.position.set(x, 1.3, -0.7);
        thruster.rotation.x = 0.3;
        group.add(thruster);
    });

    group.scale.set(0.38, 0.38, 0.38);
    return group;
}

// Create Surfboard mesh with customizable stripe color
function createSurfboard(stripeColor = Colors.surfboardStripe) {
    const group = new THREE.Group();

    // Main board
    const boardGeo = new THREE.CapsuleGeometry(0.3, 2.5, 8, 16);
    boardGeo.rotateZ(Math.PI / 2);
    boardGeo.scale(1, 0.15, 0.6);

    const boardMat = new THREE.MeshToonMaterial({ color: Colors.surfboard });
    const board = new THREE.Mesh(boardGeo, boardMat);
    group.add(board);

    // Stripe with custom color
    const stripeGeo = new THREE.BoxGeometry(2.0, 0.08, 0.35);
    const stripeMat = new THREE.MeshToonMaterial({ color: stripeColor });
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

// Combined Pikachu on Surfboard (legacy, use createSurfingCharacter instead)
function createSurfingPikachu() {
    return createSurfingCharacter('pikachu');
}

// Character creation functions map
const characterCreators = {
    pikachu: createPikachu,
    squirtle: createSquirtle,
    charmander: createCharmander,
    konomimon: createKonomimon
};

// Surfboard stripe colors per character
const surfboardColors = {
    pikachu: 0xffd700,
    squirtle: 0x6890f0,
    charmander: 0xff6b35,
    konomimon: 0x00ffff
};

// Create any character on surfboard by ID
function createSurfingCharacter(characterId = 'pikachu') {
    const group = new THREE.Group();

    // Create surfboard with character-specific stripe color
    const surfboard = createSurfboard(surfboardColors[characterId] || Colors.surfboardStripe);
    surfboard.position.y = 0;
    group.add(surfboard);

    // Create character
    const createChar = characterCreators[characterId] || createPikachu;
    const character = createChar();
    character.position.y = 0.15;
    character.position.z = 0.1;
    group.add(character);

    // Add userData for animation access
    group.userData.character = character;
    group.userData.surfboard = surfboard;
    group.userData.characterId = characterId;

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

export {
    createPikachu,
    createSquirtle,
    createCharmander,
    createKonomimon,
    createSurfboard,
    createSurfingPikachu,
    createSurfingCharacter,
    createSplashParticles,
    Colors
};
