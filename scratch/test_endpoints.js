async function test() {
  try {
    const res = await fetch('http://localhost:5001/api/stats');
    const data = await res.json();
    console.log('Server is running! totalTutors:', data.metrics?.totalTutors);

    const sRes = await fetch('http://localhost:5001/api/whatsapp/settings');
    const sData = await sRes.json();
    console.log('WhatsApp settings:', sData.settings?.connectionStatus);

    const cRes = await fetch('http://localhost:5001/api/whatsapp/all-clients');
    const cData = await cRes.json();
    console.log('All clients count:', cData.total, 'Sample client:', cData.clients?.[0]?.name);

    const tRes = await fetch('http://localhost:5001/api/whatsapp/test-connection', { method: 'POST' });
    const tData = await tRes.json();
    console.log('Test connection result:', tData.status, tData.message);

    const bRes = await fetch('http://localhost:5001/api/whatsapp/bulk-send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipients: [
          { id: 'test-1', name: 'Test Student', phone: '919876543210', type: 'Student', class: '10th', whatsappOptIn: 'YES' }
        ],
        message: 'Hello {{name}} from {{centre_name}}!'
      })
    });
    const bData = await bRes.json();
    console.log('Bulk send test result:', bData.sent, 'sent of', bData.total);
  } catch (e) {
    console.log('Error testing server:', e.message);
  }
}
test();
