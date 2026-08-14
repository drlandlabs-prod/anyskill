import { Routes, Route, Navigate } from 'react-router'
import { Landing } from '@/pages/Landing'
import { SkillMap } from '@/pages/SkillMap'
import { Session } from '@/pages/Session'
import { MentalModels } from '@/pages/MentalModels'
import { Habits } from '@/pages/Habits'
import { Finances } from '@/pages/Finances'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/map" element={<SkillMap />} />
      <Route path="/session" element={<Session />} />
      <Route path="/models" element={<MentalModels />} />
      <Route path="/habits" element={<Habits />} />
      <Route path="/finances" element={<Finances />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
