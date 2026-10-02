EVENT PARADOX v0.4
====================
Updated: 28 September 2026. Progress and Story Card schemas remain version 1.

Event Paradox delivers creator-written scenes deterministically inside AI
Dungeon. It reads explicit variables, chapters and turn gates, chooses at most
one eligible event per ordinary successful Output, and commits that event's
prose, effects, memory and chapter transition together. It does not ask the
model to write an event, infer a choice, or interpret the player's intent.

This release preserves the v0.2.1 fix for the reported live console failure when AI Dungeon reaches Output
with blank text or the literal "stop". A captured /ep request now produces its
deterministic response regardless of model text. Ordinary story Outputs still
need valid, nonblank text other than "stop" before EP advances anything.

New to Event Paradox event authoring?
See: EventParadox_Events_Creator.txt

v0.4 adds rich chapters, visible chapter announcements, a deterministic
narrative timeline (including hours), time anchors and chapter/time console
commands, including canonical /ep timeSkip. This enhancement remains version 0.4. See
section 14 for the complete timeline rules, bounds and migration behavior.

The v0.3 features remain: a lightweight Entity Registry and an opt-in adapted Auto-Cards
subsystem. New configuration cards contain seven settings, with autoCardsEnabled
defaulting to false. /ep set and legacy card commands remain supported.
See DYNAMIC ENTITIES AND INTEGRATED AUTO-CARDS below for the new workflow.

The bundled example is "The Missing Stage Key" from the supplied
Event_Paradox_Test_Events_v0.3.txt: 14 events across seven chapters, including
an optional registered Character helper and a registered Location route.
The v0.4 adaptation keeps the IDs, branches, conditions, effects and chapter
structure. Selected chapters now have titles/openings. prep_checklist explicitly
advances a day (with matching prose); free_roam advances to the next morning.
festival_opens records festival_opened and associates its memory with it.

1. INSTALL OR UPDATE
--------------------
Files:
  Library.js                    Definitions plus the self-contained engine.
  EventParadox_Events_Creator.txt Beginner guide and validated starter templates.
  Input.js                      Capture whole-action console commands.
  Context.js                    Console isolation and bounded authored memory.
  Output.js                     Console responses and ordinary event commits.
  events.example.js             Copy-ready supplied Missing Stage Key block.
  configuration.story-cards.json Optional import fallback for the config card.
  Event_Paradox_Test_Story_Cards_v0.3.json
                                Companion cards with registry-compatible triggers.
  tests/run-tests.js            Dependency-free offline Node test suite.
  tests/fixtures/dynamic-entities.js
                                Minimal additional v0.3 test data only.
  THIRD_PARTY_NOTICES.txt        Pinned Auto-Cards source and full MIT license.
  tests/fixtures/missing-stage-key.js
                                Exact supplied definitions for regression tests.

In AI Dungeon's scenario/adventure scripting editor, paste each of Library.js,
Input.js, Context.js and Output.js into the matching tab. Save and enable
scripts. Do not paste events.example.js into a hook: Library already includes
that example. No imports, packages, browser APIs, timers or Node APIs are used
in the installed runtime. Auto-Cards is integrated in Library; do not install
the upstream standalone script or a second modifier. Node is used only by the
offline test runner.

For the bundled walkthrough, start a NEW adventure. EP_START initializes
missing progress once; editing it does not reset an existing adventure.
This expanded sample replaces the older sample's ready chapter and adds new
variables; it does not migrate an adventure already running the older sample.

For the complete sample setup, import Event_Paradox_Test_Story_Cards_v0.3.json
into a fresh/empty scenario or adventure. This companion file supplies Maya
and Julia as Characters, three Locations, and a configuration card with
autoCardsEnabled=true for discovery testing. Do not also import the separate
configuration.story-cards.json fallback: the companion already includes it.
The engine's generated defaults still have autoCardsEnabled=false. Existing
Character/Location cards register with either setting; automatic creation
requires true. Check /ep entities after importing.
The bundled companion's three Location trigger lists are normalized to
School Hall, School Office, and Backstage Area/backstage. The supplied lists
included unrelated aliases such as festival hall, lost-and-found and stage
curtains; v0.3 rejects those lists as ambiguous entity identities. Only these
three keys fields were changed; card prose, types and configuration are intact.

When upgrading an existing custom scenario, keep YOUR definition block and
update the engine and three hooks around it. Saved chapter IDs must still
exist in EP_CHAPTERS. This release's example replacement is not a migration
from another story. Existing v0.1/v0.2/v0.2.1/v0.3 progress remains compatible when its definitions are retained.
v0.4 adds a zero timeline on mutable access; it never replays old events,
anchors or chapter entry advances. Read-only console calls do not migrate.
Old retained checkpoints without a timeline restore zero time. Existing v0.4
timelines/anchors without hours read as hours=0 and migrate on mutable access.
Months, days, milestones and other progress are retained. See sections 14–15.
The empty, versioned entities field is added on mutable access without resetting
progress; original V1 keys and legacy revision fields remain supported.
Never reset state just to update the program version.

When combining scripts, retain one modifier per hook. Capture EP console
Input before other scripts interpret commands. Run EP Context and Output last
so their console response owns that generation cycle. Other scripts that
change history/state or output ordering need separate integration testing.
Do not replace another script's state or the player's Memory with EP data.

The first hook creates a configuration card if the Story Card API is available.
If creation is unavailable, defaults still work; manually create the card or
use the optional JSON import. Check for an existing card first: some platform
imports replace the entire card collection. Back up user cards before import.

2. CONFIGURATION STORY CARD
---------------------------
Exact Triggers/keys: __EVENT_PARADOX_CONFIG_V1__
Exact Type: Event Paradox — Configuration
Suggested title: Event Paradox — Configuration

Edit the Entry. Notes/description are not read by the script. The runtime does
not depend on a UI title field. Keep the sentinel Trigger and Type unchanged.
The runtime creates this exact default Entry, also supplied in the JSON file:

# Event Paradox — Configuration
# Edit this Entry, not Notes. Keep the Triggers unchanged.
# To debug: set debug = true, then type /ep help in a Do action for all commands.

enabled = true
memoryMode = compact
memoryBudget = 120
autoCharacterCards = false
journalEnabled = false
autoCardsEnabled = false
debug = false

These are the ONLY settings in new default cards. There are no manualSet,
commandRevision, testEvent or forceEvent lines in those defaults.

  enabled
    true runs the engine; false pauses ordinary progress and blocks /ep set
    /ep forceEvent, /ep forceChapter, /ep advanceTime and /ep timeSkip. Pausing does not reset
    narrative time, variables, chapters, counters
    or completions. Re-enable explicitly in this card to resume. Read-only
    help/status/lists/previews stay available while paused.

  memoryMode
    compact: bounded current chapter and authored memory summaries in Context.
    character: also supplies relevant authored character facts.
    full: character behavior plus optional event journal mirroring.
    None of these modes asks the model to summarize or infer facts.

  memoryBudget
    Approximate Context token target; default 120, clamped to 0..600.
    EP conservatively allocates three characters per target token, including
    its labels. This is not an exact tokenizer or a platform token guarantee.
    0 omits EP memory Context. It does not erase saved summaries or block events.

  autoCharacterCards
    Default false. In character/full mode, true permits EP-owned character
    mirror cards. Only characters with authored event memory are recorded.

  journalEnabled
    Default false. In full mode, true permits an EP-owned bounded journal.
    The journal is a reference card, not an instruction to inject a full log.

  autoCardsEnabled
    Default false. Opts into integrated Auto-Cards discovery/creation/updates.
    Independent of EP character-memory mirrors. Existing creator Characters
    and Locations can register even when this option is false. See section 7a.

  debug
    Default false. Enables bounded scripting-console diagnostics if log exists:
    skipped invalid definitions, rejected commands, commits, retries and pause
    recovery. Slash commands work without debug. Legacy card preview/force
    commands require debug=true as before.

Config is reread in each hook, including edits between Input and Output.
Names, booleans and memory modes are case-insensitive. Whitespace is allowed.
A # starts a comment outside JSON strings. Last duplicate setting wins; an
invalid last value uses that setting's default. Unknown keys are ignored with
debug logging. Only the first 16000 Entry characters are parsed. User Entries
are never silently rewritten or migrated. A key collision with another Type
is left untouched and EP uses defaults.

3. EVENT PARADOX CONSOLE
------------------------
Submit one entire command as a normal Do action:

  /ep help
  /ep status
  /ep eventsID
  /ep chaptersID
  /ep entities
  /ep set = {"path":"choice.search","value":"backstage"}
  /ep testEvent = find_key_backstage
  /ep forceEvent = find_key_backstage
  /ep time
  /ep testChapter = search
  /ep forceChapter = search
  /ep advanceTime = {"months":3,"hours":6}
  /ep timeSkip = 3mo;Three months pass.

Command names are case-insensitive; IDs and variable paths are case-sensitive.
Event IDs are unquoted. Leading/trailing whitespace and the standard
"> You /ep ..." Do wrapper are accepted, including a wrapper-added final
period for short controls. timeSkip instead preserves all supplied prose
punctuation, including a final period, after removing the Do wrapper.
Bare /ep means help. Quoted dialogue, an embedded mention, /episode,
and Say's '> You say "..."' wrapper are ordinary narrative, not controls.

No debug setting, commandRevision or manualSet revision is needed. A NEW
submitted command action is the invocation. Retry reuses its saved response;
to deliberately execute again, submit a new action. A command cycle never
runs pending legacy commands or automatically evaluates ordinary events.
Unknown/malformed commands return a bounded error instead of becoming story
instructions. Syntax/lookup failures are also receipted; correct them in a
new action. Commands are not access-controlled by player/creator role.

help
  Lists all thirteen commands, explains previews/mutations and paused behavior.

status
  Shows program version, enabled/paused, chapter ID/title/description, narrative time, counters,
  completion count, latest five completed IDs, recovery flag and memory mode.
  It suggests /ep set, but does not dump variables or other scripts' state.

eventsID / chaptersID
  List valid event or chapter IDs and their titles/descriptions. Completed
  events are labeled. Explicit previews/forces may target valid disabled
  definitions, so those IDs are included. Invalid or duplicate event IDs are
  excluded. Listings stop at 40 entries or about 6000 body characters, with a
  truncation notice; inspect Library for the rest. Only the first 256 event
  definitions can be used by the engine.

4. /ep set: CHANGE VARIABLES WITHOUT ADVANCING THE STORY
-------------------------------------------------------
Syntax:
  /ep set = {"path":"VARIABLE.PATH","value":JSON_VALUE}

Examples using the supplied state model:
  /ep set = {"path":"choice.search","value":"backstage"}
  /ep set = {"path":"choice.search","value":"office"}
  /ep set = {"path":"key.found","value":true}
  /ep set = {"path":"key.finder","value":null}

Example confirmation:
  [Event Paradox Console]
  Set choice.search = "backstage"
  [/Event Paradox Console]

The right side must be strict JSON: double-quoted keys/strings, no comments,
trailing commas, JavaScript expressions or single-quoted strings. Require
exactly path and value; unknown extra fields are rejected. Explicit null is
allowed; omitting value is an error. Standard JSON.parse last-key behavior
applies to repeated JSON object keys. Nothing is evaluated as JavaScript.

