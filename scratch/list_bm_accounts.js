// Native fetch

const TOKEN = 'EAASQOWetG1QBRcbaghgIJAV2Htztzpp82XsQ0Sq1JnSLqG8FikMsH0uGa1k9DgKjFko0ZAPn9L0c8hAl85ZA5ZCuna7MhmZArdZBoFW3doQT1gEDnYAsqYj0OXjuRAJMDfiCbnIgill38n7nattmlLe9mtPtQQI4tNHZAUOEg1WoVfpBwQQq87ZCIFZBSVA2MVUAIyCqImdQkhienBg6SLJTJIalKD7KPz4JbMRmlGrY';
const BM_ID = '408866716421371';

async function listBMAccounts() {
    const url = `https://graph.facebook.com/v21.0/${BM_ID}/owned_ad_accounts?fields=name,account_id&access_token=${TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log('Owned Accounts:', JSON.stringify(data, null, 2));

    const url2 = `https://graph.facebook.com/v21.0/${BM_ID}/client_ad_accounts?fields=name,account_id&access_token=${TOKEN}`;
    const response2 = await fetch(url2);
    const data2 = await response2.json();
    console.log('Client Accounts:', JSON.stringify(data2, null, 2));
}

listBMAccounts();
