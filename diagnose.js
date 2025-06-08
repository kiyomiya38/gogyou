// diagnose.js（完全統合版：質問補正・レーダーチャート・相性・職業・アドバイス・HTML描画）
const { Lunar } = require('lunar-javascript');

const stemMap = {
  '甲': ['木', '陽'], '乙': ['木', '陰'],
  '丙': ['火', '陽'], '丁': ['火', '陰'],
  '戊': ['土', '陽'], '己': ['土', '陰'],
  '庚': ['金', '陽'], '辛': ['金', '陰'],
  '壬': ['水', '陽'], '癸': ['水', '陰']
};

const traitSummary = {
  '木-陽': '成長力が高く、外向的な企画提案型。人を巻き込み、組織を活性化させる推進力があります。',
  '木-陰': '柔軟性と調和を重んじ、教育や支援を通じて人を育てることに長けています。',
  '火-陽': '情熱的で目立つ存在。アイデアや想いを形にして周囲を鼓舞するエネルギッシュなタイプ。',
  '火-陰': '静かに燃える情熱の持ち主。裏方で人を支えながら、組織の雰囲気を温めるムードメーカー。',
  '土-陽': '実行力があり、行動で安定を生み出す現場リーダー。信頼感で周囲をまとめます。',
  '土-陰': '共感力と配慮に優れ、縁の下の力持ちとして人と人をつなぐ調整役に最適。',
  '金-陽': '正義感と判断力でルールや仕組みを整える統率者。整備や規律に強く、統率力があります。',
  '金-陰': '几帳面で慎重。品質や安全を守る専門家。細部に目が届き、安心感を提供します。',
  '水-陽': '情報や知識を広めることが得意な伝道師タイプ。新技術や情報を伝えることに長けています。',
  '水-陰': '深く静かに探求する内省型の研究者。継続力があり、知的分野で力を発揮します。'
};

const jobReasons = {
  '木': 'ユーザー体験を設計する職種や、創造的な分野（UI/UX、企画職）で力を発揮できます。',
  '火': 'チームを鼓舞する発信力が求められる役割（技術広報、マネージャー）に向いています。',
  '土': '継続的な運用・監視など、安定を重視した現場でのリーダーシップに向いています。',
  '金': '品質や構造を整える仕事（セキュリティ、品質保証）で実力を発揮します。',
  '水': '研究開発やAI、データ解析など、知的探究と集中力が必要な領域で活躍できます。'
};

const jobs = {
  '木': [
    { title: 'UI/UXデザイナー', desc: 'ユーザー体験を設計する職種。感性と構造設計の両立が求められます。' },
    { title: '企画職エンジニア', desc: 'プロダクトの方向性や構想を描く上流工程に関与します。' }
  ],
  '火': [
    { title: 'Developer Advocate', desc: '技術を外に伝える仕事。登壇・執筆・SNSなど多様な発信で開発者とつながります。' },
    { title: 'テックリード', desc: '技術面でチームを先導する役割。信頼と情熱で牽引します。' }
  ],
  '土': [
    { title: 'SRE（Site Reliability Engineer）', desc: 'システムの安定稼働を監視・改善する専門職。現場型の信頼を築きます。' },
    { title: 'インフラエンジニア', desc: 'サーバーやネットワークの構築と保守を担当します。' }
  ],
  '金': [
    { title: 'セキュリティエンジニア', desc: '安全性や規律を守る仕事。ルール整備やリスク管理に強みがあります。' },
    { title: 'QAエンジニア', desc: '品質を担保する専門家。チェックリストや改善策を整備します。' }
  ],
  '水': [
    { title: 'AIエンジニア', desc: '人工知能の実装を担う技術者。データと向き合い、学習モデルを構築します。' },
    { title: '研究職エンジニア', desc: '新技術を探求する職種。ドキュメントや論文を読み込み知見を蓄積します。' }
  ]
};

const compatibility = {
  '木': { love: '火', conflict: '金' },
  '火': { love: '土', conflict: '水' },
  '土': { love: '金', conflict: '木' },
  '金': { love: '水', conflict: '火' },
  '水': { love: '木', conflict: '土' }
};

const decadeAdvice = {
  '木': ['自然体で学ぶ', '発展的に学ぶ', '成長支援に回る', 'リーダー・教育役'],
  '火': ['目立ち始める', '伝える力を育てる', '情熱の調整', '伝承・発信役'],
  '土': ['安定性を育てる', '責任感を強める', '組織を支える', 'まとめ役・地盤'],
  '金': ['几帳面さ育む', '論理と精度を鍛える', '専門性を深める', '構造化・監督役'],
  '水': ['興味を探す', '知識を吸収', '深掘り型に転換', '研究・教える立場']
};