Path is relative to state.eventParadox.variables. Use choice.search, not a
state/eventParadox/variables prefix. The existing set-effect writer validates
and clones the value, creates safe missing object parents, and refuses to
traverse a scalar or array. A failed write leaves the original variables and
all progress untouched, even if a candidate created parents before failing.

Allowed values: strings, finite numbers, booleans, null, arrays and safe JSON
objects. Paths: at most 160 characters and eight segments, each starting with
a letter and then letters/digits/underscores. No bracket syntax, array indices,
prototype keys or expressions. Each string is at most 2000 characters;
containers have at most 64 members, depth is bounded, and the complete stored
variable tree must remain within 8192 JSON characters. See the reference below.
The final tree is checked, not just the incoming value.

The following root names are reserved for this console command:
  state, eventParadox, eventParadoxConsole, eventParadoxAutoCards,
  eventParadoxInternalTask, entities, variables, version, chapter,
  completedEvents, enabledTurns, chapterTurns, counters, eventLog, repeatTurns,
  memories, characters, lastManualRevision, lastCommandRevision, checkpoints,
  recoveryRequired.

You cannot change chapters, completion, counters, memories, logs, checkpoints
or console metadata with /ep set. These roots are rejected even though all
writes are confined to the variables object, to avoid misleading accidental
shadow variables. Ordinary nested creator names remain allowed, for example
choice.chapter. Existing event effects and legacy manualSet keep their prior
safe variable semantics for compatibility.

A successful set changes only creator variables, plus delivery bookkeeping
(a console receipt and bounded progress checkpoint for Retry/Undo). It does
NOT advance enabledTurns/chapterTurns, change the current chapter, complete
an event, add event log/memory/journal entries or sync character cards. It does
NOT consume legacy revisions or apply pending legacy commands.

An event whose conditions become true waits for the next normal eligible
story Output. You may inspect status, preview or set more values beforehand.
Even an already-eligible event does not fire inside the set command cycle.

Set commands accept at most 12288 characters after trimming/removing the Do
wrapper. timeSkip has its own 4000-character payload-command cap; the remaining
short controls retain the 256-character cap. These are parser bounds, not a
claim about the host UI limit. Confirmation values use
readable JSON, capped at 1024 displayed characters with an explicit truncation
notice. Frame-like console marker text is JSON-escaped in the confirmation
to keep later Context cleanup intact. The full validated value is stored.
These are character limits, not
byte or token counts. JSON escaping may consume some of the input allowance.

If EP is paused, set returns instructions to enable it; it never auto-enables.
A previously blocked action stays blocked on Retry. Enable EP and submit a
new set action. Invalid syntax/path/value, unsafe nesting, storage overflow,
missing action identity or incompatible progress produces a useful error.
No partial variable mutation is committed.

5. PREVIEW AND FORCE
--------------------
/ep testEvent = find_key_backstage
  Finds the valid exact ID and displays the exact authored event prose in a
  clearly marked console preview. It bypasses ordinary enabled-definition,
  chapter, conditions, minTurns/minChapterTurns, cooldown and completion gates.
  It still validates the event definition. Previews work while EP is paused.

  No effects, variable updates, chapter changes, counters, completion, event
  log, repeat bookkeeping, memories, mirrors, journal, or progress checkpoints
  are changed. Fresh previews do not initialize state.eventParadox. Only the
  separate console transport receipt is persisted. Existing persistent Memory
  and other scripts' state are untouched. Reissue freely as new actions.

/ep forceEvent = find_key_backstage
  Finds and validates the exact event, bypasses its ordinary eligibility and
  completion gates, and executes the real event transaction. Effects, authored
  memory, chapter transition, completion/repeat tracking and event log apply.
  enabledTurns advances once; chapterTurns advances, then resets to zero if
  nextChapter is different. Optional mirrors/journal follow their settings.
  EP must be enabled, but debug and revision numbers are not required.

  This modifies real progress, even if the event has already completed. A
  deliberately new force can reapply effects; a completed one-shot ID is not
  duplicated. Retry replays the same committed text without repeating effects.
  Forcing does not invent prerequisite effects: forcing backstage from
  preparation finds the key, but does not set key.missing=true, because that
  belongs to key_goes_missing. It enters recovery without setting
  clue.firstFound. The later recovery events can return the key and ready the
  stage; festival_opens requires key.found and stage.ready.

Both commands discard unrelated model prose. display=append and replace are
honored against an empty narrative canvas, so both show the full event text;
preview adds a non-canon console label/frame. Forced text is returned plainly
as the authored canonical scene. An interpolate=true event still uses its
existing opt-in safe substitutions from variables before its effects. In this
sample, dynamic_helper_spots_clue and find_key_dynamic_location substitute a
registered entity's name. The other 12 events reproduce their literal text.

Invalid IDs, duplicates, unknown chapters, malformed conditions, unsafe effects
or runtime effect failures never bypass validation. Failed force transactions
leave progress unchanged and show an error, with no ordinary-event fallback.
Only one whole-action slash command is accepted; combining commands in one
action is a syntax error. Legacy simultaneous-card precedence is separate.

6. THE MISSING STAGE KEY WALKTHROUGH
------------------------------------
Use the bundled Library block and a new adventure with default settings.
No debug flag or config-card variable edit is needed.

1. The first ordinary successful Output APPENDS prep_checklist. The second
   APPENDS key_goes_missing and sets key.missing=true. Both stay in preparation.
2. The third Output REPLACES model prose with search_team_forms and enters
   search. The fourth APPENDS first_clue and sets clue.firstFound=true.
   enabledTurns=4; chapterTurns=1.
3. Submit a Do action (this is not a story turn):
     /ep set = {"path":"choice.search","value":"backstage"}
   Only the confirmation appears. Chapter remains search, key.found=false,
   counters stay 4/1, and the four preceding events remain completed.
4. The fifth normal Output REPLACES model prose with find_key_backstage:
   key.found=true, key.finder="Maya", chapter=recovery, chapterTurns=0.
   The authored stage_key memory is replaced with the recovery facts.
5. Output 6 APPENDS key_returns_to_stage and sets stage.keyReturned=true.
   Output 7 REPLACES prose with stage_safety_check, sets stage.ready=true,
   and enters opening. Output 8 REPLACES prose with festival_opens, sets
   festival.started=true, and enters festival.
6. Output 9 APPENDS first_guests_arrive and sets festival.guestsArrived=true.
   Output 10 is ordinary prose. Output 11 REPLACES prose with
   festival_rush_passes, sets festival.mainRushOver=true, and enters aftermath.
7. Output 12 is ordinary prose. Output 13 REPLACES prose with
   festival_aftermath and enters free_roam. There are no authored events in
   free_roam; play continues normally and the completed events do not repeat.

The turn counts are unchanged by the new timeline: prep_checklist advances one
day. search_team_forms, stage_safety_check and festival_rush_passes append
the destination chapter announcement after their authored scenes.
festival_opens records festival_opened at day 1. festival_aftermath enters
free_roam, advances another day and displays A New Day. /ep time then reports
2 days since story start and festival_opened 1 day ago. Preparation has a rich
title but EP_START initialization is silent and applies no chapter time.

These numbers count successful ordinary story Outputs only. Read-only/set
console actions, previews, Retry, failed Outputs and card-only maintenance
do not advance the story. Each chapter transition resets chapterTurns to zero.
Leaving choice.search="undecided" keeps the story in search after first_clue.

Office route: start a separate fresh adventure and in step 3 submit:
  /ep set = {"path":"choice.search","value":"office"}
Step 4 instead produces find_key_office, key.finder="Julia" and the supplied
office memory. The remaining timing is unchanged. Chapter and key.found
gates prevent the other discoveries from firing in ordinary play.

Optional Character helper: while in search, before recovering the key, run
/ep entities and copy a registered Character's stable ID. Assign it with:
  /ep set = {"path":"v03.helper","value":"ENTITY_ID"}
Replace ENTITY_ID with the actual ID. After first_clue, the next normal
Output fires dynamic_helper_spots_clue, resolves the helper's name in the
authored prose, and sets v03.helperUsed=true. This event has higher priority
than any discovery, so an already-selected route fires on the following
Output. This adds one story turn to the walkthrough. No helper is assigned
automatically. To generate a new Character with Auto-Cards, set
autoCardsEnabled=true; existing creator Characters work with it false too.

The helper's memory.characterPath targets that Character. To inspect mirrors,
set memoryMode=character and autoCharacterCards=true. For the full journal,
use memoryMode=full, autoCharacterCards=true and journalEnabled=true. The
helper's chapter-scoped event memory expires when the group leaves search.

Dynamic Location route: after first_clue, use /ep entities to copy a registered
Location ID, then submit these two separate Do actions:
  /ep set = {"path":"v03.searchLocation","value":"ENTITY_ID"}
  /ep set = {"path":"choice.search","value":"dynamic"}
The next normal Output fires find_key_dynamic_location, inserts the Location's
name, sets key.finder="dynamic", and enters recovery. A pending valid helper
still takes priority for one Output. Unknown IDs or entities of the wrong
type do not satisfy the helper/Location conditions. Use the current IDs from
/ep entities rather than copying an ID from another adventure.

The companion cards provide Maya and Julia (Characters), plus School Hall,
School Office and Backstage Area (Locations). The registry derives their names
from unambiguous triggers; it does not depend on optional Story Card titles.
The event definitions alone do not create those cards.

Writing "I search backstage" in narrative does not update choice.search.
There is no natural-language choice classifier; set supplies that explicit
choice. Scene prose never silently rewrites creator variables.

Quick console checks on a disposable fresh adventure:
  /ep help
  /ep status
  /ep eventsID
  /ep chaptersID
  /ep entities
  /ep testEvent = find_key_backstage

The preview must contain the exact supplied scene while status still shows
preparation and zero counters/completions. Then try:
  /ep forceEvent = find_key_backstage
It must produce the scene, enter recovery and record the event and memory.
Retry must not repeat effects or counters. A deliberately new force is a new
invocation. Set enabled=false to verify set/force are blocked while the other
read-only commands and previews still work. Re-enable and use new command actions to resume.

7. EXACT RUNNABLE EXAMPLE
-------------------------
Copy the whole marked block into Library's matching definition section. The
block below, Library, events.example.js and the offline fixture are checked
for byte-for-byte equality. The engine remains reusable for other scenarios.

BEGIN RUNNABLE EXAMPLE: MISSING STAGE KEY
// BEGIN EVENT DEFINITIONS — EDIT HERE

var EP_START = {
  chapter: "preparation",
  variables: {
    key: {
      missing: false,
      found: false,
      finder: null
    },
    choice: {
      search: "undecided"
    },
    clue: {
      firstFound: false
    },
    stage: {
      keyReturned: false,
      ready: false
    },
    festival: {
      started: false,
      guestsArrived: false,
      mainRushOver: false
    },
    v03: {
      helper: null,
      helperUsed: false,
      searchLocation: null
    }
  }
};

