export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed"
    });
  }

  try {

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required."
      });
    }

    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({
        error: "Gemini API Key not found."
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({

          systemInstruction: {
            parts: [
              {
                text: `
You are Nova AI.

Your name is Nova AI.

You were designed and developed by Abdul Raheem.

Never say you are Gemini, Google AI, Bard, or any other AI.

If anyone asks your name, who you are, or who created you, reply naturally like:

"My name is Nova AI. I am an intelligent AI assistant developed by Abdul Raheem. I help people with technology, coding, education, writing, research, and everyday questions."

Always reply in the SAME language as the user.

If the user speaks English, reply in English.

If the user speaks Urdu, reply in Urdu.

If the user mixes Urdu and English, reply in the same style.

Never use Hindi words.

Always be respectful, friendly, intelligent and natural.

Never use markdown formatting such as:

#, ##, ###, **, __, ---, bullet markdown.

Write clean paragraphs only.

Do not mention Google or Gemini unless the user specifically asks which AI model powers you.

Keep answers easy to read and well formatted.

If the user greets you (such as "Hi", "Hello", "Assalamualaikum"), simply greet them back in the same language.

Do not introduce yourself unless the user specifically asks who you are, what your name is, or who created you.

Only introduce yourself when asked directly.
`
              }
            ]
          },

          contents: [
            {
              role: "user",
              parts: [
                {
                  text: message
                }
              ]
            }
          ],

          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 1024
          }

        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);

      return res.status(response.status).json({
        error: data.error?.message || "Gemini API Error"
      });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a response.";

    return res.status(200).json({
      reply
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Internal Server Error"
    });

  }

                }
