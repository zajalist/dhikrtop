import type { AdhkarBook } from "./types";

// Ratib al-Haddad — Imam 'Abdullah ibn 'Alawi al-Haddad (1634–1720)
// Recited once in the morning and once in the evening.
// One of the most widely practiced wird in the Muslim world.

export const RATIB_AL_HADDAD: AdhkarBook = {
  id: "ratib_al_haddad",
  title: "Ratib al-Haddad",
  titleArabic: "راتب الحداد",
  author: "Imam 'Abdullah ibn 'Alawi al-Haddad",
  tradition: "tarimi_baalawi",
  description:
    "A comprehensive daily litany composed by Imam al-Haddad covering tahlil, istighfar, Quranic verses, and salawat — recited morning and evening.",
  sections: [
    {
      id: "ratib_opening",
      title: "Opening",
      titleArabic: "الافتتاح",
      category: "morning",
      adhkar: [
        {
          id: "rh_01",
          arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          transliteration: "Bismillāhir-raḥmānir-raḥīm",
          translation: "In the name of Allah, the Most Merciful, the Most Compassionate.",
          targetCount: 3,
          source: "Ratib al-Haddad",
        },
        {
          id: "rh_02",
          arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ الرَّحْمَٰنِ الرَّحِيمِ مَالِكِ يَوْمِ الدِّينِ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
          transliteration: "Al-ḥamdu lillāhi rabbil-ʿālamīn...",
          translation: "Surah Al-Fatiha.",
          targetCount: 1,
          source: "Quran 1:1-7",
        },
        {
          id: "rh_03",
          arabic:
            "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ...",
          transliteration: "Allāhu lā ilāha illā huwal-ḥayyul-qayyūm...",
          translation: "Ayat al-Kursi (Surah 2:255).",
          targetCount: 1,
          source: "Quran 2:255",
        },
      ],
    },
    {
      id: "ratib_tahlil",
      title: "Tahlil — 100x",
      titleArabic: "التهليل",
      description: "The central pillar of the Ratib.",
      category: "morning",
      adhkar: [
        {
          id: "rh_04",
          arabic: "لاَ إِلَهَ إِلاَّ اللَّهُ",
          transliteration: "Lā ilāha illallāh",
          translation: "There is no deity worthy of worship except Allah.",
          benefit: "100x — 100 good deeds, 100 sins erased, shield from Shaytan all day",
          targetCount: 100,
          source: "Ratib al-Haddad — Muslim 2691",
        },
      ],
    },
    {
      id: "ratib_salawat",
      title: "Salawat on the Prophet ﷺ",
      titleArabic: "الصلاة على النبي",
      category: "morning",
      adhkar: [
        {
          id: "rh_05",
          arabic:
            "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ عَبْدِكَ وَنَبِيِّكَ وَرَسُولِكَ النَّبِيِّ الأُمِّيِّ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ",
          transliteration:
            "Allāhumma ṣalli ʿalā sayyidinā Muḥammadin ʿabdika wa nabiyyika wa rasūlikal-nabiyyil-ummiyyi wa ʿalā ālihi wa ṣaḥbihi wa sallim",
          translation:
            "O Allah, send Your blessings upon our master Muhammad, Your slave, Your Prophet, Your Messenger, the unlettered Prophet, and upon his family and companions.",
          targetCount: 50,
          source: "Ratib al-Haddad",
        },
      ],
    },
    {
      id: "ratib_istighfar",
      title: "Istighfar",
      titleArabic: "الاستغفار",
      category: "morning",
      adhkar: [
        {
          id: "rh_06",
          arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ",
          transliteration: "Astaghfirullāhal-ʿaẓīm",
          translation: "I seek forgiveness from Allah the Magnificent.",
          targetCount: 100,
          source: "Ratib al-Haddad",
        },
      ],
    },
    {
      id: "ratib_subhanallah",
      title: "Tasbih, Hamd, Takbir",
      titleArabic: "التسبيح والحمد والتكبير",
      category: "morning",
      adhkar: [
        {
          id: "rh_07",
          arabic: "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلاَ إِلَهَ إِلاَّ اللَّهُ وَاللَّهُ أَكْبَرُ",
          transliteration:
            "Subḥānallāhi wal-ḥamdulillāhi wa lā ilāha illallāhu wallāhu akbar",
          translation:
            "Glory be to Allah, praise be to Allah, there is no deity but Allah, and Allah is the Greatest.",
          targetCount: 33,
          source: "Ratib al-Haddad",
        },
      ],
    },
    {
      id: "ratib_du_a_khatm",
      title: "Closing Du'a",
      titleArabic: "دعاء الختم",
      category: "morning",
      adhkar: [
        {
          id: "rh_08",
          arabic:
            "اللَّهُمَّ أَصْلِحْ لَنَا دِينَنَا الَّذِي هُوَ عِصْمَةُ أَمْرِنَا وَأَصْلِحْ لَنَا دُنْيَانَا الَّتِي فِيهَا مَعَاشُنَا وَأَصْلِحْ لَنَا آخِرَتَنَا الَّتِي إِلَيْهَا مَعَادُنَا وَاجْعَلِ الْحَيَاةَ زِيَادَةً لَنَا فِي كُلِّ خَيْرٍ وَاجْعَلِ الْمَوْتَ رَاحَةً لَنَا مِنْ كُلِّ شَرٍّ",
          transliteration:
            "Allāhumma aṣliḥ lanā dīnanal-ladhī huwa ʿiṣmatu amrinā... wajʿalil-mawta rāḥatan lanā min kulli sharr",
          translation:
            "O Allah, set right for us our religion which is the safeguard of all our affairs, set right our world in which we live, set right our Hereafter to which we return. Make life for us an increase in every good, and make death a rest for us from every evil.",
          targetCount: 1,
          source: "Ratib al-Haddad — Muslim 2720",
        },
        {
          id: "rh_09",
          arabic:
            "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
          transliteration:
            "Rabbanā ātinā fid-dunyā ḥasanatan wa fil-ākhirati ḥasanatan wa qinā ʿadhāban-nār",
          translation:
            "Our Lord, grant us good in this world and good in the Hereafter, and save us from the punishment of the Fire.",
          targetCount: 3,
          source: "Quran 2:201",
        },
      ],
    },
  ],
};
