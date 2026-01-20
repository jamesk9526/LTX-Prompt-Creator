# LTX Prompter - TODO List

## Current Sprint

### High Priority
- [ ] Improve error handling for Ollama connection failures
- [ ] Add loading states for async operations
- [ ] Implement keyboard navigation for wizard steps
- [ ] Add undo/redo functionality for prompt edits

### Medium Priority
- [ ] Optimize bundle size (currently using full React/Next.js)
- [ ] Add prompt templates library with categories
- [ ] Implement prompt version history
- [ ] Add export to ComfyUI format
- [ ] Add dark/light theme toggle (currently dark only)

### Low Priority
- [ ] Add spell check for prompt text
- [ ] Implement collaborative editing (multi-user)
- [ ] Add voice-to-text for prompt input
- [ ] Create mobile companion app

## Code Quality

### Refactoring
- [ ] Consolidate ChatPanel and VirtualizedChatPanel into single component
- [ ] Reduce wizard/page.tsx complexity (currently 1000+ lines)
- [ ] Extract form validation logic into separate utilities
- [ ] Simplify ChatPanel props (currently 25+ props)
- [ ] Move inline styles to CSS modules

### Technical Debt
- [x] ~~Remove /app/chat directory (legacy popout chat)~~ - Completed in cleanup
- [ ] Migrate from Next.js 14 to Next.js 15
- [ ] Update Electron to latest version (currently v29)
- [ ] Replace deprecated React patterns (e.g., string refs)
- [ ] Add proper error boundaries for all async operations

### Testing
- [x] Quality analyzer tests (18 unit tests) - Completed
- [ ] Add tests for ActionExecutor
- [ ] Add tests for ChatHistoryManager
- [ ] Add E2E tests with Playwright
- [ ] Add visual regression tests
- [ ] Test suite for Ollama integration

## Features

### Planned Features
- [ ] Multi-language support (i18n)
- [ ] Prompt sharing/community features
- [ ] AI model comparison (side-by-side)
- [ ] Custom system prompt editor
- [ ] Batch prompt generation
- [ ] Prompt analytics dashboard

### Ollama Enhancements
- [ ] Support for multiple Ollama endpoints
- [ ] Model performance metrics
- [ ] Token usage tracking
- [ ] Conversation branching
- [ ] Prompt A/B testing

### UI/UX Improvements
- [x] ~~GitHub dark theme with flat design~~ - Completed in cleanup
- [ ] Customizable keyboard shortcuts
- [ ] Drag-and-drop step reordering
- [ ] Prompt preview with syntax highlighting
- [ ] Better mobile/tablet responsiveness
- [ ] Accessibility improvements (ARIA labels, keyboard nav)

## Documentation

### User Documentation
- [x] Comprehensive README - Completed
- [x] Technical documentation (INFO.md) - Completed
- [ ] Video tutorials
- [ ] Interactive onboarding
- [ ] FAQ section
- [ ] Troubleshooting guide

### Developer Documentation
- [ ] API documentation for Ollama integration
- [ ] Component documentation with Storybook
- [ ] Architecture decision records (ADRs)
- [ ] Contributing guidelines
- [ ] Code review checklist

## Infrastructure

### Build & Deploy
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Automated release builds
- [ ] Auto-update mechanism in app
- [ ] Crash reporting integration (Sentry)
- [ ] Analytics integration (optional)

### Performance
- [ ] Lazy load wizard steps
- [ ] Implement service worker for offline mode
- [ ] Optimize image assets
- [ ] Code splitting for better load times
- [ ] Memory leak detection

## Security

### Security Improvements
- [ ] Add content security policy (CSP)
- [ ] Implement rate limiting for Ollama API
- [ ] Sanitize user inputs
- [ ] Secure storage for sensitive settings
- [ ] Add HTTPS-only mode

## Known Issues

### Bugs
- [ ] Quality analyzer shows 0/100 for some Ollama models (partially fixed)
- [ ] Chat history limit not enforced consistently
- [ ] Window resize issues on some Windows versions
- [ ] Occasional IPC timeout errors

### Limitations
- [ ] Windows-only builds (Mac/Linux support planned)
- [ ] No cloud sync (local storage only)
- [ ] 10MB chat history limit
- [ ] Single Ollama endpoint only

## Ideas for Future

- Integration with video generation tools (Stable Diffusion, etc.)
- Prompt marketplace for buying/selling prompts
- AI-powered prompt optimization
- Prompt performance tracking (which prompts work best)
- Integration with professional video editing tools
- Prompt versioning with Git-like features
- Team collaboration features
- Custom plugin system

---

**Last Updated**: January 2026
**Maintained By**: LTX Prompter Team
