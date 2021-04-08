/// <reference types="cypress" />

import { format, prepareLocalStorage } from '../support/utils'

/* Formas de executar os testes com resoluções de tela diferentes:
    * cy.viewport
    * arquivos de config (cypress.json)
    * configs por linha de comando -> Nessa aula foi usado: npx cypress open --config viewportWidth=411,viewportHeight=823
    */

context('Dev Finances Agilizie', () => {
  // hooks
  // trechos de código que executam antes e depois do teste
  // before -> antes de todos os testes
  // beforeEach -> antes de cada teste
  // after -> depois de todos os testes
  // afterEach -> depois de cada teste

  beforeEach(() => {
    cy.visit('https://devfinance-agilizei.netlify.app/', {
      onBeforeLoad: (win) => { // onBeforeLoad: Realizada ação antes de carregar a página
        prepareLocalStorage(win) // Irá preparar os dados pegar informações da função do arquivo utils.js
      }
    })
  })

  it('Cadastrar entradas', () => {
    // cy.visit('https://devfinance-agilizei.netlify.app/')

    // Mapeando elementos

    cy.get('#transaction .button').click() // id + classe
    cy.get('#description').type('Mesada') // id
    cy.get('[name=amount]').type(100) // atributo
    cy.get('[type=date]').type('2021-03-17') // atributo
    cy.get('button').contains('Salvar').click() // tipo e valor

    // Adicionando asserção

    // cy.get('#data-table tbody tr').should('have.length', 1) // pode usar should ou expected
    cy.get('#data-table tbody tr').should('is.not.null') // pode usar is.not.null garantindo que existe algo cadastrado.
  })

  it('Cadastrar saída', () => {
    // cy.visit('https://devfinance-agilizei.netlify.app/')

    // Mapeando elementos

    cy.get('#transaction .button').click() // id + classe
    cy.get('#description').type('Presente') // id
    cy.get('[name=amount]').type(-100) // atributo
    cy.get('[type=date]').type('2021-03-17') // atributo
    cy.get('button').contains('Salvar').click() // tipo e valor

    // Adicionando asserção

    // cy.get('#data-table tbody tr').should('have.length', 1) // pode usar should ou expected
    cy.get('#data-table tbody tr').should('is.not.null') // pode usar is.not.null garantindo que existe algo cadastrado.
  })

  it('Remover entradas e saídas', () => {
    const entrada = 'Mesada'
    const saida = 'Presente'

    cy.get('#transaction .button').click()
    cy.get('#description').type(entrada)
    cy.get('[name=amount]').type(100)
    cy.get('[type=date]').type('2021-03-17')
    cy.get('button').contains('Salvar').click()

    cy.get('#transaction .button').click()
    cy.get('#description').type(saida)
    cy.get('[name=amount]').type(-100)
    cy.get('[type=date]').type('2021-03-17')
    cy.get('button').contains('Salvar').click()

    // Estratégia 1: voltar para o elemento pai, e avançar para um td img atr

    cy.get('td.description')
      .contains(entrada)
      .parent()
      .find('img[onclick*=remove]')
      .click()

    // Estratégia 2: buscar todos os irmãos, e buscar o que tem img + atr

    cy.get('td.description')
      .contains(saida)
      .siblings()
      .children('img[onclick*=remove]')
      .click()

    cy.get('#data-table tbody tr').should('have.length', 2)
  })

  it('Validar saldo com diversas transações', () => {
    // const entrada = 'Mesada'
    // const saida = 'Presente'

    // cy.get('#transaction .button').click()
    // cy.get('#description').type(entrada)
    // cy.get('[name=amount]').type(100)
    // cy.get('[type=date]').type('2021-03-17')
    // cy.get('button').contains('Salvar').click()

    // cy.get('#transaction .button').click()
    // cy.get('#description').type(saida)
    // cy.get('[name=amount]').type(-100)
    // cy.get('[type=date]').type('2021-03-17')
    // cy.get('button').contains('Salvar').click()

    let incomes = 0 // entradas
    let expenses = 0 // saidas

    cy.get('#data-table tbody tr')
      .each(($el, index, $list) => { // navegar em cada item da lista e executar uma determinada ação. Faz a repetição de cada item da lista.
        cy.get($el).find('td.income, td.expense').invoke('text').then((text) => {
          if (text.includes('-')) {
            expenses += format(text)
          } else {
            incomes += format(text)
          }

          cy.log('entradas', incomes)
          cy.log('saidas', expenses)
        })
      })

    cy.get('#totalDisplay').invoke('text').then((text) => {
      const formattedTotalDisplay = format(text)
      const expectedTotal = incomes + expenses

      expect(formattedTotalDisplay).to.eq(expectedTotal)
    })
  })
})
