// Native fetch
const TOKEN = 'EAASQOWetG1QBRcbaghgIJAV2Htztzpp82XsQ0Sq1JnSLqG8FikMsH0uGa1k9DgKjFko0ZAPn9L0c8hAl85ZA5ZCuna7MhmZArdZBoFW3doQT1gEDnYAsqYj0OXjuRAJMDfiCbnIgill38n7nattmlLe9mtPtQQI4tNHZAUOEg1WoVfpBwQQq87ZCIFZBSVA2MVUAIyCqImdQkhienBg6SLJTJIalKD7KPz4JbMRmlGrY';
const PIXEL_ID = '1283219893317159';

async function checkPixel() {
    const url = `https://graph.facebook.com/v21.0/${PIXEL_ID}?fields=name,adaccount{name,account_id}&access_token=${TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log('Pixel Data:', JSON.stringify(data, null, 2));
}

checkPixel();
