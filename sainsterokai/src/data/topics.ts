// =============================================
// SainsTerokai — KSSR Science Topics Data
// Dunia Hijau (Sains Hayat) — Tahun 1 & 2
// Aligned with KSSR Semakan 2017
// =============================================

import type { Character, World, Topic, GameConfig, DragDropData, LabExperimentData } from '../types';

// --- Characters ---
export const CHARACTERS: Character[] = [
  {
    id: 'alia',
    name: 'Alia',
    emoji: '👧🏽',
    description: 'Alia suka meneroka alam semula jadi dan mengkaji tumbuhan!',
    color: '#E91E63',
    bgGradient: 'linear-gradient(135deg, #FCE4EC, #F8BBD0)',
  },
  {
    id: 'aiman',
    name: 'Aiman',
    emoji: '👦🏽',
    description: 'Aiman gemar membuat eksperimen dan mengkaji haiwan!',
    color: '#2196F3',
    bgGradient: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)',
  },
  {
    id: 'budi',
    name: 'Budi',
    emoji: '👦🏾',
    description: 'Budi hebat meneroka hutan dan mengenal pelbagai spesies!',
    color: '#4CAF50',
    bgGradient: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
  },
];

// --- Worlds ---
export const WORLDS: World[] = [
  {
    id: 'hijau',
    name: 'Dunia Hijau — Sains Hayat',
    emoji: '🌿',
    color: '#4CAF50',
    gradientFrom: '#43A047',
    gradientTo: '#66BB6A',
    description: 'Terokai dunia hidupan! Kenali haiwan, tumbuhan, dan ciri-ciri benda hidup.',
    locked: false,
    topics: [], // populated below
  },
  {
    id: 'bahan',
    name: 'Dunia Bahan — Sains Bahan',
    emoji: '⚗️',
    color: '#FF9800',
    gradientFrom: '#FB8C00',
    gradientTo: '#FFB74D',
    description: 'Kaji sifat bahan! Pepejal, cecair, dan gas di sekeliling kita.',
    locked: true,
    topics: [],
  },
  {
    id: 'tenaga',
    name: 'Dunia Tenaga — Sains Fizikal',
    emoji: '⚡',
    color: '#F44336',
    gradientFrom: '#E53935',
    gradientTo: '#EF5350',
    description: 'Fahami daya, tenaga, cahaya, dan bunyi!',
    locked: true,
    topics: [],
  },
  {
    id: 'bumi',
    name: 'Dunia Bumi — Bumi & Angkasa',
    emoji: '🌍',
    color: '#3F51B5',
    gradientFrom: '#3949AB',
    gradientTo: '#5C6BC0',
    description: 'Terbang ke angkasa! Kenali bumi, bulan, dan matahari.',
    locked: true,
    topics: [],
  },
  {
    id: 'masa-depan',
    name: 'Dunia Masa Depan — Teknologi',
    emoji: '🤖',
    color: '#9C27B0',
    gradientFrom: '#8E24AA',
    gradientTo: '#AB47BC',
    description: 'Cipta masa depan! Teknologi dan kelestarian alam.',
    locked: true,
    topics: [],
  },
];

// --- Dunia Hijau Topics (Tahun 1 & 2 KSSR) ---

const duniaHijauGames_T1_Hidupan: GameConfig[] = [
  {
    id: 'quiz-hidupan-bukan-hidupan',
    topicId: 'hidupan-bukan-hidupan',
    type: 'quiz',
    title: 'Kuiz: Hidupan & Bukan Hidupan',
    description: 'Uji pengetahuan kamu tentang benda hidup dan bukan hidup!',
  },
  {
    id: 'drag-hidupan-bukan-hidupan',
    topicId: 'hidupan-bukan-hidupan',
    type: 'drag-drop',
    title: 'Kelaskan: Hidup atau Bukan?',
    description: 'Seret gambar ke kumpulan yang betul!',
  },
];

const duniaHijauGames_T1_Haiwan: GameConfig[] = [
  {
    id: 'quiz-bahagian-haiwan',
    topicId: 'bahagian-haiwan',
    type: 'quiz',
    title: 'Kuiz: Bahagian Tubuh Haiwan',
    description: 'Kenali bahagian-bahagian tubuh haiwan!',
  },
  {
    id: 'drag-bahagian-haiwan',
    topicId: 'bahagian-haiwan',
    type: 'drag-drop',
    title: 'Padankan Bahagian Haiwan',
    description: 'Padankan bahagian tubuh dengan haiwan yang betul!',
  },
];

