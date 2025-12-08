export interface Child {
    id: string;
    name: string;
    kindergardenId: string;
    imageUrl?: string;
    status: "inn" | "ut" | "fravaer";
    importantInfo?: string;
    health?: {
        allergies?: string[];
        medicine?: string[];
    };
    guardians?: {
        guardian1: string;
        guardian2: string;
    };
    gallery?: string[];
}