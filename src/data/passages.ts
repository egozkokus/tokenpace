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
    {
      id: 'he-moon',
      lang: 'he',
      title: 'הירח',
      text: 'הירח הוא הלוויין הטבעי היחיד של כדור הארץ, ומרוחק ממנו כ-384,000 ק"מ. אותו צד של הירח פונה תמיד אלינו, מכיוון שזמן הסיבוב שלו סביב צירו שווה בדיוק לזמן ההקפה שלו את כדור הארץ. כוח המשיכה של הירח אחראי לגאות ולשפל בים. האדם הראשון דרך עליו בשנת 1969.',
      questions: [
        { q: 'מה המרחק לירח?', options: ['38,000 ק"מ', '384,000 ק"מ', '3.8 מיליון ק"מ', '38 מיליון ק"מ'], correct: 1 },
        { q: 'למה רואים תמיד אותו צד של הירח?', options: ['הירח לא מסתובב', 'זמן הסיבוב שווה לזמן ההקפה', 'בגלל עננים', 'זו אשליה'], correct: 1 },
        { q: 'למה אחראי כוח המשיכה של הירח?', options: ['רוחות', 'גאות ושפל', 'עונות השנה', 'קשת בענן'], correct: 1 },
      ],
    },
    {
      id: 'he-honey',
      lang: 'he',
      title: 'הדבש',
      text: 'דבורת הדבש מייצרת דבש מצוף הפרחים. כדי לייצר כף דבש אחת בלבד, הדבורים צריכות לבקר באלפי פרחים. הדבש כמעט אינו מתקלקל — נמצא דבש בן אלפי שנים בתוך פירמידות, שעדיין היה ראוי לאכילה. הדבורים מתקשרות ביניהן באמצעות ריקוד שמראה לחברותיהן היכן נמצאים הפרחים.',
      questions: [
        { q: 'ממה מיוצר הדבש?', options: ['מים', 'צוף פרחים', 'אבקה', 'שעווה'], correct: 1 },
        { q: 'מה מיוחד בדבש?', options: ['קופא מהר', 'כמעט אינו מתקלקל', 'משנה צבע', 'מתאדה'], correct: 1 },
        { q: 'איך הדבורים מתקשרות?', options: ['בצליל', 'בריקוד', 'בריח', 'בצבע'], correct: 1 },
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
    {
      id: 'en-moon',
      lang: 'en',
      title: 'The Moon',
      text: "The Moon is Earth's only natural satellite, about 384,000 km away. The same side always faces us because it spins on its axis in exactly the time it takes to orbit Earth. The Moon's gravity is what causes the ocean tides. The first human walked on its surface in 1969.",
      questions: [
        { q: 'How far away is the Moon?', options: ['38,000 km', '384,000 km', '3.8 million km', '38 million km'], correct: 1 },
        { q: 'Why do we always see the same side?', options: ['It does not spin', 'Its spin equals its orbit', 'Because of clouds', "It's an illusion"], correct: 1 },
        { q: "What does the Moon's gravity cause?", options: ['Winds', 'Ocean tides', 'The seasons', 'Rainbows'], correct: 1 },
      ],
    },
    {
      id: 'en-honey',
      lang: 'en',
      title: 'Honey',
      text: 'Honey bees make honey from flower nectar. To make a single tablespoon of honey, bees must visit thousands of flowers. Honey almost never spoils — edible honey thousands of years old has been found inside pyramids. Bees tell each other where flowers are by dancing.',
      questions: [
        { q: 'What is honey made from?', options: ['Water', 'Flower nectar', 'Pollen', 'Wax'], correct: 1 },
        { q: 'What is special about honey?', options: ['It freezes fast', 'It almost never spoils', 'It changes color', 'It evaporates'], correct: 1 },
        { q: 'How do bees communicate?', options: ['By sound', 'By dancing', 'By smell', 'By color'], correct: 1 },
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

// Deterministic by day → everyone gets the same daily content.
export function dailyPassage(lang: Lang, n: number): Passage {
  const list = PASSAGES[lang]
  return list[(((n - 1) % list.length) + list.length) % list.length]
}

export function dailyTopic(lang: Lang, n: number): string {
  const list = TOPICS[lang]
  return list[(((n - 1) % list.length) + list.length) % list.length]
}
