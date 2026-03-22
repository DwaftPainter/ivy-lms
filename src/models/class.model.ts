export interface IClassResponse {
    id: string;
    title: string;
    course: string;
    date: string;
    day: string;
    time: string;
    instructor: string;
    description: string | null;
    materials: Array<IMaterial>
}
[];

export interface IMaterial {
    id: string;
    name: string;
    fileUrl: string;
}
