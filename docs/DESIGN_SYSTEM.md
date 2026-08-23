# 🎨 DESIGN SYSTEM — OMLIINK

**Définition complète du design visual + composants réutilisables**

---

## 🎯 Philosophie

```
OMLIINK = Rassurante + Moderne + Accessible

- Confiance (couleurs, espacements généreux)
- Humanité (typographie lisible, arrondi doux)
- Légèreté (animations fluides, pas de clutter)
- Accessibilité (contraste WCAG AA, mobile-first)
```

---

## 🎨 Palette Couleurs

### Primaire: Indigo (Confiance, Tech, Sérieux)

```
Indigo-50:    #f0f4ff   (Très clair, backgrounds)
Indigo-100:   #e0e7ff   (Clair)
Indigo-200:   #c7d2fe   (Light)
Indigo-300:   #a5b4fc   (Light Medium)
Indigo-400:   #818cf8   (Medium)
Indigo-500:   #6366f1   (PRIMARY) ← UTILISER CELUI-CI
Indigo-600:   #4f46e5   (Dark)
Indigo-700:   #4338ca   (Darker)
Indigo-800:   #3730a3   (Very Dark)
Indigo-900:   #312e81   (Almost Black)
```

### Secondaire: Coral (Chaleur, Humain, Proximité)

```
Coral-50:     #fef2f2   (Très clair)
Coral-100:    #fee2e2   (Clair)
Coral-200:    #fecaca   (Light)
Coral-300:    #fca5a5   (Light Medium)
Coral-400:    #f87171   (Medium)
Coral-500:    #ff5a3d   (SECONDARY) ← UTILISER CELUI-CI
Coral-600:    #dc2626   (Dark)
Coral-700:    #b91c1c   (Darker)
Coral-800:    #7f1d1d   (Very Dark)
Coral-900:    #450a0a   (Almost Black)
```

### Statuts

```
Succès:       #10b981   (Emerald-500)   ← Actions positives
Attention:    #f59e0b   (Amber-500)     ← Warnings
Danger:       #ef4444   (Red-500)       ← Errors, destructive
Info:         #3b82f6   (Blue-500)      ← Information
```

### Neutres

```
White:        #ffffff
Gray-50:      #f9fafb   (Quasi white)
Gray-100:     #f3f4f6   (Very light)
Gray-200:     #e5e7eb   (Light)
Gray-300:     #d1d5db   (Light medium)
Gray-400:     #9ca3af   (Medium)
Gray-500:     #6b7280   (Dark medium) ← Texte secondaire
Gray-600:     #4b5563   (Dark)
Gray-700:     #374151   (Darker)
Gray-800:     #1f2937   (Very dark)
Gray-900:     #111827   (Almost black)
Black:        #000000
```

### Dark Mode

```
Dark BG:      #0f172a   (Slate-950)
Dark Surface: #1e293b   (Slate-900)
Dark Card:    #334155   (Slate-800)
Dark Border:  #475569   (Slate-700)
Dark Text:    #f1f5f9   (Slate-100)
```

---

## 📝 Typographie

### Fonts

```
Heading:      Geist Sans (Bold/Black/SemiBold)
Body:         Geist Sans (Regular/Medium)
Monospace:    Geist Mono (Regular)
```

**Gérer via `/app/layout.tsx`:**

```tsx
import { Geist, Geist_Mono } from 'next/font/google';

const geist = Geist({ subsets: ['latin'] });
const geist_mono = Geist_Mono({ subsets: ['latin'] });
```

### Tailles

```
Display:      3xl (30px) → h1 héros (landing)
H1:           2xl (24px) → Titres pages
H2:           xl (20px)  → Sous-titres sections
H3:           lg (18px)  → Titres cartes
Body Large:   base (16px) → Texte principal
Body:         sm (14px)  → Texte secondaire
Small:        xs (12px)  → Labels, hints
Caption:      xs (12px)  → Metadata
```

### Line Height

```
Tight:        1.2  (Titres)
Normal:       1.5  (Texte corps)
Relaxed:      1.75 (Descriptions longues)
```

### Font Weight

```
Light:        300 (Rares)
Regular:      400 (Corps texte)
Medium:       500 (Emphasis léger)
SemiBold:     600 (Titres petits)
Bold:         700 (Titres moyens)
Black:        900 (Display/héros)
```

---

## 📐 Espacements

**Système basé sur 4px (Tailwind base):**

```
0:    0px
1:    4px
2:    8px
3:    12px
4:    16px     ← Standard padding card
5:    20px
6:    24px     ← Standard gap sections
8:    32px
10:   40px
12:   48px
16:   64px
20:   80px
24:   96px
```