const duniaHijauGames_T1_Tumbuhan: GameConfig[] = [
  {
    id: 'quiz-bahagian-tumbuhan',
    topicId: 'bahagian-tumbuhan',
    type: 'quiz',
    title: 'Kuiz: Bahagian Tumbuhan',
    description: 'Kenali akar, batang, daun, bunga, dan buah!',
  },
  {
    id: 'lab-bahagian-tumbuhan',
    topicId: 'bahagian-tumbuhan',
    type: 'lab-experiment',
    title: 'Eksperimen: Kaji Bahagian Tumbuhan',
    description: 'Lakukan eksperimen virtual untuk mengkaji bahagian tumbuhan!',
  },
];

const duniaHijauGames_T2_Habitat: GameConfig[] = [
  {
    id: 'quiz-habitat-haiwan',
    topicId: 'habitat-haiwan',
    type: 'quiz',
    title: 'Kuiz: Habitat Haiwan',
    description: 'Di manakah haiwan-haiwan ini tinggal?',
  },
  {
    id: 'drag-habitat-haiwan',
    topicId: 'habitat-haiwan',
    type: 'drag-drop',
    title: 'Kelaskan: Habitat Haiwan',
    description: 'Seret haiwan ke habitat yang betul!',
  },
];

const duniaHijauGames_T2_Keperluan: GameConfig[] = [
  {
    id: 'quiz-keperluan-asas',
    topicId: 'keperluan-asas',
    type: 'quiz',
    title: 'Kuiz: Keperluan Asas Hidupan',
    description: 'Apa yang diperlukan benda hidup untuk terus hidup?',
  },
  {
    id: 'lab-keperluan-tumbuhan',
    topicId: 'keperluan-asas',
    type: 'lab-experiment',
    title: 'Eksperimen: Keperluan Tumbuhan',
    description: 'Uji kaji apa berlaku bila tumbuhan tiada air atau cahaya!',
  },
];

export const DUNIA_HIJAU_TOPICS: Topic[] = [
  {
    id: 'hidupan-bukan-hidupan',
    worldId: 'hijau',
    tahun: 1,
    title: 'Hidupan & Bukan Hidupan',
    description: 'Belajar membezakan benda hidup dan benda bukan hidup.',
    icon: '🌱',
    games: duniaHijauGames_T1_Hidupan,
    locked: false,
  },
  {
    id: 'bahagian-haiwan',
    worldId: 'hijau',
    tahun: 1,
    title: 'Bahagian Tubuh Haiwan',
    description: 'Kenali bahagian luar tubuh haiwan seperti kepala, kaki, ekor, dan sayap.',
    icon: '🐔',
    games: duniaHijauGames_T1_Haiwan,
    locked: false,
  },
  {
    id: 'bahagian-tumbuhan',
    worldId: 'hijau',
    tahun: 1,
    title: 'Bahagian Tumbuhan',
    description: 'Kenali akar, batang, daun, bunga, dan buah pada tumbuhan.',
    icon: '🌳',
    games: duniaHijauGames_T1_Tumbuhan,
    locked: false,
  },
  {
    id: 'habitat-haiwan',
    worldId: 'hijau',
    tahun: 2,
    title: 'Habitat Haiwan',
    description: 'Terokai tempat tinggal haiwan — darat, air, dan udara.',
    icon: '🏕️',
    games: duniaHijauGames_T2_Habitat,
    locked: false,
  },
  {
    id: 'keperluan-asas',
    worldId: 'hijau',
    tahun: 2,
    title: 'Keperluan Asas Hidupan',
    description: 'Apa yang diperlukan haiwan dan tumbuhan untuk terus hidup?',
    icon: '💧',
    games: duniaHijauGames_T2_Keperluan,
    locked: false,
  },
];

// Populate Dunia Hijau with topics
WORLDS[0].topics = DUNIA_HIJAU_TOPICS;

// --- Drag & Drop Data ---