var EP_CHAPTERS = {
  preparation: {
    title: "Chapter 1 — Preparation",
    description: "Maya, Julia and the player are preparing the school hall. The stage key has not yet been reported missing.",
    announce: true,
    opening: "The final preparations begin."
  },
  search: {
    title: "Chapter 2 — The Search",
    description: "The brass stage key is missing. The group is actively searching the school before the festival begins.",
    announce: true,
    opening: "The search begins before the first guests arrive."
  },
  recovery: "The stage key has been recovered, but the group still needs to return it and confirm that the stage is ready.",
  opening: {
    title: "Opening Night",
    description: "The key is back and the stage is ready. The festival is moments away from opening.",
    announce: true,
    opening: "Everything is finally ready for the doors to open."
  },
  festival: "The school festival is underway. The main problem is solved and the evening is unfolding.",
  aftermath: {
    title: "After the Rush",
    description: "The busiest part of the festival is over. Maya, Julia and the player finally have time to reflect on the evening.",
    announce: true,
    opening: "The evening begins to wind down."
  },
  free_roam: {
    title: "A New Day",
    description: "The scripted test arc is complete. School-festival play may continue freely without further authored Event Paradox events.",
    announce: true,
    opening: "The next morning, the successful festival is already becoming a favorite memory.",
    timeAdvance: { days: 1 }
  }
};

var EP_EVENTS = [

  {
    id: "prep_checklist",
    title: "Last-Minute Checklist",
    timeAdvance: { days: 1 },
    chapter: "preparation",
    minChapterTurns: 1,
    once: true,
    priority: 120,
    display: "append",
    text: "After a day of preparations, Maya lowers her clipboard and scans the hall.\n\n\"Posters, lights, decorations... we're actually almost on schedule,\" she says.\n\nJulia taps the ladder with one shoe. \"You said that out loud. Now something has to go wrong.\"",
    memory: {
      slot: "festival_preparation",
      scope: "chapter",
      summary: "Maya, Julia and the player were close to finishing the school festival setup."
    }
  },

  {
    id: "key_goes_missing",
    title: "Where Is the Key?",
    chapter: "preparation",
    minChapterTurns: 2,
    once: true,
    priority: 110,
    display: "append",
    text: "Maya checks the hook beside the stage door and freezes.\n\n\"The key was right here,\" she says. \"Without it, we can't open the stage for the festival.\"\n\nJulia folds her arms. \"Then we find it before the guests arrive.\"",
    effects: [
      { path: "key.missing", op: "set", value: true }
    ],
    memory: {
      slot: "stage_key",
      scope: "story",
      summary: "The brass stage key went missing shortly before the school festival."
    }
  },

  {
    id: "search_team_forms",
    title: "Split Up and Search",
    chapter: "preparation",
    minChapterTurns: 3,
    once: true,
    priority: 100,
    when: {
      all: [
        { path: "key.missing", op: "eq", value: true }
      ]
    },
    display: "replace",
    text: "Maya exhales through her nose and points toward the stage curtains.\n\n\"I'll check backstage again. Julia, try the office and lost-and-found.\"\n\nJulia looks at you. \"And you get the exciting job of deciding which bad idea to help with first.\"\n\nAround you, festival preparations continue as if nothing is wrong.",
    nextChapter: "search",
    memory: {
      slot: "stage_key",
      scope: "story",
      summary: "Maya planned to search backstage while Julia checked the school office for the missing stage key."
    }
  },

  {
    id: "first_clue",
    title: "A Bent Key Tag",
    chapter: "search",
    minChapterTurns: 1,
    once: true,
    priority: 120,
    when: {
      all: [
        { path: "key.missing", op: "eq", value: true }
      ],
      not: [
        { path: "key.found", op: "eq", value: true }
      ]
    },
    display: "append",
    text: "Near the stage entrance, Julia spots a small bent plastic tag on the floor—the kind normally attached to the brass key ring.\n\n\"Okay,\" she says, picking it up. \"At least we know the key didn't grow legs and leave the building.\"",
    effects: [
      { path: "clue.firstFound", op: "set", value: true }
    ],
    memory: {
      slot: "stage_key",
      scope: "story",
      summary: "Julia found the bent plastic tag from the missing stage key ring near the stage entrance."
    }
  },

  {
    id: "dynamic_helper_spots_clue",
    title: "An Extra Pair of Eyes",
    chapter: "search",
    minChapterTurns: 2,
    once: true,
    priority: 115,
    interpolate: true,
    when: {
      all: [
        { path: "clue.firstFound", op: "eq", value: true },
        { path: "v03.helper", op: "registeredEntity", value: "Character" },
        { path: "v03.helperUsed", op: "eq", value: false }
      ],
      not: [
        { path: "key.found", op: "eq", value: true }
      ]
    },
    display: "replace",
    text: "{{entity:v03.helper}} joins the search and crouches near the stage entrance.\n\n\"Wait,\" they say, pointing to a faint scrape across the floor. \"Something metal got dragged this way before someone picked it up.\"\n\nIt is not enough to solve the mystery, but it gives everyone one more reason to keep looking.",
    effects: [
      { path: "v03.helperUsed", op: "set", value: true }
    ],
    memory: {
      slot: "dynamic_helper",
      scope: "chapter",
      characterPath: "v03.helper",
      summary: "This character joined the search for the missing stage key and found a small physical clue near the stage entrance."
    }
  },

  {
    id: "find_key_backstage",
    title: "Backstage Discovery",
    chapter: "search",
    minChapterTurns: 2,
    priority: 100,
    once: true,
    when: {
      all: [
        { path: "key.missing", op: "eq", value: true },
        { path: "clue.firstFound", op: "eq", value: true },
        { path: "choice.search", op: "eq", value: "backstage" }
      ],
      not: [
        { path: "key.found", op: "eq", value: true }
      ]
    },
    display: "replace",
    text: "You and Maya search behind the stage curtains. Under a box of paper stars, something metal catches the light.\n\n\"The key!\" Maya laughs, holding it up. \"You just saved opening night.\"",
    effects: [
      { path: "key.found", op: "set", value: true },
      { path: "key.finder", op: "set", value: "Maya" }
    ],
    nextChapter: "recovery",
    memory: {
      slot: "stage_key",
      scope: "story",
      summary: "The player and Maya found the missing stage key backstage beneath a box of paper stars.",
      character: "Maya",
      triggers: ["Maya"]
    }
  },

  {
    id: "find_key_office",
    title: "Office Discovery",
    chapter: "search",
    minChapterTurns: 2,
    priority: 100,
    once: true,
    when: {
      all: [
        { path: "key.missing", op: "eq", value: true },
        { path: "clue.firstFound", op: "eq", value: true },
        { path: "choice.search", op: "eq", value: "office" }
      ],
      not: [
        { path: "key.found", op: "eq", value: true }
      ]
    },
    display: "replace",
    text: "You follow Julia into the school office. She opens the lost-and-found drawer and lifts out a small brass key.\n\n\"Someone handed it in,\" Julia says, grinning. \"Come on. We still have a festival to save.\"",
    effects: [
      { path: "key.found", op: "set", value: true },
      { path: "key.finder", op: "set", value: "Julia" }
    ],
    nextChapter: "recovery",
    memory: {
      slot: "stage_key",
      scope: "story",
      summary: "The player and Julia found the missing stage key in the school office lost-and-found drawer.",
      character: "Julia",
      triggers: ["Julia"]
    }
  },

  {
    id: "find_key_dynamic_location",
    title: "A Different Lead",
    chapter: "search",
    minChapterTurns: 2,
    priority: 100,
    once: true,
    interpolate: true,
    when: {
      all: [
        { path: "key.missing", op: "eq", value: true },
        { path: "clue.firstFound", op: "eq", value: true },
        { path: "choice.search", op: "eq", value: "dynamic" },
        { path: "v03.searchLocation", op: "registeredEntity", value: "Location" }
      ],
      not: [
        { path: "key.found", op: "eq", value: true }
      ]
    },
    display: "replace",
    text: "You follow the latest lead to {{entity:v03.searchLocation}}.\n\nAfter a few minutes of searching, the missing brass key turns up where nobody expected it to be.\n\nMaya stares at it in relief. Julia simply says, \"I am never trusting that hook again.\"",
    effects: [
      { path: "key.found", op: "set", value: true },
      { path: "key.finder", op: "set", value: "dynamic" }
    ],
    nextChapter: "recovery",
    memory: {
      slot: "stage_key",
      scope: "story",
      summary: "The player followed an unexpected lead to a registered location and recovered the missing stage key there."
    }
  },

  {
    id: "key_returns_to_stage",
    title: "Back Where It Belongs",
    chapter: "recovery",
    minChapterTurns: 1,
    once: true,
    priority: 110,
    when: {
      all: [
        { path: "key.found", op: "eq", value: true }
      ]
    },
    display: "append",
    text: "The brass key finally clicks back into the stage-door lock.\n\nMaya turns it once, then twice, as if checking reality itself.\n\n\"Good,\" she says. \"Now nobody touches this key except me.\"",
    effects: [
      { path: "stage.keyReturned", op: "set", value: true }
    ],
    memory: {
      slot: "stage_status",
      scope: "chapter",
      summary: "The recovered brass key was returned to the stage door."
    }
  },

  {
    id: "stage_safety_check",
    title: "One Last Check",
    chapter: "recovery",
    minChapterTurns: 2,
    once: true,
    priority: 100,
    when: {
      all: [
        { path: "stage.keyReturned", op: "eq", value: true }
      ]
    },
    display: "replace",
    text: "Before anyone celebrates, Maya insists on one final check.\n\nThe stage doors open cleanly. The lights come on. Julia tests the curtain mechanism and gives an exaggerated thumbs-up.\n\n\"No fire, no collapse, no missing key,\" she says. \"I call that professional success.\"",
    effects: [
      { path: "stage.ready", op: "set", value: true }
    ],
    nextChapter: "opening",
    memory: {
      slot: "stage_status",
      scope: "story",
      summary: "The stage passed its final check and was ready for the school festival."
    }
  },

  {
    id: "festival_opens",
    title: "Opening Night",
    timeAnchor: { id: "festival_opened", label: "The school festival opened", context: true },
    chapter: "opening",
    minChapterTurns: 1,
    priority: 100,
    once: true,
    when: {
      all: [
        { path: "key.found", op: "eq", value: true },
        { path: "stage.ready", op: "eq", value: true }
      ],
      not: [
        { path: "festival.started", op: "eq", value: true }
      ]
    },
    display: "replace",
    text: "The stage doors swing open. Music spills into the decorated hall as the first guests begin filing in.\n\nMaya raises both hands. \"We actually made it.\"\n\nJulia points toward the snack table. \"Celebrate later. I saw someone bring brownies.\"",
    effects: [
      { path: "festival.started", op: "set", value: true }
    ],
    nextChapter: "festival",
    memory: {
      slot: "festival_opening",
      timeAnchor: "festival_opened",
      scope: "story",
      summary: "The recovered key and completed stage check allowed the school festival to open on time."
    }
  },

  {
    id: "first_guests_arrive",
    title: "The Hall Fills Up",
    chapter: "festival",
    minChapterTurns: 1,
    once: true,
    priority: 100,
    when: {
      all: [
        { path: "festival.started", op: "eq", value: true }
      ]
    },
    display: "append",
    text: "Within minutes, the hall is crowded with students, families, teachers, and music.\n\nThe empty preparation space from earlier is almost impossible to recognize now.",
    effects: [
      { path: "festival.guestsArrived", op: "set", value: true }
    ],
    memory: {
      slot: "festival_progress",
      scope: "chapter",
      summary: "Guests filled the school hall and the festival moved into full swing."
    }
  },

  {
    id: "festival_rush_passes",
    title: "Finally a Moment",
    chapter: "festival",
    minChapterTurns: 3,
    once: true,
    priority: 90,
    when: {
      all: [
        { path: "festival.guestsArrived", op: "eq", value: true }
      ]
    },
    display: "replace",
    text: "After the first chaotic rush, the three of you finally end up together near the side of the hall.\n\nMaya is still holding her clipboard, but she has stopped checking it every ten seconds.\n\nJulia hands each of you a paper cup of something suspiciously sweet.\n\n\"To the key,\" she says solemnly. \"May we never lose it again.\"",
    effects: [
      { path: "festival.mainRushOver", op: "set", value: true }
    ],
    nextChapter: "aftermath",
    memory: {
      slot: "festival_progress",
      scope: "story",
      summary: "After the opening rush, Maya, Julia and the player finally relaxed together during the successful festival."
    }
  },

  {
    id: "festival_aftermath",
    title: "After Closing",
    chapter: "aftermath",
    minChapterTurns: 2,
    once: true,
    priority: 100,
    when: {
      all: [
        { path: "festival.mainRushOver", op: "eq", value: true }
      ]
    },
    display: "replace",
    text: "Much later, the music stops and the last guests disappear into the evening.\n\nPaper decorations droop slightly from the walls, empty cups cover one table, and the stage key is safely back on Maya's lanyard.\n\nJulia looks around the messy hall and smiles. \"Tomorrow's problem.\"\n\nFor tonight, the festival worked.",
    nextChapter: "free_roam",
    memory: {
      slot: "festival_finale",
      scope: "story",
      summary: "The school festival ended successfully. The missing stage key was recovered, the stage opened, and Maya kept the key safely afterward."
    }
  }

];

