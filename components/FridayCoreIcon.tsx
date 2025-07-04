'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface FridayCoreIconProps {
  isActive: boolean
  isListening: boolean
  onActivate: () => void
  className?: string
}

export default function FridayCoreIcon({ 
  isActive, 
  isListening, 
  onActivate, 
  className = '' 
}: FridayCoreIconProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const iconVariants = {
    inactive: {
      scale: 1,
      rotate: 0,
      transition: { duration: 0.5, ease: "easeInOut" }
    },
    active: {
      scale: 0.6,
      rotate: 180,
      transition: { duration: 0.5, ease: "easeInOut" }
    },
    listening: {
      scale: 0.8,
      rotate: 360,
      transition: { 
        scale: { duration: 0.3 },
        rotate: { duration: 2, ease: "linear", repeat: Infinity }
      }
    }
  }

  const ringVariants = {
    inactive: {
      scale: [1, 1.1, 1],
      opacity: [0.6, 0.8, 0.6],
      transition: {
        duration: 3,
        ease: "easeInOut",
        repeat: Infinity,
      }
    },
    active: {
      scale: 0.3,
      opacity: 0.4,
      transition: { duration: 0.5 }
    },
    listening: {
      scale: [0.8, 1.2, 0.8],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 1.5,
        ease: "easeInOut",
        repeat: Infinity,
      }
    }
  }

  if (!mounted) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="w-32 h-32 rounded-full border-2 border-neon-blue animate-pulse" />
      </div>
    )
  }

  const currentState = isListening ? 'listening' : isActive ? 'active' : 'inactive'

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className="relative cursor-pointer"
        onClick={onActivate}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Outer Ring */}
        <motion.div
          className="absolute inset-0 w-32 h-32 neon-ring"
          variants={ringVariants}
          animate={currentState}
          style={{ transformOrigin: 'center' }}
        />
        
        {/* Middle Ring */}
        <motion.div
          className="absolute inset-4 w-24 h-24 neon-ring opacity-75"
          variants={ringVariants}
          animate={currentState}
          style={{ 
            transformOrigin: 'center',
            animationDelay: '0.5s'
          }}
        />
        
        {/* Inner Ring */}
        <motion.div
          className="absolute inset-8 w-16 h-16 neon-ring opacity-50"
          variants={ringVariants}
          animate={currentState}
          style={{ 
            transformOrigin: 'center',
            animationDelay: '1s'
          }}
        />
        
        {/* Core Circle */}
        <motion.div
          className="relative w-32 h-32 rounded-full bg-gradient-to-br from-neon-blue to-neon-blue-dark shadow-lg"
          variants={iconVariants}
          animate={currentState}
          style={{ transformOrigin: 'center' }}
        >
          {/* Inner Glow */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
          
          {/* Center Dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg" />
          
          {/* Voice Wave Indicators (when listening) */}
          {isListening && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-1">
              <div className="voice-wave" style={{ animationDelay: '0s' }} />
              <div className="voice-wave" style={{ animationDelay: '0.1s' }} />
              <div className="voice-wave" style={{ animationDelay: '0.2s' }} />
              <div className="voice-wave" style={{ animationDelay: '0.3s' }} />
              <div className="voice-wave" style={{ animationDelay: '0.4s' }} />
            </div>
          )}
        </motion.div>
        
        {/* Status Text */}
        <motion.div
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-neon-blue font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {isListening ? 'Listening...' : isActive ? 'Active' : 'Tap to activate'}
        </motion.div>
      </motion.div>
    </div>
  )
} 