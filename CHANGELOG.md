# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This changelog is maintained in English.

## [3.0.1] - 2026-10-21

### Removed

- Remove the message center, its navigation entry, local message history, and related translations.

### Fixed

- Improve iOS PWA header and splash backgrounds, and center splash content.

## [3.0.0] - 2026-10-21

### Changed

- Use coordinated pale gray-green and deep green iOS header/status-bar colors while preserving the verified blur suppression and header geometry.

- Test iOS scroll-edge suppression with no status-bar-style meta and a top-level fixed color sampling element, preserving header spacing; refresh app-shell caches.

### Fixed

- Remove the extra portrait header fallback padding in iOS standalone mode when the system already reserves the status bar; keep page and sticky navigation offsets aligned.

- Reset learning state between scenarios and calculate the next scenario from the stage list.
- Preserve completed scenario progress when revisiting for practice.
- Download language content before atomically replacing cached data and clearing all learning progress, with explicit localized confirmation.
- Add accessible modal focus management, keyboard dismissal, and locked-dialog behavior using Radix Dialog.

## [2.0.0] - 2026-08-31

### Added

- Added open-source documentation, an MIT license, and a home-page changelog.
- Added home-page navigation for the changelog and the EffortGo product website.
- Added the project GitHub link to the home-page footer.
- Added offline PWA app-shell and Next.js asset caching, plus cached fallback data for learning routes.

### Changed

- Moved production API and canonical-site configuration into environment and GitHub Actions variables.
- Replaced environment-specific development hosts with an optional configuration value.

## [1.0.0] - 2026-08-25

### Added

- Established the existing LifeStep application as the baseline release for structured changelog maintenance. Detailed changes before this release were not previously recorded.