// END EVENT DEFINITIONS
END RUNNABLE EXAMPLE

7a. DYNAMIC ENTITIES AND INTEGRATED AUTO-CARDS
---------------------------------------------
Event Paradox v0.4 preserves the adapted subset of LewdLeah's Auto-Cards:
  https://github.com/LewdLeah/Auto-Cards
Upstream revision used:
  c8a4e4d6e1ef03b3177fa35c8c332afe1f914aa3
  https://github.com/LewdLeah/Auto-Cards/tree/c8a4e4d6e1ef03b3177fa35c8c332afe1f914aa3
Retrieved from main on 26 September 2026. Copyright (c) 2025 LewdLeah, MIT.
The full MIT license is in THIRD_PARTY_NOTICES.txt AND Library.js, so it stays
with pasted runtime copies. The adapted title scanner retains attribution.

Auto-Cards discovers what exists in the emergent story. Event Paradox variables
and events decide what those entities mean to authored narrative logic.
Discovery never selects a love interest, friend, enemy, quest giver or venue.
A Character registration proves only that a Character card exists. It does
not establish age, eligibility, trust, relationship status or a narrative role.

Enable automatic card creation explicitly in the existing Configuration Entry:
  autoCardsEnabled = true
It defaults to false, including when the setting is absent from an old card.
The engine also needs enabled=true. debug=true is optional for diagnostics.
Disabling either setting stops generation and updates without deleting cards,
creator variables or registered identities. It does not silently re-enable.
No separate Auto-Cards installation, modifier, config card or data card is used.

Two different switches:
  autoCardsEnabled = automatic world/entity card discovery, creation and updates.
  autoCharacterCards = optional EP-authored character-memory mirror cards.

A Character can have its normal Character Story Card, plus an optional EP
memory mirror with a sentinel trigger. They are separate cards with separate
owners and purposes. Registration itself creates no extra Story Card.

HOW AUTOMATIC DISCOVERY AND CLASSIFICATION WORK

The adapted upstream detector scans successful visible ordinary narrative,
using capitalized names, sentence boundaries, punctuation and minor connector
words. It skips most sentence-initial/all-caps names and common calendar/direction
terms. This heuristic may miss names, especially names without capitals; it
never classifies a person/place from capitalization alone. Console commands,
previews and card-maintenance text are not discovery inputs. A name must appear
in at least two separately committed ordinary outputs to become a candidate.
Candidates must have been mentioned in the last 24 enabled story turns.

On a later ordinary Context with room, EP requests one card summary and its
classification alongside the normal narrative in the SAME model generation.
The card uses established previous narrative and, for updates, its existing
entry; it must not derive facts from the new continuation that EP might replace.
The result includes name, type, keys and entry. Strict JSON parsing, bounded
fields and an allowlist protect the engine; no model output is evaluated as code.

New card types are canonical Character, Location or Class. Character requires
an identified person/NPC; Location an identified place; ambiguous, unknown or
invalid classifications use Class. The prompt requests Class when uncertain.
This is model classification, not a guarantee of factual correctness: inspect
important generated cards. EP never reinterprets an existing Class card's prose
as a Character or Location. Only actual Character/Location card types register.

Generation is throttled to at least eight enabled story turns between attempts;
owned-card refreshes require 24 turns since their last write. The first candidate
can be attempted once its two mentions exist. Failures/null results also receive
a cooldown. No extra generation solely for classification or memory compression
is performed. Existing creator cards matching a candidate's name/alias block
automatic duplicate creation, regardless of their type.

This is a focused integration, not a drop-in copy of the full upstream API.
It adapts upstream title detection and plot-relevant concise card generation,
then replaces the upstream multi-Continue workpiece/compression flow, Notes
storage and secondary control cards. LSIv2/eval, /ac commands, destructive card
commands, arbitrary card adoption, Notes memory banks, and standalone compression
are not included. Updates refresh an owned concise entry from recent established
facts while preserving older important facts in the prompt. They do not maintain
a separate unbounded per-card transcript.

REGISTRY AND CREATOR CARDS

The versioned registry is state.eventParadox.entities:
  { version: 1, items: [...] }
It stores bounded IDs, names, type, numeric card ID where available, trigger
identity/aliases, creator/autocards source and active status. It does NOT copy
whole card entries, assign roles or inject the registry into model Context.
Ordinary enabled initialization/rescans update it. Older compatible EP state
gets an empty registry on mutable access without resetting story progress.

Existing creator/imported Character and Location cards register automatically,
regardless of autoCardsEnabled. Type comparisons ignore case. Registration
never rewrites their entry, keys, type, Notes or title. EP sentinel configuration,
journal and character-memory cards are excluded; Class/Faction/custom types
are not registered as world Characters or Locations.

For creator cards, the longest safe trigger is used only when every other
stored alias is a whole-word part of it: "Chloe Parker,Chloe" is unambiguous;
"Chloe Parker,unrelated topic" is skipped. A safe single trigger also works.
UI Name/title and Notes are never required or mined for identity. For owned
Auto-Cards cards, the validated generation transaction supplies the known name.
Aliases are case-insensitive with whitespace normalized; names remain display
text. Unsafe names, ambiguous identity, duplicate numeric IDs and conflicting
cards without numeric IDs are skipped rather than guessed.

References:
  - Prefer the exact stable ID shown by /ep entities.
  - Numeric-ID creator cards use entity_c followed by that ID, e.g. entity_c11.
  - Owned automatic cards use entity_ac_ plus a deterministic transaction token.
  - Cards without numeric IDs use entity_k plus a bounded hash of type/keys.
    Hash collisions are detected and skipped; indexes are never identities.
  - A numeric card ID keeps its EP ID through reordering and trigger renaming.
    A card without a numeric ID can change reference when keys/type change.
  - Exact IDs are case-sensitive. Otherwise a full display name or stored alias
    resolves case-insensitively ONLY if it identifies exactly one active entity.
    Ambiguity is checked across both types before applying a requested type.
    Two different Characters named Alex keep separate IDs; "Alex" is ambiguous.
  - Bare numeric card IDs, objects, partial/fuzzy names and invented slugs are
    not supported references. The creator variable itself must hold a string.

/ep entities
  Lists Characters and Locations, stable IDs, display names, active count and
  the autoCardsEnabled state, including when the engine is paused. It does not
  show card entries or internal state blobs. The existing bounded list/truncation
  behavior applies. This command is read-only: it computes a current view from
  cards without persisting a rescan, initializing progress or advancing counters.
  A fresh/paused adventure can inspect creator cards this way; the next mutable
  enabled scan persists their metadata. Deleted cards cannot resolve even if
  the saved registry has not yet been refreshed.

Card deletion marks the saved entity inactive on the next ordinary scan. The
creator variable may keep its old ID, but registeredEntity returns false and
entity interpolation leaves its token literal. Missing storyCards metadata
preserves stored records for inspection, but cannot establish a currently
present entity for condition/interpolation resolution. Registration never
recreates deleted cards. Auto-Cards can independently rediscover an entity
through new eligible narrative mentions under its normal generation rules.
Inactive tombstones can yield space when new registrations fill the registry.

CREATOR-CONTROLLED RELATIONSHIP EXAMPLE

1. Auto-Cards encounters Chloe Parker in repeated narrative mentions.
2. A successful card task identifies her as Character and creates/registers her.
3. Submit /ep entities and copy Chloe's actual stable ID.
4. Submit two NEW Do actions (replace <ENTITY_ID> with that exact ID):
     /ep set = {"path":"relationship.partner","value":"<ENTITY_ID>"}
     /ep set = {"path":"relationship.status","value":"dating"}
   Each command changes only its variable; no event fires in those command cycles.
5. An authored event can require the explicit dating state plus a valid Character:

BEGIN RUNNABLE ENTITY EVENT
{
  id: "dynamic_relationship", once: true, display: "replace",
  when: { all: [
    { path: "relationship.status", op: "eq", value: "dating" },
    { path: "relationship.partner", op: "registeredEntity", value: "Character" }
  ] },
  text: "Three weeks have passed since you started dating {{entity:relationship.partner}}.",
  memory: {
    slot: "relationship", scope: "story",
    summary: "The explicitly selected relationship reached its authored milestone.",
    characterPath: "relationship.partner"
  }
}
END RUNNABLE ENTITY EVENT

This small additional event demonstrates the new schema; it is not installed
in the bundled Missing Stage Key scenario and does not replace that fixture.
Add it to YOUR event list only if it belongs in your story. On the next normal
eligible output, the two deterministic conditions can pass. Discovery alone
cannot make them pass: the creator/player explicitly assigned the role/state.

registeredEntity
  { path: "relationship.partner", op: "registeredEntity", value: "Character" }
  { path: "venue", op: "registeredEntity", value: "Location" }
Allowed requested types are Character or Location (case-insensitive). Missing,
non-string, unknown, inactive, ambiguous or wrong-type references return false.
No other condition operators change.

{{entity:relationship.partner}}
  Reads the variable, resolves its active entity, and inserts the display name
  as plain text with the existing 120-character/control-character safeguards.
  Works for Characters and Locations. Failure keeps the entire token literal.
  The entity: prefix itself opts into this new interpolation; interpolate=true
  is not required for it. Existing {{path}} substitution still requires the
  event's interpolate=true flag, exactly as before. No expressions are executed.

memory.characterPath
  Mutually exclusive with memory.character; supplying both invalidates the
  definition. The safe path is read AFTER that event's effects, when memory is
  recorded. It must resolve to an active Character, not a Location. On failure,
  the event, its effects and ordinary authored memory/log remain; only the
  dynamic character slot/mirror is skipped. EP never chooses the wrong person.
  Dynamic character slots/mirror keys use entity ID so equal names cannot merge.
  Explicit memory.triggers still work; otherwise registered aliases are used.
  Hard-coded memory.character remains supported with its existing behavior.
  memory.summary stays literal; entity interpolation applies to event text only.

