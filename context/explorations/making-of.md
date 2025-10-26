# The Making of Agor: how the pieces clicked in under a month

This is not a product launch post. It’s the story of how a piece of software came to be—why it felt inevitable, what lined up, and how it got built fast. If you want the what, go to https://agor.live. This is the how.

Once in a blue moon, stars line up and something new pops into existence with real potential to change how people work together. History is full of these convergence moments. Ideas and innovation aren’t giant leaps so much as key inflection points where prior art snaps into place. This is the short story of how Agor came to be—and how, pretty much as a single engineer, I was able to launch a pretty incredible open source project in under a month.

Quick intro: I’m Max (`@mistercrunch` on GitHub). A while back I created Apache Airflow and Apache Superset. Everyone in data knows Airflow. And everyone—period!—should know Superset. It’s an AMAZING open source project quietly taking over BI. Tableau/Looker-killer levels. It’s ready to take over the world → check it out.

I’ve worked in the open for a decade with, let’s say, varied success (womp womp). The main enemy has always been focus. Being a good maintainer is hard, and attention is a currency. You have to concentrate it for anything meaningful to grow.

This one’s about how Agor happened, and I’m putting humility aside because I’m honestly a little shocked by how quickly it came together. Here’s what had to click for the software to click.

## Understanding the problem space

Nothing truly interesting gets built without deep intimacy with the problem. Since agentic coding crossed the “this is actually good” threshold, I’ve been all-in: 60+ hour weeks of trying tools, reading every SDK release, absorbing upgrade notes, watching the demos, feeling the rough edges.

From the moment this got good, it was obvious SDLC would never be the same. I told my team to drop everything, put every engineer/PM/designer on Claude Max Pro, and started doing frequent brown-bags to figure out how to channel this insanity. I wrote little tools (like Claudette) to sand down friction and let my own workflow reshape around agents.

Very quickly I found myself spinning 5–6 parallel sessions, plate-spinning across models. I even grabbed a Mac Studio to remove compute bottlenecks, tried Codespaces, anything to remove friction. The superpower was real; the orchestration was not.

## The cracks

We’ve always shared code via git—great, but isolating. With agents, a new problem appeared: zero visibility into each other’s agentic sessions, and even worse at the environment level. I wrote Showtime to share Superset environments on PRs. That helped… but it’s still too slow at agent speed.

Sharing environments is table stakes, but still feels like a still photograph of a dance. Watching screenshots of a TikTok group dance doesn’t work. We need to collaborate while the software basically writes itself.

The biggest waste? Handoffs and async. By the time QA or an acceptance-testing PM sees it, the clay’s already drying. The decisions happened upstream. We needed stakeholders close while features were literally emerging. But push/pull/build, Slack pings, broken envs, weird workflows—it’s all a mess.

## A place to make it all happen

Figma changed how designers work with each other and with stakeholders. Why not bring that collaboration pattern to SDLC? The building blocks were all sitting there: agentic tools, repos, git worktrees, build systems, Docker, and well-understood multiplayer patterns from other software.

Take the ingredients. Bake the cake.

## The perfect storm

A lot had to line up for this to snap together:

- Models got good at coding: Try going back to GPT‑3.5 to write real code. Good luck. Sonnet 3.7 and the latest wave are legitimately AMAZING, easily surpassing what most humans can do in the stacks I use. Props to the folks doing the magic in the deep end—and to the funding and hardware ecosystems. It’s wild.
- Agentic tooling matured: Earlier this year, “agent” went from demo to useful. Real loops. Real tools.
- SDKs arrived: Without proper SDKs, you can’t repackage workflows. Suddenly, you can orchestrate, not just prompt.
- Collaboration patterns are learned: Figma, Slack, Notion, etc., didn’t just build products—they trained the world how to collaborate.
- The ecosystem is a cheat code: npm, PyPI—decades of compounding leverage. Modern software is collage. Agor is no different.

## The personal stack (aka why it moved fast)

Putting humility aside for a minute:

- Deep in the problem: I’ve been glued to this space since GPT‑3.5, trying everything, tracking every release.
- Full-stack enough: Superset taught me UX, frontend infra, design systems, backend, DevOps. I’m not the best at any one thing—but I can keep agents on the road across all of it and pick the right libraries fast.
- Architecture + modeling: ERDs, class modeling, component mental models. Systems thinking matters, especially now.
- Prompt and context engineering: Not just words—structures, constraints, and state.
- 25+ years of wide, deep-enough full-stakiness: Across languages, frameworks, infra. Useful scars.
- Open source instincts: Projects don’t grow alone. I know what a community needs and what to defer.
- Grit/obsession: People say there are only so many hours in a day. True. But when I’m obsessed, there are also many hours between 8pm and 2am. Not perfect optics, but obsession built my company—and this.

## Using Agor to build Agor (dogfooding)

By week three I could use Agor to build Agor, and something magic happens when you’re your own primary user. Early Airflow was the same—I inherited a handful of data marts at Airbnb and needed to fix a ton, fast. Dogfooding tightens loops:

- Forking sessions: I’d fork a conversation to spin off tests, docs, or a quick spike without polluting the main context.
- Spawning subsessions: Delegate focused research (“compare X vs Y, leave a summary in `/tmp/notes.md`”) without dragging parent context around.
- Worktrees + environments: Each session mapped to isolated git worktrees with their own running dev servers. No branch thrash, no port collisions.
- Multiplayer board: Real-time visibility—what’s active, what’s blocked, what’s moving. Async handoffs got 10x cleaner because the context lived with the work.

## What surprised me

- Speed compounds: The second or third week is where orchestration flips from “cool demo” to “wow we’re shipping.”
- Parallelism is a mindset: Once you stop thinking in single-threaded CLI chats, you start to “fan out” everything.
- Spatial memory matters: A board beats a list. You remember where things are. It changes how you think.

## What I cut (on purpose)

- Fancy UI early: Ant Design + React Flow got me 90% there. No bespoke art direction until the model is right.
- Too many agents at once: Start with the strongest, add specialization only where it clearly pays.
- Premature integrations: SDK first, then branch to CLIs if truly needed. Fewer moving parts, more leverage.

## So what is Agor, in one breath?

A multiplayer, spatial layer that coordinates agentic coding across tools and teams: real-time boards, session trees, zone-triggered workflows, isolated git worktrees with one-click environments, and the right glue to orchestrate Claude Code, Codex, Gemini, and friends. It’s the place where the work—and the context that created it—actually lives.

## What’s next

- Close the gap with native CLI features via SDKs
- Smoother IDE “bring your own editor” flows
- Better reporting (auto summaries, artifacts, outcomes)
- More refined context management (composable, versioned)

If you want the details, the docs are at https://agor.live. If you want to talk shop, the repo’s at https://github.com/mistercrunch/agor. If you’re building in this space, I want to hear from you.

“git tracks code; Agor tracks the conversations that produced it.”
