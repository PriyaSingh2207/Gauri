import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function Chatbot({ data }) {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: t('chatbot.intro') }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format the user's data into a context string
  const getContextString = () => {
    let context = "User's Health Data Summary:\n";
    
    if (data?.cycles?.length) {
      context += `- Recent Cycles: ${data.cycles.slice(-3).map(c => `Start: ${c.start}, Length: ${c.cycleLen} days`).join(' | ')}\n`;
    } else {
      context += `- No cycle data logged.\n`;
    }

    if (data?.symptoms?.length) {
      context += `- Recent Symptoms: ${data.symptoms.slice(-5).map(s => `[${s.date.split('T')[0]}] ${s.symptoms.join(', ')} (Mood: ${s.mood}, Pain: ${s.pain})`).join(' | ')}\n`;
    } else {
      context += `- No symptom data logged.\n`;
    }

    if (data?.pcosAssessments?.length) {
      const latestPCOS = data.pcosAssessments[data.pcosAssessments.length - 1];
      context += `- Latest PCOS Assessment: Risk ${latestPCOS.risk}. Symptoms: ${latestPCOS.symptoms.join(', ')}.\n`;
    }

    if (data?.breastAssessments?.length) {
      const latestBreast = data.breastAssessments[data.breastAssessments.length - 1];
      context += `- Latest Breast Health Assessment: Risk Level [${latestBreast.riskLevel?.toUpperCase()}]. Symptoms noted: ${latestBreast.symptoms?.join(', ') || 'None'}.\n`;
    }

    if (data?.medications?.length) {
      context += `- Medications: ${data.medications.map(m => `${m.name} (${m.dosage})`).join(', ')}\n`;
    }

    return context;
  };

  const handleSend = async () => {
    if (!inputMsg.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user', content: inputMsg }];
    setMessages(newMessages);
    setInputMsg('');
    setIsLoading(true);

    try {
      const contextString = getContextString();
      const languageName = t('chatbot.lang_name');
      
      const systemPrompt = `You are Gauri, an empathetic, knowledgeable, and privacy-focused AI health assistant for women. 
You must analyze the user's logged health data to provide insights and answer their questions.
If you notice high PCOS risk, severe pain, or irregular cycles, provide a risk assessment percentage and strongly recommend they consult a specialist.

IMPORTANT: You must respond in ${languageName}. All your responses must be in ${languageName}.

${contextString}

Note: Always add a disclaimer that you are an AI and not a substitute for professional medical advice. The disclaimer must also be in ${languageName}.`;

      const apiMessages = newMessages.map(m => ({
        role: m.role === 'assistant' ? 'model' : m.role,
        parts: [{ text: m.content }]
      }));

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyC9q17_rNwCe1WJKPDmhLWeP8zs6SQ0KRw";
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: apiMessages,
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 800,
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from Gemini API');
      }

      const responseData = await response.json();
      const aiResponse = responseData.candidates[0].content.parts[0].text;

      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: t('chatbot.error') }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="card" style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h2>{t('chatbot.title')}</h2>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
          {t('chatbot.desc')}
        </p>
      </div>

      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.role}`}>
            <div className="message-content">
              {msg.content.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="chat-message assistant">
            <div className="message-content typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <textarea
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={t('chatbot.placeholder')}
            className="input-field"
            style={{ 
              flex: 1, 
              resize: 'none', 
              height: '44px',
              paddingTop: '12px'
            }}
          />
          <button 
            onClick={handleSend} 
            disabled={isLoading || !inputMsg.trim()} 
            className="btn btn-primary"
            style={{ width: 'auto', padding: '0 20px', display: 'flex', alignItems: 'center' }}
          >
            {t('chatbot.send')}
          </button>
        </div>
      </div>
    </div>
  );
}
