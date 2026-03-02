import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Mail, Loader2, Inbox } from 'lucide-react';
import DOMPurify from 'dompurify'; 

export default function TempMailApp() {
  const [email, setEmail] = useState(null);
  const [token, setToken] = useState(null); // Auth token for Mail.tm
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // 1. Generate Email (Create Account on Mail.tm)
  const generateEmail = async () => {
    setLoading(true);
    setMessages([]);
    setSelectedMessage(null);
    setToken(null);
    
    try {
      // Step A: Get available domains
      const domainRes = await fetch('https://api.mail.tm/domains');
      const domainData = await domainRes.json();
      const domain = domainData['hydra:member'][0].domain;

      // Step B: Create random credentials
      const randomUser = Math.random().toString(36).substring(7);
      const password = "password123"; 
      const newEmail = `${randomUser}@${domain}`;

      // Step C: Register Account
      await fetch('https://api.mail.tm/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: newEmail, password: password })
      });

      // Step D: Login to get Token
      const tokenRes = await fetch('https://api.mail.tm/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: newEmail, password: password })
      });
      const tokenData = await tokenRes.json();
      
      if (tokenData.token) {
        setToken(tokenData.token);
        setEmail(newEmail);
      }

    } catch (error) {
      console.error("Error creating email:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Check Inbox (Polling)
  const checkInbox = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('https://api.mail.tm/messages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      // Mail.tm returns data in 'hydra:member' array
      const newMessages = data['hydra:member'] || [];
      
      if (newMessages.length !== messages.length) {
        setMessages(newMessages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // 3. Read Specific Message
  const readMessage = async (id) => {
    setLoadingMessages(true);
    try {
      const response = await fetch(`https://api.mail.tm/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setSelectedMessage(data);
    } catch (error) {
      console.error("Error reading message:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Initial Load
  useEffect(() => {
    generateEmail();
  }, []);

  // Polling Interval
  useEffect(() => {
    const interval = setInterval(checkInbox, 5000);
    return () => clearInterval(interval);
  }, [token, messages]);

  const handleCopy = () => {
    if (email) {
      navigator.clipboard.writeText(email);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0f172a] text-white font-sans overflow-x-hidden relative">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-purple-700/30 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-blue-700/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 flex flex-col items-center">
        
        <header className="mb-12 text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl mb-4">
            <Mail className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 tracking-tight">
            Temp-Mail
          </h1>
          {/* <p className="text-slate-400 text-lg max-w-md mx-auto">
            Powered by Mail.tm API (Reliable & Fast)
          </p> */}
        </header>

        <div className="w-full max-w-2xl">
          <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl transition-all duration-300 hover:border-white/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
              
              <div className="flex-1 w-full text-center md:text-left">
                <p className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wider">Your Temporary Email</p>
                {loading ? (
                   <div className="h-10 w-full bg-white/10 animate-pulse rounded-lg flex items-center justify-center text-xs text-slate-500">Connecting to secure server...</div>
                ) : (
                  <div className="text-2xl md:text-3xl font-mono font-bold text-white truncate px-2 py-1">
                    {email}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={handleCopy}
                  className="flex-1 md:flex-none h-12 px-6 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold shadow-lg transition-all active:scale-95"
                >
                  {copySuccess ? "Copied!" : <> <Copy size={18} /> Copy </>}
                </button>
                
                <button 
                  onClick={generateEmail}
                  className="h-12 w-12 flex items-center justify-center bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl transition-all border border-white/10 active:scale-95"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-4xl mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
          
          {/* Message List */}
          <div className="md:col-span-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                <Inbox size={18} /> Inbox
              </h3>
              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                {messages.length} New
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                  <Loader2 className="animate-spin mb-3 opacity-50" />
                  <p className="text-sm">Waiting for emails...</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.id}
                    onClick={() => readMessage(msg.id)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${selectedMessage?.id === msg.id ? 'bg-purple-600/20 border-purple-500/50' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm text-slate-200 truncate w-24">{msg.from.name || msg.from.address}</span>
                      <span className="text-xs text-slate-500">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-sm text-slate-400 truncate">{msg.subject}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Message Detail View */}
          <div className="md:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden flex flex-col">
            {!selectedMessage ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                <Mail size={48} className="mb-4 opacity-20" />
                <h3 className="text-xl font-medium text-slate-400">No Message Selected</h3>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-white/10 bg-white/5">
                  <h2 className="text-xl font-bold text-white mb-2">{selectedMessage.subject}</h2>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="bg-slate-700 px-2 py-0.5 rounded text-xs text-slate-400">From</span>
                      {selectedMessage.from.address}
                    </div>
                    <span className="text-slate-500">{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-900/30">
                  {loadingMessages ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
                  ) : (
                    // Using DOMPurify to clean HTML content
                    <div 
                      className="prose prose-invert prose-sm max-w-none text-slate-300"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedMessage.html ? selectedMessage.html[0] : selectedMessage.text) }} 
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}