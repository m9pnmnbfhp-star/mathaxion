import { readFileSync } from 'fs'

const files = [
  ['A_Gymnasiou', 'C:/Users/pouli/Downloads/21-0210-01_Mathimatika_A-Gymnasiou_Vivlio-Mathiti.pdf'],
  ['B_Gymnasiou', 'C:/Users/pouli/Downloads/21-0211-01_Mathimatika_B-Gymnasiou_Vivlio-Mathiti.pdf'],
  ['G_Gymnasiou', 'C:/Users/pouli/Downloads/21-0213-01_Mathimatika_G-Gymnasiou_Vivlio-Mathiti.pdf'],
  ['A_Lykeiou_Algebra', 'C:/Users/pouli/Downloads/22-0284-01_Algebra-kai-Stoicheia-Pithanotiton_A-Lykeiou_Vivlio-Mathiti.pdf'],
  ['A_Lykeiou_Geometria', 'C:/Users/pouli/Downloads/22-0236-01_V2_Eukleideia-Geometria_A-Lykeiou_Vivlio-Mathiti.pdf'],
  ['B_Lykeiou_Algebra', 'C:/Users/pouli/Downloads/22-0207-02_Algebra_B-Lykeiou_Vivlio-Mathiti.pdf'],
  ['B_Lykeiou_Geometria', 'C:/Users/pouli/Downloads/22-0239-01_Eykleidia-Geometria_B-Lykeiou_Vivlio-Mathiti.pdf'],
  ['G_Lykeiou', 'C:/Users/pouli/Downloads/22-0273-01_Mathimatika-Teuchos-B_G-Lykeiou-Thetikon-Spoudon-kai-Spoudon-Oikonomias-Pliroforikis_Vivlio-Mathiti.pdf'],
]

async function extractText(filePath) {
  const { default: pdf } = await import('file:///C:/Users/pouli/mathima/node_modules/pdf-parse/dist/pdf-parse/cjs/index.cjs')
  const buf = readFileSync(filePath)
  const data = await pdf(buf, { max: 20 })
  return data.text
}

for (const [name, path] of files) {
  try {
    const text = await extractText(path)
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2 && l.length < 120)
    console.log(`\n===== ${name} =====`)
    console.log(lines.slice(0, 100).join('\n'))
  } catch (e) {
    console.log(`\n===== ${name} ERROR: ${e.message}`)
  }
}
