/**
 * Interactions & Variants System
 *
 * Handles component states, interactions, and animations.
 * Similar to Plasmic's interactions and Framer's smart components.
 */

import { ElementStyles } from './types';

// ==========================================
// VARIANT TYPES
// ==========================================

export type VariantType = 'hover' | 'active' | 'focus' | 'disabled' | 'custom';

export interface Variant {
  id: string;
  name: string;
  type: VariantType;
  // Condition for custom variants
  condition?: VariantCondition;
  // Style overrides when this variant is active
  styles: Partial<ElementStyles>;
  // Transition when entering this variant
  transition?: TransitionConfig;
}

export interface VariantCondition {
  type: 'state' | 'prop' | 'breakpoint';
  operator: 'equals' | 'not_equals' | 'contains' | 'greater' | 'less';
  value: string | number | boolean;
  variable?: string; // For state/prop conditions
}

// ==========================================
// INTERACTION TYPES
// ==========================================

export type TriggerType =
  | 'click'
  | 'hover'
  | 'hover_start'
  | 'hover_end'
  | 'mouse_down'
  | 'mouse_up'
  | 'focus'
  | 'blur'
  | 'scroll'
  | 'scroll_into_view'
  | 'load'
  | 'key_press';

export type ActionType =
  | 'navigate'
  | 'open_url'
  | 'set_state'
  | 'toggle_state'
  | 'show_element'
  | 'hide_element'
  | 'toggle_element'
  | 'animate'
  | 'play_animation'
  | 'stop_animation'
  | 'scroll_to'
  | 'copy_to_clipboard'
  | 'trigger_event'
  | 'run_code';

export interface Interaction {
  id: string;
  name: string;
  trigger: InteractionTrigger;
  actions: InteractionAction[];
  enabled: boolean;
}

export interface InteractionTrigger {
  type: TriggerType;
  // For keyboard triggers
  key?: string;
  modifiers?: ('ctrl' | 'shift' | 'alt' | 'meta')[];
  // For scroll triggers
  scrollThreshold?: number; // 0-1 for percentage
  scrollDirection?: 'up' | 'down' | 'both';
  // Delay before trigger activates
  delay?: number;
}

export interface InteractionAction {
  id: string;
  type: ActionType;
  // Target element (if applicable)
  targetElementId?: string;
  // Navigation
  url?: string;
  pageId?: string;
  openInNewTab?: boolean;
  // State changes
  stateName?: string;
  stateValue?: any;
  // Animation
  animationId?: string;
  // Scroll
  scrollTarget?: string | { x: number; y: number };
  scrollBehavior?: 'smooth' | 'instant';
  // Custom code
  code?: string;
  // Delay before this action
  delay?: number;
  // Duration for timed actions
  duration?: number;
}

// ==========================================
// ANIMATION TYPES
// ==========================================

export interface Animation {
  id: string;
  name: string;
  keyframes: AnimationKeyframe[];
  duration: number; // in ms
  delay: number;
  easing: EasingType;
  iterations: number | 'infinite';
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode: 'none' | 'forwards' | 'backwards' | 'both';
}

export interface AnimationKeyframe {
  offset: number; // 0-1 (0% to 100%)
  styles: Partial<AnimatableStyles>;
  easing?: EasingType;
}

export interface AnimatableStyles {
  opacity: number;
  x: number;
  y: number;
  scale: number;
  scaleX: number;
  scaleY: number;
  rotate: number;
  rotateX: number;
  rotateY: number;
  skewX: number;
  skewY: number;
  backgroundColor: string;
  color: string;
  borderColor: string;
  borderRadius: number;
  boxShadow: string;
  filter: string;
  clipPath: string;
}

export type EasingType =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'ease-in-quad'
  | 'ease-out-quad'
  | 'ease-in-out-quad'
  | 'ease-in-cubic'
  | 'ease-out-cubic'
  | 'ease-in-out-cubic'
  | 'ease-in-quart'
  | 'ease-out-quart'
  | 'ease-in-out-quart'
  | 'ease-in-back'
  | 'ease-out-back'
  | 'ease-in-out-back'
  | 'ease-in-elastic'
  | 'ease-out-elastic'
  | 'spring';

// ==========================================
// TRANSITION CONFIG
// ==========================================

export interface TransitionConfig {
  property: 'all' | keyof ElementStyles | (keyof ElementStyles)[];
  duration: number; // in ms
  delay?: number;
  easing: EasingType;
}

// ==========================================
// PRESET ANIMATIONS
// ==========================================

