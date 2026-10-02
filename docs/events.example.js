/* Event Paradox v0.4 — The Missing Stage Key, supplied fixture.
 * AI Dungeon does not load this file. Library.js already contains these definitions.
 * To restore them, copy the entire BEGIN/END block into Library, including markers.
 * Start a NEW adventure after changing EP_START; existing progress is preserved.
 * Use /ep set to choose backstage, office or a registered location; see README.txt.
 * Based on the supplied v0.3 sample, with v0.4 chapters, time advances and an anchor.
 */
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
