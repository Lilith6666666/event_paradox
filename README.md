<p align="center">
  <img src="assets/event-paradox-banner.png" alt="Event Paradox" width="100%">
</p>

# Event Paradox v0.4

> **An event engine for AI Dungeon for people who made the mistake of having a plot.**

![Status](https://img.shields.io/badge/status-public_beta-orange)
![Version](https://img.shields.io/badge/version-0.4-purple)
![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-AI_Dungeon-black)

Hi. I'm **Alex**, also known online as **Lilith6666666**.

I made Event Paradox because apparently watching the AI forget a carefully planned plot for the 47th time was not enough suffering, so naturally I responded by building an event engine.

Event Paradox lets creators put **deterministic, creator-written story events** inside AI Dungeon while leaving the AI free to improvise between them.

You decide **what must happen and when it becomes eligible**.  
The AI handles the messy human-shaped space in between.

That is the theory, anyway.

---

## So, what does it actually do?

Event Paradox can:

- fire **exact creator-written scenes** when explicit conditions are met;
- organize a story into **chapters** with optional visible titles and openings;
- track creator-defined **variables, choices and consequences**;
- build deterministic **branches** instead of asking the AI to guess what the player meant;
- keep bounded creator-authored **memories** across chapters;
- work with registered **Characters and Locations** through dynamic entities;
- optionally use an adapted **Auto-Cards** subsystem for entity discovery;
- track **narrative time** in years, months, weeks, days and hours;
- record important **time anchors / milestones**;
- perform canonical manual time skips with `/ep timeSkip`;
- preview, force, inspect and debug events through the `/ep` console;
- commit event prose, effects, memory, timeline changes and chapter transitions as one transaction.

At most **one normal authored event** is selected per successful story Output.

And no, Event Paradox does **not** read the player's mind.

That part is intentional.

---

## What Event Paradox is *not*

It is not a replacement for AI Dungeon's model.

It is not a visual novel engine pretending to be an LLM.

It is not an all-knowing semantic system that understands that:

> "I guess I'll go check backstage."

secretly means:

```text
choice.search = "backstage"
```

If a story decision matters to deterministic logic, Event Paradox expects explicit state.

The AI still writes the normal story. EP just stops some important things from being left entirely to vibes.

---

## Public Beta

**v0.4 is a public beta.**

The engine has a dependency-free offline Node test suite covering the major event, console, timeline, entity, Retry/Undo and timeSkip paths.

That does **not** mean I have personally discovered every possible way AI Dungeon can make it explode.

Live platform behavior — especially Retry/Undo edge cases, Story Card timing, other scripts, and automatic card generation — still needs community testing.

Which is a polite way of saying:

> Please break it before I do.

If something behaves strangely, open an Issue with:
- what you expected;
- what actually happened;
- the relevant event definition;
- `/ep status` if possible;
- whether Retry/Undo or another script was involved.

---

# Quick Start

## 1. Install the scripts

In AI Dungeon's scenario/adventure scripting editor, install:

```text
Library.js
Input.js
Context.js
Output.js
```

Paste each file into its matching scripting tab.

Save the scenario and enable scripts.

`Library.js` contains the editable Event Paradox definitions plus the engine itself.

Do **not** paste `events.example.js` into a hook. It is an example/reference file.

The Event Paradox runtime uses no imports, packages, browser APIs, timers or Node APIs.

Node is used only for the offline test suite.

---

## 2. Start a new adventure

If you changed `EP_START`, use a **new adventure**.

Existing adventures keep their current Event Paradox state. Editing the starting values is not a magical time machine.

I checked.

---

## 3. See if the thing is alive

Use a **Do** action:

```text
/ep status
```

Useful commands include:

```text
/ep help
/ep status
/ep eventsID
/ep chaptersID
/ep entities
/ep time
/ep set = {"path":"choice.search","value":"backstage"}
/ep testEvent = EVENT_ID
/ep forceEvent = EVENT_ID
/ep testChapter = CHAPTER_ID
/ep forceChapter = CHAPTER_ID
/ep advanceTime = {"months":3,"hours":6}
/ep timeSkip = 3mo;Three months pass.
```

`testEvent` and `testChapter` are previews.

`forceEvent`, `forceChapter`, `set`, `advanceTime` and `timeSkip` mutate real progress.

Use the destructive-looking ones in a disposable test adventure unless you enjoy explaining continuity errors to yourself.

---

# Creating Your Own Events

There are three things creators define:

```text
EP_START
EP_CHAPTERS
EP_EVENTS
```

- **EP_START** — starting chapter and creator variables.
- **EP_CHAPTERS** — narrative phases, descriptions, optional visible openings and optional entry time.
- **EP_EVENTS** — exact scenes, conditions, effects, memories, transitions and timing.

For manual authoring, see:

**`EventParadox_Events_Creator.txt`**

It contains starter templates, branching examples, dynamic entities, narrative time, console testing and copy-ready definitions.

---

## "I do not want to write JavaScript."

Reasonable.

The **EP Author Toolkit** is designed for exactly that.

The intended workflow is:

1. Write the events you want in the Human Author Workbook.
2. Define simple story paths/state where needed.
3. Group the finished events into chapters.
4. Upload the Workbook to an AI together with the EP AI Authoring Specification — or use the **EP Builder** Skill.
5. Say:

```text
Compile this for Event Paradox.
```

6. Receive a complete:

```text
EP_START
EP_CHAPTERS
EP_EVENTS
```

definitions block.

The AI gets to deal with the brackets.

You get to make questionable narrative decisions instead.

---

# A Tiny Example

```js
var EP_START = {
  chapter: "school",
  variables: {
    bellRang: false
  }
};

var EP_CHAPTERS = {
  school: "The students are finishing the school day.",
  free_roam: "Classes are over. The story can continue freely."
};

var EP_EVENTS = [
  {
    id: "bell_rings",
    chapter: "school",
    text: "The bell rings.",
    effects: [
      { path: "bellRang", op: "set", value: true }
    ]
  },
  {
    id: "leave_school",
    chapter: "school",
    when: {
      path: "bellRang",
      op: "eq",
      value: true
    },
    text: "You step out into the afternoon.",
    nextChapter: "free_roam"
  }
];
```

The first event rings the bell.

The second event cannot fire until the first event has explicitly changed `bellRang`.

No semantic interpretation. No guessing. No ritual sacrifice to the context window.

---

# Q&A Nobody Asked For Yet

### What the hell is Event Paradox?

A deterministic event layer for AI Dungeon.

You write important scenes and their logic in advance. AI Dungeon continues generating the ordinary story, and EP injects or replaces prose when an authored event becomes eligible.

Basically: **the AI improvises; EP remembers that you had a plot.**

---

### Why not just put the plot in Memory or Author's Note?

You absolutely can.

Sometimes the AI will even respect it.

Event Paradox exists for the moments where **"please remember this important thing eventually needs to happen"** is not deterministic enough.

If something *must* happen after a specific condition, EP can enforce that condition instead of hoping the model interprets your foreshadowing correctly.

---

### Does Event Paradox replace the AI?

No.

That would defeat the point.

EP controls authored milestones. The model still writes ordinary actions, dialogue, descriptions and all the unpredictable nonsense between those milestones.

Think of it less as rails and more as strategically placed guardrails.

Some of them are probably on fire.

---

### Do I need to know JavaScript?

No — although it helps if you want full control.

You can use:
- `EventParadox_Events_Creator.txt` for manual authoring;
- the **EP Author Toolkit** for a human-friendly event-first workflow;
- the **EP Builder** Skill / AI specification to compile your design into valid definitions.

The goal is for creators to design events instead of developing a sudden personal relationship with curly braces.

---

### Can EP understand choices directly from story text?

No.

And this is not currently a bug.

Writing:

> I search backstage.

does not automatically set:

```text
choice.search = "backstage"
```

Important state changes are explicit because semantic guessing is exactly the kind of thing EP is trying not to rely on.

Use creator effects or `/ep set` for explicit state.

---

### Can events branch?

Yes.

Events can use:
- chapters;
- turn gates;
- variables;
- nested `all` / `any` / `not` conditions;
- priorities;
- mutually exclusive state;
- dynamic Character/Location checks;
- chapter transitions.

You can absolutely create branching narrative structures.

You can also create an impossible dependency chain and stare at `/ep status` for twenty minutes.

I believe in you.

---

### Does EP track story time?

Yes.

v0.4 has one deterministic narrative timeline supporting:

```text
years
months
weeks
days
hours
```

Time moves only when explicitly authored through:
- event `timeAdvance`;
- destination chapter `timeAdvance`;
- `/ep advanceTime`;
- `/ep timeSkip`.

The AI saying "three months later" does not move the EP timeline by itself.

Because apparently even fictional calendars require bureaucracy.

---

### What is `/ep timeSkip`?

A manual canonical time skip.

Example:

```text
/ep timeSkip = 3mo,2d,6h;Three months pass. Things have changed.
```

EP records how much narrative time passed and inserts everything after the first semicolon as exact canonical story prose.

It does **not** automatically:
- change variables;
- create memories;
- create anchors;
- move chapters;
- infer what happened during the skip.

You write what happened.

EP owns the clock.

---

### Does it automatically create Character cards?

Optionally.

v0.4 includes an adapted subset of **Auto-Cards by LewdLeah**.

Automatic discovery/card creation is disabled by default:

```text
autoCardsEnabled = false
```

Existing creator Character and Location Story Cards can still register as dynamic entities without enabling automatic creation.

Auto-Cards discovers entities.

**You** decide what those entities mean to your story logic.

EP will not spontaneously decide that the attractive NPC is now your soulmate.

Probably for the best.

---

### Is it stable?

Define "stable."

The core has extensive offline tests.

This is still a **public beta**, and some AI Dungeon host lifecycle behavior can only really be proven by people running it in actual adventures.

So:
- back up scenarios you care about;
- test complicated logic in disposable adventures;
- report weird behavior;
- do not assume I have achieved enlightenment and eliminated bugs.

---

### Will it use more AI credits/tokens?

Normal AI Dungeon generation still happens.

Console commands are handled deterministically by the script, but the host may still perform a generation before Output runs, so EP cannot promise that control actions are free from host generation latency/cost.

Optional Auto-Cards can also use additional Context/output room during normal generations.

EP does not secretly call an external model or make extra direct model API requests.

---

### Can I use it with other scripts?

Possibly.

EP expects:
- its Input control capture to run before other scripts interpret `/ep`;
- EP Context and Output to run last so console/event behavior owns the final cycle.

Scripts that also manipulate history, state or final Output ordering may need actual integration testing.

"Both scripts individually work" is, historically, not a binding contract between two scripts.

---

### Can I build something better on top of this?

Please do.

Event Paradox is released under the **MIT License**.

Fork it. Modify it. Rebuild it. Turn it into something much better and make me mildly jealous.

If your project is based substantially on Event Paradox, a visible mention/link back to the original project would be very appreciated.

The MIT license notice itself must still be preserved where required.

---

### Is this an official AI Dungeon / Latitude project?

No.

Event Paradox is an independent community project built for AI Dungeon's scripting system.

If I somehow break your fictional school festival, Latitude did not personally do that.

That one is on me.

---

### Who made this?

**Alex / Lilith6666666**

I started Event Paradox because I wanted AI Dungeon scenarios where the AI could still improvise freely without being solely responsible for remembering every important plot beat.

Then feature creep happened.

Now we have transactional events, chapter announcements, entities, authored memory, a console, narrative time, anchors, Retry handling and a command for advancing fictional time by six hours.

This is how software happens, apparently.

---

# Configuration

Event Paradox creates/uses a configuration Story Card with:

```text
Triggers/keys: __EVENT_PARADOX_CONFIG_V1__
Type: Event Paradox — Configuration
```

Default Entry:

```text
enabled = true
memoryMode = compact
memoryBudget = 120
autoCharacterCards = false
journalEnabled = false
autoCardsEnabled = false
debug = false
```

For the complete behavior of each setting, see the technical reference.

---

# Bundled Example — The Missing Stage Key

The v0.4 package includes **The Missing Stage Key**, a test scenario with:

- 14 events;
- 7 chapters;
- branching search routes;
- explicit variables and effects;
- creator-authored memories;
- dynamic Character/Location examples;
- visible chapter transitions;
- narrative time;
- a time anchor;
- a final free-roam chapter.

It exists primarily to demonstrate and regression-test the engine.

Which is a very dignified way of saying Maya keeps losing a key so I can test software.

---

# Documentation

This repository separates the approachable "what is this thing?" material from the document that knows far too much.

### Start here
- `README.md` — you are here. Congratulations.
- `EventParadox_Events_Creator.txt` — practical manual authoring guide.

### Deep technical reference
- `docs/EventParadox_Technical_Reference.txt`

This contains the complete v0.4 behavior, limits, schemas, operators, migration rules, Retry/Undo notes, timeline semantics, console transport and test information.

### Author Toolkit
If included in this release:
- `EventParadox_AI_Authoring_Spec.txt`
- `EventParadox_Author_Workbook.txt`
- `EventParadox_Author_Toolkit_Examples.txt`
- `EventParadox_Skill_Builder_Guide.txt`
- `EP_Builder_Skill.zip`

---

# Testing

From the directory containing Event Paradox:

```bash
node tests/run-tests.js
```

You can also syntax-check the JavaScript files with Node:

```bash
node --check Library.js
node --check Input.js
node --check Context.js
node --check Output.js
node --check events.example.js
node --check tests/run-tests.js
```

The test suite is dependency-free.

The shipped v0.4 tests are **offline mocks of the documented AI Dungeon scripting contract**. They are not a substitute for live community testing.

Hence the beta.

Hence you.

---

# Bugs, Weirdness & Contributions

Found a bug?

Excellent.

Open an Issue and include enough information that someone other than your past self could reproduce it.

Useful details:
- Event Paradox version;
- relevant event/chapter definitions;
- what you expected;
- what happened instead;
- `/ep status`;
- whether Retry/Undo was involved;
- whether Auto-Cards was enabled;
- whether other scripts were installed.

Pull requests, experiments, forks and cursed improvements are welcome.

If you're unsure whether something is a bug or your event logic is wrong, open the issue anyway.

Worst case, we both learn something.

---

# Credits

Event Paradox is created and maintained by:

**Alex / Lilith6666666**

Event Paradox v0.4 also includes an adapted subset of:

**Auto-Cards by LewdLeah**

See:

`THIRD_PARTY_NOTICES.txt`

for the pinned upstream revision, adaptation notes and MIT attribution.

---

# License

Event Paradox is released under the **MIT License**.

Use it. Modify it. Fork it. Build something better.

If you make something cool with it, a visible credit/link back to Event Paradox is appreciated.

Not because I'm going to send a lawyer after you.

Mostly because I'd like to see what you made.

---

# Full Technical Reference

The original detailed v0.4 README/reference has been preserved verbatim as:

**`docs/EventParadox_Technical_Reference.txt`**

That is the place to go when you need exact parser limits, schema rules, timeline normalization, entity behavior, Retry/Undo details or the answer to:

> "Okay, but what does it *actually* do in this absurdly specific edge case?"

Enjoy.
