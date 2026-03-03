import type { AdhkarBook } from "./types";

// Wird al-Latif (الورد اللطيف) — Imam 'Abdullah ibn 'Alawi al-Haddad
// Recited morning and evening. The most widely practiced wird in the Ba'Alawi tradition.

export const WIRD_AL_LATIF: AdhkarBook = {
  id: "wird_al_latif",
  title: "Wird al-Latif",
  titleArabic: "الورد اللطيف",
  author: "Imam 'Abdullah ibn 'Alawi al-Haddad",
  tradition: "tarimi_baalawi",
  description:
    "The Gentle Litany — a morning and evening wird compiled by Imam al-Haddad and universally practiced throughout the Ba'Alawi world.",
  sections: [
    {
      id: "wird_latif_opening",
      title: "Opening — Seeking Refuge and Basmalah",
      titleArabic: "الافتتاح",
      description: "Begin with seeking refuge from Shaytan and reciting the Basmalah.",
      category: "morning",
      adhkar: [
        {
          id: "wl_01",
          arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
          transliteration: "Aʿūdhu billāhi minas-shayṭānir-rajīm",
          translation: "I seek refuge in Allah from the accursed Shaytan.",
          targetCount: 1,
          source: "Wird al-Latif",
        },
        {
          id: "wl_02",
          arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          transliteration: "Bismillāhir-raḥmānir-raḥīm",
          translation: "In the name of Allah, the Most Merciful, the Most Compassionate.",
          targetCount: 1,
          source: "Wird al-Latif",
        },
      ],
    },
    {
      id: "wird_latif_fatiha",
      title: "Al-Fatiha",
      titleArabic: "الفاتحة",
      category: "morning",
      adhkar: [
        {
          id: "wl_03",
          arabic:
            "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿١﴾ الرَّحْمَٰنِ الرَّحِيمِ ﴿٢﴾ مَالِكِ يَوْمِ الدِّينِ ﴿٣﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٤﴾ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٥﴾ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٦﴾",
          transliteration:
            "Al-ḥamdu lillāhi rabbil-ʿālamīn...",
          translation:
            "All praise is due to Allah, the Lord of all the Worlds, the Most Gracious, the Most Merciful, Master of the Day of Judgment. You alone we worship and You alone we ask for help. Guide us to the straight path — the path of those You have blessed, not those who have incurred anger, nor those who are astray.",
          targetCount: 3,
          source: "Wird al-Latif",
        },
      ],
    },
    {
      id: "wird_latif_ayat_kursi",
      title: "Ayat al-Kursi",
      titleArabic: "آية الكرسي",
      category: "morning",
      adhkar: [
        {
          id: "wl_04",
          arabic:
            "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
          transliteration: "Allāhu lā ilāha illā huwal-ḥayyul-qayyūm...",
          translation:
            "Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Throne extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
          targetCount: 1,
          source: "Quran 2:255",
        },
      ],
    },
    {
      id: "wird_latif_ikhlas_muawwidhat",
      title: "Al-Ikhlas and Al-Mu'awwidhat",
      titleArabic: "الإخلاص والمعوذتان",
      category: "morning",
      adhkar: [
        {
          id: "wl_05",
          arabic:
            "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ قُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ﴿٤﴾",
          transliteration: "Bismillāh... Qul huwa Allāhu aḥad...",
          translation:
            "Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born. And there is none comparable to Him.",
          targetCount: 3,
          source: "Quran 112",
        },
        {
          id: "wl_06",
          arabic:
            "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ﴿١﴾ مِن شَرِّ مَا خَلَقَ ﴿٢﴾ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿٣﴾ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ﴿٤﴾ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿٥﴾",
          transliteration: "Bismillāh... Qul aʿūdhu bi-rabbil-falaq...",
          translation:
            "Say: I seek refuge in the Lord of the daybreak, from the evil of what He has created, and from the evil of darkness when it descends, and from the evil of the blowers in knots, and from the evil of an envier when he envies.",
          targetCount: 3,
          source: "Quran 113",
        },
        {
          id: "wl_07",
          arabic:
            "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ النَّاسِ ﴿١﴾ مَلِكِ النَّاسِ ﴿٢﴾ إِلَٰهِ النَّاسِ ﴿٣﴾ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ﴿٤﴾ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ﴿٥﴾ مِنَ الْجِنَّةِ وَالنَّاسِ ﴿٦﴾",
          transliteration: "Bismillāh... Qul aʿūdhu bi-rabbin-nās...",
          translation:
            "Say: I seek refuge in the Lord of mankind, the Sovereign of mankind, the God of mankind, from the evil of the whisperer who retreats — who whispers in the breasts of mankind — from among the jinn and mankind.",
          targetCount: 3,
          source: "Quran 114",
        },
      ],
    },
    {
      id: "wird_latif_salawat",
      title: "Salawat — Blessings on the Prophet",
      titleArabic: "الصلاة على النبي ﷺ",
      category: "morning",
      adhkar: [
        {
          id: "wl_08",
          arabic:
            "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ",
          transliteration:
            "Allāhumma ṣalli ʿalā sayyidinā Muḥammadin wa ʿalā āli sayyidinā Muḥammad",
          translation:
            "O Allah, send Your blessings upon our master Muhammad and upon the family of our master Muhammad.",
          targetCount: 100,
          source: "Wird al-Latif — Imam al-Haddad",
        },
      ],
    },
    {
      id: "wird_latif_tahlil",
      title: "Tahlil — Lā ilāha illa Allāh",
      titleArabic: "التهليل",
      category: "morning",
      adhkar: [
        {
          id: "wl_09",
          arabic: "لاَ إِلَهَ إِلاَّ اللَّهُ",
          transliteration: "Lā ilāha illallāh",
          translation: "There is no deity worthy of worship except Allah.",
          benefit: "The greatest remembrance of Allah",
          targetCount: 100,
          source: "Wird al-Latif — Imam al-Haddad",
        },
      ],
    },
    {
      id: "wird_latif_closing",
      title: "Closing Prayers",
      titleArabic: "الختام",
      category: "morning",
      adhkar: [
        {
          id: "wl_10",
          arabic:
            "يَا رَبِّ بِالْمُصْطَفَى بَلِّغْ مَقَاصِدَنَا وَاغْفِرْ لَنَا مَا مَضَى يَا وَاسِعَ الْكَرَمِ",
          transliteration:
            "Yā rabbi bil-muṣṭafā balligh maqāṣidanā waghfir lanā mā maḍā yā wāsiʿal-karam",
          translation:
            "O Lord, by the Chosen One, let our aims be reached, and forgive us what has passed, O Most Generous.",
          targetCount: 1,
          source: "Wird al-Latif closing du'a",
        },
        {
          id: "wl_11",
          arabic:
            "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
          transliteration:
            "Rabbanā ātinā fid-dunyā ḥasanatan wa fil-ākhirati ḥasanatan wa qinā ʿadhāban-nār",
          translation:
            "Our Lord, grant us good in this world and good in the Hereafter, and save us from the punishment of the Fire.",
          targetCount: 3,
          source: "Quran 2:201",
        },
        {
          id: "wl_12",
          arabic:
            "سُبْحَانَ رَبِّكَ رَبِّ الْعِزَّةِ عَمَّا يَصِفُونَ وَسَلاَمٌ عَلَى الْمُرْسَلِينَ وَالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
          transliteration:
            "Subḥāna rabbika rabbil-ʿizzati ʿammā yaṣifūn, wa salāmun ʿalal-mursalīn, wal-ḥamdu lillāhi rabbil-ʿālamīn",
          translation:
            "Exalted is your Lord, the Lord of Might, above what they describe. And peace upon the messengers. And all praise is due to Allah, Lord of the worlds.",
          targetCount: 1,
          source: "Quran 37:180-182",
        },
      ],
    },
  ],
};
