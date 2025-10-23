import { ObjectInputProps, useFormValue, set } from 'sanity'
import { useEffect } from 'react'

export function PartyAnswerInput(props: ObjectInputProps) {
  const { renderDefault, onChange, value } = props

  // Get the full document to access theses
  const theses = useFormValue(['theses']) as Array<{ _key: string; title: string; text: string }> | undefined

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {thesis ? (
        <div
          style={{
            padding: '1rem',
            borderRadius: '4px',
            backgroundColor: '#e8f4fd',
            border: '1px solid #b3d9f7',
          }}
        >
          <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            {thesis.title}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#666' }}>
            {thesis.text}
          </div>
        </div>
      ) : currentThesisKey ? (
        <div style={{ padding: '1rem', backgroundColor: '#ffe8e8', borderRadius: '4px', border: '1px solid #ffcccc' }}>
          <div style={{ fontSize: '0.875rem', color: '#cc0000', fontWeight: 600 }}>
            ⚠️ Thesis not found (deleted?)
          </div>
          <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
            Key: {currentThesisKey}
          </div>
        </div>
      ) : null}
      <div>{renderDefault(props)}</div>
    </div>
  )
}
