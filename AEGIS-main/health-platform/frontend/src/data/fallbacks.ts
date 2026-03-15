





export const FALLBACK_AIRCRAFT = [
  { icao: 'a00001', callsign: 'UAL123',  originCountry: 'United States', lat: 40.71, lng: -74.01, baroAltitude: 10700, velocity: 240, heading: 75,  military: false },
  { icao: 'a00002', callsign: 'AAL456',  originCountry: 'United States', lat: 33.94, lng: -118.40, baroAltitude: 11000, velocity: 255, heading: 90,  military: false },
  { icao: 'a00003', callsign: 'DAL789',  originCountry: 'United States', lat: 51.47, lng:  -0.45, baroAltitude: 10500, velocity: 248, heading: 270, military: false },
  { icao: 'bab001', callsign: 'BAW101',  originCountry: 'United Kingdom', lat: 52.30, lng: -0.95, baroAltitude: 11200, velocity: 260, heading: 180, military: false },
  { icao: 'bab002', callsign: 'DLH202',  originCountry: 'Germany',        lat: 48.35, lng:  11.78, baroAltitude: 10800, velocity: 245, heading: 60,  military: false },
  { icao: 'bab003', callsign: 'AFR303',  originCountry: 'France',         lat: 43.65, lng:   7.21, baroAltitude: 11100, velocity: 252, heading: 120, military: false },
  { icao: 'bab004', callsign: 'KLM404',  originCountry: 'Netherlands',    lat: 52.31, lng:   4.76, baroAltitude: 10600, velocity: 243, heading: 300, military: false },
  { icao: 'bab005', callsign: 'UAE505',  originCountry: 'UAE',            lat: 25.25, lng:  55.36, baroAltitude: 11300, velocity: 265, heading: 90,  military: false },
  { icao: 'bab006', callsign: 'SIA606',  originCountry: 'Singapore',      lat:  1.37, lng: 103.99, baroAltitude: 10900, velocity: 258, heading: 270, military: false },
  { icao: 'bab007', callsign: 'QFA707',  originCountry: 'Australia',      lat: -33.87, lng: 151.21, baroAltitude: 10400, velocity: 241, heading: 45, military: false },
  { icao: 'bab008', callsign: 'ANA808',  originCountry: 'Japan',          lat: 35.55, lng: 139.78, baroAltitude: 10700, velocity: 247, heading: 135, military: false },
  { icao: 'bab009', callsign: 'CCA909',  originCountry: 'China',          lat: 39.51, lng: 116.41, baroAltitude: 10800, velocity: 249, heading: 90, military: false },
  { icao: 'bab010', callsign: 'IBE010',  originCountry: 'Spain',          lat: 40.47, lng:  -3.56, baroAltitude: 10900, velocity: 253, heading: 200, military: false },
  { icao: 'mil001', callsign: 'REACH123', originCountry: 'United States', lat: 37.62, lng: -122.38, baroAltitude: 12500, velocity: 278, heading: 90,  military: true },
  { icao: 'mil002', callsign: 'RAF11',   originCountry: 'United Kingdom', lat: 52.35, lng:  -1.58, baroAltitude: 8500,  velocity: 310, heading: 180, military: true },
  { icao: 'mil003', callsign: 'DUKE44',  originCountry: 'United States',  lat: 38.81, lng: -104.70, baroAltitude: 13000, velocity: 290, heading: 270, military: true },
  { icao: 'mil004', callsign: 'FURY77',  originCountry: 'United States',  lat: 36.23, lng:  -115.17, baroAltitude: 14000, velocity: 320, heading: 45, military: true },
  { icao: 'mil005', callsign: 'GHOST01', originCountry: 'United States',  lat: 29.97, lng:  -95.34, baroAltitude: 9800,  velocity: 305, heading: 150, military: true },
];


