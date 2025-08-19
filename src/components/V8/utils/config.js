// ⚙️ Configuration V5 - BLOOM EFFECTS FOCUS
export const V3_CONFIG = {
  camera: {
    fov: 85,
    near: 0.1,
    far: 1000,
    position: { x: 5, y: 1.5, z: 3 }
  },
  
  lights: {
    ambient: { color: 0xffffff, intensity: 0.8 },  // ✅ Augmenté 0.5 → 0.8
    directional: { 
      color: 0xffffff, 
      intensity: 0.8,  // ✅ Augmenté 0.5 → 0.8
      position: { x: 1, y: 2, z: 3 } 
    }
  },
  
  revelation: {
    centerX: 3.3,
    centerY: 3.4,
    centerZ: 1.9,
    height: 0.6,
    radius: 1.3
  },
  
  model: {
    path: "/models/V3_Eye-3.0.glb",
    dracoPath: "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
  },
  
  controls: {
    moveSpeed: { normal: 0.02, fast: 0.1 },
    sizeSpeed: 0.05,
    limits: { minSize: 0.1, maxSize: 10 }
  },

  // Animations pour bloom effects
  animations: {
    // Bras principaux
    bigArms: [
      'Bras_L1_Mouv',
      'Bras_L2_Mouv', 
      'Bras_R1_Mouv',
      'Bras_R2_Mouv'
    ],
    
    // Petits bras
    littleArms: [
      'Little_1_Mouv', 'Little_2_Mouv', 'Little_3_Mouv', 'Little_4_Mouv',
      'Little_5_Mouv', 'Little_6_Mouv', 'Little_7_Mouv', 'Little_8_Mouv',
      'Arm_Little_9Action', 'Little_10_Mouv', 'Little_11_Mouv', 
      'Little_12_Mouv', 'Little_13_Mouv'
    ],
    
    // Transitions
    poseR1: 'R1&R2_Pose',
    poseR2: 'R2&R1_Pose',
    
    // Anneaux magiques pour révélation
    rings: [
      'Action_Ring',
      'Ring_BloomArea_1Action_Ring',
      'Ring_BloomArea_2Action_Ring', 
      'Ring_BloomArea_3Action_Ring',
      'Ring_BloomArea_4Action_Ring',
      'Ring_BloomArea_5Action_Ring',
      'Ring_Ext_SG1Action_Ring',
      'Ring_Int_SG1Action_Ring'
    ],
    
    // Eye central (drivers automatiques)
    eyeDrivers: {
      enabled: true,
      meshes: ['Anneaux_Eye_Ext', 'Anneaux_Eye_Int']
    }
  },

  // Configuration bloom effects
  bloom: {
    security: {
      intensity: 1.0,
      threshold: 0.5,
      radius: 0.8
    },
    decorative: {
      intensity: 0.8,
      threshold: 0.3,
      radius: 1.0,
      color: 0x88ccff
    }
  }
};