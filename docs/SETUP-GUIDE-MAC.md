# Setup guide for Mac: from nothing to a working repo

Written for a designer who has not used a terminal or Git before. Everything below can be done by clicking, with Claude doing the typing. Commands are shown only where there is no click alternative.
Facts here were checked against Anthropic's and Figma's current documentation; menu wording can change, so if a name differs slightly, look for the closest match.

## 0. What you need before you start (10 minutes)
1. **A paid Claude plan** (Pro, Max, Team or Enterprise). Claude Code is not available on the free plan. Check usage at Settings > Usage; heavy parallel work uses a lot, so for the build week Max 5x is the safe choice.
2. **A Figma Full or Dev seat on a paid plan.** Free or View seats get only 6 Figma tool calls a month, which is not enough. Paid seats get about 200 reads a day.
3. **A free GitHub account** (github.com > Sign up). Use a company account if your organisation requires it. Ask your engagement lead, because the designs are confidential. Always make the repo **private**.
4. **Node.js** (the engine that runs the website while you build). Download the **LTS** macOS installer from nodejs.org and run it. Claude's Code tab itself does not need it, but the website does.
5. About 3 GB free disk space.

## 1. Install Claude and open the Code tab (5 minutes)
1. Download Claude for macOS from claude.ai/download (one universal build for Intel and Apple Silicon). Open the .dmg, drag Claude to Applications, launch it, sign in.
2. Click the **Code** tab at the top of the sidebar (hover over icons to see names).
3. If you see "upgrade", you need a paid plan. If you get a sign-in prompt, finish it and restart the app.

## 2. Make the project folder (5 minutes)
1. In Finder, create a folder: **Documents > visiontype-prototype**.
2. Unzip the starter kit and move its **contents** into that folder so it looks like this:
```
visiontype-prototype/
  CLAUDE.md
  docs/        (screens-manifest.md, component-inventory.md, BUILD-PROMPTS.md, this guide)
  tokens/      (tokens.json, tokens.css, hex-snap-map.json)
  data/        (cast.json, rules.json, ask.json)
```
`CLAUDE.md` must be at the top level. Claude Code reads it automatically at the start of every session; it holds all the project rules.

## 3. Start your first session
1. In the Code tab, under the prompt box, click the first control (the environment selector) and pick the top entry in the **Local** group.
2. Click the folder control next to it, choose **Open folder...** and select `visiontype-prototype`.
3. Pick a model from the model picker (the strongest available model is best for the foundation work; a faster one is fine for small fixes).
4. Look at the **permission mode** under the prompt box:
   - **Plan**: Claude proposes an approach and changes nothing. Use it for the first message of every phase.
   - **Manual**: Claude asks before every change. Good for your first hour.
   - **Accept edits**: Claude edits files without asking; you review the diff (the "+12 -1" button). Good once you trust the setup.
   - **Auto**: a background check blocks risky actions. Fine later.
5. First message: `Read CLAUDE.md and tell me, in 5 lines, what we are building and what the rules are.` If it answers correctly, you are set.

