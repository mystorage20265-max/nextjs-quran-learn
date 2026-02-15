// Surah Benefits & Virtues - Static Data
// Contains thematic descriptions, benefits from hadith, and alternative names

export interface SurahInfoData {
    theme: string;
    otherNames: string[];
    benefits: string[];
}

// Benefits data for popular surahs (expandable)
const surahInfoMap: Record<number, SurahInfoData> = {
    1: {
        theme: 'The Opening — a prayer for divine guidance, the essence of the entire Quran.',
        otherNames: ['Umm al-Kitab', 'Umm al-Quran', 'As-Sab\' al-Mathani', 'Al-Hamd'],
        benefits: [
            'The Prophet ﷺ said: "No prayer is valid without the recitation of Al-Fatiha." (Bukhari & Muslim)',
            'Known as the "Mother of the Quran" and the greatest Surah revealed.',
            'Used as a spiritual remedy (Ruqyah) — the Prophet ﷺ approved it for healing.',
        ],
    },
    2: {
        theme: 'The Cow — guidance for mankind, covering law, community, and faith.',
        otherNames: ['Az-Zahra'],
        benefits: [
            'The Prophet ﷺ said: "Recite Surah Al-Baqarah, for taking recourse to it is a blessing and giving it up is a cause of grief." (Muslim)',
            'Shaytan flees from a house in which Surah Al-Baqarah is recited. (Muslim)',
            'Contains Ayat al-Kursi (2:255) — the greatest verse in the Quran.',
        ],
    },
    3: {
        theme: 'The Family of Imran — steadfastness in faith, the stories of Maryam and Isa.',
        otherNames: ['Az-Zahra'],
        benefits: [
            'Al-Baqarah and Aal-Imran will come as two clouds shading their companion on the Day of Judgment. (Muslim)',
        ],
    },
    18: {
        theme: 'The Cave — trials of faith, wealth, knowledge, and power.',
        otherNames: ['Al-Hailah'],
        benefits: [
            'Whoever recites Surah Al-Kahf on Friday will have a light between the two Fridays. (Al-Bayhaqi)',
            'Its first and last ten verses protect from the trial of Dajjal. (Muslim)',
        ],
    },
    32: {
        theme: 'The Prostration — creation, resurrection, and the truth of revelation.',
        otherNames: [],
        benefits: [
            'The Prophet ﷺ used to recite As-Sajdah and Al-Insan before Fajr on Fridays. (Bukhari)',
        ],
    },
    36: {
        theme: 'Ya-Sin — the heart of the Quran, affirming resurrection and the Oneness of Allah.',
        otherNames: ['Qalb al-Quran'],
        benefits: [
            'The Prophet ﷺ said: "Truly, everything has a heart, and the heart of the Quran is Ya-Sin." (Tirmidhi)',
        ],
    },
    55: {
        theme: 'The Most Merciful — the blessings of Allah upon creation.',
        otherNames: ['Arus al-Quran (Bride of the Quran)'],
        benefits: [
            'Known as the Bride of the Quran for its beauty and rhythm.',
            'Repeatedly asks: "So which of the favors of your Lord will you deny?"',
        ],
    },
    56: {
        theme: 'The Event — the reality of the Day of Judgment and three groups of people.',
        otherNames: [],
        benefits: [
            'The Prophet ﷺ said: "Whoever recites Surah Al-Waqi\'ah every night will never be afflicted by poverty." (Ibn Sunni)',
        ],
    },
    67: {
        theme: 'The Sovereignty — the dominion of Allah and the purpose of life and death.',
        otherNames: ['Al-Munjiyah', 'Al-Waqiyah', 'Al-Mani\'ah'],
        benefits: [
            'The Prophet ﷺ said: "There is a Surah of the Quran of thirty verses that intercedes for a man until he is forgiven." (Tirmidhi)',
            'Reciting it every night protects from the punishment of the grave.',
        ],
    },
    78: {
        theme: 'The Great News — the certainty of resurrection and the power of Allah.',
        otherNames: [],
        benefits: [
            'Describes the Day of Judgment in vivid detail to awaken the heart.',
        ],
    },
    112: {
        theme: 'The Sincerity — pure monotheism, the essence of Tawheed.',
        otherNames: ['Al-Ikhlas', 'Al-Asas'],
        benefits: [
            'The Prophet ﷺ said: "It is equal to one-third of the Quran." (Bukhari)',
        ],
    },
    113: {
        theme: 'The Daybreak — seeking refuge from external evils.',
        otherNames: ['Al-Mu\'awwidhah'],
        benefits: [
            'One of the two Mu\'awwidhat — recited for protection morning and evening.',
        ],
    },
    114: {
        theme: 'Mankind — seeking refuge from the whisperings of Shaytan.',
        otherNames: ['Al-Mu\'awwidhah'],
        benefits: [
            'One of the two Mu\'awwidhat — the Prophet ﷺ recited them before sleep and when ill.',
        ],
    },
};

/**
 * Get surah benefits and info. Returns null if no data available for the surah.
 */
export function getSurahInfo(surahNumber: number): SurahInfoData | null {
    return surahInfoMap[surahNumber] || null;
}
