import { LearningExperience, LearningLesson } from "@agentops/contracts";

export function LearningPanel({
  experiences,
  lessons
}: {
  experiences: LearningExperience[];
  lessons: LearningLesson[];
}): JSX.Element {
  return (
    <section className="card">
      <h2>Continuous Learning</h2>
      <p className="hint">Recent experiences and distilled lessons from autonomous runs.</p>

      <h3>Lessons</h3>
      <ul className="feed-list">
        {lessons.slice(0, 6).map((lesson) => (
          <li key={lesson.id} className="feed-item severity-info">
            <p>
              <strong>{lesson.title}</strong> | confidence {lesson.confidence}
            </p>
            <p>{lesson.recommendation}</p>
          </li>
        ))}
      </ul>

      <h3>Experiences</h3>
      <ul className="feed-list">
        {experiences.slice(0, 6).map((experience) => (
          <li
            key={experience.id}
            className={`feed-item ${experience.outcome === "failure" ? "severity-critical" : "severity-info"}`}
          >
            <p>
              <strong>{experience.objective}</strong> | {experience.strategy}
            </p>
            <p>
              {experience.outcome} | score {experience.score} | {new Date(experience.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
