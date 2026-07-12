async function askAI(message) {

  try {

    const response = await fetch("/api/chat", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        message: message
      })

    });

    if (!response.ok) {
      throw new Error("Request failed");
    }

    const data = await response.json();

    return data.reply;

  } catch (error) {

    console.error(error);

    return "❌ Error connecting to AI.";

  }

      }
