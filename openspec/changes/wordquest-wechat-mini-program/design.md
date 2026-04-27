## Context

WordQuest 目前是基于 React + TypeScript + Vite 构建的 Web 应用，托管在 GitHub Pages。游戏使用 localStorage 存储用户数据，使用 Web Audio API 和 Speech Synthesis API 实现音效和 TTS。

迁移到微信小程序面临以下技术挑战：
1. **渲染引擎**：小程序使用原生组件而非 DOM
2. **API 差异**：Storage、Audio、Navigator API 不兼容
3. **包体积限制**：小程序主包不超过 2MB
4. **登录体系**：需要对接微信用户系统

## Goals / Non-Goals

**Goals:**
- 使用 Taro 3.x 框架，一套代码同时支持小程序和 H5
- 保持现有游戏逻辑和 UI 不变
- 复用 90%+ 的现有组件代码
- 小程序能够通过微信审核并上线

**Non-Goals:**
- 不修改游戏核心玩法和交互逻辑
- 不重新设计 UI（保持品牌一致性）
- 暂不支持其他小程序平台（抖音、支付宝等）
- Web 版本暂不重构

## Decisions

### 1. Taro 版本选择

**决策**：使用 Taro 3.6+ (React 18)

**理由**：
- Taro 3.x 对 React 18 支持较好
- 相比 2.x 有更好的性能和兼容性
- 社区生态成熟，插件丰富

### 2. 项目结构

**决策**：在 `wordquest-taro/` 下新建完整项目，原 `wordquest/` 保留

**理由**：
- 不破坏现有 Web 项目的完整性
- 可以独立开发和测试
- 后期可以通过配置决定是否合并回单一仓库

### 3. 存储层抽象

**决策**：创建统一 Storage 适配层

```typescript
// src/adapters/storage.ts
export const storage = {
  get: (key: string) => Taro.getStorage({ key }).then(r => r.data),
  set: (key: string, value: any) => Taro.setStorage({ key, data: value }),
  remove: (key: string) => Taro.removeStorage({ key }),
}
```

### 4. 音频/TTS 适配

**决策**：封装统一 AudioService

```typescript
// src/services/audio.ts
// Web: 使用 Web Audio API
// 小程序: 使用 Taro.createInnerAudioContext()
```

### 5. 包体积优化

**决策**：
- 使用 Tree-shaking 剔除无用代码
- 图片资源使用 CDN 或远程 URL
- 字体使用远程 URL 而非本地打包
- 路由按需加载

### 6. 小程序特定功能

**TabBar 配置**：
- 首页（学习）
- 字母
- 进度
- 设置

**分享能力**：
- 启用 `onShareAppMessage`
- 分享卡片带小程序码和游戏介绍

## Risks / Trade-offs

| 风险 | 影响 | 缓解方案 |
|------|------|----------|
| 小程序包体积超限 | 无法上传 | 图片/字体CDN化，详细评估依赖 |
| Taro 兼容性问题 | 部分组件不工作 | 使用标准 React 组件，避免私有 API |
| 审核被拒 | 无法上线 | 提前阅读小程序审核规范，避开敏感功能 |
| 多端同步维护成本 | 两套代码需同步更新 | Taro 统一构建，同一份代码输出多端 |

## Migration Plan

1. **Phase 1**: 搭建 Taro 项目骨架，配置小程序平台
2. **Phase 2**: 迁移核心游戏组件（复用现有代码）
3. **Phase 3**: 适配存储层、音频服务
4. **Phase 4**: 配置 TabBar、分享等功能
5. **Phase 5**: 提交小程序审核
6. **Phase 6**: 上线后持续迭代

## Open Questions

- 是否需要接入微信广告（流量主）？
- 用户数据是否需要与现有 Web 版数据互通？
- 是否需要支持小程序内购买（VIP、道具等）？
