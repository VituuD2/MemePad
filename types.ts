export type PadColor = 'blue' | 'purple' | 'cyan' | 'magenta' | 'green' | 'red';

export interface SoundConfig {
  id: string;
  label: string;
  /**
   * IMPORTANT: Place your audio files in your public folder (e.g., /sounds/).
   * Path should be relative to the public root.
   * Example: '/sounds/airhorn.mp3'
   */
  filePath: string; 
  color: PadColor;
  loop?: boolean; // Default loop state (from config)
}

export interface AudioState {
  isPlaying: boolean;
  volume: number;
  pitch: number;
}

export interface BankConfig {
  id: 'A' | 'B';
  name: string;
}