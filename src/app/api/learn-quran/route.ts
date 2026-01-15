import { NextResponse } from 'next/server';

// We interact with the Quran.com API structure where possible/relevant
// but for the Qaida curriculum, we structure the "Lesson" data explicitly here
// to ensure the "Order of Learning" is correct (Alphabet -> Rules).

const CURRICULUM_DATA = {
    "curriculum": {
        "title": "Noorani Qaida",
        "provider": "Powered by Quran.com API",
        "lessons": [
            {
                "id": 1,
                "title": "The Alphabet (Hijaiyah)",
                "description": "The foundation of reading the Quran. Every letter must be pronounced from its correct point of articulation (Makhraj).",
                "audioBase": "https://raw.githubusercontent.com/adnan/Arabic-Alphabet/master/sounds/",
                "items": [
                    { "id": "alif", "text": "ا", "name": "Alif", "audio": "1_alif.mp3" },
                    { "id": "val", "text": "ب", "name": "Ba", "audio": "2_baa.mp3" },
                    { "id": "ta", "text": "ت", "name": "Ta", "audio": "3_taa.mp3" },
                    { "id": "tha", "text": "ث", "name": "Tha", "audio": "4_thaa.mp3" },
                    { "id": "jim", "text": "ج", "name": "Jim", "audio": "5_jeem.mp3" },
                    { "id": "ha", "text": "ح", "name": "Ha", "audio": "6_haa.mp3" },
                    { "id": "kha", "text": "خ", "name": "Kha", "audio": "7_khaa.mp3" },
                    { "id": "dal", "text": "د", "name": "Dal", "audio": "8_daal.mp3" },
                    { "id": "dhal", "text": "ذ", "name": "Dhal", "audio": "9_zaal.mp3" },
                    { "id": "ra", "text": "ر", "name": "Ra", "audio": "10_raa.mp3" },
                    { "id": "za", "text": "ز", "name": "Za", "audio": "11_zaa.mp3" },
                    { "id": "seen", "text": "س", "name": "Seen", "audio": "12_seen.mp3" },
                    { "id": "sheen", "text": "ش", "name": "Sheen", "audio": "13_sheen.mp3" },
                    { "id": "sad", "text": "ص", "name": "Sad", "audio": "14_saad.mp3" },
                    { "id": "dad", "text": "ض", "name": "Dad", "audio": "15_daad.mp3" },
                    { "id": "tah", "text": "ط", "name": "Tah", "audio": "16_taah.mp3" },
                    { "id": "zah", "text": "ظ", "name": "Zah", "audio": "17_zhaa.mp3" },
                    { "id": "ain", "text": "ع", "name": "Ain", "audio": "18_ain.mp3" },
                    { "id": "ghain", "text": "غ", "name": "Ghain", "audio": "19_ghain.mp3" },
                    { "id": "fa", "text": "ف", "name": "Fa", "audio": "20_faa.mp3" },
                    { "id": "qaf", "text": "ق", "name": "Qaf", "audio": "21_qaaf.mp3" },
                    { "id": "kaf", "text": "ك", "name": "Kaf", "audio": "22_kaaf.mp3" },
                    { "id": "lam", "text": "ل", "name": "Lam", "audio": "23_laam.mp3" },
                    { "id": "meem", "text": "م", "name": "Meem", "audio": "24_meem.mp3" },
                    { "id": "noon", "text": "ن", "name": "Noon", "audio": "25_noon.mp3" },
                    { "id": "waw", "text": "و", "name": "Waw", "audio": "27_waw.mp3" },
                    { "id": "ha-soft", "text": "ه", "name": "Ha", "audio": "26_haah.mp3" },
                    { "id": "hamza", "text": "ء", "name": "Hamza", "audio": "28_hamzah.mp3" },
                    { "id": "ya", "text": "ي", "name": "Ya", "audio": "30_yaa.mp3" }
                ]
            },
            {
                "id": 2,
                "title": "Joint Letters (Murakkabat)",
                "description": "In this lesson we will learn how the words are formed by joining alphabets. Have your students identify every alphabet in a word e.g. (لا) is actually (ل+ا). We will also learn the different shapes of particular letters, e.g. (لا).",
                "audioBase": "https://data.qurancentral.com/features/learn-quran/audio/lesson02/",
                "items": [
                    { "id": "1", "text": "ا", "name": "Alif", "audio": "L02-01.mp3" },
                    { "id": "2", "text": "لا", "name": "Lam Alif", "audio": "L02-02.mp3" },
                    { "id": "3", "text": "لا", "name": "Lam Alif", "audio": "L02-03.mp3" },
                    { "id": "4", "text": "بَا", "name": "Ba Alif", "audio": "L02-04.mp3" },
                    { "id": "5", "text": "لا", "name": "Lam Alif", "audio": "L02-05.mp3" },
                    { "id": "6", "text": "ل", "name": "Lam", "audio": "L02-06.mp3" },
                    { "id": "7", "text": "لا", "name": "Lam Alif", "audio": "L02-07.mp3" },
                    { "id": "8", "text": "لح", "name": "Lam Ha", "audio": "L02-08.mp3" },
                    { "id": "9", "text": "لا", "name": "Lam Alif", "audio": "L02-09.mp3" },
                    { "id": "10", "text": "بلب", "name": "Ba Lam Ba", "audio": "L02-10.mp3" },
                    { "id": "11", "text": "ك", "name": "Kaf", "audio": "L02-11.mp3" },
                    { "id": "12", "text": "ك", "name": "Kaf", "audio": "L02-12.mp3" },
                    { "id": "13", "text": "كب", "name": "Kaf Ba", "audio": "L02-13.mp3" },
                    { "id": "14", "text": "كب", "name": "Kaf Ba", "audio": "L02-14.mp3" },
                    { "id": "15", "text": "كا", "name": "Kaf Alif", "audio": "L02-15.mp3" },
                    { "id": "16", "text": "كا", "name": "Kaf Alif", "audio": "L02-16.mp3" },
                    { "id": "17", "text": "بكت", "name": "Ba Kaf Ta", "audio": "L02-17.mp3" },
                    { "id": "18", "text": "تكث", "name": "Ta Kaf Tha", "audio": "L02-18.mp3" },
                    { "id": "19", "text": "ب", "name": "Ba", "audio": "L02-19.mp3" },
                    { "id": "20", "text": "ت", "name": "Ta", "audio": "L02-20.mp3" },
                    { "id": "21", "text": "ث", "name": "Tha", "audio": "L02-21.mp3" },
                    { "id": "22", "text": "ن", "name": "Noon", "audio": "L02-22.mp3" },
                    { "id": "23", "text": "ي", "name": "Ya", "audio": "L02-23.mp3" },
                    { "id": "24", "text": "با", "name": "Ba Alif", "audio": "L02-24.mp3" },
                    { "id": "25", "text": "نا", "name": "Noon Alif", "audio": "L02-25.mp3" },
                    { "id": "26", "text": "تا", "name": "Ta Alif", "audio": "L02-26.mp3" },
                    { "id": "27", "text": "يا", "name": "Ya Alif", "audio": "L02-27.mp3" },
                    { "id": "28", "text": "ثا", "name": "Tha Alif", "audio": "L02-28.mp3" },
                    { "id": "29", "text": "بس", "name": "Ba Seen", "audio": "L02-29.mp3" },
                    { "id": "30", "text": "يس", "name": "Ya Seen", "audio": "L02-30.mp3" },
                    { "id": "31", "text": "نس", "name": "Noon Seen", "audio": "L02-31.mp3" },
                    { "id": "32", "text": "نخ", "name": "Noon Kha", "audio": "L02-32.mp3" },
                    { "id": "33", "text": "نم", "name": "Noon Meem", "audio": "L02-33.mp3" },
                    { "id": "34", "text": "ني", "name": "Noon Ya", "audio": "L02-34.mp3" },
                    { "id": "35", "text": "بيل", "name": "Ba Ya Lam", "audio": "L02-35.mp3" },
                    { "id": "36", "text": "تين", "name": "Ta Ya Noon", "audio": "L02-36.mp3" },
                    { "id": "37", "text": "نثن", "name": "Noon Tha Noon", "audio": "L02-37.mp3" },
                    { "id": "38", "text": "غر", "name": "Ghayn Ra", "audio": "L02-38.mp3" },
                    { "id": "39", "text": "يف", "name": "Ya Fa", "audio": "L02-39.mp3" },
                    { "id": "40", "text": "و", "name": "Waw", "audio": "L02-40.mp3" },
                    { "id": "41", "text": "أ", "name": "Alif Hamza", "audio": "L02-41.mp3" },
                    { "id": "42", "text": "يجب", "name": "Ya Jeem Ba", "audio": "L02-42.mp3" },
                    { "id": "43", "text": "يه", "name": "Ya Ha", "audio": "L02-43.mp3" },
                    { "id": "44", "text": "بها", "name": "Ba Ha Alif", "audio": "L02-44.mp3" },
                    { "id": "45", "text": "خذ", "name": "Kha Dhal", "audio": "L02-45.mp3" },
                    { "id": "46", "text": "ر", "name": "Ra", "audio": "L02-46.mp3" },
                    { "id": "47", "text": "ش", "name": "Sheen", "audio": "L02-47.mp3" },
                    { "id": "48", "text": "ط", "name": "Ta", "audio": "L02-48.mp3" },
                    { "id": "49", "text": "ظا", "name": "Za Alif", "audio": "L02-49.mp3" },
                    { "id": "50", "text": "تس", "name": "Ta Seen", "audio": "L02-50.mp3" },
                    { "id": "51", "text": "يح", "name": "Ya Ha", "audio": "L02-51.mp3" },
                    { "id": "52", "text": "تم", "name": "Ta Meem", "audio": "L02-52.mp3" },
                    { "id": "53", "text": "تي", "name": "Ta Ya", "audio": "L02-53.mp3" },
                    { "id": "54", "text": "يتل", "name": "Ya Ta Lam", "audio": "L02-54.mp3" },
                    { "id": "55", "text": "يتن", "name": "Ya Ta Noon", "audio": "L02-55.mp3" },
                    { "id": "56", "text": "حث", "name": "Ha Tha", "audio": "L02-56.mp3" },
                    { "id": "57", "text": "صح", "name": "Sad Ha" },
                    { "id": "58", "text": "مر", "name": "Meem Ra" },
                    { "id": "59", "text": "تم", "name": "Ta Meem", "audio": "L02-59.mp3" },
                    { "id": "60", "text": "قو", "name": "Qaf Waw", "audio": "L02-60.mp3" }
                ]
            },
            {
                "id": 3,
                "title": "Muqatta'at (Disjointed Letters)",
                "description": "Unique letter combinations found at the beginning of certain Surahs. They are read by their letter names, not phonetic sounds.",
                "items": [
                    { "text": "الم", "name": "Alif Lam Meem" },
                    { "text": "المص", "name": "Alif Lam Meem Sad" },
                    { "text": "الر", "name": "Alif Lam Ra" },
                    { "text": "كهيعص", "name": "Kaf Ha Ya Ain Sad" },
                    { "text": "طه", "name": "Ta Ha" },
                    { "text": "طسم", "name": "Ta Seen Meem" },
                    { "text": "يس", "name": "Ya Seen" },
                    { "text": "حم", "name": "Ha Meem" },
                    { "text": "ق", "name": "Qaf" },
                    { "text": "ن", "name": "Noon" }
                ]
            },
            {
                "id": 4,
                "title": "Harakat (Short Vowels)",
                "description": "Introduction to Fatha (Zabar), Kasra (Zer), and Damma (Pesh). These determine the short vowel sounds: 'a', 'i', 'u'.",
                "items": [
                    { "text": "اَ", "name": "Hamza Fatha" },
                    { "text": "اِ", "name": "Hamza Kasra" },
                    { "text": "اُ", "name": "Hamza Damma" },
                    { "text": "بَ", "name": "Ba Fatha" },
                    { "text": "بِ", "name": "Ba Kasra" },
                    { "text": "بُ", "name": "Ba Damma" },
                    { "text": "تَ", "name": "Ta Fatha" },
                    { "text": "تِ", "name": "Ta Kasra" },
                    { "text": "تُ", "name": "Ta Damma" },
                    { "text": "جَ", "name": "Jim Fatha" },
                    { "text": "جِ", "name": "Jim Kasra" },
                    { "text": "جُ", "name": "Jim Damma" }
                ]
            },
            {
                "id": 5,
                "title": "Tanween (Double Vowels)",
                "description": "Double Fatha, Double Kasra, and Double Damma. These add an 'n' sound to the end of the letter (an, in, un).",
                "items": [
                    { "text": "اً", "name": "Alif Two Fathas" },
                    { "text": "ٍ", "name": "Two Kasras" },
                    { "text": "ٌ", "name": "Two Dammas" },
                    { "text": "بًا", "name": "Ba Two Fathas" },
                    { "text": "بٍ", "name": "Ba Two Kasras" },
                    { "text": "بٌ", "name": "Ba Two Dammas" },
                    { "text": "تًا", "name": "Ta Two Fathas" },
                    { "text": "تٍ", "name": "Ta Two Kasras" },
                    { "text": "تٌ", "name": "Ta Two Dammas" }
                ]
            },
            {
                "id": 6,
                "title": "Tanween & Harakat Practice",
                "description": "Practice combining single and double vowels to form simple words.",
                "items": [
                    { "text": "اَبَدًا", "name": "Abadan" },
                    { "text": "اَحَدٌ", "name": "Ahadun" },
                    { "text": "اَخَذَ", "name": "Akhadha" },
                    { "text": "اَذِنَ", "name": "Adhina" },
                    { "text": "اَمَرَ", "name": "Amara" },
                    { "text": "اَنَا", "name": "Ana" },
                    { "text": "بَخِلَ", "name": "Bakhila" },
                    { "text": "بَرَرَةٍ", "name": "Bararatin" },
                    { "text": "جَعَلَ", "name": "Ja'ala" },
                    { "text": "جَمَعَ", "name": "Jama'a" }
                ]
            },
            {
                "id": 7,
                "title": "Standing Vowels (Harakat)",
                "description": "Standing Fatha, Standing Kasra, and Inverted Damma. These are prolonged sounds (usually 2 counts).",
                "items": [
                    { "text": "بٰ", "name": "Ba Standing Fatha" },
                    { "text": "يٰ", "name": "Ya Standing Fatha" },
                    { "text": "رٰ", "name": "Ra Standing Fatha" },
                    { "text": "مٰ", "name": "Meem Standing Fatha" },
                    { "text": "لٰ", "name": "Lam Standing Fatha" },
                    { "text": "وٰ", "name": "Waw Standing Fatha" },
                    { "text": "نٰ", "name": "Noon Standing Fatha" },
                    { "text": "ءٰ", "name": "Hamza Standing Fatha" },
                    { "text": "هٰ", "name": "Ha Standing Fatha" }
                ]
            },
            {
                "id": 8,
                "title": "Madd and Leen",
                "description": "The letters of Madd (Alif, Waw, Ya) elongate the sound. Leen letters (Waw and Ya with Fatha before them) are soft.",
                "items": [
                    { "text": "بَا", "name": "Ba Alif Madd" },
                    { "text": "بُو", "name": "Ba Waw Madd" },
                    { "text": "بِي", "name": "Ba Ya Madd" },
                    { "text": "تَا", "name": "Ta Alif Madd" },
                    { "text": "تُو", "name": "Ta Waw Madd" },
                    { "text": "تِي", "name": "Ta Ya Madd" },
                    { "text": "اَو", "name": "Alif Waw Leen" },
                    { "text": "اَي", "name": "Alif Ya Leen" },
                    { "text": "بَو", "name": "Ba Waw Leen" },
                    { "text": "بَي", "name": "Ba Ya Leen" }
                ]
            },
            {
                "id": 9,
                "title": "Madd Practice",
                "description": "Reading exercises focusing on the elongation of vowels.",
                "items": [
                    { "text": "قَالَ", "name": "Qala" },
                    { "text": "يَقُولُ", "name": "Yaqulu" },
                    { "text": "قِيلَ", "name": "Qila" },
                    { "text": "كَانَ", "name": "Kana" },
                    { "text": "يَكُونُ", "name": "Yakunu" },
                    { "text": "نُوحِيهَا", "name": "Nuhiha" },
                    { "text": "اُوذِينَا", "name": "Udhina" },
                    { "text": "اُوتِينَا", "name": "Utina" }
                ]
            },
            {
                "id": 10,
                "title": "Sukoon (Jazm)",
                "description": "The Sukoon symbol (o or <) indicates that a letter has no vowel and ends the sound of the previous letter.",
                "items": [
                    { "text": "اَبْ", "name": "Ab" },
                    { "text": "اَتْ", "name": "At" },
                    { "text": "اَثْ", "name": "Ath" },
                    { "text": "اَجْ", "name": "Aj" },
                    { "text": "اَحْ", "name": "Ah" },
                    { "text": "اَخْ", "name": "Akh" },
                    { "text": "اَدْ", "name": "Ad" },
                    { "text": "اَذْ", "name": "Adh" },
                    { "text": "اَرْ", "name": "Ar" },
                    { "text": "اَزْ", "name": "Az" }
                ]
            },
            {
                "id": 11,
                "title": "Sukoon Practice",
                "description": "More complex words using Sukoon.",
                "items": [
                    { "text": "تَسْعٰی", "name": "Tas'a" },
                    { "text": "يَخْشٰی", "name": "Yakhsha" },
                    { "text": "نَقْعًا", "name": "Naq'an" },
                    { "text": "يُبْدِئُ", "name": "Yubdi'u" },
                    { "text": "يُعِدُ", "name": "Yu'idu" },
                    { "text": "اَبْقٰی", "name": "Abqa" },
                    { "text": "تَجْرِي", "name": "Tajri" }
                ]
            },
            {
                "id": 12,
                "title": "Tashdeed (Shaddah)",
                "description": "The Tashdeed symbol (w) doubles the letter. It is pronounced with emphasis.",
                "items": [
                    { "text": "اَبَّ", "name": "Abba" },
                    { "text": "اَبِّ", "name": "Abbi" },
                    { "text": "اَبُّ", "name": "Abbu" },
                    { "text": "اَتَّ", "name": "Atta" },
                    { "text": "اَتِّ", "name": "Atti" },
                    { "text": "اَتُّ", "name": "Attu" },
                    { "text": "اَثَّ", "name": "Aththa" },
                    { "text": "اَثِّ", "name": "Aththi" },
                    { "text": "اَثُّ", "name": "Aththu" }
                ]
            },
            {
                "id": 13,
                "title": "Tashdeed Practice",
                "description": "Words containing Tashdeed for practice.",
                "items": [
                    { "text": "قَدَّرَ", "name": "Qaddara" },
                    { "text": "كَذَّبَ", "name": "Kadhdhaba" },
                    { "text": "نَعَّمَ", "name": "Na''ama" },
                    { "text": "يَظُنُّ", "name": "Yazunnu" },
                    { "text": "يَحُضُّ", "name": "Yahuddu" },
                    { "text": "مُمَدَّدَةٍ", "name": "Mumaddadatin" },
                    { "text": "جَنَّةٍ", "name": "Jannatin" }
                ]
            },
            {
                "id": 14,
                "title": "Tashdeed with Sukoon",
                "description": "Combinations where a Tashdeed is followed by or follows a Sukoon.",
                "items": [
                    { "text": "يَزَّكّٰی", "name": "Yazzakka" },
                    { "text": "يَذَّكَّرُ", "name": "Yadhdhakkaru" },
                    { "text": "يَدَّبَّرُ", "name": "Yaddabbaru" },
                    { "text": "اَلْمُدَّثِّرُ", "name": "Al-Muddaththiru" },
                    { "text": "اَلْمُزَّمِّلُ", "name": "Al-Muzzammilu" }
                ]
            },
            {
                "id": 15,
                "title": "Tashdeed with Tashdeed",
                "description": "Multiple Tashdeeds in sequence.",
                "items": [
                    { "text": "يَغُّ", "name": "Yagghu" },
                    { "text": "اِلَّا", "name": "Illa" },
                    { "text": "اِنَّ", "name": "Inna" },
                    { "text": "اَنَّ", "name": "Anna" },
                    { "text": "حَقًّا", "name": "Haqqan" }
                ]
            },
            {
                "id": 16,
                "title": "Tashdeed after Madd",
                "description": "Long vowel followed by a doubled letter (Madd Lazim). Requires extra elongation (6 counts).",
                "items": [
                    { "text": "ضَآلِّينَ", "name": "Dallin" },
                    { "text": "دَآبَّةٍ", "name": "Dabbatin" },
                    { "text": "حَآجَّ", "name": "Hajja" },
                    { "text": "جَآءَتِ", "name": "Ja'ati" }
                ]
            },
            {
                "id": 17,
                "title": "Rules of Nun Sakinah (Izhar, Iqlab)",
                "description": "Rules for pronouncing Nun Sakin or Tanween based on the following letter.",
                "items": [
                    { "text": "مَنْ اٰمَنَ", "name": "Man Amana (Izhar)" },
                    { "text": "مِنْ هَادٍ", "name": "Min Hadin (Izhar)" },
                    { "text": "مِنْ بَعْدِ", "name": "Min Ba'di (Iqlab)" },
                    { "text": "سَمِيعٌۢ بَصِيرٌ", "name": "Sami'un Basir (Iqlab)" }
                ]
            },
            {
                "id": 18,
                "title": "Ways of Stopping (Waqf)",
                "description": "Rules for stopping (Waqf) at the end of verses or sentences. Understanding proper pauses is crucial for correct recitation.",
                "items": [
                    { "text": "اَلْحَمْدُ لِلّٰهِ", "name": "Al-Hamdu Lillah (Stop on Ha)" },
                    { "text": "رَبِّ الْعٰلَمِينَ", "name": "Rabbil 'Alamin (Stop on Noon)" },
                    { "text": "مٰلِكِ يَوْمِ الدِّينِ", "name": "Maliki Yawmid Din" },
                    { "text": "اِيَّاكَ نَعْبُدُ", "name": "Iyyaka Na'budu" },
                    { "text": "وَاِيَّاكَ نَسْتَعِينُ", "name": "Wa Iyyaka Nasta'in" },
                    { "text": "اِهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", "name": "Ihdinas Siratal Mustaqim" },
                    { "text": "صِرَاطَ الَّذِينَ", "name": "Siratal Ladhina" },
                    { "text": "اَنْعَمْتَ عَلَيْهِمْ", "name": "An'amta 'Alaihim" },
                    { "text": "غَيْرِ الْمَغْضُوبِ", "name": "Ghairil Maghdubi" },
                    { "text": "عَلَيْهِمْ وَلَا الضَّآلِّينَ", "name": "Alaihim Walad Dallin" }
                ]
            },

        ]
    }
};

export async function GET() {
    return NextResponse.json(CURRICULUM_DATA);
}
