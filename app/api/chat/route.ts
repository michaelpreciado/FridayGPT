import { NextRequest, NextResponse } from 'next/server'
import { openai, SYSTEM_PROMPT } from '@/lib/openai'
import { getChatHistory, saveChatMessage } from '@/lib/db'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { message, userId, sessionId } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Get recent chat history for context
    const recentMessages = userId ? await getChatHistory(userId, 10) : []
    
    // Build conversation context
    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...recentMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user' as const, content: message }
    ]

    // Save user message
    if (userId) {
      await saveChatMessage({
        userId,
        role: 'user',
        content: message,
        sessionId
      })
    }

    // Create streaming response
    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      stream: true,
      max_tokens: 1000,
      temperature: 0.7,
    })

    let fullResponse = ''
    
    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || ''
          if (content) {
            fullResponse += content
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
          }
        }
        
        // Save assistant response
        if (userId && fullResponse) {
          await saveChatMessage({
            userId,
            role: 'assistant',
            content: fullResponse,
            sessionId
          })
        }
        
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 