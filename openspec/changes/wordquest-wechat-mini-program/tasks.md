## 1. Project Setup

- [x] 1.1 Initialize Taro project: `npx create-taro@latest wordquest-taro --framework react`
- [x] 1.2 Install dependencies: `@tarojs/plugin-platform-weapp`, `framer-motion`, `zustand`
- [ ] 1.3 Configure `config/index.ts` for Mini Program platform
- [ ] 1.4 Create `project.config.json` for WeChat DevTools
- [ ] 1.5 Set up project structure mirroring existing `wordquest/src/`

## 2. Cross-Platform Adapter Layer

- [ ] 2.1 Create `src/adapters/storage.ts` - unified storage interface
- [ ] 2.2 Create `src/adapters/audio.ts` - platform-aware audio service
- [ ] 2.3 Create `src/adapters/tts.ts` - platform-aware TTS service
- [ ] 2.4 Create `src/adapters/haptics.ts` - haptic feedback (WX API on mini)
- [ ] 2.5 Update `vite.config.ts` removal note for web

## 3. Game Store Migration

- [ ] 3.1 Migrate `useGameStore` to use new storage adapter
- [ ] 3.2 Migrate `useSessionStore` to use new storage adapter
- [ ] 3.3 Verify persistence works on both platforms

## 4. Component Migration

- [ ] 4.1 Copy and adapt `src/components/ui/*` (Button, Card, ProgressBar, etc.)
- [ ] 4.2 Copy and adapt `src/components/screens/*` (Home, Game, Results, etc.)
- [ ] 4.3 Copy and adapt `src/components/game/*` (PictureWordMatch, ListenAndSpell, etc.)
- [ ] 4.4 Copy and adapt `src/hooks/*` (useSound, useTTS, useConfetti)
- [ ] 4.5 Copy and adapt `src/services/*` (audio, tts)

## 5. Static Resources

- [ ] 5.1 Copy `src/data/*` (words, topics, alphabet)
- [ ] 5.2 Copy `src/engine/*` (scoring, sessionManager, badges)
- [ ] 5.3 Copy `src/types/*` and update for Taro compatibility
- [ ] 5.4 Copy `src/utils/*` (shuffle, random, date)
- [ ] 5.5 Update font loading to use CDN URLs

## 6. Mini Program Specific Configuration

- [ ] 6.1 Create `src/app.config.ts` (tabBar, pages, window config)
- [ ] 6.2 Create `src/pages/index/index.config.ts` (page-specific config)
- [ ] 6.3 Configure `app.json` with pages routing
- [ ] 6.4 Set up TabBar icons (local PNG files)
- [ ] 6.5 Add `src/ swan.json`, `src/alipay.json` etc. for platform configs

## 7. Share & Login Integration

- [ ] 7.1 Implement `onShareAppMessage` for game sharing
- [ ] 7.2 Implement `onShareTimeline` for朋友圈 sharing
- [ ] 7.3 Add WeChat login button and user profile binding
- [ ] 7.4 Handle anonymous mode gracefully

## 8. Testing & Build

- [ ] 8.1 Run `npm run dev:weapp` and test in WeChat DevTools
- [ ] 8.2 Fix any Taro compatibility issues (CSS, API differences)
- [ ] 8.3 Verify all game modes work correctly
- [ ] 8.4 Run `npm run build:weapp` for production build
- [ ] 8.5 Verify package size is under 2MB

## 9. Deployment

- [ ] 9.1 Create WeChat Mini Program account and App ID
- [ ] 9.2 Configure App ID in project.config.json
- [ ] 9.3 Submit for review in WeChat Mini Program后台
- [ ] 9.4 Deploy after approval
