import type { Os } from '../../schemas/content'
import type { Progress, Theme } from './schema'
import { resetProgress } from './storage'

export type ProgressAction =
  | { type: 'setOs'; os: Os }
  | { type: 'setTheme'; theme: Theme }
  | { type: 'visitModule'; key: string }
  | { type: 'markRead'; key: string; read: boolean }
  | { type: 'answerQuiz'; key: string; questionId: string; optionId: string }
  | { type: 'answerVerify'; stepId: string; optionId: string }
  | { type: 'completeMission'; missionId: string; at: string }
  | { type: 'commandRun' }
  | { type: 'awardBadges'; badgeIds: string[]; at: string }
  | { type: 'replace'; progress: Progress }
  | { type: 'reset' }

export function progressReducer(state: Progress, action: ProgressAction): Progress {
  switch (action.type) {
    case 'setOs':
      return state.os === action.os ? state : { ...state, os: action.os }
    case 'setTheme':
      return state.theme === action.theme ? state : { ...state, theme: action.theme }
    case 'visitModule': {
      const current = state.modules[action.key]
      if (current?.visited) return state
      return { ...state, modules: { ...state.modules, [action.key]: { read: current?.read ?? false, visited: true } } }
    }
    case 'markRead': {
      const current = state.modules[action.key] ?? { visited: true, read: false }
      return { ...state, modules: { ...state.modules, [action.key]: { ...current, visited: true, read: action.read } } }
    }
    case 'answerQuiz':
      return {
        ...state,
        quizAnswers: {
          ...state.quizAnswers,
          [action.key]: { ...state.quizAnswers[action.key], [action.questionId]: action.optionId },
        },
      }
    case 'answerVerify':
      return { ...state, verify: { ...state.verify, [action.stepId]: action.optionId } }
    case 'completeMission':
      if (state.missions[action.missionId]) return state
      return { ...state, missions: { ...state.missions, [action.missionId]: action.at } }
    case 'commandRun':
      return { ...state, stats: { ...state.stats, commandsRun: state.stats.commandsRun + 1 } }
    case 'awardBadges': {
      const fresh = action.badgeIds.filter((id) => !state.badges[id])
      if (fresh.length === 0) return state
      const badges = { ...state.badges }
      for (const id of fresh) badges[id] = action.at
      return { ...state, badges }
    }
    case 'replace':
      return action.progress
    case 'reset':
      return resetProgress(state)
  }
}
