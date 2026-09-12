export type SupportedLanguage = 'en' | 'pt-br';

export interface Translations {
  common: {
    loading: string;
    save: string;
    saving: string;
    cancel: string;
    delete: string;
    edit: string;
    close: string;
    copy: string;
    copied: string;
    search: string;
    clear: string;
    back: string;
    win: string;
    loss: string;
    victory: string;
    defeat: string;
    recommended: string;
    none: string;
    unknown: string;
    error: string;
    success: string;
    optional: string;
    required: string;
  };
  header: {
    brandTitle: string;
    brandSubtitle: string;
    phases: {
      disconnected: string;
      lobby: string;
      champSelect: string;
      inGame: string;
      postGame: string;
    };
    modes: {
      autoLcu: string;
      simulator: string;
      manual: string;
      autoLcuTitle: string;
      simulatorTitle: string;
      manualTitle: string;
    };
    simScenarios: {
      title: string;
      scenariosTitle: string;
      lobby: string;
      champSelectAatrox: string;
      inGameAatrox: string;
      inGameDarius: string;
      inGameVarus: string;
      postGameVictory: string;
      disconnect: string;
    };
    actions: {
      tierLists: string;
      tierListsTitle: string;
      masterGuides: string;
      masterGuidesTitle: string;
      offlineModeOn: string;
      offlineModeOff: string;
      languageToggle: string;
    };
    opponentsDetected: string;
    vs: string;
  };
  sidebar: {
    searchPlaceholder: string;
    clearSearch: string;
    countLabel: string;
    filters: {
      all: string;
      easy: string;
      medium: string;
      hard: string;
      extreme: string;
      favorites: string;
    };
    sort: {
      sortLabel: string;
      alphabeticalAsc: string;
      alphabeticalDesc: string;
      difficultyAsc: string;
      difficultyDesc: string;
      notesCountDesc: string;
    };
    noResultsTitle: string;
    noResultsDesc: string;
    clearFilters: string;
    notesBadge: string;
    favoriteTooltipAdd: string;
    favoriteTooltipRemove: string;
  };
  heroCard: {
    vsRenekton: string;
    laneOpponentDetected: string;
    watchGodrektonGuide: string;
    watchGodrektonGuideTooltip: string;
    watchReplay: string;
    watchReplayTooltip: string;
    defaultRole: string;
  };
  quickInfo: {
    runes: {
      title: string;
      badge: string;
    };
    spells: {
      title: string;
      badge: string;
    };
    items: {
      title: string;
      badge: string;
    };
    abilityMax: {
      title: string;
      badge: string;
    };
  };
  matchupTabs: {
    summary: string;
    detailedNotes: string;
    level1: string;
    deepLol: string;
    combos: string;
    video: string;
    myNotes: string;
    summaryHeader: string;
    difficultyRatingLabel: string;
    tipsCount: string;
    noTipsAvailable: string;
    videoGuideTitle: string;
    videoSourceGodrekton: string;
    videoSourceReplay: string;
    watchOnYoutube: string;
    notesCountLabel: string;
    addFirstNotePrompt: string;
  };
  combos: {
    title: string;
    subtitle: string;
    categories: {
      all: string;
      auto_cancel: string;
      fast_trade: string;
      safe_counters: string;
      item_actives: string;
      all_in: string;
    };
    furyRequired: string;
    stepsLabel: string;
    tacticalNote: string;
  };
  deeplol: {
    title: string;
    aiBadge: string;
    levelAdvantageTitle: string;
    levelAdvantageSubtitle: string;
    renektonAdvantage: string;
    enemyAdvantage: string;
    neutralAdvantage: string;
    sampleSizeLabel: string;
    renektonWinRateLabel: string;
    enemyWinRateLabel: string;
    noDataTitle: string;
    noDataDesc: string;
    levels: {
      lv1: { label: string; advantage: string; disadvantage: string };
      lv2: { label: string; advantage: string; disadvantage: string };
      lv3: { label: string; advantage: string; disadvantage: string };
      lv4: { label: string; advantage: string; disadvantage: string };
      lv5: { label: string; advantage: string; disadvantage: string };
      lv6: { label: string; advantage: string; disadvantage: string };
    };
  };
  champSelect: {
    title: string;
    subtitle: string;
    phaseBadge: string;
    candidatesTitle: string;
    lockInPrompt: string;
    toplaneProbability: string;
    recommendedRunesTitle: string;
    recommendedRunesDesc: string;
    primaryTree: string;
    secondaryTree: string;
    statShards: string;
    summonerSpellsTitle: string;
    startingItemsTitle: string;
    viewFullGuide: string;
    lockedOpponent: string;
  };
  inGameHUD: {
    title: string;
    liveTimer: string;
    tabs: {
      fastHud: string;
      fullGuide: string;
      videos: string;
    };
    laneSwap: {
      button: string;
      title: string;
      selectPrompt: string;
    };
    quickTipsTitle: string;
    levelSpikesTitle: string;
    cooldownsTitle: string;
    cooldownsDesc: string;
    baseStatsTitle: string;
  };
  notes: {
    title: string;
    addNoteBtn: string;
    newNoteBtn: string;
    editNoteTitle: string;
    addNoteTitle: string;
    modalSubtitle: string;
    resultLabel: string;
    results: {
      win: string;
      loss: string;
      remake: string;
    };
    feltDifficultyLabel: string;
    difficultyDescriptions: Record<number, string>;
    starsOutOfFive: string;
    difficultyStars: string;
    whatWorkedLabel: string;
    whatWorkedPlaceholder: string;
    whatFailedLabel: string;
    whatFailedPlaceholder: string;
    freeNotesLabel: string;
    freeNotesPlaceholder: string;
    metadataToggle: string;
    kdaLabel: string;
    kdaPlaceholder: string;
    runesLabel: string;
    runesPlaceholder: string;
    itemsLabel: string;
    itemsPlaceholder: string;
    summonersLabel: string;
    summonersPlaceholder: string;
    saveBtn: string;
    updateBtn: string;
    savingBtn: string;
    cancelBtn: string;
    deleteBtn: string;
    deleteConfirm: string;
    searchPlaceholder: string;
    filterLabel: string;
    filters: {
      all: string;
      win: string;
      loss: string;
      remake: string;
    };
    loadingHistory: string;
    noNotesFoundFiltered: string;
    noNotesTitle: string;
    noNotesDesc: string;
    winRateLabel: string;
    averageRatingLabel: string;
    totalMatchesLabel: string;
    noMatchesSummaryTitle: string;
    noMatchesSummaryDesc: string;
    registerMatchBtn: string;
    matchSingular: string;
    matchPlural: string;
    validationDifficulty: string;
    recentDate: string;
  };
  postGame: {
    badge: string;
    modalTitle: string;
    modalSubtitle: string;
    matchCompleted: string;
    autoExtractedNotice: string;
    savePrompt: string;
    saveSuccess: string;
    skipBtn: string;
    saveBtn: string;
    savingBtn: string;
    quickDifficulty: string;
    whatWorkedPlaceholder: string;
    whatFailedPlaceholder: string;
  };
  guidesModal: {
    title: string;
    subtitle: string;
    theoryModules: string;
    searchPlaceholder: string;
    categories: Record<string, string>;
    categoryDescriptions: Record<string, string>;
    combosSequencerTitle: string;
    combosSequencerBadge: string;
    combosSequencerDesc: string;
    noResultsFound: string;
    closeTooltip: string;
    languageSwitchLabel: string;
  };
  tierListModal: {
    title: string;
    subtitle: string;
    patchBadge: string;
    searchPlaceholder: string;
    tabs: {
      level1Skills: string;
      startingItems: string;
    };
    filterSkillLabel: string;
    filterItemLabel: string;
    allFilter: string;
    championsCountSuffix: string;
    clickChampionHint: string;
    noChampionsFound: string;
    closeTooltip: string;
    abilityTiers: {
      Q: { title: string; badge: string; description: string };
      W: { title: string; badge: string; description: string };
      E: { title: string; badge: string; description: string };
      E_ALCOVE: { title: string; badge: string; description: string };
      SITUATIONAL: { title: string; badge: string; description: string };
    };
    itemTiers: {
      shield_only: { title: string; badge: string; itemName: string; description: string };
      blade_or_shield: { title: string; badge: string; itemName: string; description: string };
      long_sword_rush: { title: string; badge: string; itemName: string; description: string };
    };
  };
}
