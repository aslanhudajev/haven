export type Category = {
  id: string;
  family_id: string | null;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
  is_system: boolean;
  created_at: string;
};
