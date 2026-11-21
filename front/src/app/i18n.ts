export type Lang = 'ca' | 'es' | 'en';

const dict = {
  en: {
    brand: 'itren',
    tagline: 'Honest next train while you wait.',
    skip: 'Skip to main content',
    navHome: 'Board',
    navFeedback: 'Give feedback',
    navFeedbackShort: 'Feedback',
    navFaq: 'FAQ',
    whyTitle: 'Why itren',
    whyLead:
      'Board blank. App said on time. You waited anyway. itren is for that Rodalies platform moment: next real train, honest delay, wait or leave.',
    why1: 'Station board empty, stuck, or optimistic.',
    why2: 'Phone map still draws a green train that will not come.',
    why3: 'Twenty minutes later you are still waiting, while a taxi would have been cheaper.',
    whyClose: 'Next real train. Honest delay. Wait or leave.',
    from: 'From',
    to: 'To',
    search: 'Type a station (e.g. Pineda)',
    show: 'Show next trains',
    swap: 'Swap stations',
    quickLabel: 'Try an example trip',
    pickBoth: 'Pick origin and destination first.',
    loading: 'Loading…',
    empty:
      'No direct train today for this pair. itren does not calculate changes of train. Empty means no through service, not that travel is impossible.',
    emptyFaq: 'Why no changes of train? See FAQ',
    error: 'Could not load trains. Try again.',
    next: 'Next',
    wait: 'in ~{{m}} min',
    leave: 'Consider leaving',
    taxi: 'Open maps for a ride',
    favorites: 'Favorites',
    saveFavorite: 'Save trip',
    share: 'Share with a friend',
    shareShort: 'Share',
    shareTitle: 'itren',
    shareText:
      'itren: honest next Rodalies train while you wait. Board blank? Check the real next departure.',
    shareTextTrip: 'itren for {{from}} → {{to}}: next train truth while you wait on the platform.',
    shareCopied: 'Link copied. Paste it to a friend.',
    lang: 'Language',
    attribution: 'Data: Renfe Operadora (CC BY 4.0). Official GTFS schedule + live updates when available.',
    dataCoverage:
      'Coverage: every station in Renfe’s public Cercanías / Rodalies GTFS (whole feed, not only Maresme). Direct trains only. No invented connections.',
    dataFaqLink: 'Data source & FAQ',
    situationLive: 'Live board',
    footerGithub: 'GitHub repository',
    faqTitle: 'FAQ',
    faqLead: 'Short answers. No marketing.',
    faqDataQ: 'Where does the data come from?',
    faqDataA:
      'From Renfe Operadora’s public feeds: GTFS timetable, GTFS realtime trip updates, and service alerts. Licence CC BY 4.0. We do not invent delays or green trains.',
    faqCoverQ: 'What does it cover?',
    faqCoverA:
      'Stations and trips from that full Cercanías / Rodalies GTFS package. Not a private Maresme-only map. If a station is in Renfe’s feed, you can search it here.',
    faqChangeQ: 'What about trips that need a change of train?',
    faqChangeA:
      'Not calculated yet. We only show direct trains on the same service. El Masnou → Terrassa is a typical empty case: you usually change (often via Barcelona). An empty board means no through train today, not that travel is impossible. A thin one-change hint may come later; a full journey planner will not.',
    faqLiveQ: 'Live delay or timetable?',
    faqLiveA:
      'When the live feed matches a train, we show that delay and how fresh the feed is. When it does not, we say timetable only. Empty truth beats a pretty lie.',
    faqPrivacyQ: 'Do I need an account?',
    faqPrivacyA:
      'No. Last trip and favorites stay in your browser. “I’m here” uses location once to set origin and is not tied to a server login.',
    faqPulseQ: 'What do you track?',
    faqPulseA:
      'Very little. Soft pulse only: a random id in your browser (localStorage), hashed on the server. We count unique browsers today, returning ones (same id seen on an earlier day), API requests today, and optional like/dislike. Trip feedback buttons are soft counts too. We do not use accounts, emails, ads, analytics suites, or IP-based visitor identity. Test/headless browsers are skipped. Location for “I’m here” is not stored as a visit profile.',
    faqKpiQ: 'What numbers matter?',
    faqKpiA:
      'Keep it small: (1) visitors today, (2) returning visitors, (3) likes vs not really, (4) whether the board stayed honest (live vs timetable). Not a vanity dashboard. If returning grows and likes hold, the platform tool is useful.',
    faqInstallQ: 'Can I download it as an app?',
    faqInstallA:
      'Not from the App Store or Play Store. It is a website you can install on your phone: open itren in the browser → browser menu → Add to Home Screen (or Install app). You get an icon, faster open, no account. Works best on Android Chrome; on iPhone use Safari → Share → Add to Home Screen.',
    installBtn: 'Install app',
    installHint: 'Add itren to your home screen. No store, no account.',
    faqVsQ: 'Is this like Transporta’m?',
    faqVsA:
      'No. Transporta’m is the map app: where trains are, platforms, many modes. itren is smaller: origin → destination, next real train, honest when live data is missing, and when to stop waiting (taxi). Same Renfe feeds possible. Different job. We do not try to be another map.',
    faqLegalQ: 'Is this official? Any disclaimer?',
    faqLegalA:
      'Unofficial. Not Renfe, not Rodalies, not a company product. Private project by Ralf Roeber. Times and delays come from Renfe’s public feeds (CC BY 4.0); the station board and reality can still disagree. Use your eyes on the platform. You decide when to wait or leave. No warranty for missed trains or bad days.',
    disclaimer:
      'Unofficial. Not Renfe / Rodalies. Public Renfe data (CC BY 4.0). Trust the platform board with your eyes. You decide wait or leave.',
    faqBack: 'Back to the board',
    feedbackTitle: 'Give feedback',
    feedbackLead:
      'itren is built for the wait on the platform: next train, honest delay, when to leave. Tell us what broke or what you need.',
    feedbackHow:
      'Bug reports go to public GitHub issues. No account on this site. Use GitHub to open or follow an issue.',
    feedbackNewIssue: 'Open a new issue',
    feedbackBrowseIssues: 'Browse all issues',
    feedbackNote: 'Please do not paste passwords, private IPs, or personal data into issues.',
    feedbackBack: 'Back to the board',
    aboutTitle: 'Who runs this',
    aboutLeadBefore: 'Private project by ',
    aboutLeadAfter:
      '. Born from real Rodalies waits (blank boards, green maps that lie). Hosted for our own needs. Free. Not a company product.',
    aboutBest:
      'I do my best to keep this useful for people waiting on the platform. If something breaks or is missing, ',
    aboutFeedbackCta: 'leave a question',
    aboutStar: 'If it helps you, star the repo on GitHub.',
    aboutShare: 'Share it with someone who waits on the same platforms.',
    starGithub: 'Star on GitHub',
    likeAsk: 'Do you like itren?',
    likeYes: 'Like',
    likeNo: 'Not really',
    likeThanks: 'Thanks for the vote.',
    likeStats: '{{likes}} like it · {{dislikes}} do not',
    usageTitle: 'Usage (anonymous)',
    usageLine:
      'Today: {{visitors}} browsers ({{returning}} returning) · {{requests}} API requests',
    pulseNote: 'Anonymous browser id in localStorage only. No accounts. Details in FAQ.',
    pulseFaqLink: 'What we track',
    liveBannerLive: 'Live delays matched for at least one train.',
    liveBannerLiveAge: 'Live data updated {{age}} ago. Delays matched for at least one train.',
    liveBannerTimetable:
      'Timetable only right now. Live delay not confirmed for these trains. Empty truth beats a pretty lie.',
    liveBannerTimetableAge:
      'Timetable only. Last live update {{age}} ago. Delay not confirmed for these trains.',
    liveBannerUnknown: 'Live feed status unclear. Treat times as schedule.',
    hereBtn: 'I’m here',
    hereBusy: 'Finding station…',
    hereFail: 'No station nearby. Type the name.',
    hereDenied: 'Location blocked. Type the station or use last trip.',
    hereHint: 'Uses location once for origin. Not sent to a server account.',
    alertsTitle: 'Related alerts',
    tapHint: 'Tap a train for details',
    detailTitle: 'Train details',
    detailClose: 'Close',
    detailSource: 'Delay source: {{source}}',
    detailSourceLive: 'live',
    detailSourceTimetable: 'timetable only',
    detailSourceUnknown: 'unknown',
    detailCancelled: 'Marked cancelled in the live feed.',
    reportAsk: 'How was it for you?',
    reportOnTime: 'On time',
    reportLate: 'Late',
    reportNoShow: 'Did not show',
    reportBoard: 'Board blank / wrong',
    reportThanks: 'Logged. Soft count only, never overwrites Renfe.',
    reportAgg: '{{n}} people said this',
    cancelled: 'Cancelled',
  },
  es: {
    brand: 'itren',
    tagline: 'El próximo tren de verdad mientras esperas.',
    skip: 'Saltar al contenido',
    navHome: 'Panel',
    navFeedback: 'Dar feedback',
    navFeedbackShort: 'Feedback',
    navFaq: 'FAQ',
    whyTitle: 'Por qué itren',
    whyLead:
      'Panel en blanco. La app decía puntual. Tú seguías ahí. itren es para ese andén de Rodalies: próximo tren real, retraso honesto, esperar o irse.',
    why1: 'Panel de estación vacío, colgado u optimista.',
    why2: 'El mapa del móvil sigue dibujando un tren verde que no llega.',
    why3: 'Veinte minutos después sigues esperando, y un taxi habría salido más barato.',
    whyClose: 'Próximo tren real. Retraso honesto. Esperar o irse.',
    from: 'Origen',
    to: 'Destino',
    search: 'Escribe una estación (ej. Pineda)',
    show: 'Ver próximos trenes',
    swap: 'Intercambiar estaciones',
    quickLabel: 'Prueba un viaje de ejemplo',
    pickBoth: 'Elige origen y destino primero.',
    loading: 'Cargando…',
    empty:
      'No hay tren directo hoy para este trayecto. itren no calcula transbordos. Lista vacía = no hay servicio directo, no que viajar sea imposible.',
    emptyFaq: '¿Por qué no hay transbordos? Ver FAQ',
    error: 'No se pudieron cargar los trenes. Reintenta.',
    next: 'Próximo',
    wait: 'en ~{{m}} min',
    leave: 'Valora irte',
    taxi: 'Abrir mapas para un taxi',
    favorites: 'Favoritos',
    saveFavorite: 'Guardar',
    share: 'Compartir con un amigo',
    shareShort: 'Compartir',
    shareTitle: 'itren',
    shareText:
      'itren: el próximo tren Rodalies de verdad mientras esperas. ¿Panel en blanco? Mira la salida real.',
    shareTextTrip: 'itren para {{from}} → {{to}}: la verdad del próximo tren en el andén.',
    shareCopied: 'Enlace copiado. Pégaselo a un amigo.',
    lang: 'Idioma',
    attribution: 'Datos: Renfe Operadora (CC BY 4.0). Horario GTFS oficial + actualizaciones en vivo cuando hay.',
    dataCoverage:
      'Cobertura: todas las estaciones del GTFS público de Renfe Cercanías / Rodalies (todo el feed, no solo el Maresme). Solo trenes directos. Sin conexiones inventadas.',
    dataFaqLink: 'Origen de los datos y FAQ',
    situationLive: 'Tiempo real',
    footerGithub: 'Repositorio en GitHub',
    faqTitle: 'FAQ',
    faqLead: 'Respuestas cortas. Sin marketing.',
    faqDataQ: '¿De dónde salen los datos?',
    faqDataA:
      'De los feeds públicos de Renfe Operadora: horario GTFS, actualizaciones GTFS en tiempo real y avisos. Licencia CC BY 4.0. No inventamos retrasos ni trenes verdes.',
    faqCoverQ: '¿Qué cubre?',
    faqCoverA:
      'Estaciones y viajes de ese paquete GTFS completo de Cercanías / Rodalies. No es un mapa privado solo del Maresme. Si la estación está en el feed de Renfe, puedes buscarla aquí.',
    faqChangeQ: '¿Y si hay que hacer transbordo?',
    faqChangeA:
      'Aún no lo calculamos. Solo mostramos trenes directos del mismo servicio. El Masnou → Terrassa suele salir vacío: normalmente cambias (a menudo vía Barcelona). Panel vacío = no hay tren directo hoy, no que el viaje sea imposible. Más adelante puede haber una pista fina de un cambio; un planificador completo de viajes, no.',
    faqLiveQ: '¿Retraso en vivo o solo horario?',
    faqLiveA:
      'Cuando el feed en vivo coincide con un tren, mostramos ese retraso y qué tan fresco está el feed. Si no coincide, decimos solo horario. La verdad vacía gana a una mentira bonita.',
    faqPrivacyQ: '¿Hace falta una cuenta?',
    faqPrivacyA:
      'No. El último viaje y los favoritos se quedan en tu navegador. “Estoy aquí” usa la ubicación una vez para el origen y no va ligada a un login en el servidor.',
    faqPulseQ: '¿Qué medís?',
    faqPulseA:
      'Muy poco. Solo pulso suave: un id aleatorio en tu navegador (localStorage), hasheado en el servidor. Contamos navegadores únicos hoy, recurrentes (mismo id visto otro día), peticiones API hoy, y like / no mucho opcionales. Los botones de feedback del tren son conteos suaves. Sin cuentas, emails, anuncios, suites de analítica, ni identidad de visitante por IP. Los navegadores de test/headless no cuentan. La ubicación de “Estoy aquí” no se guarda como perfil de visita.',
    faqKpiQ: '¿Qué números importan?',
    faqKpiA:
      'Pocos: (1) visitantes hoy, (2) recurrentes, (3) likes vs no mucho, (4) que el panel siga siendo honesto (vivo vs horario). No es un dashboard de vanidad. Si crecen los recurrentes y aguantan los likes, la herramienta del andén sirve.',
    faqInstallQ: '¿Se puede descargar como app?',
    faqInstallA:
      'No en App Store ni Play Store. Es una web que puedes instalar en el móvil: abre itren en el navegador → menú → Añadir a pantalla de inicio (o Instalar app). Queda un icono, abre más rápido, sin cuenta. En Android Chrome va bien; en iPhone usa Safari → Compartir → Añadir a pantalla de inicio.',
    installBtn: 'Instalar app',
    installHint: 'Añade itren a la pantalla de inicio. Sin tienda, sin cuenta.',
    faqVsQ: '¿Es como Transporta’m?',
    faqVsA:
      'No. Transporta’m es la app del mapa: dónde están los trenes, andén, muchos modos. itren es más pequeño: origen → destino, próximo tren real, claro cuando falta el vivo, y cuándo dejar de esperar (taxi). Pueden usar los mismos feeds de Renfe. Trabajo distinto. No intentamos ser otro mapa.',
    faqLegalQ: '¿Es oficial? ¿Hay aviso legal?',
    faqLegalA:
      'No oficial. No es Renfe, ni Rodalies, ni un producto de empresa. Proyecto privado de Ralf Roeber. Horarios y retrasos vienen de los feeds públicos de Renfe (CC BY 4.0); el panel de la estación y la realidad pueden no coincidir. Mira el andén con tus ojos. Tú decides esperar o irte. Sin garantía por trenes perdidos o malos días.',
    disclaimer:
      'No oficial. No es Renfe / Rodalies. Datos públicos de Renfe (CC BY 4.0). Confía también en el panel del andén. Tú decides esperar o irte.',
    faqBack: 'Volver al panel',
    feedbackTitle: 'Dar feedback',
    feedbackLead:
      'itren es para la espera en el andén: próximo tren, retraso honesto, cuándo irse. Cuéntanos qué falla o qué necesitas.',
    feedbackHow:
      'Los bugs van a preguntas públicas en GitHub. No hay cuenta en este sitio. Usa GitHub para abrir o seguir una pregunta.',
    feedbackNewIssue: 'Abrir una nueva pregunta',
    feedbackBrowseIssues: 'Ver todas las preguntas',
    feedbackNote: 'No pegues contraseñas, IPs privadas ni datos personales en las preguntas.',
    feedbackBack: 'Volver al panel',
    aboutTitle: 'Quién lo ofrece',
    aboutLeadBefore: 'Proyecto privado de ',
    aboutLeadAfter:
      '. Nació de esperas reales en Rodalies (paneles en blanco, mapas verdes que mienten). Lo hospedo para nuestras necesidades. Gratis. No es un producto de empresa.',
    aboutBest:
      'Hago lo posible para que esto sirva de verdad a quien espera en el andén. Si algo falla o falta, ',
    aboutFeedbackCta: 'deja una pregunta',
    aboutStar: 'Si te sirve, deja una estrella en GitHub.',
    aboutShare: 'Compártelo con alguien que espera en los mismos andenes.',
    starGithub: 'Estrella en GitHub',
    likeAsk: '¿Te gusta itren?',
    likeYes: 'Me gusta',
    likeNo: 'No mucho',
    likeThanks: 'Gracias por el voto.',
    likeStats: '{{likes}} les gusta · {{dislikes}} no',
    usageTitle: 'Uso (anónimo)',
    usageLine:
      'Hoy: {{visitors}} navegadores ({{returning}} recurrentes) · {{requests}} peticiones API',
    pulseNote: 'Solo id anónimo en localStorage. Sin cuentas. Detalle en el FAQ.',
    pulseFaqLink: 'Qué medimos',
    liveBannerLive: 'Retrasos en vivo coinciden con al menos un tren.',
    liveBannerLiveAge: 'Datos en vivo actualizados hace {{age}}. Retrasos coinciden con al menos un tren.',
    liveBannerTimetable:
      'Solo horario ahora. Retraso en vivo no confirmado para estos trenes. La verdad vacía gana a una mentira bonita.',
    liveBannerTimetableAge:
      'Solo horario. Última actualización en vivo hace {{age}}. Retraso no confirmado para estos trenes.',
    liveBannerUnknown: 'Estado del feed en vivo poco claro. Trata los tiempos como horario.',
    hereBtn: 'Estoy aquí',
    hereBusy: 'Buscando estación…',
    hereFail: 'Ninguna estación cerca. Escribe el nombre.',
    hereDenied: 'Ubicación bloqueada. Escribe la estación o usa el último viaje.',
    hereHint: 'Usa la ubicación una vez para el origen. No va a una cuenta en el servidor.',
    alertsTitle: 'Avisos relacionados',
    tapHint: 'Toca un tren para detalles',
    detailTitle: 'Detalle del tren',
    detailClose: 'Cerrar',
    detailSource: 'Fuente del retraso: {{source}}',
    detailSourceLive: 'en vivo',
    detailSourceTimetable: 'solo horario',
    detailSourceUnknown: 'desconocido',
    detailCancelled: 'Marcado cancelado en el feed en vivo.',
    reportAsk: '¿Cómo te fue?',
    reportOnTime: 'Puntual',
    reportLate: 'Tarde',
    reportNoShow: 'No apareció',
    reportBoard: 'Panel en blanco / mal',
    reportThanks: 'Anotado. Solo conteo suave, nunca sustituye a Renfe.',
    reportAgg: '{{n}} personas dijeron esto',
    cancelled: 'Cancelado',
  },
  ca: {
    brand: 'itren',
    tagline: 'El proper tren de veritat mentre esperes.',
    skip: 'Salta al contingut',
    navHome: 'Panell',
    navFeedback: 'Donar feedback',
    navFeedbackShort: 'Feedback',
    navFaq: 'FAQ',
    whyTitle: 'Per què itren',
    whyLead:
      'Panell en blanc. L’app deia puntual. Tu continuaves allà. itren és per a aquella andana de Rodalies: proper tren real, retard honest, esperar o marxar.',
    why1: 'Panell de l’estació buit, penjat o optimista.',
    why2: 'El mapa del mòbil encara dibuixa un tren verd que no arriba.',
    why3: 'Vint minuts després encara esperes, i un taxi hauria sortit més barat.',
    whyClose: 'Proper tren real. Retard honest. Esperar o marxar.',
    from: 'Origen',
    to: 'Destí',
    search: 'Escriu una estació (ex. Pineda)',
    show: 'Mostra propers trens',
    swap: 'Intercanvia estacions',
    quickLabel: 'Prova un viatge d’exemple',
    pickBoth: 'Tria origen i destí primer.',
    loading: 'Carregant…',
    empty:
      'No hi ha tren directe avui per aquest trajecte. itren no calcula transbordaments. Llista buida = no hi ha servei directe, no que viatjar sigui impossible.',
    emptyFaq: 'Per què no hi ha transbordaments? Veure FAQ',
    error: 'No s’han pogut carregar els trens. Torna-ho a provar.',
    next: 'Proper',
    wait: 'en ~{{m}} min',
    leave: 'Valora marxar',
    taxi: 'Obre mapes per un taxi',
    favorites: 'Preferits',
    saveFavorite: 'Desa',
    share: 'Comparteix amb un amic',
    shareShort: 'Comparteix',
    shareTitle: 'itren',
    shareText:
      'itren: el proper tren Rodalies de veritat mentre esperes. Panell en blanc? Mira la sortida real.',
    shareTextTrip: 'itren per {{from}} → {{to}}: la veritat del proper tren a l’andana.',
    shareCopied: 'Enllaç copiat. Enganxa’l a un amic.',
    lang: 'Idioma',
    attribution: 'Dades: Renfe Operadora (CC BY 4.0). Horari GTFS oficial + actualitzacions en viu quan n’hi ha.',
    dataCoverage:
      'Cobertura: totes les estacions del GTFS públic de Renfe Cercanías / Rodalies (tot el feed, no només el Maresme). Només trens directes. Sense connexions inventades.',
    dataFaqLink: 'Origen de les dades i FAQ',
    situationLive: 'Temps real',
    footerGithub: 'Repositori a GitHub',
    faqTitle: 'FAQ',
    faqLead: 'Respostes curtes. Sense màrqueting.',
    faqDataQ: 'D’on surten les dades?',
    faqDataA:
      'Dels feeds públics de Renfe Operadora: horari GTFS, actualitzacions GTFS en temps real i avisos. Llicència CC BY 4.0. No inventem retards ni trens verds.',
    faqCoverQ: 'Què cobreix?',
    faqCoverA:
      'Estacions i viatges d’aquell paquet GTFS complet de Cercanías / Rodalies. No és un mapa privat només del Maresme. Si l’estació és al feed de Renfe, la pots cercar aquí.',
    faqChangeQ: 'I si cal fer transbordament?',
    faqChangeA:
      'Encara no ho calculem. Només mostrem trens directes del mateix servei. El Masnou → Terrassa sol sortir buit: normalment canvies (sovint via Barcelona). Panell buit = no hi ha tren directe avui, no que el viatge sigui impossible. Més endavant pot haver-hi una pista fina d’un canvi; un planificador complet de viatges, no.',
    faqLiveQ: 'Retard en viu o només horari?',
    faqLiveA:
      'Quan el feed en viu coincideix amb un tren, mostrem aquell retard i com de fresc està el feed. Si no coincideix, diem només horari. La veritat buida guanya a una mentida maca.',
    faqPrivacyQ: 'Cal un compte?',
    faqPrivacyA:
      'No. El darrer viatge i els preferits es queden al navegador. “Sóc aquí” usa la ubicació un cop per a l’origen i no va lligada a un login al servidor.',
    faqPulseQ: 'Què mesureu?',
    faqPulseA:
      'Molt poc. Només puls suau: un id aleatori al navegador (localStorage), hashejat al servidor. Contem navegadors únics avui, recurrents (mateix id vist un altre dia), peticions API avui, i like / no gaire opcionals. Els botons de feedback del tren són recomptes suaus. Sense comptes, emails, anuncis, suites d’analítica, ni identitat de visitant per IP. Els navegadors de test/headless no conten. La ubicació de “Sóc aquí” no es guarda com a perfil de visita.',
    faqKpiQ: 'Quins números importen?',
    faqKpiA:
      'Pocs: (1) visitants avui, (2) recurrents, (3) likes vs no gaire, (4) que el panell segueixi sent honest (viu vs horari). No és un dashboard de vanitat. Si creixen els recurrents i aguanten els likes, l’eina de l’andana serveix.',
    faqInstallQ: 'Es pot descarregar com a app?',
    faqInstallA:
      'No a l’App Store ni al Play Store. És una web que pots instal·lar al mòbil: obre itren al navegador → menú → Afegeix a la pantalla d’inici (o Instal·la l’app). Queda una icona, obre més ràpid, sense compte. A Android Chrome va bé; a l’iPhone usa Safari → Comparteix → Afegeix a la pantalla d’inici.',
    installBtn: 'Instal·lar app',
    installHint: 'Afegeix itren a la pantalla d’inici. Sense botiga, sense compte.',
    faqVsQ: 'És com Transporta’m?',
    faqVsA:
      'No. Transporta’m és l’app del mapa: on són els trens, andana, molts modes. itren és més petit: origen → destí, proper tren real, clar quan falta el viu, i quan deixar d’esperar (taxi). Poden usar els mateixos feeds de Renfe. Feina diferent. No intentem ser un altre mapa.',
    faqLegalQ: 'És oficial? Hi ha avís legal?',
    faqLegalA:
      'No oficial. No és Renfe, ni Rodalies, ni un producte d’empresa. Projecte privat de Ralf Roeber. Horaris i retards venen dels feeds públics de Renfe (CC BY 4.0); el panell de l’estació i la realitat poden no coincidir. Mira l’andana amb els teus ulls. Tu decides esperar o marxar. Sense garantia per trens perduts o mals dies.',
    disclaimer:
      'No oficial. No és Renfe / Rodalies. Dades públiques de Renfe (CC BY 4.0). Confia també en el panell de l’andana. Tu decides esperar o marxar.',
    faqBack: 'Tornar al panell',
    feedbackTitle: 'Donar feedback',
    feedbackLead:
      'itren és per l’espera a l’andana: proper tren, retard honest, quan marxar. Digues-nos què falla o què et cal.',
    feedbackHow:
      'Els bugs van a preguntes públiques a GitHub. No hi ha compte en aquest lloc. Usa GitHub per obrir o seguir una pregunta.',
    feedbackNewIssue: 'Obrir una pregunta nova',
    feedbackBrowseIssues: 'Veure totes les preguntes',
    feedbackNote: 'No enganxis contrasenyes, IPs privades ni dades personals a les preguntes.',
    feedbackBack: 'Tornar al panell',
    aboutTitle: 'Qui ho ofereix',
    aboutLeadBefore: 'Projecte privat de ',
    aboutLeadAfter:
      '. Va néixer d’esperes reals a Rodalies (panells en blanc, mapes verds que menteixen). L’allotjo per a les nostres necessitats. Gratis. No és un producte d’empresa.',
    aboutBest:
      'Faig el possible perquè això serveixi de veritat a qui espera a l’andana. Si alguna cosa falla o falta, ',
    aboutFeedbackCta: 'deixa una pregunta',
    aboutStar: 'Si et serveix, deixa una estrella a GitHub.',
    aboutShare: 'Comparteix-ho amb algú que espera a les mateixes andanes.',
    starGithub: 'Estrella a GitHub',
    likeAsk: 'T’agrada itren?',
    likeYes: 'M’agrada',
    likeNo: 'No gaire',
    likeThanks: 'Gràcies pel vot.',
    likeStats: '{{likes}} els agrada · {{dislikes}} no',
    usageTitle: 'Ús (anònim)',
    usageLine:
      'Avui: {{visitors}} navegadors ({{returning}} recurrents) · {{requests}} peticions API',
    pulseNote: 'Només id anònim a localStorage. Sense comptes. Detall al FAQ.',
    pulseFaqLink: 'Què mesurem',
    liveBannerLive: 'Retards en viu coincideixen amb almenys un tren.',
    liveBannerLiveAge: 'Dades en viu actualitzades fa {{age}}. Retards coincideixen amb almenys un tren.',
    liveBannerTimetable:
      'Només horari ara. Retard en viu no confirmat per aquests trens. La veritat buida guanya a una mentida maca.',
    liveBannerTimetableAge:
      'Només horari. Darrera actualització en viu fa {{age}}. Retard no confirmat per aquests trens.',
    liveBannerUnknown: 'Estat del feed en viu poc clar. Tracta els temps com a horari.',
    hereBtn: 'Sóc aquí',
    hereBusy: 'Buscant estació…',
    hereFail: 'Cap estació a prop. Escriu el nom.',
    hereDenied: 'Ubicació bloquejada. Escriu l’estació o usa el darrer viatge.',
    hereHint: 'Usa la ubicació un cop per a l’origen. No va a un compte al servidor.',
    alertsTitle: 'Avisos relacionats',
    tapHint: 'Toca un tren per detalls',
    detailTitle: 'Detall del tren',
    detailClose: 'Tanca',
    detailSource: 'Font del retard: {{source}}',
    detailSourceLive: 'en viu',
    detailSourceTimetable: 'només horari',
    detailSourceUnknown: 'desconegut',
    detailCancelled: 'Marcat cancel·lat al feed en viu.',
    reportAsk: 'Com t’ha anat?',
    reportOnTime: 'Puntual',
    reportLate: 'Tard',
    reportNoShow: 'No ha aparegut',
    reportBoard: 'Panell en blanc / malament',
    reportThanks: 'Anotat. Només recompte suau, mai substitueix Renfe.',
    reportAgg: '{{n}} persones ho han dit',
    cancelled: 'Cancel·lat',
  },
} as const;

export type MsgKey = keyof (typeof dict)['en'];

export function detectLang(): Lang {
  const saved =
    (localStorage.getItem('itren.lang') as Lang | null) ||
    (localStorage.getItem('yonose.lang') as Lang | null);
  if (saved === 'ca' || saved === 'es' || saved === 'en') return saved;
  const nav = (navigator.language || 'en').toLowerCase();
  if (nav.startsWith('ca')) return 'ca';
  if (nav.startsWith('es')) return 'es';
  return 'en';
}

export function t(lang: Lang, key: MsgKey, vars?: Record<string, string | number>): string {
  let s: string = dict[lang][key] || dict.en[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(`{{${k}}}`, String(v));
    }
  }
  return s;
}
