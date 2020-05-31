const axios = require('axios')
const parseCSVSync = require('csv-parse/lib/sync')

/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it

// constants for your GraphQL Post and Author types
const WORD_NODE_TYPE = `Word`
const WORD_DATA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTpl-XVyb0wz6PanloLG6ImEnr9_YUQZZjAQT8jeXmhbOnFvMLPOnchINzI2w2TMBZcz0gxUCh6Abhq/pub?output=csv'

exports.sourceNodes = async ({
  actions,
  createContentDigest,
  createNodeId,
  getNodesByType,
}) => {
  const { createNode } = actions

  const res = await axios.get(WORD_DATA_URL)
  const dataCsv = parseCSVSync(res.data)

  const header = dataCsv.shift()
  const words = dataCsv.reduce((data, row, id) => {
    const word = header.reduce((s, h, i) => ({ ...s, [h]: row[i] }), {})
    word.id = id
    data.push(word)
    return data
  }, [])

  console.log(`Fetched words: ${words.length}`)

  const data = {
    words
  }

  // loop through data and create Gatsby nodes
  data.words.forEach(word =>
    createNode({
      ...word,
      id: createNodeId(`${WORD_NODE_TYPE}-${word.id}`),
      parent: null,
      children: [],
      internal: {
        type: WORD_NODE_TYPE,
        content: JSON.stringify(word),
        contentDigest: createContentDigest(word),
      },
    })
  )

  return
}
