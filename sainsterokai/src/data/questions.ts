// =============================================
// SainsTerokai — Quiz Questions Database
// KSSR Tahun 1 & 2 Sains Hayat
// =============================================

import type { QuizQuestion } from '../types';

export const QUIZ_QUESTIONS: Record<string, QuizQuestion[]> = {
  // ----- TOPIK 1: Hidupan & Bukan Hidupan (Tahun 1) -----
  'quiz-hidupan-bukan-hidupan': [
    {
      id: 'q1-hbh-1',
      question: 'Yang manakah antara berikut adalah BENDA HIDUP?',
      options: ['Batu', 'Kucing', 'Kerusi', 'Bola'],
      correctIndex: 1,
      explanation: 'Kucing adalah benda hidup kerana ia bernafas, makan, membiak, dan bergerak.',
    },
    {
      id: 'q1-hbh-2',
      question: 'Benda hidup boleh melakukan semua perkara ini KECUALI...',
      options: ['Bernafas', 'Makan', 'Membiak', 'Terapung di udara tanpa sayap'],
      correctIndex: 3,
      explanation: 'Benda hidup bernafas, makan, dan membiak. Terapung tanpa sayap bukan ciri benda hidup.',
    },
    {
      id: 'q1-hbh-3',
      question: 'Yang manakah BUKAN benda hidup?',
      options: ['Pokok mangga', 'Ikan', 'Meja', 'Kupu-kupu'],
      correctIndex: 2,
      explanation: 'Meja adalah bukan benda hidup. Ia tidak bernafas, tidak makan, dan tidak membiak.',
    },
    {
      id: 'q1-hbh-4',
      question: 'Apakah yang dilakukan oleh semua benda hidup?',
      options: ['Bernafas', 'Bercakap', 'Menulis', 'Memasak'],
      correctIndex: 0,
      explanation: 'Semua benda hidup bernafas — manusia, haiwan, malah tumbuhan juga bernafas!',
    },
    {
      id: 'q1-hbh-5',
      question: 'Pokok kelapa adalah...',
      options: ['Bukan benda hidup', 'Benda hidup', 'Batu', 'Mainan'],
      correctIndex: 1,
      explanation: 'Pokok kelapa adalah benda hidup. Ia tumbuh, memerlukan air, dan membiak melalui buah.',
    },
    {
      id: 'q1-hbh-6',
      question: 'Yang manakah ciri benda BUKAN hidup?',
      options: ['Boleh bernafas', 'Boleh membesar', 'Tidak bergerak sendiri', 'Boleh membiak'],
      correctIndex: 2,
      explanation: 'Benda bukan hidup tidak boleh bergerak sendiri, tidak bernafas, dan tidak membiak.',
    },
    {
      id: 'q1-hbh-7',
      question: 'Antara yang berikut, yang manakah benda hidup?',
      options: ['Kereta', 'Rumput', 'Telefon', 'Kasut'],
      correctIndex: 1,
      explanation: 'Rumput adalah tumbuhan — ia benda hidup yang tumbuh dan memerlukan air.',
    },
    {
      id: 'q1-hbh-8',
      question: 'Mengapakah robot BUKAN benda hidup?',
      options: [
        'Kerana robot boleh bergerak',
        'Kerana robot tidak bernafas dan tidak membiak',
        'Kerana robot besar',
        'Kerana robot berwarna',
      ],
      correctIndex: 1,
      explanation: 'Walaupun robot boleh bergerak, ia tidak bernafas, tidak makan, dan tidak membiak secara semula jadi.',
    },
  ],

  // ----- TOPIK 2: Bahagian Tubuh Haiwan (Tahun 1) -----
  'quiz-bahagian-haiwan': [
    {
      id: 'q2-bh-1',
      question: 'Apakah bahagian tubuh burung yang digunakan untuk terbang?',
      options: ['Ekor', 'Sayap', 'Paruh', 'Kaki'],
      correctIndex: 1,
      explanation: 'Burung menggunakan SAYAP untuk terbang di udara.',
    },
    {
      id: 'q2-bh-2',
      question: 'Ikan bergerak di dalam air menggunakan...',
      options: ['Kaki', 'Sayap', 'Sirip dan ekor', 'Tanduk'],
      correctIndex: 2,
      explanation: 'Ikan menggunakan SIRIP dan EKOR untuk berenang di dalam air.',
    },
    {
      id: 'q2-bh-3',
      question: 'Haiwan yang mempunyai PARUH ialah...',
      options: ['Kucing', 'Ular', 'Ayam', 'Arnab'],
      correctIndex: 2,
      explanation: 'Ayam dan burung lain mempunyai PARUH untuk makan.',
    },
    {
      id: 'q2-bh-4',
      question: 'Berapa kaki yang ada pada seekor kucing?',
      options: ['2 kaki', '4 kaki', '6 kaki', '8 kaki'],
      correctIndex: 1,
      explanation: 'Kucing mempunyai 4 KAKI untuk berjalan dan berlari.',
    },
    {
      id: 'q2-bh-5',
      question: 'Badan ikan dilitupi oleh...',
      options: ['Bulu', 'Sisik', 'Kulit berbulu', 'Cangkerang'],
      correctIndex: 1,
      explanation: 'Badan ikan dilitupi oleh SISIK yang licin untuk membantu ia berenang.',
    },
    {
      id: 'q2-bh-6',
      question: 'Haiwan yang mempunyai CANGKERANG ialah...',
      options: ['Burung', 'Kura-kura', 'Kucing', 'Ikan'],
      correctIndex: 1,
      explanation: 'Kura-kura mempunyai CANGKERANG yang keras untuk melindungi tubuhnya.',
    },
    {
      id: 'q2-bh-7',
      question: 'Gajah menggunakan bahagian ini untuk minum air dan mengambil makanan:',
      options: ['Telinga', 'Ekor', 'Belalai', 'Tanduk'],
      correctIndex: 2,
      explanation: 'Gajah menggunakan BELALAI untuk minum air, mengambil makanan, dan bernafas.',
    },
    {
      id: 'q2-bh-8',
      question: 'Kupu-kupu mempunyai berapa sayap?',
      options: ['1 sayap', '2 sayap', '4 sayap', '6 sayap'],
      correctIndex: 2,
      explanation: 'Kupu-kupu mempunyai 4 SAYAP yang cantik berwarna-warni.',
    },
  ],

  // ----- TOPIK 3: Bahagian Tumbuhan (Tahun 1) -----
  'quiz-bahagian-tumbuhan': [
    {
      id: 'q3-bt-1',
      question: 'Bahagian tumbuhan yang menyerap air dari tanah ialah...',
      options: ['Daun', 'Batang', 'Akar', 'Bunga'],
      correctIndex: 2,
      explanation: 'AKAR menyerap air dan mineral dari dalam tanah.',
    },
    {
      id: 'q3-bt-2',
      question: 'Bahagian tumbuhan yang menyokong pokok supaya berdiri tegak ialah...',
      options: ['Bunga', 'Batang', 'Daun', 'Buah'],
      correctIndex: 1,
      explanation: 'BATANG menyokong pokok berdiri tegak dan mengangkut air ke daun.',
    },
    {
      id: 'q3-bt-3',
      question: 'Daun berwarna hijau kerana mengandungi...',
      options: ['Air', 'Klorofil', 'Tanah', 'Gula'],
      correctIndex: 1,
      explanation: 'Daun berwarna hijau kerana mengandungi KLOROFIL yang membantu membuat makanan.',
    },
    {
      id: 'q3-bt-4',
      question: 'Bunga berfungsi untuk...',
      options: ['Menyerap air', 'Membuat makanan', 'Pembiakan tumbuhan', 'Menyokong pokok'],
      correctIndex: 2,
      explanation: 'BUNGA berfungsi untuk PEMBIAKAN tumbuhan melalui proses pendebungaan.',
    },
    {
      id: 'q3-bt-5',
      question: 'Di manakah biji benih tumbuhan terdapat?',
      options: ['Di dalam buah', 'Di dalam daun', 'Di dalam batang', 'Di dalam akar'],
      correctIndex: 0,
      explanation: 'Biji benih terdapat DI DALAM BUAH. Biji benih akan tumbuh menjadi pokok baru.',
    },
    {
      id: 'q3-bt-6',
      question: 'Susunkan dari bawah ke atas: Akar → ? → Daun → Bunga',
      options: ['Buah', 'Batang', 'Biji', 'Air'],
      correctIndex: 1,
      explanation: 'Susunan dari bawah: Akar → BATANG → Daun → Bunga.',
    },
    {
      id: 'q3-bt-7',
      question: 'Apakah fungsi utama daun?',
      options: ['Membuat makanan melalui fotosintesis', 'Menyerap air', 'Memegang pokok di tanah', 'Menghasilkan biji'],
      correctIndex: 0,
      explanation: 'Fungsi utama daun ialah MEMBUAT MAKANAN melalui proses fotosintesis.',
    },
  ],

  // ----- TOPIK 4: Habitat Haiwan (Tahun 2) -----
  'quiz-habitat-haiwan': [
    {
      id: 'q4-hab-1',
      question: 'Ikan hidup di habitat...',
      options: ['Darat', 'Air', 'Udara', 'Gurun'],
      correctIndex: 1,
      explanation: 'Ikan hidup di habitat AIR kerana ia bernafas melalui insang dan berenang menggunakan sirip.',
    },
    {
      id: 'q4-hab-2',
      question: 'Apakah habitat burung helang?',
      options: ['Di dalam air', 'Di dalam tanah', 'Di udara dan pokok tinggi', 'Di dalam gua'],
      correctIndex: 2,
      explanation: 'Burung helang tinggal di UDARA dan membina sarang di POKOK TINGGI atau tebing.',
    },
    {
      id: 'q4-hab-3',
      question: 'Katak boleh hidup di dua habitat iaitu...',
      options: ['Darat dan air', 'Udara dan air', 'Darat dan udara', 'Gua dan laut'],
      correctIndex: 0,
      explanation: 'Katak adalah haiwan amfibia yang boleh hidup di DARAT dan di AIR.',
    },
    {
      id: 'q4-hab-4',
      question: 'Mengapakah beruang kutub hidup di kawasan ais?',
      options: [
        'Kerana ia suka bermain',
        'Kerana badannya sesuai dengan cuaca sejuk',
        'Kerana tiada pokok',
        'Kerana ia takut panas',
      ],
      correctIndex: 1,
      explanation: 'Beruang kutub mempunyai bulu tebal dan lapisan lemak yang melindunginya daripada kesejukan.',
    },
    {
      id: 'q4-hab-5',
      question: 'Haiwan yang tinggal di dalam tanah ialah...',
      options: ['Burung', 'Ikan', 'Cacing tanah', 'Kupu-kupu'],
      correctIndex: 2,
      explanation: 'CACING TANAH tinggal di dalam tanah dan membantu menyuburkan tanah.',
    },
    {
      id: 'q4-hab-6',
      question: 'Apakah maksud "habitat"?',
      options: [
        'Makanan haiwan',
        'Tempat tinggal semula jadi haiwan',
        'Nama haiwan',
        'Bunyi haiwan',
      ],
      correctIndex: 1,
      explanation: 'HABITAT bermaksud tempat tinggal semula jadi di mana haiwan hidup dan mencari makanan.',
    },
  ],

  // ----- TOPIK 5: Keperluan Asas Hidupan (Tahun 2) -----
  'quiz-keperluan-asas': [
    {
      id: 'q5-ka-1',
      question: 'Apakah keperluan asas SEMUA benda hidup?',
      options: ['Telefon dan internet', 'Air, makanan, dan udara', 'Kereta dan rumah', 'Buku dan pen'],
      correctIndex: 1,
      explanation: 'Semua benda hidup memerlukan AIR, MAKANAN, dan UDARA untuk terus hidup.',
    },
    {
      id: 'q5-ka-2',
      question: 'Apa akan berlaku jika tumbuhan tidak mendapat air?',
      options: ['Tumbuh lebih tinggi', 'Layu dan mati', 'Berbunga lebih banyak', 'Tiada kesan'],
      correctIndex: 1,
      explanation: 'Tanpa AIR, tumbuhan akan LAYU dan MATI kerana air diperlukan untuk proses hidup.',
    },
    {
      id: 'q5-ka-3',
      question: 'Tumbuhan memerlukan cahaya matahari untuk...',
      options: ['Bermain', 'Membuat makanan (fotosintesis)', 'Menyanyi', 'Bergerak'],
      correctIndex: 1,
      explanation: 'Tumbuhan memerlukan CAHAYA MATAHARI untuk FOTOSINTESIS — proses membuat makanan.',
    },
    {
      id: 'q5-ka-4',
      question: 'Haiwan bernafas untuk mendapatkan...',
      options: ['Karbon dioksida', 'Nitrogen', 'Oksigen', 'Helium'],
      correctIndex: 2,
      explanation: 'Haiwan bernafas untuk mendapatkan OKSIGEN yang diperlukan oleh badan.',
    },
    {
      id: 'q5-ka-5',
      question: 'Manakah yang BUKAN keperluan asas haiwan?',
      options: ['Air', 'Makanan', 'Tempat perlindungan', 'Televisyen'],
      correctIndex: 3,
      explanation: 'TELEVISYEN bukan keperluan asas! Haiwan perlukan air, makanan, udara, dan tempat perlindungan.',
    },
    {
      id: 'q5-ka-6',
      question: 'Mengapakah ikan tidak boleh hidup lama di luar air?',
      options: [
        'Kerana ikan takut',
        'Kerana ikan bernafas melalui insang yang perlukan air',
        'Kerana ikan tidak suka cahaya',
        'Kerana ikan tidak ada kaki',
      ],
      correctIndex: 1,
      explanation: 'Ikan bernafas menggunakan INSANG yang hanya boleh berfungsi dalam AIR.',
    },
    {
      id: 'q5-ka-7',
      question: 'Pokok yang diletakkan di dalam bilik gelap selama seminggu akan...',
      options: [
        'Tumbuh lebih subur',
        'Daunnya menguning dan layu',
        'Berbuah lebat',
        'Tiada perubahan',
      ],
      correctIndex: 1,
      explanation: 'Tanpa cahaya, daun akan MENGUNING kerana tumbuhan tidak dapat membuat makanan.',
    },
  ],
};
