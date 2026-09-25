export interface TarotCardData {
  id: string;
  name: string;
  arcana: "major" | "minor";
  number?: number;
  roman?: string;
  suit?: string;
  suitKey?: string;
  rank?: string;
  element?: string;
  keywords: string[];
  upright: string;
  reversed: string;
  description: string;
  symbolColor?: string;
  image?: string;
}

export type CardCategory = 'Life' | 'Love' | 'Career';

export interface SelectedCardEntry {
  cardId: string;
  category: CardCategory;
  orientation: 'upright' | 'reversed';
  revealed: boolean;
  pickedIndex?: number;
  pickedAt?: string;
}

export interface ParticipantInfo {
  socketId?: string;
  name: string;
  online: boolean;
}

export interface SessionState {
  sessionId: string;
  bookingId?: string | null;
  clientName: string;
  readingFocus: string;
  currentStep: number; // 1 to 7
  clientReady: boolean;
  adminReady: boolean;
  isShuffling: boolean;
  deck: Array<{ cardId: string; orientation: 'upright' | 'reversed' }>;
  selectedCards: SelectedCardEntry[];
  adminNotes: {
    life: string;
    love: string;
    career: string;
    summary: string;
  };
  participants: {
    admin: ParticipantInfo | null;
    client: ParticipantInfo | null;
  };
}

export interface Booking {
  id: string;
  sessionId: string;
  clientName: string;
  clientEmail: string;
  date: string;
  timeSlot: string;
  timezone: string;
  focus: string;
  notes?: string;
  status: 'pending_approval' | 'approved' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed';
  isApproved?: boolean;
  paymentScreenshot?: string | null;
  transactionRef?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt?: string;
}