export const FALLBACK_NAVAL = [
  { mmsi: '338123456', name: 'USS Gerald R. Ford',  lat: 36.84, lng: -75.97, speed: 22, course: 135, vesselType: 'aircraft_carrier', isNaval: true, flag: 'US' },
  { mmsi: '338234567', name: 'USS Arleigh Burke',   lat: 41.50, lng: -66.00, speed: 18, course: 215, vesselType: 'destroyer',         isNaval: true, flag: 'US' },
  { mmsi: '338345678', name: 'USS Virginia',        lat: 30.50, lng: -80.50, speed: 15, course: 90,  vesselType: 'submarine',          isNaval: true, flag: 'US' },
  { mmsi: '232123456', name: 'HMS Queen Elizabeth', lat: 50.80, lng:  -1.60, speed: 20, course: 270, vesselType: 'aircraft_carrier', isNaval: true, flag: 'GB' },
  { mmsi: '232234567', name: 'HMS Daring',          lat: 51.50, lng:   1.50, speed: 16, course: 180, vesselType: 'destroyer',         isNaval: true, flag: 'GB' },
  { mmsi: '273123456', name: 'Admiral Gorshkov',    lat: 68.97, lng:  33.07, speed: 17, course: 45,  vesselType: 'destroyer',         isNaval: true, flag: 'RU' },
  { mmsi: '273234567', name: 'Borei Submarine',     lat: 69.00, lng:  38.00, speed: 12, course: 90,  vesselType: 'submarine',          isNaval: true, flag: 'RU' },
  { mmsi: '412123456', name: 'Type 055 Destroyer',  lat: 22.50, lng: 114.00, speed: 19, course: 180, vesselType: 'destroyer',         isNaval: true, flag: 'CN' },
  { mmsi: '412234567', name: 'PLAN Carrier 16',     lat: 18.70, lng: 109.90, speed: 21, course: 270, vesselType: 'aircraft_carrier', isNaval: true, flag: 'CN' },
  { mmsi: '226123456', name: 'FS Charles de Gaulle',lat: 43.00, lng:   5.90, speed: 24, course: 225, vesselType: 'aircraft_carrier', isNaval: true, flag: 'FR' },
  { mmsi: '338999001', name: 'ENS Evergreen',        lat:  29.90, lng:  32.60, speed: 14, course: 180, vesselType: 'cargo',           isNaval: false, flag: 'PA' },
  { mmsi: '338999002', name: 'MSC Gülsün',           lat:  36.10, lng:   5.40, speed: 16, course: 270, vesselType: 'cargo',           isNaval: false, flag: 'PA' },
  { mmsi: '338999003', name: 'HMM Algeciras',        lat:  35.90, lng: -5.30,  speed: 16, course:  90, vesselType: 'cargo',           isNaval: false, flag: 'KR' },
  { mmsi: '338999004', name: 'OOCL Hong Kong',       lat:  22.30, lng: 113.90, speed: 18, course: 45,  vesselType: 'cargo',           isNaval: false, flag: 'HK' },
  { mmsi: '338999005', name: 'Stena Impero',         lat:  26.30, lng:  56.90, speed:  8, course: 135, vesselType: 'tanker',          isNaval: false, flag: 'GB' },
  { mmsi: '338999006', name: 'Arctic Sunrise',       lat:  78.20, lng:  15.60, speed:  5, course: 180, vesselType: 'other',           isNaval: false, flag: 'NL' },
  { mmsi: '338999007', name: 'Diamond Princess',     lat:  21.30, lng: 157.90, speed: 12, course: 270, vesselType: 'passenger',       isNaval: false, flag: 'GB' },
];


