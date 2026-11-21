export type Lang = 'ca' | 'es' | 'en';

const dict = {
  en: {
    brand: 'yonose',
    tagline: 'Honest next train while you wait.',
    skip: 'Skip to main content',
    navHome: 'Board',
    navFeedback: 'Give feedback',
    navFeedbackShort: 'Feedback',
    whyTitle: 'Why yonose',
    whyLead:
      'Board blank. App said on time. You waited anyway. yonose is for that Rodalies platform moment: next real train, honest delay, wait or leave.',
    why1: 'Station board empty, stuck, or optimistic.',
    why2: 'Phone map still draws a green train that will not come.',
    why3: 'Twenty minutes later you are still waiting, while a taxi would have been cheaper.',
    whyClose: 'Next real train. Honest delay. Wait or leave.',
    from: 'From',
    to: 'To',
    search: 'Type a station (e.g. Pineda)',
    show: 'Show next trains',
    swap: 'Swap stations',
    quickLabel: 'Try a Maresme trip',
    pickBoth: 'Pick origin and destination first.',
    loading: 'Loading…',
    empty: 'No more trains found for today on this pair.',
    error: 'Could not load trains. Try again.',
    next: 'Next',
    wait: 'in ~{{m}} min',
    leave: 'Consider leaving',
    taxi: 'Open maps for a ride',
    favorites: 'Favorites',
    saveFavorite: 'Save trip',
    share: 'Share with a friend',
    shareShort: 'Share',
    shareTitle: 'yonose',
    shareText:
      'yonose: honest next Rodalies train while you wait. Board blank? Check the real next departure.',
    shareTextTrip: 'yonose for {{from}} → {{to}}: next train truth while you wait on the platform.',
    shareCopied: 'Link copied. Paste it to a friend.',
    lang: 'Language',
    attribution: 'Data origin: Renfe Operadora (CC BY 4.0)',
    situationLive: 'Live board',
    footerGithub: 'GitHub repository',
    feedbackTitle: 'Give feedback',
    feedbackLead:
      'yonose is built for the wait on the platform: next train, honest delay, when to leave. Tell us what broke or what you need.',
    feedbackHow:
      'Feedback goes to public GitHub issues on the yonose repo. No account on this site. Use GitHub to open or follow an issue.',
    feedbackNewIssue: 'Open a new issue',
    feedbackBrowseIssues: 'Browse all issues',
    feedbackNote: 'Please do not paste passwords, private IPs, or personal data into issues.',
    feedbackBack: 'Back to the board',
  },
  es: {
    brand: 'yonose',
    tagline: 'El próximo tren de verdad mientras esperas.',
    skip: 'Saltar al contenido',
    navHome: 'Panel',
    navFeedback: 'Dar feedback',
    navFeedbackShort: 'Feedback',
    whyTitle: 'Por qué yonose',
    whyLead:
      'Panel en blanco. La app decía puntual. Tú seguías ahí. yonose es para ese andén de Rodalies: próximo tren real, retraso honesto, esperar o irse.',
    why1: 'Panel de estación vacío, colgado u optimista.',
    why2: 'El mapa del móvil sigue dibujando un tren verde que no llega.',
    why3: 'Veinte minutos después sigues esperando, y un taxi habría salido más barato.',
    whyClose: 'Próximo tren real. Retraso honesto. Esperar o irse.',
    from: 'Origen',
    to: 'Destino',
    search: 'Escribe una estación (ej. Pineda)',
    show: 'Ver próximos trenes',
    swap: 'Intercambiar estaciones',
    quickLabel: 'Prueba un viaje del Maresme',
    pickBoth: 'Elige origen y destino primero.',
    loading: 'Cargando…',
    empty: 'No hay más trenes hoy para este trayecto.',
    error: 'No se pudieron cargar los trenes. Reintenta.',
    next: 'Próximo',
    wait: 'en ~{{m}} min',
    leave: 'Valora irte',
    taxi: 'Abrir mapas para un taxi',
    favorites: 'Favoritos',
    saveFavorite: 'Guardar',
    share: 'Compartir con un amigo',
    shareShort: 'Compartir',
    shareTitle: 'yonose',
    shareText:
      'yonose: el próximo tren Rodalies de verdad mientras esperas. ¿Panel en blanco? Mira la salida real.',
    shareTextTrip: 'yonose para {{from}} → {{to}}: la verdad del próximo tren en el andén.',
    shareCopied: 'Enlace copiado. Pégaselo a un amigo.',
    lang: 'Idioma',
    attribution: 'Origen de los datos: Renfe Operadora (CC BY 4.0)',
    situationLive: 'Tiempo real',
    footerGithub: 'Repositorio en GitHub',
    feedbackTitle: 'Dar feedback',
    feedbackLead:
      'yonose es para la espera en el andén: próximo tren, retraso honesto, cuándo irse. Cuéntanos qué falla o qué necesitas.',
    feedbackHow:
      'El feedback va a issues públicas de GitHub en el repo yonose. No hay cuenta en este sitio. Usa GitHub para abrir o seguir una issue.',
    feedbackNewIssue: 'Abrir una issue nueva',
    feedbackBrowseIssues: 'Ver todas las issues',
    feedbackNote: 'No pegues contraseñas, IPs privadas ni datos personales en las issues.',
    feedbackBack: 'Volver al panel',
  },
  ca: {
    brand: 'yonose',
    tagline: 'El proper tren de veritat mentre esperes.',
    skip: 'Salta al contingut',
    navHome: 'Panell',
    navFeedback: 'Donar feedback',
    navFeedbackShort: 'Feedback',
    whyTitle: 'Per què yonose',
    whyLead:
      'Panell en blanc. L’app deia puntual. Tu continuaves allà. yonose és per a aquella andana de Rodalies: proper tren real, retard honest, esperar o marxar.',
    why1: 'Panell de l’estació buit, penjat o optimista.',
    why2: 'El mapa del mòbil encara dibuixa un tren verd que no arriba.',
    why3: 'Vint minuts després encara esperes, i un taxi hauria sortit més barat.',
    whyClose: 'Proper tren real. Retard honest. Esperar o marxar.',
    from: 'Origen',
    to: 'Destí',
    search: 'Escriu una estació (ex. Pineda)',
    show: 'Mostra propers trens',
    swap: 'Intercanvia estacions',
    quickLabel: 'Prova un viatge del Maresme',
    pickBoth: 'Tria origen i destí primer.',
    loading: 'Carregant…',
    empty: 'No hi ha més trens avui per aquest trajecte.',
    error: 'No s’han pogut carregar els trens. Torna-ho a provar.',
    next: 'Proper',
    wait: 'en ~{{m}} min',
    leave: 'Valora marxar',
    taxi: 'Obre mapes per un taxi',
    favorites: 'Preferits',
    saveFavorite: 'Desa',
    share: 'Comparteix amb un amic',
    shareShort: 'Comparteix',
    shareTitle: 'yonose',
    shareText:
      'yonose: el proper tren Rodalies de veritat mentre esperes. Panell en blanc? Mira la sortida real.',
    shareTextTrip: 'yonose per {{from}} → {{to}}: la veritat del proper tren a l’andana.',
    shareCopied: 'Enllaç copiat. Enganxa’l a un amic.',
    lang: 'Idioma',
    attribution: 'Origen de les dades: Renfe Operadora (CC BY 4.0)',
    situationLive: 'Temps real',
    footerGithub: 'Repositori a GitHub',
    feedbackTitle: 'Donar feedback',
    feedbackLead:
      'yonose és per l’espera a l’andana: proper tren, retard honest, quan marxar. Digues-nos què falla o què et cal.',
    feedbackHow:
      'El feedback va a issues públiques de GitHub al repo yonose. No hi ha compte en aquest lloc. Usa GitHub per obrir o seguir una issue.',
    feedbackNewIssue: 'Obrir una issue nova',
    feedbackBrowseIssues: 'Veure totes les issues',
    feedbackNote: 'No enganxis contrasenyes, IPs privades ni dades personals a les issues.',
    feedbackBack: 'Tornar al panell',
  },
} as const;

export type MsgKey = keyof (typeof dict)['en'];

export function detectLang(): Lang {
  const saved = localStorage.getItem('yonose.lang') as Lang | null;
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
