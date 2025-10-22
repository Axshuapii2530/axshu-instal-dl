const axios = require("axios");

// Function to extract direct video URL from Instatik HTML
function extractVideoUrl(html) {
  const matches = [...html.matchAll(/<a[^>]+href="dl\.php\?url=([^"]+)"/g)];
  if (!matches || matches.length === 0) return null;
  const encodedUrl = matches[matches.length - 1][1];
  return decodeURIComponent(encodedUrl);
}

// Serverless function handler
module.exports = async function handler(req, res) {
  const url = req.method === "POST" ? req.body.url : req.query.url;

  const responseTemplate = {
    status: false,
    author: "Axshu",
    url: null,
    message: "",
  };

  if (!url) {
    responseTemplate.message = "URL is required";
    return res.status(400).json(responseTemplate);
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

    if (!videoUrl) {
      responseTemplate.message = "Video not found";
      return res.status(404).json(responseTemplate);
    }

    // Success response
    responseTemplate.status = true;
    responseTemplate.url = videoUrl;
    responseTemplate.message = "API working successfully";
    return res.status(200).json(responseTemplate);

  } catch (err) {
    console.error("Axios error:", err.message);
    responseTemplate.message = "Failed to fetch video";
    return res.status(500).json(responseTemplate);
  }
};
