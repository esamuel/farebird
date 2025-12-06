// Airline logo helper - uses Clearbit Logo API for airline logos
export const getAirlineLogo = (airlineName: string): string => {
    // Map common airline names to their domains
    const airlineMap: Record<string, string> = {
        'American Airlines': 'aa.com',
        'Delta': 'delta.com',
        'United': 'united.com',
        'Southwest': 'southwest.com',
        'JetBlue': 'jetblue.com',
        'Alaska Airlines': 'alaskaair.com',
        'Spirit': 'spirit.com',
        'Frontier': 'flyfrontier.com',
        'British Airways': 'britishairways.com',
        'Lufthansa': 'lufthansa.com',
        'Air France': 'airfrance.com',
        'KLM': 'klm.com',
        'Emirates': 'emirates.com',
        'Qatar Airways': 'qatarairways.com',
        'Singapore Airlines': 'singaporeair.com',
        'Cathay Pacific': 'cathaypacific.com',
        'Qantas': 'qantas.com',
        'Air Canada': 'aircanada.com',
        'Turkish Airlines': 'turkishairlines.com',
        'Etihad': 'etihad.com',
        'Virgin Atlantic': 'virginatlantic.com',
        'Ryanair': 'ryanair.com',
        'EasyJet': 'easyjet.com',
        'Wizz Air': 'wizzair.com',
        'Norwegian': 'norwegian.com',
        'TAP Portugal': 'flytap.com',
        'Iberia': 'iberia.com',
        'Vueling': 'vueling.com',
        'ANA': 'ana.co.jp',
        'JAL': 'jal.com',
        'Korean Air': 'koreanair.com',
        'China Eastern': 'ceair.com',
        'Air China': 'airchina.com',
        'Thai Airways': 'thaiairways.com',
        'Malaysia Airlines': 'malaysiaairlines.com',
        'Garuda Indonesia': 'garuda-indonesia.com',
        'Philippine Airlines': 'philippineairlines.com',
        'EVA Air': 'evaair.com',
        'Asiana': 'flyasiana.com',
        'Air New Zealand': 'airnewzealand.com',
        'LATAM': 'latam.com',
        'Aeromexico': 'aeromexico.com',
        'Copa Airlines': 'copaair.com',
        'Avianca': 'avianca.com',
        'GOL': 'voegol.com.br',
        'Azul': 'voeazul.com.br',
        'South African Airways': 'flysaa.com',
        'Ethiopian Airlines': 'ethiopianairlines.com',
        'Kenya Airways': 'kenya-airways.com',
        'EgyptAir': 'egyptair.com',
        'Royal Air Maroc': 'royalairmaroc.com',
        'Air India': 'airindia.com',
        'IndiGo': 'goindigo.in',
        'SpiceJet': 'spicejet.com',
        'Vistara': 'airvistara.com',
        'AirAsia': 'airasia.com',
        'Scoot': 'flyscoot.com',
        'Cebu Pacific': 'cebupacificair.com',
        'VietJet': 'vietjetair.com',
        'Jetstar': 'jetstar.com',
    };

    // Try to find exact match first
    let domain = airlineMap[airlineName];

    // If no exact match, try partial match
    if (!domain) {
        const airlineKey = Object.keys(airlineMap).find(key =>
            airlineName.toLowerCase().includes(key.toLowerCase()) ||
            key.toLowerCase().includes(airlineName.toLowerCase())
        );
        domain = airlineKey ? airlineMap[airlineKey] : null;
    }

    // If still no match, try to construct domain from airline name
    if (!domain) {
        const cleanName = airlineName.toLowerCase()
            .replace(/airlines?|airways?|air/g, '')
            .trim()
            .replace(/\s+/g, '');
        domain = `${cleanName}.com`;
    }

    // Use Clearbit Logo API
    return `https://logo.clearbit.com/${domain}`;
};

// Fallback when logo fails to load
export const getAirlineInitials = (airlineName: string): string => {
    return airlineName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};