export const FALLBACK_EARTHQUAKES = [
  { id: 'fb_eq001', lat: 34.05,  lng: -118.25, magnitude: 3.2, place: 'Los Angeles, CA', depth: 12, time: Date.now() - 3600000 },
  { id: 'fb_eq002', lat: 37.77,  lng: -122.42, magnitude: 2.8, place: 'San Francisco, CA', depth: 8, time: Date.now() - 7200000 },
  { id: 'fb_eq003', lat: 35.68,  lng:  139.69, magnitude: 4.1, place: 'Tokyo, Japan', depth: 55, time: Date.now() - 1800000 },
  { id: 'fb_eq004', lat: 38.90,  lng:   40.50, magnitude: 5.6, place: 'Eastern Turkey', depth: 10, time: Date.now() - 600000 },
  { id: 'fb_eq005', lat: -8.46,  lng:  115.17, magnitude: 4.8, place: 'Bali, Indonesia', depth: 30, time: Date.now() - 2700000 },
  { id: 'fb_eq006', lat: -33.46, lng:  -70.65, magnitude: 3.9, place: 'Santiago, Chile', depth: 20, time: Date.now() - 5400000 },
  { id: 'fb_eq007', lat: 64.13,  lng:  -21.93, magnitude: 3.5, place: 'Reykjavik, Iceland', depth: 5, time: Date.now() - 900000 },
  { id: 'fb_eq008', lat: 39.91,  lng:  141.08, magnitude: 5.1, place: 'Honshu, Japan', depth: 45, time: Date.now() - 3200000 },
  { id: 'fb_eq009', lat:  6.2,   lng:   77.30, magnitude: 4.3, place: 'Andaman Islands', depth: 25, time: Date.now() - 4100000 },
  { id: 'fb_eq010', lat: -4.87,  lng:  153.16, magnitude: 6.0, place: 'Papua New Guinea', depth: 35, time: Date.now() - 800000 },
  { id: 'fb_eq011', lat: 35.33,  lng:  -92.44, magnitude: 2.5, place: 'Arkansas, USA', depth: 9, time: Date.now() - 6000000 },
  { id: 'fb_eq012', lat: 51.26,  lng:  179.30, magnitude: 5.4, place: 'Aleutian Islands', depth: 40, time: Date.now() - 1200000 },
  { id: 'fb_eq013', lat: 37.10,  lng:   14.89, magnitude: 3.8, place: 'Sicily, Italy', depth: 18, time: Date.now() - 2400000 },
  { id: 'fb_eq014', lat: -22.91, lng: -68.53,  magnitude: 4.6, place: 'Atacama, Chile', depth: 60, time: Date.now() - 9000000 },
  { id: 'fb_eq015', lat: 19.43,  lng: -155.29, magnitude: 3.1, place: 'Big Island, Hawaii', depth: 7, time: Date.now() - 10800000 },
  { id: 'fb_eq016', lat: 47.70,  lng:  130.50, magnitude: 5.7, place: 'Far East Russia', depth: 22, time: Date.now() - 1500000 },
  { id: 'fb_eq017', lat: 28.17,  lng:   84.73, magnitude: 4.9, place: 'Nepal Himalayas', depth: 14, time: Date.now() - 3900000 },
  { id: 'fb_eq018', lat: -36.14, lng:  -72.89, magnitude: 5.2, place: 'Bio-Bio, Chile', depth: 28, time: Date.now() - 1000000 },
  { id: 'fb_eq019', lat:  4.52,  lng: 126.18,  magnitude: 6.2, place: 'Mindanao, Philippines', depth: 50, time: Date.now() - 700000 },
  { id: 'fb_eq020', lat: 38.42,  lng:   26.13, magnitude: 4.4, place: 'Aegean Sea, Greece', depth: 13, time: Date.now() - 5000000 },
  { id: 'fb_eq021', lat: 52.41,  lng:  159.40, magnitude: 5.9, place: 'Kamchatka, Russia', depth: 70, time: Date.now() - 2200000 },
  { id: 'fb_eq022', lat: 30.98,  lng:   50.58, magnitude: 5.1, place: 'Zagros, Iran', depth: 16, time: Date.now() - 430000 },
  { id: 'fb_eq023', lat: -15.49, lng: -173.46, magnitude: 5.3, place: 'Tonga', depth: 33, time: Date.now() - 1150000 },
  { id: 'fb_eq024', lat: 60.69,  lng:  152.57, magnitude: 4.0, place: 'Southern Alaska', depth: 19, time: Date.now() - 8200000 },
  { id: 'fb_eq025', lat: 36.72,  lng:   36.99, magnitude: 5.6, place: 'Hatay, Turkey', depth: 11, time: Date.now() - 580000 },
  { id: 'fb_eq026', lat: -7.01,  lng: 129.52,  magnitude: 6.5, place: 'Banda Sea', depth: 110, time: Date.now() - 300000 },
  { id: 'fb_eq027', lat: 62.44,  lng:  -149.22, magnitude: 3.7, place: 'Interior Alaska', depth: 95, time: Date.now() - 7700000 },
  { id: 'fb_eq028', lat: 14.78,  lng: -91.60,  magnitude: 4.2, place: 'Guatemala', depth: 15, time: Date.now() - 4800000 },
  { id: 'fb_eq029', lat: 43.82,  lng:  146.85, magnitude: 5.0, place: 'Kuril Islands, Russia', depth: 42, time: Date.now() - 2900000 },
  { id: 'fb_eq030', lat:  0.46,  lng: -78.43,  magnitude: 4.7, place: 'Ecuador', depth: 23, time: Date.now() - 1900000 },
];