### Utilisation Typique

```
Card padding:       16px (p-4)
Section gap:        24px (gap-6)
Icon + text:        8px (gap-2)
Grouped buttons:    8px (gap-2)
Page padding mobile: 16px (px-4)
Page padding desktop: 32px (px-8)
```

---

## 🔲 Radius (Arrondi)

```
None:         0px
SM:           2px      (Très subtil, rare)
Base:         6px      (0.75rem) ← STANDARD
MD:           8px      (Cartes secondaires)
LG:           12px     (Modals)
XL:           16px     (Containers larges)
Full:         9999px   (Boutons pills, avatars)
```

**Standard OMLIINK: 6px (base)** = `rounded-lg` en Tailwind

---

## 🌑 Dark Mode

**Toujours actif via Tailwind:**

```tsx
// tailwind.config.ts
export default {
  darkMode: 'class',  // ← Toggle via classe 'dark'
  theme: {
    // Variables pour dark mode
  }
}
```

**Utilisation:**

```tsx
// Light: bg-white
// Dark:  dark:bg-slate-950
<div className="bg-white dark:bg-slate-950">
  Content
</div>
```

---

## ⚡ Ombres

```
SM:       0 1px 2px rgba(0,0,0,0.05)
Base:     0 1px 3px rgba(0,0,0,0.1)    ← Cartes
MD:       0 4px 6px rgba(0,0,0,0.1)    ← Hover cards
LG:       0 10px 15px rgba(0,0,0,0.1)  ← Modals, elevated
XL:       0 20px 25px rgba(0,0,0,0.1)  ← Dropdowns
2XL:      0 25px 50px rgba(0,0,0,0.1)  ← Full screen overlays
```

**Standard pour cartes: `shadow-md`**

---

## 🎬 Animations

**Framework: Framer Motion**

### Timings

```
Fast:       150ms   (Hover states, quick feedback)
Normal:     300ms   (Transitions standard) ← DÉFAUT
Slow:       500ms   (Page transitions, important)
Slower:     700ms   (Dramatic reveals)
```

### Easing

```
Ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1)  ← STANDARD
Ease-out:     cubic-bezier(0, 0, 0.2, 1)    (Entrées)
Ease-in:      cubic-bezier(0.4, 0, 1, 1)    (Sorties)
```

### Animations Réutilisables

```
Fade:         opacity 0 → 1
Slide-up:     translateY 20px → 0
Slide-down:   translateY -20px → 0
Scale:        scale 0.95 → 1
Rotate:       rotate 0 → 360deg
```

---

## 🧩 Composants de Base

### Button

```tsx
// Variants
Primary:      bg-indigo-500 hover:bg-indigo-600 (Action principale)
Secondary:    bg-gray-200 hover:bg-gray-300 (Action secondaire)
Danger:       bg-red-500 hover:bg-red-600 (Destructive)
Ghost:        bg-transparent border border-gray-300 (Minimal)
Outline:      border-2 border-indigo-500 text-indigo-500

// Sizes
SM:           px-3 py-1.5 text-sm
MD:           px-4 py-2 text-base (DEFAULT)
LG:           px-6 py-3 text-lg
```

### Card

```tsx
// Structure
bg-white dark:bg-slate-900
rounded-lg border border-gray-200 dark:border-slate-800
shadow-md p-4

// Hover
hover:shadow-lg transition-shadow duration-300
```

### Input

```tsx
// Base
border border-gray-300 dark:border-slate-700
rounded-lg px-4 py-2
focus:outline-none focus:ring-2 focus:ring-indigo-500
focus:border-transparent

// States
disabled: opacity-50 cursor-not-allowed
error: border-red-500 focus:ring-red-500
success: border-green-500 focus:ring-green-500
```

### Badge

```tsx
// Types
Primary:   bg-indigo-100 text-indigo-700 rounded-full px-3 py-1 text-xs font-medium
Success:   bg-green-100 text-green-700
Warning:   bg-amber-100 text-amber-700
Danger:    bg-red-100 text-red-700
```

### Avatar

```tsx
// Sizes
SM:       w-8 h-8
MD:       w-10 h-10 (DEFAULT)
LG:       w-12 h-12
XL:       w-16 h-16

// Style
rounded-full border-2 border-indigo-500
object-cover
```

---

## 📱 Responsive Breakpoints

```
Mobile:     < 640px     (DEFAULT first)
Tablet:     640px-1024px
Desktop:    > 1024px
Large:      > 1280px
```

**Utilisation Tailwind:**

