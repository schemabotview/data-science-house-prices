import type { Section } from '../types'

export const whatDataScienceIs: Section = {
  id: 'what-data-science-is',
  title: "What data science is",
  scene: 'intro-data-science',
  narration:
    "Data science is the craft of turning data into an answer you can trust, and then into something other people can use. This course teaches it by doing it once, properly, from start to finish, on one question that needs no explaining: what is this house worth? The six steps across the screen are the shape of almost every data science project, and they are the shape of this course. It starts with a question, specific enough to be answered. Then the data: a file of house sales, opened in a notebook, where you can look before you leap. Then cleaning, which is where most of the real work goes: every fault found, explained and fixed, and the fixes written down. Then exploring: grouping, joining and drawing the data, and learning to say how sure you are of anything you claim. Then a model that predicts a price, measured honestly against a baseline, and checked for the ways models fool you. And finally shipping: a tested package, a command, and a web service, so the answer outlives the notebook. Underneath are the tools, one for each job: Python, JupyterLab, pandas, NumPy and SciPy, scikit learn, pytest and FastAPI. All pinned to exact versions, and every output on screen in this course is real, produced by running the code.",
}
