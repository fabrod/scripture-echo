/** Verse of the Day rotation — one reference per day of month. */
export interface VotdRef {
  book: string;
  bookName: string;
  chapter: number;
  verse: number;
}

export const VOTD: VotdRef[] = [
  { book: 'PSA', bookName: 'Psalms', chapter: 23, verse: 1 },
  { book: 'PRO', bookName: 'Proverbs', chapter: 3, verse: 5 },
  { book: 'ISA', bookName: 'Isaiah', chapter: 41, verse: 10 },
  { book: 'JER', bookName: 'Jeremiah', chapter: 29, verse: 11 },
  { book: 'PHP', bookName: 'Philippians', chapter: 4, verse: 13 },
  { book: 'ROM', bookName: 'Romans', chapter: 8, verse: 28 },
  { book: 'PSA', bookName: 'Psalms', chapter: 46, verse: 1 },
  { book: 'JOS', bookName: 'Joshua', chapter: 1, verse: 9 },
  { book: 'ISA', bookName: 'Isaiah', chapter: 40, verse: 31 },
  { book: 'MAT', bookName: 'Matthew', chapter: 11, verse: 28 },
  { book: 'JHN', bookName: 'John', chapter: 3, verse: 16 },
  { book: 'PSA', bookName: 'Psalms', chapter: 1, verse: 1 },
  { book: 'HEB', bookName: 'Hebrews', chapter: 11, verse: 1 },
  { book: 'PSA', bookName: 'Psalms', chapter: 19, verse: 14 },
  { book: 'MIC', bookName: 'Micah', chapter: 6, verse: 8 },
  { book: 'GAL', bookName: 'Galatians', chapter: 5, verse: 22 },
  { book: 'PSA', bookName: 'Psalms', chapter: 121, verse: 1 },
  { book: '2TI', bookName: '2 Timothy', chapter: 1, verse: 7 },
  { book: 'ISA', bookName: 'Isaiah', chapter: 53, verse: 5 },
  { book: 'JHN', bookName: 'John', chapter: 8, verse: 12 },
  { book: 'PSA', bookName: 'Psalms', chapter: 27, verse: 1 },
  { book: 'ROM', bookName: 'Romans', chapter: 12, verse: 2 },
  { book: 'EPH', bookName: 'Ephesians', chapter: 2, verse: 8 },
  { book: 'PSA', bookName: 'Psalms', chapter: 90, verse: 12 },
  { book: 'LAM', bookName: 'Lamentations', chapter: 3, verse: 22 },
  { book: 'MAT', bookName: 'Matthew', chapter: 5, verse: 14 },
  { book: '1PE', bookName: '1 Peter', chapter: 5, verse: 7 },
  { book: 'PSA', bookName: 'Psalms', chapter: 139, verse: 14 },
  { book: 'JAS', bookName: 'James', chapter: 1, verse: 5 },
  { book: 'REV', bookName: 'Revelation', chapter: 21, verse: 4 },
  { book: 'JHN', bookName: 'John', chapter: 1, verse: 1 },
];

export function verseOfTheDay(date = new Date()): VotdRef {
  return VOTD[(date.getDate() - 1) % VOTD.length];
}
