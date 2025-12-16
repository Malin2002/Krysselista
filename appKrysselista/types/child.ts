export interface Child {
    id: string;
    name: string;
    kindergardenId: string;
    imageUrl?: string;
    status: "inn" | "ut" | "fravaer";
    hasAbsenceToday?: boolean;
    importantInfo?: string;
    health?: {
        allergies?: string[];
        medicine?: string[];
    };
    guardians?: string[];
}