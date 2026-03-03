import type { AdhkarBook } from "./types";

// Al-Adhkar — Imam Yahya ibn Sharaf al-Nawawi (1233–1277)
// Comprehensive encyclopedia of adhkar organized by life situation.

export const NAWAWI_ADHKAR: AdhkarBook = {
  id: "nawawi_adhkar",
  title: "Al-Adhkar",
  titleArabic: "الأذكار",
  author: "Imam Yahya ibn Sharaf al-Nawawi",
  tradition: "classical_nawawi",
  description:
    "The most comprehensive classical encyclopedia of daily remembrances, covering every situation from waking to sleeping, prayer, travel, and more.",
  sections: [
    {
      id: "nawawi_waking",
      title: "Dhikr Upon Waking",
      titleArabic: "ذكر الاستيقاظ",
      category: "morning",
      adhkar: [
        {
          id: "nw_wake_01",
          arabic:
            "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
          transliteration:
            "Alḥamdulillāhil-ladhī aḥyānā baʿda mā amātanā wa ilayhin-nushūr",
          translation:
            "All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection.",
          targetCount: 1,
          source: "Al-Adhkar — Bukhari 6312",
        },
        {
          id: "nw_wake_02",
          arabic:
            "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلاَ إِلَهَ إِلاَّ اللَّهُ وَاللَّهُ أَكْبَرُ وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ الْعَلِيِّ الْعَظِيمِ",
          transliteration:
            "Lā ilāha illallāhu waḥdahu lā sharīka lahu... wa lā ḥawla wa lā quwwata illā billāhil-ʿaliyyil-ʿaẓīm",
          translation:
            "There is no deity but Allah alone, with no partner... There is no power and no might except through Allah, the Most High, the Magnificent.",
          benefit: "Upon waking at night — sins forgiven; if he rises and prays, his prayer is accepted",
          targetCount: 1,
          source: "Al-Adhkar — Bukhari 1154",
        },
      ],
    },
    {
      id: "nawawi_morning",
      title: "Morning Remembrances",
      titleArabic: "أذكار الصباح",
      category: "morning",
      adhkar: [
        {
          id: "nw_m_01",
          arabic:
            "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ",
          transliteration:
            "Allāhumma innī asʾalukal-ʿafwa wal-ʿāfiyata fid-dunyā wal-ākhirah",
          translation:
            "O Allah, I ask You for pardon and well-being in this world and the next.",
          targetCount: 1,
          source: "Al-Adhkar — Ibn Majah 3851",
        },
        {
          id: "nw_m_02",
          arabic:
            "اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَاوَاتِ وَالأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ أَنْتَ أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ",
          transliteration:
            "Allāhumma ʿālimal-ghaybi wash-shahādati fāṭiras-samāwāti wal-arḍ, rabba kulli shayʾin wa malīkah...",
          translation:
            "O Allah, Knower of the unseen and the seen, Creator of the heavens and the earth, Lord and Owner of all things, I bear witness that there is no deity but You. I seek refuge in You from the evil of my soul and from the evil of Shaytan and his polytheism.",
          targetCount: 1,
          source: "Al-Adhkar — Abu Dawud 5067, Tirmidhi 3392",
        },
        {
          id: "nw_m_03",
          arabic:
            "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ عَلَيْكَ تَوَكَّلْتُ وَأَنْتَ رَبُّ الْعَرْشِ الْعَظِيمِ",
          transliteration:
            "Allāhumma anta rabbī lā ilāha illā anta ʿalayka tawakkaltu wa anta rabbul-ʿarshil-ʿaẓīm",
          translation:
            "O Allah, You are my Lord. There is no deity but You. Upon You I rely and You are the Lord of the Mighty Throne.",
          targetCount: 7,
          source: "Al-Adhkar — Abu Dawud 5081",
        },
      ],
    },
    {
      id: "nawawi_evening",
      title: "Evening Remembrances",
      titleArabic: "أذكار المساء",
      category: "evening",
      adhkar: [
        {
          id: "nw_e_01",
          arabic:
            "اللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَمُ تَبَارَكْتَ وَتَعَالَيْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ",
          transliteration:
            "Allāhumma antas-salāmu wa minkas-salāmu tabārakta wa taʿālayta yā dhal-jalāli wal-ikrām",
          translation:
            "O Allah, You are Peace, and from You is peace. Blessed and Exalted are You, O Possessor of majesty and honor.",
          targetCount: 1,
          source: "Al-Adhkar — Muslim 591",
        },
        {
          id: "nw_e_02",
          arabic:
            "اللَّهُمَّ إِنَّا نَعُوذُ بِكَ مِنْ أَنْ نُشْرِكَ بِكَ شَيْئاً نَعْلَمُهُ وَنَسْتَغْفِرُكَ لِمَا لاَ نَعْلَمُهُ",
          transliteration:
            "Allāhumma innā naʿūdhu bika min an nushrika bika shayʾan naʿlamuh, wa nastaghfiruka limā lā naʿlamuh",
          translation:
            "O Allah, we seek refuge in You from knowingly associating anything with You, and we ask Your forgiveness for what we do unknowingly.",
          targetCount: 3,
          source: "Al-Adhkar — Ahmad 19606",
        },
      ],
    },
    {
      id: "nawawi_after_prayer",
      title: "After-Prayer Adhkar",
      titleArabic: "أذكار عقب الصلاة",
      category: "after-prayer",
      adhkar: [
        {
          id: "nw_ap_01",
          arabic:
            "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
          transliteration:
            "Allāhumma aʿinnī ʿalā dhikrika wa shukrika wa ḥusni ʿibādatik",
          translation:
            "O Allah, help me to remember You, to thank You, and to worship You in the best manner.",
          benefit: "The Prophet ﷺ specifically commanded Mu'adh to say this after every prayer",
          targetCount: 1,
          source: "Al-Adhkar — Abu Dawud 1522",
        },
        {
          id: "nw_ap_02",
          arabic:
            "اللَّهُمَّ اغْفِرْ لِي مَا قَدَّمْتُ وَمَا أَخَّرْتُ وَمَا أَسْرَرْتُ وَمَا أَعْلَنْتُ وَمَا أَسْرَفْتُ وَمَا أَنْتَ أَعْلَمُ بِهِ مِنِّي أَنْتَ الْمُقَدِّمُ وَأَنْتَ الْمُؤَخِّرُ لاَ إِلَهَ إِلاَّ أَنْتَ",
          transliteration:
            "Allāhummaghfir lī mā qaddamtu wa mā akhkhartu wa mā asrartu wa mā aʿlantu wa mā asraftu wa mā anta aʿlamu bihi minnī. Antal-muqaddimu wa antal-muʾakhkhiru lā ilāha illā ant",
          translation:
            "O Allah, forgive me what I have done before and what I have done later, what I have hidden and what I have made public, my transgressions, and what You know about me better than I do. You are the Advancer and You are the Delayer. There is no deity but You.",
          targetCount: 1,
          source: "Al-Adhkar — Muslim 771",
        },
      ],
    },
    {
      id: "nawawi_sleep",
      title: "Dhikr Before Sleep",
      titleArabic: "أذكار النوم",
      category: "sleep",
      adhkar: [
        {
          id: "nw_sl_01",
          arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
          transliteration: "Bismika Allāhumma amūtu wa aḥyā",
          translation: "In Your name, O Allah, I die and I live.",
          targetCount: 1,
          source: "Al-Adhkar — Bukhari 6324",
        },
        {
          id: "nw_sl_02",
          arabic:
            "اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ وَفَوَّضْتُ أَمْرِي إِلَيْكَ وَوَجَّهْتُ وَجْهِي إِلَيْكَ وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ رَغْبَةً وَرَهْبَةً إِلَيْكَ لاَ مَلْجَأَ وَلاَ مَنْجَى مِنْكَ إِلاَّ إِلَيْكَ آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ",
          transliteration:
            "Allāhumma aslamtu nafsī ilayk, wa fawwaḍtu amrī ilayk, wa wajjahtu wajhī ilayk, wa aljaʾtu ẓahrī ilayk raghbatan wa rahbatan ilayk, lā malja'a wa lā manjā minka illā ilayk. Āmantu bikitābikalladhī anzalta wa bi-nabiyyikalladhī arsalt",
          translation:
            "O Allah, I have submitted my soul to You, entrusted my affair to You, and turned my face to You, out of desire and fear of You. There is no refuge or salvation from You except in You. I believe in Your Book which You revealed and in Your Prophet whom You sent.",
          benefit: "If one dies, he dies on fitrah — say this as the last words before sleeping",
          targetCount: 1,
          source: "Al-Adhkar — Bukhari 247, Muslim 2710",
        },
      ],
    },
    {
      id: "nawawi_general",
      title: "General Remembrances",
      titleArabic: "الأذكار العامة",
      category: "general",
      adhkar: [
        {
          id: "nw_g_01",
          arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ",
          transliteration:
            "Subḥānallāhi wa biḥamdihī subḥānallāhil-ʿaẓīm",
          translation:
            "Glory be to Allah and praise Him; glory be to Allah the Magnificent.",
          benefit: "Two phrases beloved to the Most Merciful — light on tongue, heavy on the scale",
          targetCount: 100,
          source: "Al-Adhkar — Bukhari 6682",
        },
        {
          id: "nw_g_02",
          arabic:
            "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
          transliteration:
            "Lā ilāha illallāhu waḥdahu lā sharīka lahu, lahul-mulku wa lahul-ḥamdu wa huwa ʿalā kulli shayʾin qadīr",
          translation:
            "There is no deity but Allah alone, with no partner. His is the dominion and His the praise, and He is over all things omnipotent.",
          targetCount: 100,
          source: "Al-Adhkar — Muslim 2693",
        },
      ],
    },
  ],
};
