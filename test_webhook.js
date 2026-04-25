
async function testWebhook() {
  const url = 'https://script.google.com/macros/s/AKfycby-4ksLui_8yl60I5cH2mI57zD7Le1VpuGamgX9S-qr2EaRn7o4quZllZTsFGHDgFP9Xw/exec';
  const dummyData = {
    received_at: new Date().toISOString(),
    name: 'Test Antigravity',
    email: 'test@antigravity.ai',
    phone: '099000000',
    schedule_preference: 'Prueba Webhook',
    park_preference: 'Prueba',
    utm: {
      utm_source: 'test_script',
      utm_campaign: 'manual_test'
    },
    event_id: 'test_' + Date.now()
  };

  console.log('Enviando datos de prueba al webhook...');
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(dummyData)
    });
    
    const result = await response.text();
    console.log('Respuesta del servidor:', result);
    
    if (result.includes('true')) {
      console.log('✅ ¡PRUEBA EXITOSA! Los datos deberían aparecer en tu Google Sheet y Micaela debería recibir un mail.');
    } else {
      console.log('⚠️ Hubo una respuesta pero no fue la esperada. Revisá el Apps Script.');
    }
  } catch (error) {
    console.error('❌ Error al conectar con el webhook:', error.message);
  }
}

testWebhook();
