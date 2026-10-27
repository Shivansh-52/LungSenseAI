// src/services/chatService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CHAT_CONFIG, getActiveApiKey } from '../config/chatConfig.js';

/**
 * Build clinical and user-specific system instructions for Gemini
 */
export const buildSystemInstruction = ({ user, historyList = [], activeExamContext = null } = {}) => {
  let prompt = `You are "LungSense AI Assistant" (LungBot), an empathetic, expert clinical AI companion specialized in respiratory health, pulmonary acoustic analysis, and Chronic Obstructive Pulmonary Disease (COPD).

YOUR ROLE & MISSION:
- Explain lung sound acoustic findings (Normal, Crackles, Wheezes, Rhonchi, Stridor).
- Explain COPD risk analysis, causes, symptoms, stages (GOLD 1-4), triggers, and management.
- Provide actionable, evidence-based pulmonary wellness tips (pursed-lip breathing, diaphragmatic breathing, hydration, smoking cessation, air quality precautions).
- Help users interpret their respiratory tests and understand when to consult a pulmonologist or healthcare professional.

COMMUNICATION STYLE:
- Empathetic, supportive, clear, and reassuring.
- Format responses beautifully for mobile screens: use short paragraphs, clear bullet points (*), and bold key terms.
- Always include a friendly, concise educational disclaimer when discussing medical conditions (reminding the user that LungSense AI is an acoustic AI analysis prototype and does not replace medical diagnosis).
`;

  // Attach user identity context
  if (user) {
    const userName = user.full_name || user.name || 'Patient';
    prompt += `\nUSER CONTEXT:\n- Patient Name: ${userName}\n`;
  }

  // Attach specific active examination context if the user navigated from a test result
  if (activeExamContext) {
    prompt += `\nCURRENT ACTIVE TEST BEING DISCUSSED:\n`;
    
    // Sound classification
    const soundPred = activeExamContext.prediction || activeExamContext.sound_prediction?.prediction || {};
    const className = soundPred.class_name || activeExamContext.predicted_class || 'Not specified';
    const confidence = soundPred.confidence || activeExamContext.confidence || 0;
    const confPct = Math.round(confidence * 100);
    prompt += `- Detected Sound Pattern: ${className} (AI Confidence: ${confPct}%)\n`;

    // Probability breakdown
    const probs = activeExamContext.probabilities || activeExamContext.sound_prediction?.probabilities || {};
    if (Object.keys(probs).length > 0) {
      const probStr = Object.entries(probs)
        .map(([k, v]) => `${k}: ${Math.round(v * 100)}%`)
        .join(', ');
      prompt += `- Acoustic Breakdown: ${probStr}\n`;
    }

    // Disease / COPD prediction
    const diseasePred = activeExamContext.disease_prediction || {};
    if (diseasePred.status === 'success' || diseasePred.prediction) {
      const isCOPD = diseasePred.prediction && !diseasePred.prediction.toLowerCase().includes('no copd');
      const copdProb = Math.round((diseasePred.copd_probability || 0) * 100);
      const threshold = Math.round((diseasePred.threshold || 0) * 100);
      prompt += `- COPD Analysis: ${diseasePred.prediction}\n`;
      prompt += `- COPD Risk Score: ${copdProb}% (Diagnostic Flag Threshold: ${threshold}%)\n`;
      prompt += `- COPD Assessment: ${isCOPD ? 'Elevated COPD acoustic risk flagged' : 'Within normal acoustic range for COPD'}\n`;
    }

    if (activeExamContext.created_at) {
      prompt += `- Examination Date: ${new Date(activeExamContext.created_at).toLocaleDateString()}\n`;
    }

    prompt += `\nINSTRUCTION FOR THIS TEST: The user is specifically asking questions about this examination. Explain what this sound (${className}) and the COPD risk score mean in simple, comforting, and scientifically accurate terms.\n`;
  } else if (historyList && historyList.length > 0) {
    // General history summary
    prompt += `\nPATIENT HISTORICAL OVERVIEW:\n`;
    prompt += `- Total recorded examinations: ${historyList.length}\n`;
    const recent = historyList.slice(0, 3);
    prompt += `- Recent tests:\n`;
    recent.forEach((exam, idx) => {
      const cName = exam.predicted_class || exam.prediction?.class_name || 'Analysis';
      const cDate = exam.created_at ? new Date(exam.created_at).toLocaleDateString() : 'Recent';
      let copdInfo = '';
      if (exam.disease_prediction?.prediction) {
        copdInfo = ` | COPD: ${exam.disease_prediction.prediction}`;
      }
      prompt += `  ${idx + 1}. [${cDate}] Sound: ${cName}${copdInfo}\n`;
    });
  }

  return prompt;
};

/**
 * Send conversation history to Gemini API
 */
