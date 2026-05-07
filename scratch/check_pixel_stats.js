// Native fetch
const TOKEN = 'EAASQOWetG1QBRcbaghgIJAV2Htztzpp82XsQ0Sq1JnSLqG8FikMsH0uGa1k9DgKjFko0ZAPn9L0c8hAl85ZA5ZCuna7MhmZArdZBoFW3doQT1gEDnYAsqYj0OXjuRAJMDfiCbnIgill38n7nattmlLe9mtPtQQI4tNHZAUOEg1WoVfpBwQQq87ZCIFZBSVA2MVUAIyCqImdQkhienBg6SLJTJIalKD7KPz4JbMRmlGrY';
const PIXEL_ID = '1283219893317159';

async function checkPixelStats() {
    // Intentar obtener estadísticas de eventos del pixel
    // Nota: A veces requiere business_management o ser admin del pixel
    const url = `https://graph.facebook.com/v21.0/${PIXEL_ID}/stats?aggregation=event&access_token=${TOKEN}`;
    console.log(`Checking stats for Pixel ${PIXEL_ID}...`);
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('Pixel Stats:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.log('Error fetching stats:', err.message);
    }
}

checkPixelStats();
