

import { useParams } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import QuizBuilderCore from '@/components/quiz/QuizBuilderCore'; // adjust path to wherever your actual builder is

export default function QuizBuilder({ mode }) {
  const { id } = useParams();  // undefined if /new
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <QuizBuilderCore mode={mode} quizId={id} />
      </div>
    </div>
  );
}
