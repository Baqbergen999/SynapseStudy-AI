import type { Language, SubjectCategory } from '../types/study';

export interface Translations {
  brandSubtitle: string;
  academicWorkspace: string;
  subjects: Record<SubjectCategory, string>;
  auth: {
    badge: string;
    title: string;
    subtitle: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    nameLabel: string;
    namePlaceholder: string;
    defaultDisplayName: string;
    signInBtn: string;
    signingIn: string;
    securityNote: string;
    logoutBtn: string;
    welcomeToastTitle: string;
    welcomeToastSub: string;
    signedOutToastTitle: string;
    signedOutToastSub: string;
  };
  nav: {
    dashboard: string;
    audioStudio: string;
    projectPlanner: string;
  };
  topBar: {
    aiEngine: string;
    newLecture: string;
    geminiReady: string;
    keyMissing: string;
    logout: string;
  };
  dashboard: {
    greeting: string;
    heroSub: string;
    sessionsLabel: string;
    focusTimeLabel: string;
    uploadAudioBtn: string;
    createPlanBtn: string;
    kpiNotes: string;
    kpiTasks: string;
    kpiPomodoroMins: string;
    kpiQuizScore: string;
    completedSessionsSub: string;
    activeProjectSub: string;
    verifiedCheckpointsSub: string;
    noCheckpointsSub: string;
    recentNotesTitle: string;
    emptyNotesTitle: string;
    emptyNotesSub: string;
    openInStudio: string;
    openRoadmapBtn: string;
    activeProjectTitle: string;
    emptyProjectTitle: string;
    emptyProjectSub: string;
    todayScheduleTitle: string;
    emptyScheduleSub: string;
    subjectBreakdownTitle: string;
    notesCountLabel: string;
    projectsCountLabel: string;
    clearSessionBtn: string;
    pomodoroTitle: string;
    focusMode25: string;
    deepWork50: string;
    breakMode5: string;
    startTimer: string;
    pauseTimer: string;
    resetTimer: string;
    sessionsUnit: string;
    focusCompleteTitle: string;
    focusCompleteSub: string;
    sessionResetTitle: string;
    sessionResetSub: string;
  };
  audioStudio: {
    title: string;
    subtitle: string;
    uploadDropTitle: string;
    uploadDropSub: string;
    selectFileBtn: string;
    recordMicBtn: string;
    stopMicBtn: string;
    transcribeBtn: string;
    transcribingLabel: string;
    uploadAudioWarningTitle: string;
    uploadAudioWarningSub: string;
    transcriptTitle: string;
    lectureTitlePlaceholder: string;
    transcriptPlaceholder: string;
    depthLabel: string;
    depthConcise: string;
    depthDeep: string;
    depthExam: string;
    generateNotesBtn: string;
    generateTasksBtn: string;
    generatingTasksLabel: string;
    outputEmptyTitle: string;
    outputEmptySub: string;
    tabNotes: string;
    tabPractice: string;
    tabFlashcards: string;
    revealAnswer: string;
    hideAnswer: string;
    hintLabel: string;
    flipCardHint: string;
    markMastered: string;
    nextCard: string;
    prevCard: string;
    copyMarkdown: string;
    exportDoc: string;
    notesPromptHint: string;
    tasksPromptHint: string;
    cardLabel: string;
    masteredLabel: string;
    termLabel: string;
    definitionLabel: string;
    loadingSteps: string[];
    toasts: {
      unsupportedTitle: string;
      unsupportedSub: string;
      audioLoadedTitle: string;
      micUnavailableTitle: string;
      micUnavailableSub: string;
      micDeniedTitle: string;
      micDeniedSub: string;
      recordingReadyTitle: string;
      transcribeDoneTitle: string;
      notesReadyTitle: string;
      tasksReadyTitle: string;
      markdownCopiedTitle: string;
      markdownCopiedSub: string;
      docExportedTitle: string;
      docExportedSub: string;
    };
  };
  projectPlanner: {
    title: string;
    subtitle: string;
    formTitle: string;
    projectTitleLabel: string;
    projectTitlePlaceholder: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    subjectLabel: string;
    deadlineLabel: string;
    daysUnit: string;
    dailyHoursLabel: string;
    hoursUnit: string;
    timeWindowLabel: string;
    minutesPerDaySuffix: string;
    startTime: string;
    endTime: string;
    goalModeLabel: string;
    goalFinish: string;
    goalDeep: string;
    submitBtn: string;
    roadmapTitle: string;
    emptyRoadmapTitle: string;
    emptyRoadmapSub: string;
    completionLabel: string;
    checkpointBtn: string;
    checkpointPassed: string;
    dayPrefix: string;
    minutesUnit: string;
    keyConcepts: string;
    quizModalTitle: string;
    submitQuizBtn: string;
    closeBtn: string;
    deepLearningBadge: string;
    executionBadge: string;
    formValidationError: string;
    windowValidationError: string;
    planReadyTitle: string;
    loadingSteps: string[];
  };
  settings: {
    title: string;
    subtitle: string;
    engineStatusLabel: string;
    serverKeyAvailable: string;
    serverKeyMissing: string;
    outputLanguageLabel: string;
    defaultDepthLabel: string;
    closeBtn: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  kk: {
    brandSubtitle: 'Академиялық Интеллект',
    academicWorkspace: 'Академиялық кеңістік',
    subjects: {
      Programming: 'Бағдарламалау',
      Math: 'Математика',
      Physics: 'Физика',
      Chemistry: 'Химия',
      Biology: 'Биология',
      Medicine: 'Медицина және денсаулық',
      DataScience: 'Деректер ғылымы және ЖИ',
      Engineering: 'Инженерия',
      Economics: 'Экономика және қаржы',
      Business: 'Бизнес және менеджмент',
      Law: 'Құқықтану',
      History: 'Тарих',
      Humanities: 'Гуманитарлық ғылымдар',
      Languages: 'Шет тілдері',
      Psychology: 'Психология',
      Design: 'Дизайн және медиа',
    },
    auth: {
      badge: 'Студенттік ИИ Жұмыс Орталығы',
      title: 'SynapseStudy AI жүйесіне қош келдіңіз',
      subtitle:
        'Дәріс аудиоларын нақты конспектіге айналдырып, практикалық тапсырмалар мен жоба жоспарларыңызды жеке Google аккаунтыңызда сақтаңыз.',
      feature1Title: 'Аудиодан Конспект пен Тапсырма',
      feature1Desc: 'Дәрістерді мәтінге айналдырып, Gemini арқылы құрылымдалған конспект пен тест алыңыз.',
      feature2Title: 'Ақылды Time-Box Жоба Жоспары',
      feature2Desc: 'Күнделікті уақыт аралығына дәл сыятын қадамдық жоспар мен прогресс бақылауы.',
      feature3Title: 'Тұрақты Жеке Сақтау',
      feature3Desc: 'Барлық конспектілер, транскрипттер мен жоспарлар аккаунтыңызға автоматты сақталады.',
      nameLabel: 'Аты-жөніңіз (міндетті емес)',
      namePlaceholder: 'Мысалы: Айдана Нұрланова',
      defaultDisplayName: 'Студент (Google)',
      signInBtn: 'Google арқылы кіру (Sign in with Google)',
      signingIn: 'Google аккаунты тексерілуде...',
      securityNote: 'Деректеріңіз жеке сессияңызда қауіпсіз сақталады және бет жаңартылғанда өшпейді.',
      logoutBtn: 'Шығу',
      welcomeToastTitle: 'Сәтті кірдіңіз',
      welcomeToastSub: 'Оқу деректеріңіз сессияңызбен байланыстырылды.',
      signedOutToastTitle: 'Жүйеден шықтыңыз',
      signedOutToastSub: 'Қайта кіру үшін Google аккаунтын таңдаңыз.',
    },
    nav: {
      dashboard: 'Басқару орталығы',
      audioStudio: 'Аудио Конспект Студиясы',
      projectPlanner: 'Ақылды Жоба Жоспары',
    },
    topBar: {
      aiEngine: 'ИИ Баптаулары',
      newLecture: 'Дәріс жүктеу',
      geminiReady: 'Gemini AI Дайын',
      keyMissing: 'API кілті жоқ',
      logout: 'Шығу',
    },
    dashboard: {
      greeting: 'Сәлем! Оқу және жобалау орталығы дайын.',
      heroSub:
        'Аудио дәрістерді нақты транскрипт пен таза конспектке айналдырып, жобаларыңызды уақыт терезесінде орындаңыз.',
      sessionsLabel: 'Помодоро сессиялары',
      focusTimeLabel: 'Жинақталған фокус',
      uploadAudioBtn: 'Аудио жүктеу',
      createPlanBtn: 'Жоба жоспарын құру',
      kpiNotes: 'Жасалған конспектілер',
      kpiTasks: 'Орындалған тапсырмалар',
      kpiPomodoroMins: 'Фокус уақыты (мин)',
      kpiQuizScore: 'Тексеру балы',
      completedSessionsSub: 'аяқталған сессия',
      activeProjectSub: 'белсенді жоба',
      verifiedCheckpointsSub: 'Тексерілген нәтижелер',
      noCheckpointsSub: 'Әлі тексеру өтілмеді',
      recentNotesTitle: 'Соңғы ИИ конспектілері',
      emptyNotesTitle: 'Әлі деректер жоқ',
      emptyNotesSub:
        'Қолданыс тарихы бос. Аудио файл жүктеңіз немесе микрофоннан жазып, алғашқы конспектіңізді жасаңыз.',
      openInStudio: 'Студияда ашу',
      openRoadmapBtn: 'Жоспарды ашу',
      activeProjectTitle: 'Белсенді жоба жоспары',
      emptyProjectTitle: 'Әлі деректер жоқ',
      emptyProjectSub:
        'Қолданыс тарихы бос. Жоба жоспарлаушы бетінде мерзім мен күнделікті уақыт терезесін толтырыңыз.',
      todayScheduleTitle: 'Бүгінгі Time-Box кестесі',
      emptyScheduleSub: 'Қолданыс тарихы бос. Алдымен жоба жоспарын құрыңыз.',
      subjectBreakdownTitle: 'Пәндер бойынша нақты статистика',
      notesCountLabel: 'конспект',
      projectsCountLabel: 'жоба',
      clearSessionBtn: 'Барлық деректерді тазарту',
      pomodoroTitle: 'Помодоро Фокус Таймері',
      focusMode25: '25м Фокус',
      deepWork50: '50м Терең',
      breakMode5: '5м Үзіліс',
      startTimer: 'Бастау',
      pauseTimer: 'Кідірту',
      resetTimer: 'Қайтару',
      sessionsUnit: 'сессия',
      focusCompleteTitle: 'Фокус сессиясы аяқталды',
      focusCompleteSub: 'Уақыт статистикасы сақталды.',
      sessionResetTitle: 'Деректер тазартылды',
      sessionResetSub: 'Жергілікті сақталған оқу деректері өшірілді.',
    },
    audioStudio: {
      title: 'Аудио-Конспект Студиясы',
      subtitle:
        'Тек нақты аудио немесе мәтін: алдымен транскрипт алыңыз, содан кейін Gemini арқылы конспект пен практикалық тапсырмалар жасаңыз.',
      uploadDropTitle: 'Аудио файлды осында тастаңыз',
      uploadDropSub: '.mp3, .wav, .m4a, .ogg, .webm форматтары қолданылады',
      selectFileBtn: 'Файл таңдау',
      recordMicBtn: 'Микрофоннан жазу',
      stopMicBtn: 'Жазуды тоқтату',
      transcribeBtn: '🎙️ Аудионы мәтінге айналдыру',
      transcribingLabel: 'Аудио транскрипциялануда...',
      uploadAudioWarningTitle: 'Алдымен аудио жүктеңіз',
      uploadAudioWarningSub:
        'Транскрипцияны бастау үшін аудио файл таңдаңыз немесе микрофоннан дауыс жазыңыз.',
      transcriptTitle: 'Дәріс транскрипті (өңделетін өріс)',
      lectureTitlePlaceholder: 'Дәріс тақырыбы (міндетті емес)...',
      transcriptPlaceholder:
        'Әлі деректер жоқ. Аудио жүктеп «🎙️ Аудионы мәтінге айналдыру» батырмасын басыңыз немесе дәріс мәтінін осында енгізіңіз...',
      depthLabel: 'Талдау тереңдігі',
      depthConcise: 'Қысқа шпаргалка',
      depthDeep: 'Толық академиялық',
      depthExam: 'Емтихан режимі',
      generateNotesBtn: '✨ Конспект от ИИ',
      generateTasksBtn: '📝 Практикалық тапсырмалар генерациялау',
      generatingTasksLabel: 'Тапсырмалар жасалуда...',
      outputEmptyTitle: 'Қолданыс тарихы бос',
      outputEmptySub:
        'Транскрипт өрісіне мәтін түскеннен кейін «✨ Конспект от ИИ» немесе «📝 Практикалық тапсырмалар генерациялау» батырмасын басыңыз.',
      tabNotes: 'Таза Конспект',
      tabPractice: 'Практикалық Тапсырмалар мен Тест',
      tabFlashcards: 'Flashcards (Карточкалар)',
      revealAnswer: 'Жауабын көру',
      hideAnswer: 'Жауапты жасыру',
      hintLabel: 'Кеңес',
      flipCardHint: 'Анықтаманы көру үшін басыңыз',
      markMastered: 'Меңгердім',
      nextCard: 'Келесі',
      prevCard: 'Алдыңғы',
      copyMarkdown: 'Markdown көшіру',
      exportDoc: 'DOC экспорт',
      notesPromptHint: 'Құрылымдалған конспект алу үшін «✨ Конспект от ИИ» батырмасын басыңыз.',
      tasksPromptHint: 'Тапсырмалар алу үшін «📝 Практикалық тапсырмалар генерациялау» батырмасын басыңыз.',
      cardLabel: 'Карточка',
      masteredLabel: 'меңгерілді',
      termLabel: 'ТЕРМИН',
      definitionLabel: 'АНЫҚТАМА',
      loadingSteps: [
        'Транскрипт мәтіні талдануда...',
        'Артық сөздер мен кідірістер тазартылуда...',
        'Gemini арқылы құрылымдалған нәтиже дайындалуда...',
      ],
      toasts: {
        unsupportedTitle: 'Файл форматы қолданылмайды',
        unsupportedSub: '.mp3, .wav, .m4a, .ogg немесе .webm аудиосын таңдаңыз.',
        audioLoadedTitle: 'Аудио жүктелді',
        micUnavailableTitle: 'Микрофон қолжетімсіз',
        micUnavailableSub: 'Аудио файлды жүктеп көріңіз.',
        micDeniedTitle: 'Микрофон рұқсаты берілмеді',
        micDeniedSub: 'Браузер рұқсатын қосыңыз немесе аудио файл жүктеңіз.',
        recordingReadyTitle: 'Жазба дайын',
        transcribeDoneTitle: 'Транскрипция аяқталды',
        notesReadyTitle: 'ИИ конспектісі дайын',
        tasksReadyTitle: 'Практикалық тапсырмалар дайын',
        markdownCopiedTitle: 'Markdown көшірілді',
        markdownCopiedSub: 'Кез келген редакторға қоя аласыз.',
        docExportedTitle: 'DOC файлы жүктелді',
        docExportedSub: 'Оқу конспектісі сақталды.',
      },
    },
    projectPlanner: {
      title: 'Ақылды Жоба Жоспарлаушы (Time-Boxer)',
      subtitle: 'Мерзім мен нақты күнделікті уақыт терезесіне сай сағаттық орындау жоспары.',
      formTitle: 'Жоба параметрлері',
      projectTitleLabel: 'Жоба тақырыбы',
      projectTitlePlaceholder: 'Мысалы: Full-Stack Telegram Bot & Web Dashboard',
      descriptionLabel: 'Жоба сипаты мен талаптары',
      descriptionPlaceholder: 'Технологиялар, негізгі функциялар, API және қойылатын талаптар...',
      subjectLabel: 'Пән / Санат',
      deadlineLabel: 'Мерзімі (күн)',
      daysUnit: 'күн',
      dailyHoursLabel: 'Күнделікті бос уақыт',
      hoursUnit: 'сағ',
      timeWindowLabel: 'Нақты уақыт аралығы',
      minutesPerDaySuffix: 'мин/күн',
      startTime: 'Басталуы',
      endTime: 'Аяқталуы',
      goalModeLabel: 'Дайындық деңгейі',
      goalFinish: 'Тек жобаны бітіру',
      goalDeep: 'Жобаны бітіру + 100% меңгеру (Deep Learning)',
      submitBtn: '🚀 Ақылды жоспар құру',
      roadmapTitle: 'Күн-күндік уақыт кестесі',
      emptyRoadmapTitle: 'Әлі деректер жоқ',
      emptyRoadmapSub:
        'Қолданыс тарихы бос. Сол жақтағы форманы толтырып, «🚀 Ақылды жоспар құру» батырмасын басыңыз.',
      completionLabel: 'Жалпы орындалу деңгейі',
      checkpointBtn: 'Бүгінгі білімді тексеру',
      checkpointPassed: 'Күн толық меңгерілді',
      dayPrefix: 'Күн',
      minutesUnit: 'мин',
      keyConcepts: 'Меңгерілетін ұғымдар',
      quizModalTitle: 'Күндік дайындықты тексеру (Checkpoint)',
      submitQuizBtn: 'Тексеруді аяқтау',
      closeBtn: 'Жабу',
      deepLearningBadge: 'Терең меңгеру режимі',
      executionBadge: 'Орындау режимі',
      formValidationError: 'Жоба тақырыбы мен сипаттамасын толтырыңыз.',
      windowValidationError: 'Күнделікті уақыт аралығы кемінде 30 минут болуы тиіс.',
      planReadyTitle: 'Жоба жоспары дайын',
      loadingSteps: [
        'Жоба талаптары мен технологиялық стек талдануда...',
        'Тапсырмалар нақты уақыт терезесіне бөлінуде...',
        'Күндік тексеру сұрақтары дайындалуда...',
      ],
    },
    settings: {
      title: 'ИИ Қозғалтқыш Баптаулары',
      subtitle: 'Серверлік Gemini AI күйін және әдепкі оқу тілін баптаңыз.',
      engineStatusLabel: 'Серверлік API күйі',
      serverKeyAvailable: 'GEMINI_API_KEY серверде белсенді',
      serverKeyMissing: 'Серверде GEMINI_API_KEY бапталмаған (Settings > Secrets)',
      outputLanguageLabel: 'ИИ мазмұнының негізгі тілі',
      defaultDepthLabel: 'Әдепкі конспект тереңдігі',
      closeBtn: 'Сақтау және жабу',
    },
  },
  ru: {
    brandSubtitle: 'Академический Интеллект',
    academicWorkspace: 'Учебное пространство',
    subjects: {
      Programming: 'Программирование',
      Math: 'Математика',
      Physics: 'Физика',
      Chemistry: 'Химия',
      Biology: 'Биология',
      Medicine: 'Медицина и здоровье',
      DataScience: 'Data Science и ИИ',
      Engineering: 'Инженерия',
      Economics: 'Экономика и финансы',
      Business: 'Бизнес и менеджмент',
      Law: 'Юриспруденция и право',
      History: 'История',
      Humanities: 'Гуманитарные науки',
      Languages: 'Иностранные языки',
      Psychology: 'Психология',
      Design: 'Дизайн и медиа',
    },
    auth: {
      badge: 'Студенческое ИИ-пространство',
      title: 'Добро пожаловать в SynapseStudy AI',
      subtitle:
        'Преобразуйте аудиолекции в структурированные конспекты, задания и планы проектов с привязкой к вашему Google-аккаунту.',
      feature1Title: 'Конспекты и задания из аудио',
      feature1Desc: 'Расшифровывайте лекции и генерируйте конспекты с тестами на базе Gemini.',
      feature2Title: 'Умный Time-Box планировщик',
      feature2Desc: 'Пошаговый почасовой график строго внутри вашего ежедневного окна времени.',
      feature3Title: 'Надежное сохранение сессии',
      feature3Desc: 'Ваши заметки, транскрипты и проекты сохраняются и мгновенно загружаются при обновлении.',
      nameLabel: 'Ваше имя (необязательно)',
      namePlaceholder: 'Например: Айдана Нурланова',
      defaultDisplayName: 'Студент (Google)',
      signInBtn: 'Войти через Google (Sign in with Google)',
      signingIn: 'Выполняется вход через Google...',
      securityNote: 'Ваши учебные данные привязаны к вашей сессии и не теряются при перезагрузке.',
      logoutBtn: 'Выйти',
      welcomeToastTitle: 'Вход выполнен',
      welcomeToastSub: 'Ваше рабочее пространство готово.',
      signedOutToastTitle: 'Вы вышли из аккаунта',
      signedOutToastSub: 'Войдите через Google, чтобы продолжить.',
    },
    nav: {
      dashboard: 'Командный центр',
      audioStudio: 'Студия Аудио-Конспектов',
      projectPlanner: 'Умный Планировщик Проектов',
    },
    topBar: {
      aiEngine: 'Настройки ИИ',
      newLecture: 'Загрузить лекцию',
      geminiReady: 'Gemini AI Готов',
      keyMissing: 'Нет API ключа',
      logout: 'Выйти',
    },
    dashboard: {
      greeting: 'Добро пожаловать! Рабочее пространство готово.',
      heroSub:
        'Расшифровывайте реальное аудио в чистые конспекты и планируйте проекты в строгом временном окне.',
      sessionsLabel: 'Сессии Помодоро',
      focusTimeLabel: 'Накопленный фокус',
      uploadAudioBtn: 'Загрузить аудио',
      createPlanBtn: 'Создать план проекта',
      kpiNotes: 'Создано конспектов',
      kpiTasks: 'Выполнено задач',
      kpiPomodoroMins: 'Фокус-время (мин)',
      kpiQuizScore: 'Балл самопроверки',
      completedSessionsSub: 'завершённых сессий',
      activeProjectSub: 'активный проект',
      verifiedCheckpointsSub: 'Подтверждённые проверки',
      noCheckpointsSub: 'Проверки ещё не пройдены',
      recentNotesTitle: 'Созданные ИИ-конспекты',
      emptyNotesTitle: 'Данных пока нет',
      emptyNotesSub:
        'История использования пуста. Загрузите аудиозапись или запишите с микрофона, чтобы создать первый конспект.',
      openInStudio: 'Открыть в студии',
      openRoadmapBtn: 'Открыть план',
      activeProjectTitle: 'Активный план проекта',
      emptyProjectTitle: 'Данных пока нет',
      emptyProjectSub:
        'История использования пуста. Заполните форму планировщика для генерации графика.',
      todayScheduleTitle: 'Расписание Time-Box на сегодня',
      emptyScheduleSub: 'На сегодня задач нет. Создайте план проекта в планировщике.',
      subjectBreakdownTitle: 'Реальная статистика по предметам',
      notesCountLabel: 'консп.',
      projectsCountLabel: 'проект.',
      clearSessionBtn: 'Очистить все данные',
      pomodoroTitle: 'Помодоро Фокус-Таймер',
      focusMode25: '25м Фокус',
      deepWork50: '50м Глубокий',
      breakMode5: '5м Перерыв',
      startTimer: 'Старт',
      pauseTimer: 'Пауза',
      resetTimer: 'Сброс',
      sessionsUnit: 'сессий',
      focusCompleteTitle: 'Фокус-сессия завершена',
      focusCompleteSub: 'Время сохранено в статистике.',
      sessionResetTitle: 'Данные очищены',
      sessionResetSub: 'Локальная история обучения удалена.',
    },
    audioStudio: {
      title: 'Студия Аудио-Конспектов',
      subtitle:
        'Преобразуйте аудио в текст, затем сгенерируйте ИИ-конспект и практические задания через Gemini.',
      uploadDropTitle: 'Перетащите аудиофайл сюда',
      uploadDropSub: 'Поддерживаются .mp3, .wav, .m4a, .ogg, .webm',
      selectFileBtn: 'Выбрать файл',
      recordMicBtn: 'Запись с микрофона',
      stopMicBtn: 'Остановить запись',
      transcribeBtn: '🎙️ Преобразовать аудио в текст',
      transcribingLabel: 'Расшифровка аудио...',
      uploadAudioWarningTitle: 'Сначала загрузите аудио',
      uploadAudioWarningSub:
        'Выберите аудиофайл или запишите голос с микрофона перед расшифровкой.',
      transcriptTitle: 'Транскрипт лекции (редактируемое поле)',
      lectureTitlePlaceholder: 'Название лекции (необязательно)...',
      transcriptPlaceholder:
        'Данных пока нет. Загрузите аудио и нажмите «🎙️ Преобразовать аудио в текст» или введите текст лекции сюда...',
      depthLabel: 'Глубина анализа',
      depthConcise: 'Краткая шпаргалка',
      depthDeep: 'Глубокий академический',
      depthExam: 'Режим экзамена',
      generateNotesBtn: '✨ Конспект от ИИ',
      generateTasksBtn: '📝 Сгенерировать практические задания',
      generatingTasksLabel: 'Генерация заданий...',
      outputEmptyTitle: 'История использования пуста',
      outputEmptySub:
        'После появления текста в поле транскрипта нажмите «✨ Конспект от ИИ» или «📝 Сгенерировать практические задания».',
      tabNotes: 'Чистый Конспект',
      tabPractice: 'Практические Задания и Тест',
      tabFlashcards: 'Flashcards (Карточки)',
      revealAnswer: 'Показать ответ',
      hideAnswer: 'Скрыть ответ',
      hintLabel: 'Подсказка',
      flipCardHint: 'Нажмите, чтобы перевернуть карточку',
      markMastered: 'Усвоено',
      nextCard: 'Следующая',
      prevCard: 'Предыдущая',
      copyMarkdown: 'Копировать Markdown',
      exportDoc: 'Экспорт DOC',
      notesPromptHint: 'Нажмите «✨ Конспект от ИИ», чтобы сформировать структурированный конспект.',
      tasksPromptHint: 'Нажмите «📝 Сгенерировать практические задания» для создания упражнений.',
      cardLabel: 'Карточка',
      masteredLabel: 'усвоено',
      termLabel: 'ТЕРМИН',
      definitionLabel: 'ОПРЕДЕЛЕНИЕ',
      loadingSteps: [
        'Анализируется текст транскрипта...',
        'Удаляются слова-паразиты и повторы...',
        'Генерируются структурированные материалы через Gemini...',
      ],
      toasts: {
        unsupportedTitle: 'Формат не поддерживается',
        unsupportedSub: 'Выберите .mp3, .wav, .m4a, .ogg или .webm.',
        audioLoadedTitle: 'Аудио загружено',
        micUnavailableTitle: 'Микрофон недоступен',
        micUnavailableSub: 'Загрузите готовый аудиофайл.',
        micDeniedTitle: 'Доступ к микрофону отклонён',
        micDeniedSub: 'Разрешите доступ или загрузите аудиофайл.',
        recordingReadyTitle: 'Запись готова',
        transcribeDoneTitle: 'Транскрипция завершена',
        notesReadyTitle: 'ИИ-конспект готов',
        tasksReadyTitle: 'Практические задания готовы',
        markdownCopiedTitle: 'Markdown скопирован',
        markdownCopiedSub: 'Готово к вставке.',
        docExportedTitle: 'DOC файл сохранён',
        docExportedSub: 'Конспект успешно экспортирован.',
      },
    },
    projectPlanner: {
      title: 'Умный Планировщик Проектов (Time-Boxer)',
      subtitle: 'Пошаговый график по дням и часам строго внутри вашего доступного окна времени.',
      formTitle: 'Параметры проекта',
      projectTitleLabel: 'Название проекта',
      projectTitlePlaceholder: 'Например: Full-Stack Telegram Bot & Web Dashboard',
      descriptionLabel: 'Описание и требования проекта',
      descriptionPlaceholder: 'Стек технологий, ключевые модули, API и критерии сдачи...',
      subjectLabel: 'Предмет / Категория',
      deadlineLabel: 'Срок (дней)',
      daysUnit: 'дн.',
      dailyHoursLabel: 'Свободное время в день',
      hoursUnit: 'ч',
      timeWindowLabel: 'Точное временное окно',
      minutesPerDaySuffix: 'мин/день',
      startTime: 'Начало',
      endTime: 'Конец',
      goalModeLabel: 'Режим подготовки',
      goalFinish: 'Только завершить проект',
      goalDeep: 'Завершить проект + 100% освоение темы (Deep Learning)',
      submitBtn: '🚀 Создать умный план',
      roadmapTitle: 'Почасовой график выполнения',
      emptyRoadmapTitle: 'Данных пока нет',
      emptyRoadmapSub:
        'История использования пуста. Заполните форму слева и нажмите «🚀 Создать умный план».',
      completionLabel: 'Общий прогресс выполнения',
      checkpointBtn: 'Проверить знания за день',
      checkpointPassed: 'День полностью освоен',
      dayPrefix: 'День',
      minutesUnit: 'мин',
      keyConcepts: 'Ключевые концепции',
      quizModalTitle: 'Проверка готовности за день (Checkpoint)',
      submitQuizBtn: 'Завершить проверку',
      closeBtn: 'Закрыть',
      deepLearningBadge: 'Глубокое изучение',
      executionBadge: 'Режим выполнения',
      formValidationError: 'Укажите название проекта и его описание.',
      windowValidationError: 'Ежедневное окно времени должно быть не менее 30 минут.',
      planReadyTitle: 'План проекта готов',
      loadingSteps: [
        'Анализируются требования и стек проекта...',
        'Задачи распределяются в выбранное временное окно...',
        'Создаются контрольные вопросы для самопроверки...',
      ],
    },
    settings: {
      title: 'Настройки ИИ-Движка',
      subtitle: 'Состояние серверного Gemini API и язык учебных материалов по умолчанию.',
      engineStatusLabel: 'Статус серверного API',
      serverKeyAvailable: 'GEMINI_API_KEY активен на сервере',
      serverKeyMissing: 'GEMINI_API_KEY не задан в Settings > Secrets',
      outputLanguageLabel: 'Основной язык ИИ-контента',
      defaultDepthLabel: 'Глубина конспекта по умолчанию',
      closeBtn: 'Сохранить и закрыть',
    },
  },
  en: {
    brandSubtitle: 'Academic Intelligence',
    academicWorkspace: 'Academic Workspace',
    subjects: {
      Programming: 'Programming',
      Math: 'Mathematics',
      Physics: 'Physics',
      Chemistry: 'Chemistry',
      Biology: 'Biology',
      Medicine: 'Medicine & Health',
      DataScience: 'Data Science & AI',
      Engineering: 'Engineering',
      Economics: 'Economics & Finance',
      Business: 'Business & Management',
      Law: 'Law & Legal Studies',
      History: 'History',
      Humanities: 'Humanities',
      Languages: 'Foreign Languages',
      Psychology: 'Psychology',
      Design: 'Design & Media',
    },
    auth: {
      badge: 'AI Student Productivity Suite',
      title: 'Welcome to SynapseStudy AI',
      subtitle:
        'Transform lecture audio into structured study notes, practical exercises, and time-boxed project plans synced to your Google session.',
      feature1Title: 'Audio-to-Notes & Practical Tasks',
      feature1Desc: 'Transcribe audio lectures and generate structured notes and self-tests with Gemini.',
      feature2Title: 'Smart Project Time-Boxer',
      feature2Desc: 'Day-by-day execution roadmaps fitted strictly into your daily available hours.',
      feature3Title: 'Persistent Personal Workspace',
      feature3Desc: 'Your transcripts, notes, and project progress automatically persist across reloads.',
      nameLabel: 'Your Name (optional)',
      namePlaceholder: 'e.g., Aidana Nurlanova',
      defaultDisplayName: 'Google Student',
      signInBtn: 'Sign in with Google',
      signingIn: 'Signing in with Google...',
      securityNote: 'Your study data stays linked to your session and reloads automatically.',
      logoutBtn: 'Sign Out',
      welcomeToastTitle: 'Signed in successfully',
      welcomeToastSub: 'Your academic workspace is ready.',
      signedOutToastTitle: 'Signed out',
      signedOutToastSub: 'Sign in with Google to access your workspace.',
    },
    nav: {
      dashboard: 'Dashboard',
      audioStudio: 'Audio Studio',
      projectPlanner: 'Project Planner',
    },
    topBar: {
      aiEngine: 'AI Settings',
      newLecture: 'Upload Lecture',
      geminiReady: 'Gemini AI Ready',
      keyMissing: 'Key Missing',
      logout: 'Sign Out',
    },
    dashboard: {
      greeting: 'Command Center ready. Start with a real study action.',
      heroSub:
        'Transcribe real lecture audio into structured notes and execute projects inside strict daily time-boxes.',
      sessionsLabel: 'Pomodoro Sessions',
      focusTimeLabel: 'Focus Time Logged',
      uploadAudioBtn: 'Upload Audio',
      createPlanBtn: 'Create Project Plan',
      kpiNotes: 'Generated Notes',
      kpiTasks: 'Completed Tasks',
      kpiPomodoroMins: 'Focus Time (min)',
      kpiQuizScore: 'Checkpoint Avg Score',
      completedSessionsSub: 'completed sessions',
      activeProjectSub: 'active project',
      verifiedCheckpointsSub: 'Verified checkpoints',
      noCheckpointsSub: 'No checkpoints completed',
      recentNotesTitle: 'Your AI Study Notes',
      emptyNotesTitle: 'No data yet',
      emptyNotesSub:
        'Usage history is empty. Upload an audio file or record from your microphone to generate your first notes.',
      openInStudio: 'Open in Studio',
      openRoadmapBtn: 'Open Roadmap',
      activeProjectTitle: 'Active Project Roadmap',
      emptyProjectTitle: 'No data yet',
      emptyProjectSub:
        'Usage history is empty. Define your project scope and time window in the Project Planner.',
      todayScheduleTitle: "Today's Time-Blocked Schedule",
      emptyScheduleSub: 'No scheduled blocks yet. Generate a project plan to populate today.',
      subjectBreakdownTitle: 'Real Subject Activity',
      notesCountLabel: 'notes',
      projectsCountLabel: 'projects',
      clearSessionBtn: 'Clear All Local Data',
      pomodoroTitle: 'Pomodoro Focus Timer',
      focusMode25: '25m Focus',
      deepWork50: '50m Deep',
      breakMode5: '5m Break',
      startTimer: 'Start',
      pauseTimer: 'Pause',
      resetTimer: 'Reset',
      sessionsUnit: 'sessions',
      focusCompleteTitle: 'Focus Session Complete',
      focusCompleteSub: 'Session time recorded.',
      sessionResetTitle: 'Session Reset',
      sessionResetSub: 'All local study data has been cleared.',
    },
    audioStudio: {
      title: 'Audio-to-Smart Notes Studio',
      subtitle:
        'Upload or record audio, transcribe to text, then generate AI notes and practical exercises via Gemini.',
      uploadDropTitle: 'Drop lecture audio file here',
      uploadDropSub: 'Supports .mp3, .wav, .m4a, .ogg, .webm',
      selectFileBtn: 'Browse Audio',
      recordMicBtn: 'Record from Mic',
      stopMicBtn: 'Stop Recording',
      transcribeBtn: '🎙️ Transcribe Audio to Text',
      transcribingLabel: 'Transcribing audio...',
      uploadAudioWarningTitle: 'Please upload audio first',
      uploadAudioWarningSub: 'Select an audio file or record via microphone before transcribing.',
      transcriptTitle: 'Raw Lecture Transcript (Editable)',
      lectureTitlePlaceholder: 'Lecture title (optional)...',
      transcriptPlaceholder:
        'No data yet. Upload audio and click "🎙️ Transcribe Audio to Text" or type lecture text here...',
      depthLabel: 'Summary Depth',
      depthConcise: 'Concise Cheat-Sheet',
      depthDeep: 'Deep Academic Notes',
      depthExam: 'Exam Prep Mode',
      generateNotesBtn: '✨ Generate AI Notes',
      generateTasksBtn: '📝 Generate Practical Tasks',
      generatingTasksLabel: 'Generating tasks...',
      outputEmptyTitle: 'Usage history is empty',
      outputEmptySub:
        'Once text appears in the transcript box, click "✨ Generate AI Notes" or "📝 Generate Practical Tasks".',
      tabNotes: 'Clean Structured Notes',
      tabPractice: 'Practical Tasks & Self-Test',
      tabFlashcards: '3D Flashcards',
      revealAnswer: 'Reveal Answer & Explanation',
      hideAnswer: 'Hide Answer',
      hintLabel: 'Hint',
      flipCardHint: 'Click card to flip for definition',
      markMastered: 'Mark Mastered',
      nextCard: 'Next Card',
      prevCard: 'Previous',
      copyMarkdown: 'Copy Markdown',
      exportDoc: 'Export DOC',
      notesPromptHint: 'Click "✨ Generate AI Notes" to produce structured study notes.',
      tasksPromptHint: 'Click "📝 Generate Practical Tasks" to generate exercises.',
      cardLabel: 'Card',
      masteredLabel: 'mastered',
      termLabel: 'TERM',
      definitionLabel: 'DEFINITION',
      loadingSteps: [
        'Analyzing transcript text...',
        'Stripping filler words and conversational noise...',
        'Synthesizing structured output with Gemini...',
      ],
      toasts: {
        unsupportedTitle: 'Unsupported file',
        unsupportedSub: 'Please select .mp3, .wav, .m4a, .ogg, or .webm audio.',
        audioLoadedTitle: 'Audio loaded',
        micUnavailableTitle: 'Microphone unavailable',
        micUnavailableSub: 'Upload an audio file instead.',
        micDeniedTitle: 'Microphone access denied',
        micDeniedSub: 'Allow microphone permissions or upload an audio file.',
        recordingReadyTitle: 'Recording ready',
        transcribeDoneTitle: 'Transcription complete',
        notesReadyTitle: 'AI Notes Ready',
        tasksReadyTitle: 'Practical Tasks Ready',
        markdownCopiedTitle: 'Markdown copied',
        markdownCopiedSub: 'Ready to paste.',
        docExportedTitle: 'Exported .doc',
        docExportedSub: 'Study sheet downloaded.',
      },
    },
    projectPlanner: {
      title: 'Smart Project Time-Boxer & Planner',
      subtitle: 'Constraint-based day-by-day execution tightly fitted into your exact daily window.',
      formTitle: 'Project Constraints',
      projectTitleLabel: 'Project Title',
      projectTitlePlaceholder: 'e.g., Full-Stack Telegram Bot & Web Dashboard',
      descriptionLabel: 'Detailed Description & Goals',
      descriptionPlaceholder: 'Tech stack, core features, deliverables, and learning goals...',
      subjectLabel: 'Subject / Category',
      deadlineLabel: 'Deadline (Days)',
      daysUnit: 'days',
      dailyHoursLabel: 'Daily Available Hours',
      hoursUnit: 'hrs',
      timeWindowLabel: 'Daily Time Window',
      minutesPerDaySuffix: 'min/day',
      startTime: 'Start',
      endTime: 'End',
      goalModeLabel: 'Goal Mode',
      goalFinish: 'Finish Project Only',
      goalDeep: 'Finish + 100% Concept Mastery (Deep Learning)',
      submitBtn: '🚀 Generate Smart Plan',
      roadmapTitle: 'Time-Blocked Execution Roadmap',
      emptyRoadmapTitle: 'No data yet',
      emptyRoadmapSub:
        'Usage history is empty. Fill out the form on the left and click "🚀 Generate Smart Plan".',
      completionLabel: 'Overall Completion',
      checkpointBtn: 'Daily Readiness Quiz',
      checkpointPassed: 'Day Mastered',
      dayPrefix: 'Day',
      minutesUnit: 'min',
      keyConcepts: 'Key Concepts',
      quizModalTitle: 'Daily Readiness Checkpoint',
      submitQuizBtn: 'Complete Checkpoint',
      closeBtn: 'Close',
      deepLearningBadge: 'Deep Learning Mode',
      executionBadge: 'Execution Mode',
      formValidationError: 'Please provide both a project title and detailed description.',
      windowValidationError: 'Daily time window must be at least 30 minutes.',
      planReadyTitle: 'Execution Roadmap Ready',
      loadingSteps: [
        'Parsing project architecture and dependencies...',
        'Fitting tasks strictly inside your daily time window...',
        'Generating daily readiness verification checkpoints...',
      ],
    },
    settings: {
      title: 'AI Engine Configuration',
      subtitle: 'Inspect server-side Gemini API availability and configure default output language.',
      engineStatusLabel: 'Server API Key Status',
      serverKeyAvailable: 'GEMINI_API_KEY active on server',
      serverKeyMissing: 'GEMINI_API_KEY not configured in Settings > Secrets',
      outputLanguageLabel: 'Default AI Output Language',
      defaultDepthLabel: 'Default Notes Depth',
      closeBtn: 'Save & Close',
    },
  },
};
