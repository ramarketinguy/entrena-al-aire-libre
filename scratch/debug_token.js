// Native fetch
const TOKEN = 'EAASQOWetG1QBRcbaghgIJAV2Htztzpp82XsQ0Sq1JnSLqG8FikMsH0uGa1k9DgKjFko0ZAPn9L0c8hAl85ZA5ZCuna7MhmZArdZBoFW3doQT1gEDnYAsqYj0OXjuRAJMDfiCbnIgill38n7nattmlLe9mtPtQQI4tNHZAUOEg1WoVfpBwQQq87ZCIFZBSVA2MVUAIyCqImdQkhienBg6SLJTJIalKD7KPz4JbMRmlGrY';

async function debugToken() {
    const url = `https://graph.facebook.com/debug_token?input_token=${TOKEN}&access_token=${TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log('Token Debug:', JSON.stringify(data, null, 2));
}

debugToken();