export const PRESET_ANIMATIONS: Record<string, Omit<Animation, 'id'>> = {
  fadeIn: {
    name: 'Fade In',
    keyframes: [
      { offset: 0, styles: { opacity: 0 } },
      { offset: 1, styles: { opacity: 1 } },
    ],
    duration: 300,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'forwards',
  },
  fadeOut: {
    name: 'Fade Out',
    keyframes: [
      { offset: 0, styles: { opacity: 1 } },
      { offset: 1, styles: { opacity: 0 } },
    ],
    duration: 300,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'forwards',
  },
  slideInLeft: {
    name: 'Slide In Left',
    keyframes: [
      { offset: 0, styles: { x: -50, opacity: 0 } },
      { offset: 1, styles: { x: 0, opacity: 1 } },
    ],
    duration: 400,
    delay: 0,
    easing: 'ease-out-cubic',
    iterations: 1,
    direction: 'normal',
    fillMode: 'forwards',
  },
  slideInRight: {
    name: 'Slide In Right',
    keyframes: [
      { offset: 0, styles: { x: 50, opacity: 0 } },
      { offset: 1, styles: { x: 0, opacity: 1 } },
    ],
    duration: 400,
    delay: 0,
    easing: 'ease-out-cubic',
    iterations: 1,
    direction: 'normal',
    fillMode: 'forwards',
  },
  slideInUp: {
    name: 'Slide In Up',
    keyframes: [
      { offset: 0, styles: { y: 30, opacity: 0 } },
      { offset: 1, styles: { y: 0, opacity: 1 } },
    ],
    duration: 400,
    delay: 0,
    easing: 'ease-out-cubic',
    iterations: 1,
    direction: 'normal',
    fillMode: 'forwards',
  },
  slideInDown: {
    name: 'Slide In Down',
    keyframes: [
      { offset: 0, styles: { y: -30, opacity: 0 } },
      { offset: 1, styles: { y: 0, opacity: 1 } },
    ],
    duration: 400,
    delay: 0,
    easing: 'ease-out-cubic',
    iterations: 1,
    direction: 'normal',
    fillMode: 'forwards',
  },
  scaleIn: {
    name: 'Scale In',
    keyframes: [
      { offset: 0, styles: { scale: 0.8, opacity: 0 } },
      { offset: 1, styles: { scale: 1, opacity: 1 } },
    ],
    duration: 300,
    delay: 0,
    easing: 'ease-out-back',
    iterations: 1,
    direction: 'normal',
    fillMode: 'forwards',
  },
  scaleOut: {
    name: 'Scale Out',
    keyframes: [
      { offset: 0, styles: { scale: 1, opacity: 1 } },
      { offset: 1, styles: { scale: 0.8, opacity: 0 } },
    ],
    duration: 200,
    delay: 0,
    easing: 'ease-in',
    iterations: 1,
    direction: 'normal',
    fillMode: 'forwards',
  },
  bounce: {
    name: 'Bounce',
    keyframes: [
      { offset: 0, styles: { y: 0 } },
      { offset: 0.5, styles: { y: -20 } },
      { offset: 1, styles: { y: 0 } },
    ],
    duration: 500,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'none',
  },
  pulse: {
    name: 'Pulse',
    keyframes: [
      { offset: 0, styles: { scale: 1 } },
      { offset: 0.5, styles: { scale: 1.05 } },
      { offset: 1, styles: { scale: 1 } },
    ],
    duration: 600,
    delay: 0,
    easing: 'ease-in-out',
    iterations: 'infinite',
    direction: 'normal',
    fillMode: 'none',
  },
  shake: {
    name: 'Shake',
    keyframes: [
      { offset: 0, styles: { x: 0 } },
      { offset: 0.25, styles: { x: -10 } },
      { offset: 0.5, styles: { x: 10 } },
      { offset: 0.75, styles: { x: -10 } },
      { offset: 1, styles: { x: 0 } },
    ],
    duration: 400,
    delay: 0,
    easing: 'ease-in-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'none',
  },
  rotate: {
    name: 'Rotate',
    keyframes: [
      { offset: 0, styles: { rotate: 0 } },
      { offset: 1, styles: { rotate: 360 } },
    ],
    duration: 1000,
    delay: 0,
    easing: 'linear',
    iterations: 'infinite',
    direction: 'normal',
    fillMode: 'none',
  },
  float: {
    name: 'Float',
    keyframes: [
      { offset: 0, styles: { y: 0 } },
      { offset: 0.5, styles: { y: -10 } },
      { offset: 1, styles: { y: 0 } },
    ],
    duration: 2000,
    delay: 0,
    easing: 'ease-in-out',
    iterations: 'infinite',
    direction: 'normal',
    fillMode: 'none',
  },
};

// ==========================================
// EASING FUNCTIONS (CSS cubic-bezier values)
// ==========================================

