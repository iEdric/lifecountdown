
export interface UserProfile {
  name: string;
  birthday: string;
  expectedAge: number;
}

export interface BucketItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface LifeStats {
  weeksPassed: number;
  weeksRemaining: number;
  percentagePassed: number;
  daysRemaining: number;
  hoursRemaining: number;
  secondsRemaining: number;
  sleepRemainingYears: number;
  workRemainingYears: number;
}

export enum LifePhase {
  CHILDHOOD = 'Childhood',
  EDUCATION = 'Education',
  PRIME = 'Prime Years',
  WISDOM = 'Wisdom Years',
  RETIREMENT = 'Retirement'
}

