import { SoundConfig } from './types';

// ============================================================================
// USER CONFIGURATION AREA
// ============================================================================
// 1. Create a folder named 'sounds' in your public/assets directory.
// 2. Drop your .mp3, .wav, or .ogg files there.
// 3. Update the 'filePath' below to match your files.
// ============================================================================

const BANK_A: SoundConfig[] = [
  { id: 'a1', label: 'fahh', filePath: './sounds/fahh.mp3', color: 'red' },
  { id: 'a2', label: '38 cepagaria?', filePath: './sounds/cepagaria.mp3', color: 'blue' },
  { id: 'a3', label: '38 ceprefere', filePath: './sounds/ceprefere.mp3', color: 'purple' },
  { id: 'a4', label: 'como ñ posso?', filePath: './sounds/tailung.mp3', color: 'green' },
  { id: 'a5', label: 'Sad Violin', filePath: './sounds/sad-violin.mp3', color: 'blue' },
  { id: 'a6', label: 'Aplause', filePath: './sounds/applause.mp3', color: 'magenta' },
  { id: 'a7', label: 'Drum Roll', filePath: './sounds/drumroll.mp3', color: 'cyan' },
  { id: 'a8', label: 'Ba Dum Tss', filePath: './sounds/badumtss.mp3', color: 'green' },
  { id: 'a9', label: 'Oh No', filePath: './sounds/oh-no.mp3', color: 'red' },
  { id: 'a10', label: 'Wow', filePath: './sounds/anime-wow.mp3', color: 'magenta' },
  { id: 'a11', label: 'Quack', filePath: './sounds/quack.mp3', color: 'cyan' },
  { id: 'a12', label: 'Fart', filePath: './sounds/fart-reverb.mp3', color: 'purple' },
  { id: 'a13', label: 'Error', filePath: './sounds/windows-error.mp3', color: 'red' },
  { id: 'a14', label: 'Success', filePath: './sounds/success.mp3', color: 'green' },
  { id: 'a15', label: 'Nani?', filePath: './sounds/nani.mp3', color: 'red' },
  { id: 'a16', label: 'Gong', filePath: './sounds/gong.mp3', color: 'blue' },
];

const BANK_B: SoundConfig[] = [
  { id: 'b1', label: 'Techno Kick', filePath: './sounds/kick.mp3', color: 'cyan', loop: true },
  { id: 'b2', label: 'Techno Hat', filePath: './sounds/hihat.mp3', color: 'cyan', loop: true },
  { id: 'b3', label: 'Bass Line', filePath: './sounds/bass.mp3', color: 'purple', loop: true },
  { id: 'b4', label: 'Synth Lead', filePath: './sounds/synth.mp3', color: 'magenta', loop: true },
  { id: 'b5', label: 'Vocals', filePath: './sounds/vocals.mp3', color: 'blue' },
  { id: 'b6', label: 'Siren', filePath: './sounds/siren.mp3', color: 'red' },
  { id: 'b7', label: 'Laser', filePath: './sounds/laser.mp3', color: 'green' },
  { id: 'b8', label: 'Explosion', filePath: './sounds/explosion.mp3', color: 'red' },
  { id: 'b9', label: 'Scratch', filePath: './sounds/scratch.mp3', color: 'blue' },
  { id: 'b10', label: 'Rewind', filePath: './sounds/rewind.mp3', color: 'purple' },
  { id: 'b11', label: 'Horn', filePath: './sounds/horn.mp3', color: 'magenta' },
  { id: 'b12', label: 'Whistle', filePath: './sounds/whistle.mp3', color: 'cyan' },
  { id: 'b13', label: 'Crowd', filePath: './sounds/crowd.mp3', color: 'green' },
  { id: 'b14', label: 'Laugh', filePath: './sounds/laugh.mp3', color: 'blue' },
  { id: 'b15', label: 'Boo', filePath: './sounds/boo.mp3', color: 'red' },
  { id: 'b16', label: 'Yeet', filePath: './sounds/yeet.mp3', color: 'purple' },
];

export const SOUND_MAPPING = {
  A: BANK_A,
  B: BANK_B
};