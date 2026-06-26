import type { Lang } from '../lib/i18n'

export interface Question {
  q: string
  options: string[]
  correct: number
}

export interface Passage {
  id: string
  lang: Lang
  title: string
  text: string
  // Static fallback questions, used when the AI endpoint is unavailable.
  questions: Question[]
}

export const PASSAGES: Record<Lang, Passage[]> = {
  he: [
    {
      id: 'he-octopus',
      lang: 'he',
      title: 'התמנון',
      text: 'התמנון הוא אחד היצורים המוזרים והחכמים ביותר באוקיינוס. יש לו שלושה לבבות, דם כחול, ושמונה זרועות שכל אחת מהן יכולה לפעול כמעט באופן עצמאי — כשני שלישים מהנוירונים של התמנון נמצאים בזרועות עצמן, ולא במוח המרכזי. תמנונים מסוגלים לשנות את צבע וטקסטורת העור שלהם בשבריר שנייה כדי להיטמע בסביבה או לתקשר. הם פותרים חידות, פותחים צנצנות, ואפילו זוכרים בני אדם מסוימים. החיסרון: רובם חיים שנה-שנתיים בלבד.',
      questions: [
        { q: 'כמה לבבות יש לתמנון?', options: ['אחד', 'שניים', 'שלושה', 'שמונה'], correct: 2 },
        { q: 'היכן נמצאים רוב הנוירונים של התמנון?', options: ['במוח המרכזי', 'בזרועות', 'בלב', 'בעיניים'], correct: 1 },
        { q: 'מה אורך החיים של רוב התמנונים?', options: ['שנה-שנתיים', 'עשר שנים', 'חמישים שנה', 'מאה שנה'], correct: 0 },
      ],
    },
    {
      id: 'he-coffee',
      lang: 'he',
      title: 'הקפה',
      text: 'לפי האגדה, רועה עיזים אתיופי בשם כלדי גילה את הקפה כשהבחין שהעיזים שלו קופצות במרץ אחרי שאכלו פירות אדומים מסוימים. הקפה התפשט מתימן אל העולם הערבי, ובתי הקפה הראשונים נפתחו במאה ה-15. הם נקראו "בתי ספר של חכמים" כי אנשים נהגו להתכנס בהם לשיחה ולמשחק. כיום הקפה הוא אחד המשקאות הנפוצים בעולם, ושני בלבד למים מבחינת צריכה יומית.',
      questions: [
        { q: 'מי גילה את הקפה לפי האגדה?', options: ['סוחר תימני', 'רועה עיזים', 'נזיר', 'מלך'], correct: 1 },
        { q: 'באיזו מאה נפתחו בתי הקפה הראשונים?', options: ['ה-12', 'ה-15', 'ה-18', 'ה-20'], correct: 1 },
        { q: 'איזה משקה נצרך יותר מקפה?', options: ['תה', 'מים', 'יין', 'חלב'], correct: 1 },
      ],
    },
  ],
  en: [
    {
      id: 'en-octopus',
      lang: 'en',
      title: 'The Octopus',
      text: 'The octopus is one of the strangest and smartest creatures in the ocean. It has three hearts, blue blood, and eight arms that can each act almost independently — about two-thirds of an octopus’s neurons live in the arms themselves rather than in the central brain. Octopuses can change the color and texture of their skin in a fraction of a second to blend into their surroundings or to communicate. They solve puzzles, open jars, and even remember specific humans. The catch: most live only one or two years.',
      questions: [
        { q: 'How many hearts does an octopus have?', options: ['One', 'Two', 'Three', 'Eight'], correct: 2 },
        { q: 'Where do most of an octopus’s neurons live?', options: ['Central brain', 'The arms', 'The heart', 'The eyes'], correct: 1 },
        { q: 'How long do most octopuses live?', options: ['One or two years', 'Ten years', 'Fifty years', 'A century'], correct: 0 },
      ],
    },
    {
      id: 'en-coffee',
      lang: 'en',
      title: 'Coffee',
      text: 'Legend says an Ethiopian goat herder named Kaldi discovered coffee after noticing his goats became unusually energetic after eating certain red berries. Coffee spread from Yemen into the Arab world, and the first coffee houses opened in the 15th century. They were nicknamed "schools of the wise" because people gathered there to talk and play games. Today coffee is one of the most popular drinks on Earth, second only to water in daily consumption.',
      questions: [
        { q: 'Who discovered coffee according to legend?', options: ['A Yemeni trader', 'A goat herder', 'A monk', 'A king'], correct: 1 },
        { q: 'When did the first coffee houses open?', options: ['12th century', '15th century', '18th century', '20th century'], correct: 1 },
        { q: 'Which drink is consumed more than coffee?', options: ['Tea', 'Water', 'Wine', 'Milk'], correct: 1 },
      ],
    },
  ],
}

export function randomPassage(lang: Lang): Passage {
  const list = PASSAGES[lang]
  return list[Math.floor(Math.random() * list.length)]
}

export const TOPICS: Record<Lang, string[]> = {
  he: ['החיה האהובה עליי', 'הסרט האחרון שראיתי', 'מה אכלתי היום', 'המקום שהכי בא לי לטייל בו', 'טכנולוגיה שמשנה את העולם', 'זיכרון ילדות'],
  en: ['My favorite animal', 'The last movie I saw', 'What I ate today', 'A place I dream of visiting', 'A technology changing the world', 'A childhood memory'],
}

export function randomTopic(lang: Lang): string {
  const list = TOPICS[lang]
  return list[Math.floor(Math.random() * list.length)]
}
