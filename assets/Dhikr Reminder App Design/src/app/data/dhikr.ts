export type DhikrCategory = 'morning' | 'evening' | 'after-prayer' | 'general';

export interface Dhikr {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  targetCount: number;
  source: string;
  category: DhikrCategory;
  benefit?: string;
}

export const morningAdhkar: Dhikr[] = [
  {
    id: 'm1',
    arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
    transliteration: 'Allāhumma bika aṣbaḥnā wa bika amsaynā wa bika naḥyā wa bika namūtu wa ilayka an-nushūr',
    translation: 'O Allah, by You we enter the morning and by You we enter the evening; by You we live and by You we die, and to You is the resurrection.',
    targetCount: 1,
    source: 'Abu Dawud 5068',
    category: 'morning',
    benefit: 'Starts the day with remembrance of Allah',
  },
  {
    id: 'm2',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ',
    transliteration: 'Aṣbaḥnā wa aṣbaḥal-mulku lillāhi wal-ḥamdu lillāhi, lā ilāha illallāhu waḥdahu lā sharīka lah',
    translation: 'We have entered the morning and the kingdom belongs to Allah; praise be to Allah, there is no god but Allah, alone with no partner.',
    targetCount: 1,
    source: 'Muslim 2723',
    category: 'morning',
    benefit: 'Affirms the sovereignty of Allah at the start of each day',
  },
  {
    id: 'm3',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'Subḥānallāhi wa biḥamdih',
    translation: 'Glory be to Allah and praise be to Him.',
    targetCount: 100,
    source: 'Bukhari 6405',
    category: 'morning',
    benefit: 'Said 100 times in morning — sins forgiven even if like sea foam',
  },
  {
    id: 'm4',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ',
    transliteration: 'Allāhumma anta rabbī lā ilāha illā anta, khalaqtanī wa anā ʿabduk',
    translation: 'O Allah, You are my Lord, there is no god but You. You created me and I am Your slave.',
    targetCount: 1,
    source: 'Bukhari 6306',
    category: 'morning',
    benefit: 'Sayyid al-Istighfar — the master supplication for forgiveness',
  },
  {
    id: 'm5',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    transliteration: 'Aʿūdhu bi kalimātillāhi at-tāmmāti min sharri mā khalaqa',
    translation: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
    targetCount: 3,
    source: 'Muslim 2708',
    category: 'morning',
    benefit: 'Protection from all harm — nothing will harm you that night',
  },
];

export const eveningAdhkar: Dhikr[] = [
  {
    id: 'e1',
    arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
    transliteration: 'Allāhumma bika amsaynā wa bika aṣbaḥnā wa bika naḥyā wa bika namūtu wa ilayka al-maṣīr',
    translation: 'O Allah, by You we enter the evening and by You we enter the morning; by You we live and by You we die, and to You is the final return.',
    targetCount: 1,
    source: 'At-Tirmidhi 3391',
    category: 'evening',
    benefit: 'Closes the day with remembrance of Allah',
  },
  {
    id: 'e2',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ',
    transliteration: 'Amsaynā wa amsal-mulku lillāhi wal-ḥamdu lillāhi, lā ilāha illallāhu waḥdahu lā sharīka lah',
    translation: 'We have entered the evening and the kingdom belongs to Allah; praise be to Allah, there is no god but Allah, alone with no partner.',
    targetCount: 1,
    source: 'Muslim 2723',
    category: 'evening',
    benefit: 'Affirms the sovereignty of Allah at the end of each day',
  },
  {
    id: 'e3',
    arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي',
    transliteration: 'Allāhumma ʿāfinī fī badanī, Allāhumma ʿāfinī fī samʿī, Allāhumma ʿāfinī fī baṣarī',
    translation: 'O Allah, grant me health in my body. O Allah, grant me health in my hearing. O Allah, grant me health in my sight.',
    targetCount: 3,
    source: 'Abu Dawud 5090',
    category: 'evening',
    benefit: 'Protection of body, hearing and sight',
  },
  {
    id: 'e4',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration: 'Bismillāhil-ladhī lā yaḍurru maʿasmihi shayʾun fil-arḍi wa lā fis-samāʾi wa huwa as-samīʿul-ʿalīm',
    translation: 'In the name of Allah with whose name nothing is harmed on earth or in the heavens, and He is the All-Hearing, All-Knowing.',
    targetCount: 3,
    source: 'Abu Dawud 5088',
    category: 'evening',
    benefit: 'Nothing will harm you if you say this 3 times morning and evening',
  },
];