export const FALLBACK_CONFLICTS = [
  { id: 'fc001', lat: 48.37, lng:  31.16, severity: 'critical', country: 'Ukraine',   headline: 'Active conflict zone — shelling reported' },
  { id: 'fc002', lat: 31.35, lng:  34.30, severity: 'critical', country: 'Gaza',      headline: 'Ongoing military operations' },
  { id: 'fc003', lat: 34.80, lng:  38.99, severity: 'critical', country: 'Syria',     headline: 'Ongoing conflict — multiple factions' },
  { id: 'fc004', lat: 15.55, lng:  48.51, severity: 'critical', country: 'Yemen',     headline: 'Civil war hostilities continue' },
  { id: 'fc005', lat: 12.86, lng:  30.21, severity: 'high',     country: 'Sudan',     headline: 'RSF clashes reported in Khartoum' },
  { id: 'fc006', lat: 21.91, lng:  95.95, severity: 'high',     country: 'Myanmar',   headline: 'Military junta operations ongoing' },
  { id: 'fc007', lat:  5.15, lng:  46.19, severity: 'high',     country: 'Somalia',   headline: 'Al-Shabaab attack repelled' },
  { id: 'fc008', lat: 33.93, lng:  67.70, severity: 'high',     country: 'Afghanistan', headline: 'IED incident — Kandahar province' },
  { id: 'fc009', lat: 17.57, lng:  -3.99, severity: 'high',     country: 'Mali',      headline: 'JNIM attack on convoy' },
  { id: 'fc010', lat: 18.97, lng: -72.28, severity: 'high',     country: 'Haiti',     headline: 'Gang violence escalating — Port-au-Prince' },
  { id: 'fc011', lat:  9.14, lng:  40.48, severity: 'moderate', country: 'Ethiopia',  headline: 'Amhara conflict flares — clashes reported' },
  { id: 'fc012', lat: 33.22, lng:  43.67, severity: 'moderate', country: 'Iraq',      headline: 'Rocket attack on military base' },
  { id: 'fc013', lat: 26.33, lng:  17.22, severity: 'moderate', country: 'Libya',     headline: 'LNA operations continue in south' },
  { id: 'fc014', lat:  9.08, lng:   8.67, severity: 'moderate', country: 'Nigeria',   headline: 'Boko Haram raid — Lake Chad basin' },
  { id: 'fc015', lat:  6.87, lng:  31.30, severity: 'moderate', country: 'South Sudan', headline: 'Inter-community violence flares' },
  { id: 'fc016', lat: -4.03, lng:  21.75, severity: 'moderate', country: 'DRC',       headline: 'M23 advance halted — FARDC clashes' },
  { id: 'fc017', lat: 33.85, lng:  35.86, severity: 'moderate', country: 'Lebanon',   headline: 'Cross-border fire exchange' },
  { id: 'fc018', lat: 30.37, lng:  69.34, severity: 'moderate', country: 'Pakistan',  headline: 'TTP ambush — Khyber Pakhtunkhwa' },
  { id: 'fc019', lat: 15.00, lng:   2.00, severity: 'high',     country: 'Sahel',     headline: 'GSIM militants target supply route' },
  { id: 'fc020', lat: 12.36, lng:  -1.56, severity: 'moderate', country: 'Burkina Faso', headline: 'Jihadist attack near Ouagadougou' },
];


