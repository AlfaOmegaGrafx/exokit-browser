import {Vector2, Vector3, Quaternion, Transform} from './Unity.js';

const identityRotation = new Quaternion();
const downHalfRotation = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI/2);
const upHalfRotation = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI/2);
const downQuarterRotation = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI/4);

const _mod = (a, n) => (a % n + n) % n;
const _angleDiff = (targetA, sourceA) => {
  let a = targetA - sourceA;
  a = _mod((a + Math.PI), Math.PI*2) - Math.PI;
  return a;
};

class Leg {
  constructor() {
  	this.transform = new Transform();
    this.upperLeg = new Transform();
    this.lowerLeg = new Transform();
    this.foot = new Transform();
    this.foot.stickTransform = new Transform();

    this.transform.AddChild(this.upperLeg);
    this.upperLeg.AddChild(this.lowerLeg);
    this.lowerLeg.AddChild(this.foot);

    this.upperLegLength = 0;
    this.lowerLegLength = 0;

    this.left = true;
    this.standing = true;

    this.poseManager = null;
  }

  Start() {
    this.foot.stickTransform.position = this.foot.position;
    this.upperLegLength = this.lowerLeg.localPosition.length();
    this.lowerLegLength = this.foot.localPosition.length();
    this.legLength = this.upperLegLength + this.lowerLegLength;
  }

  Update() {
  	// const hipsDirection = new Vector3(0, 0, 1).applyQuaternion(this.transform.rotation);
  	// const hipsY = Math.atan2(hipsDirection.z, hipsDirection.x);
  	/* if (hipsY > Math.PI) {
  		hipsY -= Math.PI;
  	}
  	if (hipsY < Math.PI) {
  		hipsY += Math.PI;
  	} */

  	/* const upperLegDirection = new Vector3(0, 0, 1).applyQuaternion(this.upperLeg.rotation);
  	const upperLegY = Math.atan2(upperLegDirection.z, upperLegDirection.x);
    const legDiff = this.foot.position.sub(this.transform.position);
		const footEuler = new THREE.Euler(0, upperLegY - Math.PI/2, 0, 'YXZ'); */

		/* const footEuler = new THREE.Euler().setFromQuaternion(this.foot.rotation.multiply(new Quaternion().setFromUnitVectors(new Vector3(0, -1, 0), new Vector3(0, 0, 1)).inverse()), 'YXZ');
    footEuler.x = 0;
    footEuler.z = 0; */

		/* let angleDiff = (() => {
			let a = hipsY;
			let b = upperLegY;
			let d = _angleDiff(a, b);
			return d;
		})();
		if (this.left) {
			angleDiff *= -1;
		}
		if (angleDiff < -Math.PI/3) {
			if (this.left) {
				// debugger;
				// console.log('correct 1', hipsY, upperLegY, angleDiff);
				// debugger;
				footEuler.y += Math.PI/3;
			} else {
				footEuler.y -= Math.PI/3;
			}
		} else if (angleDiff > Math.PI/8) {
			if (this.left) {
				// debugger;
				// console.log('correct 2', hipsY, upperLegY, angleDiff);
				// debugger;
				footEuler.y -= Math.PI/8;
			} else {
				footEuler.y += Math.PI/8;
			}
		} */

    const footPosition = this.foot.stickTransform.position;
    const {upperLegLength, lowerLegLength, legLength} = this;
    const g = this.upperLeg.position.add(footPosition.clone().sub(this.upperLeg.position).normalize().multiplyScalar(legLength));
    if (g.y <= 0) {
      footPosition.y = 0;
      const footRotation = this.foot.stickTransform.rotation;

	    const hypotenuseDistance = upperLegLength;
	    const verticalDistance = Math.abs(this.upperLeg.position.y) / 2;
      const offsetDistance = hypotenuseDistance > verticalDistance ? Math.sqrt(hypotenuseDistance*hypotenuseDistance - verticalDistance*verticalDistance) : 0;
      const offsetDirection = footPosition.clone().sub(this.upperLeg.position)
        .cross(new Vector3(1, 0, 0).applyQuaternion(footRotation))
        .normalize();

      const lowerLegPosition = this.upperLeg.position.add(footPosition).divideScalar(2)
        .add(offsetDirection.clone().multiplyScalar(offsetDistance));

      const upperLegDiff = this.upperLeg.position.sub(lowerLegPosition);
      const upperLegRotation = new Quaternion().setFromRotationMatrix(
	      new THREE.Matrix4().lookAt(
	        new Vector3(),
	        upperLegDiff,
	        new Vector3(0, 0, 1).applyQuaternion(footRotation)
	      )
	    ).multiply(downHalfRotation);
      this.upperLeg.rotation = upperLegRotation;

		  const lowerLegDiff = lowerLegPosition.clone().sub(footPosition);
      const lowerLegRotation = new Quaternion().setFromRotationMatrix(
	      new THREE.Matrix4().lookAt(
	        new Vector3(),
	        lowerLegDiff,
	        new Vector3(0, 0, 1).applyQuaternion(footRotation)
	      )
	    ).multiply(downHalfRotation);
	    this.lowerLeg.rotation = lowerLegRotation;

      // this.lowerLeg.position = lowerLegPosition;

      // this.foot.position = footPosition;
      this.foot.rotation = footRotation.multiply(downHalfRotation);

      this.standing = true;
      // this.foot.stickTransform.position = footPosition;
    } else {
    	this.upperLeg.localRotation = this.upperLeg.localRotation.slerp(identityRotation, 0.1);
    	this.lowerLeg.localRotation = this.lowerLeg.localRotation.slerp(identityRotation, 0.1);
    	this.foot.localRotation = this.foot.localRotation.slerp(downQuarterRotation, 0.1);

      this.standing = false;
    }
	}
}

