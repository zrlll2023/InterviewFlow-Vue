export interface Resume {
  id: number
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface Experience {
  id: number
  company: string
  position: string
  tags: string
  content: string
  createdAt: string
}

export interface InterviewSession {
  id: number
  targetPosition: string
  difficulty: 'SMALL' | 'MEDIUM' | 'LARGE'
  status: 'ONGOING' | 'COMPLETED'
  createdAt: string
}

export interface InterviewMessage {
  id: number
  role: 'interviewer' | 'candidate'
  content: string
  sequence: number
}

export interface InterviewReport {
  id: number
  sessionId: number
  scoreTotal: number
  scoreTechnical: number
  scoreLogic: number
  advantage: string
  disadvantage: string
  detailedFeedback: FeedbackItem[]
  createdAt: string
}

export interface FeedbackItem {
  round: number
  question: string
  userAnswer: string
  critique: string
  recommendedAnswer: string
}

export interface JdMatchResult {
  matchScore: number
  weaknesses: string[]
  strengths: string[]
  recommendations: string[]
}

export interface AiConfig {
  baseUrl: string
  apiKey: string
  model: string
  connected: boolean
}
