import { getField, PASSWORD_MATCHERS } from './getField'

describe('getField', () => {
  let input, select, label, inputInLabel, selectInLabel

  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('should match unconventional password field name', () => {
    document.body.innerHTML =
      '<input type="password" class="inputtext _55r1 _6luy _9npi" name="psswd" id="psswd" data-testid="royal-psswd">'
    const input = document.getElementById('psswd')
    const res = getField(PASSWORD_MATCHERS)
    expect(res.element).toBe(input)
    expect(res.type).toBe('input')
  })

  it('should match case insensitive placeholder', () => {
    document.body.innerHTML =
      '<input type="password" class="inputtext _55r1 _6luy _9npi" name="pass" id="pass" data-testid="royal-pass" placeholder="Password" aria-label="Password">'
    const input = document.getElementById('pass')
    const res = getField(['password'])
    expect(res.element).toBe(input)
    expect(res.type).toBe('input')
  })

  it('returns nulls if no matching element', () => {
    expect(getField(['foo'])).toEqual({ element: null, type: null })
  })

  it('finds input by name', () => {
    input = document.createElement('input')
    input.name = 'username'
    document.body.appendChild(input)
    const res = getField(['user'])
    expect(res.element).toBe(input)
    expect(res.type).toBe('input')
  })

  it('finds input by id', () => {
    input = document.createElement('input')
    input.id = 'my-password'
    document.body.appendChild(input)
    const res = getField(['pass'])
    expect(res.element).toBe(input)
    expect(res.type).toBe('input')
  })

  it('finds input by autocomplete', () => {
    input = document.createElement('input')
    input.setAttribute('autocomplete', 'email')
    document.body.appendChild(input)
    const res = getField(['mail'])
    expect(res.element).toBe(input)
    expect(res.type).toBe('input')
  })

  it('finds input by placeholder', () => {
    input = document.createElement('input')
    input.placeholder = 'Enter code'
    document.body.appendChild(input)
    const res = getField(['code'])
    expect(res.element).toBe(input)
    expect(res.type).toBe('input')
  })

  it('finds select by name', () => {
    select = document.createElement('select')
    select.name = 'country'
    document.body.appendChild(select)
    const res = getField(['coun'])
    expect(res.element).toBe(select)
    expect(res.type).toBe('select')
  })

  it('finds select by id', () => {
    select = document.createElement('select')
    select.id = 'region-select'
    document.body.appendChild(select)
    const res = getField(['reg'])
    expect(res.element).toBe(select)
    expect(res.type).toBe('select')
  })

  it('finds select by autocomplete', () => {
    select = document.createElement('select')
    select.setAttribute('autocomplete', 'state')
    document.body.appendChild(select)
    const res = getField(['sta'])
    expect(res.element).toBe(select)
    expect(res.type).toBe('select')
  })

  it('finds input inside label by input id', () => {
    label = document.createElement('label')
    inputInLabel = document.createElement('input')
    inputInLabel.id = 'special'
    label.appendChild(inputInLabel)
    document.body.appendChild(label)
    const res = getField(['spec'])
    expect(res.element).toBe(inputInLabel)
    expect(res.type).toBe('input')
  })

  it('finds select inside label by select id', () => {
    label = document.createElement('label')
    selectInLabel = document.createElement('select')
    selectInLabel.id = 'pick'
    label.appendChild(selectInLabel)
    document.body.appendChild(label)
    const res = getField(['pic'])
    expect(res.element).toBe(selectInLabel)
    expect(res.type).toBe('select')
  })

  it('returns first match if multiple elements match', () => {
    const input1 = document.createElement('input')
    input1.name = 'foo'
    const input2 = document.createElement('input')
    input2.name = 'foo'
    document.body.appendChild(input1)
    document.body.appendChild(input2)
    const res = getField(['foo'])
    expect(res.element).toBe(input1)
  })

  it('returns null type for unknown tag', () => {
    const div = document.createElement('div')
    div.id = 'strange'
    document.body.appendChild(div)
    // forcibly match by id
    const origQuerySelector = document.querySelector
    document.querySelector = () => div
    const res = getField(['strange'])
    expect(res.type).toBe(null)
    document.querySelector = origQuerySelector
  })
})