SINGLE-HOOK LIFECYCLE AND MAINTENANCE ISOLATION

Input: Capture /ep before all automatic logic. Cancel abandoned card requests;
ordinary enabled inputs can register existing cards. There is one modifier.
Context: EP first cleans known controls and adds its bounded authored memory.
A console cycle receives its neutral control prompt only. For ordinary play,
opted-in Auto-Cards may append a bounded background task if it fits maxChars.
It never truncates Memory/story to fit a task; insufficient room defers work.
The structured marker/request is captured in the versioned bounded
state.eventParadoxAutoCards.pending transport namespace (phase=awaiting_sidecar),
outside creator variables.
Output: Console has first priority and retains the v0.2.1 blank/stop fix.
Otherwise a matching automatic request separates normal narrative from its
structured sidecar. Only the card phase parses/validates/writes cards and
registers entities. That phase never calls event selection, increments counters,
consumes legacy commands or writes the EP event journal. The recovered narrative
then goes through the ordinary EP pipeline exactly once, so an authored replace
scene always wins over model prose. Candidate detection sees the final visible
ordinary narrative, including authored EP scenes, not discarded model prose.

A combined response has ONE normal story turn, not an extra maintenance turn.
A response containing ONLY internal card work advances NO EP story turn/event
or pending legacy command; it returns a short non-story console status instead
of raw JSON. Malformed/missing/truncated results are discarded; a normal prose
prefix survives. No script path asks the player to press Continue just for
maintenance, and no hidden generation API or second model call is invented.
Normal generations may use more output tokens/Context when the option is on.

The task marker is cleared before parsing/card APIs, with bounded receipts
saved on success/failure. A new Input, changed slot/Undo, pause, toggle or console
request cancels stale pending work. Recognized Retry strips/replays the card
phase without duplicating writes, while the normal EP receipt handles story
progress. If the host restores before-state but retains a created card, the
exact creation-transaction ownership marker can recover it instead of creating
another. A matching content-checked revision also recovers an already-written
update under that profile without rewriting it again. Manually changed content
fails recovery rather than being adopted. An unconfirmable card write never
guesses an ID or adopts a creator
card. A documented successful index with a delayed card snapshot permits an
immediate provisional entity; the next hook resolves its real numeric ID.
Unusual unconfirmable return/snapshot combinations register conservatively as
creator cards on a later scan until ownership can actually be established.

OWNERSHIP AND UPDATES

Generated entries carry an [EP Auto-Cards ...] ownership marker and a bounded
revision line identifying the write transaction plus a content digest. The
bounded ownership ledger maps the marker to numeric card ID, keys, known name,
type and last-entry hash. These short headers are additional to the 1000-character
entry-body limit. Type alone never establishes ownership. Only a verified
owned card can be automatically updated. The type is preserved on update even
if a later model reply suggests another category. Registry aliases/metadata
update without duplicating its entity ID. Manually changed content/type fails
the hash/type precondition and is left alone; no automatic creator-card adoption
is exposed. EP mirrors use their separate sentinel keys and cannot be targets.

Registry metadata reflects PRESENT cards, so it is excluded from EP's narrative
Undo snapshots and is refreshed from the host's current cards. Undo does not
delete generated cards or rewrite creator variables to chase missing cards.
Whether the host rolls cards back with state is a live-platform concern.
The existing bounded, heuristic action-count/history Retry limits still apply.

LIMITS AND SCOPE

EP_ENTITY_LIMITS in Library:
  64 records, 8 aliases per record, 80 characters per name/alias,
  512 characters of raw trigger identity, 16384 serialized registry characters,
  first 512 Story Cards examined per scan. No full card entries are duplicated.
  At capacity, existing active entities are preserved and new registrations
  are skipped with debug diagnostics. A card can still exist without registering.

EP_AC_LIMITS in Library:
  24 title candidates, 16 owned-card records (including deleted identities),
  8 task receipts, 1000-character entry, 3000 characters of recent narrative
  evidence, 5500-character task prompt, 6000-character structured result,
  20000 serialized metadata characters. There is one pending task, no nested
  job queue or duplicated whole-story context. Caps are conservative additions
  to the engine's existing bounded state, not a claim about a host state quota.
  The card task has a separate allowance from memoryBudget and must ALSO fit
  info.maxChars. It does not consume the authored-memory budget or evict host text.

If debug=true, bounded messages report candidates/classification, card writes,
registry changes/skips/full/stale state, ambiguous references, task begin/end,
context deferral and failures. They go to log, not narrative. Console commands
still do not need debug. Keep the config's true/false spelling.

OFFLINE-ONLY VERIFICATION AND KNOWN LIMITATIONS

The test suite mocks model sidecars and documented card APIs; no live model or
AI Dungeon adventure was used for this implementation. Verify live generation
format-following, response truncation, latency/token impact, Story Card injection,
card API snapshot timing and retained/restored Retry/Undo profiles before relying
on automatic cards in a published adventure. Model prose/classifications can be
wrong; the schema/ownership safeguards do not certify narrative truth.

A model that omits the sidecar simply leaves discovery for a later eligible
attempt. One that emits only card JSON produces a non-story status and consumes
no EP story turn. Ordinary capitalized-name heuristics are deliberately limited;
creator-authored Character/Location cards are the deterministic alternative for names
they miss. No semantic relationship detector, automatic partner assignment,
visible chapter-title transition, extra registry Story Cards, card deletion,
upstream Notes storage or external generation API is part of this release.

8. AUTHORING AND ORDINARY EVENT BEHAVIOR
---------------------------------------
Edit EP_START, EP_CHAPTERS and EP_EVENTS above the ENGINE divider. EP_START is
initial state, EP_CHAPTERS supplies stable chapter IDs and short descriptions,
and EP_EVENTS contains authored events. Use stable unique IDs; changing an
already-completed ID makes it a different event. Keep saved chapter IDs valid.

For each new successful ordinary enabled Output, EP increments counters,
applies an eligible legacy manualSet if present, validates definitions and
selects the highest-priority eligible event. Ties use definition order. It
commits at most one event; a transition never chains to another in that cycle.
A failed candidate is skipped without partial effects; other valid candidates
may still run. With no eligible event, ordinary model prose is unchanged.

In the supplied fixture, preparation has events at minChapterTurns 1, 2 and 3.
first_clue starts search; discoveries require at least two chapter Outputs,
the clue, the missing key and an explicit choice. A valid helper has priority
over discovery. Recovery and opening have separate stage checks, while
festival_rush_passes and festival_aftermath deliberately leave ordinary turns
between events. Multiple condition group keys all have to pass; not means
none of its children may match. The canonical v0.4 fixture is above.

append adds two newlines plus the exact authored text to successful model
prose. replace substitutes the entire model Output. Use replace for events
that must control the whole visible scene. Use explicit
timeAdvance on events/chapters to advance narrative time; prose alone never
advances it. See section 14. Optional announcements follow event prose.

once defaults true, with permanent completion tracking (maximum 1024 IDs).
For repeating events, once=false requires cooldownTurns>=2. Enabled Output
distance, not host action count or elapsed clock time, governs cooldown.
Normal turn gates include the current successful Output. A different
nextChapter resets chapterTurns to zero; the same chapter leaves it running.
Disabled/failed Outputs and read-only/set console actions are not story turns.
A force is a real event and uses the existing successful-event counter rules.

Effects use set, add or subtract. Arithmetic requires an existing finite
numeric variable and rejects overflow. All event effects and progress changes
are transactional: later failure rolls back the candidate's earlier effects.
Only explicit effects change creator variables. No arbitrary code is evaluated.

Event prose is literal by default. Opt-in interpolate=true supports {{path}}
for existing non-null scalar values, resolved before event effects (after any
ordinary legacy manualSet). Substitutions are plain text, capped at 120 chars
with control characters normalized. Missing/null/container values leave the
placeholder intact. No expression evaluation or Markdown execution occurs.
Rendered event prose must fit the existing 16000-character limit.

9. MEMORY AND STORAGE
---------------------
Only creator-written memory.summary becomes event memory. Within EP event memory, no automatic
summaries or facts are extracted from player/model text. Opt-in Auto-Cards
generation separately writes its own normal world-reference cards. Reusing a memory.slot
replaces its earlier facts. Chapter scope expires on leaving its chapter;
story scope survives. New transition memory belongs to the destination chapter.

In the fixture, search updates the stage_key slot until discovery replaces it
with recovery facts. The final stage check replaces stage_status with a story
memory; festival_rush_passes similarly replaces festival_progress. Opening
and the finale add their own story memories. The preparation/helper chapter
memories expire on leaving preparation/search. Character memories keep latest
authored facts per character identity. Context uses word-boundary trigger
matching against recent narrative, not substring matching inside other names. Long summaries may not
fit the configured Context allowance and are omitted rather than truncated.

All EP Context additions share one budget and remaining info.maxChars room.
They are inserted after the platform Memory prefix when info.memoryLength and
maxChars are usable. EP omits its addendum when there is insufficient space
or metadata. It never truncates the host prompt to make room and never writes
state.memory.context or state.memory.authorsNote. Known console artifacts are
filtered separately, including while paused.

Bounded storage:
  variables: 8192 JSON characters; completed IDs: 1024; event log: 32 entries;
  current memories: 8 slots; character facts: 16; progress checkpoints: 6;
  separate console receipts: 16; character mirror summary: 480 characters;
  journal: 8000 characters. Old log, memory, receipt and checkpoint entries
  rotate out. One-shot completion is retained; at capacity a new completion
  cannot be committed safely. No recursive checkpoint nesting is stored.

Character mirrors have EP-owned sentinel keys beginning
__EVENT_PARADOX_CHARACTER_V1__ and Type Event Paradox Character v1. The optional
journal uses __EVENT_PARADOX_JOURNAL_V1__ and Type Event Paradox Journal v1.
These keys avoid ordinary-name Story Card triggers; character relevance is
handled in EP Context. User character cards are never overwritten. Turning
mirroring off/pausing stops writes, but does not delete existing mirrors.
The host may independently include an already-existing card in its own Context.
Optional card API failures cannot suppress already-committed event prose.