export const afterPrayerAdhkar: Dhikr[] = [
  {
    id: 'ap1',
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: 'Subḥānallāh',
    translation: 'Glory be to Allah.',
    targetCount: 33,
    source: 'Muslim 597',
    category: 'after-prayer',
    benefit: 'Said 33x after every prayer',
  },
  {
    id: 'ap2',
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alḥamdulillāh',
    translation: 'Praise be to Allah.',
    targetCount: 33,
    source: 'Muslim 597',
    category: 'after-prayer',
    benefit: 'Said 33x after every prayer',
  },
  {
    id: 'ap3',
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allāhu Akbar',
    translation: 'Allah is the Greatest.',
    targetCount: 33,
    source: 'Muslim 597',
    category: 'after-prayer',
    benefit: 'Said 33x after every prayer',
  },
  {
    id: 'ap4',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: 'Lā ilāha illallāhu waḥdahu lā sharīka lahu, lahul-mulku wa lahul-ḥamdu wa huwa ʿalā kulli shayʾin qadīr',
    translation: 'There is no god but Allah alone, with no partner. His is the dominion and His the praise, and He is over all things powerful.',
    targetCount: 1,
    source: 'Muslim 597',
    category: 'after-prayer',
    benefit: 'Sins forgiven even if like foam of the sea',
  },
  {
    id: 'ap5',
    arabic: 'آيَةُ الْكُرْسِيِّ',
    transliteration: 'Āyat al-Kursī',
    translation: 'Allah — there is no deity except Him, the Ever-Living, the Self-Sustaining...',
    targetCount: 1,
    source: 'An-Nasai 9928',
    category: 'after-prayer',
    benefit: 'Whoever recites this after every prayer — nothing prevents him from entering Paradise except death',
  },
];

export const generalDhikr: Dhikr[] = [
  {
    id: 'g1',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ',
    transliteration: 'Lā ilāha illallāh',
    translation: 'There is no god but Allah.',
    targetCount: 100,
    source: 'Tirmidhi 3553',
    category: 'general',
    benefit: 'The best dhikr',
  },
  {
    id: 'g2',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
    transliteration: 'Subḥānallāhi wa biḥamdihī, subḥānallāhil-ʿaẓīm',
    translation: 'Glory be to Allah and praise be to Him; Glory be to Allah, the Magnificent.',
    targetCount: 100,
    source: 'Bukhari 6682',
    category: 'general',
    benefit: 'Two phrases light on tongue, heavy on scale, beloved to the Most Merciful',
  },
  {
    id: 'g3',
    arabic: 'اسْتَغْفِرُ اللَّهَ',
    transliteration: 'Astaghfirullāh',
    translation: 'I seek forgiveness from Allah.',
    targetCount: 100,
    source: 'Bukhari 6307',
    category: 'general',
    benefit: 'The Prophet ﷺ said: "I seek forgiveness from Allah more than seventy times a day"',
  },
];

export const allDhikr = [...morningAdhkar, ...eveningAdhkar, ...afterPrayerAdhkar, ...generalDhikr];

export const prayerTimes = {
  fajr: '05:15',
  dhuhr: '12:30',
  asr: '15:45',
  maghrib: '18:20',
  isha: '20:00',
};

export function getSmartReminderType(): { type: string; label: string; description: string } | null {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour * 60 + minute;

  const fajr = 5 * 60 + 15;
  const dhuhr = 12 * 60 + 30;
  const asr = 15 * 60 + 45;
  const maghrib = 18 * 60 + 20;
  const isha = 20 * 60;

  const prayerWindows = [
    { time: fajr, name: 'Fajr', category: 'morning' },
    { time: dhuhr, name: 'Dhuhr', category: 'after-prayer' },
    { time: asr, name: 'Asr', category: 'after-prayer' },
    { time: maghrib, name: 'Maghrib', category: 'evening' },
    { time: isha, name: 'Isha', category: 'after-prayer' },
  ];

  for (const prayer of prayerWindows) {
    if (Math.abs(currentTime - prayer.time) <= 30) {
      return {
        type: prayer.category,
        label: `After ${prayer.name}`,
        description: `Perfect time for adhkar after ${prayer.name} prayer`,
      };
    }
  }

  if (hour >= 5 && hour < 9) {
    return { type: 'morning', label: 'Morning Adhkar', description: 'Start your day with remembrance of Allah' };
  }
  if (hour >= 17 && hour < 20) {
    return { type: 'evening', label: 'Evening Adhkar', description: 'End your day with remembrance of Allah' };
  }
  return null;
}
