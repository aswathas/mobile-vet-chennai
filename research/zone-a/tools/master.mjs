// Zone A master table — south-east Chennai cluster.
// Every field here is either a TIER-A loaded value (with a source key in SRC)
// or a TIER-C modelled input declared in MODEL.md.
//
// Sources (keys used below):
//   OSM  = OpenStreetMap / Nominatim geocode record (loaded)
//   JD   = Justdial listing (loaded)
//   LY   = Lybrate clinic listing (loaded)
//   GT   = Gully Tails listing / editorial (loaded)
//   MB   = MagicBricks locality listings page (loaded)
//   P99  = 99acres locality page (loaded)
//   PS   = propspedia locality page (loaded)
//   CGC  = chennaigatedcommunity.in project index/detail (loaded)
//   SY   = SquareYards gated-community card (loaded)
//   GCC  = Greater Chennai Corporation page (loaded)
//   LAC  = Little Angels Pet Clinic price list (loaded)

// ---------------------------------------------------------------------------
// VETERINARY OPERATOR REGISTRY (all loaded pages)
// ---------------------------------------------------------------------------
export const OPERATORS = {
  sanchu_vel: {
    name: 'Sanchu Animal Hospital (Velachery)', type: 'clinic-home-arm',
    price: 0, rating: 4.4, reviews: 1217, tier: 'A',
    url: 'https://www.justdial.com/Chennai/Sanchu-Animal-Hospital-Opposite-Vijayanagar-Bus-Stand-Velacheri/044PXX44-XX44-220611033159-E8Z6_BZDET',
    note: 'Corporate (CavinKare group) multi-branch, Sarathy Nagar, Taramani Link Road, Velachery 600042. Own site publishes 4.3 / 1,291 reviews and branch hours 10:00-02:00 daily; Gully Tails editorial says 24x7 (sources conflict).'
  },
  sanchu_tara: {
    name: 'Sanchu Animal Hospital (Taramani Link Road)', type: 'corporate-mobile',
    price: 0, rating: 4.4, reviews: 1217, tier: 'A',
    url: 'https://veterinary-hospital.sanchuanimalhospital.com/sanchu/chennai/velachery/',
    note: 'Same corporate group; branch geo record 12.97568, 80.22133 published on the operator site.'
  },
  auro_multi: {
    name: 'Auro Multi Specialty Pet Hospital', type: 'clinic-home-arm',
    price: 0, rating: 4.1, reviews: 622, tier: 'A',
    url: 'https://www.justdial.com/Chennai/Auro-Multi-Specialty-Pet-Hospital-Above-HDFC-Bank-Ltd-Velacheri/044PXX44-XX44-110707182856-L8E5_BZDET',
    note: 'Above HDFC Bank Ltd, Tharamani Link Road, Velachery 600042.'
  },
  auro_pet_clinic: {
    name: 'AURO PET CLINIC', type: 'clinic-home-arm',
    price: 350, rating: 4.3, reviews: 1, tier: 'A',
    url: 'https://www.lybrate.com/chennai/clinic/auro-pet-clinic-velachery',
    note: '3rd Main Road, Jagannatha Puram, Velachery 600042. Lybrate geo 12.9852546, 80.2213259. Consultation Rs 350.'
  },
  aurom: {
    name: 'Aurom Multi-speciality Pet Hospital', type: 'clinic-home-arm',
    price: 0, rating: 4.0, reviews: 8, tier: 'A',
    url: 'https://www.justdial.com/Chennai/Aurom-Multi-speciality-Pet-Hospital-Velacheri/044PXX44-XX44-220706145824-L9V5_BZDET',
    note: 'Jaganathapuram, Velachery 600042. Plausibly the same owner family as Auro Multi Specialty / AURO PET CLINIC; not proven.'
  },
  thanigai: {
    name: 'Thanigai Pet Care Hospital', type: 'clinic-home-arm',
    price: 0, rating: 4.6, reviews: 967, tier: 'A',
    url: 'https://www.justdial.com/Chennai/Thanigai-Pet-Care-Hospital-Opposite-to-Chennai-Silks-Velacheri/044PXX44-XX44-171129090830-H9X7_BZDET',
    note: 'Ram Nagar North 7th Main Road Extn, Velachery 600042, opposite Chennai Silks.'
  },
  kk_ashok: {
    name: 'K K Pet Clinic (Ashok Nagar)', type: 'clinic-home-arm',
    price: 0, rating: 4.5, reviews: 809, tier: 'A',
    url: 'https://www.justdial.com/Chennai/K-K-Pet-Clinic-Backside-Sangamam-Hotel-Ashok-Nagar/044PXX44-XX44-160312115354-S1N5_BZDET',
    note: '50th Street, Ashok Nagar 600083, backside Sangamam Hotel. Same phone as the Mugalivakkam branch (one operator, two branches).'
  },
  vels_pallik: {
    name: 'Vels Pet Hospital & Pet Shop & Pet Spa', type: 'clinic-home-arm',
    price: 0, rating: 3.8, reviews: 811, tier: 'A',
    url: 'https://www.justdial.com/Chennai/Vels-Pet-Hospital-pet-Shop-pet-Spa-Near-By-Oil-Mill-Bus-Stop-Pallikaranai/044P6101066_BZDET',
    note: 'Velachery Main Road, Pallikaranai 600100, near Oil Mill Bus Stop. Tagged in the Justdial on-call category.'
  },
  ramadass: {
    name: 'Dr. P. Ramadass', type: 'house-call',
    price: 0, rating: 4.8, reviews: 8, tier: 'A',
    url: 'https://www.justdial.com/Chennai/Dr-P-Ramadass-Near-Venkateswara-Nagar-Medavakkam/044PXX44-XX44-151028140044-L5Y3_BZDET',
    note: 'Sri Ram Nagar, Medavakkam 600100. House-call; listed in the Justdial on-call category. No fee published on the page loaded.'
  },
  vat_home: {
    name: 'Vet At Home', type: 'house-call',
    price: 0, rating: 3.3, reviews: 6, tier: 'A',
    url: 'https://www.justdial.com/Chennai/Vet-At-Home-Near-Surathamman-Temple-Perungalathur/044PXX44-XX44-160620173514-T1L3_BZDET',
    note: 'Surathamman Kovil Main Street, Perungalathur 600063. House-call; on-call category. No fee published.'
  },
  chrome_pet: {
    name: 'Chrome Pet Clinic', type: 'clinic-home-arm',
    price: 0, rating: 4.1, reviews: 90, tier: 'A',
    url: 'https://www.justdial.com/Chennai/Chrome-Pet-Clinic-Next-to-Mahesh-Hyper-Market-Chromepet/044PXX44-XX44-190608195509-P6N7_BZDET',
    note: 'RP Road, Krishna Nagar, Chromepet 600044. On-call category.'
  },
  sks_chromepet: {
    name: 'Sks Veterinary Hospital (Chromepet)', type: 'clinic-home-arm',
    price: 0, rating: 4.2, reviews: 183, tier: 'A',
    url: 'https://www.justdial.com/Chennai/Sks-Veterinary-Hospital-Chromepet/044PXX44-XX44-221120031317-G3Q1_BZDET',
    note: 'Tiruneermalai Main Road, Chromepet 600044. Multi-branch corporate (12+ branches).'
  },
  camp_road: {
    name: 'Camp Road Animal Hospital', type: 'clinic-home-arm',
    price: 0, rating: 4.1, reviews: 1028, tier: 'A',
    url: 'https://www.justdial.com/Chennai/Camp-Road-Animal-Hospital-Near-Bethesda-Hospital-IOB-Colony-K-V-K-Nagar-Selaiyur/044PXX44-XX44-100427120047-R3A5_BZDET',
    note: 'Camp Road 4th Main Road, K V K Nagar, Selaiyur 600073 (IOB Colony). Gully Tails also lists it at East Tambaram 600073.'
  },
  dg_vet: {
    name: 'D G Veterinary Clinic', type: 'clinic-home-arm',
    price: 150, rating: 0, reviews: 0, tier: 'A',
    url: 'https://www.lybrate.com/chennai/clinic/d-g-veterinary-clinic-tambaram',
    note: '#5/20 Varalakshmi Street, Rajeswari Nagar, Selaiyur 600073. Lybrate consultation Rs 150, Mon-Sat 10:00-21:00, geo 12.9238996, 80.1411138.'
  },
  chandran_aru: {
    name: 'Dr Chandran Aruldas Clinic', type: 'clinic-home-arm',
    price: 0, rating: 0, reviews: 0, tier: 'A',
    url: 'https://www.lybrate.com/chennai/clinic/dr-chandran-aruldas-clinic-tambaram',
    note: 'No 9 Iniya Illam, Jagjeevan Ram Nagar, Camp Road, Selaiyur-Tambaram 600073. Lybrate geo 12.9229153, 80.1274558.'
  },
  ashoka_vet: {
    name: 'Ashoka Vet Clinic', type: 'clinic-home-arm',
    price: 0, rating: 4.6, reviews: 170, tier: 'A',
    url: 'https://www.justdial.com/Chennai/Ashoka-Vet-Clinic-Behind-Grt-Jewellers-Tambaram-Sanatorium/044PXX44-XX44-190531143355-U1K2_BZDET',
    note: 'Kannan Street, Tambaram Sanatorium 600047, behind GRT Jewellers.'
  },
  pets_pal: {
    name: "Pet'S Pal", type: 'clinic-home-arm',
    price: 0, rating: 4.4, reviews: 261, tier: 'A',
    url: 'https://www.justdial.com/Chennai/PetS-Pal-Opposite-to-Kauvery-Hospital-Kovilambakkam/044PXX44-XX44-240405141148-B8C9_BZDET',
    note: '200 Feet Radial Road, Kovilambakkam 600129, opposite Kauvery Hospital.'
  },
  rk_pet: {
    name: 'R.K.Pet Clinic', type: 'clinic-home-arm',
    price: 500, rating: 0, reviews: 0, tier: 'A',
    url: 'https://www.lybrate.com/chennai/clinic/r-k-pet-clinic-madipakkam',
    note: '2/1, 29A, II Main Road, Raghava Nagar, Madipakkam 600091. Lybrate consultation Rs 500, Mon-Sat 07:00-21:30, geo 12.9676275, 80.1878552.'
  },
  vet_xpress: {
    name: 'Vet Xpress', type: 'clinic-home-arm',
    price: 0, rating: 4.4, reviews: 30, tier: 'A',
    url: 'https://www.justdial.com/Chennai/Vet-Xpress-Near-MAV-School-Sembakkam/044PXX44-XX44-190719184924-W2X9_BZDET',
    note: 'Arul Neri Nagar, Sembakkam 600073, near MAV School. On-call category.'
  },
  renu_pet: {
    name: 'Renu Pet Clinic and Grooming Studio', type: 'clinic-home-arm',
    price: 0, rating: 0, reviews: 0, tier: 'A',
    url: 'https://gullytails.com/listing/renu-pet-clinic-and-grooming-studio',
    note: 'No 15, Door No 6, Perumal Nagar, 1st Street, Nanganallur 600061.'
  },
  gcc_meenambakkam: {
    name: 'Greater Chennai Corporation Veterinary Pet Clinic and ABC Centre, Meenambakkam', type: 'public-ngo',
    price: 0, rating: 4.3, reviews: 183, tier: 'A',
    url: 'https://chennaicorporation.gov.in/gcc/veterinary/contact/petclinic/',
    note: 'No.53/28 B Nehru High Road, B V Nagar, Nanganallur 600061. Zone 12, Div 166. Free of cost. 8:00-15:00. Incharge Dr. K. Akalya, 9445026049. Justdial lists the same site as "Corporation Veterinary Hospital".'
  },
  blue_cross: {
    name: 'Blue Cross of India (Guindy shelter and pet crematorium)', type: 'public-ngo',
    price: 0, rating: 0, reviews: 0, tier: 'A',
    url: 'https://bluecrossofindia.org/What-We-Do.html',
    note: 'Hospitals and Shelters, 135 Velachery Road, Guindy, Chennai 600032, +91-44-22354959 (Chennai Veterinary Clinics Directory). Crematorium 9:30-16:30 all 7 days, free overnight freezer. No fee published on the page loaded.'
  },
  little_angels: {
    name: 'Little Angels Pet Clinic', type: 'clinic-home-arm',
    price: 299, rating: 4.9, reviews: 1000, tier: 'A',
    url: 'https://www.littleangelspetclinic.com/vet-home-visit-chennai.html',
    note: '1/398 Ground Floor, BMR Mall, Navallur, OMR 600130, open 24/7. Home visit Rs 299, home vaccination Rs 599 (no consult), sample collection Rs 199, OPD Rs 299. Published coverage list names Velachery, Tambaram, Chrompet, Pallikaranai, Perungudi, OMR and others.'
  },
  petter: {
    name: 'Petter.in', type: 'platform',
    price: 0, rating: 0, reviews: 0, tier: 'A',
    url: 'https://www.petter.in/for-vets',
    note: 'Zero-commission marketplace offering at-home vet visits, online consultation, lab tests and grooming across Chennai. No fee published.'
  },
  easzo: {
    name: 'EASZO Petcare', type: 'platform',
    price: 599, rating: 0, reviews: 0, tier: 'A',
    url: 'https://easzopets.com/services/general-checkup/',
    note: 'At-home consultation Rs 599 (Rs 499 members), general check-up Rs 999 (Rs 899), extended check-up with blood panel Rs 1,699 (Rs 1,499). Citywide platform, Chennai footprint.'
  },
  vetic: {
    name: 'Vetic (chain clinic with home visits)', type: 'platform',
    price: 399, rating: 0, reviews: 0, tier: 'A',
    url: 'https://vetic.in/vet-at-home',
    note: '30-minute home visit from Rs 399 via app; 60-plus clinics across 11-plus cities, Chennai footprint thin relative to Bengaluru, Delhi and Mumbai.'
  },
  perungudi_vet: {
    name: 'Perungudi Veterinary Hospital', type: 'clinic-home-arm',
    price: 0, rating: 3.8, reviews: 18, tier: 'A',
    url: 'https://www.justdial.com/Chennai/Veterinary-Hospitals-in-Velachery-Main-Road-Velacheri/nct-10519292',
    note: 'Veera Pandia Kattabomman Street, Perungudi 600096. Nearest listed clinic to the Zone A north-west approach.'
  },
  saidapet_vet: {
    name: 'Saidapet Veterinary Hospital', type: 'clinic-home-arm',
    price: 0, rating: 4.0, reviews: 825, tier: 'A',
    url: 'https://www.justdial.com/Chennai/Veterinary-Hospitals-in-Velachery-Main-Road-Velacheri/nct-10519292',
    note: 'Fanepet 1st Street, Nandanam, Saidapet 600015. District-level free/subsidised alternative 12-15 km north-west of the cluster.'
  }
};

