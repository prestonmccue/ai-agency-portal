# Lessons Learned - AI Agency Portal

## Session 1: Initial Build (Feb 27, 2026)

### What Worked Well
- **Boris Cherny method**: Writing comprehensive plan first saved time
- **Vercel AI SDK**: Made streaming chat interface trivial to implement
- **Clerk**: Auth setup in < 5 minutes, no boilerplate
- **OpenRouter**: Easy proxy to Claude without managing API directly

### Technical Decisions
- **Chose Clerk over NextAuth**: Faster setup, better UX, handles edge cases
- **Used edge runtime for chat API**: Lower latency for streaming
- **Tailwind + custom components**: Faster than waiting for shadcn CLI
- **Mock data first**: Built UI before database integration (iterate faster)

### Challenges Overcome
- **Directory conflict**: create-next-app failed because tasks/ existed
  - Solution: Manually created package.json and structure
- **TypeScript strict mode**: Required proper typing from start
  - Benefit: Caught potential bugs early

### Next Time
- Set up database migrations from start (not just schema)
- Add error boundaries earlier
- Consider Playwright tests for critical flows
- Document API contracts before building

### Code Quality Notes
- Keep components under 200 lines (split chat-interface if it grows)
- Use server components by default, client only when needed
- Validate all API inputs with Zod (not implemented yet - TODO)

---

*Updated after Phase 1 & 2 completion*
