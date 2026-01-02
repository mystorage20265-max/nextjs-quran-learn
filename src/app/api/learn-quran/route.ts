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
                    { "id": "ba", "text": "ب", "name": "Ba", "audio": "2_baa.mp3" },
                    { "id": "ta", "text": "ت", "name": "Ta", "audio": "3_taa.mp3" },
                    { "id": "tha", "text": "ث", "name": "Tha", "audio": "4_thaa.mp3" },
                    { "id": "jim", "text": "ج", "name": "Jim", "audio": "5_jiim.mp3" },
                    { "id": "ha", "text": "ح", "name": "Ha", "audio": "6_haa.mp3" },
                    { "id": "kha", "text": "خ", "name": "Kha", "audio": "7_khaa.mp3" },
                    { "id": "dal", "text": "د", "name": "Dal", "audio": "8_daal.mp3" },
                    { "id": "dhal", "text": "ذ", "name": "Dhal", "audio": "9_dhaal.mp3" },
                    { "id": "ra", "text": "ر", "name": "Ra", "audio": "10_raa.mp3" },
                    { "id": "za", "text": "ز", "name": "Za", "audio": "11_zay.mp3" },
                    { "id": "seen", "text": "س", "name": "Seen", "audio": "12_seen.mp3" },
                    { "id": "sheen", "text": "ش", "name": "Sheen", "audio": "13_sheen.mp3" },
                    { "id": "sad", "text": "ص", "name": "Sad", "audio": "14_saad.mp3" },
                    { "id": "dad", "text": "ض", "name": "Dad", "audio": "15_daad.mp3" },
                    { "id": "tah", "text": "ط", "name": "Tah", "audio": "16_taa.mp3" },
                    { "id": "zah", "text": "ظ", "name": "Zah", "audio": "17_dhaa.mp3" },
                    { "id": "ain", "text": "ع", "name": "Ain", "audio": "18_ayn.mp3" },
                    { "id": "ghain", "text": "غ", "name": "Ghain", "audio": "19_ghayn.mp3" },
                    { "id": "fa", "text": "ف", "name": "Fa", "audio": "20_fa.mp3" },
                    { "id": "qaf", "text": "ق", "name": "Qaf", "audio": "21_qaaf.mp3" },
                    { "id": "kaf", "text": "ك", "name": "Kaf", "audio": "22_kaaf.mp3" },
                    { "id": "lam", "text": "ل", "name": "Lam", "audio": "23_laam.mp3" },
                    { "id": "meem", "text": "م", "name": "Meem", "audio": "24_meem.mp3" },
                    { "id": "noon", "text": "ن", "name": "Noon", "audio": "25_noon.mp3" },
                    { "id": "ha", "text": "ه", "name": "Ha", "audio": "26_ha.mp3" },
                    { "id": "waw", "text": "و", "name": "Waw", "audio": "27_waaw.mp3" },
                    { "id": "hamza", "text": "ء", "name": "Hamza", "audio": "1_alif.mp3" },
                    { "id": "ya", "text": "ي", "name": "Ya", "audio": "30_yaa.mp3" }
                ]
            },
            {
                "id": 2,
                "title": "Joint Letters (Murakkabat)",
                "description": "Learning to recognize letters when they are joined together. The shape of letters changes depending on their position (start, middle, end).",
                "items": [
                    { "text": "لا", "name": "Lam Alif" },
                    { "text": "بَا", "name": "Ba Alif" },
                    { "text": "تَا", "name": "Ta Alif" },
                    { "text": "ثَا", "name": "Tha Alif" },
                    { "text": "نَا", "name": "Noon Alif" },
                    { "text": "يَا", "name": "Ya Alif" },
                    { "text": "خَا", "name": "Kha Alif" },
                    { "text": "سَا", "name": "Seen Alif" },
                    { "text": "فَا", "name": "Fa Alif" },
                    { "text": "كَا", "name": "Kaf Alif" },
                    { "text": "بَس", "name": "Ba Seen" },
                    { "text": "تَس", "name": "Ta Seen" },
                    { "text": "نَس", "name": "Noon Seen" },
                    { "text": "يَس", "name": "Ya Seen" }
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
