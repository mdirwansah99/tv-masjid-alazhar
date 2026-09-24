// app.js - Enjin v7.0 (Islamic Arch Design)

// ============================================================
// 1. BULAN HIJRAH & HARI MELAYU
// ============================================================
const BULAN_HIJRAH = ['Muharram','Safar','Rabiul Awal','Rabiul Akhir','Jamadil Awal','Jamadil Akhir','Rejab','Syaaban','Ramadan','Syawal','Zulkaedah','Zulhijjah'];
const HARI_MELAYU = ['AHAD','ISNIN','SELASA','RABU','KHAMIS','JUMAAT','SABTU'];
const BULAN_MASIHI = ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'];

const PRAYER_ICONS = { fajr:'🌙', dhuhr:'☀️', asr:'🌤️', maghrib:'🌅', isha:'🌙' };

// ============================================================
// KOLEKSI PERKONGSIAN ILMU ISLAM
// ============================================================
const ILMU_KOLEKSI = [
    // 10 HADIS SAHIH
    { cat:"HADIS SAHIH", text:"\"Sebaik-baik manusia ialah yang paling bermanfaat kepada manusia lain.\"", src:"HR. Ahmad, al-Tabrani" },
    { cat:"HADIS SAHIH", text:"\"Senyumanmu di hadapan saudaramu adalah sedekah.\"", src:"HR. al-Tirmidzi" },
    { cat:"HADIS SAHIH", text:"\"Barangsiapa yang beriman kepada Allah dan Hari Akhirat, maka hendaklah dia berkata baik atau diam.\"", src:"HR. al-Bukhari & Muslim" },
    { cat:"HADIS SAHIH", text:"\"Tidaklah sempurna iman seseorang sehingga dia mencintai saudaranya sebagaimana dia mencintai dirinya sendiri.\"", src:"HR. al-Bukhari & Muslim" },
    { cat:"HADIS SAHIH", text:"\"Dua kalimah yang ringan di lidah, berat di timbangan, dan disukai ar-Rahman: Subhanallahi Wabihamdih, Subhanallahil 'Azim.\"", src:"HR. al-Bukhari" },
    { cat:"HADIS SAHIH", text:"\"Kebersihan itu sebahagian daripada iman.\"", src:"HR. Muslim" },
    { cat:"HADIS SAHIH", text:"\"Orang mukmin yang kuat itu lebih baik dan lebih dicintai Allah daripada mukmin yang lemah.\"", src:"HR. Muslim" },
    { cat:"HADIS SAHIH", text:"\"Barangsiapa menempuh suatu jalan untuk mencari ilmu, maka Allah akan memudahkan baginya jalan menuju syurga.\"", src:"HR. Muslim" },
    { cat:"HADIS SAHIH", text:"\"Tiada balasan yang sesuai bagi haji yang mabrur melainkan syurga.\"", src:"HR. al-Bukhari" },
    { cat:"HADIS SAHIH", text:"\"Malu itu sebahagian daripada iman.\"", src:"HR. al-Bukhari & Muslim" },

    // 10 QUOTE AL-QURAN
    { cat:"AYAT AL-QURAN", text:"\"Sesungguhnya bersama kesulitan itu ada kemudahan.\"", src:"Surah al-Insyirah, 94:5" },
    { cat:"AYAT AL-QURAN", text:"\"Dan Tuhanmu berfirman: Berdoalah kepada-Ku, nescaya Aku perkenankan doa permohonanmu.\"", src:"Surah Ghafir, 40:60" },
    { cat:"AYAT AL-QURAN", text:"\"Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya.\"", src:"Surah al-Baqarah, 2:286" },
    { cat:"AYAT AL-QURAN", text:"\"Wahai orang-orang yang beriman! Mohonlah pertolongan dengan sabar dan solat.\"", src:"Surah al-Baqarah, 2:153" },
    { cat:"AYAT AL-QURAN", text:"\"Dan sesiapa yang bertakwa kepada Allah, nescaya Dia akan mengadakan baginya jalan keluar.\"", src:"Surah al-Talaq, 65:2" },
    { cat:"AYAT AL-QURAN", text:"\"Cukuplah Allah bagiku, tiada Tuhan selain Dia. Hanya kepada-Nya aku bertawakkal.\"", src:"Surah al-Taubah, 9:129" },
    { cat:"AYAT AL-QURAN", text:"\"Sesungguhnya solat itu mencegah daripada perbuatan keji dan mungkar.\"", src:"Surah al-Ankabut, 29:45" },
    { cat:"AYAT AL-QURAN", text:"\"Ingatlah, hanya dengan mengingati Allah hati menjadi tenang.\"", src:"Surah al-Ra'd, 13:28" },
    { cat:"AYAT AL-QURAN", text:"\"Maka nikmat Tuhan kamu yang manakah yang kamu dustakan?\"", src:"Surah ar-Rahman, 55:13" },
    { cat:"AYAT AL-QURAN", text:"\"Jangan kamu bersedih hati, sesungguhnya Allah ada bersama kita.\"", src:"Surah at-Taubah, 9:40" },

    // 10 MOTIVASI ISLAMI
    { cat:"MOTIVASI ISLAMI", text:"\"Tidak ada kesedihan yang kekal, selagi kita ada Allah untuk bersandar.\"", src:"Mutiara Kata" },
    { cat:"MOTIVASI ISLAMI", text:"\"Terkadang Allah mematahkan rancangan kita, untuk menyelamatkan kita daripada kemudaratan.\"", src:"Mutiara Kata" },
    { cat:"MOTIVASI ISLAMI", text:"\"Ujian yang datang bukan untuk melemahkan, tetapi untuk menjadikan iman kita lebih teguh.\"", src:"Mutiara Kata" },
    { cat:"MOTIVASI ISLAMI", text:"\"Setiap langkah menuju masjid adalah penggugur dosa dan peningkat darjat di sisi-Nya.\"", src:"Mutiara Kata" },
    { cat:"MOTIVASI ISLAMI", text:"\"Rezeki itu bukan hanya wang. Kesihatan, keluarga, dan ketenangan hati juga rezeki yang agung.\"", src:"Mutiara Kata" },
    { cat:"MOTIVASI ISLAMI", text:"\"Berbuat baiklah walau sekecil zarah. Kau tidak tahu kebaikan mana yang membawamu ke Syurga.\"", src:"Mutiara Kata" },
    { cat:"MOTIVASI ISLAMI", text:"\"Solat bukanlah sekadar kewajipan, tetapi waktu untuk hati berehat dari kelelahan dunia.\"", src:"Mutiara Kata" },
    { cat:"MOTIVASI ISLAMI", text:"\"Jadilah pemaaf, kerana Allah itu Maha Pemaaf. Hati yang tenang bermula daripada kemaafan.\"", src:"Mutiara Kata" },
    { cat:"MOTIVASI ISLAMI", text:"\"Jangan pernah berputus asa dengan rahmat Allah, sesungguhnya Dia sentiasa mendengar doamu.\"", src:"Mutiara Kata" },
    { cat:"MOTIVASI ISLAMI", text:"\"Dunia ini hanya persinggahan sebentar, jadikan akhirat sebagai destinasi yang kekal.\"", src:"Mutiara Kata" }
];

