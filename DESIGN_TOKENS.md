# txid.uk Design System — Shared Design Tokens

All txid.uk ecosystem sites (txid.uk, learn.txid.uk, tools.txid.uk, etc.) share these tokens.

## Colors

### Brand
| Token | Value | Usage |
|-------|-------|-------|
| accent | `#f7931a` | Bitcoin orange, primary CTA |
| accent-hover | `#e07010` | Darker orange on hover |
| accent-light | `#ffab40` | Lighter accent for highlights |

### Dark Theme (default)
| Token | txid.uk var | Value | Usage |
|-------|-------------|-------|-------|
| bg | `--bg` | `#0d1117` | Page background |
| bg-raised | `--bg2` | `#161b22` | Cards, panels |
| bg-inset | `--bg3` | `#21262d` | Input backgrounds, dividers |
| border | `--border` | `#21262d` | Default borders |
| border-strong | `--border2` | `#30363d` | Emphasized borders |
| text-primary | `--text1` | `#e6edf3` | Body text, headings |
| text-secondary | `--text2` | `#8b949e` | Labels, descriptions |
| text-muted | `--text3` | `#6e7681` | Hints, captions |

### Light Theme
| Token | txid.uk var | Value |
|-------|-------------|-------|
| bg | `--bg` | `#f6f8fa` |
| bg-raised | `--bg2` | `#ffffff` |
| bg-inset | `--bg3` | `#eaeef2` |
| border | `--border` | `#d0d7de` |
| border-strong | `--border2` | `#b8c0cc` |
| text-primary | `--text1` | `#1f2328` |
| text-secondary | `--text2` | `#656d76` |
| text-muted | `--text3` | `#8c959f` |

### Status Colors
| Token | Dark | Light |
|-------|------|-------|
| green | `#3fb950` | `#1a7f37` |
| red | `#f85149` | `#cf222e` |
| blue | `#58a6ff` | `#0969da` |
| yellow | `#d29922` | `#9a6700` |

## Typography

### Font Stacks
| Token | Value | Usage |
|-------|-------|-------|
| font-mono | `'Space Mono', monospace` | Hashes, TXIDs, numbers, code |
| font-sans | `'Pretendard Variable', 'Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif` | UI text, Korean content |
| font-display | `'Pretendard Variable', 'Pretendard', sans-serif` | Headings |

### Font Sizes (reference scale)
| Name | Size | Usage |
|------|------|-------|
| xs | 0.65rem | Badges, micro-labels |
| sm | 0.72rem | Labels, secondary text |
| base | 0.78-0.82rem | Body text, table cells |
| md | 0.9rem | Section titles |
| lg | 1.1rem | Page titles, stat values |
| xl | 1.2-1.3rem | Hero stat values |

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| radius | 8px | Default border-radius |
| radius-sm | 4-6px | Buttons, badges |
| radius-lg | 12px | Modals, large cards |
| max-width | 1200px | Content container |

## Shadows
| Theme | Value |
|-------|-------|
| Dark | `0 4px 12px rgba(0,0,0,0.4)` |
| Light | `0 4px 12px rgba(0,0,0,0.12)` |

## Cross-site CSS Variable Mapping

```
txid.uk (vanilla CSS)     ↔  learn.txid.uk (Tailwind)
─────────────────────────────────────────────────────
--bg                      ↔  --color-surface / bg-gray-950
--bg2                     ↔  --color-surface-raised / bg-gray-900
--accent                  ↔  --color-bitcoin
--font                    ↔  --font-mono
--font-ko                 ↔  --font-sans
```