export const DRAG_DROP_DATA: Record<string, DragDropData> = {
  'drag-hidupan-bukan-hidupan': {
    instruction: 'Seret setiap benda ke kumpulan yang betul: HIDUPAN atau BUKAN HIDUPAN.',
    items: [
      { id: 'kucing', label: 'Kucing', emoji: '🐱' },
      { id: 'batu', label: 'Batu', emoji: '🪨' },
      { id: 'bunga', label: 'Bunga', emoji: '🌸' },
      { id: 'kerusi', label: 'Kerusi', emoji: '🪑' },
      { id: 'ikan', label: 'Ikan', emoji: '🐟' },
      { id: 'bola', label: 'Bola', emoji: '⚽' },
      { id: 'pokok', label: 'Pokok', emoji: '🌴' },
      { id: 'kereta', label: 'Kereta', emoji: '🚗' },
    ],
    zones: [
      {
        id: 'hidupan',
        label: 'Hidupan',
        emoji: '🌿',
        acceptIds: ['kucing', 'bunga', 'ikan', 'pokok'],
      },
      {
        id: 'bukan-hidupan',
        label: 'Bukan Hidupan',
        emoji: '🧱',
        acceptIds: ['batu', 'kerusi', 'bola', 'kereta'],
      },
    ],
  },
  'drag-bahagian-haiwan': {
    instruction: 'Padankan bahagian tubuh dengan haiwan yang memilikinya.',
    items: [
      { id: 'sayap', label: 'Sayap', emoji: '🪶' },
      { id: 'sirip', label: 'Sirip', emoji: '🐟' },
      { id: 'kaki-4', label: '4 Kaki', emoji: '🐾' },
      { id: 'paruh', label: 'Paruh', emoji: '🐦' },
      { id: 'sisik', label: 'Sisik', emoji: '🐍' },
      { id: 'bulu', label: 'Bulu', emoji: '🪶' },
    ],
    zones: [
      {
        id: 'burung',
        label: 'Burung',
        emoji: '🐦',
        acceptIds: ['sayap', 'paruh', 'bulu'],
      },
      {
        id: 'ikan-zone',
        label: 'Ikan',
        emoji: '🐠',
        acceptIds: ['sirip', 'sisik'],
      },
      {
        id: 'kucing-zone',
        label: 'Kucing',
        emoji: '🐱',
        acceptIds: ['kaki-4', 'bulu'],
      },
    ],
  },
  'drag-habitat-haiwan': {
    instruction: 'Seret haiwan ke habitat yang betul!',
    items: [
      { id: 'katak', label: 'Katak', emoji: '🐸' },
      { id: 'burung-hantu', label: 'Burung Hantu', emoji: '🦉' },
      { id: 'jerung', label: 'Jerung', emoji: '🦈' },
      { id: 'arnab', label: 'Arnab', emoji: '🐇' },
      { id: 'sotong', label: 'Sotong', emoji: '🦑' },
      { id: 'helang', label: 'Helang', emoji: '🦅' },
      { id: 'gajah', label: 'Gajah', emoji: '🐘' },
      { id: 'ikan-paus', label: 'Ikan Paus', emoji: '🐋' },
    ],
    zones: [
      {
        id: 'darat',
        label: 'Habitat Darat',
        emoji: '🌿',
        acceptIds: ['burung-hantu', 'arnab', 'gajah'],
      },
      {
        id: 'air',
        label: 'Habitat Air',
        emoji: '🌊',
        acceptIds: ['jerung', 'sotong', 'ikan-paus'],
      },
      {
        id: 'darat-air',
        label: 'Darat & Air',
        emoji: '🏝️',
        acceptIds: ['katak'],
      },
      {
        id: 'udara',
        label: 'Habitat Udara',
        emoji: '☁️',
        acceptIds: ['helang'],
      },
    ],
  },
};

// --- Lab Experiment Data ---

