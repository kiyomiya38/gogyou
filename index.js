// index.js
const express = require('express');
const app = express();
const port = 80;
const diagnose = require('./diagnose');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/result', (req, res) => {
  const { year, month, day, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10 } = req.body;

  // 質問に応じた補正値
  const questionScores = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };

  const applyScore = (element, yesWeight) => {
    if (element && yesWeight) {
      questionScores[element] += yesWeight;
    }
  };

  // 質問ごとのスコア補正
  if (q1 === 'yes') applyScore('火', 10);
  if (q2 === 'yes') applyScore('水', 10);
  if (q3 === 'yes') applyScore('土', 10);
  if (q4 === 'yes') applyScore('木', 10);
  if (q5 === 'yes') applyScore('土', 5);
  if (q6 === 'yes') applyScore('火', 5);
  if (q7 === 'yes') applyScore('金', 10);
  if (q8 === 'yes') applyScore('金', 5);
  if (q9 === 'yes') applyScore('水', 5);
  if (q10 === 'yes') applyScore('金', 5);

  // 診断ロジックの呼び出し（質問スコアを渡す）
  const data = diagnose.getDiagnosis(parseInt(year), parseInt(month), parseInt(day), questionScores);

  // 結果HTMLを生成してレスポンス
  res.send(diagnose.renderHtml(data));
});

app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
