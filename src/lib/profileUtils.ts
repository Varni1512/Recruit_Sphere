import { getProfileFromDb, updateProfileInDb } from "@/app/actions/profileActions"

export interface Experience {
    id: string;
    company: string;
    role: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
}

export interface CandidateProfile {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    skills: string[];
    portfolio: string;
    linkedin: string;
    github: string;
    photoUrl: string;
    resumeUrl: string;
    resumeName: string;
    experiences: Experience[];
}

export const calculateProfileCompletion = (profile: Partial<CandidateProfile> | null): number => {
    if (!profile) return 0;

    const fieldsToTrack: (keyof CandidateProfile)[] = [
        "fullName", "email", "phone", "location",
        "summary", "skills", "portfolio", "linkedin", "github", "photoUrl", "resumeUrl", "experiences"
    ];

    let filledFields = 0;
    for (const field of fieldsToTrack) {
        if (profile[field] && (Array.isArray(profile[field]) ? (profile[field] as string[]).length > 0 : String(profile[field]).trim() !== "")) {
            filledFields++;
        }
    }

    return Math.round((filledFields / fieldsToTrack.length) * 100);
};

export const getUserProfile = async (uid: string): Promise<Partial<CandidateProfile> | null> => {
    try {
        const dbRes = await getProfileFromDb(uid);
        if (dbRes.success && dbRes.profile) {
            return dbRes.profile;
        }

        if (typeof window === "undefined") return null;
        const raw = localStorage.getItem(`candidate_profile_${uid}`);
        if (!raw) return null;
        return JSON.parse(raw) as Partial<CandidateProfile>;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
};

export const saveUserProfile = async (uid: string, profileData: Partial<CandidateProfile>) => {
    try {
        const dbRes = await updateProfileInDb(uid, profileData);

        if (typeof window !== "undefined") {
            const raw = localStorage.getItem(`candidate_profile_${uid}`);
            const existing = raw ? JSON.parse(raw) : {};
            const merged = { ...existing, ...profileData };
            localStorage.setItem(`candidate_profile_${uid}`, JSON.stringify(merged));
        }

        return dbRes.success ?? true;
    } catch (error) {
        console.error("Error saving user profile:", error);
        return false;
    }
};
