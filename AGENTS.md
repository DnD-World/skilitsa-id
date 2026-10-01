<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Project rules

- Biometric matching is simulated in the browser; the public scanner calls the `scan_match` database function so anonymous finders only see reunion-card fields. Why: real vision models can't run on the edge runtime.
- Dog photos are resized client-side and stored as data URLs on the dog row. Why: workspace blocks public storage buckets and finders need the photo without signing in.
- Owner data (dogs, expenses, health, wallet, food bags, settings) is read/written from the browser client under owner-scoped RLS. Why: simple CRUD, no server logic needed.
- Signed-in pages live under `src/routes/_authenticated/`; `/`, `/scan`, `/auth` are public.
