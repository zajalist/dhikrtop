export type TajweedRule =
  | 'qalqalah'
  | 'madd'
  | 'idgham'
  | 'ikhfa'
  | 'iqlab'
  | 'ghunna'
  | 'shaddah'
  | null;

export interface TajweedSegment {
  text: string;
  rule: TajweedRule;
}

export interface QuranVerse {
  number: number;
  arabic: string;
  transliteration: string;
  translation: string;
  tajweed: TajweedSegment[];
}

export interface Surah {
  number: number;
  name: string;
  arabicName: string;
  englishMeaning: string;
  totalVerses: number;
  revelationType: 'Meccan' | 'Medinan';
  verses: QuranVerse[];
}

export const tajweedColors: Record<NonNullable<TajweedRule>, string> = {
  qalqalah: '#ef4444',   // red - bouncing vibration on ق ط ب ج د
  madd:     '#3b82f6',   // blue - elongation
  idgham:   '#22c55e',   // green - merging
  ikhfa:    '#f59e0b',   // amber - concealing
  iqlab:    '#a855f7',   // purple - conversion
  ghunna:   '#f97316',   // orange - nasalization
  shaddah:  '#ec4899',   // pink - doubled consonant
};

export const tajweedNames: Record<NonNullable<TajweedRule>, string> = {
  qalqalah: 'Qalqalah',
  madd:     'Madd',
  idgham:   'Idgham',
  ikhfa:    'Ikhfāʾ',
  iqlab:    'Iqlab',
  ghunna:   'Ghunna',
  shaddah:  'Shaddah',
};

export const tajweedDescriptions: Record<NonNullable<TajweedRule>, string> = {
  qalqalah: 'Echoing/bouncing sound on letters: ق ط ب ج د',
  madd:     'Elongation of vowel sound (2-6 counts)',
  idgham:   'Merging of noon sakin into following letter',
  ikhfa:    'Hidden/concealed sound with nasalization',
  iqlab:    'Conversion of noon sakin to meem sound',
  ghunna:   'Nasal sound held for 2 counts',
  shaddah:  'Doubled consonant — emphasis on letter',
};

