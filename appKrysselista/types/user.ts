export interface User {
    id: string;
    kindergardenId: string;
    name: string;
    email: string;
    children: string[];
    role: "ansatt" | "foresatt";
}