export const LAB_DATA: Record<string, LabExperimentData> = {
  'lab-bahagian-tumbuhan': {
    title: 'Eksperimen: Kaji Bahagian Tumbuhan',
    objective: 'Mengenal pasti dan menamakan bahagian-bahagian tumbuhan.',
    materials: [
      { name: 'Pokok bunga raya', emoji: '🌺' },
      { name: 'Kanta pembesar', emoji: '🔍' },
      { name: 'Buku nota', emoji: '📓' },
    ],
    steps: [
      {
        id: 'step-1',
        instruction: 'Perhatikan pokok bunga raya ini. Apakah bahagian yang berada di dalam tanah?',
        type: 'select',
        options: ['Akar', 'Batang', 'Daun', 'Bunga'],
        correctAnswer: 'Akar',
        feedbackCorrect: 'Betul! 🎉 Akar berada di dalam tanah. Akar menyerap air dan mineral.',
        feedbackWrong: 'Cuba lagi! Bahagian yang berada di dalam tanah ialah AKAR.',
        emoji: '🌱',
      },
      {
        id: 'step-2',
        instruction: 'Bahagian yang menyokong pokok supaya berdiri tegak ialah...',
        type: 'select',
        options: ['Daun', 'Batang', 'Buah', 'Akar'],
        correctAnswer: 'Batang',
        feedbackCorrect: 'Hebat! 🌟 Batang menyokong pokok dan mengangkut air ke daun.',
        feedbackWrong: 'Fikirkan bahagian yang tegak dan keras. Itulah BATANG!',
        emoji: '🪵',
      },
      {
        id: 'step-3',
        instruction: 'Bahagian yang berwarna hijau dan membuat makanan untuk tumbuhan ialah...',
        type: 'select',
        options: ['Bunga', 'Akar', 'Daun', 'Buah'],
        correctAnswer: 'Daun',
        feedbackCorrect: 'Cemerlang! 🍃 Daun membuat makanan melalui proses fotosintesis.',
        feedbackWrong: 'Bahagian hijau yang membuat makanan ialah DAUN!',
        emoji: '🍃',
      },
      {
        id: 'step-4',
        instruction: 'Bahagian tumbuhan yang cantik berwarna-warni dan menarik serangga ialah...',
        type: 'select',
        options: ['Batang', 'Akar', 'Bunga', 'Daun'],
        correctAnswer: 'Bunga',
        feedbackCorrect: 'Tepat! 🌸 Bunga berwarna-warni untuk menarik serangga membantu pendebungaan.',
        feedbackWrong: 'Bahagian cantik yang menarik serangga ialah BUNGA!',
        emoji: '🌺',
      },
      {
        id: 'step-5',
        instruction: 'Bahagian tumbuhan yang mengandungi biji benih ialah...',
        type: 'select',
        options: ['Buah', 'Daun', 'Batang', 'Akar'],
        correctAnswer: 'Buah',
        feedbackCorrect: 'Tahniah! 🎊 Buah mengandungi biji benih untuk membiak tumbuhan baru.',
        feedbackWrong: 'Biji benih terdapat di dalam BUAH!',
        emoji: '🍎',
      },
    ],
  },
  'lab-keperluan-tumbuhan': {
    title: 'Eksperimen: Keperluan Asas Tumbuhan',
    objective: 'Mengkaji apa yang berlaku apabila tumbuhan tidak mendapat air dan cahaya matahari.',
    materials: [
      { name: 'Dua pasu tumbuhan', emoji: '🪴' },
      { name: 'Air', emoji: '💧' },
      { name: 'Kotak gelap', emoji: '📦' },
      { name: 'Buku nota', emoji: '📓' },
    ],
    steps: [
      {
        id: 'step-1',
        instruction: 'Kita ada 2 pasu pokok yang sama. Pokok A disiram air setiap hari. Pokok B TIDAK disiram langsung. Selepas 1 minggu, apa akan berlaku kepada Pokok B?',
        type: 'select',
        options: ['Pokok B tumbuh lebih besar', 'Pokok B layu dan kering', 'Pokok B berbunga', 'Tiada perubahan'],
        correctAnswer: 'Pokok B layu dan kering',
        feedbackCorrect: 'Betul! 🎉 Tumbuhan memerlukan AIR untuk terus hidup. Tanpa air, tumbuhan akan layu.',
        feedbackWrong: 'Tanpa air, tumbuhan akan LAYU dan KERING kerana air diperlukan untuk hidup.',
        emoji: '💧',
      },
      {
        id: 'step-2',
        instruction: 'Sekarang, Pokok C diletakkan di bawah cahaya matahari. Pokok D diletakkan di dalam kotak gelap. Selepas 1 minggu, apa warna daun Pokok D?',
        type: 'select',
        options: ['Hijau gelap', 'Kuning pucat', 'Merah', 'Biru'],
        correctAnswer: 'Kuning pucat',
        feedbackCorrect: 'Hebat! 🌟 Tanpa cahaya matahari, daun menjadi kuning kerana tidak dapat membuat makanan.',
        feedbackWrong: 'Tanpa cahaya, daun akan menjadi KUNING PUCAT kerana tidak dapat berfotosintesis.',
        emoji: '☀️',
      },
      {
        id: 'step-3',
        instruction: 'Berdasarkan eksperimen ini, apakah DUA keperluan asas tumbuhan?',
        type: 'select',
        options: ['Air dan cahaya matahari', 'Batu dan tanah', 'Angin dan hujan', 'Kerusi dan meja'],
        correctAnswer: 'Air dan cahaya matahari',
        feedbackCorrect: 'Cemerlang! 💯 Tumbuhan memerlukan AIR dan CAHAYA MATAHARI sebagai keperluan asas!',
        feedbackWrong: 'Keperluan asas tumbuhan ialah AIR dan CAHAYA MATAHARI!',
        emoji: '🌻',
      },
      {
        id: 'step-4',
        instruction: 'Selain air dan cahaya, tumbuhan juga memerlukan _____ dari udara untuk membuat makanan.',
        type: 'select',
        options: ['Karbon dioksida', 'Oksigen', 'Nitrogen', 'Hidrogen'],
        correctAnswer: 'Karbon dioksida',
        feedbackCorrect: 'Tahniah Saintis Muda! 🔬 Tumbuhan memerlukan karbon dioksida (CO₂) untuk fotosintesis!',
        feedbackWrong: 'Tumbuhan memerlukan KARBON DIOKSIDA dari udara untuk membuat makanan.',
        emoji: '💨',
      },
    ],
  },
};
