## ADDED Requirements

### Requirement: WeChat Login

The system SHALL provide WeChat one-click login using wx.getUserProfile API.

#### Scenario: New user logs in

- **WHEN** user opens the mini program for the first time
- **THEN** a login prompt is displayed asking for permission to access user info
- **AND** upon consent, user is logged in automatically

### Requirement: Anonymous Usage Option

The system SHALL allow users to play without logging in, with progress stored locally.

#### Scenario: User declines login

- **WHEN** user declines the login prompt
- **THEN** the app continues in anonymous mode
- **AND** game progress is stored in local device storage

### Requirement: User Data Binding

The system SHALL bind game progress to user account when logged in, enabling cross-device sync.

#### Scenario: User logs in on new device

- **WHEN** user logs in on a new device
- **THEN** their previous game progress is synced from cloud storage
