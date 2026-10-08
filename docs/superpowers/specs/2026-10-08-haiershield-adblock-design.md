# HaierShield — Android TV Ad Blocker for Haier TVs

**Date:** 2026-10-08
**Status:** Design Approved
**Target:** Haier Android TV (sideloaded APK)

## Problem

Haier Android TVs display intrusive system-level advertisements:
1. **Pop-up/overlay ads** — appear on top of content, difficult to dismiss manually
2. **Notification ads** — push notifications promoting products/deals

These ads originate from Haier's own pre-installed software, not from internet content.

## Solution

An Android TV app called **HaierShield** that blocks both types of ads using three complementary mechanisms:

1. **Accessibility Service** — detects and auto-dismisses ad overlay pop-ups
2. **Local VPN DNS Blocker** — blocks ad-serving domains at the DNS level
3. **Notification Listener** — auto-clears ad notifications

## Architecture

```
┌─────────────────────────────────────────────┐
│              HaierShield App                │
│                                             │
│  ┌──────────────┐  ┌─────────────────────┐  │
│  │ AdOverlay    │  │  DnsBlockerVpn      │  │
│  │ Detector     │  │  (VpnService)       │  │
│  │ (Accessible) │  │                     │  │
│  └──────────────┘  └─────────────────────┘  │
│                                             │
│  ┌──────────────┐  ┌─────────────────────┐  │
│  │ AdNotif      │  │  TV UI              │  │
│  │ Cleaner      │  │  (Leanback)         │  │
│  │ (NotifListen)│  │                     │  │
│  └──────────────┘  └─────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │ Shared: BlocklistManager + StatsDB   │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Components

| Component | Type | Purpose |
|---|---|---|
| `AdOverlayDetector` | AccessibilityService | Monitor screen events, detect ad overlays by package + UI pattern, auto-click dismiss |
| `DnsBlockerVpn` | VpnService | Local VPN intercepting DNS (UDP 53), block ad domains → return 0.0.0.0 |
| `AdNotifCleaner` | NotificationListenerService | Listen notifications, auto-cancel from Haier ad packages |
| `BlocklistManager` | Singleton | Manage ad domain list (hardcoded defaults + user custom). HashMap for O(1) lookup |
| `StatsTracker` | Room Database | Persist daily counts: popups dismissed, DNS blocked, notifications cleared |
| `SetupWizard` | Activity/Fragments | First-launch permission guide (Accessibility → VPN → Notification) |
| `MainDashboard` | Leanback Activity | Single screen: master toggle, per-service toggles, stats, status |
| `BootReceiver` | BroadcastReceiver | Auto-start all services on TV reboot |

## Detection Logic

### Accessibility Service — Popup Detection

Three-layer detection strategy:

1. **Package-based (primary):** If the new window's source package matches known Haier ad packages → auto-dismiss immediately.
   - Known packages: `com.haier.advertise`, `com.haier.ads`, `com.haier.push`, `com.haier.ott.ad`, `com.haier.ott.push`, `com.haier.smartcare.ad`
   - This list will be expanded during implementation via research on actual Haier TV packages.

2. **Pattern-based (secondary):** If source package is unknown but window contains dismiss-button patterns within an overlay → auto-dismiss.
   - Text patterns: "Close", "×", "✕", "Skip", "关闭", "跳过", "Tutup", "Dismiss", "OK"
   - Content-description patterns: "close", "dismiss", "skip"
   - Only triggers for TYPE_WINDOW_STATE_CHANGED on overlay/dialog windows.

3. **Fallback:** If an overlay from a Haier package has no identifiable dismiss button → send GLOBAL_ACTION_BACK.

**Safeguards:**
- Whitelist for legitimate Haier packages (settings, launcher core, input selector, HDMI) — never auto-dismiss these.
- Cooldown: max 1 dismiss action per 500ms to prevent rapid-fire loops.
- Log every action for user transparency.

### DNS Blocker — Domain Filter

```
DNS request (UDP port 53) → VPN intercepts
  → Parse query → extract domain name
  → HashMap.containsKey(domain) OR wildcard suffix match
  → BLOCKED: return DNS response with 0.0.0.0
  → CLEAN: forward to upstream DNS (default: 8.8.8.8, configurable)
