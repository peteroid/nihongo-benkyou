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
  const [score, setScore] = useState(0)
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
        familiar
      }
    })
    setScore(score + (familiar ? 1 : -1))
  }

  const onReset = () => {
    setCompleted(false)
    setWordRecord({})
  }

  return (
    <>
      <Helmet>
        <title>Nihongo Benkyou</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Helmet>
      <div className='main__container'>
        <div className='main__question'>
          <h1>Nihongo テスト</h1>
          <p>Score: {score}</p>
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
