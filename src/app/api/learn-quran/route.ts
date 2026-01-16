import { NextResponse } from 'next/server';

// We interact with the Quran.com API structure where possible/relevant
// but for the Qaida curriculum, we structure the "Lesson" data explicitly here
// to ensure the "Order of Learning" is correct (Alphabet -> Rules).

const lesson3Items = Array.from({ length: 60 }, (_, i) => {
    const n = (i + 1).toString().padStart(2, '0');
    return {
        id: (i + 1).toString(),
        text: `Item ${i + 1}`,
        name: `JointLetter ${i + 1}`,
        imageSrc: `https://data.qurancentral.com/features/learn-quran/svg/lesson03/L3-${n}.svg`,
        audio: `L03-${n}.mp3`
    };
});

const lesson2Items = Array.from({ length: 60 }, (_, i) => {
    const n = (i + 1).toString().padStart(2, '0');
    // SVG Example: https://data.qurancentral.com/features/learn-quran/svg/lesson02/L2-01.svg
    // Audio Example: https://data.qurancentral.com/features/learn-quran/audio/lesson02/L02-01.mp3
    return {
        id: (i + 1).toString(),
        text: `Item ${i + 1}`,
        name: `JointLetter ${i + 1}`,
        imageSrc: `https://data.qurancentral.com/features/learn-quran/svg/lesson02/L2-${(i + 1).toString().padStart(2, '0')}.svg`,
        audio: `L02-${n}.mp3`
    };
});

const lesson4Items = Array.from({ length: 14 }, (_, i) => {
    const n = (i + 1).toString().padStart(2, '0');
    // SVG Example: https://data.qurancentral.com/features/learn-quran/svg/lesson04/L4-01.svg
    // Audio Example: https://data.qurancentral.com/features/learn-quran/audio/lesson04/L04-01.mp3
    // Note: Image uses 'L4-', Audio uses 'L04-'
    return {
        id: (i + 1).toString(),
        text: `Item ${i + 1}`,
        name: `Movement ${i + 1}`,
        imageSrc: `https://data.qurancentral.com/features/learn-quran/svg/lesson04/L4-${n}.svg`,
        audio: `L04-${n}.mp3`
    };
});

const lesson5Items = Array.from({ length: 84 }, (_, i) => {
    const n = (i + 1).toString().padStart(2, '0');
    // SVG Example: https://data.qurancentral.com/features/learn-quran/svg/lesson05/L5-01.svg
    // Audio Example: https://data.qurancentral.com/features/learn-quran/audio/lesson05/L05-01.mp3
    // Note: Image uses 'L5-', Audio uses 'L05-'
    return {
        id: (i + 1).toString(),
        text: `Item ${i + 1}`,
        name: `Tanween ${i + 1}`,
        imageSrc: `https://data.qurancentral.com/features/learn-quran/svg/lesson05/L5-${n}.svg`,
        audio: `L05-${n}.mp3`
    };
});

const lesson6Items = Array.from({ length: 84 }, (_, i) => {
    const n = (i + 1).toString().padStart(2, '0');
    // SVG Example: https://data.qurancentral.com/features/learn-quran/svg/lesson06/L6-01.svg
    // Audio Example: https://data.qurancentral.com/features/learn-quran/audio/lesson06/L06-01.mp3
    return {
        id: (i + 1).toString(),
        text: `Item ${i + 1}`,
        name: `TanweenPractice ${i + 1}`,
        imageSrc: `https://data.qurancentral.com/features/learn-quran/svg/lesson06/L6-${n}.svg`,
        audio: `L06-${n}.mp3`
    };
});



// Helper to generate lesson items for Quran Central clones
const generateLessonItems = (count: number, lessonId: number | string, svgPrefix: string, audioPrefix: number | string) => {
    return Array.from({ length: count }, (_, i) => {
        const n = (i + 1).toString().padStart(2, '0');
        const lessonStr = typeof lessonId === 'number' ? lessonId.toString().padStart(2, '0') : lessonId;
        const audioStr = typeof audioPrefix === 'number' ? audioPrefix.toString().padStart(2, '0') : audioPrefix;

        return {
            id: (i + 1).toString(),
            text: `Item ${i + 1}`,
            name: `Lesson${lessonId} Item ${i + 1}`,
            imageSrc: `https://data.qurancentral.com/features/learn-quran/svg/lesson${lessonStr}/${svgPrefix}-${n}.svg`,
            audio: `L${audioStr}-${n}.mp3`
        };
    });
};

