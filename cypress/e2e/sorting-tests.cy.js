describe('Sorting App - initial screen', () => {
  it('shows Choose File, Load Demo, Continue Session', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Choose File').should('be.visible');
    cy.contains('Load Demo').should('be.visible');
    cy.contains('Continue Session').should('be.visible');
  });

  it('loads demo and shows Ranking Settings', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Load Demo').click();
    cy.contains('Ranking Settings', { timeout: 10000 }).should('be.visible');
  });

  it('validates binary-insertion comparisons and final sorted order', () => {
    // demo items (from FileSelection.tsx)
    const items = [
      { Name: 'Item 1', Rating: '8.5' },
      { Name: 'Item 2', Rating: '7.2' },
      { Name: 'Item 3', Rating: '9.1' },
      { Name: 'Item 4', Rating: '6.8' },
      { Name: 'Item 5', Rating: '8.9' },
      { Name: 'Item 6', Rating: '7.5' },
      { Name: 'Item 7', Rating: '8.2' },
      { Name: 'Item 8', Rating: '6.9' },
      { Name: 'Item 9', Rating: '9.3' },
      { Name: 'Item 10', Rating: '7.8' }
    ]

    // Simulate server-side binary-insertion sequence to get expected comparisons and final order
    const unsorted = Array.from({ length: items.length }, (_, i) => i)
    const sorted = []
    const comparisons = []

    while (unsorted.length > 0) {
      const current = unsorted.shift()
      let low = 0
      let high = sorted.length

      if (low >= high) {
        sorted.splice(low, 0, current)
        continue
      }

      while (low < high) {
        const mid = Math.floor((low + high) / 2)
        comparisons.push({ left: current, right: sorted[mid] })

        const currRating = parseFloat(items[current].Rating)
        const rightRating = parseFloat(items[sorted[mid]].Rating)

        if (currRating >= rightRating) {
          high = mid
        } else {
          low = mid + 1
        }
      }

      sorted.splice(low, 0, current)
    }

    const expectedFinal = sorted.map(i => items[i].Name)

    // Start the app and run through comparisons, validating left/right items each time
    cy.visit('http://localhost:3000')
    cy.contains('Load Demo').click()
    cy.contains('Start Ranking →', { timeout: 10000 }).click()

    // Step through expected comparisons in order
    comparisons.forEach((cmp) => {
      // Wait for comparison panels to render
      cy.get('.comparison-panel.left .item-field-label', { timeout: 10000 }).should('exist')

      // Read left Name and Rating
      cy.get('.comparison-panel.left .item-field-label').then(($leftFields) => {
        const leftArr = Array.from($leftFields).map(e => e.innerText || '')
        const leftNameLine = leftArr.find(t => t.includes('Name')) || ''
        const leftRatingLine = leftArr.find(t => t.includes('Rating')) || ''
        const leftName = leftNameLine.split(':').slice(1).join(':').trim()
        const leftRating = parseFloat((leftRatingLine.match(/([0-9]+\.?[0-9]*)/) || [])[1])

        // Read right Name and Rating and then assert and click accordingly
        cy.get('.comparison-panel.right .item-field-label').then(($rightFields) => {
          const rightArr = Array.from($rightFields).map(e => e.innerText || '')
          const rightNameLine = rightArr.find(t => t.includes('Name')) || ''
          const rightRatingLine = rightArr.find(t => t.includes('Rating')) || ''
          const rightName = rightNameLine.split(':').slice(1).join(':').trim()
          const rightRating = parseFloat((rightRatingLine.match(/([0-9]+\.?[0-9]*)/) || [])[1])

          // Verify panels show the expected items for this comparison
          expect(leftName).to.equal(items[cmp.left].Name)
          expect(rightName).to.equal(items[cmp.right].Name)

          // Click the correct button (choose the higher rating)
          if (leftRating >= rightRating) {
            cy.contains('✓ PREFER LEFT').click()
          } else {
            cy.contains('PREFER RIGHT ✓').click()
          }
        })
      })
    })

    // After all comparisons, verify results screen and final order
    cy.contains('Your Ranked Results', { timeout: 120000 }).should('be.visible')
    cy.get('.itemlist').within(() => {
      cy.get('h4').then(($els) => {
        const texts = Array.from($els).map(e => (e.textContent || '').trim())
        expect(texts).to.deep.equal(expectedFinal)
      })
    })
  })
});
