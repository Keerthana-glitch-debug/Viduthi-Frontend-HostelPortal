/**
 * Chatbot knowledge base and query handler
 */
const HOSTEL_KNOWLEDGE = [
  {
    keywords: ['curfew', 'timing', 'gate', 'close', 'lock', 'night', 'return'],
    answer: 'Hostel night curfew is strictly 9:30 PM on weekdays and 10:00 PM on weekends. All residents must complete their GPS + Biometric attendance before curfew lock.',
  },
  {
    keywords: ['mess', 'food', 'breakfast', 'lunch', 'dinner', 'snacks', 'eat'],
    answer: 'Dining Hall Timings: \n• Breakfast: 07:30 AM – 09:00 AM\n• Lunch: 12:30 PM – 02:00 PM\n• High Tea / Snacks: 05:00 PM – 06:00 PM\n• Dinner: 07:45 PM – 09:30 PM\nExpress add-ons (Chicken curry ₹60, Omelette ₹25, Egg Poriyal ₹20) are billed directly to your room tab.',
  },
  {
    keywords: ['quiet', 'silent', 'study', 'noise', 'hours'],
    answer: 'Quiet Study Hours are observed between 10:30 PM and 06:00 AM. High-volume music and hallway gatherings are strictly prohibited to ensure conducive study conditions for all residents.',
  },
  {
    keywords: ['leave', 'outpass', 'travel', 'home', 'vacation', 'pass'],
    answer: 'Leave and Outpass requests must be submitted at least 4 hours in advance via the Resident Portal. Weekend passes require parent phone number confirmation and warden cryptographic QR sign-off.',
  },
  {
    keywords: ['gym', 'sports', 'badminton', 'basketball', 'table tennis', 'equipment'],
    answer: 'Campus Gym & Sports Facility Hours: \n• Morning: 06:00 AM – 08:30 AM\n• Evening: 05:00 PM – 08:30 PM\nSports equipment (racquets, balls) can be checked out at the Block B recreational desk with your student ID.',
  },
  {
    keywords: ['laundry', 'wash', 'machine', 'iron', 'clothes'],
    answer: 'Smart Laundry Facilities: \n• Machine 1 & 2 (Block A): Available 06:00 AM – 10:00 PM\n• Machine 3 & 4 (Block B): Available 06:00 AM – 10:00 PM\n• Steam Ironing: Available at ₹20 per cloth billed to your monthly resident account.',
  },
  {
    keywords: ['emergency', 'doctor', 'ambulance', 'hospital', 'warden', 'phone', 'contact'],
    answer: 'Emergency Contacts: \n• Campus Emergency Desk: +91 94440 01100\n• Chief Warden (Jeyanthi): +91 94440 01101\n• Health Centre (Dr. Madhu): +91 94440 01108\n• 24x7 Security Gate Post: +91 94440 01109',
  },
  {
    keywords: ['motivation', 'exam', 'stress', 'advice', 'study', 'tired'],
    answer: '“Consistency builds excellence.” Take short 10-minute walk breaks every hour, stay hydrated at the floor water dispensers, and remember that small daily progress compounds into outstanding semester achievements!',
  },
  {
    keywords: ['wifi', 'internet', 'lan', 'network', 'speed'],
    answer: 'Hostel High-Speed Wi-Fi is accessible across all blocks using your resident roll number credentials on the "Vidudhi-Resident-Secure" SSID. Bandwidth is 100 Mbps per resident.',
  },
];

exports.queryChatbot = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a question query string.',
      });
    }

    const cleanQuery = query.toLowerCase();

    // 1. If GEMINI_API_KEY is configured in backend .env, use Gemini 1.5 Flash
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `You are Vidudhi AI Copilot, a friendly, intelligent hostel companion at National Engineering College (NEC).
Help the resident student with their inquiry: "${query}".
Keep your response helpful, concise, well-formatted with markdown bullets where relevant, and positive.`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const candidateText =
            geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            return res.status(200).json({
              success: true,
              query,
              answer: candidateText,
              provider: 'Google Gemini 1.5 Flash',
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (geminiErr) {
        console.warn('[Gemini API Fallback to Local Intelligence]', geminiErr.message);
      }
    }

    // 2. Knowledge base matching with intelligent fallback
    let bestMatch = null;
    let maxMatchCount = 0;

    for (const item of HOSTEL_KNOWLEDGE) {
      const matchCount = item.keywords.filter((kw) => cleanQuery.includes(kw)).length;
      if (matchCount > maxMatchCount) {
        maxMatchCount = matchCount;
        bestMatch = item;
      }
    }

    let responseText = '';
    if (bestMatch && maxMatchCount > 0) {
      responseText = bestMatch.answer;
    } else {
      responseText = `I noted your question: "${query}".\n\nFor official resident policies, gate passes, or mess dining schedules, check your portal tabs or contact the Chief Warden desk (+91 94440 01100). Feel free to ask about gate timings, room maintenance, study tips, or facilities!`;
    }

    res.status(200).json({
      success: true,
      query,
      answer: responseText,
      provider: 'Vidudhi AI Engine',
      matchedRule: bestMatch ? bestMatch.keywords[0] : 'general',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
