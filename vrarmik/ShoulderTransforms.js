import {Vector3, Transform, GameObject, MonoBehavior} from './Unity.js';
import ArmTransforms from './ArmTransforms.js';
import ShoulderPoser from './ShoulderPoser.js';
import VRArmIK from './VRArmIK.js';
import PoseManager from './PoseManager.js';


class ShoulderTransforms extends MonoBehavior
	{
		constructor(...args) {
      super(...args);

      this.hips = new Transform();
      this.spine = new Transform();
      this.spine.localPosition = new Vector3(-8.88181387016927e-16, 1.2409379290811984e-7, 7.45060786677687e-9);
      this.transform.localPosition = new Vector3(-1.3878628978259084e-10, 0.08719508121453046, -0.0038367719593098565);
      this.neck = new Transform();
      this.neck.localPosition = new Vector3(-3.122724325702129e-10, 0.1953215129534993, -0.028340029021169225);
      this.head = new Transform();
      this.head.localPosition = new Vector3(-1.089444464331453e-10, 0.06860782711996793, 0.0006757629250115482);

      this.hips.AddChild(this.spine);
      this.spine.AddChild(this.transform);
      this.transform.AddChild(this.neck);
      this.neck.AddChild(this.head);

			this.leftShoulder = new Transform();
			this.transform.AddChild(this.leftShoulder);

			this.rightShoulder = new Transform();
			this.transform.AddChild(this.rightShoulder);
			/* this.leftShoulderRenderer = new Transform();
			this.rightShoulderRenderer = new Transform(); */
			this.leftShoulderAnchor = new Transform();
			this.leftShoulderAnchor.localPosition = new Vector3(-0.018790404909333258, 0.17293596589167015, -0.025336985971404546);
			this.transform.AddChild(this.leftShoulderAnchor);
			this.rightShoulderAnchor = new Transform();
			this.rightShoulderAnchor.localPosition = new Vector3(0.018790404909333258, 0.17293596589167015, -0.025336985971404546);
			this.transform.AddChild(this.rightShoulderAnchor);
			this.leftArm = null;
			this.rightArm = null;
		}

		OnEnable()
		{
			const shoulderPoser = this.GetComponent(ShoulderPoser);
			if (this.leftArm === null)
			{
				this.leftArm = new GameObject().AddComponent(ArmTransforms);
				const armIk = this.leftArm.GetComponentInChildren(VRArmIK);
				armIk.shoulder = this;
				armIk.shoulderPoser = shoulderPoser;
				armIk.target = armIk.shoulderPoser.avatarTrackingReferences.leftHand.transform;
				// console.log('new pos 1', this.leftArm.lowerArm.localPosition.toArray().join(','));
				this.leftShoulderAnchor.AddChild(this.leftArm.transform);
			}
			if (this.rightArm === null)
			{
				this.rightArm = new GameObject().AddComponent(ArmTransforms);
				const armIk = this.rightArm.GetComponentInChildren(VRArmIK);
				armIk.shoulder = this;
				armIk.shoulderPoser = shoulderPoser;
				armIk.target = armIk.shoulderPoser.avatarTrackingReferences.rightHand.transform;

				armIk.left = false;
				// console.log('new pos 2', this.rightArm.lowerArm.localPosition.multiply(new Vector3(-1, 1, 1)).toArray().join(','));
				this.rightArm.upperArm.localPosition = this.rightArm.upperArm.localPosition.multiply(new Vector3(-1, 1, 1));
        this.rightArm.lowerArm.localPosition = this.rightArm.lowerArm.localPosition.multiply(new Vector3(-1, 1, 1));
        this.rightArm.hand.localPosition = this.rightArm.hand.localPosition.multiply(new Vector3(-1, 1, 1));
        this.rightShoulderAnchor.AddChild(this.rightArm.transform);
			}
		}

		/* Start()
		{
			this.setShoulderWidth(PoseManager.Instance.playerWidthShoulders);
		}

		setShoulderWidth(width)
		{
			const localScale = new Vector3(width * .5, .05, .05);
			const localPosition = new Vector3(width * .25, 0, 0);

			leftShoulderRenderer.localScale = localScale;
			leftShoulderRenderer.localPosition = localPosition.clone().multiplyScalar(-1);

			rightShoulderRenderer.localScale = localScale;
			rightShoulderRenderer.localPosition = localPosition;
		} */
	}

export default ShoulderTransforms;
