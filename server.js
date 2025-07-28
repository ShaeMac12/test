const express = require('express');
const app = express();

app.use(express.json());

app.post('/webhook', async (req, res) => {
  try {
    const uptimeData = req.body;
    console.log('Received:', uptimeData);

    const isDown = uptimeData.alert_type === 'down';
    const embed = {
      title: `${isDown ? '🔴' : '🟢'} External Monitoring Alert`,
      description: isDown 
        ? `${uptimeData.monitor_friendly_name} is currently experiencing issues.`
        : `${uptimeData.monitor_friendly_name} has recovered.`,
      color: isDown ? 0xff0000 : 0x00ff00,
      fields: [
        { name: 'Service', value: uptimeData.monitor_friendly_name, inline: true },
        { name: 'Status', value: uptimeData.alert_type.toUpperCase(), inline: true },
        { name: 'URL', value: uptimeData.monitor_url, inline: false }
      ],
      timestamp: new Date().toISOString(),
      footer: { text: 'HGN External Monitoring' }
    };

    const payload = { embeds: [embed] };
    if (isDown) payload.content = '<@&1195581728425787432> <@&1356071282726408252>';

    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(process.env.PORT || 3000);