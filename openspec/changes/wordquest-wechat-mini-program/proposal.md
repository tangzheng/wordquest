## Why

WordQuest 作为一款面向儿童的剑桥少儿英语词汇学习游戏，需要更广泛的分发渠道。微信小程序拥有数亿日活用户，且微信生态适合教育类应用的传播分享（群分享、小程序码等），能够触达更多目标用户。

## What Changes

- **BREAKING**: 项目从纯 Web 应用迁移到 Taro + React 跨平台框架
- 新增微信小程序端（H5 端保留）
- 使用 Taro 3.x + React，保持与现有代码最大兼容性
- 适配微信小程序 UI 规范（顶部导航、底部 tabBar 等）
- 集成微信开放能力（分享、订阅消息、用户信息等）
- 数据存储从 localStorage 迁移到小程序 Storage

## Capabilities

### New Capabilities

- `wechat-mini-program`: 微信小程序宿主适配层
  - 微信小程序入口配置和页面路由
  - TabBar 导航栏配置
  - 小程序分享功能集成
- `taro-cross-platform`: Taro 跨平台适配
  - 统一抽象的存储层（Taro.Storage vs localStorage）
  - 统一的音频/TTS 服务适配
  - 跨平台动画兼容层
- `wechat-login`: 微信登录与用户体系
  - 微信一键登录
  - 小程序用户数据绑定

### Modified Capabilities

- 无（游戏逻辑和玩法保持不变，仅改变运行平台）

## Impact

- 新建 `wordquest-taro/` 目录作为 Taro 项目根目录
- 迁移现有 `src/` 到 `wordquest-taro/src/`
- 需要新增 `wordquest-taro/config/` 配置小程序相关参数
- 添加微信小程序特有的 `project.config.json`
- 依赖变化：新增 `@tarojs/taro`, `@tarojs/plugin-platform-weapp` 等
- Web 版本保留在原 `wordquest/` 目录，通过 Taro 构建时选择目标平台