## 4. Connect Claude Code to Figma (10 minutes)
Claude Code reads your designs through Figma's official server (https://mcp.figma.com/mcp). The simplest route:
1. In the desktop app, look for **Plugins** (the **+** menu near the prompt box). Search for **Figma** and install it. If you cannot find it, use option B.
2. **Option B (needs the terminal once):** open Terminal and run `curl -fsSL https://claude.ai/install.sh | bash` to install the Claude Code command line, then run `claude plugin install figma@claude-plugins-official`. (Manual alternative from Figma's docs: `claude mcp add --transport http figma https://mcp.figma.com/mcp`.)
3. Restart Claude Code. Type `/mcp`, choose **figma**, and sign in in the browser with the Figma account that has the Full or Dev seat.
4. Test: paste the Phase 0 prompt from `docs/BUILD-PROMPTS.md`. Claude should name your Figma account and describe the Home dashboard.
Tip: Figma limits read calls per minute and per day, so Claude is told in CLAUDE.md to read one frame at a time and not repeat itself.

## 5. Turn the folder into a repo (Git)
A **repo** is just this folder plus a saved history of every change, so you can undo anything. Git is the tool that keeps the history.
1. Ask Claude: `Set up git in this folder, add a sensible .gitignore, and make the first commit with a clear message.`
2. If your Mac asks to install **developer tools** (Xcode Command Line Tools), click **Install** and wait a few minutes, then ask Claude to try again.
3. From now on, the rhythm is: **work > check the preview > "commit this with a clear message"**. A commit is a save point.

## 6. Put the repo on GitHub (backup and, later, sharing)
Easiest, no commands:
1. Download **GitHub Desktop** (desktop.github.com), sign in.
2. **File > Add Local Repository...** and pick `visiontype-prototype`.
3. Click **Publish repository**. Name it `visiontype-prototype`, **tick "Keep this code private"**, Publish.
4. After a work session, open GitHub Desktop and click **Push origin** (or tell Claude: `commit and push`).
Alternative: ask Claude to create and push the repo using the GitHub connector, if you have connected GitHub in the app.
Never put passwords or keys into any file in this folder.

## 7. Build the thing
1. Open `docs/BUILD-PROMPTS.md`. Work through **Phase 0 to 3 in order**, one new session each, pasting the prompt. Phase 2 (components) is the most important: it is what makes everything after it quick.
2. **See your work:** when Claude starts the dev server, the app opens in the **Browser pane** inside Claude (or open the address it gives, usually http://localhost:5173, in Safari or Chrome). Claude can look at the running page too, so you can say "the table header looks too tall, fix it".
3. **Give feedback with screenshots:** paste an image of the problem and say what you expected.
4. **Steer:** press Stop to interrupt, or type a correction and press Enter.
5. **If something breaks:** `Undo the last change` or `Go back to the last commit.`

## 8. Work on several pages at once (after Phase 3)
1. Click **New session** in the sidebar for each page group (dashboards, Data, entity pages, Rules, Ask). Sessions can run side by side, optionally each in its own Git worktree (a separate working copy, so they cannot overwrite each other).
2. Start each with: `Create a new branch for this task.` Then paste its Phase 4 prompt.
3. When a page is done and committed, tell any session: `Merge branch page/xxx into main, resolve conflicts carefully and run the build.` Merge the shared-component changes first.
4. Parallel work uses your usage allowance faster. Watch your usage page.

## 9. Present on Thursday
1. Ask Claude: `Run the production build and preview it so I can present offline.` Fonts and assets are self-hosted, so it works without Wi-Fi.
2. The night before: open the preview, run through the guided path twice (Premium dashboard > Data > row > song page > switch to IFPI user > Rules > Ask), switch Light/Dark/System once, turn off notifications and sleep, set Dark as the default.
3. **Backups:** keep the Figma prototype ready, and screen-record the full walkthrough as a video.
4. **Cut order if time is short:** Ask to one conversation, light mode to key screens only, then the widget builder.

## 10. Sharing the link after the presentation
Run Phase 6. In short: the build is a folder of static files. Host it on a free static host (Cloudflare Pages, Netlify or Vercel), and put it behind a passcode or email login, because the project is confidential. Agree the host and the access control with your DevOps engineer first. The hosting choice is a prototype decision only; record it as such (the Track Plan warns against it being read as the MVP cloud decision).

## Troubleshooting
| Problem | Fix |
|---|---|
| "command not found: npm" or "node" | Install Node.js LTS from nodejs.org, then restart Claude. |
| 403 or sign-in error in the Code tab | Sign out and in again; see Anthropic's desktop troubleshooting page. |
| Figma tool says rate limited | Wait a minute (per-minute limit) or until tomorrow (daily limit). Check your seat type. |
| Blank page in the preview | Ask: `Read the browser console and fix the errors.` |
| "Port already in use" | Ask Claude to stop the old server and start again. |
| Two sessions changed the same file | Ask: `Show me the merge conflict and resolve it, keeping both changes.` |
| Hit the usage limit mid-build | Wait for the window to reset, or move to Max for the week. Do small, focused prompts. |
| You are lost | Ask: `Summarise where we are, what is committed, and what we should do next.` |

## Glossary
**Repo**: the project folder plus its history. **Commit**: a save point. **Branch**: a separate line of work, so experiments do not touch the main version. **Merge**: bring a branch back into main. **Push**: upload your commits to GitHub. **Dev server**: the temporary website running on your Mac while you build. **Build**: the finished, optimised version of the site. **Token**: a named design value such as a colour or spacing.