// ============================================================
// 2. ZON JAKIM
// ============================================================
const ZONE_MAP = {
    "SBH07":{lat:5.9804,lng:116.0735,label:"Kota Kinabalu, Penampang, Tuaran"},
    "SBH01":{lat:5.8402,lng:118.1179,label:"Sandakan, Beluran, Kinabatangan"},
    "SBH02":{lat:5.3117,lng:117.0839,label:"Ranau, Tambunan, Keningau"},
    "SBH03":{lat:5.0410,lng:118.5628,label:"Lahad Datu, Kunak, Silam"},
    "SBH04":{lat:4.2498,lng:117.8871,label:"Tawau, Semporna"},
    "SBH05":{lat:4.8924,lng:115.6142,label:"Sipitang, Tenom, Long Pasia"},
    "SBH06":{lat:6.7298,lng:116.8338,label:"Kudat, Kota Marudu, Pitas"},
    "SBH08":{lat:5.3026,lng:115.2478,label:"Labuan"},
    "SBH09":{lat:4.5759,lng:117.5674,label:"Kalabakan, Gunung Rara"},
    "SWK01":{lat:1.5533,lng:110.3592,label:"Kuching, Lundu, Sematan"},
    "SWK02":{lat:1.8548,lng:111.1556,label:"Sri Aman, Betong"},
    "SWK03":{lat:2.3000,lng:111.8333,label:"Sibu, Mukah, Kanowit"},
    "SWK07":{lat:4.5363,lng:114.1571,label:"Miri, Sibuti, Lawas"},
    "WLY01":{lat:3.1390,lng:101.6869,label:"Kuala Lumpur, Putrajaya"},
    "WLY02":{lat:5.2831,lng:115.2308,label:"Labuan"},
    "SGR01":{lat:3.1579,lng:101.7116,label:"Gombak, Petaling, Sepang"},
    "SGR02":{lat:3.3615,lng:101.5188,label:"Kuala Selangor, Sabak Bernam"},
    "SGR03":{lat:3.0319,lng:101.4420,label:"Klang, Kuala Langat"},
    "JHR01":{lat:2.0375,lng:102.5657,label:"Pulau Aur, Pemanggil"},
    "JHR02":{lat:1.4854,lng:103.7618,label:"Johor Bahru, Kota Tinggi"},
    "JHR03":{lat:1.8548,lng:103.4540,label:"Kluang, Pontian"},
    "JHR04":{lat:2.0625,lng:102.9419,label:"Batu Pahat, Muar, Segamat"},
    "KDH01":{lat:6.4414,lng:100.1986,label:"Pokok Sena, Darulaman"},
    "PNG01":{lat:5.4141,lng:100.3288,label:"Pulau Pinang"},
    "PRK01":{lat:4.5921,lng:101.0901,label:"Ipoh, Kuala Kangsar"},
    "NGS01":{lat:2.7258,lng:101.9424,label:"Negeri Sembilan"},
    "MLK01":{lat:2.1896,lng:102.2501,label:"Melaka"},
    "PHG01":{lat:3.8077,lng:103.3260,label:"Kuantan, Pekan, Rompin"},
    "TRG01":{lat:5.3117,lng:103.1324,label:"Kuala Terengganu, Besut"},
    "KTN01":{lat:6.1254,lng:102.2384,label:"Kota Bharu, Bachok"},
    "PLS01":{lat:6.4449,lng:100.2048,label:"Kangar, Padang Besar, Arau"},
};

