import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

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
        const docRef = doc(db, "candidates", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as Partial<CandidateProfile>;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
};

export const saveUserProfile = async (uid: string, profileData: Partial<CandidateProfile>) => {
    try {
        const docRef = doc(db, "candidates", uid);
        await setDoc(docRef, profileData, { merge: true });
        return true;
    } catch (error) {
        console.error("Error saving user profile:", error);
        return false;
    }
};
