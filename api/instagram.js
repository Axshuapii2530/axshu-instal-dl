const axios = require("axios");

function extractVideoUrl(html) {
  const matches = [...html.matchAll(/<a[^>]+href="dl\.php\?url=([^"]+)"/g)];
  if (!matches || matches.length === 0) return null;
  const encodedUrl = matches[matches.length - 1][1];
  return decodeURIComponent(encodedUrl);
}

module.exports = async function handler(req, res) {
  const url = req.method === "POST" ? req.body.url : req.query.url;

  if (!url) {
    res.status(400).json({ status: false, message: "URL is required" });
    return;
  }

  try {
    const response = await axios.post(
      "https://instatik.app/core/ajax.php",
      new URLSearchParams({ url, host: "instagram" }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest",
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    const html = response.data;
    const videoUrl = extractVideoUrl(html);

    if (!videoUrl) return res.status(404).json({ status: false, message: "Video not found" });

    res.status(200).json({ status: true, url: videoUrl });
  } catch (err) {
    console.error("Axios error:", err.message);
    res.status(500).json({ status: false, message: "Failed to fetch video" });
  }
};
