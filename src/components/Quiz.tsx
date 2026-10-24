import { useId } from 'react'
import { getModuleByKey } from '../content'
import { isQuizPassed, useProgress } from '../features/progress'
import type { QuizQuestion } from '../schemas/content'
import { useModuleKey } from './moduleContext'
import { ChoiceList } from './ChoiceList'
import { Nuppu } from './Nuppu'

/**
 * Moduulin visa (quiz.json). Välitön palaute jokaiselle vaihtoehdolle,
 * uudelleenyritys sallittu. Moduuli tunnistetaan ModuleContextista.
 */
export function Quiz() {
  const moduleKey = useModuleKey()
  const { progress } = useProgress()
  const module = moduleKey ? getModuleByKey(moduleKey) : undefined
  if (!module?.quiz) return <p className="notice notice--error">Visaa ei löytynyt.</p>

  const passed = isQuizPassed(progress, module)
  return (
    <section className="card quiz" aria-labelledby={`visa-${module.id}`}>
      <h2 id={`visa-${module.id}`}>Visa</h2>
      <p className="muted">Valitse vastaus. Saat palautteen heti, ja voit yrittää uudelleen niin monta kertaa kuin haluat.</p>
      {module.quiz.questions.map((q, i) => (
        <QuizQuestionView key={q.id} moduleKey={module.key} question={q} number={i + 1} />
      ))}
      <div aria-live="polite">
        {passed && (
          <p className="notice notice--success notice--mascot notice--rise">
            <Nuppu pose="iloitsee" size={56} />
            Visa läpäisty! Kaikki vastaukset ovat oikein.
          </p>
        )}
      </div>
    </section>
  )
}

interface QuestionProps {
  moduleKey: string
  question: QuizQuestion
  number: number
}

function QuizQuestionView({ moduleKey, question, number }: QuestionProps) {
  const { progress, dispatch } = useProgress()
  const headingId = useId()
  const selectedId = progress.quizAnswers[moduleKey]?.[question.id]

  return (
    <div className="quiz__question">
      <h3 id={headingId} className="quiz__prompt">
        {number}. {question.question}
      </h3>
      <ChoiceList
        labelledBy={headingId}
        options={question.options.map((o) => ({ id: o.id, label: o.text, correct: o.correct, explanation: o.explanation }))}
        selectedId={selectedId}
        revealAllWhenCorrect
        onSelect={(optionId) => dispatch({ type: 'answerQuiz', key: moduleKey, questionId: question.id, optionId })}
      />
    </div>
  )
}
