// Native fetch
const TOKEN = 'EAASQOWetG1QBRcbaghgIJAV2Htztzpp82XsQ0Sq1JnSLqG8FikMsH0uGa1k9DgKjFko0ZAPn9L0c8hAl85ZA5ZCuna7MhmZArdZBoFW3doQT1gEDnYAsqYj0OXjuRAJMDfiCbnIgill38n7nattmlLe9mtPtQQI4tNHZAUOEg1WoVfpBwQQq87ZCIFZBSVA2MVUAIyCqImdQkhienBg6SLJTJIalKD7KPz4JbMRmlGrY';

const accounts = [
    'act_1914957449420395',
    'act_1212612167436288',
    'act_419220954890845',
    'act_117285511942162',
    'act_1133674930136681',
    'act_1382780042496180',
    'act_1059371988596419',
    'act_1195928194983348',
    'act_1028018109108668',
    'act_1263324078734211',
    'act_1242700087499092',
    'act_2255575331571634',
    'act_1257125639693525',
    'act_53766078',
    'act_984095830712277'
];

async function scanAccounts() {
    for (const acc of accounts) {
        console.log(`Checking ${acc}...`);
        const url = `https://graph.facebook.com/v21.0/${acc}/campaigns?fields=name,status,objective,insights{spend,reach,impressions,results,actions}&access_token=${TOKEN}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.error) {
                console.log(`  Error: ${data.error.message}`);
            } else if (data.data && data.data.length > 0) {
                console.log(`  Found ${data.data.length} campaigns!`);
                data.data.forEach(c => {
                    console.log(`    - ${c.name} (${c.status})`);
                    if (c.insights) {
                        console.log(`      Insights: ${JSON.stringify(c.insights.data[0])}`);
                    }
                });
            } else {
                console.log(`  No campaigns found.`);
            }
        } catch (err) {
            console.log(`  Fetch error: ${err.message}`);
        }
    }
}

scanAccounts();