// Batch Generate Lessons 7-18
const lesson7Items = generateLessonItems(54, 7, 'L7', 7);
const lesson8Items = generateLessonItems(33, 8, 'L8', 8);
const lesson9Items = generateLessonItems(140, 9, 'L9', 9);
const lesson10Items = generateLessonItems(101, 10, 'L10', 10);
const lesson11Items = generateLessonItems(48, 11, 'L11', 11);
const lesson12Items = generateLessonItems(149, 12, 'L12', 12);
const lesson13Items = generateLessonItems(69, 13, 'L13', 13);
const lesson14Items = generateLessonItems(57, 14, 'L14', 14);
const lesson15Items = generateLessonItems(25, 15, 'L15', 15);
const lesson16Items = generateLessonItems(10, 16, 'L16', 16);
const lesson17Items = generateLessonItems(11, 17, 'L17', 17);
const lesson18Items = generateLessonItems(33, 18, 'L18', 18);

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
                "description": "In this lesson we will learn how the words are formed by joining alphabets.",
                "audioBase": "https://data.qurancentral.com/features/learn-quran/audio/lesson02/",
                "items": lesson2Items
            },
            {
                "id": 3,
                "title": "Joint Letters (Part 2)",
                "description": "Continuation of learning connected letters. Identify the shapes.",
                "audioBase": "https://data.qurancentral.com/features/learn-quran/audio/lesson03/",
                "items": lesson3Items
            },
            {
                "id": 4,
                "title": "Movements (Harakat)",
                "description": "Introduction to Short Vowels: Fatha, Kasra, and Damma.",
                "audioBase": "https://data.qurancentral.com/features/learn-quran/audio/lesson04/",
                "items": lesson4Items
            },
            {
                "id": 5,
                "title": "Nunation (Tanween)",
                "description": "Double Vowels: Double Fatha, Double Kasra, Double Damma.",
                "audioBase": "https://data.qurancentral.com/features/learn-quran/audio/lesson05/",
                "items": lesson5Items
            },
            {
                "id": 6,
                "title": "Nunation & Movement Practice",
                "description": "Practice combining Tanween (Double Vowels) and Harakat (Short Vowels).",
                "audioBase": "https://data.qurancentral.com/features/learn-quran/audio/lesson06/",
                "items": lesson6Items
            },
            {
                "id": 7,
                "title": "Standing Fatha, Kasra, Damma",
                "description": "Short vowels that are prolonged (2 counts).",
                "audioBase": "https://data.qurancentral.com/features/learn-quran/audio/lesson07/",
                "items": lesson7Items
            },
            {
                "id": 8,
                "title": "Madd and Leen",
                "description": "Letters of Madd (Alif, Waw, Ya) and Leen (Waw, Ya with Fatha).",
                "audioBase": "https://data.qurancentral.com/features/learn-quran/audio/lesson08/",
                "items": lesson8Items
            },
            {
                "id": 9,
                "title": "Madd Practice",
                "description": "Extensive reading exercises for long vowels.",
                "audioBase": "https://data.qurancentral.com/features/learn-quran/audio/lesson09/",
                "items": lesson9Items
            },
            {
                "id": 10,
                "title": "Sukoon (Jazm)",
                "description": "The Sukoon ends the sound of the previous letter.",
                "audioBase": "https://data.qurancentral.com/features/learn-quran/audio/lesson10/",
                "items": lesson10Items
            },
            {
                "id": 11,
                "title": "Sukoon Practice",
                "description": "Complex words using Sukoon.",
                "audioBase": "https://data.qurancentral.com/features/learn-quran/audio/lesson11/",
                "items": lesson11Items
            },
            {
                "id": 12,
                "title": "Tashdeed (Shaddah)",
                "description": "Doubling the letter with emphasis.",
                "audioBase": "https://data.qurancentral.com/features/learn-quran/audio/lesson12/",
                "items": lesson12Items
            },
            {
                "id": 13,
                "title": "Tashdeed Practice",
                "description": "Words containing Tashdeed.",
                "audioBase": "https://data.qurancentral.com/features/learn-quran/audio/lesson13/",
                "items": lesson13Items
            },
            {
                "id": 14,
                "title": "Tashdeed with Sukoon",
                "description": "Combinations of Tashdeed followed by Sukoon.",
                "audioBase": "https://data.qurancentral.com/features/learn-quran/audio/lesson14/",
                "items": lesson14Items
            },
            {
                "id": 15,
                "title": "Tashdeed with Tashdeed",
                "description": "Multiple Tashdeeds in sequence.",
                "audioBase": "https://data.qurancentral.com/features/learn-quran/audio/lesson15/",
                "items": lesson15Items
            },
            {
                "id": 16,
                "title": "Tashdeed after Madd",
                "description": "Madd Lazim: Long vowel followed by Tashdeed.",
                "audioBase": "https://data.qurancentral.com/features/learn-quran/audio/lesson16/",
                "items": lesson16Items
            },
            {
                "id": 17,
                "title": "Rules of Nun Sakinah",
                "description": "Izhar, Iqlab, Idgham, Ikhfa.",
                "audioBase": "https://data.qurancentral.com/features/learn-quran/audio/lesson17/",
                "items": lesson17Items
            },
            {
                "id": 18,
                "title": "Ways of Stopping (Waqf)",
                "description": "Rules for stopping at the end of verses.",
                "audioBase": "https://data.qurancentral.com/features/learn-quran/audio/lesson18/",
                "items": lesson18Items
            },

        ]
    }
};

export async function GET() {
    return NextResponse.json(CURRICULUM_DATA);
}
