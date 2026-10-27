import type { Section } from '../types'

export const whereNext: Section = {
  id: 'where-next',
  title: "Where next",
  scene: 'ship-where-next',
  narration:
    "That is the whole journey. We started with a CSV of house sales that could not even be averaged, because one agent typed pound signs. We cleaned it fault by fault, and wrote down every fix. We grouped it, joined it, drew it honestly, and learned to say how sure we were, with intervals and fair tests, and to spot a confounder. We built features without leaking the answer, compared models against a baseline, and discovered that a simple straight line recovered the rule the data was made with. We validated it, checked that its interval kept its promise, and taught it to refuse what it does not know. And finally we shipped it, as a tested package, a command and a web service. On the left is what you have built. On the right is where each part grows next. Millions of sales instead of fourteen hundred mean tools like Spark and a lakehouse. Retraining every month, automatically, is a data pipeline, with tools like Airflow and dbt. More models, and why they work, is machine learning proper. Keeping a model honest in production, versioned, monitored, and watched for the kind of drift we saw in Old Town, is MLOps. And the statistics behind the bootstrap and the permutation test deserve a course of their own. Each of those has its own series on GraphL. Thanks for building this one with me.",
}