class LegsManager {
	constructor(rig) {
    this.hips = rig.shoulderTransforms.hips;
    this.leftLeg = new Leg();
    this.hips.AddChild(this.leftLeg.transform);
    this.rightLeg = new Leg();
    this.hips.AddChild(this.rightLeg.transform);

    this.rightLeg.foot.stickTransform.position = this.rightLeg.foot.position;
    this.rightLeg.left = false;

    this.poseManager = rig.poseManager;
    this.leftLeg.poseManager = this.poseManager;
    this.rightLeg.poseManager = this.poseManager;
  }

  Start() {
  	this.legSeparation = this.leftLeg.upperLeg.position.distanceTo(this.rightLeg.upperLeg.position);
  	this.leftLeg.Start();
  	this.rightLeg.Start();
  }

	Update() {
    const hipsFloorPosition = this.hips.position;
    hipsFloorPosition.y = 0;
    const hipsFloorEuler = new THREE.Euler().setFromQuaternion(this.hips.rotation, 'YXZ');
    hipsFloorEuler.x = 0;
    hipsFloorEuler.z = 0;
    const hipsFloorRotation = new Quaternion().setFromEuler(hipsFloorEuler);
    const planeMatrix = new THREE.Matrix4().compose(hipsFloorPosition, hipsFloorRotation, Vector3.one);
    const planeMatrixInverse = new THREE.Matrix4().getInverse(planeMatrix);

    const position = new Vector3();
    const quaternion = new Quaternion();
    const scale = new Vector3();
    new THREE.Matrix4().compose(this.leftLeg.foot.stickTransform.position, this.leftLeg.foot.stickTransform.rotation, Vector3.one)
      .premultiply(planeMatrixInverse)
      .decompose(position, quaternion, scale);
    const leftFootPosition = position.clone();
    const leftFootRotation = quaternion.clone();

    new THREE.Matrix4().compose(this.rightLeg.foot.stickTransform.position, this.rightLeg.foot.stickTransform.rotation, Vector3.one)
      .premultiply(planeMatrixInverse)
      .decompose(position, quaternion, scale);
    const rightFootPosition = position.clone();
    const rightFootRotation = quaternion.clone();

    // rotation

    if (this.leftLeg.standing) {
      const leftFootEuler = new THREE.Euler().setFromQuaternion(leftFootRotation, 'YXZ');
      leftFootEuler.x = 0;
	    leftFootEuler.z = 0;
    	if (leftFootEuler.y < -Math.PI*0.15) {
    		leftFootEuler.y = -Math.PI*0.15;
    	}
    	if (leftFootEuler.y > Math.PI*0.15) {
    		leftFootEuler.y = Math.PI*0.15;
    	}
    	new THREE.Matrix4().compose(Vector3.zero, new Quaternion().setFromEuler(leftFootEuler), Vector3.one)
	      .premultiply(planeMatrix)
	      .decompose(position, quaternion, scale);
  		this.leftLeg.foot.stickTransform.rotation = quaternion;
    } else {
    	this.leftLeg.foot.stickTransform.rotation = this.leftLeg.foot.rotation.multiply(upHalfRotation);
    }
    if (this.rightLeg.standing) {
	    const rightFootEuler = new THREE.Euler().setFromQuaternion(rightFootRotation, 'YXZ');
	    rightFootEuler.x = 0;
	    rightFootEuler.z = 0;
    	if (rightFootEuler.y < -Math.PI*0.15) {
    		rightFootEuler.y = -Math.PI*0.15;
    	}
    	if (rightFootEuler.y > Math.PI*0.15) {
    		rightFootEuler.y = Math.PI*0.15;
    	}
    	new THREE.Matrix4().compose(Vector3.zero, new Quaternion().setFromEuler(rightFootEuler), Vector3.one)
	      .premultiply(planeMatrix)
	      .decompose(position, quaternion, scale);
  		this.rightLeg.foot.stickTransform.rotation = quaternion;
	  } else {
      this.rightLeg.foot.stickTransform.rotation = this.rightLeg.foot.rotation.multiply(upHalfRotation);
	  }

	  // position

    if (this.leftLeg.standing) {
    	let leftFootDistance = Math.sqrt(leftFootPosition.x*leftFootPosition.x + leftFootPosition.z*leftFootPosition.z);
			const leftFootAngle = Math.atan2(leftFootPosition.clone().normalize().z, leftFootPosition.clone().normalize().x);
			const leftAngleDiff = _angleDiff(Math.PI/2, leftFootAngle);
			if (leftFootDistance < this.legSeparation*0.7 || leftFootDistance > this.legSeparation*3 || leftAngleDiff > -Math.PI*0.3 || leftAngleDiff < -Math.PI/2-Math.PI*0.3) {
				leftFootDistance = Math.min(Math.max(leftFootDistance, this.legSeparation*0.7), this.legSeparation*1.4);
				this.leftLeg.foot.stickTransform.position = hipsFloorPosition.clone().add(new Vector3(-leftFootDistance, 0, 0).applyQuaternion(this.leftLeg.foot.stickTransform.rotation));
			}
		} else {
			const footPosition = this.leftLeg.foot.position;
			footPosition.y = 0;
			this.leftLeg.foot.stickTransform.position = footPosition;
		}
		if (this.rightLeg.standing) {
			let rightFootDistance = Math.sqrt(rightFootPosition.x*rightFootPosition.x + rightFootPosition.z*rightFootPosition.z);
			const rightFootAngle = Math.atan2(rightFootPosition.clone().normalize().z, rightFootPosition.clone().normalize().x);
			const rightAngleDiff = _angleDiff(Math.PI/2, rightFootAngle);
	    if (rightFootDistance < this.legSeparation*0.7 || rightFootDistance > this.legSeparation*3 || rightAngleDiff < Math.PI*0.3 || rightAngleDiff > Math.PI/2+Math.PI*0.3) {
				rightFootDistance = Math.min(Math.max(rightFootDistance, this.legSeparation*0.7), this.legSeparation*1.4);
			  this.rightLeg.foot.stickTransform.position = hipsFloorPosition.clone().add(new Vector3(rightFootDistance, 0, 0).applyQuaternion(this.rightLeg.foot.stickTransform.rotation));
			}
		} else {
			const footPosition = this.rightLeg.foot.position;
			footPosition.y = 0;
			this.rightLeg.foot.stickTransform.position = footPosition;
		}

		this.leftLeg.Update();
		this.rightLeg.Update();
  }
}

export default LegsManager;
