import type { AdhkarBook } from "./types";

// Dala'il al-Khayrat (دلائل الخيرات) — Muhammad ibn Sulayman al-Jazuli (d. 1465)
// The most famous collection of Salawat on the Prophet ﷺ, divided into eight
// daily portions (one per day of the week + an opening).

export const DALAIL_AL_KHAYRAT: AdhkarBook = {
  id: "dalail_al_khayrat",
  title: "Dala'il al-Khayrat",
  titleArabic: "دلائل الخيرات",
  author: "Imam Muhammad ibn Sulayman al-Jazuli",
  tradition: "maghribi_shadhili",
  description:
    "Proofs of Good Deeds — the most celebrated book of blessings upon the Prophet ﷺ, divided into portions for each day of the week.",
  sections: [
    {
      id: "dalail_opening",
      title: "Opening — Al-Fatiha and Intention",
      titleArabic: "الفاتحة والنية",
      category: "morning",
      adhkar: [
        {
          id: "dk_opening_01",
          arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ...",
          transliteration: "Al-ḥamdu lillāhi rabbil-ʿālamīn...",
          translation: "Surah Al-Fatiha — recited with the intention of sending blessings upon the Prophet ﷺ.",
          targetCount: 1,
          source: "Dala'il al-Khayrat — Opening",
        },
      ],
    },
    {
      id: "dalail_hizb_1",
      title: "Hizb 1 — Sunday",
      titleArabic: "الحزب الأول (الأحد)",
      category: "morning",
      adhkar: [
        {
          id: "dk_h1_01",
          arabic:
            "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
          transliteration:
            "Allāhumma ṣalli ʿalā Muḥammadin wa ʿalā āli Muḥammadin kamā ṣallayta ʿalā Ibrāhīma wa ʿalā āli Ibrāhīm, innaka Ḥamīdun Majīd",
          translation:
            "O Allah, send Your blessings upon Muhammad and his family, as You sent Your blessings upon Ibrahim and his family. Verily, You are Praiseworthy, Glorious.",
          benefit: "The Ibrahimiyya salawat — the most authentic salawat formula",
          targetCount: 100,
          source: "Dala'il al-Khayrat — Hizb 1 | Bukhari 3370",
        },
        {
          id: "dk_h1_02",
          arabic:
            "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ عَدَدَ مَنْ صَلَّى عَلَيْهِ وَصَلِّ عَلَى مُحَمَّدٍ كَمَا يَنْبَغِي أَنْ يُصَلَّى عَلَيْهِ",
          transliteration:
            "Allāhumma ṣalli ʿalā Muḥammadin ʿadada man ṣallā ʿalayhi wa ṣalli ʿalā Muḥammadin kamā yanbaghī an yuṣallā ʿalayh",
          translation:
            "O Allah, send blessings upon Muhammad equal to the number of those who have sent blessings on him, and send blessings upon Muhammad as is befitting to be done.",
          targetCount: 10,
          source: "Dala'il al-Khayrat — Hizb 1",
        },
      ],
    },
    {
      id: "dalail_hizb_2",
      title: "Hizb 2 — Monday",
      titleArabic: "الحزب الثاني (الاثنين)",
      category: "morning",
      adhkar: [
        {
          id: "dk_h2_01",
          arabic:
            "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ الَّذِي مَلَأْتَ قَلْبَهُ مِنْ جَلاَلِكَ وَعَيْنَهُ مِنْ جَمَالِكَ",
          transliteration:
            "Allāhumma ṣalli ʿalā sayyidinā Muḥammadil-ladhī malaʾta qalbahu min jalālika wa ʿaynahu min jamālik",
          translation:
            "O Allah, send Your blessings upon our master Muhammad, whose heart You filled with Your majesty and whose eyes You filled with Your beauty.",
          targetCount: 100,
          source: "Dala'il al-Khayrat — Hizb 2",
        },
      ],
    },
    {
      id: "dalail_hizb_3",
      title: "Hizb 3 — Tuesday",
      titleArabic: "الحزب الثالث (الثلاثاء)",
      category: "morning",
      adhkar: [
        {
          id: "dk_h3_01",
          arabic:
            "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلاَةً تُزَكِّي بِهَا نَفْسَهُ وَتُشَرِّفُ بِهَا قَدْرَهُ وَتُقَرِّبُهُ بِهَا إِلَيْكَ",
          transliteration:
            "Allāhumma ṣalli ʿalā sayyidinā Muḥammadin ṣalātan tuzakkī bihā nafsahu wa tusharrifu bihā qadrahu wa tuqarribuhu bihā ilayk",
          translation:
            "O Allah, send blessings upon our master Muhammad — blessings that purify his soul, ennoble his rank, and draw him close to You.",
          targetCount: 100,
          source: "Dala'il al-Khayrat — Hizb 3",
        },
      ],
    },
    {
      id: "dalail_hizb_4",
      title: "Hizb 4 — Wednesday",
      titleArabic: "الحزب الرابع (الأربعاء)",
      category: "morning",
      adhkar: [
        {
          id: "dk_h4_01",
          arabic:
            "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَأَعْطِهِ الْوَسِيلَةَ وَالْفَضِيلَةَ وَابْعَثْهُ مَقَاماً مَحْمُوداً الَّذِي وَعَدْتَهُ",
          transliteration:
            "Allāhumma ṣalli ʿalā sayyidinā Muḥammadin wa aʿṭihi al-wasīlata wal-faḍīlata wab-ʿathu maqāman maḥmūdanil-ladhī waʿadtah",
          translation:
            "O Allah, send blessings upon our master Muhammad and grant him al-Wasila (the highest rank in Paradise), the high rank, and raise him to the praised station that You have promised him.",
          targetCount: 100,
          source: "Dala'il al-Khayrat — Hizb 4 | Bukhari 614",
        },
      ],
    },
    {
      id: "dalail_hizb_5",
      title: "Hizb 5 — Thursday",
      titleArabic: "الحزب الخامس (الخميس)",
      category: "morning",
      adhkar: [
        {
          id: "dk_h5_01",
          arabic:
            "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ صَلاَةً دَائِمَةً تُدَاومُ بِدَوَامِكَ وَتَبْقَى بِبَقَائِكَ",
          transliteration:
            "Allāhumma ṣalli ʿalā Muḥammadin wa ʿalā āli Muḥammadin ṣalātan dāʾimatan tudāwimu bi-dawāmika wa tabqā bi-baqāʾik",
          translation:
            "O Allah, send blessings upon Muhammad and his family — blessings that are perpetual, lasting as long as You last and enduring as long as You endure.",
          targetCount: 100,
          source: "Dala'il al-Khayrat — Hizb 5",
        },
      ],
    },
    {
      id: "dalail_hizb_6",
      title: "Hizb 6 — Friday",
      titleArabic: "الحزب السادس (الجمعة)",
      category: "morning",
      adhkar: [
        {
          id: "dk_h6_01",
          arabic:
            "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ أَلْفَ أَلْفِ صَلاَةٍ وَسَلَامَ",
          transliteration:
            "Allāhumma ṣalli ʿalā sayyidinā Muḥammadin wa ʿalā ālihi alfa alfi ṣalātin wa salām",
          translation:
            "O Allah, send blessings upon our master Muhammad and his family — a million blessings and peace.",
          benefit: "The great Friday hizb — the most meritorious day for salawat",
          targetCount: 1000,
          source: "Dala'il al-Khayrat — Hizb 6 (Friday)",
        },
      ],
    },
    {
      id: "dalail_hizb_7",
      title: "Hizb 7 — Saturday",
      titleArabic: "الحزب السابع (السبت)",
      category: "morning",
      adhkar: [
        {
          id: "dk_h7_01",
          arabic:
            "اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلاَةِ الْقَائِمَةِ آتِ مُحَمَّداً الْوَسِيلَةَ وَالْفَضِيلَةَ",
          transliteration:
            "Allāhumma rabba hādhihid-daʿwatit-tāmmati waṣ-ṣalātil-qāʾimati āti Muḥammadanil-wasīlata wal-faḍīlah",
          translation:
            "O Allah, Lord of this perfect call and the established prayer, grant Muhammad the rank of al-Wasila and the high station.",
          targetCount: 100,
          source: "Dala'il al-Khayrat — Hizb 7 | Bukhari 614",
        },
      ],
    },
    {
      id: "dalail_closing",
      title: "Closing Du'a",
      titleArabic: "الدعاء الختامي",
      category: "morning",
      adhkar: [
        {
          id: "dk_close_01",
          arabic:
            "اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ فِي كُلِّ لَمْحَةٍ وَنَفَسٍ عَدَدَ مَا وَسِعَهُ عِلْمُ اللَّهِ",
          transliteration:
            "Allāhumma ṣalli wa sallim wa bārik ʿalā sayyidinā Muḥammadin wa ʿalā āli sayyidinā Muḥammadin fī kulli lamḥatin wa nafasin ʿadada mā wasiʿahu ʿilmullāh",
          translation:
            "O Allah, send blessings, peace, and grace upon our master Muhammad and his family with every glance and breath, equal to the number encompassed by the knowledge of Allah.",
          targetCount: 1,
          source: "Dala'il al-Khayrat — Closing",
        },
      ],
    },
  ],
};