10. RETRY, UNDO AND CONSOLE TRANSPORT
------------------------------------
Input captures the whole command, stores a bounded request, and returns a
nonempty [Event Paradox Console request #N] placeholder. Context supplies only
a neutral control prompt for that cycle; it does not expose the raw command,
event ID or set JSON to narrative generation. Persistent player Memory is
left untouched even though it is not sent in this control-only prompt.

Output recognizes the pending/replayed request before checking narrative
success. Empty, whitespace, null, undefined and literal "stop" model values
therefore still yield help/status/IDs/previews, a set confirmation or exact
forced/timeSkip prose, chapter previews/transitions or timeline responses. The wrapper must actually reach Output; this script cannot
finish a command if the host never invokes that hook. There is no documented
skip-generation/direct-action API in use, so a console action may still incur
host generation latency or token cost. Empty Output does not advance ordinary
story progress or consume legacy card development commands.

Console transport is separate state.eventParadoxConsole metadata. Info and
preview receipts do not initialize or mutate progress. Set and force also
save a bounded progress checkpoint so a retained-state Retry/Undo can reconcile
their real mutation. Set's console text remains non-canon; forced prose remains
story content. A set response describes that original transaction; Retry does
not overwrite a later variable change just to match the old confirmation.

Retry with retained state replays the saved response without recommitting
mutations. With host-restored before-state, the transaction can be reproduced
once from that restored snapshot. Re-running Input is covered for modeled
raw/modified history profiles. An edited Retry of an already identified
console slot cannot repurpose its command. Submit a new action to change it.
An abandoned pending command is cancelled by a new ordinary Input. Continue
after a finished console response is normal story processing.

Identity uses info.actionCount and a bounded signature of recent history;
there is no verified stable generation UUID. This is a HEURISTIC. Completely
identical host snapshots cannot distinguish a deliberate new action from
Retry. Missing both action count and usable history blocks mutating commands;
orphan commands without recoverable capture/receipt fail closed. Failure
receipts do not retry themselves after enabling/fixing settings: reissue.

Internal Undo is bounded to six progress checkpoints (sets use a slot too).
Within modeled profiles it restores earlier progress and removes later
checkpoints. A set receipt whose progress checkpoint has expired cannot
reconstruct that state: it returns an error without rewriting variables.
Beyond retained history or with recoveryRequired, stop making EP
changes and restore an appropriate state backup or start a new adventure.
Do not clear the recovery flag or completion data as an improvised reset.
If the host restores progress and console metadata inconsistently, guarantees
are limited; these host lifecycle details still need live verification.
Optional Story Card mirrors are not a general host Undo system: do not assume
an informational/set command or Retry will resynchronize externally edited
or rolled-back cards. Console Retry intentionally avoids new mirror writes.

On later ordinary Context, EP strips identifiable command actions, placeholder
markers and complete [Event Paradox Console] blocks outside the Memory prefix.
Forced authored prose and canonical timeSkip prose remain. Host summaries, reformatted/truncated artifacts
or independently generated Story Card content may evade this cleanup. We do
NOT claim raw slash commands or confirmations disappear from underlying
AI Dungeon history, exports or the visible UI. No history deletion API is used.

11. LEGACY CONFIGURATION-CARD DEVELOPMENT COMMANDS
-------------------------------------------------
Legacy/deprecated as a workflow, still supported for existing v0.1/v0.2 cards.
New creators should use /ep set, /ep testEvent and /ep forceEvent. These fields
are parsed internally but absent from newly generated/imported default cards.
Old cards do not require migration and are not automatically rewritten.

manualSet
  Example Entry line:
    manualSet = {"revision":1,"path":"choice.search","value":"backstage"}
  Positive integer revision must exceed saved lastManualRevision. On the next
  NEW successful enabled ordinary Output, it applies a safe variable set before
  normal event evaluation. Unlike /ep set, that ordinary cycle advances turns
  and MAY immediately fire an event. debug is not required. Blank/invalid
  manualSet is ignored; failed writes do not consume the revision. Each new
  command needs a higher independent revision. Clearing it does not reset the
  saved revision. Continue can supply the next ordinary Output; Retry cannot.

Card testEvent / forceEvent
  Example preview settings:
    enabled = true
    debug = true
    commandRevision = 1
    testEvent = find_key_backstage
    forceEvent =

  Example force settings for a later new command:
    enabled = true
    debug = true
    commandRevision = 2
    testEvent =
    forceEvent = find_key_backstage

  Both need enabled=true AND debug=true AND a positive commandRevision greater
  than lastCommandRevision. They run on a NEW nonblank successful ordinary
  Output. A slash-console cycle defers them without consuming revisions.
  They bypass event eligibility/completion but retain definition validation.

  testEvent previews exact authored text using display append/replace against
  that model Output. It changes delivery receipt/high-water bookkeeping only;
  effects, chapter, timeline, anchors, memories, turns, log and completion do not change.
  forceEvent commits the complete normal event transaction, including counters,
  effects, time advances, anchors, memory, transitions and completion, with optional mirrors/journal.
  Neither runs ordinary event selection or a pending manualSet in its cycle.

  If BOTH fields are nonblank, testEvent ALWAYS takes precedence. This includes
  an invalid testEvent ID: it cannot fall through and force the other event.
  The shared revision is consumed once even on a rejected event or failed
  force transaction. Correct an ID and INCREASE commandRevision to try again.
  Clearing testEvent does not activate forceEvent under an already-used revision.
  Missing/invalid/zero/stale revision does not arm a development request.

  Once handled, later ordinary Outputs resume normal selection. Retry replays
  its saved result without repeating effects, counters or mirror writes, and
  still respects enabled/debug. Editing a revision during Retry waits for a
  new Output; it cannot turn an old action into a new command. Internal Undo
  does not re-arm a consumed lastCommandRevision. Host-restored before-state
  may reproduce one deterministic transaction under the modeled Retry profile.

Slash commands never consume or change lastManualRevision/lastCommandRevision.
Original v1 state lacking lastCommandRevision is accepted; absence means zero.
Disabling the engine freezes legacy commands and normal progress. The broader
read-only console availability while paused is intentional v0.2 behavior.

12. TESTS, TROUBLESHOOTING AND LIVE LIMITATIONS
----------------------------------------------
From the directory containing event_paradox:
  node event_paradox/tests/run-tests.js

Syntax-check each JS file, including the canonical fixture:
  node --check event_paradox/Library.js
  node --check event_paradox/Input.js
  node --check event_paradox/Context.js
  node --check event_paradox/Output.js
  node --check event_paradox/events.example.js
  node --check event_paradox/tests/run-tests.js
  node --check event_paradox/tests/fixtures/missing-stage-key.js
  node --check event_paradox/tests/fixtures/dynamic-entities.js

The suite uses fresh Node VM contexts for hooks and JSON-round-tripped state,
cards and history. It covers all three supplied routes through free_roam,
literal/interpolated prose, helper priority and character memory, registration
of companion cards, invalid entity references, chapter timing and memory
expiry, blank console Outputs for console commands,
ordinary blank safeguards, set parsing/limits/transactions, no same-cycle
selection, state-neutral previews, force validation, retained/restored Retry,
legacy cards, config defaults, memory budgets, card failures and bounded Undo.
Existing small synthetic unit cases remain to test individual engine safety
rules; the runnable sample, route integrations and walkthrough exclusively use
the v0.4 Missing Stage Key definitions.
The suite also covers rich/legacy chapters, announcements, duration validation,
anchors, timeline Context, chapter/time/timeSkip commands, additive migration, bounded
Undo and Auto-Cards maintenance isolation. Creator-guide runnable blocks and
branch arrays are extracted, syntax checked, validated and exercised.
timeSkip tests cover first-semicolon parsing, exact multiline prose, wrapper
handling, quoted dialogue, hour carry/anchor age, all four time-advance paths,
old hourless states/checkpoints, pure console ownership, blank/stop Output,
Retry/Undo, paused/recovery blocking, raw-history cleanup and command-cap edges.
Command-cap tests verify EP bounds only; they do not simulate host input limits.

This is OFFLINE verification. No live AI Dungeon test was performed for this
release. The earlier live blank-output error is user-reported; the fix is
reproduced and tested through the documented hook contract in the offline mock.
Before publishing a scenario, run the walkthrough and console/Retry checks in
a disposable live adventure, including pause/re-enable, raw history retention,
Continue without Input, and both fresh and existing progress. Verify the host
actually reaches Output for the command, including blank/stop responses.

If a command produces the old "No successful model output was supplied" error,
confirm the Library engine is v0.4, saved, and used by this adventure. Other
scripts may need to be ordered so EP owns its command cycle. If the literal
command becomes narrative, inspect Input installation and whole Do syntax.

If no event fires: use /ep status and /ep eventsID, check enabled, chapter,
turn gates, explicit variables, completion and event validity. Natural-language
choices do not set variables. /ep set confirms the change only; follow it with
an ordinary successful Output. Set debug=true to see invalid definitions or
transaction failures in the scripting console.

If set fails: use strict JSON, a relative safe creator path, and values within
all final-tree limits. Do not target chapter/state/internal roots. Failed sets
do not partially commit; submit a corrected new command. If a force fails,
inspect its definition and effect requirements; it never bypasses validation.

If progress fails validation: keep a backup, retain saved chapter definitions
and inspect the error. EP does not silently reset incompatible saved state.
Disabling EP can let ordinary host prose continue while you inspect a copy.

API references rechecked on 26 September 2026 for v0.3:
  https://help.aidungeon.com/faq/how-do-i-write-scripts-and-use-scripting
  https://help.aidungeon.com/scripting

The implementation uses Library plus Input/Context/Output modifiers returning
{text}, persistent state, history text/type, info.actionCount, Context maxChars
and memoryLength, and Story Card keys/entry/type with addStoryCard/updateStoryCard.
Runtime card indices are rescanned; no guessed IDs, Notes setters, hidden UI
channel or undocumented generation cancellation API is used. Title/description
fields in the optional import JSON are UI metadata, not runtime dependencies.

Host history/Retry/Undo timing and card injection may differ from the mocks.
The engine promises its own transactional behavior within the state/history
it receives; it cannot guarantee exactly-once execution across arbitrary host
snapshot changes, edit/export flows, network failures or other scripts' writes.

13. FULL SCHEMA AND OPERATOR REFERENCE
---------------------------------------
Definitions block:
  EP_START = { chapter: "known_id", variables: { ...your JSON-compatible data } }
    Used once for a new state only. The notation here is a reference; use the
    complete runnable blocks above when copying a scenario.
  EP_CHAPTERS = object mapping up to 64 stable IDs to strings <=240 characters
    or strict rich chapter objects. See section 14 for fields and limits.
  EP_EVENTS = array; only first 256 definitions are candidates.

Event fields (unknown field names invalidate that event):
  id                 REQUIRED unique ID, 1..64 characters; start with A-Z/a-z,
                     then letters, digits, underscore or hyphen.
  text               REQUIRED nonblank string, <=16000 characters. Cannot be
                     the exact string "stop". Rendered text has the same cap.
  title              Optional nonblank string <=120 characters; defaults id.
  enabled            Boolean; default true.
  priority           Finite number from -1000000 to 1000000; default 0.
  once               Boolean; default true. false requires cooldownTurns>=2.
  cooldownTurns      Integer 0..1000000; meaningful for repeats; see above.
  chapter            One known chapter ID or nonempty list of up to 64 known
                     IDs; omitted accepts any current chapter.
  minTurns           Integer 0..1000000; default 0; includes this Output.
  minChapterTurns    Integer 0..1000000; default 0; includes this Output.
  when               Optional leaf or group. Omitted/{} is unrestricted.
  display            append or replace; default append.
  interpolate        Boolean; default false; opt-in {{path}} replacement.
                     New {{entity:path}} tokens explicitly opt in by prefix.
  effects            Optional array of up to 32 effects; default none.
  nextChapter        Optional known chapter ID. Different ID resets counter.
  memory             Optional authored memory object described below.
  timeAdvance        Optional duration: years/months/weeks/days/hours (section 14).
  timeAnchor         Optional {id,label?,context?}, recorded after time advances.

Duplicate IDs invalidate ALL occurrences of that ID, even if one is disabled.
Disabled events are not ordinary candidates; explicit development commands
can target them. Invalid definitions are skipped in either path; debug
reports them. Event chapter gates and nextChapter must exist in EP_CHAPTERS.
Existing saved chapter IDs must remain known or EP fails closed on that state.

Leaf condition, exactly these fields:
  { path: "safe.variable", op: "eq", value: true }
  path: Safe dotted variable path, relative to EP variables.
  op: One of the operators below.
  value: REQUIRED scalar, even for exists. Numeric comparison values must be
         numbers; exists values must be boolean. Strings <=2000 characters.

Operators:
  eq        Actual === expected. Strict identity for scalar values.
  ne        Actual !== expected. Missing actual still returns false.
  gt        Actual and expected numbers, actual > expected.
  gte       Actual and expected numbers, actual >= expected.
  lt        Actual and expected numbers, actual < expected.
  lte       Actual and expected numbers, actual <= expected.
  exists    value:true tests present; value:false tests missing. null counts
            as present. Only own properties are read.
  registeredEntity  Value must be Character or Location (case-insensitive).
                    Variable must resolve to exactly one active entity of that
                    type; IDs/names/aliases and failure rules are in section 7a.
  includes  Actual must be an array containing the expected scalar with strict
            equality. No substring, regex, coercion or object-deep comparison.

All operators except exists return false for a missing path. Arrays/objects
are not deep-compared; use leaf paths or includes for scalar collection members.
For example, key.finder eq "Maya" differs from eq "maya".

Group object:
  Allowed keys: all, any, not. Each supplied value is an array of conditions.
  Every child is a leaf or another group. Empty/omitted lists do not restrict.
  all every; nonempty any at least one; not none; multiple group keys combine
  conjunctively. Maximum depth is 8 below the root; <=128 total nodes per when.

Effect object, exactly these fields:
  { path: "safe.variable", op: "set", value: true }
  set       JSON-compatible value; creates missing object parents.
  add       Finite numeric amount added to an existing numeric leaf.
  subtract  Finite numeric amount subtracted from an existing numeric leaf.
  No arbitrary JavaScript expressions, chapter writes or reserved-state paths.

Memory object:
  summary    REQUIRED nonblank creator-written string <=600 characters.
  slot       Optional ID with the same format as event IDs; defaults event id.
  scope      chapter (default) or story. A transition's new memory belongs to
             the destination chapter. Chapter-scoped memory expires on exit.
  timeAnchor Optional safe anchor ID; renders age alongside the stored summary
             in dynamic Context when the anchor exists. Does not create anchors.
  character  Optional nonblank name <=64 characters. Exact name identifies one
             latest-fact character slot; capitalization matters for identity.
  characterPath Optional safe variable path resolving an active Character.
             Mutually exclusive with character; post-effect resolution.
             Unresolved target skips only character memory, not the event.
  triggers   Optional nonempty list of up to 8 nonblank phrases, each 2..64
             characters, used only for EP Context relevance. Requires a character target.
             If absent, character name is used. These are NOT platform keys.
  All summaries are used literally; interpolate applies to event text only.

Safe path/value rules:
  Path length <=160, <=8 dot-separated segments. Each segment begins with a
  letter and continues with letters, digits or underscore. No array indices,
  bracket syntax or prototype traversal. __proto__, constructor and prototype
  are prohibited, including nested object keys. Hyphens are allowed in event
  IDs but not variable path segments. All values must survive JSON persistence:
  null, boolean, finite number, string <=2000, array or safe object. Containers
  have <=64 entries, nesting is bounded to six container levels beneath the
  checked root, and the total variables JSON must remain <=8192 characters.
  No undefined, functions, Dates as objects, cyclic references or special APIs.

Persisted state fields:
  version=1; chapter; variables; completedEvents; enabledTurns; chapterTurns;
  eventLog (32); repeatTurns; memories (8); characters (16);
  lastManualRevision; lastCommandRevision; checkpoints (6); recoveryRequired;
  entities (versioned, separate from creator variables and narrative Undo);
  timeline (version 1, months plus normalized days/hours and <=32 anchors).
  Timeline is authoritative story progress and IS included in Undo snapshots.
  lastCommandRevision is command-delivery bookkeeping and defaults to zero if
  absent in older v1 state. It is excluded from internal story-progress Undo.
  Command receipts tag their kind, event ID and revision within checkpoints.
  Console force/set/chapter/time/timeSkip receipts also tag their result for idempotent replay.
  A checkpoint stores the previous progress plus a receipt of authored text;
  checkpoints never recursively contain other checkpoints. Do not edit these
  fields casually. They support idempotency and bounded Undo, not a public
  save-file migration API. Config edits do not reset them.

Supported config keys/defaults, for quick lookup:
  enabled=true
  memoryMode=compact
  memoryBudget=120
  autoCharacterCards=false
  journalEnabled=false
  autoCardsEnabled=false
  debug=false

Legacy parser fallbacks only (not emitted into new cards):
  manualSet=(blank), commandRevision=0, testEvent=(blank), forceEvent=(blank).

Separate console transport namespace:
  state.eventParadoxConsole = version, sequence, pending, receipts (16 maximum).
  It is created only when an /ep action is captured. These transport records
  are not part of EP's creator variables or story-progress rollback snapshots.
  Program release EP_VERSION is "0.4"; the compatible progress/card schema
  still uses version 1 and the original V1 sentinel keys.

14. RICH CHAPTERS AND THE NARRATIVE TIMELINE (v0.4)
-------------------------------------------------
This is authored story time, not a real-world clock. EP never reads device time,
waits for timers, extracts elapsed time from prose, or advances time per turn.
Closing AI Dungeon for a week changes nothing. Only real event timeAdvance,
entry into a different chapter with timeAdvance, /ep advanceTime, or
/ep timeSkip moves it. All four share the same validator and timeline mutation.
No new configuration options or Story Card sentinels are required.

Rich Chapters
  Old syntax remains valid: search: "The key is missing."
  It is interpreted as a description-only chapter with no entry presentation.
  Rich objects accept ONLY these fields (unknown keys reject the definition):
    description  Required nonblank string <=240 characters.
    title        Optional nonblank string <=120 characters.
    announce     Optional boolean, default false.
    opening      Optional nonblank authored string <=4000 characters.
    timeAdvance  Optional duration object described below.
  All chapter IDs keep the existing safe ID rules. A chapter can have many,
  one or zero events. It does not automatically complete or advance onward.
  Rich chapter fields are literal text: no interpolation is performed in
  title, description or opening. Current chapter description still feeds Context.

Visible Chapter Announcements
  A different destination with announce=true produces plain text:
    ────────────────────
    ACT II — A New Routine
    ────────────────────

    Three months later...
  The title is exact, with no forced capitalization or added word "Chapter".
  If title is absent, its chapter ID is used. The authored opening follows
  the heading block. With announce=false, neither heading nor opening appears.
  Real transition events display event prose first, two newlines, then the
  destination presentation in the SAME Output. display still governs the event:
  append preserves model prose; replace replaces it. Event text keeps its
  16000-character cap; the bounded chapter presentation is appended separately.
  An event naming its already-current chapter does not announce it again.
  EP_START initialization is not an entry transition: fresh time is zero and
  no chapter opening or entry time is automatically applied at initialization.

Narrative Timeline and Duration Normalization
  Duration objects allow ONLY years, months, weeks, days and hours. Missing units
  and {} mean zero. Each supplied value must be an integer from 0 to 1000000.
  Negative numbers, floats, strings, null, NaN/Infinity, unsafe/unknown keys
  and unsupported minutes are rejected. Values never run as code.
  Internally, months stay independent of days; hours carry into days:
    timeline = {
      version: 1,
      elapsed: { months: 0, days: 0, hours: 0 },
      anchors: []
    }
  Years add 12 months; weeks add 7 days; each 24 hours carries into a day.
  Stored hours are normalized to 0..23. For example, timeAdvance:{days:2,hours:6}
  is valid JSON-style authoring. {months:14,days:10,hours:30} stores 14 months,
  11 days, 6 hours and displays 1 year, 2 months, 1 week, 4 days, 6 hours.
  Months NEVER convert to days; weeks NEVER convert to months. No dates,
  calendar precision, month lengths or leap years are claimed.
  A single duration AND the cumulative timeline are limited to 12000000 total
  months, 7000000 whole days and 0..23 residual hours. Inputs including hours
  retain the per-unit 0..1000000 cap. Hour carry that exceeds 7000000 days
  rejects the whole transaction. The maximum day/hour position is 7000000
  days, 23 hours. There is no DST/time-zone or calendar-date behavior.
  This representation supports future elapsed-since-anchor logic without a
  calendar conversion. Time remains separate from creator variables; v0.4
  exposes it through /ep time, status and Context, not condition variable paths
  or general {{path}} interpolation. /ep set cannot target the timeline root.

Chapter timeAdvance and Event timeAdvance
  Each real event first applies its ordinary effects to a candidate copy.
  Then the transaction follows this order:
    1. Apply event timeAdvance, if any.
    2. Apply destination chapter timeAdvance only if the chapter changes.
    3. Set destination chapter, reset chapterTurns, expire old chapter memories.
    4. Record the event timeAnchor at the resulting timeline position.
    5. Store authored memory, completion/repeat tracking and log information.
    6. Commit the progress and its already-prepared visible response together.
  Any failure discards the candidate, including partial effects, time, anchors,
  chapter or memory changes. Ordinary processing may then select a different
  valid candidate; a failed explicit force never falls through to another event.
  Ordinary successful Outputs still advance the existing turn counters even
  when no event succeeds. Those counters are independent of narrative time.
  Both event/chapter advances apply once when both are present. testEvent
  applies neither; forceEvent applies both. Repeated/forced events may advance
  event time again. Re-entering a chapter after leaving it advances its entry
  time again. Staying inside it or naming the current chapter does not.

Time Anchors and Relative Age
  An event may define:
    timeAnchor: {id:"alex_adoption",label:"Alex was adopted",context:true}
  id is required and follows event ID rules. label is optional, nonblank,
  <=160 characters, without control characters/newlines. context is an optional
  boolean, default false. Unknown fields reject the event. Up to 32 anchors
  are retained; no anchor is silently evicted. At capacity, a new anchor makes
  the event transaction fail. An existing anchor ID does not consume more space.
  Stored anchors add at:{months,days,hours}, the final event/chapter timeline position.
  The FIRST successful occurrence wins. A later event or deliberate force using
  that ID neither moves its position nor replaces its label/context flag; debug
  logs a bounded warning. Use a new ID for a new milestone. Retry does not
  recreate anchors. Undo removes/reinstates anchors with their progress snapshot.
  Age subtracts months independently and the combined day/hour position,
  borrowing 24 hours from a day where needed, then formats the difference,
  e.g. 6 hours ago, 3 months ago or 1 year, 2 months, 1 week, 3 days, 6 hours ago. It is approximate
  narrative duration; 0 days ago denotes the current narrative position.

Timeline Context and Optional Memory Association
  Meaningful time or a context=true anchor adds a high-priority
  [Event Paradox Timeline] line inside the existing EP memory Context block.
  It shares memoryBudget and available info.maxChars space with chapter and
  authored memories. Chapter plus elapsed time are preferred together when
  they fit; otherwise elapsed time has priority. At most the latest three
  context=true anchors are considered, with creator labels rather than IDs.
  An unlabeled anchor uses "An authored milestone occurred". context=false
  anchors are not listed there. Nothing meaningful means no timeline line.
  Entire pieces are omitted if they do not fit; host Context is never truncated.
  memoryBudget=0 or enabled=false omits EP dynamic Context. Persistent player
  Memory and Author's Note are never overwritten.
  Optional memory.timeAnchor is a safe anchor ID. It explicitly makes that
  memory's age relevant, independently of the anchor's general context flag.
  Context appends "(3 months ago)" when the anchor exists. Missing anchors leave
  the summary alone. The stored authored summary and mirror/journal prose are
  never rewritten. This field creates no anchor by itself.

/ep time
  Read-only, available while paused, and works with blank/stop Output. Shows
  current chapter ID/title, elapsed narrative duration (nonzero hours included) and a bounded anchor
  listing (including IDs for creator use). The ordinary 40-item/6000-character
  list limit applies; the state itself permits at most 32 anchors. No counters,
  variables, memories, events, timeline, registry or legacy revisions change.
  A fresh/old state without timeline is displayed as zero without migration.

/ep testChapter = CHAPTER_ID
  Read-only, repeatable without revisions, available while paused and blank/stop
  Output-safe. An announced chapter shows the same exact heading/opening block
  as real entry, inside a labeled non-canon PREVIEW. Hidden rich chapters show
  title/description/opening metadata and explain that entry is normally silent.
  Legacy strings show ID/description and explain that no title/opening is set.
  The preview applies no duration and changes no chapter, counters, timeline,
  anchors, memories, completion, journal, registry or progress checkpoints.
  Unknown/invalid IDs produce a receipted error. No unrelated model prose appears.

/ep forceChapter = CHAPTER_ID
  Requires enabled=true, but no debug setting or revision. Forces a real entry:
  destination timeAdvance applies once, chapterTurns resets to zero, and old
  chapter-scoped memories expire. Story-scoped memories remain. The configured
  title/opening is shown as canonical prose; a hidden/legacy destination returns
  a non-canon confirmation. For the already-current chapter, time and chapter
  turns stay unchanged and the response explains why. enabledTurns does not
  advance. No event fires, no effects/prerequisites are invented, no event is
  completed, no anchors/event memories/log entries are created, and no mirrors
  or journal are synchronized. Entity registry and creator variables stay intact.
  WARNING: this is a real mutation that can break story continuity. Recovery
  safety and normal bounded checkpoints apply. It is blocked while paused.

/ep advanceTime = {"months":3}
  Implemented in v0.4. Requires enabled=true, no debug/revision. Validates the
  same duration rules and changes ONLY narrative elapsed time plus delivery/
  checkpoint bookkeeping. It changes no chapter, counters, variables, events,
  anchors, memories or registry. It does not trigger ordinary events or consume
  pending legacy commands. A new action is a new advance; Retry is not.

Chapter/Time Console Precedence, Retry and Undo
  Each slash command owns its cycle, including failures and previews. None
  evaluates an ordinary event afterward or consumes an unrelated legacy command.
  All new commands use the existing Input capture and console receipts. Normal
  blank/stop story Outputs remain non-turns; captured controls still complete.
  Retry reuses the saved chapter announcement/response without applying time,
  moving anchors, resetting counters or writing cards again. Timeline and anchors
  are now included in the six bounded progress checkpoints, alongside chapters.
  Internal Undo restores them together; legacy checkpoints lacking timeline
  restore zero, and old positions lacking hours restore their months/days with
  hours=0. Retained console receipts do not justify guessing a lost progress
  checkpoint. Missing chapter/time mutation checkpoints require recovery, and
  unsafe rollback beyond the retained window sets recoveryRequired.
  As before, arbitrary host snapshots or history edits outside the modeled
  contract cannot be promised exactly-once behavior. Keep live test backups.

Migration and Auto-Cards Maintenance Interaction
  Program version is 0.4; stable progress/card/console schemas remain version 1.
  An absent timeline on mutable access gets zero elapsed time and no anchors.
  For existing v0.4 data, missing elapsed.hours and anchor at.hours fields mean
  zero. They are added on mutable access or checkpoint restoration. Read-only
  commands use a normalized view without changing the saved object; old stored
  checkpoints remain intact until used. Timeline schema stays version 1 because
  this is additive. Present-but-invalid hours are rejected, not reset to zero.
  All variables, chapter, turns, completion, memories, registry, Auto-Cards
  ownership and console state are preserved. No historic anchor/time is inferred.
  Existing timeline data is validated; corrupt, future-dated or unknown-version
  timeline data fails closed and is never silently reset. /ep status remains
  useful for diagnosis. New saves use the bounded version 1 timeline structure.
  Card-only maintenance never enters the story event pipeline. It applies no
  event/chapter time, creates no anchors/announcements, increments no story turns
  and executes no chapter command unless the player explicitly submitted it.
  timeSkip also bypasses sidecars and discovery in its console cycle; its
  canonical prose remains in history for later normal story processing.
  Registry metadata may still synchronize normally, as in v0.3. A response with
  both a valid sidecar and real narrative processes the narrative exactly once.

Future Deadline Roadmap (not implemented)
  The separate duration axes and stable anchors prepare for later maxTurns,
  maxChapterTurns, event windows, deadlines, onExpire and anchor-relative gates.
  v0.4 does NOT implement these fields or any expiry behavior. Unknown schema
  keys remain errors. There are no real-world timers, automatic per-turn time,
  inferred prose time skips, calendar dates, role assignment or visual editor.

15. /ep timeSkip: MANUAL CANONICAL TIME SKIPS (v0.4)
--------------------------------------------------
Use a Do action for all /ep commands, including:
  /ep timeSkip = 3mo;Three months pass. Alex settles into his new home.
  /ep timeSkip = 6h;By evening, the house has finally gone quiet.
  /ep timeSkip = 1y,2mo,3d,6h;More than a year passes; old routines feel normal.

EP records HOW MUCH time passes. The player writes WHAT happened. It does not
summarize, rewrite, classify or extract facts from the supplied prose.

Syntax and Exact Text
  The FIRST semicolon after = is the only separator. The prefix is a compact
  duration; every character after that separator is literal canonical prose,
  including later semicolons, leading/trailing spaces and line breaks.
  No JSON parsing, expression evaluation, interpolation or semantic extraction
  is performed on TEXT. The response is TEXT exactly: no Console frame,
  "Time skip:" prefix, diagnostics, duration heading or model-generated prose.
  Empty/whitespace-only text and the literal lowercase stop (also if padded
  with whitespace) are rejected. Normal punctuation and paragraph breaks stay.
  Command names and unit suffixes are case-insensitive; examples use lowercase.
  The parser accepts the existing whole-action > You /ep ... Do wrapper.
  It removes that prefix/leading command whitespace but does NOT remove a
  trailing period or trailing prose whitespace for timeSkip. Those belong to
  TEXT. EP cannot identify punctuation independently added by a host wrapper.
  Quoted Say dialogue and embedded mentions remain ordinary narrative. As with
  existing controls, a bare whole-action /ep command may be captured if the
  host passes it verbatim from Story mode; no special Story path was added.

Compact Duration Rules
  y = years; mo = months; w = weeks; d = days; h = hours.
  Supply one to five distinct unit tokens, separated by commas, in any order.
  Each token is decimal digits immediately followed by a unit: 2d,12h.
  Whitespace around the duration/tokens is accepted: 3mo, 2d, 6h.
  Whitespace between a number and its unit is not accepted. Omitted units are
  zero. 0h is valid. Leading zeroes are accepted. Case variants of one unit
  count as duplicates, so 2h,2H is rejected. 1y,12mo is valid and adds two years.
  Negative/fractional numbers, signs, exponent notation, NaN/Infinity, unknown
  units, bare m, minutes, empty tokens, duplicate units, unsafe content and
  missing duration are rejected. Examples of errors: -3mo, 1.5y, 3m, 3months,
  2h,2h, 1d,,2h, hello, 1d,-2h. The same per-unit/cumulative bounds in section 14
  apply. A carry or overflow rejects the WHOLE transaction with no canon.
  Compact syntax belongs only to timeSkip. Events, chapters and advanceTime
  continue using duration objects, e.g. timeAdvance:{days:2,hours:6} and
  /ep advanceTime = {"months":3,"hours":6}.

One Authoritative Transaction
  timeSkip requires enabled=true, but no debug flag or revision. It advances
  the existing timeline and commits TEXT plus bounded checkpoint/receipt data.
  enabledTurns and chapterTurns DO NOT increment. Chapter stays unchanged:
  no reset, chapter announcement, entry advance, or chapter-memory expiry.
  No ordinary event, cooldown turn, legacy manualSet/testEvent/forceEvent,
  effect, variable/relationship assignment, memory, character fact, journal,
  anchor, event completion or registry mutation occurs in the command cycle.
  Existing anchors age naturally against the new total without moving.
  Subsequent normal Context, /ep time and /ep status use that same total and
  include hours when nonzero. Zero is still displayed as 0 days.
  Auto-Cards maintenance/discovery does not run during timeSkip. An abandoned
  pending sidecar is canceled under existing console rules. Canonical prose
  stays in history for subsequent ordinary narrative generation and discovery;
  names do not cause immediate card creation or role assignment.

Transport, Retry and Undo
  Input captures the bounded command and emits the usual placeholder. Context
  sends only the neutral control prompt, not the duration or prose for the AI
  to rewrite. Output processes the command before ordinary success checks, so
  blank, whitespace, null, undefined or stop model outputs still yield TEXT.
  Raw control syntax/placeholders and non-canonical receipts are removed from
  later normal Context under the existing cleanup rules; canonical TEXT remains
  as story prose, like a forced event. No host history deletion is attempted.
  Retained-state Retry replays TEXT exactly without adding time again. A host
  restoration to the captured before-state deterministically reproduces one
  transaction under the existing modeled console rules. A deliberately new
  command action is a new skip, even with identical duration/text.
  Timeline checkpoints include months, days and hours. Undo restores all three.
  A rotated-out mutation checkpoint requires recovery; EP does not guess time.
  enabled=false, recoveryRequired, incompatible state, missing action identity,
  syntax/prose errors and overflow all fail closed with a non-canonical error,
  without emitting the supplied prose as canon or auto-enabling the engine.
  Console transport metadata may record the rejected request, as usual.

Action Length and Long-Prose Fallback
  timeSkip has a defensive cap of 4000 total normalized command characters
  (JavaScript UTF-16 code units), INCLUDING /ep timeSkip, =, duration, semicolon,
  spaces, prose and line breaks. Leading control whitespace and the > You
  wrapper are excluded; prose whitespace after the semicolon counts. Exactly
  4000 is accepted by EP; 4001 is rejected without timeline mutation or canon.
  Existing 256-character short-control and 12288-character JSON-set bounds
  are format-specific parser limits, not a universal host-action allowance.
  AI Dungeon may accept less. EP only sees actions the host accepts and cannot
  increase, bypass or guarantee the host input limit. Keep skips in one normal
  action. For longer text:
    1. Submit /ep advanceTime = {"months":3} as a Do action.
    2. Write the transition in one or more ordinary Story actions.
  Those later Story cycles follow ordinary event/turn rules; this fallback is
  not one atomic timeSkip transaction. It permits long authored prose without
  claiming a larger action limit.

Future Timed Events
  Event timeAdvance, chapter timeAdvance, advanceTime and timeSkip all use
  EP_advanceTime/EP_duration on the same timeline. No duplicate time variables,
  last-skip context system or automatic anchors were added. Future deadline
  logic can read the common timeline regardless of the source of advancement.
  This release adds no expiry processing, deadlines, event windows or queued
  consequences, and it never fires an event in a timeSkip cycle.
