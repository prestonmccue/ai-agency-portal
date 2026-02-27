# Jess — Visual Identity

## Avatar / Icon

### Primary Avatar
```
   ╭──────────╮
   │  ✨🤝✨  │
   │          │
   │   JESS   │
   ╰──────────╯
```

**Design Specs:**
- **Shape:** Rounded square (like app icons)
- **Primary Color:** `#6366f1` (Indigo 500)
- **Gradient:** `linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)` (Indigo to Purple)
- **Icon Element:** Handshake emoji 🤝 or abstract "welcome" symbol
- **Sparkle accents:** For approachability

### Emoji Representation
**Primary:** 🤝 (handshake — welcoming, partnership)
**Alternate:** ✨ (sparkle — friendly energy)
**Combined:** 🤝✨

### Color Palette

| Use | Color | Hex |
|-----|-------|-----|
| Primary | Indigo | `#6366f1` |
| Secondary | Purple | `#8b5cf6` |
| Accent | Emerald | `#10b981` |
| Background | Dark Navy | `#1a1a2e` |
| Text | White | `#ffffff` |
| Muted | Gray | `#9ca3af` |

---

## Avatar Variations

### Chat Avatar (Small)
- 40x40px
- Gradient background
- White "J" initial or 🤝 emoji
- Subtle glow effect

### Profile Card (Medium)
- 80x80px
- Full icon with sparkles
- Name below

### Hero/Feature (Large)
- 200x200px
- Detailed illustration style
- Animated sparkles (if animated)

---

## Suggested Icon Designs

### Option A: Abstract Welcome
```css
/* Gradient circle with arms-open silhouette */
background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
/* White abstract human figure with open arms */
```

### Option B: Friendly Initial
```css
/* Rounded square with stylized "J" */
background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
/* Cursive or friendly "J" in white */
/* Small sparkle accent ✨ */
```

### Option C: Chat Bubble Person
```css
/* Speech bubble shape with friendly face */
background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
/* Minimalist smile :) inside bubble */
```

---

## For Figma/Design Handoff

### Icon Requirements
1. **SVG format** for web use
2. **PNG at 1x, 2x, 3x** for different devices
3. **Dark mode** version (lighter gradient)
4. **Favicon** version (simple, recognizable at 16px)

### Animation (Optional)
- Subtle pulse/glow on hover
- Sparkle animation when Jess responds
- Typing indicator with personality

---

## Sample CSS for Chat Avatar

```css
.jess-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
  position: relative;
}

.jess-avatar::after {
  content: '🤝';
}

/* Online indicator */
.jess-avatar::before {
  content: '';
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: #10b981;
  border-radius: 50%;
  border: 2px solid #1a1a2e;
}
```

---

## In-App Appearance

### Chat Interface
```
┌─────────────────────────────────────────────┐
│ 🤝  Jess                           ● Online │
├─────────────────────────────────────────────┤
│                                             │
│     ┌──────────────────────────────────┐   │
│     │ Hey! Welcome to [Company]. 👋    │   │
│     │ I'm Jess, and I'm here to get    │   │
│     │ you set up.                      │   │
│     └──────────────────────────────────┘   │
│                                 🤝 Jess     │
│                                             │
└─────────────────────────────────────────────┘
```

### Typing Indicator
```
🤝 Jess is typing...
   ● ● ●
```

---

## Voice & Tone Reinforcement

Jess's visual identity should convey:
- **Approachable:** Rounded shapes, warm gradients
- **Professional:** Clean design, not cartoonish
- **Helpful:** Welcome/handshake symbolism
- **Modern:** Gradient style matches tech aesthetic

---

## Related Agents (Visual Differentiation)

| Agent | Emoji | Primary Color | Role |
|-------|-------|---------------|------|
| **Jess** | 🤝 | Indigo `#6366f1` | Onboarding |
| **Sophie** | ✨ | Purple `#8b5cf6` | Client support |
| **Max** | 💪 | Blue `#3b82f6` | Sales assistant |
| **Alex** | 📊 | Teal `#14b8a6` | Analytics |

---

*Jess should feel like the friendly first contact — warm, professional, ready to help.*
