// 🌍 WorldEnvironmentController V8 - Contrôleur de thèmes avec transitions fluides
import * as THREE from 'three';

/**
 * Contrôleur unifié pour les thèmes d'environnement
 * Gère les transitions fluides entre Night/Day/Bright
 */
export class WorldEnvironmentController {
  constructor(setExposure) {
    this.setExposure = setExposure;
    
    // ✅ THÈMES PRÉDÉFINIS
    this.themes = {
      NIGHT: {
        name: 'Night',
        exposure: 0.3,
        duration: 2000,
        description: '🌙 Mode nuit - Bloom ultra-contrasté',
        ambientIntensity: 0.2,
        directionalIntensity: 0.3
      },
      DAY: {
        name: 'Day', 
        exposure: 1.0,
        duration: 2000,
        description: '☀️ Mode jour - Éclairage normal',
        ambientIntensity: 0.6,
        directionalIntensity: 0.8
      },
      BRIGHT: {
        name: 'Bright',
        exposure: 1.8, 
        duration: 2000,
        description: '🔆 Mode brillant - Bloom intense',
        ambientIntensity: 1.0,
        directionalIntensity: 1.2
      }
    };
    
    // ✅ ÉTAT ACTUEL
    this.currentTheme = 'DAY';
    this.currentExposure = 1.0;
    this.isTransitioning = false;
    
    // ✅ ANIMATION DATA
    this.tweenData = { exposure: 1.0 };
    this.activeTween = null;
    
    console.log('✅ WorldEnvironmentController initialisé');
  }
  
  /**
   * Changer vers un thème avec transition fluide
   */
  changeTheme(themeName, customDuration = null) {
    if (this.isTransitioning) {
      console.warn('⚠️ Transition déjà en cours, ignorer la demande');
      return false;
    }
    
    const theme = this.themes[themeName];
    if (!theme) {
      console.error(`❌ Thème inconnu: ${themeName}`);
      return false;
    }
    
    if (this.currentTheme === themeName) {
      console.log(`ℹ️ Déjà en thème ${themeName}`);
      return true;
    }
    
    const duration = customDuration || theme.duration;
    
    console.log(`🌍 Transition ${this.currentTheme} → ${themeName} (${duration}ms)`);
    
    this.isTransitioning = true;
    this.currentTheme = themeName;
    
    // ✅ ANIMATION AVEC EASING FLUIDE
    this.tweenData.exposure = this.currentExposure;
    
    const startTime = performance.now();
    const startExposure = this.currentExposure;
    const targetExposure = theme.exposure;
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // ✅ EASING : Smooth In-Out
      const easedProgress = this.easeInOutCubic(progress);
      
      // ✅ INTERPOLATION
      const currentExposure = startExposure + (targetExposure - startExposure) * easedProgress;
      
      // ✅ APPLIQUER
      this.currentExposure = currentExposure;
      this.tweenData.exposure = currentExposure;
      
      if (this.setExposure) {
        this.setExposure(currentExposure);
      }
      
      console.log(`🎬 Transition: ${(progress * 100).toFixed(1)}% - Exposure: ${currentExposure.toFixed(2)}`);
      
      if (progress < 1) {
        this.activeTween = requestAnimationFrame(animate);
      } else {
        // ✅ TRANSITION TERMINÉE
        this.isTransitioning = false;
        this.activeTween = null;
        console.log(`✅ Transition vers ${themeName} terminée - Exposure finale: ${theme.exposure}`);
      }
    };
    
    this.activeTween = requestAnimationFrame(animate);
    return true;
  }
  
  /**
   * Transition rapide vers un thème (500ms)
   */
  quickChangeTheme(themeName) {
    return this.changeTheme(themeName, 500);
  }
  
  /**
   * Transition lente vers un thème (4000ms)
   */
  slowChangeTheme(themeName) {
    return this.changeTheme(themeName, 4000);
  }
  
  /**
   * Easing function - Cubic In-Out
   */
  easeInOutCubic(t) {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  /**
   * Arrêter toute transition en cours
   */
  stopTransition() {
    if (this.activeTween) {
      cancelAnimationFrame(this.activeTween);
      this.activeTween = null;
      this.isTransitioning = false;
      console.log('⏹️ Transition arrêtée');
    }
  }
  
  /**
   * Obtenir le thème actuel
   */
  getCurrentTheme() {
    return {
      name: this.currentTheme,
      config: this.themes[this.currentTheme],
      exposure: this.currentExposure,
      isTransitioning: this.isTransitioning
    };
  }
  
  /**
   * Obtenir tous les thèmes disponibles
   */
  getAvailableThemes() {
    return Object.keys(this.themes).map(key => ({
      key,
      ...this.themes[key]
    }));
  }
  
  /**
   * Définir une exposure personnalisée (sans thème)
   */
  setCustomExposure(exposure, duration = 1000) {
    return this.changeTheme('CUSTOM', duration, { exposure });
  }
  
  /**
   * Cycle entre les thèmes (pour raccourci clavier)
   */
  cycleThemes() {
    const themeKeys = Object.keys(this.themes);
    const currentIndex = themeKeys.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    const nextTheme = themeKeys[nextIndex];
    
    console.log(`🔄 Cycle: ${this.currentTheme} → ${nextTheme}`);
    return this.changeTheme(nextTheme);
  }
  
  /**
   * Obtenir le statut détaillé
   */
  getStatus() {
    return {
      currentTheme: this.currentTheme,
      currentExposure: this.currentExposure,
      isTransitioning: this.isTransitioning,
      availableThemes: Object.keys(this.themes),
      tweenData: { ...this.tweenData }
    };
  }
  
  /**
   * Nettoyage
   */
  dispose() {
    this.stopTransition();
    console.log('🧹 WorldEnvironmentController nettoyé');
  }
}