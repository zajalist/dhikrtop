import type { AdhkarBook, BookAdhkarItem } from "./types";
import type { Dhikr } from "../dhikr";
import { SEEN_MORNING_ADHKAR, SEEN_EVENING_ADHKAR } from "../seenArabicDb";

// Merge Seen-Arabic DB items into Hisn sections.
function seenToBookItems(items: Dhikr[]): BookAdhkarItem[] {
    return items.map((d) => ({
        id: d.id,
        arabic: d.arabic,
        transliteration: d.transliteration,
        translation: d.translation,
        benefit: d.benefit,
        targetCount: d.targetCount,
        source: d.source,
    }));
}

// Full Hisn al-Muslim (Fortress of the Muslim) — authentic morning, evening,
// after-prayer, sleep, and situational sections based on the collected work
// of Sa'id ibn 'Ali ibn Wahf al-Qahtani.

export const HISN_AL_MUSLIM: AdhkarBook = {
    id: "hisn_al_muslim",
    title: "Hisn al-Muslim",
    titleArabic: "حصن المسلم",
    author: "Sa'id ibn 'Ali al-Qahtani",
    tradition: "global_hisn",
    description:
        "Fortress of the Muslim — the most widely used collection of authentic daily adhkar drawn from the Quran and Sunnah.",
    sections: [
        // ─── Morning ─────────────────────────────────────────────────────────────
        {
            id: "hisn_morning",
            title: "Morning Adhkar",
            titleArabic: "أذكار الصباح",
            description: "Recited from Fajr until sunrise.",
            category: "morning",
            adhkar: [
                {
                    id: "hisn_m01",
                    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
                    transliteration:
                        "Alḥamdulillāhil-ladhī aḥyānā baʿda mā amātanā wa ilayhin-nushūr",
                    translation:
                        "All praise is for Allah who gave us life after having taken it from us, and unto Him is the resurrection.",
                    benefit:
                        "First words upon waking — gratitude for a new day",
                    targetCount: 1,
                    source: "Bukhari 6312",
                },
                {
                    id: "hisn_m02",
                    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
                    transliteration:
                        "Aṣbaḥnā wa aṣbaḥal-mulku lillāh... Rabb aʿūdhu bika min ʿadhābin fin-nāri wa ʿadhābin fil-qabr",
                    translation:
                        "We have reached the morning and at this very time all sovereignty belongs to Allah. Praise be to Allah. None has the right to be worshipped except Allah alone, with no partner. To Him belongs all praise and sovereignty, and He is over all things omnipotent. My Lord, I ask You for the good of this day and the good that follows it, and I seek refuge in You from the evil of this day and the evil that follows. My Lord, I seek refuge in You from laziness and senility. My Lord, I seek refuge in You from torment in the Fire and punishment in the grave.",
                    benefit: "Comprehensive morning protection du'a",
                    targetCount: 1,
                    source: "Muslim 2723",
                },
                {
                    id: "hisn_m03",
                    arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
                    transliteration:
                        "Allāhumma bika aṣbaḥnā wa bika amsaynā wa bika naḥyā wa bika namūtu wa ilaykan-nushūr",
                    translation:
                        "O Allah, by You we enter the morning, and by You we enter the evening. By You we live and by You we die, and unto You is the resurrection.",
                    benefit: "Acknowledges total dependence on Allah",
                    targetCount: 1,
                    source: "Abu Dawud 5068, Tirmidhi 3391",
                },
                {
                    id: "hisn_m04",
                    arabic: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ",
                    transliteration:
                        "Allāhumma anta rabbī lā ilāha illā anta, khalaqtanī wa anā ʿabduk, wa anā ʿalā ʿahdika wa waʿdika mastataʿtu, aʿūdhu bika min sharri mā ṣanaʿtu, abūʾu laka biniʿmatika ʿalayya, wa abūʾu laka bidhanbī, faghfir lī fa-innahū lā yaghfirudh-dhunūba illā anta",
                    translation:
                        "O Allah, You are my Lord. There is no god but You. You created me and I am Your slave, and I am faithful to my covenant and my promise to the best of my ability. I seek refuge with You from the evil that I have done. I acknowledge Your blessing upon me and I acknowledge my sin, so forgive me, for verily none forgives sins except You.",
                    benefit:
                        "Sayyid al-Istighfar — if said in the morning and one dies that day, one enters Paradise",
                    targetCount: 1,
                    source: "Bukhari 6306",
                },
                {
                    id: "hisn_m05",
                    arabic: "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلاَئِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لاَ إِلَهَ إِلاَّ أَنْتَ وَحْدَكَ لاَ شَرِيكَ لَكَ، وَأَنَّ مُحَمَّداً عَبْدُكَ وَرَسُولُكَ",
                    transliteration:
                        "Allāhumma innī aṣbaḥtu ushhiduka wa ushhidu ḥamalata ʿarshika wa malāʾikataka wa jamīʿa khalqika, annaka antallāhu lā ilāha illā anta waḥdaka lā sharīka lak, wa anna Muḥammadan ʿabduka wa rasūluk",
                    translation:
                        "O Allah, this morning I call You to witness, and I call upon the bearers of Your throne, Your angels, and all Your creation to witness that You are Allah, none has the right to be worshipped except You, alone, with no partner, and that Muhammad is Your slave and messenger.",
                    benefit:
                        "Said 4x — frees one quarter of oneself from the Fire",
                    targetCount: 4,
                    source: "Abu Dawud 5069",
                },
                {
                    id: "hisn_m06",
                    arabic: "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لاَ شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
                    transliteration:
                        "Allāhumma mā aṣbaḥa bī min niʿmatin aw bi-aḥadin min khalqika faminka waḥdaka lā sharīka lak, fa lakal-ḥamdu wa lakash-shukr",
                    translation:
                        "O Allah, whatever blessing I or any of Your creation have received this morning is from You alone, with no partner. So to You is all praise and to You is all thanks.",
                    benefit: "Fulfills the gratitude of the day",
                    targetCount: 1,
                    source: "Abu Dawud 5073",
                },
                {
                    id: "hisn_m07",
                    arabic: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لاَ إِلَهَ إِلاَّ أَنْتَ",
                    transliteration:
                        "Allāhumma ʿāfinī fī badanī, Allāhumma ʿāfinī fī samʿī, Allāhumma ʿāfinī fī baṣarī, lā ilāha illā ant",
                    translation:
                        "O Allah, grant me health in my body. O Allah, grant me health in my hearing. O Allah, grant me health in my sight. There is none worthy of worship except You.",
                    benefit: "Protection of body, hearing, and sight",
                    targetCount: 3,
                    source: "Abu Dawud 5090",
                },
                {
                    id: "hisn_m08",
                    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لاَ إِلَهَ إِلاَّ أَنْتَ",
                    transliteration:
                        "Allāhumma innī aʿūdhu bika minal-kufri wal-faqr, Allāhumma innī aʿūdhu bika min ʿadhābil-qabr, lā ilāha illā ant",
                    translation:
                        "O Allah, I seek refuge with You from disbelief and poverty. O Allah, I seek refuge with You from the punishment of the grave. There is none worthy of worship except You.",
                    benefit:
                        "Three-fold protection for faith, provision, and the next life",
                    targetCount: 3,
                    source: "Abu Dawud 5090",
                },
                {
                    id: "hisn_m09",
                    arabic: "حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
                    transliteration:
                        "Ḥasbiyallāhu lā ilāha illā huwa ʿalayhi tawakkaltu wa huwa rabbul-ʿarshil-ʿaẓīm",
                    translation:
                        "Allah is sufficient for me. There is no god but Him. Upon Him I have relied, and He is the Lord of the Mighty Throne.",
                    benefit:
                        "Said 7x — Allah will suffice him in all his worldly and spiritual affairs",
                    targetCount: 7,
                    source: "Abu Dawud 5081",
                },
                {
                    id: "hisn_m10",
                    arabic: "بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
                    transliteration:
                        "Bismillāhil-ladhī lā yaḍurru maʿasmihi shayʾun fil-arḍi wa lā fis-samāʾ, wa huwas-samīʿul-ʿalīm",
                    translation:
                        "In the name of Allah, with whose name nothing on earth or in the heavens can cause harm, and He is the All-Hearing, the All-Knowing.",
                    benefit:
                        "Said 3x in morning — nothing will harm him until evening; said 3x in evening — nothing will harm him until morning",
                    targetCount: 3,
                    source: "Abu Dawud 5088, Ibn Majah 3869",
                },
                {
                    id: "hisn_m11",
                    arabic: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالإِسْلاَمِ دِيناً، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
                    transliteration:
                        "Raḍītu billāhi rabbā, wa bil-Islāmi dīnā, wa bi-Muḥammadin ṣallallāhu ʿalayhi wa sallam nabiyyā",
                    translation:
                        "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad ﷺ as my Prophet.",
                    benefit:
                        "Said 3x — it is incumbent upon Allah to please him on the Day of Resurrection",
                    targetCount: 3,
                    source: "Abu Dawud 5072, Ibn Majah 3870",
                },
                {
                    id: "hisn_m12",
                    arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
                    transliteration:
                        "Yā Ḥayyu yā Qayyūm bi-raḥmatika astaghīth, aṣliḥ lī shaʾnī kullah, wa lā takilnī ilā nafsī ṭarfata ʿayn",
                    translation:
                        "O Ever-Living, O Self-Sustaining, by Your mercy I call for help. Set right all my affairs and do not leave me to myself for the blink of an eye.",
                    benefit: "The Prophet ﷺ would not omit this in the morning",
                    targetCount: 1,
                    source: "Al-Hakim 1/545, graded sahih",
                },
                {
                    id: "hisn_m13",
                    arabic: "أَصْبَحْنَا عَلَى فِطْرَةِ الإِسْلاَمِ، وَعَلَى كَلِمَةِ الإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفاً مُسْلِماً وَمَا كَانَ مِنَ الْمُشْرِكِينَ",
                    transliteration:
                        "Aṣbaḥnā ʿalā fiṭratil-Islām, wa ʿalā kalimatil-ikhlāṣ, wa ʿalā dīni nabiyyinā Muḥammadin ṣallallāhu ʿalayhi wa sallam, wa ʿalā millati abīnā Ibrāhīma ḥanīfan muslimā wa mā kāna minal-mushrikīn",
                    translation:
                        "We rise upon the fitrah of Islam, upon the word of pure monotheism, upon the religion of our Prophet Muhammad ﷺ, and upon the way of our father Ibrahim — a monotheist and a Muslim — and he was not of the polytheists.",
                    benefit: "Daily reaffirmation of faith identity",
                    targetCount: 1,
                    source: "Ahmad 15359",
                },
                {
                    id: "hisn_m14",
                    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْماً نَافِعاً، وَرِزْقاً طَيِّباً، وَعَمَلاً مُتَقَبَّلاً",
                    transliteration:
                        "Allāhumma innī asʾaluka ʿilman nāfiʿā, wa rizqan ṭayyibā, wa ʿamalan mutaqabbalā",
                    translation:
                        "O Allah, I ask You for beneficial knowledge, wholesome sustenance, and deeds that will be accepted.",
                    benefit:
                        "Morning only — three essential requests for a purposeful life",
                    targetCount: 1,
                    source: "Ibn Majah 925, graded sahih",
                },
                {
                    id: "hisn_m15",
                    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ",
                    transliteration:
                        "Subḥānallāhi wa biḥamdih, ʿadada khalqihi wa riḍā nafsih, wa zinata ʿarshih, wa midāda kalimātih",
                    translation:
                        "Glory be to Allah and praise be to Him, to the number of His creation, to His own pleasure, to the weight of His Throne, and to the ink of His words.",
                    benefit:
                        "Outweighs all other dhikr in reward — said 3x in morning",
                    targetCount: 3,
                    source: "Muslim 2726",
                },
                {
                    id: "hisn_m16",
                    arabic: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
                    transliteration:
                        "Allāhumma ṣalli wa sallim ʿalā nabiyyinā Muḥammad",
                    translation:
                        "O Allah, send Your prayers and peace upon our Prophet Muhammad.",
                    benefit:
                        "Said 10x — intercession on the Day of Resurrection",
                    targetCount: 10,
                    source: "Ahmad 18006, graded sahih by al-Arna'ut",
                },
                {
                    id: "hisn_m17",
                    arabic: "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
                    transliteration:
                        "Lā ilāha illallāhu waḥdahu lā sharīka lah, lahul-mulku wa lahul-ḥamdu wa huwa ʿalā kulli shayʾin qadīr",
                    translation:
                        "There is no deity worthy of worship except Allah alone, with no partner. To Him belongs dominion and to Him belongs all praise, and He is over all things omnipotent.",
                    benefit:
                        "Said 100x — equivalent to freeing 10 slaves, 100 good deeds written, 100 sins erased, protection from Shaytan all day",
                    targetCount: 100,
                    source: "Bukhari 3293, Muslim 2691",
                },
                {
                    id: "hisn_m18",
                    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
                    transliteration: "Subḥānallāhi wa biḥamdih",
                    translation: "Glory be to Allah and praise be to Him.",
                    benefit:
                        "Said 100x in morning — sins forgiven even if they were like the foam of the sea",
                    targetCount: 100,
                    source: "Muslim 2692",
                },
                {
                    id: "hisn_m19",
                    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
                    transliteration:
                        "Aʿūdhu bi-kalimātillāhit-tāmmāti min sharri mā khalaq",
                    translation:
                        "I seek refuge in the perfect words of Allah from the evil of what He has created.",
                    benefit: "Said 3x in evening — no harm will touch him",
                    targetCount: 3,
                    source: "Muslim 2709",
                },
                {
                    id: "hisn_m20",
                    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ",
                    transliteration:
                        "Allāhumma innī aʿūdhu bika minal-hammi wal-ḥazan, wa aʿūdhu bika minal-ʿajzi wal-kasal, wa aʿūdhu bika minal-jubni wal-bukhl, wa aʿūdhu bika min ghalabatid-dayni wa qahrir-rijāl",
                    translation:
                        "O Allah, I seek refuge in You from worry and grief, from incapacity and laziness, from cowardice and miserliness, and from the burden of debt and the subjugation of men.",
                    benefit:
                        "Comprehensive protection from worldly and psychological harm",
                    targetCount: 1,
                    source: "Bukhari 6369",
                },
                {
                    id: "hisn_m21",
                    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ",
                    transliteration:
                        "Allāhumma innī asʾalukal-ʿafwa wal-ʿāfiyata fid-dunyā wal-ākhirah",
                    translation:
                        "O Allah, I ask You for pardon and well-being in this world and the next.",
                    benefit: "The most beloved du'a the Prophet ﷺ made",
                    targetCount: 1,
                    source: "Ibn Majah 3851, graded sahih",
                },
                {
                    id: "hisn_m22",
                    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي",
                    transliteration:
                        "Allāhumma innī asʾalukal-ʿāfiyata fī dīnī wa dunyāya wa ahlī wa mālī, Allāhummasturchawrātī wa āmin rawʿātī",
                    translation:
                        "O Allah, I ask You for well-being in my religion, my worldly affairs, my family, and my wealth. O Allah, conceal my faults and calm my fears.",
                    benefit: "Comprehensive wellbeing for all aspects of life",
                    targetCount: 1,
                    source: "Abu Dawud 5074, Ibn Majah 3871",
                },
            ],
        },
        // ─── Evening ─────────────────────────────────────────────────────────────
        {
            id: "hisn_evening",
            title: "Evening Adhkar",
            titleArabic: "أذكار المساء",
            description: "Recited from Asr until Maghrib.",
            category: "evening",
            adhkar: [
                {
                    id: "hisn_e01",
                    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
                    transliteration:
                        "Amsaynā wa amsal-mulku lillāh... Rabb aʿūdhu bika min ʿadhābin fin-nār wa ʿadhābin fil-qabr",
                    translation:
                        "We have reached the evening and at this very time all sovereignty belongs to Allah. Praise be to Allah. There is no deity but Allah alone, with no partner. His is the dominion and His the praise. My Lord, I ask You for the good of this night and the good of what follows. I seek refuge in You from the evil of this night and the evil of what follows. My Lord, I seek refuge in You from laziness and the wretchedness of old age. My Lord, I seek refuge in You from torment in the Fire and punishment in the grave.",
                    benefit:
                        "Evening mirror of the morning comprehensive protection",
                    targetCount: 1,
                    source: "Muslim 2723",
                },
                {
                    id: "hisn_e02",
                    arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",
                    transliteration:
                        "Allāhumma bika amsaynā wa bika aṣbaḥnā wa bika naḥyā wa bika namūtu wa ilaykal-maṣīr",
                    translation:
                        "O Allah, by You we enter the evening, by You we enter the morning. By You we live and by You we die, and to You is the return.",
                    benefit:
                        "Acknowledging Allah's control over life and death at day's end",
                    targetCount: 1,
                    source: "Tirmidhi 3391",
                },
                {
                    id: "hisn_e03",
                    arabic: "اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لاَ شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
                    transliteration:
                        "Allāhumma mā amsā bī min niʿmatin aw bi-aḥadin min khalqika faminka waḥdaka lā sharīka lak, fa lakal-ḥamdu wa lakash-shukr",
                    translation:
                        "O Allah, whatever blessing I or any of Your creation have received this evening is from You alone, with no partner. To You is all praise and to You is all thanks.",
                    benefit: "Fulfillment of gratitude for the day",
                    targetCount: 1,
                    source: "Abu Dawud 5073",
                },
                {
                    id: "hisn_e04",
                    arabic: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ",
                    transliteration:
                        "Allāhumma anta rabbī lā ilāha illā anta, khalaqtanī wa anā ʿabduk... faghfir lī fa-innahū lā yaghfirudh-dhunūba illā ant",
                    translation:
                        "O Allah, You are my Lord. There is no deity but You. You created me and I am Your slave... Forgive me, for verily none forgives sins except You.",
                    benefit:
                        "Sayyid al-Istighfar — if said in evening and one dies that night, one enters Paradise",
                    targetCount: 1,
                    source: "Bukhari 6306",
                },
                {
                    id: "hisn_e05",
                    arabic: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لاَ إِلَهَ إِلاَّ أَنْتَ",
                    transliteration:
                        "Allāhumma ʿāfinī fī badanī, Allāhumma ʿāfinī fī samʿī, Allāhumma ʿāfinī fī baṣarī, lā ilāha illā ant",
                    translation:
                        "O Allah, grant me health in my body, in my hearing, in my sight. There is none worthy of worship except You.",
                    benefit: "Protection of body, hearing, and sight",
                    targetCount: 3,
                    source: "Abu Dawud 5090",
                },
                {
                    id: "hisn_e06",
                    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لاَ إِلَهَ إِلاَّ أَنْتَ",
                    transliteration:
                        "Allāhumma innī aʿūdhu bika minal-kufri wal-faqr, Allāhumma innī aʿūdhu bika min ʿadhābil-qabr, lā ilāha illā ant",
                    translation:
                        "O Allah, I seek refuge in You from disbelief and poverty, and from the punishment of the grave. There is none worthy of worship except You.",
                    benefit:
                        "Evening protection of faith and worldly condition",
                    targetCount: 3,
                    source: "Abu Dawud 5090",
                },
                {
                    id: "hisn_e07",
                    arabic: "بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
                    transliteration:
                        "Bismillāhil-ladhī lā yaḍurru maʿasmihi shayʾun fil-arḍi wa lā fis-samāʾ, wa huwas-samīʿul-ʿalīm",
                    translation:
                        "In the name of Allah, with whose name nothing on earth or in the heavens can cause harm, and He is the All-Hearing, the All-Knowing.",
                    benefit: "Said 3x — nothing will harm him until morning",
                    targetCount: 3,
                    source: "Abu Dawud 5088",
                },
                {
                    id: "hisn_e08",
                    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
                    transliteration:
                        "Aʿūdhu bi-kalimātillāhit-tāmmāti min sharri mā khalaq",
                    translation:
                        "I seek refuge in the complete words of Allah from the evil of what He has created.",
                    benefit: "Evening protection from all created things",
                    targetCount: 3,
                    source: "Muslim 2709",
                },
                {
                    id: "hisn_e09",
                    arabic: "حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
                    transliteration:
                        "Ḥasbiyallāhu lā ilāha illā huwa ʿalayhi tawakkaltu wa huwa rabbul-ʿarshil-ʿaẓīm",
                    translation:
                        "Allah is sufficient for me. There is no god but Him. Upon Him I have relied, and He is Lord of the Mighty Throne.",
                    benefit:
                        "Said 7x evening — Allah suffices him in all affairs",
                    targetCount: 7,
                    source: "Abu Dawud 5081",
                },
                {
                    id: "hisn_e10",
                    arabic: "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
                    transliteration:
                        "Lā ilāha illallāhu waḥdahu lā sharīka lah, lahul-mulku wa lahul-ḥamdu wa huwa ʿalā kulli shayʾin qadīr",
                    translation:
                        "There is no deity worthy of worship except Allah alone, with no partner. To Him belongs dominion and to Him belongs all praise, and He is over all things omnipotent.",
                    benefit: "Said 100x evening — the reward of freeing slaves",
                    targetCount: 100,
                    source: "Muslim 2691",
                },
                {
                    id: "hisn_e11",
                    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
                    transliteration: "Subḥānallāhi wa biḥamdih",
                    translation: "Glory be to Allah and praise be to Him.",
                    benefit:
                        "Said 100x evening — sins forgiven even if like the foam of the sea",
                    targetCount: 100,
                    source: "Muslim 2692",
                },
                {
                    id: "hisn_e12",
                    arabic: "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلاَئِكَتَكَ وَجَمِيعَ خَلْقِكَ أَنَّكَ أَنْتَ اللَّهُ لاَ إِلَهَ إِلاَّ أَنْتَ وَحْدَكَ لاَ شَرِيكَ لَكَ وَأَنَّ مُحَمَّداً عَبْدُكَ وَرَسُولُكَ",
                    transliteration:
                        "Allāhumma innī amsaytu ushhiduka... anna Muḥammadan ʿabduka wa rasūluk",
                    translation:
                        "O Allah, this evening I call You to witness, and the bearers of Your throne, Your angels, and all Your creation: that You are Allah, none worthy of worship but You, and that Muhammad is Your slave and messenger.",
                    benefit:
                        "Said 4x evening — frees one quarter from the Fire",
                    targetCount: 4,
                    source: "Abu Dawud 5069",
                },
            ],
        },
        // ─── Morning (Seen-Arabic DB) ────────────────────────────────────────────
        {
            id: "hisn_morning_seen",
            title: "Morning Adhkar (Full Collection)",
            titleArabic: "أذكار الصباح — المجموعة الكاملة",
            description:
                "Full morning adhkar dataset from the Seen-Arabic open database.",
            category: "morning",
            adhkar: seenToBookItems(SEEN_MORNING_ADHKAR),
        },
        // ─── Evening (Seen-Arabic DB) ─────────────────────────────────────────────
        {
            id: "hisn_evening_seen",
            title: "Evening Adhkar (Full Collection)",
            titleArabic: "أذكار المساء — المجموعة الكاملة",
            description:
                "Full evening adhkar dataset from the Seen-Arabic open database.",
            category: "evening",
            adhkar: seenToBookItems(SEEN_EVENING_ADHKAR),
        },
        // ─── After Prayer ─────────────────────────────────────────────────────────
        {
            id: "hisn_after_prayer",
            title: "Post-Prayer Adhkar",
            titleArabic: "أذكار بعد الصلاة",
            description: "Recited immediately after the obligatory prayers.",
            category: "after-prayer",
            adhkar: [
                {
                    id: "hisn_ap01",
                    arabic: "أَسْتَغْفِرُ اللَّهَ",
                    transliteration: "Astaghfirullāh",
                    translation: "I seek forgiveness from Allah.",
                    benefit: "Said 3x immediately after Taslim",
                    targetCount: 3,
                    source: "Muslim 591",
                },
                {
                    id: "hisn_ap02",
                    arabic: "اللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَمُ، تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ",
                    transliteration:
                        "Allāhumma antas-salām wa minkas-salām, tabārakta yā dhal-jalāli wal-ikrām",
                    translation:
                        "O Allah, You are Peace and from You is peace. Blessed are You, O Possessor of majesty and honor.",
                    benefit: "Closing words after prayer before rising",
                    targetCount: 1,
                    source: "Muslim 591",
                },
                {
                    id: "hisn_ap03",
                    arabic: "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لاَ مَانِعَ لِمَا أَعْطَيْتَ وَلاَ مُعْطِيَ لِمَا مَنَعْتَ وَلاَ يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ",
                    transliteration:
                        "Lā ilāha illallāhu waḥdahu lā sharīka lah... wa lā yanfaʿu dhal-jaddi minkal-jadd",
                    translation:
                        "There is no deity but Allah, alone, with no partner. His is the dominion and His the praise, and He is over all things omnipotent. O Allah, none can withhold what You bestow, none can bestow what You withhold, and no wealth or might can benefit anyone against You.",
                    benefit: "Comprehensive post-prayer dhikr",
                    targetCount: 1,
                    source: "Bukhari 844, Muslim 593",
                },
                {
                    id: "hisn_ap04",
                    arabic: "سُبْحَانَ اللَّهِ",
                    transliteration: "Subḥānallāh",
                    translation: "Glory be to Allah.",
                    benefit: "33x after every prayer",
                    targetCount: 33,
                    source: "Muslim 597",
                },
                {
                    id: "hisn_ap05",
                    arabic: "الْحَمْدُ لِلَّهِ",
                    transliteration: "Alḥamdulillāh",
                    translation: "Praise be to Allah.",
                    benefit: "33x after every prayer",
                    targetCount: 33,
                    source: "Muslim 597",
                },
                {
                    id: "hisn_ap06",
                    arabic: "اللَّهُ أَكْبَرُ",
                    transliteration: "Allāhu Akbar",
                    translation: "Allah is the Greatest.",
                    benefit:
                        "33x after every prayer, completing 99 with La ilaha illallah",
                    targetCount: 33,
                    source: "Muslim 597",
                },
                {
                    id: "hisn_ap07",
                    arabic: "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
                    transliteration:
                        "Lā ilāha illallāhu waḥdahu lā sharīka lah, lahul-mulku wa lahul-ḥamdu wa huwa ʿalā kulli shayʾin qadīr",
                    translation:
                        "None has the right to be worshipped except Allah, alone, with no partner. His is the dominion and His the praise, and He is over all things omnipotent.",
                    benefit:
                        "Completing the 100 — sins forgiven even if like sea foam",
                    targetCount: 1,
                    source: "Muslim 597",
                },
                {
                    id: "hisn_ap08",
                    arabic: "اللَّهُمَّ لاَ إِلَهَ إِلاَّ أَنْتَ سُبْحَانَكَ أَسْتَغْفِرُكَ لِذَنْبِي وَأَسْأَلُكَ رَحْمَتَكَ، اللَّهُمَّ زِدْنِي عِلْماً وَلاَ تُزِغْ قَلْبِي بَعْدَ إِذْ هَدَيْتَنِي وَهَبْ لِي مِنْ لَدُنْكَ رَحْمَةً إِنَّكَ أَنْتَ الْوَهَّابُ",
                    transliteration:
                        "Allāhumma lā ilāha illā anta subḥānaka astaghfiruka lidhanbī wa asʾaluka raḥmatak... innaka antal-wahhāb",
                    translation:
                        "O Allah, there is no deity except You, glory be to You. I seek Your forgiveness for my sin, I ask You for Your mercy. O Allah, increase me in knowledge; do not cause my heart to deviate after You have guided me, and grant me mercy from Yourself — You are the Bestower.",
                    benefit:
                        "A comprehensive post-prayer supplication for guidance and mercy",
                    targetCount: 1,
                    source: "Tirmidhi 3334",
                },
                {
                    id: "hisn_ap09",
                    arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
                    transliteration:
                        "Allāhumma aʿinnī ʿalā dhikrika wa shukrika wa ḥusni ʿibādatik",
                    translation:
                        "O Allah, help me to remember You, to thank You, and to worship You in the best manner.",
                    benefit:
                        "The Prophet ﷺ commanded Mu'adh to say this after every prayer",
                    targetCount: 1,
                    source: "Abu Dawud 1522, Ahmad — hasan sahih",
                },
                {
                    id: "hisn_ap10",
                    arabic: "آيَةُ الْكُرْسِيِّ: اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ...",
                    transliteration:
                        "Āyat al-Kursī: Allāhu lā ilāha illā huwal-ḥayyul-qayyūm...",
                    translation:
                        "Verse of the Throne (Surah 2:255): Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep...",
                    benefit:
                        "Whoever recites this after every obligatory prayer — nothing will prevent him from entering Paradise except death",
                    targetCount: 1,
                    source: "Al-Nasa'i (al-Kubra) 9928, graded sahih by al-Albani",
                },
            ],
        },
        // ─── Before Sleep ─────────────────────────────────────────────────────────
        {
            id: "hisn_sleep",
            title: "Before Sleep",
            titleArabic: "أذكار النوم",
            description: "Recited before lying down to sleep.",
            category: "sleep",
            adhkar: [
                {
                    id: "hisn_sl01",
                    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
                    transliteration: "Bismika Allāhumma amūtu wa aḥyā",
                    translation: "In Your name, O Allah, I die and I live.",
                    benefit:
                        "First dhikr before sleep — entrusting oneself to Allah",
                    targetCount: 1,
                    source: "Bukhari 6324",
                },
                {
                    id: "hisn_sl02",
                    arabic: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
                    transliteration:
                        "Allāhumma qinī ʿadhābaka yawma tabʿathu ʿibādak",
                    translation:
                        "O Allah, protect me from Your punishment on the Day You resurrect Your slaves.",
                    benefit: "Said 3x before sleep",
                    targetCount: 3,
                    source: "Abu Dawud 5045",
                },
                {
                    id: "hisn_sl03",
                    arabic: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ",
                    transliteration:
                        "Bismika rabbī waḍaʿtu janbī wa bika arfaʿuh, fa-in amsakta nafsī farḥamhā, wa in arsaltahā faḥfaẓhā bimā taḥfaẓu bihi ʿibādakaṣ-ṣāliḥīn",
                    translation:
                        "In Your name, my Lord, I lay down my side, and by You I raise it. If You take my soul, have mercy on it, and if You release it, protect it with that which You protect Your righteous servants.",
                    benefit:
                        "Comprehensive sleep du'a — acknowledged by the Prophet ﷺ as complete",
                    targetCount: 1,
                    source: "Bukhari 6320, Muslim 2714",
                },
                {
                    id: "hisn_sl04",
                    arabic: "اللَّهُمَّ إِنَّكَ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا، إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا، وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ",
                    transliteration:
                        "Allāhumma innaka khalaqta nafsī wa anta tawaffāhā, laka mamātuhā wa maḥyāhā, in aḥyaytahā faḥfaẓhā, wa in amattahā faghfir lahā. Allāhumma innī asʾalukal-ʿāfiyah",
                    translation:
                        "O Allah, You have created my soul and You will take it. To You belongs its death and its life. If You give it life, protect it, and if You cause it to die, forgive it. O Allah, I ask You for wellbeing.",
                    benefit:
                        "Profound acknowledgment of life and death before sleep",
                    targetCount: 1,
                    source: "Muslim 2712",
                },
                {
                    id: "hisn_sl05",
                    arabic: "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَاللَّهُ أَكْبَرُ",
                    transliteration:
                        "Subḥānallāh wal-ḥamdulillāh wallāhu akbar",
                    translation:
                        "Glory be to Allah, praise be to Allah, and Allah is the Greatest.",
                    benefit:
                        "Subhanallah 33x, Alhamdulillah 33x, Allahu Akbar 34x — better than a servant for your needs",
                    targetCount: 33,
                    source: "Bukhari 5361, Muslim 2727",
                },
                {
                    id: "hisn_sl06",
                    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ وَالْمُعَوِّذَتَانِ",
                    transliteration: "Qul Huwa Allāhu Aḥad, wal-muʿawwidhatān",
                    translation:
                        "Surah Al-Ikhlas, Al-Falaq, and An-Nas — each blown into cupped hands and wiped over the body starting from the head.",
                    benefit:
                        "Prophet ﷺ did this every night before sleep — sufficient protection from every harm",
                    targetCount: 3,
                    source: "Bukhari 5017, Abu Dawud 5056",
                },
            ],
        },
        // ─── General ────────────────────────────────────────────────────────────
        {
            id: "hisn_general",
            title: "General Adhkar",
            titleArabic: "الأذكار العامة",
            description: "Dhikr recited at any time.",
            category: "general",
            adhkar: [
                {
                    id: "hisn_g01",
                    arabic: "لاَ إِلَهَ إِلاَّ اللَّهُ",
                    transliteration: "Lā ilāha illallāh",
                    translation:
                        "There is no deity worthy of worship except Allah.",
                    benefit:
                        "The best of dhikr — the Prophet ﷺ said it is the best thing he and the Prophets before him ever said",
                    targetCount: 100,
                    source: "Tirmidhi 3553",
                },
                {
                    id: "hisn_g02",
                    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ",
                    transliteration:
                        "Subḥānallāhi wa biḥamdihī subḥānallāhil-ʿaẓīm",
                    translation:
                        "Glory be to Allah and praise Him; glory be to Allah the Magnificent.",
                    benefit:
                        "Two phrases beloved to the Most Merciful — light on the tongue, heavy on the scale",
                    targetCount: 100,
                    source: "Bukhari 6682",
                },
                {
                    id: "hisn_g03",
                    arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
                    transliteration: "Astaghfirullāha wa atūbu ilayh",
                    translation:
                        "I seek forgiveness from Allah and repent to Him.",
                    benefit:
                        "Prophet ﷺ sought forgiveness more than 70 times a day",
                    targetCount: 100,
                    source: "Bukhari 6307",
                },
                {
                    id: "hisn_g04",
                    arabic: "لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ",
                    transliteration: "Lā ḥawla wa lā quwwata illā billāh",
                    translation:
                        "There is no power and no strength except through Allah.",
                    benefit:
                        "One of the treasures of Paradise — cure from 99 ailments including worry",
                    targetCount: 100,
                    source: "Bukhari 7386, Muslim 2704",
                },
                {
                    id: "hisn_g05",
                    arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
                    transliteration: "Allāhumma ṣalli ʿalā Muḥammad",
                    translation: "O Allah, send Your blessings upon Muhammad.",
                    benefit:
                        "Allah sends 10 blessings upon the one who sends one blessing on the Prophet ﷺ",
                    targetCount: 100,
                    source: "Muslim 408",
                },
            ],
        },
    ],
};