// Platforms with a published citywide (Chennai) coverage area.
export const CITYWIDE = ['little_angels', 'petter', 'easzo', 'vetic'];

// ---------------------------------------------------------------------------
// LOCATIONS
//   arch       archetype key (see MODEL.md)
//   area       modelled built-up footprint, km2 (tier C)
//   rsqft      Rs per sq ft affluence proxy (tier A unless flagged in afflTier)
//   listings   MagicBricks "flats listed" count for the locality (tier A)
//   gated      99acres gated-community PROJECT count where loaded (tier A)
//   units      known units from chennaigatedcommunity / project pages (tier A)
//   complex    apartment-complex count (tier A where 99acres "160+ Projects" style
//              counts exist; otherwise modelled, tier C)
//   chronic    share of local veterinary cases that are chronic/geriatric (tier C)
//   senior     share of local veterinary cases that are senior-pet (tier C)
//   eol        end-of-life cases per dog per year (tier C)
// ---------------------------------------------------------------------------
export const LOCALITIES = [
  // ---- A-R1 : Tambaram and the north approach (7) ----------------------------
  { id:'A01', name:'Tambaram West (station and Mettu)', aliases:['Tambaram','Tambaram Railway Station','Tambaram West'], cluster:'A-R1',
    ward:'Tambaram City Municipal Corporation (outside GCC wards)', ac:'Tambaram', pins:['600045','600047'], lat:12.92579, lon:80.11792, coordTier:'A',
    type:'mixed', arch:'township', area:2.60, rsqft:6292, afflTier:'A', listings:79, gated:null, units:45, complex:11, chronic:0.085, senior:0.050, eol:0.0055,
    notable:['Tulive Flora','Ashirvaadh Crystal Park Phase 2','LML Skyliving','Marutham Royal Gardens','SCC Kaveri Gardenia','Ruby Horizon','Doshi Nakshatra I'],
    comp:[], assoc:0, note:'Tambaram station and Mettu is the northern rail-and-bus interchange of the cluster. No named veterinary operator found in any source loaded.' },
  { id:'A02', name:'Tambaram East (Annai Theresa Nagar)', aliases:['East Tambaram','Annai Theresa Nagar','Kannadapalayam'], cluster:'A-R1',
    ward:'Tambaram City Municipal Corporation (outside GCC wards)', ac:'Tambaram', pins:['600059','600045'], lat:12.92333, lon:80.12705, coordTier:'A',
    type:'mixed', arch:'mixed_res', area:2.10, rsqft:7579, afflTier:'A', listings:107, gated:2, units:377, complex:10, chronic:0.090, senior:0.052, eol:0.0058,
    notable:['Casagrand Estia','Ruby Ashok Manor','Dac Marshal','Sai Avighna','Harmony Blossoms','DRA Richburg (160 units)','DRA Beena Clover (217 units)'],
    comp:['camp_road'], assoc:2, note:'Camp Road Animal Hospital lists an East Tambaram address (SG3, Sri Lakshmi Residency, IOB Colony, 4th Main Road, Camp Road, Selaiyur 600073) alongside its Selaiyur address.' },
  { id:'A03', name:'Tambaram Sanatorium (Kannan Street)', aliases:['Sanatorium','Tambaram Sanatorium'], cluster:'A-R1',
    ward:'Tambaram City Municipal Corporation (outside GCC wards)', ac:'Tambaram', pins:['600047'], lat:12.93786, lon:80.13143, coordTier:'A',
    type:'mixed', arch:'mixed_res', area:1.45, rsqft:6623, afflTier:'A', listings:6, gated:null, units:0, complex:6, chronic:0.095, senior:0.058, eol:0.0060,
    notable:['Casagrand Reva','Casagrand Highcity','TVS Emerald Avalon','Crest Diizo','Casagrand Madelyn'],
    comp:['ashoka_vet'], assoc:1, note:'One named clinic in Kannan Street. Small listed inventory but several large projects within the wider Sanatorium catchment.' },
  { id:'A04', name:'Irumbuliyur', aliases:['Irumbuliyur','Irumbuliyur Junction'], cluster:'A-R1',
    ward:'Ward 190, Zone 14 Perungudi, Greater Chennai Corporation', ac:'Pallikaranai', pins:['600100'], lat:12.92988, lon:80.20271, coordTier:'A',
    type:'residential', arch:'mixed_res', area:1.85, rsqft:6633, afflTier:'A', listings:7, gated:null, units:0, complex:12, chronic:0.100, senior:0.060, eol:0.0062,
    notable:['Ruby Shelter','TTK Nagar','Marutham Royal Gardens','Tulive Azpire','Bharathi Elements','KNR Abirami Webster Village'],
    comp:[], assoc:1, note:'Inside GCC limits (Zone 14) but west of the Pallikaranai AC core, on the Velachery-Tambaram corridor. No named operator found.' },
  { id:'A05', name:'Kadaperi', aliases:['Kadaperi','East Tambaram Industrial Belt'], cluster:'A-R1',
    ward:'Tambaram City Municipal Corporation (outside GCC wards)', ac:'Tambaram', pins:['600059'], lat:12.93437, lon:80.11862, coordTier:'A',
    type:'industrial', arch:'industrial', area:2.80, rsqft:5990, afflTier:'A', listings:1, gated:null, units:0, complex:8, chronic:0.070, senior:0.042, eol:0.0050,
    notable:['Nest Sai Castle','Hansa Garden','Pace Adarsa','Casagrand Reva','Casagrand Highcity','Casagrand Madelyn','LML Skyliving'],
    comp:[], assoc:0, note:'Industrial-and-residential mix east of Tambaram. Lowest listed inventory in the cluster at one flat.' },
  { id:'A06', name:'Nithyanandham Nagar (Tambaram West)', aliases:['Nithyanandham Nagar','Tambaram West Colony'], cluster:'A-R1',
    ward:'Tambaram City Municipal Corporation (outside GCC wards)', ac:'Tambaram', pins:['600045'], lat:12.92453, lon:80.11505, coordTier:'C',
    type:'residential', arch:'mixed_res', area:0.95, rsqft:6466, afflTier:'C', listings:null, gated:null, units:0, complex:4, chronic:0.088, senior:0.052, eol:0.0056,
    notable:['Tulive Flora','Ashirvaadh Crystal Park Phase 2'], comp:[], assoc:0,
    note:'Named colony with no dedicated listing page; all inventory and price figures are parent-Tambaram proxies. Coordinate is the OSM Tambaram centroid displaced under 500 m.' },
  { id:'A30', name:'Kovilambakkam', aliases:['Kovilambakkam','Kovilambakkam Main Road'], cluster:'A-R1',
    ward:'Tambaram City Municipal Corporation (outside GCC wards)', ac:'Maduravoyal', pins:['600129','600045'], lat:12.94068, lon:80.17999, coordTier:'A',
    type:'mixed', arch:'mid_apartment', area:2.30, rsqft:9900, afflTier:'A', listings:132, gated:1, units:20, complex:6, chronic:0.105, senior:0.062, eol:0.0066,
    notable:['TVS Emerald Elements','Sobha Winchester','TVS Emerald Udyana','Lifestyle Villa One (20 units)','RWD Palm','Lotus Apartment'],
    comp:['pets_pal'], assoc:2, note:'Highest price per sq ft of any Tambaram-side locality despite being outside GCC limits. One named clinic.' },

  // ---- A-R2 : Mangadu and the Parandur airport corridor (6) -----------------
  { id:'A07', name:'Mangadu Town (Raghunathapuram and Janani Nagar)', aliases:['Mangadu','Janani Nagar Mangadu','Raghunathapuram Mangadu'], cluster:'A-R2',
    ward:'Mangadu Town Panchayat, Chengalpattu district (outside GCC wards)', ac:'Mangadu', pins:['600122','602101'], lat:13.03144, lon:80.10966, coordTier:'A',
    type:'mixed', arch:'township', area:3.40, rsqft:7300, afflTier:'A', listings:213, gated:1, units:936, complex:7, chronic:0.075, senior:0.048, eol:0.0055,
    notable:['Shriram 122 West (936 units)','Akshaya Republic','Altis Ashraya','Vennila Flats','Darshan Aishwaryam','MP Golden Heights','CyberCity Tower 4B'],
    comp:[], assoc:1, note:'Largest single gated-community unit count in the outer belt at 936 units. No named veterinary operator found in any source loaded.' },
  { id:'A08', name:'Mangadu New Town (NH-4)', aliases:['Mangadu New Town','NH-4 Mangadu','GST road Mangadu'], cluster:'A-R2',
    ward:'Mangadu Town Panchayat, Chengalpattu district (outside GCC wards)', ac:'Mangadu', pins:['600122'], lat:13.02000, lon:80.09500, coordTier:'C',
    type:'residential', arch:'township', area:2.60, rsqft:7300, afflTier:'C', listings:null, gated:null, units:0, complex:5, chronic:0.072, senior:0.046, eol:0.0053,
    notable:['Shriram 122 West (936 units)'], comp:[], assoc:0,
    note:'New-town segment on the GST road. No dedicated listing page; parent-Mangadu proxies. Coordinate displaced about 1.5 km south-west of the OSM Mangadu place record.' },
  { id:'A09', name:'Mangadu Vinayagar Nagar (old town)', aliases:['Vinayagar Nagar Mangadu','Mangadu Old Town'], cluster:'A-R2',
    ward:'Mangadu Town Panchayat, Chengalpattu district (outside GCC wards)', ac:'Mangadu', pins:['600122'], lat:13.03450, lon:80.11150, coordTier:'C',
    type:'residential', arch:'township', area:1.70, rsqft:7300, afflTier:'C', listings:null, gated:null, units:0, complex:4, chronic:0.078, senior:0.050, eol:0.0056,
    notable:['Shriram 122 West (936 units)'], comp:[], assoc:1,
    note:'Older, denser grid than the new-town segment. Coordinate displaced about 400 m north of the OSM Mangadu place record.' },
  { id:'A10', name:'Mangadu Industrial Estate (NH-4)', aliases:['Mangadu Industrial Area','NH-4 industrial strip'], cluster:'A-R2',
    ward:'Mangadu Town Panchayat, Chengalpattu district (outside GCC wards)', ac:'Mangadu', pins:['600122'], lat:13.01700, lon:80.08000, coordTier:'C',
    type:'industrial', arch:'industrial', area:2.40, rsqft:7300, afflTier:'C', listings:null, gated:null, units:0, complex:3, chronic:0.062, senior:0.038, eol:0.0045,
    notable:['Akshaya Republic','Darshan Aishwaryam'], comp:[], assoc:0,
    note:'Industrial strip on the GST road. Lowest modelled pet density in the cluster. Coordinate displaced about 3 km south-west of the OSM Mangadu place record.' },
  { id:'A11', name:'Parandur (airport corridor)', aliases:['Parandur','Parandur airport corridor','Kooram','Enathur'], cluster:'A-R2',
    ward:'Parandur village, Kanchipuram district (outside GCC wards)', ac:'Maduravoyal', pins:[], lat:12.94253, lon:79.73719, coordTier:'A',
    type:'residential', arch:'township', area:3.10, rsqft:2469, afflTier:'A', listings:null, gated:null, units:0, complex:0, chronic:0.062, senior:0.038, eol:0.0045,
    notable:[], comp:[], assoc:0,
    note:'52.6 km straight line from the Velachery hub, on the Bengaluru-Chennai Expressway. Published inventory is 9-plus properties at Rs 6.1 lakh to Rs 27 lakh with an average of Rs 2,469 per sq ft: a pre-build land market, not a completed community. Not a drivable daily route from the hub.' },
  { id:'A12', name:'Valathur', aliases:['Valathur','Thiruporur Valathur'], cluster:'A-R2',
    ward:'Valathur village, Kanchipuram district (outside GCC wards)', ac:'Maduravoyal', pins:[], lat:12.97000, lon:79.87000, coordTier:'C',
    type:'residential', arch:'township', area:2.20, rsqft:4002, afflTier:'C', listings:47, gated:null, units:0, complex:13, chronic:0.065, senior:0.040, eol:0.0046,
    notable:['Akshaya Vaan Megam','CeeDeeYes Chennai Pattinam','Republic of Nature RON Ph I-II','Vijay Rajas Exurb','Arun Excello Chandrika'],
    comp:[], assoc:0,
    note:'Nearest OSM "Valathur" record is in Ramanathapuram district and was rejected; the Thiruporur listing page was used as the inventory and price proxy. Coordinate is modelled on the Mangadu-Thiruporur link, band plus or minus 4 km.' },

  // ---- A-R3 : Selaiyur, Perungalathur, Madambakkam, Alandur, Pammal (5) -----
  { id:'A13', name:'Selaiyur (Camp Road and Rajeswari Nagar)', aliases:['Selaiyur','Camp Road Selaiyur','Rajeswari Nagar'], cluster:'A-R3',
    ward:'Tambaram City Municipal Corporation (outside GCC wards)', ac:'Mangadu', pins:['600073'], lat:12.91781, lon:80.13795, coordTier:'A',
    type:'mixed', arch:'mixed_res', area:2.70, rsqft:6500, afflTier:'A', listings:125, gated:1, units:0, complex:10, chronic:0.082, senior:0.050, eol:0.0054,
    notable:['Pace Adarsa','DRA Venkat Richburg','Rainbow Riddhi','Sri Kannan Avenue','South Alankar Spectra','Ruby Grand','StepsStone Krita','Casagrand Estia (1,083 sq ft, Rs 61 lakh)'],
    comp:['camp_road','dg_vet','chandran_aru'], assoc:2, note:'Densest veterinary supply outside Velachery with three named clinics inside the locality. Camp Road Animal Hospital carries 1,028 reviews.' },
  { id:'A14', name:'Perungalathur', aliases:['Perungalathur','Old Perungalathur','Perungulathur'], cluster:'A-R3',
    ward:'Tambaram City Municipal Corporation (outside GCC wards)', ac:'Mangadu', pins:['600045','600063'], lat:12.91455, lon:80.08795, coordTier:'A',
    type:'residential', arch:'township', area:2.90, rsqft:6999, afflTier:'A', listings:71, gated:1, units:168, complex:10, chronic:0.076, senior:0.048, eol:0.0052,
    notable:['Casagrand Primrose','Shriprop Park 63','MP Mavis','Pearl Aakshaya','DAC Luxe','MS Charan Divine','Silversky The One (168 units)','Ashirvaadh Homes'],
    comp:['vat_home'], assoc:1, note:'Sole house-call operator in the locality, Vet At Home, is also the lowest-rated operator found in the cluster at 3.3 across 6 reviews.' },
  { id:'A15', name:'Madambakkam', aliases:['Madambakkam','Agaram Main Road Madambakkam'], cluster:'A-R3',
    ward:'Tambaram City Municipal Corporation (outside GCC wards)', ac:'Tambaram', pins:['600045'], lat:12.90633, lon:80.15868, coordTier:'A',
    type:'residential', arch:'township', area:2.50, rsqft:7199, afflTier:'A', listings:40, gated:null, units:0, complex:7, chronic:0.074, senior:0.046, eol:0.0051,
    notable:['Hansa Garden','VGK Saindhavi','ATH Meadows','DAC Rhythm','DAC Vilva','Udhayam Madampakkam','Antony The Orchard'],
    comp:[], assoc:0, note:'Must not be confused with Meenambakkam, where the only GCC free centre inside the cluster sits. No named operator found.' },
  { id:'A16', name:'Alandur (SIDCO and TNHB)', aliases:['Alandur','Alandur SIDCO Colony','Alandur TNHB'], cluster:'A-R3',
    ward:'Ward 162, Zone 12 Alandur, Greater Chennai Corporation', ac:'Saidapet', pins:['600016','600088'], lat:12.99437, lon:80.19428, coordTier:'A',
    type:'apartment-cluster', arch:'mid_apartment', area:2.20, rsqft:12000, afflTier:'A', listings:13, gated:null, units:0, complex:17, chronic:0.110, senior:0.068, eol:0.0070,
    notable:['Casagrand Bellissimo','Rajnis Brindhavan','Appaswamy Banyan House','Casagrand Aristo','Baashyaam The Peak','TVS Emerald Peninsula','Casagrand Utopia','Prestige Downtown','VGN Fairmont'],
    comp:[], assoc:2, note:'Highest price per sq ft of any Tambaram-side locality at Rs 12,000. Seventeen named projects but no named veterinary operator found.' },
  { id:'A17', name:'Pammal', aliases:['Pammal','Pammal Nallathambhi Street'], cluster:'A-R3',
    ward:'Ward 138, Zone 10 Kodambakkam, Greater Chennai Corporation', ac:'Pallavaram', pins:['600078','600075'], lat:13.03479, lon:80.19947, coordTier:'A',
    type:'apartment-cluster', arch:'mid_apartment', area:2.00, rsqft:7500, afflTier:'A', listings:117, gated:2, units:587, complex:12, chronic:0.098, senior:0.062, eol:0.0066,
    notable:['June','Radiance The Prime','BC Ira','Appaswamy The Bloomingdale','Casagrand Casamia','ATH Royal Queen','Prestige Pallava Gardens','SM Sky Wood','Casagrand Reva (450 units)','DAC Aeropolis (137 units)'],
    comp:[], assoc:2, note:'Gully Tails indexes three providers for Pammal but none was named on a page that loaded. propspedia prices Pammal at Rs 25,050 per sq ft on only 6 listings, so the MagicBricks median of Rs 7,500 is used as the affluence proxy.' },

  // ---- A-R4 : Hasthinapuram and Chromepet (7) ------------------------------
  { id:'A18', name:'Hasthinapuram (main)', aliases:['Hasthinapuram','Hasthinapuram main road'], cluster:'A-R4',
    ward:'Pallavaram / Tambaram corporation area, Chengalpattu district (outside GCC wards)', ac:'Chrompet', pins:['600064','600044'], lat:12.93728, lon:80.15199, coordTier:'A',
    type:'mixed', arch:'mixed_res', area:2.30, rsqft:7690, afflTier:'A', listings:9, gated:null, units:0, complex:7, chronic:0.088, senior:0.053, eol:0.0057,
    notable:['Kiruthik Apartments','ATH Crown','Viva Visha','Casagrand Zenith','Hansa Garden','TVS Emerald Elements','Pace Adarsa'],
    comp:[], assoc:1, note:'Gully Tails indexes one unnamed provider for the Chromepet-Hasthinapuram neighbourhood. No named operator found.' },
  { id:'A19', name:'Hasthinapuram New Colony', aliases:['Hasthinapuram New Colony','Hasthinapuram new colony'], cluster:'A-R4',
    ward:'Pallavaram / Tambaram corporation area, Chengalpattu district (outside GCC wards)', ac:'Chrompet', pins:['600064'], lat:12.93300, lon:80.15600, coordTier:'C',
    type:'residential', arch:'mixed_res', area:1.30, rsqft:7690, afflTier:'C', listings:null, gated:null, units:0, complex:4, chronic:0.086, senior:0.052, eol:0.0056,
    notable:['Casagrand Zenith','TVS Emerald Elements'], comp:[], assoc:0,
    note:'No dedicated listing page; parent-Hasthinapuram proxies. Coordinate displaced about 700 m south-east of the OSM Hasthinapuram place record.' },
  { id:'A20', name:'Hasthinapuram Palayamkottai', aliases:['Palayamkottai','Hasthinapuram Palayamkottai'], cluster:'A-R4',
    ward:'Pallavaram / Tambaram corporation area, Chengalpattu district (outside GCC wards)', ac:'Chrompet', pins:['600064'], lat:12.94200, lon:80.14600, coordTier:'C',
    type:'residential', arch:'mixed_res', area:1.15, rsqft:7690, afflTier:'C', listings:null, gated:null, units:0, complex:3, chronic:0.084, senior:0.051, eol:0.0055,
    notable:['Hansa Garden','Pace Adarsa'], comp:[], assoc:0,
    note:'No dedicated listing page; parent-Hasthinapuram proxies. Coordinate displaced about 800 m north-west of the OSM Hasthinapuram place record.' },
  { id:'A21', name:'Chromepet (RP Road, Krishna Nagar)', aliases:['Chromepet','Chrompet','Krishna Nagar Chromepet'], cluster:'A-R4',
    ward:'Tambaram corporation area, Chengalpattu district (outside GCC wards)', ac:'Chrompet', pins:['600044'], lat:12.95219, lon:80.14117, coordTier:'A',
    type:'mixed', arch:'mixed_res', area:2.50, rsqft:7360, afflTier:'A', listings:165, gated:null, units:0, complex:10, chronic:0.096, senior:0.058, eol:0.0061,
    notable:['Casagrand Madelyn','Amarprakash The Royal Castle','Fair Deal Tulip','ATH Crown','Avittam Parvathy','Harmony Bhagyam','Doshi FirstNest','Raunaq Avinya','Prestige Pallavaram Gardens','Casagrand Bloom'],
    comp:['chrome_pet'], assoc:2, note:'Gully Tails indexes three providers for Chromepet; only Chrome Pet Clinic was named on a page that loaded.' },
  { id:'A22', name:'Chromepet Tiruneermalai Main Road', aliases:['Tiruneermalai','Tiruneermalai Main Road'], cluster:'A-R4',
    ward:'Tambaram corporation area, Chengalpattu district (outside GCC wards)', ac:'Chrompet', pins:['600044','600070'], lat:12.95366, lon:80.12255, coordTier:'A',
    type:'mixed', arch:'mixed_res', area:2.10, rsqft:7360, afflTier:'C', listings:null, gated:null, units:0, complex:7, chronic:0.094, senior:0.057, eol:0.0060,
    notable:['Casagrand Madelyn','TVS Emerald Avalon','Prestige Pallavaram Gardens'],
    comp:['sks_chromepet'], assoc:1, note:'Sks Veterinary Hospital, a 12-plus branch corporate, sits on this corridor with 183 reviews on its Chromepet listing.' },
  { id:'A23', name:'Nemilichery', aliases:['Nemilichery','Old Pallavaram','Om Sakthi Nagar'], cluster:'A-R4',
    ward:'Pallavaram / Tambaram corporation area, Chengalpattu district (outside GCC wards)', ac:'Chrompet', pins:['600117'], lat:12.94604, lon:80.16372, coordTier:'A',
    type:'residential', arch:'mixed_res', area:1.60, rsqft:8544, afflTier:'A', listings:15, gated:null, units:0, complex:9, chronic:0.092, senior:0.056, eol:0.0059,
    notable:['Prestige Pallavaram Gardens','MP Rue Radiale','ATH Crown','Casagrand Zenith','Hansa Garden','Avenue Lilly','MGP Kuberan Nagar','TVS Emerald Elements','Casagrand Reva'],
    comp:[], assoc:1, note:'Nine named projects but no named veterinary operator found on any loaded page.' },
  { id:'A24', name:'Chromepet Kabil Nagar', aliases:['Kabil Nagar','Kabil Nagar Chromepet'], cluster:'A-R4',
    ward:'Tambaram corporation area, Chengalpattu district (outside GCC wards)', ac:'Chrompet', pins:['600044'], lat:12.94900, lon:80.13800, coordTier:'C',
    type:'residential', arch:'mixed_res', area:1.10, rsqft:7360, afflTier:'C', listings:null, gated:null, units:0, complex:4, chronic:0.090, senior:0.054, eol:0.0057,
    notable:['Casagrand Madelyn','Casagrand Bloom'], comp:[], assoc:0,
    note:'No dedicated listing page; parent-Chromepet proxies. Coordinate displaced about 400 m north-west of the OSM Chromepet place record.' },

  // ---- A-R5 : Medavakkam, Koot Road, Chembedu, Moovarasampettai, Otteri (8) --
  { id:'A25', name:'Medavakkam Town (Munusamy Nagar)', aliases:['Medavakkam','Munusamy Nagar Medavakkam','Medavakkam Main Road'], cluster:'A-R5',
    ward:'Ward 163, Zone 12 Alandur, Greater Chennai Corporation', ac:'Pallikaranai', pins:['600100','600114'], lat:12.98262, lon:80.19621, coordTier:'A',
    type:'apartment-cluster', arch:'dense_apartment', area:3.10, rsqft:7290, afflTier:'A', listings:421, gated:473, units:2362, complex:17, chronic:0.118, senior:0.072, eol:0.0076,
    notable:['Lakevista at Purva Windermere (1,774 units, 55 acres)','Navins Starwood Towers 3 (588 units)','Casagrand Zenith','Tulive Pavilion','Ruby One Crest','Navins Cedar','Rajparis Apartment','Royal Nest','Casagrand French Town','Brigade Morgan Heights','Pearl Queens Park','DAC Medallion'],
    comp:['ramadass'], assoc:5, note:'473 gated-community projects on 99acres, the highest project count in the cluster, and 421-plus flats listed. Despite that, exactly one named veterinary supplier: a house-call vet with 8 reviews.' },
  { id:'A26', name:'Medavakkam Vengaivasal (VGP Layout)', aliases:['Vengaivasal','Vengaivasal VGP Layout','Medavakkam Vengaivasal'], cluster:'A-R5',
    ward:'Tambaram corporation area, Chengalpattu district (outside GCC wards)', ac:'Pallikaranai', pins:['600045','600100'], lat:12.91776, lon:80.16435, coordTier:'A',
    type:'apartment-cluster', arch:'mid_apartment', area:2.00, rsqft:8095, afflTier:'A', listings:58, gated:1, units:330, complex:11, chronic:0.106, senior:0.064, eol:0.0068,
    notable:['Ruby One Crest (330 units)','Navins Cedar at Starwood Towers 2.0','Pearl Evita','Vengaivasal Project','Rejoice at TVS Emerald Aaranya','Green Homes Phase 1','Annai Avantika'],
    comp:['ramadass'], assoc:3, note:'On the Santhosapuram-Vengaivasal-Mambakkam road, about 8 km south-west of Medavakkam town centre. The OSM place record for Vengaivasal sits inside the Tambaram corporation area, so the GCC licence regime does not reach it.' },
  { id:'A27', name:'Medavakkam Ramiah Nagar', aliases:['Ramiah Nagar','Dr Ramiah Park','Medavakkam Ramiah Nagar'], cluster:'A-R5',
    ward:'Ward 163, Zone 12 Alandur, Greater Chennai Corporation', ac:'Pallikaranai', pins:['600100'], lat:12.98262, lon:80.19621, coordTier:'C',
    type:'apartment-cluster', arch:'dense_apartment', area:1.40, rsqft:7290, afflTier:'C', listings:null, gated:null, units:0, complex:9, chronic:0.112, senior:0.069, eol:0.0073,
    notable:['Casagrand Zenith','Navins Starwood Towers 3'], comp:['ramadass'], assoc:2,
    note:'Named colony inside the Medavakkam built-up area. No dedicated listing page; parent-Medavakkam proxies. Coordinate is the OSM Medavakkam place record.' },
  { id:'A28', name:'Medavakkam Mambakkam', aliases:['Mambakkam','Mambakkam Main Road'], cluster:'A-R5',
    ward:'Tambaram corporation area, Chengalpattu district (outside GCC wards)', ac:'Pallikaranai', pins:['600045'], lat:12.91319, lon:80.19197, coordTier:'A',
    type:'apartment-cluster', arch:'mid_apartment', area:1.80, rsqft:6551, afflTier:'A', listings:10, gated:3, units:882, complex:14, chronic:0.098, senior:0.060, eol:0.0064,
    notable:['S&P The Address (412 units)','S&P New Haven Ribbon Walk (384 units)','Elephantine Enormous (86 units)','Akshaya Podigai','TATA New Haven Golden Garden','Adroit Prosper','Casagrand Palm Springs','Unitech Palm Villas','Plaza Elite Acres','Arun Excello Sankara'],
    comp:['ramadass'], assoc:2, note:'882 known units across three gated projects despite only 10 flats listed on the locality page. The gap between listed flats and built units is a live indicator, not a scarcity.' },
  { id:'A29', name:'Medavakkam Koot Road', aliases:['Koot Road','Medavakkam Koot Road'], cluster:'A-R5',
    ward:'Ward 163, Zone 12 Alandur, Greater Chennai Corporation', ac:'Pallikaranai', pins:['600100'], lat:12.97900, lon:80.19300, coordTier:'C',
    type:'apartment-cluster', arch:'dense_apartment', area:1.25, rsqft:7290, afflTier:'C', listings:null, gated:null, units:0, complex:7, chronic:0.114, senior:0.070, eol:0.0074,
    notable:['Casagrand Zenith','Navins Starwood Towers 3'], comp:['ramadass'], assoc:1,
    note:'Street-level segment inside the Medavakkam built-up area. No dedicated listing page; parent-Medavakkam proxies. Coordinate displaced about 500 m south-west of the OSM Medavakkam place record.' },
  { id:'A31', name:'Chembedu', aliases:['Chembedu','Chemedu','B V Nagar Chembedu'], cluster:'A-R5',
    ward:'Ward 166, Zone 12 Alandur, Greater Chennai Corporation', ac:'Saidapet', pins:['600061'], lat:12.98817, lon:80.17651, coordTier:'A',
    type:'mixed', arch:'mixed_res', area:1.35, rsqft:7290, afflTier:'C', listings:null, gated:null, units:0, complex:4, chronic:0.092, senior:0.057, eol:0.0060,
    notable:[], comp:['gcc_meenambakkam','renu_pet'], assoc:1,
    note:'No apartment inventory found on any site loaded. The GCC Meenambakkam Pet Clinic and ABC Centre is on the boundary at B V Nagar, Nanganallur 600061.' },
  { id:'A32', name:'Moovarasampettai', aliases:['Moovarasampettai','Moovarasampettai main street'], cluster:'A-R5',
    ward:'Ward 167, Zone 12 Alandur, Greater Chennai Corporation', ac:'Velachery', pins:['600031'], lat:12.96999, lon:80.18634, coordTier:'A',
    type:'mixed', arch:'mid_apartment', area:1.50, rsqft:8200, afflTier:'A', listings:3, gated:null, units:0, complex:10, chronic:0.104, senior:0.063, eol:0.0066,
    notable:['TVS Emerald Udyana','RWD Palm','Navins Starwood Towers 3','Purva Windermere','Casagrand Zenith','SCC Moovendar Homes','Sri Ayyan Devesh','VGK Unity Kingdom'],
    comp:['gcc_meenambakkam'], assoc:2, note:'Ten named projects against three listed flats: the built stock is materially larger than the portal listing inventory.' },
  { id:'A46', name:'Otteri (Medavakkam-Velachery link)', aliases:['Otteri','Medavakkam Otteri'], cluster:'A-R5',
    ward:'Ward 166, Zone 12 Alandur, Greater Chennai Corporation', ac:'Saidapet', pins:['600048'], lat:12.99100, lon:80.18300, coordTier:'C',
    type:'apartment-cluster', arch:'mid_apartment', area:1.25, rsqft:12153, afflTier:'A', listings:2, gated:null, units:0, complex:7, chronic:0.100, senior:0.062, eol:0.0065,
    notable:['Palace Regency','Secretariat Colony','Rajparis Galaxy','Rainbow Pinnacle','Aara Venus Regalia','TVH Lumbini Square','Jains Surabhi'],
    comp:['gcc_meenambakkam'], assoc:2,
    note:'Second-highest price per sq ft in the cluster at Rs 12,153, on only two listed flats. The OSM "Otteri" record in Zone 6 Thiru Vi Ka Nagar is 13 km north and was not used; the coordinate is modelled on the GCC centre at B V Nagar, band plus or minus 2 km.' },

  // ---- A-R6 : Pallikaranai (6) ---------------------------------------------
  { id:'A33', name:'Pallikaranai (Velachery Main Road, oil mill)', aliases:['Pallikaranai','Oil Mill Pallikaranai','Pallikaranai main'], cluster:'A-R6',
    ward:'Ward 187, Zone 14 Perungudi, Greater Chennai Corporation', ac:'Pallikaranai', pins:['600100'], lat:12.93047, lon:80.20777, coordTier:'A',
    type:'apartment-cluster', arch:'dense_apartment', area:2.60, rsqft:7336, afflTier:'A', listings:283, gated:2, units:0, complex:11, chronic:0.112, senior:0.068, eol:0.0071,
    notable:['Ashok Manor','Casagrand Flagship','Ramaniyam Ocean Dew','Rajkham Akash Ganga','Sai Shahi','Purva Windermere (900 sq ft, Rs 82 lakh)','Puravankara Windermere (1,950 sq ft, Rs 1.8 crore)','DH Delight Homes','LCS Utopia','Janyas Kamalam','Krishna Accloade'],
    comp:['vels_pallik'], assoc:4, note:'283-plus flats listed and the single most credible licence-compliance catchment in the cluster because it is fully inside GCC Zone 14.' },
  { id:'A34', name:'Pallikaranai Narayanapuram (IIT Colony)', aliases:['Narayanapuram','IIT Colony Pallikaranai'], cluster:'A-R6',
    ward:'Ward 188, Zone 14 Perungudi, Greater Chennai Corporation', ac:'Pallikaranai', pins:['600100'], lat:12.94180, lon:80.20838, coordTier:'A',
    type:'apartment-cluster', arch:'dense_apartment', area:1.60, rsqft:7336, afflTier:'C', listings:null, gated:null, units:0, complex:7, chronic:0.108, senior:0.066, eol:0.0069,
    notable:['Casagrand Flagship','LCS Utopia','Purva Windermere'], comp:['vels_pallik'], assoc:2,
    note:'Named colony inside the Pallikaranai built-up area. No dedicated listing page; parent-Pallikaranai proxies.' },
  { id:'A35', name:'Pallikaranai VGP Shanthi Nagar', aliases:['VGP Shanthi Nagar','Shanthi Nagar Pallikaranai'], cluster:'A-R6',
    ward:'Ward 187, Zone 14 Perungudi, Greater Chennai Corporation', ac:'Pallikaranai', pins:['600100'], lat:12.93350, lon:80.20300, coordTier:'C',
    type:'apartment-cluster', arch:'dense_apartment', area:1.35, rsqft:7336, afflTier:'C', listings:null, gated:null, units:0, complex:6, chronic:0.110, senior:0.067, eol:0.0070,
    notable:['Casagrand Flagship','LCS Utopia'], comp:['vels_pallik'], assoc:2,
    note:'No dedicated listing page; parent-Pallikaranai proxies. Coordinate displaced about 500 m north-west of the OSM Pallikaranai place record.' },
  { id:'A36', name:'Pallikaranai Jalladiampet', aliases:['Jalladiampet','Jalladianpet'], cluster:'A-R6',
    ward:'Ward 187, Zone 14 Perungudi, Greater Chennai Corporation', ac:'Pallikaranai', pins:['600100'], lat:12.91975, lon:80.20169, coordTier:'A',
    type:'apartment-cluster', arch:'mid_apartment', area:1.70, rsqft:7336, afflTier:'C', listings:null, gated:null, units:0, complex:6, chronic:0.102, senior:0.062, eol:0.0066,
    notable:['Casagrand Flagship'], comp:['vels_pallik'], assoc:2,
    note:'Casagrand Flagship sits here. The 887-unit and five-floor figures circulated for this project were not reproduced on any page loaded and are treated as unverified.' },
  { id:'A37', name:'Pallikaranai Varadharajapuram', aliases:['Varadharajapuram'], cluster:'A-R6',
    ward:'Ward 190, Zone 14 Perungudi, Greater Chennai Corporation', ac:'Pallikaranai', pins:['600100'], lat:12.92760, lon:80.20575, coordTier:'A',
    type:'residential', arch:'mixed_res', area:1.45, rsqft:6137, afflTier:'A', listings:null, gated:1, units:0, complex:3, chronic:0.092, senior:0.056, eol:0.0059,
    notable:['Ashirvaadh Homes Varadharajapuram (756 sq ft, Rs 37 lakh, Rs 4,894 per sq ft)'], comp:['vels_pallik'], assoc:1,
    note:'Lowest price per sq ft inside GCC Zone 14 in the cluster at Rs 6,137 on propspedia, and the cheapest gated entry point at Rs 4,894 per sq ft.' },
  { id:'A38', name:'Pallikaranai Santhosapuram', aliases:['Santhosapuram','Santoshapuram'], cluster:'A-R6',
    ward:'Ward 190, Zone 14 Perungudi, Greater Chennai Corporation', ac:'Pallikaranai', pins:['600045','600100'], lat:12.91580, lon:80.17012, coordTier:'A',
    type:'apartment-cluster', arch:'mid_apartment', area:1.80, rsqft:6998, afflTier:'A', listings:11, gated:null, units:0, complex:15, chronic:0.100, senior:0.061, eol:0.0065,
    notable:['Pearl Queens Park','Ayyan Achyut','VGK Unity Kingdom','TVS Emerald Udyana','Mayuram Chandralok','Casagrand Zenith','Casagrand First City','Keerthi Onella Hive','Amudha Oak','Tulive Pavilion','Ruby One Crest','Pace Adarsa'],
    comp:['vels_pallik'], assoc:2, note:'Fifteen named projects against 11 listed flats. The OSM record places the name inside the Tambaram corporation area, which would move it outside GCC coverage; the 99acres sub-locality slug classifies it as Chennai South.' },

  // ---- A-R7 : Velachery core and the Guindy side (7) -----------------------
  { id:'A39', name:'Velachery main (Vijaya Nagar)', aliases:['Velachery','Vijaya Nagar Velachery','Velacheri'], cluster:'A-R7',
    ward:'Ward 179, Zone 13 Adyar, Greater Chennai Corporation', ac:'Velachery', pins:['600042'], lat:12.97726, lon:80.22092, coordTier:'A',
    type:'apartment-cluster', arch:'dense_apartment', area:3.60, rsqft:10902, afflTier:'A', listings:196, gated:310, units:0, complex:20, chronic:0.124, senior:0.076, eol:0.0080,
    notable:['Propshell Swastika','Beavers Sundara Vilas','AKS Garden','Sangath Apartments','Iyra Spire','ASV Jayantika','Brigade Stellaris (284 units, 5.19 acres)','Phoenix Marketcity','The Crest','BBC City Paark','Tulive Urbanville','Jcube Prime Avenue'],
    comp:['sanchu_vel','auro_multi','auro_pet_clinic'], assoc:8, note:'310 gated-community projects and 2,527 housing.com listings; three named clinics inside the locality itself and two more within 1.5 km. The most competitive micro-market in the cluster and the case for making it the hub.' },
  { id:'A40', name:'Velachery Ram Nagar North', aliases:['Ram Nagar North','7th Main Road Extension Velachery'], cluster:'A-R7',
    ward:'Ward 179, Zone 13 Adyar, Greater Chennai Corporation', ac:'Velachery', pins:['600042'], lat:12.97900, lon:80.21600, coordTier:'C',
    type:'apartment-cluster', arch:'dense_apartment', area:1.90, rsqft:10902, afflTier:'C', listings:null, gated:null, units:0, complex:9, chronic:0.120, senior:0.074, eol:0.0078,
    notable:['Thanigai Pet Care Hospital','Real Value Sai Brindavan'], comp:['thanigai'], assoc:4,
    note:'Thanigai Pet Care Hospital, rated 4.6 across 967 reviews, is the strongest single clinic record in the cluster. No dedicated listing page; parent-Velachery proxies.' },
  { id:'A41', name:'Velachery Jaganathapuram', aliases:['Jaganathapuram','Jagannatha Puram'], cluster:'A-R7',
    ward:'Ward 179, Zone 13 Adyar, Greater Chennai Corporation', ac:'Velachery', pins:['600042'], lat:12.98525, lon:80.22133, coordTier:'A',
    type:'apartment-cluster', arch:'dense_apartment', area:1.75, rsqft:10902, afflTier:'C', listings:null, gated:null, units:0, complex:8, chronic:0.118, senior:0.073, eol:0.0077,
    notable:['AURO PET CLINIC (Rs 350 consultation)','Aurom Multi-speciality Pet Hospital'], comp:['auro_pet_clinic','aurom'], assoc:3,
    note:'Two Auro-branded entities sit within a few hundred metres of each other. Common ownership was not proven, so they are counted as two competitors.' },
  { id:'A42', name:'Velachery Ashok Nagar (50th Street, Guindy side)', aliases:['Ashok Nagar','50th Street Ashok Nagar','Velachery Ashok Nagar'], cluster:'A-R7',
    ward:'Ward 171, Zone 13 Adyar, Greater Chennai Corporation (Guindy side of the Velachery main road)', ac:'Velachery', pins:['600083'], lat:13.01480, lon:80.22512, coordTier:'A',
    type:'mixed', arch:'mid_apartment', area:1.60, rsqft:10902, afflTier:'C', listings:null, gated:null, units:0, complex:6, chronic:0.116, senior:0.072, eol:0.0076,
    notable:['Hotel Ashok Bhavan'], comp:['kk_ashok'], assoc:2,
    note:'Guindy side of the Velachery main road, inside the Zone A boundary. K K Pet Clinic, rated 4.5 across 809 reviews and open 24 hours, is here.' },
  { id:'A43', name:'Velachery TNHB and Udayam Nagar', aliases:['Udayam Nagar','TNHB Velachery','Udayam Co-operative Nagar'], cluster:'A-R7',
    ward:'Ward 180, Zone 13 Adyar, Greater Chennai Corporation', ac:'Velachery', pins:['600042'], lat:12.98200, lon:80.22800, coordTier:'C',
    type:'apartment-cluster', arch:'dense_apartment', area:1.30, rsqft:10902, afflTier:'C', listings:null, gated:null, units:0, complex:5, chronic:0.113, senior:0.070, eol:0.0074,
    notable:['Sanchu Animal Hospital','Auro Multi Specialty Pet Hospital'], comp:['sanchu_vel','auro_multi'], assoc:3,
    note:'Public-sector housing stock with the highest household density per unit area in the cluster. Coordinate displaced about 800 m north-east of the OSM Velachery place record.' },
  { id:'A44', name:'Velachery Hasthampatti', aliases:['Hasthampatti','Velachery Hasthampatti'], cluster:'A-R7',
    ward:'Ward 179, Zone 13 Adyar, Greater Chennai Corporation', ac:'Velachery', pins:['600042'], lat:12.97400, lon:80.21400, coordTier:'C',
    type:'residential', arch:'mixed_res', area:1.45, rsqft:10902, afflTier:'C', listings:null, gated:null, units:0, comp:['sanchu_vel'], assoc:2,
    notable:['Sanchu Animal Hospital'], chronic:0.108, senior:0.068, eol:0.0072, complex:5,
    note:'Lower-rise pocket immediately south of the Velachery core. Coordinate displaced about 800 m south-west of the OSM Velachery place record.' },
  { id:'A45', name:'Velachery 100 Feet Bypass Road', aliases:['100 Feet Bypass','Velachery Taramani 100 feet road','Velachery 100 Feet Road'], cluster:'A-R7',
    ward:'Ward 180, Zone 13 Adyar, Greater Chennai Corporation', ac:'Velachery', pins:['600042'], lat:12.98600, lon:80.22600, coordTier:'C',
    type:'apartment-cluster', arch:'dense_apartment', area:1.40, rsqft:10902, afflTier:'C', listings:null, gated:null, units:0, comp:['sanchu_vel','blue_cross'], assoc:4,
    notable:['Sanchu Animal Hospital','Blue Cross of India crematorium'], chronic:0.116, senior:0.071, eol:0.0075, complex:6,
    note:'Arterial corridor linking Velachery to Taramani and to the Blue Cross crematorium at 135 Velachery Road, Guindy 600032. Coordinate displaced about 1.2 km north-east of the OSM Velachery place record.' },

  // ---- A-R8 : Madipakkam, Sithalapakkam, Taramani, Thoraipakkam (4) ---------
  { id:'A47', name:'Madipakkam (Adambakkam)', aliases:['Madipakkam','Adambakkam','Raghava Nagar Madipakkam'], cluster:'A-R8',
    ward:'Ward 187, Zone 14 Perungudi, Greater Chennai Corporation', ac:'Pallikaranai', pins:['600091'], lat:12.96113, lon:80.20013, coordTier:'A',
    type:'apartment-cluster', arch:'mid_apartment', area:2.40, rsqft:9427, afflTier:'A', listings:165, gated:1, units:20, complex:6, chronic:0.104, senior:0.063, eol:0.0066,
    notable:['MGP Kuberan Nagar','VAIRAM SAIRAM','Sri Lakshmi Kuberar Apartments','BBCL Eshana','BBCL Dhriti (20 units)','MSP Lotus Park','Vestas Dimensions'],
    comp:['rk_pet'], assoc:3, note:'Gully Tails indexes three providers for Madipakkam; only R.K. Pet Clinic was named on a page that loaded, at a Rs 500 consultation.' },
  { id:'A48', name:'Sithalapakkam (Ottiyambakkam Main Road)', aliases:['Sithalapakkam','Ottiyambakkam','Ottiyambakkam Main Road Sithalapakkam'], cluster:'A-R8',
    ward:'Tambaram corporation area, Chengalpattu district (outside GCC wards)', ac:'Sholinganallur', pins:['600045'], lat:12.88644, lon:80.18850, coordTier:'A',
    type:'residential', arch:'township', area:2.60, rsqft:6500, afflTier:'A', listings:71, gated:1, units:110, complex:12, chronic:0.078, senior:0.049, eol:0.0053,
    notable:['DAC Napa Valley (110 units)','Amudha Oak','Sai Niketan','DSP Lake Placid 24','Jones Breeze','Nest Craft','DSP Mayur','Antony Pebbels','BSCPL Bollineni ZION','The Nest Glory'],
    comp:[], assoc:1, note:'Roughly 9.6 km from the hub on the Ottiyambakkam main road, outside GCC limits. One indexed provider, unnamed on any loaded page. A GCC ABC centre exists at Sholinganallur but it is a birth-control centre for strays, not a pet clinic.' },
  { id:'A49', name:'Taramani', aliases:['Taramani','Tharamani','Taramani Link Road'], cluster:'A-R8',
    ward:'Ward 184, Zone 14 Perungudi, Greater Chennai Corporation', ac:'Thiruvanmiyur', pins:['600113','600036'], lat:12.97866, lon:80.24164, coordTier:'A',
    type:'commercial', arch:'commercial', area:2.10, rsqft:9000, afflTier:'C', listings:null, gated:null, units:0, complex:4, chronic:0.096, senior:0.058, eol:0.0061,
    notable:['Srinivasa Building','Taramani Station Road'], comp:['sanchu_tara','auro_multi'], assoc:2,
    note:'Commercial and office belt with a large transient daytime population. Two corporate clinic addresses sit on Taramani Link Road. No apartment inventory was found on any listing site loaded.' },
  { id:'A50', name:'Thoraipakkam', aliases:['Thoraipakkam','Thuraipakkam','Aavin Booth Bus Stop Thoraipakkam'], cluster:'A-R8',
    ward:'Ward 186, Zone 14 Perungudi, Greater Chennai Corporation', ac:'Thiruvanmiyur', pins:['600096','600041'], lat:12.95393, lon:80.24253, coordTier:'A',
    type:'apartment-cluster', arch:'mid_apartment', area:2.70, rsqft:10238, afflTier:'A', listings:190, gated:1, units:215, complex:16, chronic:0.110, senior:0.067, eol:0.0070,
    notable:['Radiance Eternity (215 units, Rs 2.01 to 6.95 crore)','Akshaya Tango','Vishwakarma Skypark Residences','Jains Pebble Brook Ph II','Shri Raman Ridgewood Condos','BBCL Ashraya','Bhoomi White Rose','Casagrand Lanterns Court','Ceebros Boulevard','TVH Park Villa','Radiance Mandarin'],
    comp:[], assoc:3, note:'Justdial lists a clinic at Aavin Booth Bus Stop rated 4.9 across 167 reviews, but the name did not resolve on the page loaded, so no operator is named. Little Angels, 6 km away at Navallur, is the nearest operator with a published home-visit price.' }
];

export const HUB = { name: 'Velachery', lat: 12.97726, lon: 80.22092 };
