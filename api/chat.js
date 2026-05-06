// Database
const FUTO_KNOWLEDGE = `
FEDERAL UNIVERSITY OF TECHNOLOGY, OWERRI (FUTO) KNOWLEDGE BASE:
- Location: Owerri, Imo State, Nigeria.
- ICT Center: Located in the main campus, close to FUTO roundabout.
- SIWES: The Student Industrial Work Experience Scheme is a core program.
- Grading System: A (70-100), B (60-69), C (50-59), D (45-49), E (40-44), F (0-39).
- Course Registration: Students must use the university student portal to select approved courses for their level.
- Fees Payment: Processed through the official school payment portal via invoice generation.
- Official website: https://futo.edu.ng.
- Developer: Campus AI(you) was built by Oliver Uchechukwu a 300 level student of FUTO.
- Developer contact: X(formerly twitter): email: kachyoliver17@gmail.com.
- Vice Chancellor: The current VC is Professor Nnenna Nnannaya Oti.
`;

export default async function handler(req, res) {
  // Vercel uses req.method instead of event.httpMethod
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Vercel auto-parses JSON, so we just grab req.body directly
    const body = req.body;

    const enhancedSystemPrompt = `${body.system}\n\nCRITICAL INSTRUCTION: Use the following knowledge base to answer questions. If the answer is not in this text, guide the user on where they might find it on campus.\n\n${FUTO_KNOWLEDGE}`;

    const groqMessages = [
      { role: "system", content: enhancedSystemPrompt },
      ...body.messages
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: groqMessages,
        max_tokens: 1000
      }),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("Groq API Error:", data);
        // Vercel syntax for returning errors
        return res.status(response.status).json({ error: data.error?.message || "Groq API error" });
    }

    // Vercel syntax for returning successful responses
    return res.status(200).json(data);
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: "Failed to connect to backend service" });
  }
}