// ============================================================
// 3. THEMES & STATE
// ============================================================
const THEMES = {
    "default": { // Klasik Biru Emas
        "--color-bg": "#0a1128",
        "--color-bg-light": "#111d3a",
        "--color-bg-gradient-top": "#0d1a36",
        "--color-accent": "#c9a84c",
        "--color-accent-light": "#e8d48b",
        "--color-accent-dark": "#8a6d2b",
        "--color-accent-rgba": "rgba(201,168,76,0.4)"
    },
    "emerald": { // Hijau Zamrud
        "--color-bg": "#022c22", // emerald-950
        "--color-bg-light": "#064e3b", // emerald-900
        "--color-bg-gradient-top": "#022c22",
        "--color-accent": "#fcd34d", // amber-300
        "--color-accent-light": "#fde68a", // amber-200
        "--color-accent-dark": "#d97706", // amber-600
        "--color-accent-rgba": "rgba(252,211,77,0.4)"
    },
    "maroon": { // Merah Delima
        "--color-bg": "#4c0519", // rose-950
        "--color-bg-light": "#881337", // rose-900
        "--color-bg-gradient-top": "#4c0519",
        "--color-accent": "#fef08a", // yellow-200
        "--color-accent-light": "#fef9c3", // yellow-100
        "--color-accent-dark": "#ca8a04", // yellow-600
        "--color-accent-rgba": "rgba(254,240,138,0.4)"
    },
    "dark": { // Hitam Elegan
        "--color-bg": "#000000",
        "--color-bg-light": "#1f2937", // gray-800
        "--color-bg-gradient-top": "#000000",
        "--color-accent": "#e5e7eb", // gray-200
        "--color-accent-light": "#f9fafb", // gray-50
        "--color-accent-dark": "#9ca3af", // gray-400
        "--color-accent-rgba": "rgba(229,231,235,0.4)"
    }
};

let appConfig = {
    mosqueName:"MASJID AL AZHAR",
    mosqueSub:"Kampung Sepakat Jaya, Sepanggar, Kota Kinabalu",
    zone:"SBH07", 
    iqamahSubuh:20, iqamahZohor:15, iqamahAsar:15, iqamahMaghrib:10, iqamahIsyak:15, 
    solatMins:15, sheetId:"",
    announcement:"", announceTitle:"", announceDesc:"",
    finPeriod:"", finPrev:0, finIn:0, finOut:0, finNote:""
};
let dailyPrayerTimes = [];

// ============================================================
// 4. INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadAdminData();
    populateZoneDropdown();
    initSettingsModal();
    initFullscreen();
    startClock();
    startIlmuSlideshow();
    fetchPrayerTimes();
    setInterval(fetchPrayerTimes, 6*60*60*1000);
    
    // Listen to Firebase Realtime Database
    if(typeof database !== 'undefined') {
        database.ref('mosqueData').on('value', (snapshot) => {
            if(snapshot.exists()) {
                const data = snapshot.val();
                if(data.mosqueConfigV4) {
                    localStorage.setItem('mosqueConfigV4', JSON.stringify(data.mosqueConfigV4));
                }
                if(data.mosqueCustomSlides) {
                    localStorage.setItem('mosqueCustomSlides', JSON.stringify(data.mosqueCustomSlides));
                }
                loadAdminData(); // Terapkan perubahan ke UI serta-merta
            }
        });
    }

    // Refresh admin data setiap 30 saat (fallback jika offline)
    setInterval(loadAdminData, 30000);
    if(appConfig.sheetId){ fetchGoogleSheets(); setInterval(fetchGoogleSheets,10*60*1000); }
});

