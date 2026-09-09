async function resetSettings() {
  await fetch('http://localhost:5001/api/whatsapp/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phoneNumberId: '109283746501928',
      businessAccountId: '192837465019283',
      apiVersion: 'v20.0',
      accessToken: '',
      appSecret: '',
      verifyToken: 'tutorconnect_meta_verify_token_2026'
    })
  });
  console.log('Reset completed');
}
resetSettings();
