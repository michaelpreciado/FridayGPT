'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, MicOff, User, Bot, VolumeX, Paperclip } from 'lucide-react'
import FridayCoreIcon from '@/components/FridayCoreIcon'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

interface ChatPanelProps {
  isVisible: boolean
  onClose: () => void
  messages: Message[]
  onSendMessage: (message: string, files?: File[]) => void
  isLoading: boolean
  currentUser?: any
}

export default function ChatPanel({
  isVisible,
  onClose,
  messages,
  onSendMessage,
  isLoading,
  currentUser
}: ChatPanelProps) {
  const [inputMessage, setInputMessage] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null)
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Speech Recognition
      const SpeechRecognition = window.speechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = false
        recognitionInstance.interimResults = true
        recognitionInstance.lang = 'en-US'

        recognitionInstance.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join('')

          setInputMessage(transcript)

          if (event.results[event.results.length - 1].isFinal) {
            setIsListening(false)
            if (transcript.trim()) {
              handleSendMessage(transcript)
            }
          }
        }

        recognitionInstance.onerror = () => {
          setIsListening(false)
        }

        recognitionInstance.onend = () => {
          setIsListening(false)
        }

        setRecognition(recognitionInstance)
      }

      // Speech Synthesis
      setSynthesis(window.speechSynthesis)

      // Load voices (they can load asynchronously)
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices()
        if (voices && voices.length > 0) {
          // Pick a natural-sounding English voice (prefer Google voices if available)
          const preferred =
            voices.find(v => v.name.toLowerCase().includes('google') && v.lang.startsWith('en')) ||
            voices.find(v => v.lang.startsWith('en')) ||
            voices[0]
          setVoice(preferred)
        }
      }

      // Some browsers fire "voiceschanged" when the list becomes available
      loadVoices()
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
      }
    }
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Speak assistant messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.role === 'assistant' && !lastMessage.isStreaming && synthesis) {
      speakText(lastMessage.content)
    }
  }, [messages, synthesis])

  const handleSendMessage = (message?: string) => {
    const textToSend = message || inputMessage.trim()
    if ((!textToSend && selectedFiles.length === 0) || isLoading) return

    onSendMessage(textToSend, selectedFiles)
    setInputMessage('')
    setSelectedFiles([])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition not supported in this browser')
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      setInputMessage('')
      recognition.start()
      setIsListening(true)
    }
  }

  const speakText = (text: string) => {
    if (!synthesis) return

    // Stop any current speech
    synthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = 0.9

    if (voice) {
      utterance.voice = voice
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    synthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    if (synthesis) {
      synthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length) {
      setSelectedFiles(prev => [...prev, ...files])
    }
  }

  const removeAttachment = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const panelVariants = {
    hidden: {
      y: '100%',
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Chat Panel */}
          <motion.div
            className="md:w-full max-w-2xl mx-auto z-50 relative"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="glass-panel m-4 max-h-[80vh] md:max-h-[600px] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-glass-border">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-neon-blue rounded-full animate-pulse" />
                  <h2 className="text-lg font-semibold">Friday AI</h2>
                  {currentUser && (
                    <span className="text-sm text-gray-400">
                      • {currentUser.displayName || 'User'}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {isSpeaking && (
                    <button
                      onClick={stopSpeaking}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <VolumeX className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors md:hidden"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Hello! I'm Friday, your AI assistant.</p>
                    <p className="text-sm mt-2">Ask me anything or try voice commands!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-neon-blue text-dark-bg ml-12'
                            : 'chat-message mr-12'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.role === 'assistant' && (
                            <Bot className="w-5 h-5 mt-0.5 text-neon-blue flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            {message.isStreaming && (
                              <div className="typing-indicator mt-2">
                                <div className="typing-dot" />
                                <div className="typing-dot" style={{ animationDelay: '0.2s' }} />
                                <div className="typing-dot" style={{ animationDelay: '0.4s' }} />
                              </div>
                            )}
                          </div>
                          {message.role === 'user' && (
                            <User className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Attachments Preview */}
              {selectedFiles.length > 0 && (
                <div className="px-4 pb-2 flex flex-wrap gap-2">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="relative">
                      {file.type.startsWith('image/') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={URL.createObjectURL(file)} alt={file.name} className="w-16 h-16 object-cover rounded-lg" />
                      ) : (
                        <div className="w-16 h-16 flex items-center justify-center bg-white/20 rounded-lg text-xs p-1 truncate">
                          {file.name}
                        </div>
                      )}
                      <button
                        className="absolute -top-2 -right-2 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        onClick={() => removeAttachment(idx)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-glass-border">
                <motion.div layoutId="inputBar" className="flex items-center space-x-2">
                  <button
                    onClick={handleAttachClick}
                    className="p-3 glass-button hover:bg-neon-blue/20"
                    disabled={isLoading || isListening}
                  >
                    <Paperclip className="w-5 h-5" />
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept="image/*,application/pdf,text/plain"
                      className="hidden"
                      onChange={handleFilesSelected}
                    />
                  </button>

                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={isListening ? "Listening..." : "Type a message..."}
                      className="w-full bg-white/10 border border-glass-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                      disabled={isLoading || isListening}
                    />
                    {isListening && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="flex space-x-1">
                          <div className="voice-wave" />
                          <div className="voice-wave" style={{ animationDelay: '0.1s' }} />
                          <div className="voice-wave" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={toggleListening}
                    className={`p-3 rounded-lg transition-all ${
                      isListening 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'glass-button hover:bg-neon-blue/20'
                    }`}
                    disabled={isLoading}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={(inputMessage.trim().length === 0 && selectedFiles.length === 0) || isLoading || isListening}
                    className="p-3 glass-button hover:bg-neon-blue/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </motion.div>
              </div>

              {/* Background Icon (when active) */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <FridayCoreIcon
                  isActive={false}
                  isListening={isListening || isSpeaking}
                  onActivate={() => {}}
                  className="scale-150"
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 