```tsx
// Mobile first
<div className="text-base md:text-lg lg:text-xl">
  Responsive text
</div>
```

---

## ♿ Accessibilité

### Contraste

```
✅ WCAG AA (minimum)
  - Texte noir sur blanc: 4.5:1
  - Texte indigo-500 sur white: 5.5:1 ✅
  - Texte gray-500 sur white: 4.5:1 ✅

❌ Éviter
  - Gray-300 texte sur white (trop faible)
  - Indigo-200 sur white (illisible)
```

### Focus States

```
Tous interactive elements:
  focus:outline-none
  focus:ring-2
  focus:ring-indigo-500
  focus:ring-offset-2
```

### Couleurs Texte

```
Primary:      text-gray-900 (dark:text-white)
Secondary:    text-gray-600 (dark:text-gray-400)
Tertiary:     text-gray-500 (dark:text-gray-500)
Disabled:     text-gray-400 (dark:text-gray-600)
```

---

## 🎯 Tailwind Configuration

**`tailwind.config.ts`:**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          50: '#f0f4ff',
          500: '#6366f1',   // PRIMARY
          600: '#4f46e5',
          // ... full palette
        },
        coral: {
          50: '#fef2f2',
          500: '#ff5a3d',   // SECONDARY
          600: '#dc2626',
          // ... full palette
        },
      },
      spacing: {
        // Tailwind defaults OK (4px base)
      },
      borderRadius: {
        DEFAULT: '0.75rem',  // 6px standard
        'lg': '0.75rem',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      boxShadow: {
        base: '0 1px 3px rgba(0,0,0,0.1)',
        md: '0 4px 6px rgba(0,0,0,0.1)',
        lg: '0 10px 15px rgba(0,0,0,0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 📁 Structure Components

**`src/components/ui/`** (Réutilisables):
```
├── Button.tsx
├── Card.tsx
├── Input.tsx
├── Badge.tsx
├── Avatar.tsx
├── Modal.tsx
├── Dropdown.tsx
├── Alert.tsx
└── Toast.tsx
```

**`src/components/layout/`** (Layout):
```
├── Navbar.tsx
├── Sidebar.tsx
├── Footer.tsx
├── Container.tsx
└── Grid.tsx
```

**`src/components/forms/`** (Formulaires):
```
├── FormField.tsx
├── Checkbox.tsx
├── Radio.tsx
├── Select.tsx
├── Textarea.tsx
└── FormError.tsx
```

---

## 🎨 Exemple Component: Button

```tsx
// src/components/ui/Button.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-indigo-500 text-white hover:bg-indigo-600',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        danger: 'bg-red-500 text-white hover:bg-red-600',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
        outline: 'border-2 border-indigo-500 text-indigo-500 hover:bg-indigo-50',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);

Button.displayName = 'Button';

export { Button, buttonVariants };
```

**Usage:**

```tsx
<Button variant="primary" size="md">
  Click me
</Button>

<Button variant="danger" size="lg">
  Delete
</Button>
```

---

## 🎭 Logo OMLIINK

```
Text:        "omliink" (Geist Sans Bold, 24px)
Gradient:    Les deux "ii" en dégradé Indigo → Coral
Symbolisme:  Deux personnes face-à-face (concept visio)

Colors:
  "o m l i i n k" où "ii" = gradient(#6366f1 → #ff5a3d)

Usage:
  Logo principal en header
  Favicon 32x32
  Social media 1200x600
```

---

## 📋 Checklist Design System

- [ ] Tailwind config mis à jour avec couleurs
- [ ] Fonts importées (Geist)
- [ ] Base components créés (Button, Card, Input)
- [ ] Dark mode testé
- [ ] Responsive mobile/tablet/desktop testé
- [ ] Accessibilité vérifiée (contraste, focus)
- [ ] Animations Framer Motion setup
- [ ] Component library documentée

---

## 🚀 Intégration dans Sprints

**Sprint 0 Day 3 (Jeudi):**
- [ ] Créer ce DESIGN_SYSTEM.md
- [ ] Mettre à jour `tailwind.config.ts`
- [ ] Créer 5 composants de base (Button, Card, Input, Badge, Avatar)
- [ ] Tester dark mode
- [ ] Commit

**Sprint 1-2:**
- [ ] Utiliser components pour toutes les pages
- [ ] Créer plus de components si besoin
- [ ] Maintenir cohérence design

---

**Version:** 1.0  
**Status:** Prêt pour implémentation  
**Dernière MAJ:** Août 2026

Pour questions sur design: Consulter ce fichier régulièrement!