export const surahs: Surah[] = [
  {
    number: 1,
    name: 'Al-Fatiha',
    arabicName: 'الْفَاتِحَة',
    englishMeaning: 'The Opening',
    totalVerses: 7,
    revelationType: 'Meccan',
    verses: [
      {
        number: 1,
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        transliteration: 'Bismillāhi r-raḥmāni r-raḥīm',
        translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
        tajweed: [
          { text: 'بِسْمِ اللَّهِ ', rule: null },
          { text: 'الرَّحْمَٰنِ ', rule: 'shaddah' },
          { text: 'الرَّحِيمِ', rule: 'madd' },
        ],
      },
      {
        number: 2,
        arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        transliteration: 'Alḥamdu lillāhi rabbi l-ʿālamīn',
        translation: 'All praise is due to Allah, Lord of the worlds.',
        tajweed: [
          { text: 'الْحَمْدُ ', rule: null },
          { text: 'لِلَّهِ ', rule: 'shaddah' },
          { text: 'رَبِّ ', rule: 'shaddah' },
          { text: 'الْعَالَمِينَ', rule: 'madd' },
        ],
      },
      {
        number: 3,
        arabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
        transliteration: 'Ar-raḥmāni r-raḥīm',
        translation: 'The Entirely Merciful, the Especially Merciful.',
        tajweed: [
          { text: 'الرَّحْمَٰنِ ', rule: 'shaddah' },
          { text: 'الرَّحِيمِ', rule: 'madd' },
        ],
      },
      {
        number: 4,
        arabic: 'مَالِكِ يَوْمِ الدِّينِ',
        transliteration: 'Māliki yawmi d-dīn',
        translation: 'Sovereign of the Day of Recompense.',
        tajweed: [
          { text: 'مَالِكِ ', rule: 'madd' },
          { text: 'يَوْمِ ', rule: null },
          { text: 'الدِّينِ', rule: 'madd' },
        ],
      },
      {
        number: 5,
        arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
        transliteration: 'Iyyāka naʿbudu wa-iyyāka nastaʿīn',
        translation: 'It is You we worship and You we ask for help.',
        tajweed: [
          { text: 'إِيَّاكَ ', rule: 'shaddah' },
          { text: 'نَعْبُدُ ', rule: null },
          { text: 'وَإِيَّاكَ ', rule: 'shaddah' },
          { text: 'نَسْتَعِينُ', rule: 'madd' },
        ],
      },
      {
        number: 6,
        arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
        transliteration: 'Ihdinā ṣ-ṣirāṭa l-mustaqīm',
        translation: 'Guide us to the straight path',
        tajweed: [
          { text: 'اهْدِنَا ', rule: 'madd' },
          { text: 'الصِّرَاطَ ', rule: 'shaddah' },
          { text: 'الْمُسْتَقِيمَ', rule: 'madd' },
        ],
      },
      {
        number: 7,
        arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
        transliteration: 'Ṣirāṭa lladhīna anʿamta ʿalayhim ghayri l-maghḍūbi ʿalayhim wa-lā ḍ-ḍāllīn',
        translation: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.',
        tajweed: [
          { text: 'صِرَاطَ ', rule: 'madd' },
          { text: 'الَّذِينَ ', rule: 'shaddah' },
          { text: 'أَنْعَمْتَ ', rule: null },
          { text: 'عَلَيْهِمْ ', rule: null },
          { text: 'غَيْرِ ', rule: null },
          { text: 'الْمَغْضُوبِ ', rule: 'madd' },
          { text: 'عَلَيْهِمْ ', rule: null },
          { text: 'وَلَا ', rule: 'madd' },
          { text: 'الضَّالِّينَ', rule: 'shaddah' },
        ],
      },
    ],
  },
  {
    number: 112,
    name: 'Al-Ikhlas',
    arabicName: 'الإخلاص',
    englishMeaning: 'The Sincerity',
    totalVerses: 4,
    revelationType: 'Meccan',
    verses: [
      {
        number: 1,
        arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
        transliteration: 'Qul huwa llāhu aḥad',
        translation: 'Say, "He is Allah, [who is] One,"',
        tajweed: [
          { text: 'قُلْ ', rule: 'qalqalah' },
          { text: 'هُوَ ', rule: null },
          { text: 'اللَّهُ ', rule: 'shaddah' },
          { text: 'أَحَدٌ', rule: null },
        ],
      },
      {
        number: 2,
        arabic: 'اللَّهُ الصَّمَدُ',
        transliteration: 'Allāhu ṣ-ṣamad',
        translation: 'Allah, the Eternal Refuge.',
        tajweed: [
          { text: 'اللَّهُ ', rule: 'shaddah' },
          { text: 'الصَّمَدُ', rule: 'shaddah' },
        ],
      },
      {
        number: 3,
        arabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
        transliteration: 'Lam yalid wa-lam yūlad',
        translation: 'He neither begets nor is born,',
        tajweed: [
          { text: 'لَمْ ', rule: null },
          { text: 'يَلِدْ ', rule: 'qalqalah' },
          { text: 'وَلَمْ ', rule: null },
          { text: 'يُولَدْ', rule: 'madd' },
        ],
      },
      {
        number: 4,
        arabic: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
        transliteration: 'Wa-lam yakun lahu kufuwan aḥad',
        translation: 'Nor is there to Him any equivalent."',
        tajweed: [
          { text: 'وَلَمْ ', rule: null },
          { text: 'يَكُن لَّهُ ', rule: 'idgham' },
          { text: 'كُفُوًا ', rule: null },
          { text: 'أَحَدٌ', rule: null },
        ],
      },
    ],
  },
  {
    number: 113,
    name: 'Al-Falaq',
    arabicName: 'الفلق',
    englishMeaning: 'The Daybreak',
    totalVerses: 5,
    revelationType: 'Meccan',
    verses: [
      {
        number: 1,
        arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
        transliteration: 'Qul aʿūdhu bi-rabbi l-falaq',
        translation: 'Say, "I seek refuge in the Lord of daybreak"',
        tajweed: [
          { text: 'قُلْ ', rule: 'qalqalah' },
          { text: 'أَعُوذُ ', rule: 'madd' },
          { text: 'بِرَبِّ ', rule: 'shaddah' },
          { text: 'الْفَلَقِ', rule: null },
        ],
      },
      {
        number: 2,
        arabic: 'مِن شَرِّ مَا خَلَقَ',
        transliteration: 'Min sharri mā khalaqa',
        translation: 'From the evil of that which He created',
        tajweed: [
          { text: 'مِن شَرِّ ', rule: 'ikhfa' },
          { text: 'مَا ', rule: 'madd' },
          { text: 'خَلَقَ', rule: null },
        ],
      },
      {
        number: 3,
        arabic: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ',
        transliteration: 'Wa-min sharri ghāsiqin idhā waqab',
        translation: 'And from the evil of darkness when it settles',
        tajweed: [
          { text: 'وَمِن شَرِّ ', rule: 'ikhfa' },
          { text: 'غَاسِقٍ ', rule: 'madd' },
          { text: 'إِذَا ', rule: 'madd' },
          { text: 'وَقَبَ', rule: null },
        ],
      },
      {
        number: 4,
        arabic: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ',
        transliteration: 'Wa-min sharri n-naffāthāti fī l-ʿuqad',
        translation: 'And from the evil of the blowers in knots',
        tajweed: [
          { text: 'وَمِن شَرِّ ', rule: 'ikhfa' },
          { text: 'النَّفَّاثَاتِ ', rule: 'shaddah' },
          { text: 'فِي ', rule: 'madd' },
          { text: 'الْعُقَدِ', rule: null },
        ],
      },
      {
        number: 5,
        arabic: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
        transliteration: 'Wa-min sharri ḥāsidin idhā ḥasad',
        translation: 'And from the evil of an envier when he envies.',
        tajweed: [
          { text: 'وَمِن شَرِّ ', rule: 'ikhfa' },
          { text: 'حَاسِدٍ ', rule: 'madd' },
          { text: 'إِذَا ', rule: 'madd' },
          { text: 'حَسَدَ', rule: null },
        ],
      },
    ],
  },
  {
    number: 114,
    name: 'An-Nas',
    arabicName: 'الناس',
    englishMeaning: 'Mankind',
    totalVerses: 6,
    revelationType: 'Meccan',
    verses: [
      {
        number: 1,
        arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
        transliteration: 'Qul aʿūdhu bi-rabbi n-nās',
        translation: 'Say, "I seek refuge in the Lord of mankind,"',
        tajweed: [
          { text: 'قُلْ ', rule: 'qalqalah' },
          { text: 'أَعُوذُ ', rule: 'madd' },
          { text: 'بِرَبِّ ', rule: 'shaddah' },
          { text: 'النَّاسِ', rule: 'madd' },
        ],
      },
      {
        number: 2,
        arabic: 'مَلِكِ النَّاسِ',
        transliteration: 'Maliki n-nās',
        translation: 'The Sovereign of mankind.',
        tajweed: [
          { text: 'مَلِكِ ', rule: null },
          { text: 'النَّاسِ', rule: 'madd' },
        ],
      },
      {
        number: 3,
        arabic: 'إِلَٰهِ النَّاسِ',
        transliteration: 'Ilāhi n-nās',
        translation: 'The God of mankind,',
        tajweed: [
          { text: 'إِلَٰهِ ', rule: 'madd' },
          { text: 'النَّاسِ', rule: 'madd' },
        ],
      },
      {
        number: 4,
        arabic: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
        transliteration: 'Min sharri l-waswāsi l-khannās',
        translation: 'From the evil of the retreating whisperer',
        tajweed: [
          { text: 'مِن شَرِّ ', rule: 'ikhfa' },
          { text: 'الْوَسْوَاسِ ', rule: 'madd' },
          { text: 'الْخَنَّاسِ', rule: 'madd' },
        ],
      },
      {
        number: 5,
        arabic: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ',
        transliteration: 'Alladhī yuwaswisu fī ṣudūri n-nās',
        translation: 'Who whispers [evil] into the breasts of mankind',
        tajweed: [
          { text: 'الَّذِي ', rule: 'shaddah' },
          { text: 'يُوَسْوِسُ ', rule: 'madd' },
          { text: 'فِي ', rule: 'madd' },
          { text: 'صُدُورِ ', rule: 'madd' },
          { text: 'النَّاسِ', rule: 'madd' },
        ],
      },
      {
        number: 6,
        arabic: 'مِنَ الْجِنَّةِ وَالنَّاسِ',
        transliteration: 'Mina l-jinnati wa-n-nās',
        translation: 'From among the jinn and mankind."',
        tajweed: [
          { text: 'مِنَ ', rule: null },
          { text: 'الْجِنَّةِ ', rule: 'ghunna' },
          { text: 'وَالنَّاسِ', rule: 'madd' },
        ],
      },
    ],
  },
];