function loadSettings(){
    const s = localStorage.getItem('mosqueConfigV4');
    if(s) appConfig = {...appConfig,...JSON.parse(s)};
    
    // 0. Apply Theme
    const themeName = appConfig.theme || 'default';
    const selectedTheme = THEMES[themeName] || THEMES['default'];
    for (const [key, value] of Object.entries(selectedTheme)) {
        document.documentElement.style.setProperty(key, value);
    }
    
    // 1. Text Umum
    document.getElementById('display-mosque-name').innerText = appConfig.mosqueName;
    document.getElementById('display-mosque-sub').innerText = appConfig.mosqueSub;
    const zoneInfo = ZONE_MAP[appConfig.zone];
    document.getElementById('location-text').innerText = `Waktu Tempatan: ${zoneInfo ? zoneInfo.label.split(',')[0] : appConfig.zone}`;
    
    // 2. Ticker
    if(appConfig.announcement && appConfig.announcement.trim()) {
        document.getElementById('running-text').innerText = appConfig.announcement;
    }
    
    // 3. Paparan Kewangan
    const finPanel = document.getElementById('finance-panel-ui');
    if(appConfig.finPeriod || appConfig.finIn || appConfig.finOut || appConfig.finPrev){
        const prev = parseFloat(appConfig.finPrev)||0;
        const finIn = parseFloat(appConfig.finIn)||0;
        const finOut = parseFloat(appConfig.finOut)||0;
        const baki = prev + finIn - finOut;
        
        document.getElementById('ui-fin-period').innerText = `Bulan: ${appConfig.finPeriod || 'Terkini'}`;
        document.getElementById('ui-fin-in').innerText = `RM ${finIn.toFixed(2)}`;
        document.getElementById('ui-fin-out').innerText = `RM ${finOut.toFixed(2)}`;
        document.getElementById('ui-fin-balance').innerText = `RM ${baki.toFixed(2)}`;
        
        const finNoteEl = document.getElementById('ui-fin-note');
        if(appConfig.finNote && appConfig.finNote.trim()){
            finNoteEl.innerText = appConfig.finNote;
            finNoteEl.classList.remove('hidden');
        } else {
            finNoteEl.classList.add('hidden');
        }
        
        finPanel.classList.remove('hidden');
        setTimeout(()=> finPanel.classList.remove('opacity-0'), 100);
    } else {
        finPanel.classList.add('hidden');
    }
    
    // 4. Paparan Pengumuman Khas
    const annPanel = document.getElementById('announce-panel-ui');
    const annTitle = (appConfig.announceTitle || '').trim();
    const annDesc = (appConfig.announceDesc || '').trim();
    if(annTitle || annDesc){
        document.getElementById('ui-announce-title').innerText = (annTitle || 'PENGUMUMAN').toUpperCase();
        document.getElementById('ui-announce-desc').innerText = annDesc || '';
        annPanel.classList.remove('hidden');
        setTimeout(()=> annPanel.classList.remove('opacity-0'), 100);
    } else {
        annPanel.classList.add('hidden');
    }
}

function loadAdminData(){
    // Baca custom slides dari admin panel
    const cs = localStorage.getItem('mosqueCustomSlides');
    if(cs){
        let parsed = JSON.parse(cs);
        // Firebase boleh tukar array jadi object {0:..., 1:...} — convert balik
        if(parsed && !Array.isArray(parsed) && typeof parsed === 'object'){
            parsed = Object.values(parsed);
        }
        window._customSlides = Array.isArray(parsed) ? parsed : [];
    }
    // Refresh loadSettings supaya UI dikemas kini
    loadSettings();
}

// ============================================================
// 4b. PERKONGSIAN ILMU SLIDESHOW (setiap 10 saat)
// ============================================================
let ilmuIndex = 0;

function getAllIlmu(){
    let all = [...ILMU_KOLEKSI];
    if(window._customSlides && window._customSlides.length > 0){
        window._customSlides.forEach(s => {
            all.unshift({ cat: s.category, text: `"${s.content}"`, src: s.source });
        });
    }

    
    return all;
}

function startIlmuSlideshow(){
    showIlmu(0);
    setInterval(() => {
        const all = getAllIlmu();
        ilmuIndex = (ilmuIndex + 1) % all.length;
        showIlmu(ilmuIndex);
    }, 10000); // Setiap 10 saat
}

function showIlmu(i){
    const all = getAllIlmu();
    if(all.length === 0) return;
    const item = all[i % all.length];
    const container = document.getElementById('ilmu-container');
    const catEl = document.getElementById('ilmu-category');
    const contentEl = document.getElementById('ilmu-content');
    const srcEl = document.getElementById('ilmu-source');

    // Fade animation
    container.classList.remove('ilmu-fade');
    void container.offsetWidth;
    container.classList.add('ilmu-fade');

    // Warna mengikut kategori
    const colors = { 'HADIS SAHIH':'var(--color-accent)', 'AYAT AL-QURAN':'#10B981', 'MOTIVASI ISLAMI':'#60A5FA', 'DOA HARIAN':'#A78BFA', 'PENGUMUMAN MASJID':'#F59E0B' };
    catEl.style.color = colors[item.cat] || 'var(--color-accent)';
    catEl.innerText = item.cat;
    contentEl.innerText = item.text;
    srcEl.innerText = `— ${item.src}`;
}

