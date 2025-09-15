// types/index.d.ts
export interface Submission {
  _id?: string;
  name: string;
  phone: string;
  businessTitle: string;
  address: {
    district: string;
    mandal: string;
    area: string;
  };
  rating?: number; // optional numeric rating, 0-5 (display only)
  createdAt?: string;
}
