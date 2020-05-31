import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { graphql } from 'gatsby';
import { shuffle, get, uniq } from 'lodash'
import '../styles/index.css';

const getQuestion = (words = [], record = {}, lesson = '', qType = '', aType = '',  n = 4) => {
  const validWords = words.slice()
    .filter(w => !get(record, `${w.id}.familiar`))
    .filter(w => !lesson || w.lesson === lesson)
    .filter(w => w[qType] && w[aType])
  let selections = shuffle(validWords).slice(0, n)
  const answer = selections[0]
  selections = shuffle(selections)
  return { answer, selections, final: validWords.length <= n }
}

function Index({ data }) {
  const [completed, setCompleted] = useState(false)
  const [started, setStarted] = useState(false)
  const [lesson, setLesson] = useState('')
  const [wordRecord, setWordRecord] = useState({})
  const words = data.allWord.edges.map(({ node: { id, lesson, nihongo: jp, hiragana: jpScript, english: en } }) => ({
    jp, en, id, lesson, jpScript
  }))

  const avilableLessons = uniq(words.map(w => w.lesson).filter(Boolean))

  const questionType = 'jp'
  const answerType = 'jpScript'

  const { answer, selections, final } = getQuestion(words, wordRecord, lesson, questionType, answerType)
  const onAnswer = (s) => () => {
    if (final) {
      setCompleted(true)
      return
    }

    const familiar = s === answer
    setWordRecord({
      ...wordRecord,
      [answer.id]: {
        ...wordRecord[answer.id],
        familiar
      }
    })
  }

  const onReset = () => {
    setCompleted(false)
    setWordRecord({})
  }

  const onSelectLesson = (lesson = '') => () => {
    setLesson(lesson)
    setStarted(true)
  }

  const trialCount = Object.keys(wordRecord).length
  const familiarCount = Object.values(wordRecord).filter(w => w.familiar).length
  // const accur = familiarCount * 100 / trialCount | 0

  return (
    <>
      <Helmet>
        <title>Nihongo Benkyou</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;400;600&display=swap" rel="stylesheet" />
      </Helmet>
      <div className='main__container'>
        <div className='main__header'>
          {trialCount ? (
            <h2>You got {familiarCount}/{trialCount}</h2>
          ) : (
            <h2>Let's learn Nihongo</h2>
          )}
        </div>
        <div className='main__question'>
          {!started ? (
            <div>
              <h3>Select the question bank</h3>
              <button onClick={onSelectLesson()}>ぜんぶ</button>
              {avilableLessons.map(l => (
                <button key={l} onClick={onSelectLesson(l)}>{l}かい</button>
              ))}
            </div>
          ) : completed ? (
            <div>
              <h3>Nice! You've compeleted all the questions</h3>
              <button onClick={onReset}>Restart</button>
            </div>
          ) : (
            <div className='main__answer'>
              <h2>Which one best describes "{answer[questionType]}"?</h2>
              <ul>
                {selections.map((s) => (
                  <li key={s.en}><button onClick={onAnswer(s)}>{s[answerType]}</button></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export const query = graphql`
  query Words {
    allWord {
      edges {
        node {
          id
          nihongo
          hiragana
          english
          lesson
        }
      }
    }
  }
`


export default Index;
