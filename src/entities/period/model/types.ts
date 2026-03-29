export type Period = {
  id: string;
  family_id: string;
  name: string;
  starts_at: string;
  ends_at: string;
  status: 'active' | 'archived' | 'resolved';
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
};
