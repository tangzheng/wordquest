## ADDED Requirements

### Requirement: Unified Storage Adapter

The system SHALL provide a unified storage interface that works on both Web (localStorage) and Mini Program (Taro.getStorage/setStorage).

### Requirement: Platform-Aware Audio Service

The system SHALL provide audio playback that uses Web Audio API on H5 and Taro.createInnerAudioContext() on Mini Program.

### Requirement: Platform-Aware TTS Service

The system SHALL provide text-to-speech that uses Web Speech API on H5 and Mini Program's underlying audio player on Mini Program.

### Requirement: Cross-Platform Animation Compatibility

The system SHALL use Framer Motion animations that are compatible with both Web and Mini Program rendering models.

#### Scenario: Playing animations on Mini Program

- **WHEN** user triggers an animation on Mini Program
- **THEN** the animation plays smoothly using the compatible animation approach for Mini Program

### Requirement: Responsive Design Adaptation

The system SHALL adapt UI layouts for Mini Program's standard screen width (750rpx design base).

#### Scenario: Responsive grid layout

- **WHEN** content is displayed on Mini Program
- **THEN** grid layouts use Taro's responsive units (rpx) to adapt to different screen sizes
