export type Goal = {
  id: string;
  family_id: string;
  name: string;
  target_cents: number;
  icon: string;
  color: string;
  created_by: string;
  created_at: string;
  completed_at: string | null;
  current_cents?: number;
};

export type GoalContribution = {
  id: string;
  goal_id: string;
  user_id: string;
  amount_cents: number;
  note: string | null;
  created_at: string;
  profile?: { full_name: string | null };
};
