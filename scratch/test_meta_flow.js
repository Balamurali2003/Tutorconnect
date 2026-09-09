async function testMetaFlow() {
  const saveRes = await fetch('http://localhost:5001/api/whatsapp/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phoneNumberId: '109283746501928',
      businessAccountId: '192837465019283',
      apiVersion: 'v20.0',
      accessToken: 'EAAG_dummy_test_token_from_meta_developers',
      appSecret: 'test_meta_app_secret_123',
      verifyToken: 'my_custom_meta_token'
    })
  });
  const saveData = await saveRes.json();
  console.log('Saved settings:', saveData.success, saveData.message);

  const getRes = await fetch('http://localhost:5001/api/whatsapp/settings');
  const getData = await getRes.json();
  console.log('Read settings:', getData.settings.phoneNumberId, 'hasToken:', getData.settings.hasToken, 'maskedToken:', getData.settings.maskedAccessToken);

  const testConnRes = await fetch('http://localhost:5001/api/whatsapp/test-connection', { method: 'POST' });
  const testConnData = await testConnRes.json();
  console.log('Test connection with dummy token handled cleanly:', testConnData.status, testConnData.message);
}
testMetaFlow();
