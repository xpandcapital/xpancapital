const baseUrl = 'http://localhost:3000'

async function testSave() {
  try {
    const res = await fetch(baseUrl + '/api/email-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        empresa_id: '6186f014-c8c7-4027-9f08-8acf2bae3eae',
        nombre: 'Test Template',
        settings: {},
        blocks: []
      })
    })
    const data = await res.json()
    console.log(data)
  } catch(e) {
    console.error(e)
  }
}

testSave()
