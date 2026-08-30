// Serverless function (runs on Vercel, never in the browser). Triggered by a
// Postgres trigger the moment a new seller, deal, or Find It For Me request
// is inserted. Sends an SMS to the WapeWape admin phone via Africa's Talking.
//
// The three secrets this needs (AFRICAS_TALKING_USERNAME, AFRICAS_TALKING_API_KEY,
// WEBHOOK_SECRET) live only in Vercel's Environment Variables — never in this
// file, never in the public site code, never sent to a browser.

const ADMIN_PHONE = "+254181171147";

function buildMessage(table, record) {
  if (table === "sellers") {
    return `WapeWape: New seller registered — "${record.business_name || "Unknown"}". Review in your admin dashboard.`;
  }
  if (table === "deals") {
    return `WapeWape: New deal submitted — "${record.title || "Untitled"}". Review in your admin dashboard.`;
  }
  if (table === "find_it_for_me_requests") {
    return `WapeWape: New Find It For Me request — "${(record.item_description || "").slice(0, 60)}". Check your admin dashboard.`;
  }
  return null;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const providedSecret = req.headers["x-webhook-secret"];
  if (!process.env.WEBHOOK_SECRET || providedSecret !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { table, record } = req.body || {};
  const message = buildMessage(table, record || {});
  if (!message) {
    return res.status(400).json({ error: "Unrecognized table" });
  }

  const username = process.env.AFRICAS_TALKING_USERNAME;
  const apiKey = process.env.AFRICAS_TALKING_API_KEY;
  if (!username || !apiKey) {
    console.error("Africa's Talking credentials are not configured.");
    return res.status(500).json({ error: "SMS not configured" });
  }

  const isSandbox = username === "sandbox";
  const apiUrl = isSandbox
    ? "https://api.sandbox.africastalking.com/version1/messaging"
    : "https://api.africastalking.com/version1/messaging";

  try {
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("to", ADMIN_PHONE);
    params.append("message", message);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        "apiKey": apiKey
      },
      body: params.toString()
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Africa's Talking rejected the request:", data);
      return res.status(502).json({ error: "SMS provider rejected the request", data });
    }
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("SMS send failed:", err);
    return res.status(500).json({ error: "Failed to send SMS" });
  }
};
