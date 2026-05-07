// Using native fetch (Node 18+)

const TOKEN = 'EAALkmorQINQBRWhv7EX1OUojuo5i6n1FE7yILcn4KMS7GogJZC3p1cPkdx6LurZCTzgLlzeZB6kqLKOxgujXxaxhwdm1OCzirB94GVOp2g6nBeeLmDE0ROxy45P4mDvKwpawyHUy7CZALCBYHZCyvSGncW7YEjZBCGJlKhoDyYbNGkcadZCnCuiLykIpF45szpD8wZDZD';
const AD_ACCOUNT_ID = 'act_1263324078734211';

async function listAdAccounts() {
    const url = `https://graph.facebook.com/v21.0/me/adaccounts?fields=name,account_id&access_token=${TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
}

listAdAccounts();
