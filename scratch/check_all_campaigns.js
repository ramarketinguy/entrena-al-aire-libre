// Native fetch
const TOKEN = 'EAASQOWetG1QBRcbaghgIJAV2Htztzpp82XsQ0Sq1JnSLqG8FikMsH0uGa1k9DgKjFko0ZAPn9L0c8hAl85ZA5ZCuna7MhmZArdZBoFW3doQT1gEDnYAsqYj0OXjuRAJMDfiCbnIgill38n7nattmlLe9mtPtQQI4tNHZAUOEg1WoVfpBwQQq87ZCIFZBSVA2MVUAIyCqImdQkhienBg6SLJTJIalKD7KPz4JbMRmlGrY';

async function checkAllCampaigns() {
    const acc = 'act_984095830712277';
    // Filtering for ALL statuses
    const url = `https://graph.facebook.com/v21.0/${acc}/campaigns?fields=name,status,effective_status,objective&filtering=[{"field":"effective_status","operator":"IN","value":["ACTIVE","PAUSED","DELETED","ARCHIVED","IN_PROCESS","WITH_ISSUES"]}]&access_token=${TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log('All Campaigns:', JSON.stringify(data, null, 2));
}

checkAllCampaigns();
