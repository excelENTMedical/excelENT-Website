'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

interface QuizAnswer {
  id: string
  text: string
  score: number
}

interface QuizQuestion {
  id: string
  question: string
  answers: QuizAnswer[]
}

export default function QualificationQuiz() {
  const t = useTranslations('quiz')
  const tCommon = useTranslations('common')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)

  const questions: QuizQuestion[] = [
    {
      id: 'q1',
      question: t('question1'),
      answers: [
        { id: 'a1a', text: t('answer1a'), score: 1 },
        { id: 'a1b', text: t('answer1b'), score: 2 },
        { id: 'a1c', text: t('answer1c'), score: 3 },
      ],
    },
    {
      id: 'q2',
      question: t('question2'),
      answers: [
        { id: 'a2a', text: t('answer2a'), score: 2 },
        { id: 'a2b', text: t('answer2b'), score: 2 },
        { id: 'a2c', text: t('answer2c'), score: 2 },
        { id: 'a2d', text: t('answer2d'), score: 2 },
      ],
    },
    {
      id: 'q3',
      question: t('question3'),
      answers: [
        { id: 'a3a', text: t('answer3a'), score: 3 },
        { id: 'a3b', text: t('answer3b'), score: 2 },
        { id: 'a3c', text: t('answer3c'), score: 1 },
      ],
    },
  ]

  const handleAnswer = (answerId: string) => {
    const newAnswers = [...answers, answerId]
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowResults(true)
    }
  }

  const calculateScore = () => {
    let totalScore = 0
    answers.forEach((answerId, index) => {
      const question = questions[index]
      const answer = question.answers.find((a) => a.id === answerId)
      if (answer) {
        totalScore += answer.score
      }
    })
    return totalScore
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setAnswers([])
    setShowResults(false)
  }

  if (showResults) {
    const score = calculateScore()
    const isQualified = score >= 5

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-center">
        <div
          className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
            isQualified ? 'bg-secondary-100' : 'bg-primary-100'
          }`}
        >
          {isQualified ? (
            <svg
              className="w-10 h-10 text-secondary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              className="w-10 h-10 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>

        <h3 className="heading-3 text-gray-900 mb-4">
          {isQualified ? t('resultQualified') : t('resultNotSure')}
        </h3>

        <p className="text-gray-600 mb-8">
          {isQualified
            ? 'Based on your answers, you may be a good candidate for balloon sinuplasty. Connect with a specialist to learn more.'
            : "Let's get you connected with a specialist who can properly evaluate your symptoms and recommend the best treatment options."}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/find-specialist" className="btn-primary">
            {tCommon('findSpecialist')}
          </Link>
          <button onClick={resetQuiz} className="btn-secondary">
            Retake Quiz
          </button>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        {question.question}
      </h3>

      {/* Answers */}
      <div className="space-y-3">
        {question.answers.map((answer) => (
          <button
            key={answer.id}
            onClick={() => handleAnswer(answer.id)}
            className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all group"
          >
            <span className="text-gray-700 group-hover:text-primary-700">
              {answer.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