```

**Default blocklist domains:**
```
ads.haier.com
ad.haier.net
push.haier.com
adsapi.haier.com
tracker.haier.com
analytics.haier.com
adservice.haier.com
log.haier.com
adcdn.haier.com
push.haigeek.com
```

- Wildcard support: `*.ads.haier.com` blocks all subdomains.
- User can add/remove custom domains via UI.
- Stored in SharedPreferences as a Set<String>.

### Notification Listener — Auto-Clear

```
Notification posted → onNotificationPosted callback
  → Check source package against Haier ad package list
  → If match → cancelNotification(key)
  → If package unknown → check notification text for ad keywords
      Keywords: "promo", "sale", "diskaun", "discount", "offer",
               "deal", "推荐", "优惠", "limited time", "tawaran"
  → If keyword match AND package is from Haier (com.haier.*) → cancel
  → Log to StatsTracker
```

**Safe approach:** System notifications (USB connected, HDMI, update available, low storage) are never cancelled — filtered by notification category and channel.

## UI Design

### Main Dashboard (Single Screen)

```
┌─────────────────────────────────────────────────┐
│  🛡️ HaierShield                    [ON / OFF]  │
│─────────────────────────────────────────────────│
│                                                 │
│  Status: ● Active — Protecting your TV          │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │  📊 Today                               │    │
│  │  Pop-ups blocked:       12              │    │
│  │  DNS ads blocked:       847             │    │
│  │  Notifications cleared: 3              │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────┐ ┌──────────────────────┐   │
│  │ ⚡ Popup Blocker │ │ 🌐 DNS Blocker       │   │
│  │    [ON]         │ │    [ON]              │   │
│  └─────────────────┘ └──────────────────────┘   │
│  ┌─────────────────┐ ┌──────────────────────┐   │
│  │ 🔔 Notif Blocker│ │ ⚙️ Custom Domains    │   │
│  │    [ON]         │ │    [3 added]         │   │
│  └─────────────────┘ └──────────────────────┘   │
│                                                 │
│  ⓘ Boot: Auto-start enabled                    │
└─────────────────────────────────────────────────┘
```

**UI Constraints:**
- D-pad navigation only (TV remote: up/down/left/right/OK)
- Clear focus states with highlighted borders
- Large text (minimum 18sp body, 24sp headers) readable from sofa distance
- Green = active, grey = disabled
- Dark theme (suits TV viewing)
- Leanback library for Android TV compatibility

### Setup Wizard (First Launch Only)

Linear 5-step flow:

| Step | Screen | Action |
|---|---|---|
| 1 | Welcome | Explain what app does, "Get Started" button |
| 2 | Popup Blocker | Explain permission, button opens Accessibility Settings |
| 3 | DNS Blocker | Explain permission, accept VPN connection dialog |
| 4 | Notif Blocker | Explain permission, button opens Notification Listener Settings |
| 5 | Complete | Show "All set! ✅", go to Dashboard |

Each step auto-detects when permission is granted and shows a checkmark. "Skip" option available for each step (can enable later from dashboard).

### Custom Domains Screen

Simple list UI:
- Shows current custom blocked domains
- "Add Domain" button → text input dialog
- Long-press to remove
- "Reset to Defaults" option

## Permissions

| Permission | Android API | Purpose | User Action Required |
|---|---|---|---|
| `BIND_ACCESSIBILITY_SERVICE` | Declared in manifest | Popup detection & dismiss | Enable in Settings → Accessibility |
| VPN (`android.net.VpnService`) | `VpnService.prepare()` | Local DNS filtering | Accept system VPN dialog |
| `BIND_NOTIFICATION_LISTENER_SERVICE` | Declared in manifest | Auto-clear ad notifications | Enable in Settings → Notification access |
| `RECEIVE_BOOT_COMPLETED` | Manifest permission | Auto-start on reboot | None (automatic) |
| `FOREGROUND_SERVICE` | Manifest permission | Keep services alive | None (automatic) |
| `INTERNET` | Manifest permission | Forward clean DNS queries | None (automatic) |

## Error Handling

| Scenario | Response |
|---|---|
| Accessibility service killed by OS | Auto-restart via `onServiceConnected`. Foreground notification maintains process priority. |
| VPN disconnected unexpectedly | Auto-reconnect with exponential backoff (1s, 2s, 4s, max 30s). Status shows "Reconnecting..." |
| Permission revoked by user | Warning banner on dashboard with direct button to re-enable. Service gracefully stops. |
| TV reboot | `BootReceiver` triggers, starts all previously-enabled services. |
| Blocked domain breaks legit feature | User adds domain to whitelist via Custom Domains screen. |
| Memory pressure / battery optimization | Request user to disable battery optimization for HaierShield during setup. |
| Blocklist empty | Fall back to hardcoded default list. |

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Kotlin |
| Min SDK | API 21 (Android 5.0 Lollipop) — covers all Haier Android TVs |
| Target SDK | API 33 |
| UI Framework | AndroidX Leanback (TV-optimized) |
| Database | Room (stats persistence) |
| Build | Gradle with Kotlin DSL |
| Architecture | MVVM with LiveData for reactive UI updates |
| DNS Parsing | Manual UDP packet parsing (lightweight, no external deps) |

## Project Structure

```
app/
├── src/main/
│   ├── java/com/haiershield/
│   │   ├── HaierShieldApp.kt              # Application class
│   │   ├── service/
│   │   │   ├── AdOverlayDetector.kt        # AccessibilityService
│   │   │   ├── DnsBlockerVpn.kt            # VpnService + DNS parsing
│   │   │   ├── AdNotifCleaner.kt           # NotificationListenerService
│   │   │   └── BootReceiver.kt             # BroadcastReceiver
│   │   ├── data/
│   │   │   ├── BlocklistManager.kt         # Domain blocklist management
│   │   │   ├── StatsTracker.kt             # Stats tracking interface
│   │   │   ├── db/
│   │   │   │   ├── AppDatabase.kt          # Room database
│   │   │   │   ├── StatsDao.kt             # Data access object
│   │   │   │   └── StatsEntity.kt          # Entity (date, popup, dns, notif counts)
│   │   │   └── PrefsManager.kt             # SharedPreferences wrapper
│   │   ├── ui/
│   │   │   ├── MainActivity.kt             # Leanback entry point
│   │   │   ├── DashboardFragment.kt        # Main dashboard UI
│   │   │   ├── SetupWizardActivity.kt      # First-launch permission wizard
│   │   │   ├── SetupStepFragment.kt        # Individual wizard step
│   │   │   └── CustomDomainsFragment.kt    # Domain list management
│   │   └── util/
│   │       ├── DnsPacketParser.kt          # Parse/construct DNS UDP packets
│   │       ├── AdPatterns.kt               # Constants: package names, keywords, patterns
│   │       └── ServiceUtils.kt             # Service start/stop helpers
│   ├── res/
│   │   ├── layout/                         # TV-optimized layouts
│   │   ├── values/
│   │   │   ├── strings.xml                 # Malay + English strings
│   │   │   ├── colors.xml                  # Dark theme colors
│   │   │   └── styles.xml                  # Leanback theme overrides
│   │   └── xml/
│   │       └── accessibility_config.xml    # Accessibility service config
│   └── AndroidManifest.xml
├── build.gradle.kts
└── proguard-rules.pro
```

## Out of Scope

- Blocking ads inside third-party streaming apps (YouTube, Netflix, etc.)
- Cloud-based blocklist updates (keep it fully offline/local)
- Root-required features
- Remote management / multi-TV control
- Ad blocking in web browsers