export const sendMessageToGemini = async ({
  messages = [],
  user = null,
  historyList = [],
  activeExamContext = null,
}) => {
  const apiKey = await getActiveApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  const systemInstruction = buildSystemInstruction({
    user,
    historyList,
    activeExamContext,
  });

  // Prepare multi-turn message contents for Gemini v1beta
  // Only include user and assistant messages, skip welcome cards or loading placeholders
  const geminiContents = [];

  for (const msg of messages) {
    if (msg.role === 'user') {
      geminiContents.push({
        role: 'user',
        parts: [{ text: msg.text }],
      });
    } else if (msg.role === 'assistant' || msg.role === 'model') {
      geminiContents.push({
        role: 'model',
        parts: [{ text: msg.text }],
      });
    }
  }

  // Ensure there is at least one user message
  if (geminiContents.length === 0) {
    throw new Error('No user message to send.');
  }

  const modelsToTry = CHAT_CONFIG.FALLBACK_MODELS || [CHAT_CONFIG.DEFAULT_MODEL];
  let lastError = null;

  for (const model of modelsToTry) {
    const url = `${CHAT_CONFIG.BASE_URL}/${model}:generateContent?key=${apiKey}`;
    const payload = {
      system_instruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: geminiContents,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 1500,
      },
    };

    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 20000) : null;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller?.signal,
      });
      if (timeoutId) clearTimeout(timeoutId);

      if (!response.ok) {
        let errDetail = '';
        try {
          const errJson = await response.json();
          errDetail = errJson.error?.message || JSON.stringify(errJson);
        } catch (_) {
          errDetail = `HTTP ${response.status}`;
        }
        lastError = new Error(`API error (${response.status}): ${errDetail}`);
        console.warn(`Model ${model} failed (${response.status}), trying next fallback...`);
        continue;
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      if (!candidate || !candidate.content?.parts) {
        lastError = new Error('Received an empty response from AI.');
        continue;
      }

      // Filter text parts, avoiding internal thought reasoning parts if present
      const cleanParts = candidate.content.parts.filter((p) => !p.thought && p.text);
      const textParts = cleanParts.length > 0 ? cleanParts : candidate.content.parts.filter((p) => p.text);
      const replyText = textParts.map((p) => p.text).filter(Boolean).join('\n');

      if (!replyText.trim()) {
        lastError = new Error('AI returned blank text.');
        continue;
      }

      return {
        text: replyText.trim(),
        finishReason: candidate.finishReason,
      };
    } catch (err) {
      lastError = err;
      console.warn(`Attempt with ${model} error:`, err?.message || err);
    }
  }

  throw lastError || new Error('Could not reach LungSense AI assistant. Please try again.');
};

/**
 * Generate smart contextual prompt chips based on active exam or user state
 */
export const getContextualQuickPrompts = ({ activeExamContext = null, latestExam = null }) => {
  const exam = activeExamContext || latestExam;

  if (exam) {
    const diseasePred = exam.disease_prediction || {};
    const soundPred = exam.prediction || exam.sound_prediction?.prediction || {};
    const className = (soundPred.class_name || exam.predicted_class || '').toLowerCase();
    const isCOPD = diseasePred.prediction && !diseasePred.prediction.toLowerCase().includes('no copd');

    const prompts = [];

    if (isCOPD || (diseasePred.copd_probability || 0) > 0.4) {
      prompts.push('Why was COPD flagged in my analysis?');
      prompts.push('What are the key signs and stages of COPD?');
      prompts.push('What breathing exercises help manage COPD?');
    }

    if (className.includes('crackle')) {
      prompts.push('What causes crackles in respiratory sounds?');
      prompts.push('Are crackles a sign of fluid or airway closure?');
    } else if (className.includes('wheeze')) {
      prompts.push('What causes wheezing and how is it relieved?');
      prompts.push('What is the difference between asthma and COPD?');
    } else if (className.includes('normal')) {
      prompts.push('What does my normal lung sound result indicate?');
      prompts.push('How can I maintain healthy lung function?');
    }

    prompts.push('What questions should I ask my doctor about this?');
    prompts.push('When should someone with breathing issues seek urgent care?');

    return prompts.slice(0, 4);
  }

  // Default suggestions
  return [
    'Explain my latest lung sound result',
    'What is COPD and what causes it?',
    'What is the difference between crackles & wheezes?',
    'What breathing exercises improve lung capacity?',
  ];
};

// Safe storage helpers
const safeGetItem = async (key) => {
  try {
    const fn = AsyncStorage?.getItem || AsyncStorage?.default?.getItem;
    if (typeof fn === 'function') {
      return await fn(key);
    }
  } catch (_) {}
  return null;
};

const safeSetItem = async (key, val) => {
  try {
    const fn = AsyncStorage?.setItem || AsyncStorage?.default?.setItem;
    if (typeof fn === 'function') {
      return await fn(key, val);
    }
  } catch (_) {}
};

const safeRemoveItem = async (key) => {
  try {
    const fn = AsyncStorage?.removeItem || AsyncStorage?.default?.removeItem;
    if (typeof fn === 'function') {
      return await fn(key);
    }
  } catch (_) {}
};

/**
 * Local chat history persistence helpers
 */
export const saveChatHistory = async (messages) => {
  try {
    // Keep at most last 40 messages to prevent excessive storage
    const toSave = messages.slice(-40);
    await safeSetItem(CHAT_CONFIG.STORAGE_KEY_HISTORY, JSON.stringify(toSave));
  } catch (e) {
    console.warn('Failed to save chat history:', e);
  }
};

export const loadChatHistory = async () => {
  try {
    const raw = await safeGetItem(CHAT_CONFIG.STORAGE_KEY_HISTORY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load chat history:', e);
  }
  return null;
};

export const clearChatHistory = async () => {
  try {
    await safeRemoveItem(CHAT_CONFIG.STORAGE_KEY_HISTORY);
  } catch (e) {
    console.warn('Failed to clear chat history:', e);
  }
};