export const FALLBACK_WILDFIRES = [
  { id: 'fw001', lat:  38.50, lng: -122.10, brightness: 450, confidence: 'h', date: new Date().toISOString().split('T')[0] },
  { id: 'fw002', lat:  34.10, lng: -117.80, brightness: 410, confidence: 'h', date: new Date().toISOString().split('T')[0] },
  { id: 'fw003', lat:  36.90, lng: -118.90, brightness: 380, confidence: 'n', date: new Date().toISOString().split('T')[0] },
  { id: 'fw004', lat: -33.50, lng:  150.80, brightness: 500, confidence: 'h', date: new Date().toISOString().split('T')[0] },
  { id: 'fw005', lat: -32.00, lng:  148.50, brightness: 420, confidence: 'n', date: new Date().toISOString().split('T')[0] },
  { id: 'fw006', lat:  -8.30, lng:  -55.30, brightness: 390, confidence: 'n', date: new Date().toISOString().split('T')[0] },
  { id: 'fw007', lat:  -5.80, lng:  -49.10, brightness: 460, confidence: 'h', date: new Date().toISOString().split('T')[0] },
  { id: 'fw008', lat:  60.20, lng:   62.40, brightness: 400, confidence: 'n', date: new Date().toISOString().split('T')[0] },
  { id: 'fw009', lat:  55.90, lng:   37.10, brightness: 370, confidence: 'l', date: new Date().toISOString().split('T')[0] },
  { id: 'fw010', lat:  -2.50, lng:  117.80, brightness: 430, confidence: 'n', date: new Date().toISOString().split('T')[0] },
  { id: 'fw011', lat:  11.50, lng:  -14.40, brightness: 480, confidence: 'h', date: new Date().toISOString().split('T')[0] },
  { id: 'fw012', lat:  15.30, lng:  -13.50, brightness: 440, confidence: 'n', date: new Date().toISOString().split('T')[0] },
  { id: 'fw013', lat:  -9.10, lng:  -62.00, brightness: 410, confidence: 'h', date: new Date().toISOString().split('T')[0] },
  { id: 'fw014', lat:  49.20, lng: -121.60, brightness: 360, confidence: 'l', date: new Date().toISOString().split('T')[0] },
  { id: 'fw015', lat:  40.10, lng:  -3.80,  brightness: 380, confidence: 'n', date: new Date().toISOString().split('T')[0] },
  { id: 'fw016', lat:  37.80, lng:  140.40, brightness: 350, confidence: 'l', date: new Date().toISOString().split('T')[0] },
  { id: 'fw017', lat: -25.60, lng:  127.30, brightness: 470, confidence: 'h', date: new Date().toISOString().split('T')[0] },
  { id: 'fw018', lat:   3.20, lng:  -72.80, brightness: 420, confidence: 'n', date: new Date().toISOString().split('T')[0] },
  { id: 'fw019', lat:  42.60, lng:  100.30, brightness: 390, confidence: 'l', date: new Date().toISOString().split('T')[0] },
  { id: 'fw020', lat:  -6.90, lng:   38.60, brightness: 400, confidence: 'n', date: new Date().toISOString().split('T')[0] },
];


export const FALLBACK_CYBER_ARCS: any[] = [];


export const FALLBACK_SANCTIONS: string[] = [
  'IR', 
  'KP', 
  'CU', 
  'SY', 
  'RU', 
  'BY', 
  'MM', 
  'VE', 
  'ZW', 
  'SD', 
  'SO', 
  'YE', 
  'LY', 
  'CF', 
  'SS', 
  'ML', 
  'NI', 
  'HT', 
  'CD', 
  'ER', 
  'IQ', 
];
