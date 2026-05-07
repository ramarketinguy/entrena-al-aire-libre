const TOKEN = 'EAALkmorQINQBRWhv7EX1OUojuo5i6n1FE7yILcn4KMS7GogJZC3p1cPkdx6LurZCTzgLlzeZB6kqLKOxgujXxaxhwdm1OCzirB94GVOp2g6nBeeLmDE0ROxy45P4mDvKwpawyHUy7CZALCBYHZCyvSGncW7YEjZBCGJlKhoDyYbNGkcadZCnCuiLykIpF45szpD8wZDZD';

async function debugCapiToken() {
    const url = `https://graph.facebook.com/debug_token?input_token=${TOKEN}&access_token=${TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log('CAPI Token Debug:', JSON.stringify(data, null, 2));
}

debugCapiToken();
