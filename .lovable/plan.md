# Update Discord link

Replace the old Discord invite `https://discord.gg/yuW3HM8w` with `https://discord.gg/ZBNyHkkX` everywhere it appears:

- `src/components/site-header.tsx` (line 7, `DISCORD_URL` constant — covers desktop + mobile nav)
- `src/routes/meetups.index.tsx` (line 157, empty-state CTA)
- `README.md` (line 5, project links)

No other logic changes.
