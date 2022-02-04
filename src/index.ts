import fetch from 'cross-fetch'
import taxRates from './data/taxRate.json'

/**
 * Get site titles of cool websites.
 *
 * Task: Can we change this to make the requests async so they are all fetched at once then when they are done, return all
 * the titles and make this function faster?
 *
 * @returns array of strings
 */
export async function returnSiteTitles(): Promise<string[]> {
  const urls = [
    'https://patientstudio.com/',
    'https://www.startrek.com/',
    'https://www.starwars.com/',
    'https://www.neowin.net/'
  ]

  const titles: Array<string> = []

  await Promise.all(
    urls.map(url =>
      fetch(url, { method: 'GET' }).then(async response => {
        if (response.status === 200) {
          const data = await response.text()
          const match = data.match(/<title>(.*?)<\/title>/)
          if (match?.length) titles.push(match[1])
        }
      })
    )
  )
  return titles
}

/**
 * Count the tags and organize them into an array of objects.
 *
 * Task: That's a lot of loops; can you refactor this to have the least amount of loops possible.
 * The test is also failing for some reason.
 *
 * @param localData array of objects
 * @returns array of objects
 */
export function findTagCounts(localData: Array<SampleDateRecord>): Array<TagCounts> {
  const tagCounts: Array<TagCounts> = []

  /* 
    Get all tags from localData (This will have repeted tags)
    I'm using .flat() to have all tags in one array instead of
    having an array of arrays :: [[],[], []] flat()=> []
  */
  const tags: Array<string> = localData.map(d => d.tags).flat()

  /* 
    Create a set which will hold unique tags
    This helps in a way that we will make fewer iterations
  */
  const uniqueTags: Set<string> = new Set(tags)

  uniqueTags.forEach(el => {
    const itemOccurrence: Array<string> = tags.filter(t => t === el)
    tagCounts.push({
      tag: el,
      count: itemOccurrence.length
    })
  })

  return tagCounts
}

/**
 * Calcualte total price
 *
 * Task: Write a function that reads in data from `importedItems` array (which is imported above) and calculates the total price, including taxes based on each
 * countries tax rate.
 *
 * Here are some useful formulas and infomration:
 *  - import cost = unit price * quantity * importTaxRate
 *  - total cost = import cost + (unit price * quantity)
 *  - the "importTaxRate" is based on they destiantion country
 *  - if the imported item is on the "category exceptions" list, then no tax rate applies
 */
export function calcualteImportCost(importedItems: Array<ImportedItem>): Array<ImportCostOutput> {
  // This function returns a new array with the map function

  return importedItems.map(importItem => {
    /* Find the item tax rate based on the countryDestination 
      and the fact that it's not exempted from taxes
    */
    const itemTax = taxRates.find(
      tax => tax.country == importItem.countryDestination && !tax.categoryExceptions.includes(importItem.category)
    )

    const { unitPrice, quantity, name } = importItem
    const subtotal: number = unitPrice * quantity
    let importCost = 0

    if (itemTax && itemTax.importTaxRate) {
      importCost = subtotal * itemTax.importTaxRate
    }

    const totalCost: number = importCost + subtotal

    return {
      name,
      subtotal,
      importCost,
      totalCost
    }
  })
}
