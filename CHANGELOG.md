# Change Log

All notable changes to the "smart-theme-switcher" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.0.9] - 2026-06-02

- Fixed Doki Theme compatibility: themes with UUID/hash-based IDs now apply correctly
- Internal theme ID is now prioritized over label when setting themes
- Added 150ms verification delay to ensure VS Code processes theme changes
- Broader verification check accepts any valid candidate after theme update
- "Select All" and "Clear All" in Add Favorite now work as live in-place toggles
- Selecting "Select All" checks every theme without closing the picker
- Selecting "Clear All" unchecks everything without closing the picker
- Users can continue adjusting selection before confirming with Enter

## [0.0.8] - 2026-05-29

- Live theme preview in all pickers (hover to preview, click eye button for 5s preview)
- Configurable latitude/longitude for accurate sunrise/sunset times
- Auto-detect location via IP when enabling time mode
- "Select All Themes" option in Add Favorite picker
- Optimized startup performance (onStartupFinished instead of *)
- Sync getAllThemes() with deduplication via Set
- Event listeners and intervals properly disposed on deactivate

## [0.0.6] - 2026-05-07

- Added demo GIFs to README (Workspace Mode and Language Mode)
- Update version 0.0.6
- Compatible with Antigravity and Visual Studio