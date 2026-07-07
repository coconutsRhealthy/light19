# Unused self-hosted logos (not shipped)

These are the downscaled webp shop logos + `avatar.webp` from the short-lived
"self-host logos" experiment (commit a0b649a). The app was reverted to serving
shop logos and the avatar from jsDelivr (`cdn.jsdelivr.net/gh/wgknl/diski-assets`),
so these files are no longer referenced.

They live here (outside `public/`) on purpose: `angular.json` copies
`public/**/*` into the build, so anything here is kept in the repo but **excluded
from the deploy**. Delete this folder if you're sure you won't go back to
self-hosting.

Still shipped (kept in `public/logos/webp/`): `diski-og.webp` — the branded OG
banner, which only exists locally.