export const EASING_VALUES: Record<EasingType, string> = {
  linear: 'linear',
  ease: 'ease',
  'ease-in': 'ease-in',
  'ease-out': 'ease-out',
  'ease-in-out': 'ease-in-out',
  'ease-in-quad': 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  'ease-out-quad': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  'ease-in-out-quad': 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
  'ease-in-cubic': 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  'ease-out-cubic': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  'ease-in-out-cubic': 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  'ease-in-quart': 'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
  'ease-out-quart': 'cubic-bezier(0.165, 0.84, 0.44, 1)',
  'ease-in-out-quart': 'cubic-bezier(0.77, 0, 0.175, 1)',
  'ease-in-back': 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
  'ease-out-back': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  'ease-in-out-back': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  'ease-in-elastic': 'cubic-bezier(0.5, -0.5, 0.1, 1.5)',
  'ease-out-elastic': 'cubic-bezier(0.5, 1.5, 0.5, 1)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Convert animation to CSS keyframes string
 */
export function animationToCss(animation: Animation, elementSelector: string): string {
  const keyframeName = `anim-${animation.id}`;

  // Generate keyframes
  let keyframesCss = `@keyframes ${keyframeName} {\n`;
  for (const kf of animation.keyframes) {
    const percent = Math.round(kf.offset * 100);
    keyframesCss += `  ${percent}% {\n`;

    const { x, y, scale, scaleX, scaleY, rotate, rotateX, rotateY, skewX, skewY, ...otherStyles } =
      kf.styles;

    // Build transform
    const transforms: string[] = [];
    if (x !== undefined) transforms.push(`translateX(${x}px)`);
    if (y !== undefined) transforms.push(`translateY(${y}px)`);
    if (scale !== undefined) transforms.push(`scale(${scale})`);
    if (scaleX !== undefined) transforms.push(`scaleX(${scaleX})`);
    if (scaleY !== undefined) transforms.push(`scaleY(${scaleY})`);
    if (rotate !== undefined) transforms.push(`rotate(${rotate}deg)`);
    if (rotateX !== undefined) transforms.push(`rotateX(${rotateX}deg)`);
    if (rotateY !== undefined) transforms.push(`rotateY(${rotateY}deg)`);
    if (skewX !== undefined) transforms.push(`skewX(${skewX}deg)`);
    if (skewY !== undefined) transforms.push(`skewY(${skewY}deg)`);

    if (transforms.length > 0) {
      keyframesCss += `    transform: ${transforms.join(' ')};\n`;
    }

    // Other styles
    for (const [key, value] of Object.entries(otherStyles)) {
      if (value !== undefined) {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        keyframesCss += `    ${cssKey}: ${value};\n`;
      }
    }

    keyframesCss += `  }\n`;
  }
  keyframesCss += `}\n\n`;

  // Generate animation property
  const iterations = animation.iterations === 'infinite' ? 'infinite' : animation.iterations;
  const animationCss = `${elementSelector} {
  animation: ${keyframeName} ${animation.duration}ms ${EASING_VALUES[animation.easing]} ${animation.delay}ms ${iterations} ${animation.direction} ${animation.fillMode};
}\n`;

  return keyframesCss + animationCss;
}

/**
 * Generate transition CSS for variant
 */
export function transitionToCss(transition: TransitionConfig): string {
  const properties = Array.isArray(transition.property)
    ? transition.property.join(', ')
    : transition.property;

  const delay = transition.delay ? ` ${transition.delay}ms` : '';

  return `${properties} ${transition.duration}ms ${EASING_VALUES[transition.easing]}${delay}`;
}

/**
 * Generate CSS for hover variant
 */
export function variantToCss(
  variant: Variant,
  elementSelector: string,
  baseStyles: ElementStyles
): string {
  const pseudoClass =
    variant.type === 'hover'
      ? ':hover'
      : variant.type === 'active'
        ? ':active'
        : variant.type === 'focus'
          ? ':focus'
          : variant.type === 'disabled'
            ? ':disabled'
            : '';

  if (!pseudoClass && variant.type !== 'custom') return '';

  let css = `${elementSelector}${pseudoClass} {\n`;

  for (const [key, value] of Object.entries(variant.styles)) {
    if (value !== undefined) {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      const cssValue = typeof value === 'number' && !['opacity', 'fontWeight', 'lineHeight'].includes(key)
        ? `${value}px`
        : value;
      css += `  ${cssKey}: ${cssValue};\n`;
    }
  }

  css += `}\n`;

  // Add transition on base element
  if (variant.transition) {
    css = `${elementSelector} {\n  transition: ${transitionToCss(variant.transition)};\n}\n\n` + css;
  }

  return css;
}

/**
 * Create default hover variant
 */
export function createDefaultHoverVariant(): Variant {
  return {
    id: `variant-${Date.now()}`,
    name: 'Hover',
    type: 'hover',
    styles: {
      opacity: 0.9,
    },
    transition: {
      property: 'all',
      duration: 200,
      easing: 'ease-out',
    },
  };
}

/**
 * Create default active variant
 */
export function createDefaultActiveVariant(): Variant {
  return {
    id: `variant-${Date.now()}`,
    name: 'Active',
    type: 'active',
    styles: {
      opacity: 0.8,
    },
    transition: {
      property: 'all',
      duration: 100,
      easing: 'ease-out',
    },
  };
}

/**
 * Create default disabled variant
 */
export function createDefaultDisabledVariant(): Variant {
  return {
    id: `variant-${Date.now()}`,
    name: 'Disabled',
    type: 'disabled',
    styles: {
      opacity: 0.5,
    },
    transition: {
      property: 'all',
      duration: 200,
      easing: 'ease-out',
    },
  };
}