function getDiagnosis(year, month, day, answers = {}) {
  const lunar = Lunar.fromYmdHms(year, month, day, 12, 0, 0);
  const eightChar = lunar.getEightChar();

  const yearGan = eightChar.getYearGan();
  const monthGan = eightChar.getMonthGan();
  const dayGan = eightChar.getDayGan();

  const [mainElem, mainYinYang] = stemMap[dayGan] || ['不明', '']
  const [yearElem] = stemMap[yearGan] || ['']
  const [monthElem] = stemMap[monthGan] || ['']

  const scores = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  if (scores[yearElem] !== undefined) scores[yearElem] += 10;
  if (scores[monthElem] !== undefined) scores[monthElem] += 40;
  if (scores[mainElem] !== undefined) scores[mainElem] += 50;

  for (const elem of ['木', '火', '土', '金', '水']) {
    if (answers[elem]) {
      scores[elem] += answers[elem];
    }
  }

  const traitKey = `${mainElem}-${mainYinYang}`;
  const jobHTML = jobs[mainElem]?.map(j => `<li><strong>${j.title}</strong><br><small>${j.desc}</small></li>`).join('') || '';

  return {
    mainElem,
    mainYinYang,
    yearGan,
    monthGan,
    dayGan,
    yearElem,
    monthElem,
    traitComment: traitSummary[traitKey] || '特性情報が見つかりませんでした。',
    jobReason: jobReasons[mainElem] || '',
    jobHTML,
    compat: compatibility[mainElem] || {},
    growthAdvice: decadeAdvice[mainElem] || [],
    scores,
    balanceComment: getBalanceComment(scores)
  };
}

function getBalanceComment(scores) {
  const comments = [];
  const suggestions = {
    '木': {
      low: '🌱 木が不足 → 新しいことへの挑戦が弱まりがちです。創造的な仲間と関わることで刺激が得られます。',
      high: '🌲 木が強い → 発想力が豊かです。周囲の共感や実現力と連携するとバランスが取れます。'
    },
    '火': {
      low: '🔥 火が不足 → 熱意や感情表現が控えめになりがち。共感や対話のある場に身を置くと良いです。',
      high: '🔥 火が強い → 推進力と情熱を持ちますが、暴走せず冷静さを意識しましょう。'
    },
    '土': {
      low: '🪨 土が不足 → 安定性に欠ける傾向。地道な積み重ねや、現実的な視点を学ぶ環境が合います。',
      high: '🧱 土が強い → 安心感を与える存在です。頑固にならず柔軟な姿勢を保ちましょう。'
    },
    '金': {
      low: '⚙️ 金が不足 → ルールや秩序に弱さが出ることも。構造化された思考を取り入れると安定します。',
      high: '🪙 金が強い → 分析と整備に優れます。過剰な完璧主義には注意しましょう。'
    },
    '水': {
      low: '💧 水が不足 → 情報処理や学習のペースが落ちがち。静かな時間と読書が補完になります。',
      high: '🌊 水が強い → 探究力が際立ちますが、現実とのバランスも忘れずに。'
    }
  };
  for (const [elem, score] of Object.entries(scores)) {
    if (score < 20) comments.push(suggestions[elem].low);
    else if (score >= 80) comments.push(suggestions[elem].high);
    else if (score >= 50) comments.push(`✅ ${elem}が十分にあります → ${suggestions[elem].high.replace(/^[^→]+→ /, '')}`);
  }
  return comments.join('<br>') || '五行のバランスは比較的中庸です。';
}

function renderHtml(data) {
  const ageLabels = ['10代まで', '20〜30代', '40〜50代', '60代以降'];
  const adviceHTML = data.growthAdvice.map((a, i) => `<li><strong>${ageLabels[i]}：</strong>${a}</li>`).join('');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>五行診断結果</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: sans-serif; line-height: 1.6; margin: 2em; }
    .chart-container { max-width: 400px; margin: 2em auto; }
  </style>
</head>
<body>
  <h1>あなたの五行タイプ診断結果</h1>
  <p><strong>日干：</strong>${data.dayGan}（${data.mainElem}・${data.mainYinYang}）</p>
  <p>${data.traitComment}</p>
  <p><strong>月干：</strong>${data.monthGan}（${data.monthElem}）</p>
  <p><strong>年干：</strong>${data.yearGan}（${data.yearElem}）</p>
  <hr>
  <h2>五行スコア</h2>
  <div class="chart-container">
    <canvas id="radarChart"></canvas>
  </div>
  <h2>五行バランスコメント</h2>
  <p>${data.balanceComment}</p>
  <hr>
  <h2>相性傾向</h2>
  <p>相性の良いタイプ：<strong>${data.compat.love || '不明'}</strong><br>
     苦手なタイプ：<strong>${data.compat.conflict || '不明'}</strong></p>
  <hr>
  <h2>年代別アドバイス</h2>
  <ul>${adviceHTML}</ul>
  <hr>
  <h2>向いている職種</h2>
  <p>${data.jobReason}</p>
  <ul>${data.jobHTML}</ul>
  <script>
    const ctx = document.getElementById('radarChart').getContext('2d');
    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['木', '火', '土', '金', '水'],
        datasets: [{
          label: '五行スコア',
          data: [${data.scores['木']}, ${data.scores['火']}, ${data.scores['土']}, ${data.scores['金']}, ${data.scores['水']}],
          fill: true,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          pointBackgroundColor: 'rgb(75, 192, 192)'
        }]
      },
      options: {
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { stepSize: 20 }
          }
        }
      }
    });
  </script>
</body>
</html>`;
}

module.exports = {
  getDiagnosis,
  getBalanceComment,
  renderHtml
};
