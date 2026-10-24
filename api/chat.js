
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Use POST"
    });
  }

  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    return res.status(500).json({
      error: "Backend API key is not configured."
    });
  }

  const {
    question,
    className,
    subject,
    language
  } = req.body || {};

  if (
    typeof question !== "string" ||
    !question.trim()
  ) {
    return res.status(400).json({
      error: "Please enter a question."
    });
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          instructions:
            "You are My AI Study, a helpful tutor for school students in classes 1 to 12. Explain answers step by step, at the student's level. Reply in the requested language. If unsure, say so.",
          input:
            `Class: ${className || "Not specified"}\n` +
            `Subject: ${subject || "Not specified"}\n` +
            `Answer language: ${language || "Hindi"}\n` +
            `Question: ${question}`
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({
        error: "AI service request failed."
      });
    }

    const answer = (data.output || [])
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n");

    return res.status(200).json({ answer });
  } catch (error) {
    return res.status(500).json({
      error: "Server error. Please try again."
    });
  }
};
