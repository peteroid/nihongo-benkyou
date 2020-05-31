import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import { graphql } from 'gatsby'
import { IoMdInformationCircleOutline, IoMdReturnLeft } from 'react-icons/io'
import { AiOutlineFileSearch } from 'react-icons/ai'
import { shuffle, get, uniq } from 'lodash'
import '../styles/index.css'

const getQuestion = (words = [], record = {}, lesson = '', qType = '', aType = '',  n = 4) => {
  const validWords = words.slice()
    .filter(w => !get(record, `${w.id}.familiar`))
    .filter(w => !lesson || w.lesson === lesson)
    .filter(w => w[qType] && w[aType])
  let selections = shuffle(validWords).slice(0, n)
  if (uniq(selections.map(w => w[aType])).length !== n) return getQuestion(words, record, lesson, qType, aType, n)
  const answer = selections[0]
  selections = shuffle(selections)
  return { answer, selections, final: validWords.length <= n }
}

const getLookupUrl = (word = '') => `https://jisho.org/search/${word}`

function Index({ data }) {
  const [started, setStarted] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [lesson, setLesson] = useState('')
  const [question, setQuestion] = useState({})
  const [lastAnswer, setLastAnswer] = useState(null)
  const [wordRecord, setWordRecord] = useState({})
  const words = data.allWord.edges.map(({ node: { id, lesson, nihongo: jp, hiragana: jpScript, english: en } }) => ({
    jp, en, id, lesson, jpScript
  }))

  const avilableLessons = uniq(words.map(w => w.lesson).filter(Boolean))

  const setNewQuestion = (l = lesson) => setQuestion({
    ...getQuestion(words, wordRecord, l, questionType, answerType),
    seed: Math.random() * 10000 | 0
  })

  const { answer, selections, final, seed } = question
  const questionType = (seed && seed % 2 === 1) ? 'en' : 'jp'
  const answerType = 'jpScript'

  const onAnswer = (s) => () => {
    if (final) {
      setCompleted(true)
      return
    }

    setLastAnswer(s)

    const familiar = s === answer
    setWordRecord({
      ...wordRecord,
      [answer.id]: {
        ...wordRecord[answer.id],
        familiar
      }
    })

    setTimeout(() => {
      setNewQuestion()
      setLastAnswer(null)
    }, 2500)
  }

  const onReset = () => {
    setCompleted(false)
    setWordRecord({})
  }

  const onSelectLesson = (lesson = '') => () => {
    setLesson(lesson)
    setStarted(true)
    setNewQuestion(lesson)
  }

  const trialCount = Object.keys(wordRecord).length
  const familiarCount = Object.values(wordRecord).filter(w => w.familiar).length
  // const accur = familiarCount * 100 / trialCount | 0

  return (
    <>
      <Helmet>
        <title>日本語勉強</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;400;600&display=swap"
        />
      </Helmet>
      <div className='main__container'>
        <div className='main__header'>
          {trialCount ? (
            <>
              <h2>You got {familiarCount}/{trialCount}</h2>
              <AiOutlineFileSearch className='header__check-icon' onClick={() => setShowStats(true)} />
            </>
          ) : (
            <h2>Let's learn Nihongo</h2>
          )}
        </div>
        <div className='main__question'>
          {!started ? (
            <div>
              <h3>Please select a question bank:</h3>
              <button onClick={onSelectLesson()}>ぜんぶ</button>
              {avilableLessons.map(l => (
                <button key={l} onClick={onSelectLesson(l)}>{l}回</button>
              ))}
            </div>
          ) : showStats ? (
            <div className='main__stats'>
              <div className='stats__words'>
                {Object.entries(wordRecord).map(([id, { familiar }]) => (
                  <h3 className={!familiar ? 'stats__wrong' : ''}>
                    <strong>{words.find(w => w.id === id).jp}</strong>
                    <span>{familiar ? '👍🏼' : '👎🏼'}</span>
                  </h3>
                ))}
              </div>
              <div className='stats__footer'>
                <IoMdReturnLeft onClick={() => setShowStats(false)} />
              </div>
            </div>
          ) : completed ? (
            <div>
              <h3>いいですよ！終わりました〜</h3>
              <button onClick={onReset}>Restart</button>
            </div>
          ) : (
            <div className='main__answer'>
              <h2>「<a href={getLookupUrl(answer[questionType])} target='_blank' rel='noreferrer'>{answer[questionType]}</a>」 は何ですか？</h2>
              <ul>
                {selections.map((s) => (
                  <li key={s[answerType]}>
                    <button onClick={onAnswer(s)}>
                      {lastAnswer && (lastAnswer.id === s.id || answer.id === s.id) && (
                        <span>{lastAnswer ? (answer.id === s.id ? '👍🏼' : '👎🏼') : ''}</span>
                      )}
                      {s[answerType]}
                    </button>
                    <a href={getLookupUrl(s[answerType])} className='answer__info-link' target='_blank' rel='noreferrer'>
                      <IoMdInformationCircleOutline className='answer__info-icon' />
                    </a>
                  </li>
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
