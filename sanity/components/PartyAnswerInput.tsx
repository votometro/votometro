import { ObjectInputProps, useFormValue, set, useClient } from 'sanity'
import { useEffect, useState } from 'react'
import { Card, Stack, Text, Spinner } from '@sanity/ui'

export function PartyAnswerInput(props: ObjectInputProps) {
  const { renderDefault, onChange, value } = props
  const client = useClient({ apiVersion: '2024-01-01' })

  // Get the election reference from the parent PartyParticipation document
  const electionRef = useFormValue(['election']) as { _ref: string } | undefined

  // Fetch theses from the referenced election
  const [theses, setTheses] = useState<Array<{ _key: string; title: string; text: string }> | undefined>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!electionRef?._ref) {
      setIsLoading(false)
      return
    }

    client
      .fetch<{ theses: Array<{ _key: string; title: string; text: string }> }>(
        `*[_type == "election" && _id == $electionId][0]{ theses }`,
        { electionId: electionRef._ref }
      )
      .then((election) => {
        setTheses(election?.theses)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch election theses:', err)
        setIsLoading(false)
      })
  }, [electionRef?._ref, client])

  // Get the current answer's thesisKey
  const currentThesisKey = (value as any)?.thesisKey

  // Find the thesis by _key
  const thesis = theses?.find((t) => t._key === currentThesisKey)

  // Get the answers array to check which theses are already answered
  const path = props.path || []
  const answersIndex = path.findIndex((segment) => segment === 'answers')
  const pathToAnswers = answersIndex !== -1 ? path.slice(0, answersIndex + 1) : []
  const answers = useFormValue(pathToAnswers.length > 0 ? pathToAnswers : ['_dummy']) as Array<any> | undefined

  // Auto-populate thesisKey if not set (for new answers)
  useEffect(() => {
    if (!currentThesisKey && theses && theses.length > 0 && answers) {
      const answeredThesisKeys = answers.map((a) => a?.thesisKey).filter(Boolean)
      const unansweredThesis = theses.find((t) => !answeredThesisKeys.includes(t._key))

      if (unansweredThesis) {
        onChange(set(unansweredThesis._key, ['thesisKey']))
      }
    }
  }, [currentThesisKey, theses, answers, onChange])

  return (
    <Stack space={3}>
      {isLoading ? (
        <Card padding={3} radius={2} tone="transparent" border>
          <Stack space={2} align="center">
            <Spinner />
            <Text size={1} muted>Loading thesis...</Text>
          </Stack>
        </Card>
      ) : thesis ? (
        <Card padding={3} radius={2} tone="primary" border>
          <Stack space={2}>
            <Text size={1} weight="semibold">
              {thesis.title}
            </Text>
            <Text size={1} muted>
              {thesis.text}
            </Text>
          </Stack>
        </Card>
      ) : currentThesisKey ? (
        <Card padding={3} radius={2} tone="critical" border>
          <Stack space={2}>
            <Text size={1} weight="semibold">
              ⚠️ Thesis not found (deleted?)
            </Text>
            <Text size={0} muted>
              Key: {currentThesisKey}
            </Text>
          </Stack>
        </Card>
      ) : null}
      <div>{renderDefault(props)}</div>
    </Stack>
  )
}
