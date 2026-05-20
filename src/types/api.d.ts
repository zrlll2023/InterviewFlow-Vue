import type { Resume, Experience, InterviewSession, InterviewReport, JdMatchResult } from './models'

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  email?: string
}

export interface ResumeCreateRequest {
  title: string
  content: string
}

export interface ResumeUpdateRequest {
  id: number
  title: string
  content: string
}

export interface ExperienceCreateRequest {
  company: string
  position: string
  tags?: string
  content: string
}

export interface ExperienceUpdateRequest {
  id: number
  company: string
  position: string
  tags?: string
  content: string
}

export interface InterviewStartRequest {
  resumeId: number
  targetPosition: string
  jdText?: string
  experienceIds?: number[]
  difficulty: 'SMALL' | 'MEDIUM' | 'LARGE'
}

export interface InterviewStartResponse {
  sessionId: number
  firstQuestion: string
}

export interface ChatRequest {
  sessionId: number
  candidateAnswer: string
}

export interface ChatResponse {
  sessionId: number
  nextQuestion: string
  isFinished: boolean
}

export interface InterviewFinishRequest {
  sessionId: number
}

export interface JdMatchRequest {
  resumeId: number
  jdText: string
}

export interface PdfParseResult {
  title: string
  content: string
  parseMode: 'TEXT_EXTRACT' | 'VISION_OCR' | 'FAILED'
}

export interface ReportSummaryVO {
  sessionId: number
  targetPosition: string
  difficulty: string
  scoreTotal: number
  createdAt: string
  questionCount: number
}
