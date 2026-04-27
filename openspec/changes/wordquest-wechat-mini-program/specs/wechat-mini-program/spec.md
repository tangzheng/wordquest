## ADDED Requirements

### Requirement: WeChat Mini Program Entry Configuration

The system SHALL provide WeChat Mini Program entry configuration including app.json, project.config.json, and page routing setup.

### Requirement: TabBar Navigation

The system SHALL provide TabBar with 4 tabs: Home (首页), Alphabet (字母), Progress (进度), Settings (设置).

#### Scenario: User switches between tabs

- **WHEN** user taps a TabBar item
- **THEN** the corresponding page is displayed with native TabBar animation

### Requirement: Share Functionality

The system SHALL enable WeChat sharing capability with custom share card content.

#### Scenario: User shares the app

- **WHEN** user taps the share button or shares from the results screen
- **THEN** a share card is displayed with game name, description, and mini program QR code

### Requirement: Mini Program窗口适配

The system SHALL adapt to different phone screen sizes and notch configurations using safe-area and standard spacing.

#### Scenario: iPhone with notch

- **WHEN** user uses an iPhone with a notch
- **THEN** content is displayed within the safe area below the status bar
