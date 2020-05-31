import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { graphql } from 'gatsby';
import { shuffle, get } from 'lodash'
import '../styles/index.css';

const getQuestioner = (words = [], record = {}, n = 4) => {
  const validWords = words.slice().filter(w => !get(record, `${w.id}.familiar`))
  let selections = shuffle(validWords).slice(0, n)
  const answer = selections[0]
  selections = shuffle(selections)
  return { answer, selections, final: validWords.length <= n }
}

function Index({ data }) {
  const [completed, setCompleted] = useState(false)
  const [wordRecord, setWordRecord] = useState({})
  const words = data.allWord.edges.map(({ node: { id, nihongo: jp, english: en } }) => ({
    jp, en, id
  }))

  const { answer, selections, final } = getQuestioner(words, wordRecord)
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

  const trialCount = Object.keys(wordRecord).length
  const familiarCount = Object.values(wordRecord).filter(w => w.familiar).length
  const accur = familiarCount * 100 / trialCount | 0
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
          <h1>Nihongo</h1>
          {!isNaN(accur) && <h2>Accuracy: {accur}%</h2>}
        </div>
        <div className='main__question'>
          {completed ? (
            <div>
              <h3>Nice! You've compeleted all the questions</h3>
              <button onClick={onReset}>Restart</button>
            </div>
          ) : (
            <div className='main__answer'>
              <h2>Which one best describes "{answer.en}"?</h2>
              <ul>
                {selections.map((s) => (
                  <li key={s.en}><button onClick={onAnswer(s)}>{s.jp}</button></li>
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
    allWord(filter: {nihongo: {ne: ""}, english: {nin: ""}}) {
      edges {
        node {
          id
          nihongo
          english
        }
      }
    }
  }
`


export default Index;