function populateZoneDropdown(){
    const sel = document.getElementById('input-zone');
    sel.innerHTML='';
    for(const[code,info] of Object.entries(ZONE_MAP)){
        const o=document.createElement('option');
        o.value=code; o.textContent=`${code} - ${info.label}`;
        if(code===appConfig.zone) o.selected=true;
        sel.appendChild(o);
    }
}

// ============================================================
// 5. FORMAT 12-JAM
// ============================================================
function to12h(time24){
    const [h,m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return { display: `${String(hr).padStart(2,'0')}:${String(m).padStart(2,'0')}`, ampm };
}

// ============================================================
// 6. FETCH WAKTU SOLAT
// ============================================================
async function fetchPrayerTimes(){
    const zone=appConfig.zone, zoneInfo=ZONE_MAP[zone];
    if(!zoneInfo){useFallbackData();return;}
    let ok=false;
    if(!ok) ok=await tryJakimDirect(zone);
    if(!ok) ok=await tryAladhanAPI(zoneInfo.lat,zoneInfo.lng);
    if(!ok) useFallbackData();
    if(dailyPrayerTimes.length>0){
        renderPrayerCards(null,"NORMAL");
        if(window.engineInterval) clearInterval(window.engineInterval);
        window.engineInterval=setInterval(smartEngineTick,1000);
        smartEngineTick();
    }
}

async function tryJakimDirect(zone){
    try{
        const r=await fetch(`https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=today&zone=${zone}`,{signal:AbortSignal.timeout(5000)});
        const d=await r.json();
        if(d&&d.prayerTime&&d.prayerTime.length>0){
            const t=d.prayerTime[0];
            dailyPrayerTimes=[
                {id:'fajr',name:'Subuh',time:t.fajr.substring(0,5)},
                {id:'dhuhr',name:'Zohor',time:t.dhuhr.substring(0,5)},
                {id:'asr',name:'Asar',time:t.asr.substring(0,5)},
                {id:'maghrib',name:'Maghrib',time:t.maghrib.substring(0,5)},
                {id:'isha',name:'Isyak',time:t.isha.substring(0,5)}
            ];
            setHijriFromJakim(t.hijri);
            console.log("✅ JAKIM OK"); return true;
        }
    }catch(e){console.warn("⚠️ JAKIM:",e.message);}
    return false;
}

async function tryAladhanAPI(lat,lng){
    try{
        const r=await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=99&methodSettings=20,null,18`,{signal:AbortSignal.timeout(8000)});
        const d=await r.json();
        if(d&&d.data&&d.data.timings){
            const t=d.data.timings;
            dailyPrayerTimes=[
                {id:'fajr',name:'Subuh',time:t.Fajr.substring(0,5)},
                {id:'dhuhr',name:'Zohor',time:t.Dhuhr.substring(0,5)},
                {id:'asr',name:'Asar',time:t.Asr.substring(0,5)},
                {id:'maghrib',name:'Maghrib',time:t.Maghrib.substring(0,5)},
                {id:'isha',name:'Isyak',time:t.Isha.substring(0,5)}
            ];
            if(d.data.date&&d.data.date.hijri){
                const h=d.data.date.hijri;
                const bulan=BULAN_HIJRAH[parseInt(h.month.number)-1]||h.month.en;
                document.getElementById('date-hijrah').innerText=`${h.day} ${bulan.toUpperCase()} ${h.year}H`;
            }
            console.log("✅ Aladhan OK"); return true;
        }
    }catch(e){console.warn("⚠️ Aladhan:",e.message);}
    return false;
}

function setHijriFromJakim(str){
    if(!str)return;
    const p=str.split('-');
    if(p.length===3){
        const bulan=BULAN_HIJRAH[parseInt(p[1])-1]||p[1];
        document.getElementById('date-hijrah').innerText=`${parseInt(p[2])} ${bulan.toUpperCase()} ${p[0]}H`;
    }
}

function useFallbackData(){
    dailyPrayerTimes=[
        {id:'fajr',name:'Subuh',time:'04:59'},{id:'dhuhr',name:'Zohor',time:'12:16'},
        {id:'asr',name:'Asar',time:'15:16'},{id:'maghrib',name:'Maghrib',time:'18:20'},
        {id:'isha',name:'Isyak',time:'19:30'}
    ];
    document.getElementById('date-hijrah').innerText='DATA LUAR TALIAN';
}

// ============================================================
// 7. ENJIN PINTAR
// ============================================================
function smartEngineTick(){
    if(!dailyPrayerTimes.length) return;
    const now=new Date();
    let prayerDates=dailyPrayerTimes.map(p=>{
        let d=new Date();
        const[h,m]=p.time.split(':');
        d.setHours(parseInt(h),parseInt(m),0,0);
        return{...p,dateObj:d};
    });

    let state="NORMAL", activeP=null, targetD=null, nextP=null;

    for(let i=0;i<prayerDates.length;i++){
        let p=prayerDates[i];
        let tMasuk=p.dateObj;
        
        let pIqamahMins = 10;
        if(p.name==='Subuh') pIqamahMins = appConfig.iqamahSubuh ?? 20;
        else if(p.name==='Zohor') pIqamahMins = appConfig.iqamahZohor ?? 15;
        else if(p.name==='Asar') pIqamahMins = appConfig.iqamahAsar ?? 15;
        else if(p.name==='Maghrib') pIqamahMins = appConfig.iqamahMaghrib ?? 10;
        else if(p.name==='Isyak') pIqamahMins = appConfig.iqamahIsyak ?? 15;
        
        let azanMins = Math.min(3, pIqamahMins);
        let tAzanEnd = new Date(tMasuk.getTime() + (azanMins * 60000));
        let tIqEnd=new Date(tMasuk.getTime()+(pIqamahMins*60000));
        let tSolEnd=new Date(tIqEnd.getTime()+(appConfig.solatMins*60000));
        
        if(azanMins > 0 && now>=tMasuk && now<tAzanEnd){ state="AZAN"; activeP=p; targetD=tAzanEnd; break; }
        else if(now>=tAzanEnd && now<tIqEnd){ state="IQAMAH"; activeP=p; targetD=tIqEnd; break; }
        else if(now>=tIqEnd && now<tSolEnd){ state="SOLAT"; activeP=p; targetD=tSolEnd; break; }
    }

    if(state==="NORMAL"){
        for(let i=0;i<prayerDates.length;i++){
            if(now<prayerDates[i].dateObj){ nextP=prayerDates[i]; break; }
        }
        if(!nextP){ nextP=prayerDates[0]; let tm=new Date(prayerDates[0].dateObj); tm.setDate(tm.getDate()+1); targetD=tm; }
        else { targetD=nextP.dateObj; }
    }

    updateUI(state, activeP, nextP, targetD, now);
    renderPrayerCards(state==="NORMAL"?findCurrent(prayerDates,now):activeP, state);
}

function findCurrent(pd,now){
    for(let i=pd.length-1;i>=0;i--){ if(now>=pd[i].dateObj) return pd[i]; }
    return null;
}

// ============================================================
// 8. UPDATE UI
// ============================================================
function updateUI(state, activeP, nextP, targetD, now){
    const diff=Math.max(0,targetD-now);
    const h=Math.floor((diff/(1000*60*60))%24);
    const m=Math.floor((diff/1000/60)%60);
    const s=Math.floor((diff/1000)%60);

    const solatOverlay=document.getElementById('solat-overlay');
    const azanOverlay=document.getElementById('azan-overlay');
    const iqDisplay=document.getElementById('iqamah-display');
    const iqLabel=document.getElementById('iqamah-label');
    const nextText=document.getElementById('next-prayer-text');

    if(state==="NORMAL"){
        solatOverlay.classList.remove('active');
        azanOverlay.classList.remove('active');
        // Next prayer text
        if(nextP){
            if(h>0) nextText.innerText=`${nextP.name.toUpperCase()} dalam ${h} jam ${String(m).padStart(2,'0')} minit`;
            else nextText.innerText=`${nextP.name.toUpperCase()} dalam ${m} minit ${String(s).padStart(2,'0')} saat`;
        }
        if(iqDisplay) iqDisplay.innerText='--:--';
        if(iqLabel) iqLabel.innerText='minit';
    }
    else if(state==="AZAN"){
        solatOverlay.classList.remove('active');
        azanOverlay.classList.add('active');
        // Tunjuk paparan Azan
        document.getElementById('azan-icon').innerText = '🕌';
        document.getElementById('azan-title').innerText = `AZAN ${activeP.name.toUpperCase()}`;
        document.getElementById('azan-subtitle').innerText = 'Azan Sedang Berkumandang';
        document.getElementById('azan-desc').innerText = 'Sila Jawab Azan & Hentikan Seketika Segala Aktiviti';
        document.getElementById('azan-countdown-area').classList.add('hidden');
    }
    else if(state==="IQAMAH"){
        solatOverlay.classList.remove('active');
        azanOverlay.classList.add('active'); // KEKAL gelap!
        // Tukar kandungan ke mod Iqamah countdown
        document.getElementById('azan-icon').innerText = '🤲';
        document.getElementById('azan-title').innerText = `${activeP.name.toUpperCase()} — Menunggu Iqamah`;
        document.getElementById('azan-subtitle').innerText = 'Sila Bersiap Sedia Untuk Bersolat';
        document.getElementById('azan-desc').innerText = 'Luruskan & Rapatkan Saf • Matikan Telefon Bimbit';
        // Tunjuk countdown
        const countdownArea = document.getElementById('azan-countdown-area');
        countdownArea.classList.remove('hidden');
        document.getElementById('azan-countdown-timer').innerText = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
    else if(state==="SOLAT"){
        azanOverlay.classList.remove('active');
        solatOverlay.classList.add('active');
    }
}

function renderPrayerCards(activeP, currentState){
    const c=document.getElementById('prayer-cards-container');
    c.innerHTML='';
    dailyPrayerTimes.forEach(p=>{
        const isActive=activeP&&p.id===activeP.id;
        let cardClass='prayer-card', txtClass='text-gray-500';
        if(isActive&&currentState==='IQAMAH'){ cardClass='prayer-card prayer-card-active'; txtClass='text-gold font-bold'; }
        else if(isActive){ cardClass='prayer-card prayer-card-active'; txtClass='text-gold'; }

        const t12=to12h(p.time);
        const icon=PRAYER_ICONS[p.id]||'🕐';

        c.innerHTML+=`
            <div class="${cardClass}">
                <p class="text-xs ${txtClass} uppercase tracking-widest mb-1">${icon} ${p.name}</p>
                <p class="text-3xl font-clock font-bold text-white">${t12.display} <span class="text-lg text-goldLight">${t12.ampm}</span></p>
            </div>`;
    });

    // Iqamah card (ke-6)
    const iqState=currentState==='IQAMAH'?'prayer-card prayer-card-iqamah':'prayer-card';
    c.innerHTML+=`
        <div class="${iqState}" style="border-color:rgba(201,168,76,0.4);">
            <p class="text-xs text-gold uppercase tracking-widest mb-1">IQAMAH DALAM:</p>
            <p class="text-3xl font-clock font-bold text-gold" id="iqamah-display">--:--</p>
            <p class="text-xs text-gray-500" id="iqamah-label">minit</p>
        </div>`;
}

// ============================================================
// 9. JAM MASA SEBENAR
// ============================================================
function startClock(){
    function update(){
        const now=new Date();
        const h=now.getHours(), m=now.getMinutes(), s=now.getSeconds();
        const ampm=h>=12?'PM':'AM';
        const hr12=h%12||12;
        document.getElementById('clock-time').innerText=`${String(hr12).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
        const secEl = document.getElementById('clock-sec');
        if(secEl) secEl.innerText=`:${String(s).padStart(2,'0')}`;
        document.getElementById('clock-ampm').innerText=ampm;
        document.getElementById('clock-day').innerText=HARI_MELAYU[now.getDay()];
        document.getElementById('date-masihi').innerText=`${now.getDate()} ${BULAN_MASIHI[now.getMonth()]} ${now.getFullYear()}`;
    }
    setInterval(update,1000);
    update();
}

// ============================================================
// 10. GOOGLE SHEETS
// ============================================================
async function fetchGoogleSheets(){
    if(!appConfig.sheetId)return;
    try{
        const r=await fetch(`https://docs.google.com/spreadsheets/d/${appConfig.sheetId}/gviz/tq?tqx=out:csv`);
        const t=await r.text();
        const rows=t.split('\n');
        if(rows.length>=2){
            const cols=rows[1].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            if(cols){ const c=cols.map(s=>s.replace(/(^"|"$)/g,'')); if(c[0]) appConfig.announcement=c[0]; }
        }
    }catch(e){console.error("Sheets:",e);}
}

// ============================================================
// 11. TETAPAN
// ============================================================
function initSettingsModal(){
    const modal=document.getElementById('settings-modal');

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn=>{
        btn.addEventListener('click',()=>{
            document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c=>c.classList.add('hidden'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.remove('hidden');
        });
    });

    // Auto-calculate baki
    ['input-fin-prev','input-fin-in','input-fin-out'].forEach(id=>{
        const el=document.getElementById(id);
        if(el) el.addEventListener('input',calcBalance);
    });

    // Load values
    document.getElementById('input-name').value=appConfig.mosqueName;
    document.getElementById('input-sub').value=appConfig.mosqueSub;
    document.getElementById('input-zone').value=appConfig.zone;
    if(document.getElementById('input-theme')) document.getElementById('input-theme').value=appConfig.theme||'default';
    if(document.getElementById('input-iqamah-subuh')) document.getElementById('input-iqamah-subuh').value = appConfig.iqamahSubuh ?? 20;
    if(document.getElementById('input-iqamah-zohor')) document.getElementById('input-iqamah-zohor').value = appConfig.iqamahZohor ?? 15;
    if(document.getElementById('input-iqamah-asar')) document.getElementById('input-iqamah-asar').value = appConfig.iqamahAsar ?? 15;
    if(document.getElementById('input-iqamah-maghrib')) document.getElementById('input-iqamah-maghrib').value = appConfig.iqamahMaghrib ?? 10;
    if(document.getElementById('input-iqamah-isyak')) document.getElementById('input-iqamah-isyak').value = appConfig.iqamahIsyak ?? 15;
    document.getElementById('input-solat').value=appConfig.solatMins;
    document.getElementById('input-sheet').value=appConfig.sheetId;
    document.getElementById('input-announce').value=appConfig.announcement||'';
    document.getElementById('input-announce-title').value=appConfig.announceTitle||'';
    document.getElementById('input-announce-desc').value=appConfig.announceDesc||'';
    document.getElementById('input-fin-period').value=appConfig.finPeriod||'';
    document.getElementById('input-fin-prev').value=appConfig.finPrev||'';
    document.getElementById('input-fin-in').value=appConfig.finIn||'';
    document.getElementById('input-fin-out').value=appConfig.finOut||'';
    document.getElementById('input-fin-note').value=appConfig.finNote||'';
    calcBalance();

    document.getElementById('btn-settings').onclick=()=>modal.classList.add('active');
    document.getElementById('btn-cancel').onclick=()=>modal.classList.remove('active');
    document.getElementById('btn-save').onclick=()=>{
        const themeVal = document.getElementById('input-theme') ? document.getElementById('input-theme').value : 'default';
        const cfg={
            mosqueName:document.getElementById('input-name').value,
            mosqueSub:document.getElementById('input-sub').value,
            zone:document.getElementById('input-zone').value,
            theme:themeVal,
            iqamahSubuh: document.getElementById('input-iqamah-subuh') ? parseInt(document.getElementById('input-iqamah-subuh').value) || 20 : appConfig.iqamahSubuh,
            iqamahZohor: document.getElementById('input-iqamah-zohor') ? parseInt(document.getElementById('input-iqamah-zohor').value) || 15 : appConfig.iqamahZohor,
            iqamahAsar: document.getElementById('input-iqamah-asar') ? parseInt(document.getElementById('input-iqamah-asar').value) || 15 : appConfig.iqamahAsar,
            iqamahMaghrib: document.getElementById('input-iqamah-maghrib') ? parseInt(document.getElementById('input-iqamah-maghrib').value) || 10 : appConfig.iqamahMaghrib,
            iqamahIsyak: document.getElementById('input-iqamah-isyak') ? parseInt(document.getElementById('input-iqamah-isyak').value) || 15 : appConfig.iqamahIsyak,
            solatMins:parseInt(document.getElementById('input-solat').value)||15,
            sheetId:document.getElementById('input-sheet').value,
            announcement:document.getElementById('input-announce').value,
            announceTitle:document.getElementById('input-announce-title').value,
            announceDesc:document.getElementById('input-announce-desc').value,
            finPeriod:document.getElementById('input-fin-period').value,
            finPrev:parseFloat(document.getElementById('input-fin-prev').value)||0,
            finIn:parseFloat(document.getElementById('input-fin-in').value)||0,
            finOut:parseFloat(document.getElementById('input-fin-out').value)||0,
            finNote:document.getElementById('input-fin-note').value,
        };
        localStorage.setItem('mosqueConfigV4',JSON.stringify(cfg));
        
        if(typeof database !== 'undefined') {
            database.ref('mosqueData/mosqueConfigV4').set(cfg).then(() => {
                window.location.reload();
            }).catch(() => window.location.reload());
        } else {
            window.location.reload();
        }
    };
}

function calcBalance(){
    const prev=parseFloat(document.getElementById('input-fin-prev').value)||0;
    const inc=parseFloat(document.getElementById('input-fin-in').value)||0;
    const out=parseFloat(document.getElementById('input-fin-out').value)||0;
    const baki=prev+inc-out;
    document.getElementById('display-fin-balance').innerText=`RM ${baki.toFixed(2)}`;
}

// ============================================================
// 12. FULLSCREEN
// ============================================================
function initFullscreen(){
    const btn=document.getElementById('btn-fullscreen');
    if(btn){
        btn.onclick=(e)=>{
            e.stopPropagation();
            if(!document.fullscreenElement) document.documentElement.requestFullscreen().catch(e=>console.warn(e));
            else document.exitFullscreen();
        };
    }
    document.addEventListener('fullscreenchange',()=>{if(btn) btn.innerText=document.fullscreenElement?'⛶':'🖵';});
    
    // Klik/tap mana-mana untuk fullscreen (sesuai untuk remote TV)
    document.addEventListener('click',()=>{
        if(!document.fullscreenElement){
            document.documentElement.requestFullscreen().catch(e=>console.warn(e));
        }
    });
}
