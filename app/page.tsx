'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { LogIn, LogOut, Send, Paperclip, Menu } from 'lucide-react'
import FridayCoreIcon from '@/components/FridayCoreIcon'
import ChatPanel from '@/components/ChatPanel'
import { signInWithGoogle, signOut, onAuthChange, User as FirebaseUser } from '@/lib/auth'
import { getChatHistory, createUserProfile, getUserProfile } from '@/lib/db'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

export default function HomePage() {
  const [isActive, setIsActive] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [sessionId] = useState(() => Date.now().toString())
  const [heroInput, setHeroInput] = useState('')
  const [heroFiles, setHeroFiles] = useState<File[]>([])
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const toggleHistory = () => setIsHistoryOpen(prev => !prev)
  const heroFileInputRef = useRef<HTMLInputElement>(null)

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setCurrentUser(user)
      if (user) {
        // Get or create user profile
        let profile = await getUserProfile(user.uid)
        if (!profile) {
          await createUserProfile({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
          })
          profile = await getUserProfile(user.uid)
        }
        setUserProfile(profile)
        
        // Load chat history
        const history = await getChatHistory(user.uid, 20)
        setMessages(history.map(msg => ({
          id: msg.id || Date.now().toString(),
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp?.toDate() || new Date(),
        })))
      } else {
        setUserProfile(null)
        setMessages([])
      }
    })

    return unsubscribe
  }, [])

  const handleActivate = () => {
    setIsActive(true)
  }

  const handleClose = () => {
    setIsActive(false)
    setIsListening(false)
  }

  const handleSendMessage = async (messageContent: string, files?: File[]) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent || (files && files.length ? `📎 Sent ${files.length} attachment(s)` : ''),
      timestamp: new Date(),
    }

    // Show attachments previews locally for the user message (optional)
    setMessages(prev => [...prev, userMessage])

    // TODO: you can extend backend to handle file uploads. Currently attachments are ignored server-side.

    setIsLoading(true)

    // Create streaming assistant message
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }

    setMessages(prev => [...prev, assistantMessage])

    try {
      const messageToSend = messageContent || '[ATTACHMENT]'
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          userId: currentUser?.uid,
          sessionId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        let fullContent = ''
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                // Streaming complete
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessage.id 
                    ? { ...msg, isStreaming: false }
                    : msg
                ))
                break
              }

              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  fullContent += parsed.content
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: fullContent }
                      : msg
                  ))
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { 
              ...msg, 
              content: 'Sorry, I encountered an error. Please try again.',
              isStreaming: false 
            }
          : msg
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsActive(false)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleHeroAttachClick = () => {
    heroFileInputRef.current?.click()
  }

  const handleHeroFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length) {
      setHeroFiles(prev => [...prev, ...files])
    }
  }

  const handleHeroSend = () => {
    const prompt = heroInput.trim()
    if (!prompt && heroFiles.length === 0) return

    // Activate chat panel and send the first message
    if (!isActive) {
      handleActivate()
    }

    handleSendMessage(prompt, heroFiles)
    setHeroInput('')
    setHeroFiles([])
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base black background */}
        <div className="absolute inset-0 bg-black" />

        {/* Removed gradient and grid overlays for solid black background */}
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button onClick={toggleHistory} className="p-2 rounded-md hover:bg-white/10 focus:outline-none">
            <Menu className="w-6 h-6 text-neon-blue" />
          </button>
          <motion.h1 
            className="text-2xl font-bold text-neon-blue"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Friday AI
          </motion.h1>
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-400">
            <span>•</span>
            <span>JARVIS-Inspired Assistant</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {currentUser ? (
            <>
              <div className="flex items-center space-x-3">
                {currentUser.photoURL && (
                  <img 
                    src={currentUser.photoURL} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full border border-neon-blue"
                  />
                )}
                <span className="text-sm text-gray-300 hidden md:block">
                  {currentUser.displayName || 'User'}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="glass-button flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleSignIn}
              className="glass-button flex items-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Chat History Drawer */}
      <AnimatePresence>
        {isHistoryOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              key="history-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-40"
              onClick={toggleHistory}
            />

            {/* Drawer */}
            <motion.aside
              key="history-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-black/90 backdrop-blur-lg border-r border-glass-border z-50 p-4 overflow-y-auto hide-scrollbar"
            >
              <h3 className="text-lg font-semibold text-neon-blue mb-4">Chat History</h3>
              {messages.length === 0 ? (
                <p className="text-gray-400 text-sm">No messages yet.</p>
              ) : (
                messages
                  .filter(msg => msg.role === 'user')
                  .map((msg, idx) => (
                    <div key={msg.id || idx} className="mb-3">
                      <p className="text-sm text-white truncate">{msg.content.slice(0, 40) || '(attachment)'}</p>
                      <p className="text-xs text-gray-500">{msg.timestamp.toLocaleString()}</p>
                    </div>
                  ))
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <LayoutGroup>
        <AnimatePresence mode="wait">
        {!isActive ? (
          <motion.div
            layoutId="chatBox"
            key="hero"
            className="flex flex-col items-center w-full space-y-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.4 } }}
            transition={{ duration: 0.5 }}
          >
            {/* Title with holographic ring */}
            <div className="relative flex items-center justify-center">
              <FridayCoreIcon
                isActive={false}
                isListening={false}
                onActivate={() => {}}
                className="absolute scale-125 opacity-80"
              />
              <h1 className="relative text-4xl md:text-5xl font-bold text-white tracking-tight">
                FridayGPT
              </h1>
            </div>

            {/* Prompt Input */}
            <div className="w-full max-w-2xl">
              <motion.div layoutId="inputBar" className="flex items-center bg-glass-white backdrop-blur-md border border-glass-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-neon-blue">
                <button
                  onClick={handleHeroAttachClick}
                  className="px-4 py-3 text-neon-blue hover:text-neon-blue-dark transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                  <input
                    type="file"
                    ref={heroFileInputRef}
                    multiple
                    accept="image/*,application/pdf,text/plain"
                    className="hidden"
                    onChange={handleHeroFilesSelected}
                  />
                </button>
                <input
                  type="text"
                  placeholder="Ask anything"
                  className="w-full bg-transparent px-4 py-3 focus:outline-none text-white placeholder-gray-400"
                  value={heroInput}
                  onChange={(e) => setHeroInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleHeroSend()
                    }
                  }}
                />
                <button
                  onClick={handleHeroSend}
                  className="px-4 py-3 text-neon-blue hover:text-neon-blue-dark transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </motion.div>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
              {['Help me write', 'Summarize text', 'Brainstorm', 'Code', 'Analyze images', 'More'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setHeroInput(suggestion)}
                  className="glass-panel px-3 py-2 text-sm hover:bg-opacity-25 transition-colors duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            layoutId="chatBox"
            key="chat"
            className="w-full max-w-4xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
          >
            {/* Background Icon (when active) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <FridayCoreIcon
                isActive={false}
                isListening={isListening}
                onActivate={() => {}}
                className="scale-150"
              />
            </div>

            {/* Chat Panel */}
            <ChatPanel
              isVisible={isActive}
              onClose={handleClose}
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              currentUser={currentUser}
            />
          </motion.div>
        )}
        </AnimatePresence>
        </LayoutGroup>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center text-sm text-gray-500">
        <p>Powered by OpenAI GPT-4 • Built with Next.js & Framer Motion</p>
      </footer>
    </div>
  )
} 